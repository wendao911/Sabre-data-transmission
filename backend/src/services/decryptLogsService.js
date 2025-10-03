const { DecryptLog } = require('../models/DecryptLog');

async function listLogs({ page = 1, pageSize = 20, startDate, endDate, status, searchText, sortBy = 'createdAt', sortOrder = -1 } = {}) {
  const query = {};
  if (status) query.status = status;
  if (startDate || endDate) { query.createdAt = {}; if (startDate) query.createdAt.$gte = new Date(startDate); if (endDate) query.createdAt.$lte = new Date(endDate); }
  if (searchText) query.$or = [{ date: { $regex: searchText, $options: 'i' } }, { status: { $regex: searchText, $options: 'i' } }];
  const skip = (page - 1) * pageSize;
  const sort = { [sortBy]: parseInt(sortOrder) };
  const [logs, total] = await Promise.all([
    DecryptLog.find(query).sort(sort).skip(skip).limit(parseInt(pageSize)).lean(),
    DecryptLog.countDocuments(query)
  ]);
  return { logs, pagination: { current: parseInt(page), pageSize: parseInt(pageSize), total, pages: Math.ceil(total / pageSize) } };
}

async function getStats({ startDate, endDate } = {}) {
  const matchQuery = {};
  if (startDate || endDate) { matchQuery.createdAt = {}; if (startDate) matchQuery.createdAt.$gte = new Date(startDate); if (endDate) matchQuery.createdAt.$lte = new Date(endDate); }
  const stats = await DecryptLog.aggregate([{ $match: matchQuery }, { $group: { _id: '$status', count: { $sum: 1 } } }]);
  const result = { total: 0, success: 0, failed: 0 };
  stats.forEach(stat => { result.total += stat.count; if (stat._id === 'success') result.success = stat.count; else if (stat._id === 'fail') result.failed = stat.count; });
  return result;
}

module.exports = { listLogs, getStats };


