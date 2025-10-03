const mongoose = require('mongoose');

const transferLogFileSchema = new mongoose.Schema({
  taskLogId: { type: mongoose.Schema.Types.ObjectId, ref: 'TransferLogTask', required: true },
  ruleLogId: { type: mongoose.Schema.Types.ObjectId, ref: 'TransferLogRule', required: true },
  fileName: { type: String, required: true },
  fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'FileUploadLog' },
  localPath: { type: String },
  remotePath: { type: String },
  fileSize: { type: Number },
  status: { type: String, enum: ['success', 'fail'], required: true },
  errorMessage: { type: String },
  transferTime: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true, collection: 'transfer_log_file' });

transferLogFileSchema.index({ taskLogId: 1 });
transferLogFileSchema.index({ ruleLogId: 1 });
transferLogFileSchema.index({ fileName: 1 });
transferLogFileSchema.index({ status: 1 });
transferLogFileSchema.index({ transferTime: -1 });

const TransferLogFile = mongoose.models.TransferLogFile || mongoose.model('TransferLogFile', transferLogFileSchema);

module.exports = TransferLogFile;


