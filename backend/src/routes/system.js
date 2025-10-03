const express = require('express');
const router = express.Router();
const SystemLogService = require('../services/systemLogService');

router.get('/logs', async (req, res) => {
  try {
    const { page = 1, pageSize = 50, level, module, action, startDate, endDate, searchText, sortBy = 'createdAt', sortOrder = -1 } = req.query;
    const options = { page: parseInt(page), pageSize: parseInt(pageSize), level, module, action, startDate, endDate, searchText, sortBy, sortOrder: parseInt(sortOrder) };
    const result = await SystemLogService.getLogs(options);
    if (result.success) res.json(result); else res.status(500).json(result);
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

router.get('/logs/stats', async (req, res) => {
  try {
    const { startDate, endDate, module } = req.query;
    const options = { startDate, endDate, module };
    const result = await SystemLogService.getLogStats(options);
    if (result.success) res.json(result); else res.status(500).json(result);
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

router.delete('/logs', async (req, res) => {
  try {
    const { daysToKeep = 30 } = req.body;
    const result = await SystemLogService.cleanupLogs(parseInt(daysToKeep));
    if (result.success) res.json(result); else res.status(500).json(result);
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

router.get('/status', async (req, res) => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const stats = await SystemLogService.getLogStats({ startDate: yesterday, endDate: new Date() });
    const recentErrors = await SystemLogService.getLogs({ level: 'error', page: 1, pageSize: 10, sortBy: 'createdAt', sortOrder: -1 });
    const startupLogs = await SystemLogService.getLogs({ module: 'system', action: 'startup', page: 1, pageSize: 1, sortBy: 'createdAt', sortOrder: -1 });
    const systemStartTime = startupLogs.data?.logs?.[0]?.createdAt || null;
    res.json({ success: true, data: { stats: stats.data || [], recentErrors: recentErrors.data?.logs || [], systemStartTime, uptime: systemStartTime ? Date.now() - new Date(systemStartTime).getTime() : null } });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

module.exports = router;
