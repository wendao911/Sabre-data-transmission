const express = require('express');
const router = express.Router();
const { ScheduleConfig } = require('../models');
const { schedulerService } = require('../services');

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
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


router.post('/run', async (req, res) => {
  try {
    const { taskType, offsetDays } = req.body || {};
    if (!taskType) return res.status(400).json({ success: false, error: 'taskType 必填' });
    await schedulerService.runTask({ taskType, params: { offsetDays: offsetDays || 1 } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;


