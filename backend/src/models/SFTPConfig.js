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

SFTPConfigSchema.pre('save', async function(next) {
  if (this.status === 1) {
    await this.constructor.updateMany({ _id: { $ne: this._id } }, { status: 0 });
  }
  next();
});

const SFTPConfig = mongoose.models.SFTPConfig || mongoose.model('SFTPConfig', SFTPConfigSchema);

module.exports = { SFTPConfig };


