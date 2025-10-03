const mongoose = require('mongoose');

const FileUploadLogSchema = new mongoose.Schema({
  // 原始文件名
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  
  // 保存后的文件名
  savedName: {
    type: String,
    required: true,
    trim: true
  },
  
  // 文件相对路径（相对于根目录）
  filePath: {
    type: String,
    required: true,
    trim: true
  },
  
  // 文件完整路径
  fullPath: {
    type: String,
    required: true,
    trim: true
  },
  
  // 文件大小（字节）
  fileSize: {
    type: Number,
    required: true,
    min: 0
  },
  
  // MIME类型
  mimeType: {
    type: String,
    required: true,
    trim: true
  },
  
  // 上传用户ID
  uploadedBy: {
    type: String,
    required: true,
    trim: true
  },
  
  // 上传用户名
  uploadedByName: {
    type: String,
    required: true,
    trim: true
  },
  
  // 上传时间
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  
  // 上传状态
  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success'
  },
  
  // 错误信息（如果上传失败）
  errorMessage: {
    type: String,
    trim: true
  },
  
  // 目标目录
  targetDirectory: {
    type: String,
    required: true,
    trim: true
  },
  
  // 文件扩展名
  fileExtension: {
    type: String,
    trim: true
  },
  
  // 备注
  remark: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // 文件类型配置ID
  fileTypeConfigId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FileTypeConfig'
  },
  
  // 文件类型配置信息（冗余存储，便于查询）
  fileTypeConfig: {
    module: {
      type: String,
      trim: true
    },
    fileType: {
      type: String,
      trim: true
    },
    pushPath: {
      type: String,
      trim: true
    }
  },
  
  // 是否已删除
  isDeleted: {
    type: Boolean,
    default: false
  },
  
  // 删除时间
  deletedAt: {
    type: Date
  },
  
  // 删除用户
  deletedBy: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  collection: 'file_upload_logs'
});

// 索引
FileUploadLogSchema.index({ uploadedBy: 1, uploadedAt: -1 });
FileUploadLogSchema.index({ filePath: 1 });
FileUploadLogSchema.index({ status: 1 });
FileUploadLogSchema.index({ uploadedAt: -1 });
FileUploadLogSchema.index({ isDeleted: 1 });

// 虚拟字段：文件大小格式化
FileUploadLogSchema.virtual('fileSizeFormatted').get(function() {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// 虚拟字段：上传时间格式化
FileUploadLogSchema.virtual('uploadedAtFormatted').get(function() {
  return this.uploadedAt.toLocaleString('zh-CN', {
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
FileUploadLogSchema.set('toJSON', { virtuals: true });
FileUploadLogSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('FileUploadLog', FileUploadLogSchema);
