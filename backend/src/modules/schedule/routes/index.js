const express = require('express');
const router = express.Router();
const { ScheduleConfig } = require('../models');
const { schedulerService, reloadTask } = require('../services');
const { getAllSchedules } = require('../../../jobs/registry');
const jobs = require('../../../jobs');

router.get('/', async (req, res) => {
  try {
    const configs = await ScheduleConfig.find({});
    res.json({ success: true, data: configs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/update', async (req, res) => {
  try {
    const { taskType, cron, enabled, params } = req.body || {};
    if (!taskType || !cron) {
      return res.status(400).json({ success: false, error: 'taskType 与 cron 为必填' });
    }
    const updated = await schedulerService.updateSchedule(taskType, { cron, enabled: !!enabled, params: params || {} });
    // 热更新对应任务（只关注 cron 与 enabled）
    try { await reloadTask(taskType); } catch (_) {}
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 获取当前已注册任务的运行时信息（下一次执行时间等）
router.get('/runtime', async (req, res) => {
  try {
    const runtime = getAllSchedules();
    res.json({ success: true, data: runtime });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 手动触发任务运行（用于仪表盘快速操作）
router.post('/run', async (req, res) => {
  try {
    const { taskType } = req.body || {};
    if (!taskType) {
      return res.status(400).json({ success: false, error: 'taskType 必填' });
    }
    const job = taskType === 'decrypt' ? jobs.decrypt : taskType === 'transfer' ? jobs.sftp : null;
    if (!job || typeof job.run !== 'function') {
      return res.status(400).json({ success: false, error: '不支持的 taskType' });
    }
    setImmediate(async () => {
      try { await job.run({ triggeredBy: 'manual' }); } catch (_) {}
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;


