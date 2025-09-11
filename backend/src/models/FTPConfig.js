const mongoose = require('mongoose');

const FTPConfigSchema = new mongoose.Schema({
  host: { type: String, required: true },
  port: { type: Number, default: 21 },
  user: { type: String, default: '' },
  password: { type: String, default: '' },
  secure: { type: Boolean, default: false },
  userType: { type: String, default: 'authenticated' }, // 'anonymous' 或 'authenticated'
  status: { type: Number, default: 0 }, // 0: 未使用, 1: 正在使用
  name: { type: String, default: '' }, // 配置名称
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'config_ftp' });

module.exports = mongoose.model('FTPConfig', FTPConfigSchema);


