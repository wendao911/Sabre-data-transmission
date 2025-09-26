const express = require('express');
const router = express.Router();
const { ScheduleConfig } = require('../models');
const { schedulerService, reloadTask } = require('../services');

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

// 去除直接触发运行的接口，schedule 仅承担配置管理

module.exports = router;


