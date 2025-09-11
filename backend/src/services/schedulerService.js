const schedule = require('node-schedule');
const ScheduleConfig = require('../models/ScheduleConfig');
const decryptService = require('./decryptService');
const { connectFTPWithActiveConfig, transferDecryptedFiles } = require('../routes/ftp');

// 保存已启动的任务，key: taskType
const jobs = new Map();

function getYesterdayYYYYMMDD(offsetDays = 1) {
  const d = new Date();
  d.setDate(d.getDate() - (Number(offsetDays) || 1));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

async function runTask(task) {
  const { taskType, params = {} } = task;
  const offsetDays = params.offsetDays || 1;
  const date = getYesterdayYYYYMMDD(offsetDays);

  if (taskType === 'decrypt') {
    // 以现有服务为核心执行解密（仅当天）
    await decryptService.decryptAllFiles(null, { date });
  } else if (taskType === 'copy') {
    // 如需实现“仅拷贝”可在此扩展（目前解密服务对非gpg是复制）
    await decryptService.decryptAllFiles(null, { date });
  } else if (taskType === 'transfer') {
    // 使用解耦后的方法
    await connectFTPWithActiveConfig();
    
    try {
      // 执行文件传输
      await transferDecryptedFiles(date);
    } finally {
      const ftpService = require('./ftpService');
      await ftpService.disconnect();
    }
  }
}

function scheduleJob(task) {
  const { taskType, cron } = task;
  if (jobs.has(taskType)) {
    jobs.get(taskType).cancel();
  }
  const job = schedule.scheduleJob(cron, async () => {
    try {
      await runTask(task);
      console.log(`[scheduler] task ${taskType} executed.`);
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
  const doc = await ScheduleConfig.findOneAndUpdate(
    { taskType },
    { $set: { ...payload, updatedAt: new Date() } },
    { new: true, upsert: true }
  );
  if (doc.enabled) scheduleJob(doc); else if (jobs.has(taskType)) jobs.get(taskType).cancel();
  return doc;
}

module.exports = {
  loadAndStartAll,
  updateSchedule,
  runTask
};


