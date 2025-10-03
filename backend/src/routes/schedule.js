const express = require('express');
const router = express.Router();
const svc = require('../services/scheduleRouteService');

router.get('/', async (req, res) => {
  try { const configs = await svc.listConfigs(); res.json({ success: true, data: configs }); }
  catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.post('/update', async (req, res) => {
  try { const updated = await svc.updateConfig(req.body || {}); res.json({ success: true, data: updated }); }
  catch (err) { res.status(err.status || 500).json({ success: false, error: err.message }); }
});

router.get('/runtime', async (req, res) => {
  try { const runtime = svc.runtime(); res.json({ success: true, data: runtime }); }
  catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.post('/run', async (req, res) => {
  try { const { taskType } = req.body || {}; const result = await svc.runNow(taskType); res.json(result); }
  catch (err) { res.status(err.status || 500).json({ success: false, error: err.message }); }
});

module.exports = router;


