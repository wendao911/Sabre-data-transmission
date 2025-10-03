const mongoose = require('mongoose');

const DecryptLogSchema = new mongoose.Schema({
  date: { type: String, required: true, index: true },
  status: { type: String, enum: ['success', 'fail'], required: true },
  processedFiles: { type: Number, default: 0 },
  successFiles: { type: Number, default: 0 },
  failedFiles: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  message: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'decryp_logs' });

module.exports = mongoose.model('DecryptLog', DecryptLogSchema);


