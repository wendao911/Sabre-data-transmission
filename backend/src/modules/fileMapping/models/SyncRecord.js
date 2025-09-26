const mongoose = require('mongoose');

// 同步会话记录表 - 记录每次同步的整体情况
const sync_session_schema = new mongoose.Schema({
  syncDate: { type: Date, required: true }, // 同步日期
  startTime: { type: Date, required: true }, // 开始时间
  endTime: { type: Date, required: true }, // 结束时间
  duration: { type: Number, required: true }, // 持续时间（毫秒）
  totalRules: { type: Number, default: 0 }, // 总规则数
  totalFiles: { type: Number, default: 0 }, // 总文件数
  syncedFiles: { type: Number, default: 0 }, // 成功同步文件数
  skippedFiles: { type: Number, default: 0 }, // 跳过文件数
  failedFiles: { type: Number, default: 0 }, // 失败文件数
  status: { type: String, required: true, enum: ['success', 'partial', 'no_files', 'failed'] }, // 整体状态
  ruleResults: [{ // 每个规则的处理结果
    ruleId: { type: mongoose.Schema.Types.ObjectId, ref: 'FileMappingRule', required: true },
    ruleName: { type: String, required: true, trim: true },
    module: { type: String, required: true, trim: true },
    periodType: { type: String, required: true, enum: ['daily', 'weekly', 'monthly', 'adhoc'] },
    totalFiles: { type: Number, default: 0 },
    syncedFiles: { type: Number, default: 0 },
    skippedFiles: { type: Number, default: 0 },
    failedFiles: { type: Number, default: 0 },
    status: { type: String, required: true, enum: ['success', 'partial', 'no_files', 'failed', 'skipped'] },
    message: { type: String, default: '' }
  }],
  createdAt: { type: Date, default: Date.now }
}, { collection: 'sync_sessions' });

// 非固定周期文件同步记录表 - 防止重复同步
const adhoc_file_sync_schema = new mongoose.Schema({
  ruleId: { type: mongoose.Schema.Types.ObjectId, ref: 'FileMappingRule', required: true },
  ruleName: { type: String, required: true, trim: true },
  module: { type: String, required: true, trim: true },
  filename: { type: String, required: true, trim: true }, // 文件名
  localPath: { type: String, required: true, trim: true }, // 本地路径
  remotePath: { type: String, required: true, trim: true }, // 远程路径
  fileSize: { type: Number, default: 0 }, // 文件大小
  syncDate: { type: Date, required: true }, // 同步日期
  syncTime: { type: Date, required: true }, // 同步时间
  status: { type: String, required: true, enum: ['synced', 'failed'] },
  message: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'adhoc_file_syncs' });

// 索引
sync_session_schema.index({ syncDate: 1, startTime: 1 });
sync_session_schema.index({ status: 1, syncDate: 1 });

adhoc_file_sync_schema.index({ ruleId: 1, filename: 1 }, { unique: true }); // 防止重复同步
adhoc_file_sync_schema.index({ ruleId: 1, syncDate: 1 });
adhoc_file_sync_schema.index({ module: 1, syncDate: 1 });
adhoc_file_sync_schema.index({ status: 1, syncDate: 1 });

module.exports = {
  SyncSession: mongoose.model('SyncSession', sync_session_schema),
  AdhocFileSync: mongoose.model('AdhocFileSync', adhoc_file_sync_schema)
};


