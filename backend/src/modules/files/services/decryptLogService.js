const mongoose = require('mongoose');
const { DecryptLog } = require('../../decrypt/models');

async function logDayResult(date, status) {
  if (!/^[0-9]{8}$/.test(date)) throw new Error('Invalid date format');
  if (!['success', 'fail'].includes(status)) throw new Error('Invalid status');
  return DecryptLog.create({ date, status });
}

async function logFailedFiles(date, failedFilenames = []) {
  if (!/^[0-9]{8}$/.test(date)) throw new Error('Invalid date format');
  if (!Array.isArray(failedFilenames) || failedFilenames.length === 0) return;
  const collectionName = `logs_decrypt_err_${date}`;
  const schema = new mongoose.Schema({ date: { type: String, required: true }, filename: { type: String, required: true } }, { collection: collectionName });
  let DayErrorModel;
  try { DayErrorModel = mongoose.model(collectionName); }
  catch (e) { DayErrorModel = mongoose.model(collectionName, schema); }
  const docs = failedFilenames.map(name => ({ date, filename: name }));
  await DayErrorModel.insertMany(docs, { ordered: false });
}

module.exports = { logDayResult, logFailedFiles };


