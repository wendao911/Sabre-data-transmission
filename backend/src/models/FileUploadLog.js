const mongoose = require('mongoose');

const FileUploadLogSchema = new mongoose.Schema({
  originalName: { type: String, required: true, trim: true },
  savedName: { type: String, required: true, trim: true },
  filePath: { type: String, required: true, trim: true },
  fullPath: { type: String, required: true, trim: true },
  fileSize: { type: Number, required: true, min: 0 },
  mimeType: { type: String, required: true, trim: true },
  uploadedBy: { type: String, required: true, trim: true },
  uploadedByName: { type: String, required: true, trim: true },
  uploadedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['success', 'failed'], default: 'success' },
  errorMessage: { type: String, trim: true },
  targetDirectory: { type: String, required: true, trim: true },
  fileExtension: { type: String, trim: true },
  remark: { type: String, trim: true, maxlength: 500 },
  fileTypeConfigId: { type: mongoose.Schema.Types.ObjectId, ref: 'FileTypeConfig' },
  fileTypeConfig: {
    module: { type: String, trim: true },
    fileType: { type: String, trim: true },
    pushPath: { type: String, trim: true }
  },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  deletedBy: { type: String, trim: true }
}, { timestamps: true, collection: 'file_upload_logs' });

FileUploadLogSchema.index({ uploadedBy: 1, uploadedAt: -1 });
FileUploadLogSchema.index({ filePath: 1 });
FileUploadLogSchema.index({ status: 1 });
FileUploadLogSchema.index({ uploadedAt: -1 });
FileUploadLogSchema.index({ isDeleted: 1 });

FileUploadLogSchema.virtual('fileSizeFormatted').get(function() {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

FileUploadLogSchema.virtual('uploadedAtFormatted').get(function() {
  return this.uploadedAt.toLocaleString('zh-CN', { timeZone: 'Asia/Phnom_Penh', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
});

const FileUploadLog = mongoose.models.FileUploadLog || mongoose.model('FileUploadLog', FileUploadLogSchema);

module.exports = { FileUploadLog };


