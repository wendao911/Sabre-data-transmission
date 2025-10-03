const mongoose = require('mongoose');

const transferLogTaskSchema = new mongoose.Schema({
  taskDate: { type: String, required: true, validate: { validator: function(v){ return /^\d{8}$/.test(v); }, message: 'taskDate must be in YYYYMMDD format' } },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number },
  totalRules: { type: Number, default: 0 },
  totalFiles: { type: Number, default: 0 },
  successCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 },
  skippedCount: { type: Number, default: 0 },
  status: { type: String, enum: ['success', 'fail', 'partial'], required: true },
  errorMessage: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true, collection: 'transfer_log_task' });

transferLogTaskSchema.index({ taskDate: -1 });
transferLogTaskSchema.index({ status: 1 });
transferLogTaskSchema.index({ createdAt: -1 });

const TransferLogTask = mongoose.models.TransferLogTask || mongoose.model('TransferLogTask', transferLogTaskSchema);

module.exports = TransferLogTask;


