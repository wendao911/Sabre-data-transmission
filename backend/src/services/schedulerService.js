const schedule = require('node-schedule');
const ScheduleConfig = require('../models/ScheduleConfig');
const FTPConfig = require('../models/FTPConfig');
const decryptService = require('./decryptService');
const ftpService = require('./ftpService');

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
    // 从数据库读取 FTP 配置
    const cfg = await FTPConfig.findOne({});
    if (!cfg || !cfg.host) throw new Error('FTP 配置未设置');

    // 连接 FTP（使用 DB 配置）
    const conn = await ftpService.connect({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: cfg.password,
      secure: cfg.secure
    });
    if (!conn.success) throw new Error('FTP 连接失败: ' + conn.message);

    try {
      // 复用现有按日同步接口逻辑：收集本地前一日解密目录下的文件并上传
      const projectRoot = require('path').join(__dirname, '..', '..', '..');
      const localDir = require('path').join(projectRoot, 'Sabre Data Decryption', date);
      const fs = require('fs');
      if (!fs.existsSync(localDir)) {
        throw new Error(`本地解密目录不存在: ${localDir}`);
      }
      const files = fs.readdirSync(localDir).map(name => ({
        localPath: require('path').join(localDir, name),
        remotePath: `/${date}/${name}`
      }));
      await ftpService.uploadMultipleFiles(files);
    } finally {
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


