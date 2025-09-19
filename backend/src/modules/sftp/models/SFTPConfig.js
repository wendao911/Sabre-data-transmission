const mongoose = require('mongoose');

const SFTPConfigSchema = new mongoose.Schema({
  host: { type: String, required: true },
  port: { type: Number, default: 21 },
  sftpPort: { type: Number, default: 22 },
  user: { type: String, default: '' },
  password: { type: String, default: '' },
  secure: { type: Boolean, default: false },
  protocol: { type: String, enum: ['ftp', 'ftps', 'sftp'], default: 'ftp' },
  userType: { type: String, default: 'authenticated' },
  status: { type: Number, default: 0 },
  name: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'config_sftp' });

// 预保存钩子：确保只有一个激活的配置
SFTPConfigSchema.pre('save', async function(next) {
  if (this.status === 1) {
    // 如果当前配置要激活，先取消其他配置的激活状态
    await this.constructor.updateMany(
      { _id: { $ne: this._id } }, 
      { status: 0 }
    );
  }
  next();
});

module.exports = mongoose.model('SFTPConfig', SFTPConfigSchema);


