const { ScheduleConfig } = require('../models/ScheduleConfig');
const config = require('../config');

async function updateSchedule(taskType, payload) {
  const timezone = config.timezone?.timezone || 'Asia/Phnom_Penh';
  const updatedAt = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
  const updateData = { ...payload, updatedAt };
  const doc = await ScheduleConfig.findOneAndUpdate(
    { taskType },
    { $set: updateData },
    { new: true, upsert: true }
  );
  return doc;
}

module.exports = { updateSchedule };


