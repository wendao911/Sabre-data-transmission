const mongoose = require('mongoose');

const transferLogFileSchema = new mongoose.Schema({
  // 关联主日志和规则日志
  taskLogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TransferLogTask',
    required: true,
    comment: '关联主日志ID'
  },
  ruleLogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TransferLogRule',
    required: true,
    comment: '关联规则日志ID'
  },
  
  // 文件信息
  fileName: {
    type: String,
    required: true,
    comment: '原文件名'
  },
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FileUploadLog',
    comment: '原文件ID（如有）'
  },
  localPath: {
    type: String,
    comment: '本地文件路径'
  },
  remotePath: {
    type: String,
    comment: '远程文件路径'
  },
  fileSize: {
    type: Number,
    comment: '文件大小（字节）'
  },
  
  // 状态
  status: {
    type: String,
    enum: ['success', 'fail'],
    required: true,
    comment: '文件传输状态'
  },
  
  // 错误信息
  errorMessage: {
    type: String,
    comment: '错误信息'
  },
  
  // 传输时间
  transferTime: {
    type: Date,
    default: Date.now,
    comment: '传输时间'
  },
  
  // 创建时间
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'transfer_log_file'
});

// 索引
transferLogFileSchema.index({ taskLogId: 1 });
transferLogFileSchema.index({ ruleLogId: 1 });
transferLogFileSchema.index({ fileName: 1 });
transferLogFileSchema.index({ status: 1 });
transferLogFileSchema.index({ transferTime: -1 });

module.exports = mongoose.model('TransferLogFile', transferLogFileSchema);
