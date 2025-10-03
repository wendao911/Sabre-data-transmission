const mongoose = require('mongoose');

const transferLogRuleSchema = new mongoose.Schema({
  // 关联主日志
  taskLogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TransferLogTask',
    required: true,
    comment: '关联主日志ID'
  },
  
  // 规则信息
  ruleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FileMappingRule',
    required: true,
    comment: '规则ID'
  },
  ruleName: {
    type: String,
    required: true,
    comment: '规则名称'
  },
  module: {
    type: String,
    comment: '模块'
  },
  
  // 统计信息
  totalFiles: {
    type: Number,
    default: 0,
    comment: '总文件数'
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
    comment: '规则执行状态'
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
  collection: 'transfer_log_rule'
});

// 索引
transferLogRuleSchema.index({ taskLogId: 1 });
transferLogRuleSchema.index({ ruleId: 1 });
transferLogRuleSchema.index({ status: 1 });
transferLogRuleSchema.index({ createdAt: -1 });

module.exports = mongoose.model('TransferLogRule', transferLogRuleSchema);
