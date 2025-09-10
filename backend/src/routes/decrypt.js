const express = require('express');
const router = express.Router();
const decryptService = require('../services/decryptService');

// 存储活跃的SSE连接
const sseConnections = new Set();

/**
 * @route GET /api/decrypt/status
 * @desc 获取解密状态
 * @access Public
 */
router.get('/status', (req, res) => {
    try {
        const status = decryptService.getDecryptStatus();
        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route GET /api/decrypt/progress
 * @desc 获取解密进度 (SSE)
 * @access Public
 */
router.get('/progress', (req, res) => {
    // 设置SSE头部
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // 发送初始连接确认
    res.write('data: {"type":"connected","message":"Connected to decrypt progress stream"}\n\n');

    // 将连接添加到集合中
    sseConnections.add(res);

    // 连接关闭时清理
    req.on('close', () => {
        sseConnections.delete(res);
    });
});

/**
 * @route POST /api/decrypt/start
 * @desc 开始批量解密
 * @access Public
 */
router.post('/start', async (req, res) => {
    try {
        // 发送开始事件
        broadcastProgress({
            type: 'start',
            message: '开始解密...',
            timestamp: new Date().toISOString()
        });

        const { date, filePath } = req.body || {};

        const results = await decryptService.decryptAllFiles((progressData) => {
            broadcastProgress(progressData);
        }, { date, filePath });
        
        // 发送完成事件
        broadcastProgress({
            type: 'complete',
            message: '解密完成',
            data: {
                total: results.total,
                success: results.success,
                failed: results.total - results.success,
                errors: results.errors
            },
            timestamp: new Date().toISOString()
        });
        
        res.json({
            success: true,
            data: {
                total: results.total,
                success: results.success,
                failed: results.total - results.success,
                errors: results.errors
            }
        });
    } catch (error) {
        // 发送错误事件
        broadcastProgress({
            type: 'error',
            message: '解密失败',
            error: error.message,
            timestamp: new Date().toISOString()
        });

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route POST /api/decrypt/start-by-date
 * @desc 仅解密某一天（YYYYMMDD）的加密文件
 * @query date=YYYYMMDD
 */
router.post('/start-by-date', async (req, res) => {
    try {
        const date = (req.body && req.body.date) || req.query.date;
        if (!date || !/^\d{8}$/.test(date)) {
            return res.status(400).json({ success: false, error: 'Invalid date. Expect YYYYMMDD' });
        }

        broadcastProgress({ type: 'start', message: `开始解密日期 ${date} 的文件...`, timestamp: new Date().toISOString() });

        const results = await decryptService.decryptAllFiles((progressData) => {
            broadcastProgress(progressData);
        }, { date });

        broadcastProgress({
            type: 'complete',
            message: `解密完成（日期 ${date}）`,
            data: { total: results.total, success: results.success, failed: results.total - results.success, errors: results.errors },
            timestamp: new Date().toISOString()
        });

        res.json({ success: true, data: { total: results.total, success: results.success, failed: results.total - results.success, errors: results.errors } });
    } catch (error) {
        broadcastProgress({ type: 'error', message: '解密失败', error: error.message, timestamp: new Date().toISOString() });
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route POST /api/decrypt/start-by-file
 * @desc 仅解密单个文件
 * @query path=绝对路径或文件名（后者需能唯一匹配）
 */
router.post('/start-by-file', async (req, res) => {
    try {
        const filePath = (req.body && req.body.path) || req.query.path;
        if (!filePath) {
            return res.status(400).json({ success: false, error: 'Missing query parameter: path' });
        }

        broadcastProgress({ type: 'start', message: `开始解密文件 ${filePath} ...`, timestamp: new Date().toISOString() });

        const results = await decryptService.decryptAllFiles((progressData) => {
            broadcastProgress(progressData);
        }, { filePath });

        broadcastProgress({
            type: 'complete',
            message: `文件解密完成`,
            data: { total: results.total, success: results.success, failed: results.total - results.success, errors: results.errors },
            timestamp: new Date().toISOString()
        });

        res.json({ success: true, data: { total: results.total, success: results.success, failed: results.total - results.success, errors: results.errors } });
    } catch (error) {
        broadcastProgress({ type: 'error', message: '解密失败', error: error.message, timestamp: new Date().toISOString() });
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * 广播进度更新到所有连接的客户端
 */
function broadcastProgress(data) {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    sseConnections.forEach(res => {
        try {
            res.write(message);
        } catch (error) {
            // 连接已断开，移除
            sseConnections.delete(res);
        }
    });
}

/**
 * @route GET /api/decrypt/files
 * @desc 获取所有GPG文件列表
 * @access Public
 */
router.get('/files', (req, res) => {
    try {
        const gpgFiles = decryptService.getGpgFiles();
        
        // 按日期分组
        const filesByDate = {};
        gpgFiles.forEach(file => {
            if (!filesByDate[file.date]) {
                filesByDate[file.date] = [];
            }
            filesByDate[file.date].push({
                filename: file.filename,
                filePath: file.filePath
            });
        });
        
        res.json({
            success: true,
            data: {
                total: gpgFiles.length,
                filesByDate: filesByDate
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
