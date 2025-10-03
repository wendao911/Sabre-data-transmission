const express = require('express');
const router = express.Router();
const svc = require('../services/sftpLogsService');

router.get('/tasks', async (req, res) => {
  try { const data = await svc.getTaskList(req.query); res.json({ success: true, data }); }
  catch (error) { res.status(500).json({ success: false, message: '获取传输任务日志失败' }); }
});

router.get('/tasks/:taskId', async (req, res) => {
  try { const data = await svc.getTaskDetail(req.params.taskId); if (!data) return res.status(404).json({ success: false, message: '传输任务不存在' }); res.json({ success: true, data }); }
  catch (error) { res.status(500).json({ success: false, message: '获取传输任务详情失败' }); }
});

router.get('/rules', async (req, res) => {
  try { const data = await svc.getRuleList(req.query); res.json({ success: true, data }); }
  catch (error) { res.status(500).json({ success: false, message: '获取传输规则日志失败' }); }
});

router.get('/files', async (req, res) => {
  try { const data = await svc.getFileList(req.query); res.json({ success: true, data }); }
  catch (error) { res.status(500).json({ success: false, message: '获取传输文件日志失败' }); }
});

router.get('/stats', async (req, res) => {
  try { const data = await svc.getStats(req.query); res.json({ success: true, data }); }
  catch (error) { res.status(500).json({ success: false, message: '获取传输统计信息失败' }); }
});

module.exports = router;


