const schedule = require('node-schedule');
const { ScheduleConfig } = require('../models/ScheduleConfig');
const jobs = require('./index');

// 保存已注册的任务，便于后续更新/取消
const scheduled = new Map();

/**
 * 将 taskType 映射到具体的 job 对象
 */
function resolveJob(taskType) {
  if (taskType === 'decrypt') return jobs.decrypt;
  if (taskType === 'transfer') return jobs.sftp;
  return null;
}

/**
 * 注册单个任务（若已存在则先取消再注册）
 * @param {{taskType:string, cron:string, enabled:boolean}} cfg
 */
function registerOne(cfg) {
  const jobDef = resolveJob(cfg.taskType);
  if (!jobDef) return;
  // 取消已存在的
  if (scheduled.has(cfg.taskType)) {
    try { scheduled.get(cfg.taskType).cancel(); } catch (_) {}
    scheduled.delete(cfg.taskType);
  }
  if (!cfg.enabled) return; // 未启用不注册
  // 默认时区固定为柬埔寨
  const timezone = 'Asia/Phnom_Penh';
  const task = schedule.scheduleJob({ rule: cfg.cron, tz: timezone }, async () => {
    try { await jobDef.run(); } catch (_) {}
  });
  scheduled.set(cfg.taskType, task);
}

/**
 * 读取数据库配置并注册所有任务
 */
async function registerAllJobs() {
  const configs = await ScheduleConfig.find({}).lean();
  configs.forEach(registerOne);
}

/**
 * 重新加载单个任务（用于前端更新 cron 或启用状态后热更新）
 * @param {string} taskType
 */
async function reloadTask(taskType) {
  const cfg = await ScheduleConfig.findOne({ taskType }).lean();
  if (!cfg) {
    // 若配置被删除，则取消已有任务
    if (scheduled.has(taskType)) {
      try { scheduled.get(taskType).cancel(); } catch (_) {}
      scheduled.delete(taskType);
    }
    return;
  }
  registerOne(cfg);
}

module.exports = { registerAllJobs, reloadTask };

/**
 * 返回当前已注册任务的运行时信息（taskType、nextRunAt）
 */
function getAllSchedules() {
  const result = [];
  for (const [taskType, job] of scheduled.entries()) {
    let nextRunAt = null;
    try {
      const inv = job.nextInvocation && job.nextInvocation();
      nextRunAt = inv ? (inv.toDate ? inv.toDate() : (inv.fireDate || null)) : null;
    } catch (_) {
      nextRunAt = null;
    }
    result.push({ taskType, nextRunAt });
  }
  return result;
}

module.exports.getAllSchedules = getAllSchedules;


