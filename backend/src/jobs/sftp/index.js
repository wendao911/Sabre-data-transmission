const schedule = require('node-schedule');
const { SystemLog } = require('../../models/SystemLog');
const { ScheduleConfig } = require('../../models/ScheduleConfig');
const { SFTPConfig } = require('../../models/SFTPConfig');
const sftpService = require('../../services/sftpService');
const { formatDate } = require('../../utils/date');
const { syncByMapping } = require('../../services/syncService');

/**
 * 运行 SFTP 传输任务
 * - 读取数据库配置（是否启用）
 * - 取柬埔寨时区“前一天”为默认日期（可用 params.date 覆盖）
 * - 连接激活的 SFTP 配置
 * - 传输解密目录下的文件到远端（/uploads/{date}/）
 * - 写入系统日志并更新 lastRunAt
 * @param {{date?: string, force?: boolean}} params
 * @returns {Promise<{success: boolean, skipped?: boolean, reason?: string, date?: string, counts?: {files:number, success:number, failed:number}, error?: string}>}
 */
async function run(params = {}) {
  // 检查配置开关
  const cfg = await ScheduleConfig.findOne({ taskType: 'transfer' }).lean();
  if (cfg && cfg.enabled === false && params.force !== true) {
    await SystemLog.create({
      level: 'info',
      module: 'sftp',
      action: 'daily_transfer',
      message: 'SFTP 传输任务已禁用，跳过执行',
      details: { reason: 'disabled_in_db' }
    });
    return { success: true, skipped: true, reason: 'disabled' };
  }

  // 计算日期（柬埔寨时区）
  const timezone = 'Asia/Phnom_Penh';
  const nowTz = new Date(new Date().toLocaleString('km-KH', { timeZone: timezone }));
  const yesterday = new Date(nowTz.getFullYear(), nowTz.getMonth(), nowTz.getDate() - 1);
  const date = params.date || formatDate(yesterday, 'YYYYMMDD');

  // 选择激活的 SFTP 配置并连接
  const active = await SFTPConfig.findOne({ status: 1 }).lean();
  if (!active) {
    await SystemLog.create({
      level: 'error',
      module: 'sftp',
      action: 'daily_transfer',
      message: '未找到已启用的 SFTP 配置',
      details: { date }
    });
    return { success: false, date, error: 'no active sftp config' };
  }

  const start = Date.now();
  try {
    // 连接 SFTP（使用激活配置）
    const connectResp = await sftpService.connect({
      host: active.host,
      port: active.sftpPort || active.port || 22,
      user: active.user,
      password: active.password
    });
    if (!connectResp?.success) throw new Error(connectResp?.message || 'SFTP 连接失败');
    // 调用映射同步服务（要求 YYYY-MM-DD）
    const dateStr = formatDate(yesterday, 'YYYY-MM-DD');
    const syncResult = await syncByMapping(dateStr);

    const durationMs = Date.now() - start;
    try { await ScheduleConfig.findOneAndUpdate({ taskType: 'transfer' }, { lastRunAt: nowTz }); } catch (_) {}
    await SystemLog.create({
      level: syncResult?.success && (syncResult.data?.failed || 0) === 0 ? 'info' : 'warn',
      module: 'sftp',
      action: 'daily_transfer',
      message: `SFTP 映射同步完成: 日期=${dateStr}, 成功=${syncResult?.data?.synced || 0}, 跳过=${syncResult?.data?.skipped || 0}, 失败=${syncResult?.data?.failed || 0}, 用时=${durationMs}ms`,
      details: { date: dateStr, durationMs, result: syncResult }
    });

    return { success: true, date: dateStr, result: syncResult };
  } catch (error) {
    const durationMs = Date.now() - start;
    await SystemLog.create({
      level: 'error',
      module: 'sftp',
      action: 'daily_transfer',
      message: `SFTP 映射同步失败: 日期=${date}, 错误=${error.message}`,
      details: { date, durationMs, error: error.message }
    });
    return { success: false, date, error: error.message };
  } finally {
    try { await sftpService.disconnect(); } catch (_) {}
  }
}

/**
 * 注册 SFTP 传输任务定时器（可选）
 * @param {string} cronExpr - cron 表达式
 * @param {string} timezone - 时区
 * @returns {import('node-cron').ScheduledTask}
 */
function register(cronExpr = '30 3 * * *', timezone = 'Asia/Phnom_Penh') {
  return schedule.scheduleJob({ rule: cronExpr, tz: timezone }, async () => {
    await run();
  });
}

/**
 * 参数校验
 * @param {{date?: string}} params
 * @returns {{ok: boolean, message?: string}}
 */
function validate(params = {}) {
  if (params.date && !/^\d{8}$/.test(params.date)) {
    return { ok: false, message: 'Invalid date format, expected YYYYMMDD' };
  }
  return { ok: true };
}

module.exports = {
  name: 'sftp_transfer',
  description: 'Daily transfer decrypted files to SFTP by date',
  run,
  register,
  validate
};


