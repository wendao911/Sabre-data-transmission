const mongoose = require('mongoose');

const ScheduleConfigSchema = new mongoose.Schema({
  taskType: { type: String, enum: ['decrypt', 'copy', 'transfer'], required: true },
  cron: { type: String, required: true },
  enabled: { type: Boolean, default: false },
  params: { type: Object, default: {} },
  lastRunAt: { type: Date, default: null },
  nextRunAt: { type: Date, default: null },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'config_schedule' });

module.exports = mongoose.model('ScheduleConfig', ScheduleConfigSchema);


