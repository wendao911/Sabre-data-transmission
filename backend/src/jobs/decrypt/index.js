const schedule = require('node-schedule');
const { batchProcessFiles } = require('../../modules/decrypt/services/decryptService');
const { SystemLog } = require('../../modules/system/models/SystemLog');
const { ScheduleConfig } = require('../../modules/schedule/models');
const { formatDate } = require('../../utils/date');

/**
 * 运行解密任务
 * - 读取数据库配置（是否启用）
 * - 取柬埔寨时区“前一天”为默认日期（可用 params.date 覆盖）
 * - 调用 batchProcessFiles(date) 执行
 * - 写入系统日志并更新 lastRunAt
 * @param {{date?: string, force?: boolean}} params
 * @returns {Promise<{success: boolean, skipped?: boolean, reason?: string, date?: string, result?: any, error?: string}>}
 */
async function run(params = {}) {
  // 读取数据库配置：是否启用、任务参数
  const cfg = await ScheduleConfig.findOne({ taskType: 'decrypt' }).lean();
  if (cfg && cfg.enabled === false && params.force !== true) {
    await SystemLog.create({
      level: 'info',
      module: 'decrypt',
      action: 'daily_decrypt',
      message: '解密任务已禁用，跳过执行',
      details: { reason: 'disabled_in_db' }
    });
    return { success: true, skipped: true, reason: 'disabled' };
  }
  // 固定使用柬埔寨时区
  const timezone = 'Asia/Phnom_Penh';
  const nowTz = new Date(new Date().toLocaleString('km-KH', { timeZone: timezone }));
  const yesterday = new Date(nowTz.getFullYear(), nowTz.getMonth(), nowTz.getDate() - 1);
  const date = params.date || formatDate(yesterday, 'YYYYMMDD');
  const start = Date.now();
  try {
    const result = await batchProcessFiles(date);
    const durationMs = Date.now() - start;
    // 更新 lastRunAt
    try { await ScheduleConfig.findOneAndUpdate({ taskType: 'decrypt' }, { lastRunAt: nowTz }); } catch (_) {}
    await SystemLog.create({
      level: 'info',
      module: 'decrypt',
      action: 'daily_decrypt',
      message: `解密任务完成: 日期=${date}, 用时=${durationMs}ms`,
      details: { date, durationMs, result }
    });
    return { success: true, date, result };
  } catch (error) {
    const durationMs = Date.now() - start;
    await SystemLog.create({
      level: 'error',
      module: 'decrypt',
      action: 'daily_decrypt',
      message: `解密任务失败: 日期=${date}, 错误=${error.message}`,
      details: { date, durationMs, error: error.message }
    });
    return { success: false, date, error: error.message };
  }
}

/**
 * 注册解密任务定时器（可选）
 * @param {string} cronExpr - cron 表达式
 * @param {string} timezone - 时区
 * @returns {import('node-cron').ScheduledTask}
 */
function register(cronExpr = '0 3 * * *', timezone = 'Asia/Phnom_Penh') {
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
  name: 'decrypt',
  description: 'Daily decrypt Sabre GPG files by date',
  run,
  register,
  validate
};


