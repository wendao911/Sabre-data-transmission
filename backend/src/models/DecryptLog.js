const mongoose = require('mongoose');

// 解密日级日志：记录某天是否解密成功
const DecryptLogSchema = new mongoose.Schema({
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
}, { collection: 'logs_decrypt' });

module.exports = mongoose.model('DecryptLog', DecryptLogSchema);


