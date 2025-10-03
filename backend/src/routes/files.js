const express = require('express');
const multer = require('multer');
const router = express.Router();
const fileService = require('../services/fileService');

router.get('/browser', async (req, res) => {
  try {
    const data = await fileService.browseDirectory({
      currentPath: req.query.path,
      search: req.query.search,
      page: req.query.page,
      pageSize: req.query.pageSize,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
      showHidden: req.query.showHidden === 'true'
    });
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

const upload = multer({ storage: multer.memoryStorage() });
router.post('/upload', upload.single('file'), async (req, res) => {
  let uploadLog = null;
  const startTime = new Date();
  try {
    const { targetPath = '', baseName, fileTypeConfig, remark = '' } = req.body;
    const data = await fileService.uploadFileWithLog({ targetPath, baseName, fileTypeConfig, remark, file: req.file, headers: req.headers });
    return res.json({ success: true, message: '上传成功', data });
  } catch (e) {
    // 尽量保持与原行为一致：失败时记录一条失败日志
    try { await FileUploadLog.create({ originalName: req.file?.originalname || 'unknown', savedName: 'failed', filePath: 'failed', fullPath: 'failed', fileSize: 0, mimeType: req.file?.mimetype || 'unknown', uploadedBy: req.headers['x-user-id'] || 'anonymous', uploadedByName: req.headers['x-user-name'] || 'Anonymous User', uploadedAt: startTime, status: 'failed', errorMessage: e.message, targetDirectory: req.body?.targetPath || '', fileExtension: '' }); } catch (_) {}
    return res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/download', (req, res) => {
  try {
    const { path: filePath } = req.query;
    const { fullFilePath, fileName } = fileService.resolveDownloadPath(filePath);
    res.download(fullFilePath, fileName);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.delete('/delete', async (req, res) => {
  try {
    const { path: filePath } = req.body;
    await fileService.deletePathAndLogs(filePath);
    res.json({ success: true, message: '删除成功' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/upload-logs', async (req, res) => {
  try {
    const result = await fileService.getUploadLogs(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/upload-log/by-path', async (req, res) => {
  try {
    const { path: relativePath } = req.query;
    const data = await fileService.getUploadLogByPath(relativePath);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/upload-log/:id/remark', async (req, res) => {
  try {
    const { id } = req.params;
    const { remark = '' } = req.body || {};
    const data = await fileService.updateUploadLogRemark(id, remark);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/upload-stats', async (req, res) => {
  try {
    const result = await fileService.getUploadStats(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;


