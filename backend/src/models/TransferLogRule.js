const mongoose = require('mongoose');

const transferLogRuleSchema = new mongoose.Schema({
  taskLogId: { type: mongoose.Schema.Types.ObjectId, ref: 'TransferLogTask', required: true },
  ruleId: { type: mongoose.Schema.Types.ObjectId, ref: 'FileMappingRule', required: true },
  ruleName: { type: String, required: true },
  module: { type: String },
  totalFiles: { type: Number, default: 0 },
  successCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 },
  skippedCount: { type: Number, default: 0 },
  status: { type: String, enum: ['success', 'fail', 'partial'], required: true },
  errorMessage: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true, collection: 'transfer_log_rule' });

transferLogRuleSchema.index({ taskLogId: 1 });
transferLogRuleSchema.index({ ruleId: 1 });
transferLogRuleSchema.index({ status: 1 });
transferLogRuleSchema.index({ createdAt: -1 });

const TransferLogRule = mongoose.models.TransferLogRule || mongoose.model('TransferLogRule', transferLogRuleSchema);

module.exports = TransferLogRule;


