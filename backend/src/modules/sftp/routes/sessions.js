const express = require('express');
const router = express.Router();
const { SyncSession } = require('../../fileMapping/models/SyncRecord');

/**
 * 获取同步会话列表
 * GET /api/sftp/sync/sessions
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      startDate,
      endDate,
      status,
      sortBy = 'createdAt',
      sortOrder = -1
    } = req.query;

    const query = {};
    
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * pageSize;
    const sort = { [sortBy]: parseInt(sortOrder) };

    const [sessions, total] = await Promise.all([
      SyncSession.find(query)
        .populate('ruleResults.ruleId', 'name module')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(pageSize))
        .lean(),
      SyncSession.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        logs: sessions,
        pagination: {
          current: parseInt(page),
          pageSize: parseInt(pageSize),
          total,
          pages: Math.ceil(total / pageSize)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取同步会话详情
 * GET /api/sftp/sync/sessions/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const session = await SyncSession.findById(id)
      .populate('ruleResults.ruleId', 'name module')
      .lean();

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取同步会话统计
 * GET /api/sftp/sync/sessions/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchQuery = {};
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    const stats = await SyncSession.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalFiles: { $sum: '$totalFiles' },
          syncedFiles: { $sum: '$syncedFiles' },
          skippedFiles: { $sum: '$skippedFiles' },
          failedFiles: { $sum: '$failedFiles' }
        }
      }
    ]);

    const result = {
      total: 0,
      totalFiles: 0,
      syncedFiles: 0,
      skippedFiles: 0,
      failedFiles: 0,
      byStatus: {}
    };

    stats.forEach(stat => {
      result.total += stat.count;
      result.totalFiles += stat.totalFiles;
      result.syncedFiles += stat.syncedFiles;
      result.skippedFiles += stat.skippedFiles;
      result.failedFiles += stat.failedFiles;
      result.byStatus[stat._id] = {
        count: stat.count,
        totalFiles: stat.totalFiles,
        syncedFiles: stat.syncedFiles,
        skippedFiles: stat.skippedFiles,
        failedFiles: stat.failedFiles
      };
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
