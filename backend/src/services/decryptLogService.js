const mongoose = require('mongoose');
const DecryptLog = require('../models/DecryptLog');

/**
 * 记录某天解密结果（成功/失败）
 * @param {string} date YYYYMMDD
 * @param {('success'|'fail')} status
 */
async function logDayResult(date, status) {
  if (!/^[0-9]{8}$/.test(date)) throw new Error('Invalid date format');
  if (!['success', 'fail'].includes(status)) throw new Error('Invalid status');
  return DecryptLog.create({ date, status });
}

/**
 * 记录当天的文件解密失败到按日动态集合，例如：20250901_decrypt_err
 * @param {string} date YYYYMMDD
 * @param {string[]} failedFilenames 失败的文件名列表
 */
async function logFailedFiles(date, failedFilenames = []) {
  if (!/^[0-9]{8}$/.test(date)) throw new Error('Invalid date format');
  if (!Array.isArray(failedFilenames) || failedFilenames.length === 0) return;

  const collectionName = `logs_decrypt_err_${date}`;
  const schema = new mongoose.Schema({
    date: { type: String, required: true },
    filename: { type: String, required: true }
  }, { collection: collectionName });

  let DayErrorModel;
  try {
    DayErrorModel = mongoose.model(collectionName);
  } catch (e) {
    DayErrorModel = mongoose.model(collectionName, schema);
  }

  const docs = failedFilenames.map(name => ({ date, filename: name }));
  await DayErrorModel.insertMany(docs, { ordered: false });
}

module.exports = {
  logDayResult,
  logFailedFiles
};


