const mongoose = require('mongoose');

const syncRecordSchema = new mongoose.Schema({
  ruleId: { type: mongoose.Schema.Types.ObjectId, ref: 'FileMappingRule', required: true },
  filename: { type: String, required: true, trim: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  createdAt: { type: Date, default: Date.now }
}, { collection: 'file_mapping_sync_records' });

syncRecordSchema.index({ ruleId: 1, filename: 1 }, { unique: true });

module.exports = mongoose.model('SyncRecord', syncRecordSchema);


