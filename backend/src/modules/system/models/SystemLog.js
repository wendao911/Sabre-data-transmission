const mongoose = require('mongoose');

const system_log_schema = new mongoose.Schema({
  level: { type: String, enum: ['info', 'warn', 'error'], default: 'info' },
  module: { type: String, required: true, trim: true },
  action: { type: String, required: true, trim: true },
  message: { type: String, default: '' },
  details: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'system_logs' });

system_log_schema.index({ module: 1, action: 1, createdAt: -1 });

const SystemLog = mongoose.model('SystemLog', system_log_schema);

module.exports = { SystemLog };


