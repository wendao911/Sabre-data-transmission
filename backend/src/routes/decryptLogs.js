const express = require('express');
const router = express.Router();
const svc = require('../services/decryptLogsService');

router.get('/', async (req, res) => {
  try { const data = await svc.listLogs(req.query); res.json({ success: true, data }); }
  catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

router.get('/stats', async (req, res) => {
  try { const data = await svc.getStats(req.query); res.json({ success: true, data }); }
  catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

module.exports = router;


