const schedule = require('node-schedule');
const { ScheduleConfig } = require('../models');
const decryptService = require('../../decrypt/services');
const sftpService = require('../../sftp/services/sftpService');
const sftpRoutes = require('../../sftp/routes');
const { connectSFTPWithActiveConfig, transferDecryptedFiles } = sftpRoutes;
const config = require('../../../config');

const jobs = new Map();

function getYesterdayYYYYMMDD(offsetDays = 1) {
  // 使用柬埔寨时区
  const timezone = config.timezone?.timezone || 'Asia/Phnom_Penh';
  const d = new Date();
  
  // 转换为柬埔寨时区
  const cambodiaTime = new Date(d.toLocaleString("en-US", {timeZone: timezone}));
  cambodiaTime.setDate(cambodiaTime.getDate() - (Number(offsetDays) || 1));
  
  const y = cambodiaTime.getFullYear();
  const m = String(cambodiaTime.getMonth() + 1).padStart(2, '0');
  const day = String(cambodiaTime.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

function calculateNextRun(cronExpression) {
  try {
    // 使用 node-schedule 的 parse 方法来解析 cron 表达式
    const job = schedule.scheduleJob(cronExpression, () => {});
    if (job && job.nextInvocation()) {
      const nextDate = job.nextInvocation();
      job.cancel();
      
      // 将时间转换为柬埔寨时区
      const timezone = config.timezone?.timezone || 'Asia/Phnom_Penh';
      const cambodiaTime = new Date(nextDate.toLocaleString("en-US", {timeZone: timezone}));
      return cambodiaTime;
    }
    if (job) job.cancel();
    return null;
  } catch (error) {
    console.error('Error calculating next run time:', error);
    return null;
  }
}

async function runTask(task) {
  const { taskType, params = {} } = task;
  const offsetDays = params.offsetDays || 1;
  const date = getYesterdayYYYYMMDD(offsetDays);

  // 更新最后执行时间（使用柬埔寨时区）
  const timezone = config.timezone?.timezone || 'Asia/Phnom_Penh';
  const cambodiaTime = new Date(new Date().toLocaleString("en-US", {timeZone: timezone}));
  
  await ScheduleConfig.findOneAndUpdate(
    { taskType },
    { lastRunAt: cambodiaTime }
  );

  if (taskType === 'decrypt') {
    await decryptService.decryptAllFiles(null, { date });
  } else if (taskType === 'copy') {
    await decryptService.decryptAllFiles(null, { date });
  } else if (taskType === 'transfer') {
    await connectSFTPWithActiveConfig();
    try {
      await transferDecryptedFiles(date);
    } finally {
      await sftpService.disconnect();
    }
  }
}

function scheduleJob(task) {
  const { taskType, cron } = task;
  if (jobs.has(taskType)) {
    jobs.get(taskType).cancel();
  }
  
  // 计算下次执行时间
  const nextRunAt = calculateNextRun(cron);
  
  // 更新数据库中的下次执行时间
  ScheduleConfig.findOneAndUpdate(
    { taskType },
    { nextRunAt }
  ).catch(err => console.error('Error updating nextRunAt:', err));
  
  const job = schedule.scheduleJob(cron, async () => {
    try {
      await runTask(task);
      console.log(`[scheduler] task ${taskType} executed.`);
      
      // 任务执行后重新计算下次执行时间
      const newNextRunAt = calculateNextRun(cron);
      await ScheduleConfig.findOneAndUpdate(
        { taskType },
        { nextRunAt: newNextRunAt }
      );
    } catch (err) {
      console.error(`[scheduler] task ${taskType} failed:`, err.message);
    }
  });
  jobs.set(taskType, job);
}

async function loadAndStartAll() {
  const configs = await ScheduleConfig.find({ enabled: true });
  configs.forEach(cfg => scheduleJob(cfg));
}

async function updateSchedule(taskType, payload) {
  // 如果更新了 cron 表达式，计算新的下次执行时间
  let nextRunAt = null;
  if (payload.cron) {
    nextRunAt = calculateNextRun(payload.cron);
  }
  
  // 使用柬埔寨时区记录更新时间
  const timezone = config.timezone?.timezone || 'Asia/Phnom_Penh';
  const cambodiaTime = new Date(new Date().toLocaleString("en-US", {timeZone: timezone}));
  
  const updateData = { 
    ...payload, 
    updatedAt: cambodiaTime,
    ...(nextRunAt && { nextRunAt })
  };
  
  const doc = await ScheduleConfig.findOneAndUpdate(
    { taskType },
    { $set: updateData },
    { new: true, upsert: true }
  );
  
  if (doc.enabled) {
    scheduleJob(doc);
  } else {
    if (jobs.has(taskType)) jobs.get(taskType).cancel();
    // 如果任务被禁用，清除下次执行时间
    await ScheduleConfig.findOneAndUpdate(
      { taskType },
      { nextRunAt: null }
    );
  }
  return doc;
}

module.exports = { loadAndStartAll, updateSchedule, runTask };


