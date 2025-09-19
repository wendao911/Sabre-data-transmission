const mongoose = require('mongoose');

const DecryptLogSchema = new mongoose.Schema({
  date: { type: String, required: true, index: true },
  status: { type: String, enum: ['success', 'fail'], required: true },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'logs_decrypt' });

module.exports = mongoose.model('DecryptLog', DecryptLogSchema);


