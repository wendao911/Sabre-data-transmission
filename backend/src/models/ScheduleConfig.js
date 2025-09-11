const mongoose = require('mongoose');

// 定时任务配置（单记录，按需要可以扩展多任务类型）
const ScheduleConfigSchema = new mongoose.Schema({
  // 任务类型：decrypt、copy、transfer（可扩展）
  taskType: { type: String, enum: ['decrypt', 'copy', 'transfer'], required: true },
  // Cron 表达式（例如 "0 3 * * *" 每天3点）或预设（例如 "everyHour"）
  cron: { type: String, required: true },
  // 是否启用
  enabled: { type: Boolean, default: false },
  // 运行时参数：例如 { mode: 'by-date', offsetDays: 1 }
  params: { type: Object, default: {} },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'config_schedule' });

module.exports = mongoose.model('ScheduleConfig', ScheduleConfigSchema);


