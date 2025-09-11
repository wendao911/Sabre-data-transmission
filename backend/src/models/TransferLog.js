const mongoose = require('mongoose');

// 解密文件FTP同步的日级日志（按天汇总）
const TransferLogSchema = new mongoose.Schema({
  date: { // YYYYMMDD
    type: String,
    required: true,
    index: true
  },
  status: { // success | fail
    type: String,
    enum: ['success', 'fail'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { collection: 'logs_transfer' });

module.exports = mongoose.model('TransferLog', TransferLogSchema);


