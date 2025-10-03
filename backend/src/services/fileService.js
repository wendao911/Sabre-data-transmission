const path = require('path');
const fs = require('fs');
const config = require('../config');
const SystemLogService = require('./systemLogService');
const { FileUploadLog } = require('../models/FileUploadLog');

function getProjectRoot() {
  return path.join(__dirname, '..', '..');
}

function walkDir(dir, filterFn) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results.push(...walkDir(filePath, filterFn));
    } else {
      if (!filterFn || filterFn(file, filePath, stat)) results.push({ file, filePath, stat });
    }
  }
  return results;
}

function paginate(arr, page, pageSize) {
  const total = arr.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return { total, items: arr.slice(start, end) };
}

async function browseDirectory(options) {
  const { currentPath = '', search = '', page = 1, pageSize = 50, sortBy = 'name', sortOrder = 'asc', showHidden = false } = options || {};
  const rootPath = config.fileBrowser?.rootPath || process.cwd();
  const fullCurrentPath = path.resolve(rootPath, currentPath);
  if (!fullCurrentPath.startsWith(path.resolve(rootPath))) throw new Error('访问路径超出允许范围');
  if (!fs.existsSync(fullCurrentPath)) throw new Error(`目录不存在: ${fullCurrentPath}`);
  if (!fs.statSync(fullCurrentPath).isDirectory()) throw new Error('路径不是目录');

  const items = fs.readdirSync(fullCurrentPath)
    .map(name => {
      const itemPath = path.join(fullCurrentPath, name);
      const stat = fs.statSync(itemPath);
      const relativePath = path.relative(rootPath, itemPath);
      return { name, path: relativePath, fullPath: itemPath, size: stat.size, mtime: stat.mtimeMs, isDirectory: stat.isDirectory(), isFile: stat.isFile(), extension: path.extname(name).toLowerCase() };
    })
    .filter(item => {
      if (!showHidden && item.name.startsWith('.')) return false;
      if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      let aVal, bVal;
      switch (sortBy) {
        case 'size': aVal = a.size; bVal = b.size; break;
        case 'date': aVal = a.mtime; bVal = b.mtime; break;
        case 'type': aVal = a.isDirectory ? 0 : 1; bVal = b.isDirectory ? 0 : 1; break;
        case 'name': default: aVal = a.name.toLowerCase(); bVal = b.name.toLowerCase();
      }
      return sortOrder === 'desc' ? (aVal > bVal ? -1 : aVal < bVal ? 1 : 0) : (aVal < bVal ? -1 : aVal > bVal ? 1 : 0);
    });

  const { total, items: paginatedItems } = paginate(items, parseInt(page), parseInt(pageSize));
  return {
    total,
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    items: paginatedItems,
    currentPath,
    rootPath,
    parentPath: currentPath ? path.dirname(currentPath) : null,
    config: { sortBy, sortOrder, showHidden }
  };
}

async function createDirectory({ currentPath = '', directoryName }) {
  const rootPath = config.fileBrowser?.rootPath || process.cwd();
  if (!directoryName || !directoryName.trim()) throw new Error('目录名称不能为空');
  const fullCurrentPath = path.resolve(rootPath, currentPath || '');
  const newDirectoryPath = path.join(fullCurrentPath, directoryName.trim());
  if (!newDirectoryPath.startsWith(path.resolve(rootPath))) throw new Error('访问路径超出允许范围');
  if (fs.existsSync(newDirectoryPath)) throw new Error('目录已存在');
  fs.mkdirSync(newDirectoryPath, { recursive: true });
  return { name: directoryName.trim(), path: path.relative(rootPath, newDirectoryPath), fullPath: newDirectoryPath };
}

async function uploadFileWithLog({ targetPath = '', baseName, file, fileTypeConfig, remark = '', headers = {} }) {
  const rootPath = config.fileBrowser?.rootPath || process.cwd();
  if (!file) throw new Error('未选择文件');
  if (!baseName || !baseName.trim()) throw new Error('文件名不能为空');

  let fileTypeConfigData = null;
  if (fileTypeConfig) {
    const FileTypeConfig = require('../models/FileTypeConfig');
    fileTypeConfigData = await FileTypeConfig.findById(fileTypeConfig);
    if (!fileTypeConfigData) throw new Error('文件类型配置不存在');
  }

  const decodedOriginalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
  const sourceExt = path.extname(decodedOriginalName);
  const finalName = `${baseName.trim()}${sourceExt}`;

  const fullTargetDir = path.resolve(rootPath, targetPath);
  if (!fullTargetDir.startsWith(path.resolve(rootPath))) throw new Error('访问路径超出允许范围');
  if (!fs.existsSync(fullTargetDir)) throw new Error(`目标目录不存在: ${fullTargetDir}`);
  if (!fs.statSync(fullTargetDir).isDirectory()) throw new Error('目标路径不是目录');

  const fullTargetPath = path.join(fullTargetDir, finalName);
  const relativePath = path.relative(rootPath, fullTargetPath);
  fs.writeFileSync(fullTargetPath, file.buffer);

  const startTime = new Date();
  const userId = headers['x-user-id'] || 'anonymous';
  const userName = headers['x-user-name'] || 'Anonymous User';

  const uploadLog = new FileUploadLog({
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
    remark,
    fileTypeConfigId: fileTypeConfigData?._id,
    fileTypeConfig: fileTypeConfigData ? { module: fileTypeConfigData.module, fileType: fileTypeConfigData.fileType, pushPath: fileTypeConfigData.pushPath } : null
  });
  await uploadLog.save();

  await SystemLogService.logFileOperation('file_upload', 'UPLOAD', `文件上传成功: ${finalName}`, {
    originalName: decodedOriginalName,
    savedName: finalName,
    filePath: relativePath,
    fileSize: file.size,
    uploadedBy: userName,
    remark,
    fileTypeConfig: fileTypeConfigData ? { module: fileTypeConfigData.module, fileType: fileTypeConfigData.fileType, pushPath: fileTypeConfigData.pushPath } : null,
    duration: Date.now() - startTime.getTime()
  });

  return { name: finalName, path: relativePath, fullPath: fullTargetPath, size: file.size, mimetype: file.mimetype, uploadId: uploadLog._id };
}

function resolveDownloadPath(queryPath) {
  const rootPath = config.fileBrowser?.rootPath || process.cwd();
  if (!queryPath) throw new Error('文件路径不能为空');
  const fullFilePath = path.resolve(rootPath, queryPath);
  if (!fullFilePath.startsWith(path.resolve(rootPath))) throw new Error('访问路径超出允许范围');
  if (!fs.existsSync(fullFilePath)) throw new Error('文件不存在');
  if (!fs.statSync(fullFilePath).isFile()) throw new Error('路径不是文件');
  const fileName = path.basename(fullFilePath);
  return { fullFilePath, fileName };
}

async function deletePathAndLogs(bodyPath) {
  const rootPath = config.fileBrowser?.rootPath || process.cwd();
  if (!bodyPath) throw new Error('文件路径不能为空');
  const fullFilePath = path.resolve(rootPath, bodyPath);
  if (!fullFilePath.startsWith(path.resolve(rootPath))) throw new Error('访问路径超出允许范围');
  if (!fs.existsSync(fullFilePath)) throw new Error('文件不存在');
  if (fs.statSync(fullFilePath).isDirectory()) {
    fs.rmdirSync(fullFilePath, { recursive: true });
  } else {
    fs.unlinkSync(fullFilePath);
    try { await FileUploadLog.deleteMany({ filePath: bodyPath }); } catch (logErr) { /* ignore */ }
  }
}

async function getUploadLogs(params) {
  const { page = 1, pageSize = 20, startDate, endDate, status, uploadedBy, search, sortBy = 'uploadedAt', sortOrder = -1 } = params || {};
  const query = {};
  if (status) query.status = status;
  if (uploadedBy) query.uploadedBy = uploadedBy;
  if (startDate || endDate) { query.uploadedAt = {}; if (startDate) query.uploadedAt.$gte = new Date(startDate); if (endDate) query.uploadedAt.$lte = new Date(endDate); }
  if (search) query.$or = [{ originalName: { $regex: search, $options: 'i' } }, { savedName: { $regex: search, $options: 'i' } }, { filePath: { $regex: search, $options: 'i' } }];
  query.isDeleted = { $ne: true };
  const skip = (page - 1) * pageSize;
  const sort = { [sortBy]: parseInt(sortOrder) };
  const [logs, total] = await Promise.all([ FileUploadLog.find(query).sort(sort).skip(skip).limit(parseInt(pageSize)).lean(), FileUploadLog.countDocuments(query) ]);
  return { logs, pagination: { current: parseInt(page), pageSize: parseInt(pageSize), total, pages: Math.ceil(total / pageSize) } };
}

async function getUploadLogByPath(relativePath) {
  if (!relativePath) throw new Error('缺少 path 参数');
  const log = await FileUploadLog.findOne({ filePath: relativePath, isDeleted: { $ne: true } }).sort({ uploadedAt: -1 }).lean();
  return { log };
}

async function updateUploadLogRemark(id, remark = '') {
  const log = await FileUploadLog.findById(id);
  if (!log) throw new Error('记录不存在');
  log.remark = remark;
  await log.save();
  return { log };
}

async function getUploadStats({ startDate, endDate } = {}) {
  const matchQuery = {};
  if (startDate || endDate) { matchQuery.uploadedAt = {}; if (startDate) matchQuery.uploadedAt.$gte = new Date(startDate); if (endDate) matchQuery.uploadedAt.$lte = new Date(endDate); }
  matchQuery.isDeleted = { $ne: true };
  const stats = await FileUploadLog.aggregate([{ $match: matchQuery }, { $group: { _id: '$status', count: { $sum: 1 }, totalSize: { $sum: '$fileSize' }, avgSize: { $avg: '$fileSize' } } }]);
  const totalStats = await FileUploadLog.aggregate([{ $match: matchQuery }, { $group: { _id: null, totalCount: { $sum: 1 }, totalSize: { $sum: '$fileSize' }, successCount: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } }, failedCount: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } } } }]);
  const result = { total: totalStats[0]?.totalCount || 0, totalSize: totalStats[0]?.totalSize || 0, successCount: totalStats[0]?.successCount || 0, failedCount: totalStats[0]?.failedCount || 0, byStatus: {} };
  stats.forEach(stat => { result.byStatus[stat._id] = { count: stat.count, totalSize: stat.totalSize, avgSize: Math.round(stat.avgSize) }; });
  return result;
}

module.exports = {
  getProjectRoot,
  walkDir,
  paginate,
  browseDirectory,
  createDirectory,
  uploadFileWithLog,
  resolveDownloadPath,
  deletePathAndLogs,
  getUploadLogs,
  getUploadLogByPath,
  updateUploadLogRemark,
  getUploadStats
};


