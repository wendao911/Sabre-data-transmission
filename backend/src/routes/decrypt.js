const express = require('express');
const router = express.Router();
const decryptService = require('../services/decryptService');

router.use('/logs', require('./decryptLogs'));

router.get('/encrypted-dates-with-status', (req, res) => {
  try { res.json({ success: true, data: decryptService.getEncryptedDatesWithStatus() }); }
  catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

router.get('/encrypted-files', (req, res) => {
  try {
    const { date } = req.query;
    const allFiles = decryptService.getEncryptedFilesByDate(date);
    res.json({ success: true, data: allFiles });
  } catch (error) { res.status(400).json({ success: false, error: error.message }); }
});

router.get('/decrypted-files', (req, res) => {
  try {
    const { date } = req.query;
    const fileList = decryptService.listDecryptedFiles(date);
    res.json({ success: true, data: fileList });
  } catch (error) { res.status(400).json({ success: false, error: error.message }); }
});

router.post('/batch-process-stream', async (req, res) => {
  try {
    const { date } = req.body;
    if (!decryptService.validateYyyyMmDd(date)) return res.status(400).json({ success: false, error: 'Invalid date. Expect YYYYMMDD' });
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Cache-Control' });
    const progressCallback = (progress) => { res.write(`data: ${JSON.stringify(progress)}\n\n`); };
    try { const result = await decryptService.batchProcessFiles(date, progressCallback); res.write(`data: ${JSON.stringify({ type: 'final', success: true, data: result })}\n\n`); }
    catch (error) { res.write(`data: ${JSON.stringify({ type: 'error', success: false, error: error.message })}\n\n`); }
    res.end();
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

module.exports = router;


