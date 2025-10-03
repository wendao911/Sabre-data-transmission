const mongoose = require('mongoose');

const FileTypeConfigSchema = new mongoose.Schema({
  // 序号
  serialNumber: {
    type: Number,
    required: false,
    unique: true,
    sparse: true, // 允许null值不唯一
    min: 1
  },
  
  // 所属模块
  module: {
    type: String,
    required: true,
    trim: true,
    enum: ['SAL', 'UPL', 'OWB', 'IWB', 'MAS', 'OTHER']
  },
  
  // 文件类型
  fileType: {
    type: String,
    required: false,
    trim: true,
    maxlength: 100
  },
  
  // 推送路径
  pushPath: {
    type: String,
    required: false,
    trim: true,
    maxlength: 200
  },
  
  // 备注
  remark: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  
  // 是否启用
  enabled: {
    type: Boolean,
    default: true
  },
  
  // 创建人
  createdBy: {
    type: String,
    required: true,
    trim: true
  },
  
  // 更新人
  updatedBy: {
    type: String,
    trim: true
  },
  
  // 排序权重（用于自定义排序）
  sortWeight: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'file_type_configs'
});

// 索引
FileTypeConfigSchema.index({ serialNumber: 1 });
FileTypeConfigSchema.index({ module: 1 });
FileTypeConfigSchema.index({ fileType: 1 });
FileTypeConfigSchema.index({ enabled: 1 });
FileTypeConfigSchema.index({ sortWeight: -1, serialNumber: 1 });

// 虚拟字段：模块显示名称
FileTypeConfigSchema.virtual('moduleDisplayName').get(function() {
  const moduleNames = {
    'SAL': 'SAL',
    'UPL': 'UPL', 
    'OWB': 'OWB',
    'IWB': 'IWB',
    'MAS': 'MAS',
    'OTHER': '其他'
  };
  return moduleNames[this.module] || this.module;
});

// 虚拟字段：创建时间格式化
FileTypeConfigSchema.virtual('createdAtFormatted').get(function() {
  return this.createdAt.toLocaleString('zh-CN', {
    timeZone: 'Asia/Phnom_Penh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
});

// 虚拟字段：更新时间格式化
FileTypeConfigSchema.virtual('updatedAtFormatted').get(function() {
  return this.updatedAt.toLocaleString('zh-CN', {
    timeZone: 'Asia/Phnom_Penh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
});

// 确保虚拟字段在JSON序列化时包含
FileTypeConfigSchema.set('toJSON', { virtuals: true });
FileTypeConfigSchema.set('toObject', { virtuals: true });

// 保存前自动设置序号（如果没有提供）
FileTypeConfigSchema.pre('save', async function(next) {
  if (this.isNew && !this.serialNumber) {
    const maxSerial = await this.constructor.findOne({}, { serialNumber: 1 })
      .sort({ serialNumber: -1 })
      .lean();
    this.serialNumber = (maxSerial?.serialNumber || 0) + 1;
  }
  next();
});

module.exports = mongoose.model('FileTypeConfig', FileTypeConfigSchema);
