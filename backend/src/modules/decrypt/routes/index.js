const express = require('express');
const router = express.Router();
const decryptService = require('../services');
const decryptLogService = require('../../files/services/decryptLogService');

const sseConnections = new Set();

router.get('/status', (req, res) => {
  try {
    const status = decryptService.getDecryptStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/progress', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  res.write('data: {"type":"connected","message":"Connected to decrypt progress stream"}\n\n');
  sseConnections.add(res);
  req.on('close', () => {
    sseConnections.delete(res);
  });
});

router.post('/start', async (req, res) => {
  try {
    broadcastProgress({ type: 'start', message: '开始解密...', timestamp: new Date().toISOString() });

    const { date, month, filePath } = req.body || {};

    let datesToProcess = [];
    const allFiles = decryptService.getGpgFiles().filter(f => f.isGpg === true);
    if (date && /^\d{8}$/.test(String(date))) {
      datesToProcess = [String(date)];
    } else if (month && /^\d{6}$/.test(String(month))) {
      const monthDates = new Set(allFiles.filter(f => typeof f.date === 'string' && f.date.startsWith(String(month))).map(f => f.date));
      datesToProcess = Array.from(monthDates).sort();
    } else if (filePath) {
      const filename = String(filePath).split(/[\\\/]/).pop();
      const inferredDate = decryptService.extractDateFromFilename(filename);
      if (inferredDate) {
        datesToProcess = [inferredDate];
      }
    } else {
      const allDatesSet = new Set(allFiles.map(f => f.date));
      datesToProcess = Array.from(allDatesSet).sort();
    }

    if (datesToProcess.length === 0) {
      broadcastProgress({ type: 'info', message: '没有找到需要解密的文件', timestamp: new Date().toISOString() });
      return res.json({ success: true, data: { total: 0, success: 0, failed: 0, errors: [] } });
    }

    let grandTotal = 0;
    let grandSuccess = 0;
    const grandErrors = [];

    for (const d of datesToProcess) {
      broadcastProgress({ type: 'info', message: `开始处理日期 ${d} ...`, date: d, timestamp: new Date().toISOString() });

      const options = filePath ? { date: d, filePath } : { date: d };
      const dayResults = await decryptService.decryptAllFiles((progressData) => {
        broadcastProgress({ ...progressData, date: d });
      }, options);

      grandTotal += dayResults.total;
      grandSuccess += dayResults.success;
      if (Array.isArray(dayResults.errors)) grandErrors.push(...dayResults.errors);

      const failedCount = dayResults.total - dayResults.success;
      await decryptLogService.logDayResult(d, failedCount === 0 ? 'success' : 'fail');
      if (failedCount > 0 && Array.isArray(dayResults.errors) && dayResults.errors.length > 0) {
        const failedFiles = dayResults.errors
          .map(e => {
            const m = String(e).match(/：(.+?)(\s|-|$)/);
            return m ? m[1] : null;
          })
          .filter(Boolean);
        await decryptLogService.logFailedFiles(d, failedFiles);
      }

      broadcastProgress({ type: 'info', message: `日期 ${d} 处理完成`, date: d, timestamp: new Date().toISOString() });
    }

    broadcastProgress({
      type: 'complete',
      message: '解密完成（按日汇总）',
      data: { total: grandTotal, success: grandSuccess, failed: grandTotal - grandSuccess, errors: grandErrors },
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, data: { total: grandTotal, success: grandSuccess, failed: grandTotal - grandSuccess, errors: grandErrors } });
  } catch (error) {
    broadcastProgress({ type: 'error', message: '解密失败', error: error.message, timestamp: new Date().toISOString() });
    res.status(500).json({ success: false, error: error.message });
  }
});

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

    const failedCount = results.total - results.success;
    await decryptLogService.logDayResult(date, failedCount === 0 ? 'success' : 'fail');
    if (failedCount > 0 && Array.isArray(results.errors) && results.errors.length > 0) {
      const failedFiles = results.errors
        .map(e => {
          const m = String(e).match(/：(.+?)(\s|-|$)/);
          return m ? m[1] : null;
        })
        .filter(Boolean);
      await decryptLogService.logFailedFiles(date, failedFiles);
    }

    broadcastProgress({
      type: 'complete',
      message: `解密完成（日期 ${date}）`,
      data: { total: results.total, success: results.success, failed: results.total - results.success, errors: results.errors },
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, data: { total: results.total, success: results.success, failed: results.total - results.success, errors: results.errors } });
  } catch (error) {
    if (/^\d{8}$/.test((req.body && req.body.date) || req.query.date || '')) {
      const dateForLog = (req.body && req.body.date) || req.query.date;
      try { await decryptLogService.logDayResult(dateForLog, 'fail'); } catch (_) {}
    }
    broadcastProgress({ type: 'error', message: '解密失败', error: error.message, timestamp: new Date().toISOString() });
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/start-by-month', async (req, res) => {
  try {
    const month = (req.body && req.body.month) || req.query.month;
    if (!month || !/^\d{6}$/.test(month)) {
      return res.status(400).json({ success: false, error: 'Invalid month. Expect YYYYMM' });
    }

    broadcastProgress({ type: 'start', message: `开始解密月份 ${month} 的文件...`, timestamp: new Date().toISOString() });

    const allFiles = decryptService.getGpgFiles().filter(f => f.isGpg === true);
    const monthDates = Array.from(new Set(allFiles
      .filter(f => typeof f.date === 'string' && f.date.startsWith(month))
      .map(f => f.date))).sort();

    if (monthDates.length === 0) {
      broadcastProgress({ type: 'info', message: `月份 ${month} 下没有需要解密的文件`, timestamp: new Date().toISOString() });
      return res.json({ success: true, data: { total: 0, success: 0, failed: 0, errors: [] } });
    }

    let grandTotal = 0;
    let grandSuccess = 0;
    const grandErrors = [];

    for (const d of monthDates) {
      broadcastProgress({ type: 'info', message: `开始处理日期 ${d} ...`, date: d, timestamp: new Date().toISOString() });

      const dayResults = await decryptService.decryptAllFiles((progressData) => {
        broadcastProgress({ ...progressData, date: d });
      }, { date: d });

      grandTotal += dayResults.total;
      grandSuccess += dayResults.success;
      if (Array.isArray(dayResults.errors)) grandErrors.push(...dayResults.errors);

      const failedCount = dayResults.total - dayResults.success;
      await decryptLogService.logDayResult(d, failedCount === 0 ? 'success' : 'fail');
      if (failedCount > 0 && Array.isArray(dayResults.errors) && dayResults.errors.length > 0) {
        const failedFiles = dayResults.errors
          .map(e => {
            const m = String(e).match(/：(.+?)(\s|-|$)/);
            return m ? m[1] : null;
          })
          .filter(Boolean);
        await decryptLogService.logFailedFiles(d, failedFiles);
      }

      broadcastProgress({ type: 'info', message: `日期 ${d} 处理完成`, date: d, timestamp: new Date().toISOString() });
    }

    broadcastProgress({ type: 'complete', message: `解密完成（月份 ${month}，按日汇总）`, data: { total: grandTotal, success: grandSuccess, failed: grandTotal - grandSuccess, errors: grandErrors }, timestamp: new Date().toISOString() });
    res.json({ success: true, data: { total: grandTotal, success: grandSuccess, failed: grandTotal - grandSuccess, errors: grandErrors } });
  } catch (error) {
    broadcastProgress({ type: 'error', message: '解密失败', error: error.message, timestamp: new Date().toISOString() });
    res.status(500).json({ success: false, error: error.message });
  }
});

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

function broadcastProgress(data) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  sseConnections.forEach(res => {
    try {
      res.write(message);
    } catch (error) {
      sseConnections.delete(res);
    }
  });
}

module.exports = router;


