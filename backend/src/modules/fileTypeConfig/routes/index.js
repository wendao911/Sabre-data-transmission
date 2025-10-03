const express = require('express');
const router = express.Router();
const FileTypeConfig = require('../models/FileTypeConfig');
const SystemLogService = require('../../system/services/systemLogService');

/**
 * 获取文件类型配置列表
 * GET /api/file-type-config
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      module,
      fileType,
      enabled,
      search,
      sortBy = 'serialNumber',
      sortOrder = 'asc'
    } = req.query;

    // 构建查询条件
    const query = { isDeleted: { $ne: true } }; // 排除已删除的记录
    
    if (module) {
      query.module = module;
    }
    
    if (fileType) {
      query.fileType = { $regex: fileType, $options: 'i' };
    }
    
    if (enabled !== undefined) {
      query.enabled = enabled === 'true';
    }
    
    if (search) {
      query.$or = [
        { fileType: { $regex: search, $options: 'i' } },
        { pushPath: { $regex: search, $options: 'i' } },
        { remark: { $regex: search, $options: 'i' } }
      ];
    }

    // 排序
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // 分页
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    // 查询数据
    const [configs, total] = await Promise.all([
      FileTypeConfig.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      FileTypeConfig.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        configs,
        pagination: {
          current: parseInt(page),
          pageSize: parseInt(pageSize),
          total,
          pages: Math.ceil(total / parseInt(pageSize))
        }
      }
    });
  } catch (error) {
    console.error('获取文件类型配置列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取文件类型配置列表失败'
    });
  }
});

/**
 * 获取单个文件类型配置
 * GET /api/file-type-config/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const config = await FileTypeConfig.findById(req.params.id);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        error: '文件类型配置不存在'
      });
    }

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('获取文件类型配置失败:', error);
    res.status(500).json({
      success: false,
      error: '获取文件类型配置失败'
    });
  }
});

/**
 * 创建文件类型配置
 * POST /api/file-type-config
 */
router.post('/', async (req, res) => {
  try {
    const {
      serialNumber,
      module,
      fileType,
      pushPath,
      remark,
      enabled = true,
      sortWeight = 0
    } = req.body;

    // 验证必填字段
    if (!module) {
      return res.status(400).json({
        success: false,
        error: '模块为必填项'
      });
    }

    // 检查序号是否重复
    if (serialNumber && serialNumber > 0) {
      const existingConfig = await FileTypeConfig.findOne({ 
        serialNumber, 
        isDeleted: { $ne: true } 
      });
      if (existingConfig) {
        return res.status(400).json({
          success: false,
          error: '序号已存在'
        });
      }
    }

    // 创建配置
    const config = new FileTypeConfig({
      serialNumber,
      module,
      fileType,
      pushPath,
      remark: remark || '',
      enabled,
      sortWeight,
      createdBy: req.headers['x-user-name'] || 'system',
      updatedBy: req.headers['x-user-name'] || 'system'
    });

    await config.save();

    // 记录系统日志
    await SystemLogService.logFileOperation(
      'fileTypeConfig',
      'CREATE',
      `创建文件类型配置: ${fileType || '未命名'}`,
      {
        configId: config._id,
        module,
        fileType,
        pushPath
      }
    );

    res.status(201).json({
      success: true,
      data: config,
      message: '文件类型配置创建成功'
    });
  } catch (error) {
    console.error('创建文件类型配置失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '创建文件类型配置失败'
    });
  }
});

/**
 * 更新文件类型配置
 * PUT /api/file-type-config/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const {
      serialNumber,
      module,
      fileType,
      pushPath,
      remark,
      enabled,
      sortWeight
    } = req.body;

    const config = await FileTypeConfig.findById(req.params.id);
    if (!config) {
      return res.status(404).json({
        success: false,
        error: '文件类型配置不存在'
      });
    }

    // 检查序号是否重复（排除当前记录）
    if (serialNumber && serialNumber !== config.serialNumber) {
      const existingConfig = await FileTypeConfig.findOne({ 
        serialNumber, 
        _id: { $ne: req.params.id } 
      });
      if (existingConfig) {
        return res.status(400).json({
          success: false,
          error: '序号已存在'
        });
      }
    }

    // 更新字段
    const updateData = {};
    if (serialNumber !== undefined) updateData.serialNumber = serialNumber;
    if (module !== undefined) updateData.module = module;
    if (fileType !== undefined) updateData.fileType = fileType;
    if (pushPath !== undefined) updateData.pushPath = pushPath;
    if (remark !== undefined) updateData.remark = remark;
    if (enabled !== undefined) updateData.enabled = enabled;
    if (sortWeight !== undefined) updateData.sortWeight = sortWeight;
    
    updateData.updatedBy = req.headers['x-user-name'] || 'system';

    const updatedConfig = await FileTypeConfig.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // 记录系统日志
    await SystemLogService.logFileOperation(
      'fileTypeConfig',
      'UPDATE',
      `更新文件类型配置: ${updatedConfig.fileType || '未命名'}`,
      {
        configId: updatedConfig._id,
        module: updatedConfig.module,
        fileType: updatedConfig.fileType,
        pushPath: updatedConfig.pushPath
      }
    );

    res.json({
      success: true,
      data: updatedConfig,
      message: '文件类型配置更新成功'
    });
  } catch (error) {
    console.error('更新文件类型配置失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '更新文件类型配置失败'
    });
  }
});

/**
 * 删除文件类型配置
 * DELETE /api/file-type-config/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const config = await FileTypeConfig.findById(req.params.id);
    if (!config) {
      return res.status(404).json({
        success: false,
        error: '文件类型配置不存在'
      });
    }

    await FileTypeConfig.findByIdAndDelete(req.params.id);

    // 记录系统日志
    await SystemLogService.logFileOperation(
      'fileTypeConfig',
      'DELETE',
      `删除文件类型配置: ${config.fileType || '未命名'}`,
      {
        configId: config._id,
        module: config.module,
        fileType: config.fileType
      }
    );

    res.json({
      success: true,
      message: '文件类型配置删除成功'
    });
  } catch (error) {
    console.error('删除文件类型配置失败:', error);
    res.status(500).json({
      success: false,
      error: '删除文件类型配置失败'
    });
  }
});

/**
 * 批量删除文件类型配置
 * DELETE /api/file-type-config/batch
 */
router.delete('/batch', async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: '请选择要删除的配置'
      });
    }

    const configs = await FileTypeConfig.find({ _id: { $in: ids } });
    const deletedCount = await FileTypeConfig.deleteMany({ _id: { $in: ids } });

    // 记录系统日志
    for (const config of configs) {
      await SystemLogService.logFileOperation(
        'fileTypeConfig',
        'BATCH_DELETE',
        `批量删除文件类型配置: ${config.fileType || '未命名'}`,
        {
          configId: config._id,
          module: config.module,
          fileType: config.fileType
        }
      );
    }

    res.json({
      success: true,
      message: `成功删除 ${deletedCount.deletedCount} 个文件类型配置`
    });
  } catch (error) {
    console.error('批量删除文件类型配置失败:', error);
    res.status(500).json({
      success: false,
      error: '批量删除文件类型配置失败'
    });
  }
});

/**
 * 获取模块列表
 * GET /api/file-type-config/modules
 */
router.get('/modules', async (req, res) => {
  try {
    const modules = [
      { value: 'SAL', label: 'SAL' },
      { value: 'UPL', label: 'UPL' },
      { value: 'OWB', label: 'OWB' },
      { value: 'IWB', label: 'IWB' },
      { value: 'MAS', label: 'MAS' },
      { value: 'OTHER', label: '其他' }
    ];

    res.json({
      success: true,
      data: modules
    });
  } catch (error) {
    console.error('获取模块列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取模块列表失败'
    });
  }
});

module.exports = router;
