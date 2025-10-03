const mongoose = require('mongoose');

const transferLogTaskSchema = new mongoose.Schema({
  // 任务基本信息
  taskDate: {
    type: Date,
    required: true,
    comment: '任务执行日期'
  },
  startTime: {
    type: Date,
    required: true,
    comment: '任务开始时间'
  },
  endTime: {
    type: Date,
    comment: '任务结束时间'
  },
  duration: {
    type: Number,
    comment: '总时长（毫秒）'
  },
  
  // 统计信息
  totalRules: {
    type: Number,
    default: 0,
    comment: '涉及的规则数'
  },
  totalFiles: {
    type: Number,
    default: 0,
    comment: '涉及的总文件数'
  },
  successCount: {
    type: Number,
    default: 0,
    comment: '成功数'
  },
  failedCount: {
    type: Number,
    default: 0,
    comment: '失败数'
  },
  skippedCount: {
    type: Number,
    default: 0,
    comment: '跳过数'
  },
  
  // 状态
  status: {
    type: String,
    enum: ['success', 'fail', 'partial'],
    required: true,
    comment: '任务状态'
  },
  
  // 错误信息
  errorMessage: {
    type: String,
    comment: '错误信息'
  },
  
  // 创建时间
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'transfer_log_task'
});

// 索引
transferLogTaskSchema.index({ taskDate: -1 });
transferLogTaskSchema.index({ status: 1 });
transferLogTaskSchema.index({ createdAt: -1 });

module.exports = mongoose.model('TransferLogTask', transferLogTaskSchema);
