const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();
const { walkDir, paginate } = require('../services/fileService');
const config = require('../../../config');
const { FileUploadLog } = require('../models');
const { SystemLogService } = require('../../system');

// 文件浏览器 API - 层级浏览目录
router.get('/browser', (req, res) => {
  try {
    const rootPath = config.fileBrowser?.rootPath || process.cwd();
    const currentPath = req.query.path || '';
    const search = (req.query.search || '').toLowerCase();
    const page = parseInt(req.query.page || '1');
    const pageSize = parseInt(req.query.pageSize || '50');
    const sortBy = req.query.sortBy || 'name';
    const sortOrder = req.query.sortOrder || 'asc';
    const showHidden = req.query.showHidden === 'true';

    // 构建当前浏览路径
    const fullCurrentPath = path.resolve(rootPath, currentPath);
    
    // 安全检查：确保路径在根目录内
    if (!fullCurrentPath.startsWith(path.resolve(rootPath))) {
      return res.status(403).json({ 
        success: false, 
        error: '访问路径超出允许范围' 
      });
    }
    
    if (!fs.existsSync(fullCurrentPath)) {
      return res.status(404).json({ 
        success: false, 
        error: `目录不存在: ${fullCurrentPath}` 
      });
    }

    if (!fs.statSync(fullCurrentPath).isDirectory()) {
      return res.status(400).json({ 
        success: false, 
        error: '路径不是目录' 
      });
    }

    // 读取当前目录内容
    const items = fs.readdirSync(fullCurrentPath)
      .map(name => {
        const itemPath = path.join(fullCurrentPath, name);
        const stat = fs.statSync(itemPath);
        const relativePath = path.relative(rootPath, itemPath);
        
        return {
          name: name,
          path: relativePath,
          fullPath: itemPath,
          size: stat.size,
          mtime: stat.mtimeMs,
          isDirectory: stat.isDirectory(),
          isFile: stat.isFile(),
          extension: path.extname(name).toLowerCase()
        };
      })
      .filter(item => {
        // 过滤隐藏文件
        if (!showHidden && item.name.startsWith('.')) {
          return false;
        }
        // 搜索过滤
        if (search && !item.name.toLowerCase().includes(search)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        // 目录优先
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        
        // 按指定字段排序
        let aVal, bVal;
        switch (sortBy) {
          case 'size':
            aVal = a.size;
            bVal = b.size;
            break;
          case 'date':
            aVal = a.mtime;
            bVal = b.mtime;
            break;
          case 'type':
            // 目录优先逻辑已在上方处理，这里将目录视为 0，文件为 1
            aVal = a.isDirectory ? 0 : 1;
            bVal = b.isDirectory ? 0 : 1;
            break;
          case 'name':
          default:
            aVal = a.name.toLowerCase();
            bVal = b.name.toLowerCase();
            break;
        }
        
        if (sortOrder === 'desc') {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        } else {
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        }
      });

    const { total, items: paginatedItems } = paginate(items, page, pageSize);
    
    res.json({ 
      success: true, 
      data: { 
        total, 
        page, 
        pageSize, 
        items: paginatedItems,
        currentPath: currentPath,
        rootPath: rootPath,
        parentPath: currentPath ? path.dirname(currentPath) : null,
        config: {
          sortBy,
          sortOrder,
          showHidden
        }
      } 
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 创建目录 API
router.post('/create-directory', (req, res) => {
  try {
    const rootPath = config.fileBrowser?.rootPath || process.cwd();
    const { currentPath, directoryName } = req.body;
    
    if (!directoryName || !directoryName.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: '目录名称不能为空' 
      });
    }
    
    // 构建完整路径
    const fullCurrentPath = path.resolve(rootPath, currentPath || '');
    const newDirectoryPath = path.join(fullCurrentPath, directoryName.trim());
    
    // 安全检查：确保路径在根目录内
    if (!newDirectoryPath.startsWith(path.resolve(rootPath))) {
      return res.status(403).json({ 
        success: false, 
        error: '访问路径超出允许范围' 
      });
    }
    
    // 检查目录是否已存在
    if (fs.existsSync(newDirectoryPath)) {
      return res.status(400).json({ 
        success: false, 
        error: '目录已存在' 
      });
    }
    
    // 创建目录
    fs.mkdirSync(newDirectoryPath, { recursive: true });
    
    res.json({ 
      success: true, 
      message: '目录创建成功',
      data: {
        name: directoryName.trim(),
        path: path.relative(rootPath, newDirectoryPath),
        fullPath: newDirectoryPath
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 上传文件 API
// 使用内存存储，落盘时自行决定目标路径与文件名
const upload = multer({ storage: multer.memoryStorage() });
router.post('/upload', upload.single('file'), async (req, res) => {
  let uploadLog = null;
  const startTime = new Date();
  
  try {
    const rootPath = config.fileBrowser?.rootPath || process.cwd();
    const { targetPath = '', baseName, fileTypeConfig, remark = '' } = req.body;
    const file = req.file;
    
    // 获取用户信息（从请求头或token中获取）
    const userId = req.headers['x-user-id'] || 'anonymous';
    const userName = req.headers['x-user-name'] || 'Anonymous User';

    if (!file) {
      return res.status(400).json({ success: false, error: '未选择文件' });
    }

    if (!baseName || !baseName.trim()) {
      return res.status(400).json({ success: false, error: '文件名不能为空' });
    }

    // 验证文件类型配置
    let fileTypeConfigData = null;
    if (fileTypeConfig) {
      try {
        const FileTypeConfig = require('../fileTypeConfig/models/FileTypeConfig');
        fileTypeConfigData = await FileTypeConfig.findById(fileTypeConfig);
        if (!fileTypeConfigData) {
          return res.status(400).json({ success: false, error: '文件类型配置不存在' });
        }
      } catch (error) {
        return res.status(400).json({ success: false, error: '文件类型配置验证失败' });
      }
    }

    // 修正中文/特殊字符文件名乱码（某些客户端按 latin1 传输）
    const decodedOriginalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    // 以源文件扩展名为准（基于解码后的原始名）
    const sourceExt = path.extname(decodedOriginalName);
    const finalName = `${baseName.trim()}${sourceExt}`;

    // 计算落盘目录
    const fullTargetDir = path.resolve(rootPath, targetPath);
    if (!fullTargetDir.startsWith(path.resolve(rootPath))) {
      return res.status(403).json({ success: false, error: '访问路径超出允许范围' });
    }
    if (!fs.existsSync(fullTargetDir)) {
      return res.status(404).json({ success: false, error: `目标目录不存在: ${fullTargetDir}` });
    }
    if (!fs.statSync(fullTargetDir).isDirectory()) {
      return res.status(400).json({ success: false, error: '目标路径不是目录' });
    }

    const fullTargetPath = path.join(fullTargetDir, finalName);
    const relativePath = path.relative(rootPath, fullTargetPath);

    // 写入文件
    fs.writeFileSync(fullTargetPath, file.buffer);

    // 创建上传记录
    uploadLog = new FileUploadLog({
      originalName: decodedOriginalName,
      savedName: finalName,
      filePath: relativePath,
      fullPath: fullTargetPath,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedBy: userId,
      uploadedByName: userName,
      uploadedAt: startTime,
      status: 'success',
      targetDirectory: targetPath,
      fileExtension: sourceExt,
      remark: remark,
      fileTypeConfigId: fileTypeConfigData?._id,
      fileTypeConfig: fileTypeConfigData ? {
        module: fileTypeConfigData.module,
        fileType: fileTypeConfigData.fileType,
        pushPath: fileTypeConfigData.pushPath
      } : null
    });

    await uploadLog.save();

    // 记录系统日志
    await SystemLogService.logFileOperation(
      'file_upload',
      'UPLOAD',
      `文件上传成功: ${finalName}`,
      {
        originalName: decodedOriginalName,
        savedName: finalName,
        filePath: relativePath,
        fileSize: file.size,
        uploadedBy: userName,
        remark: remark,
        fileTypeConfig: fileTypeConfigData ? {
          module: fileTypeConfigData.module,
          fileType: fileTypeConfigData.fileType,
          pushPath: fileTypeConfigData.pushPath
        } : null,
        duration: Date.now() - startTime.getTime()
      }
    );

    return res.json({
      success: true,
      message: '上传成功',
      data: {
        name: finalName,
        path: relativePath,
        fullPath: fullTargetPath,
        size: file.size,
        mimetype: file.mimetype,
        uploadId: uploadLog._id
      }
    });
  } catch (e) {
    // 如果已经创建了上传记录，更新为失败状态
    if (uploadLog) {
      try {
        uploadLog.status = 'failed';
        uploadLog.errorMessage = e.message;
        await uploadLog.save();
      } catch (logError) {
        console.error('更新上传记录失败:', logError);
      }
    } else {
      // 创建失败记录
      try {
        const userId = req.headers['x-user-id'] || 'anonymous';
        const userName = req.headers['x-user-name'] || 'Anonymous User';
        
        await FileUploadLog.create({
          originalName: req.file?.originalname || 'unknown',
          savedName: 'failed',
          filePath: 'failed',
          fullPath: 'failed',
          fileSize: 0,
          mimeType: req.file?.mimetype || 'unknown',
          uploadedBy: userId,
          uploadedByName: userName,
          uploadedAt: startTime,
          status: 'failed',
          errorMessage: e.message,
          targetDirectory: req.body?.targetPath || '',
          fileExtension: ''
        });
      } catch (logError) {
        console.error('创建失败记录失败:', logError);
      }
    }

    // 记录系统错误日志
    await SystemLogService.logSystemError(
      'file_upload',
      'file_upload_failed',
      '文件上传失败',
      {
        error: e.message,
        originalName: req.file?.originalname,
        uploadedBy: req.headers['x-user-name'] || 'Anonymous User',
        duration: Date.now() - startTime.getTime()
      }
    );

    return res.status(500).json({ success: false, error: e.message });
  }
});

// 下载文件 API
router.get('/download', (req, res) => {
  try {
    const rootPath = config.fileBrowser?.rootPath || process.cwd();
    const { path: filePath } = req.query;
    
    if (!filePath) {
      return res.status(400).json({ success: false, error: '文件路径不能为空' });
    }
    
    const fullFilePath = path.resolve(rootPath, filePath);
    
    // 安全检查：确保路径在根目录内
    if (!fullFilePath.startsWith(path.resolve(rootPath))) {
      return res.status(403).json({ success: false, error: '访问路径超出允许范围' });
    }
    
    if (!fs.existsSync(fullFilePath)) {
      return res.status(404).json({ success: false, error: '文件不存在' });
    }
    
    if (!fs.statSync(fullFilePath).isFile()) {
      return res.status(400).json({ success: false, error: '路径不是文件' });
    }
    
    const fileName = path.basename(fullFilePath);
    res.download(fullFilePath, fileName);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 删除文件 API
router.delete('/delete', async (req, res) => {
  try {
    const rootPath = config.fileBrowser?.rootPath || process.cwd();
    const { path: filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ success: false, error: '文件路径不能为空' });
    }
    
    const fullFilePath = path.resolve(rootPath, filePath);
    
    // 安全检查：确保路径在根目录内
    if (!fullFilePath.startsWith(path.resolve(rootPath))) {
      return res.status(403).json({ success: false, error: '访问路径超出允许范围' });
    }
    
    if (!fs.existsSync(fullFilePath)) {
      return res.status(404).json({ success: false, error: '文件不存在' });
    }
    
    // 删除文件或目录
    if (fs.statSync(fullFilePath).isDirectory()) {
      fs.rmdirSync(fullFilePath, { recursive: true });
    } else {
      fs.unlinkSync(fullFilePath);
      try {
        // 同步删除数据库上传记录（硬删除）
        await FileUploadLog.deleteMany({ filePath: filePath });
      } catch (logErr) {
        // 不阻断文件删除流程，只记录错误
        console.error('删除上传记录失败:', logErr);
      }
    }
    
    res.json({ success: true, message: '删除成功' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 获取文件上传记录 API
router.get('/upload-logs', async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      startDate,
      endDate,
      status,
      uploadedBy,
      search,
      sortBy = 'uploadedAt',
      sortOrder = -1
    } = req.query;

    const query = {};
    
    // 状态筛选
    if (status) {
      query.status = status;
    }
    
    // 用户筛选
    if (uploadedBy) {
      query.uploadedBy = uploadedBy;
    }
    
    // 日期范围筛选
    if (startDate || endDate) {
      query.uploadedAt = {};
      if (startDate) query.uploadedAt.$gte = new Date(startDate);
      if (endDate) query.uploadedAt.$lte = new Date(endDate);
    }
    
    // 搜索筛选（文件名）
    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { savedName: { $regex: search, $options: 'i' } },
        { filePath: { $regex: search, $options: 'i' } }
      ];
    }
    
    // 只显示未删除的记录
    query.isDeleted = { $ne: true };

    const skip = (page - 1) * pageSize;
    const sort = { [sortBy]: parseInt(sortOrder) };

    const [logs, total] = await Promise.all([
      FileUploadLog.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(pageSize))
        .lean(),
      FileUploadLog.countDocuments(query)
    ]);

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
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 获取指定相对路径的最新上传记录
router.get('/upload-log/by-path', async (req, res) => {
  try {
    const { path: relativePath } = req.query;
    if (!relativePath) {
      return res.status(400).json({ success: false, error: '缺少 path 参数' });
    }

    const log = await FileUploadLog.findOne({ filePath: relativePath, isDeleted: { $ne: true } })
      .sort({ uploadedAt: -1 })
      .lean();

    return res.json({ success: true, data: { log } });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 更新上传记录备注
router.put('/upload-log/:id/remark', async (req, res) => {
  try {
    const { id } = req.params;
    const { remark = '' } = req.body || {};
    const log = await FileUploadLog.findById(id);
    if (!log) {
      return res.status(404).json({ success: false, error: '记录不存在' });
    }
    log.remark = remark;
    await log.save();
    return res.json({ success: true, data: { log } });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 获取文件上传统计 API
router.get('/upload-stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchQuery = {};
    if (startDate || endDate) {
      matchQuery.uploadedAt = {};
      if (startDate) matchQuery.uploadedAt.$gte = new Date(startDate);
      if (endDate) matchQuery.uploadedAt.$lte = new Date(endDate);
    }
    matchQuery.isDeleted = { $ne: true };

    const stats = await FileUploadLog.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalSize: { $sum: '$fileSize' },
          avgSize: { $avg: '$fileSize' }
        }
      }
    ]);

    const totalStats = await FileUploadLog.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          totalSize: { $sum: '$fileSize' },
          successCount: {
            $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
          },
          failedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          }
        }
      }
    ]);

    const result = {
      total: totalStats[0]?.totalCount || 0,
      totalSize: totalStats[0]?.totalSize || 0,
      successCount: totalStats[0]?.successCount || 0,
      failedCount: totalStats[0]?.failedCount || 0,
      byStatus: {}
    };

    stats.forEach(stat => {
      result.byStatus[stat._id] = {
        count: stat.count,
        totalSize: stat.totalSize,
        avgSize: Math.round(stat.avgSize)
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


