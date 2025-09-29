const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const decryptService = require('../services');

// 引入日志路由
router.use('/logs', require('./logs'));


// 获取带解密状态的日期列表
router.get('/encrypted-dates-with-status', (req, res) => {
  try {
    const datesWithStatus = decryptService.getEncryptedDatesWithStatus();
    res.json({ success: true, data: datesWithStatus });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取指定日期的所有文件列表
router.get('/encrypted-files', (req, res) => {
  try {
    const { date } = req.query;
    if (!date || !/^\d{8}$/.test(date)) {
      return res.status(400).json({ success: false, error: 'Invalid date. Expect YYYYMMDD' });
    }

    const allFiles = decryptService.getGpgFiles().filter(f => f.date === date);
    
    res.json({ success: true, data: allFiles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取指定日期的已解密文件列表
router.get('/decrypted-files', (req, res) => {
  try {
    const { date } = req.query;
    if (!date || !/^\d{8}$/.test(date)) {
      return res.status(400).json({ success: false, error: 'Invalid date. Expect YYYYMMDD' });
    }

    const decryptionDir = decryptService.getConfigPath('decryptionDir');
    const targetDir = path.join(decryptionDir, date);
    
    if (!fs.existsSync(targetDir)) {
      return res.json({ success: true, data: [] });
    }

    const files = fs.readdirSync(targetDir);
    const fileList = files.map(filename => {
      const filePath = path.join(targetDir, filename);
      const stat = fs.statSync(filePath);
      return {
        filename,
        filePath,
        size: stat.size,
        mtime: stat.mtime,
        isDirectory: stat.isDirectory()
      };
    });

    res.json({ success: true, data: fileList });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// 批量处理指定日期的所有文件（带进度推送）
router.post('/batch-process-stream', async (req, res) => {
  try {
    const { date } = req.body;
    if (!date || !/^\d{8}$/.test(date)) {
      return res.status(400).json({ success: false, error: 'Invalid date. Expect YYYYMMDD' });
    }

    // 设置SSE响应头
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // 进度回调函数
    const progressCallback = (progress) => {
      res.write(`data: ${JSON.stringify(progress)}\n\n`);
    };

    try {
      const result = await decryptService.batchProcessFiles(date, progressCallback);
      res.write(`data: ${JSON.stringify({ type: 'final', success: true, data: result })}\n\n`);
    } catch (error) {
      res.write(`data: ${JSON.stringify({ type: 'error', success: false, error: error.message })}\n\n`);
    }

    res.end();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});




module.exports = router;


