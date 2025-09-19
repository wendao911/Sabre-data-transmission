const mongoose = require('mongoose');

const TransferLogSchema = new mongoose.Schema({
  date: { type: String, required: true, index: true },
  status: { type: String, enum: ['success', 'fail'], required: true },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'logs_transfer' });

module.exports = mongoose.model('TransferLog', TransferLogSchema);


