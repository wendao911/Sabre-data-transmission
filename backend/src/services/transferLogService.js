const TransferLog = require('../models/TransferLog');

/**
 * 写入某日传输结果日志（success/fail）到集合 logs_transfer
 * @param {string} date YYYYMMDD
 * @param {('success'|'fail')} status
 */
async function logTransferDayResult(date, status) {
  if (!/^[0-9]{8}$/.test(date)) throw new Error('Invalid date format');
  if (!['success', 'fail'].includes(status)) throw new Error('Invalid status');
  return TransferLog.create({ date, status });
}

module.exports = {
  logTransferDayResult
};


