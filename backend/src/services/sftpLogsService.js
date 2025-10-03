const TransferLogTask = require('../models/TransferLogTask');
const TransferLogRule = require('../models/TransferLogRule');
const TransferLogFile = require('../models/TransferLogFile');

async function getTaskList({ page = 1, pageSize = 20, startDate, endDate, status, sortBy = 'createdAt', sortOrder = 'desc' } = {}) {
  const query = {};
  if (startDate || endDate) { query.taskDate = {}; if (startDate) query.taskDate.$gte = new Date(startDate); if (endDate) query.taskDate.$lte = new Date(endDate); }
  if (status) query.status = status;
  const sort = {}; sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  const skip = (parseInt(page) - 1) * parseInt(pageSize); const limit = parseInt(pageSize);
  const [tasks, total] = await Promise.all([ TransferLogTask.find(query).sort(sort).skip(skip).limit(limit).lean(), TransferLogTask.countDocuments(query) ]);
  return { tasks, pagination: { current: parseInt(page), pageSize: parseInt(pageSize), total } };
}

async function getTaskDetail(taskId) {
  const task = await TransferLogTask.findById(taskId).lean();
  if (!task) return null;
  const rules = await TransferLogRule.find({ taskLogId: taskId }).populate('ruleId', 'name description module schedule.period').lean();
  const files = await TransferLogFile.find({ taskLogId: taskId }).populate('fileId', 'filename localPath').lean();
  return { task, rules, files };
}

async function getRuleList({ page = 1, pageSize = 20, taskLogId, ruleId, status, startDate, endDate, sortBy = 'createdAt', sortOrder = 'desc' } = {}) {
  const query = {};
  if (taskLogId) query.taskLogId = taskLogId;
  if (ruleId) query.ruleId = ruleId;
  if (status) query.status = status;
  if (startDate || endDate) { query.createdAt = {}; if (startDate) query.createdAt.$gte = new Date(startDate); if (endDate) query.createdAt.$lte = new Date(endDate); }
  const sort = {}; sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  const skip = (parseInt(page) - 1) * parseInt(pageSize); const limit = parseInt(pageSize);
  const [rules, total] = await Promise.all([
    TransferLogRule.find(query)
      .populate('taskLogId', 'taskDate startTime endTime status')
      .populate('ruleId', 'name description module')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    TransferLogRule.countDocuments(query)
  ]);
  return { rules, pagination: { current: parseInt(page), pageSize: parseInt(pageSize), total } };
}

async function getFileList({ page = 1, pageSize = 20, taskLogId, ruleLogId, status, fileName, startDate, endDate, sortBy = 'transferTime', sortOrder = 'desc' } = {}) {
  const query = {};
  if (taskLogId) query.taskLogId = taskLogId;
  if (ruleLogId) query.ruleLogId = ruleLogId;
  if (status) query.status = status;
  if (fileName) query.fileName = { $regex: fileName, $options: 'i' };
  if (startDate || endDate) { query.transferTime = {}; if (startDate) query.transferTime.$gte = new Date(startDate); if (endDate) query.transferTime.$lte = new Date(endDate); }
  const sort = {}; sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  const skip = (parseInt(page) - 1) * parseInt(pageSize); const limit = parseInt(pageSize);
  const [files, total] = await Promise.all([
    TransferLogFile.find(query)
      .populate('taskLogId', 'taskDate startTime endTime status')
      .populate('ruleLogId', 'ruleName module status')
      .populate('fileId', 'filename localPath fileSize')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    TransferLogFile.countDocuments(query)
  ]);
  return { files, pagination: { current: parseInt(page), pageSize: parseInt(pageSize), total } };
}

async function getStats({ startDate, endDate } = {}) {
  const dateQuery = {}; if (startDate || endDate) { dateQuery.taskDate = {}; if (startDate) dateQuery.taskDate.$gte = new Date(startDate); if (endDate) dateQuery.taskDate.$lte = new Date(endDate); }
  const taskStats = await TransferLogTask.aggregate([
    { $match: dateQuery },
    { $group: { _id: null, totalTasks: { $sum: 1 }, successTasks: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } }, failedTasks: { $sum: { $cond: [{ $eq: ['$status', 'fail'] }, 1, 0] } }, partialTasks: { $sum: { $cond: [{ $eq: ['$status', 'partial'] }, 1, 0] } }, totalFiles: { $sum: '$totalFiles' }, successFiles: { $sum: '$successCount' }, failedFiles: { $sum: '$failedCount' }, skippedFiles: { $sum: '$skippedCount' } } }
  ]);
  const fileStats = await TransferLogFile.aggregate([
    { $lookup: { from: 'transfer_log_tasks', localField: 'taskLogId', foreignField: '_id', as: 'task' } },
    { $unwind: { path: '$task', preserveNullAndEmptyArrays: true } },
    { $match: { 'task.taskDate': dateQuery.taskDate || { $exists: true } } },
    { $group: { _id: null, totalTransfers: { $sum: 1 }, successTransfers: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } }, failedTransfers: { $sum: { $cond: [{ $eq: ['$status', 'fail'] }, 1, 0] } } } }
  ]);
  return {
    tasks: taskStats[0] || { totalTasks: 0, successTasks: 0, failedTasks: 0, partialTasks: 0, totalFiles: 0, successFiles: 0, failedFiles: 0, skippedFiles: 0 },
    files: fileStats[0] || { totalTransfers: 0, successTransfers: 0, failedTransfers: 0 }
  };
}

module.exports = { getTaskList, getTaskDetail, getRuleList, getFileList, getStats };


