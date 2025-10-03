const express = require('express');
const router = express.Router();
const svc = require('../services/sftpRouteService');

router.use('/transfer-logs', require('./sftpTransferLogs'));

router.get('/status', (req, res) => {
  try { return res.json({ success: true, data: svc.getStatus() }); }
  catch (error) { return res.status(500).json({ success: false, message: error.message }); }
});

router.post('/connect', async (req, res) => {
  try { const { host, port, sftpPort, user, password, privateKey, passphrase } = req.body; const params = { host, port: sftpPort || port || 22, user, password, privateKey, passphrase }; const result = await svc.connect(params); if (!result.success) return res.status(500).json(result); res.json(result); }
  catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.post('/disconnect', async (req, res) => {
  try { await svc.disconnect(); res.json({ success: true, message: 'SFTP 断开连接成功' }); }
  catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.post('/connect/active', async (req, res) => {
  try { const result = await svc.connectActive(); if (!result.success) return res.status(result.status || 500).json(result); return res.json(result); }
  catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.get('/list', async (req, res) => {
  try { const { path = '/' } = req.query; const result = await svc.listDirectory(path); if (!result.success) return res.status(500).json(result); return res.json(result); }
  catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.post('/upload', async (req, res) => {
  try { const { localPath, remotePath, fileId } = req.body; const result = await svc.upload({ localPath, remotePath, fileId }); if (!result?.success) return res.status(500).json(result || { success: false, message: '文件上传失败' }); res.json(result); }
  catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.post('/mkdir', async (req, res) => {
  try { const { path: remotePath } = req.body; const result = await svc.mkdir(remotePath); if (!result.success) return res.status(500).json(result); res.json(result); }
  catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.post('/download', async (req, res) => {
  try { const { remotePath, localPath } = req.body; await svc.download(remotePath, localPath); res.json({ success: true, message: '文件下载成功' }); }
  catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.get('/download-stream', async (req, res) => {
  try {
    const remotePath = req.query.path; if (!remotePath) return res.status(400).json({ success: false, message: '缺少 path 参数' });
    const result = await svc.downloadStream(remotePath);
    if (!result.success) return res.status(result.status || 500).json(result);
    res.setHeader('Content-Type', 'application/octet-stream'); res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(result.filename)}`); res.setHeader('Content-Length', result.buffer.length); res.status(200).end(result.buffer);
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.post('/sync/by-mapping', async (req, res) => {
  try { const { date } = req.body; if (!date) return res.status(400).json({ success: false, message: '缺少 date 参数' }); const result = await svc.syncByMappingDate(date); if (!result.success && result.status) return res.status(result.status).json(result); return res.json(result); }
  catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.delete('/delete', async (req, res) => {
  try { const { remotePath } = req.body; await svc.deleteFile(remotePath); res.json({ success: true, message: '文件删除成功' }); }
  catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.delete('/file', async (req, res) => {
  try { const { path: remotePath } = req.body; const result = await svc.deleteFile(remotePath); if (!result.success) return res.status(500).json(result); res.json(result); }
  catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.delete('/dir', async (req, res) => {
  try { const { path: remotePath } = req.body; const result = await svc.deleteDirectory(remotePath); if (!result.success) return res.status(500).json(result); res.json(result); }
  catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

module.exports = router;


