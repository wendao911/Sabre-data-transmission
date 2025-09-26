const { ScheduleConfig } = require('../models');
const config = require('../../../config');

async function updateSchedule(taskType, payload) {
  // 仅做配置持久化，不承担定时执行
  const timezone = config.timezone?.timezone || 'Asia/Phnom_Penh';
  const updatedAt = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
  const updateData = {
    ...payload,
    updatedAt,
    // 由外部调度体系处理 nextRunAt/lastRunAt，这里不维护
  };
  const doc = await ScheduleConfig.findOneAndUpdate(
    { taskType },
    { $set: updateData },
    { new: true, upsert: true }
  );
  return doc;
}

module.exports = { updateSchedule };


