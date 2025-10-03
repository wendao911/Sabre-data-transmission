const { ScheduleConfig } = require('../models/ScheduleConfig');
const schedulerService = require('./schedulerService');
const { getAllSchedules, reloadTask } = require('../jobs/registry');
const jobs = require('../jobs');

async function listConfigs() {
  const configs = await ScheduleConfig.find({});
  return configs;
}

async function updateConfig({ taskType, cron, enabled, params }) {
  if (!taskType || !cron) {
    const err = new Error('taskType 与 cron 为必填');
    err.status = 400;
    throw err;
  }
  const updated = await schedulerService.updateSchedule(taskType, { cron, enabled: !!enabled, params: params || {} });
  try { await reloadTask(taskType); } catch (_) {}
  return updated;
}

function runtime() {
  return getAllSchedules();
}

async function runNow(taskType) {
  if (!taskType) {
    const err = new Error('taskType 必填');
    err.status = 400;
    throw err;
  }
  const job = taskType === 'decrypt' ? jobs.decrypt : taskType === 'transfer' ? jobs.sftp : null;
  if (!job || typeof job.run !== 'function') {
    const err = new Error('不支持的 taskType');
    err.status = 400;
    throw err;
  }
  setImmediate(async () => { try { await job.run({ triggeredBy: 'manual' }); } catch (_) {} });
  return { success: true };
}

module.exports = { listConfigs, updateConfig, runtime, runNow };


