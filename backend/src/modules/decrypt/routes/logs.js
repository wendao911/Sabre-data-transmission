const express = require('express');
const router = express.Router();
const { DecryptLog } = require('../models');

/**
 * 获取解密日志列表
 * GET /api/decrypt/logs
 */
router.get('/', async (req, res) => {
  try {
    // 检查 DecryptLog 模型是否正确加载
    if (!DecryptLog || typeof DecryptLog.find !== 'function') {
      console.error('DecryptLog 模型未正确加载:', DecryptLog);
      return res.status(500).json({
        success: false,
        error: 'DecryptLog 模型未正确加载'
      });
    }

    const {
      page = 1,
      pageSize = 20,
      startDate,
      endDate,
      status,
      searchText,
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

    // 添加搜索文本支持
    if (searchText) {
      query.$or = [
        { date: { $regex: searchText, $options: 'i' } },
        { status: { $regex: searchText, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * pageSize;
    const sort = { [sortBy]: parseInt(sortOrder) };

    console.log('查询解密日志，参数:', { query, skip, sort, pageSize });

    const [logs, total] = await Promise.all([
      DecryptLog.find(query).sort(sort).skip(skip).limit(parseInt(pageSize)).lean(),
      DecryptLog.countDocuments(query)
    ]);

    console.log('查询结果:', { logsCount: logs.length, total });

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          current: parseInt(page),
          pageSize: parseInt(pageSize),
          total,
          pages: Math.ceil(total / pageSize)
        }
      }
    });
  } catch (error) {
    console.error('解密日志查询错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取解密日志统计
 * GET /api/decrypt/logs/stats
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

    const stats = await DecryptLog.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      total: 0,
      success: 0,
      failed: 0
    };

    stats.forEach(stat => {
      result.total += stat.count;
      if (stat._id === 'success') {
        result.success = stat.count;
      } else if (stat._id === 'fail') {
        result.failed = stat.count;
      }
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
