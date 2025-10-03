const FileTypeConfig = require('../models/FileTypeConfig');
const SystemLogService = require('./systemLogService');

async function listConfigs(queryParams = {}) {
  const {
    page = 1,
    pageSize = 20,
    module,
    fileType,
    enabled,
    search,
    sortBy = 'serialNumber',
    sortOrder = 'asc'
  } = queryParams;

  const query = { isDeleted: { $ne: true } };
  if (module) query.module = module;
  if (fileType) query.fileType = { $regex: fileType, $options: 'i' };
  if (enabled !== undefined) query.enabled = enabled === 'true' || enabled === true;
  if (search) {
    query.$or = [
      { fileType: { $regex: search, $options: 'i' } },
      { pushPath: { $regex: search, $options: 'i' } },
      { remark: { $regex: search, $options: 'i' } }
    ];
  }

  const sort = {}; sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  const skip = (parseInt(page) - 1) * parseInt(pageSize);
  const limit = parseInt(pageSize);

  const [configs, total] = await Promise.all([
    FileTypeConfig.find(query).sort(sort).skip(skip).limit(limit).lean(),
    FileTypeConfig.countDocuments(query)
  ]);

  return {
    configs,
    pagination: {
      current: parseInt(page),
      pageSize: parseInt(pageSize),
      total,
      pages: Math.ceil(total / parseInt(pageSize))
    }
  };
}

async function getConfigById(id) {
  const config = await FileTypeConfig.findById(id);
  return config;
}

async function createConfig(payload, userName = 'system') {
  const { serialNumber, module, fileType, pushPath, remark, enabled = true, sortWeight = 0 } = payload;
  if (!module) throw new Error('模块为必填项');
  if (serialNumber && serialNumber > 0) {
    const existingConfig = await FileTypeConfig.findOne({ serialNumber, isDeleted: { $ne: true } });
    if (existingConfig) throw new Error('序号已存在');
  }
  const config = new FileTypeConfig({ serialNumber, module, fileType, pushPath, remark: remark || '', enabled, sortWeight, createdBy: userName, updatedBy: userName });
  await config.save();
  await SystemLogService.logFileOperation('fileTypeConfig', 'CREATE', `创建文件类型配置: ${fileType || '未命名'}`, { configId: config._id, module, fileType, pushPath });
  return config;
}

async function updateConfig(id, payload, userName = 'system') {
  const { serialNumber, module, fileType, pushPath, remark, enabled, sortWeight } = payload;
  const config = await FileTypeConfig.findById(id);
  if (!config) throw new Error('文件类型配置不存在');

  if (serialNumber && serialNumber !== config.serialNumber) {
    const existingConfig = await FileTypeConfig.findOne({ serialNumber, _id: { $ne: id } });
    if (existingConfig) throw new Error('序号已存在');
  }

  const updateData = {};
  if (serialNumber !== undefined) updateData.serialNumber = serialNumber;
  if (module !== undefined) updateData.module = module;
  if (fileType !== undefined) updateData.fileType = fileType;
  if (pushPath !== undefined) updateData.pushPath = pushPath;
  if (remark !== undefined) updateData.remark = remark;
  if (enabled !== undefined) updateData.enabled = enabled;
  if (sortWeight !== undefined) updateData.sortWeight = sortWeight;
  updateData.updatedBy = userName;

  const updatedConfig = await FileTypeConfig.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

  await SystemLogService.logFileOperation('fileTypeConfig', 'UPDATE', `更新文件类型配置: ${updatedConfig.fileType || '未命名'}`, { configId: updatedConfig._id, module: updatedConfig.module, fileType: updatedConfig.fileType, pushPath: updatedConfig.pushPath });
  return updatedConfig;
}

async function deleteConfig(id) {
  const config = await FileTypeConfig.findById(id);
  if (!config) throw new Error('文件类型配置不存在');
  await FileTypeConfig.findByIdAndDelete(id);
  await SystemLogService.logFileOperation('fileTypeConfig', 'DELETE', `删除文件类型配置: ${config.fileType || '未命名'}`, { configId: config._id, module: config.module, fileType: config.fileType });
  return true;
}

async function batchDelete(ids = []) {
  if (!ids || !Array.isArray(ids) || ids.length === 0) throw new Error('请选择要删除的配置');
  const configs = await FileTypeConfig.find({ _id: { $in: ids } });
  const deletedCount = await FileTypeConfig.deleteMany({ _id: { $in: ids } });
  for (const config of configs) {
    await SystemLogService.logFileOperation('fileTypeConfig', 'BATCH_DELETE', `批量删除文件类型配置: ${config.fileType || '未命名'}`, { configId: config._id, module: config.module, fileType: config.fileType });
  }
  return deletedCount.deletedCount;
}

function listModules() {
  return [
    { value: 'SAL', label: 'SAL' },
    { value: 'UPL', label: 'UPL' },
    { value: 'OWB', label: 'OWB' },
    { value: 'IWB', label: 'IWB' },
    { value: 'MAS', label: 'MAS' },
    { value: 'OTHER', label: '其他' }
  ];
}

module.exports = {
  listConfigs,
  getConfigById,
  createConfig,
  updateConfig,
  deleteConfig,
  batchDelete,
  listModules
};


