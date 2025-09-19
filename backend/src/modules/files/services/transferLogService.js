const { TransferLog } = require('../models');

async function logTransferDayResult(date, fileCount, status) {
  if (!/^[0-9]{8}$/.test(date)) throw new Error('Invalid date format');
  if (!['success', 'fail'].includes(status)) throw new Error('Invalid status');
  return TransferLog.create({ date, fileCount, status });
}

module.exports = { logTransferDayResult };


