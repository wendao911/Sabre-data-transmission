const express = require('express');
const router = express.Router();
const ScheduleConfig = require('../models/ScheduleConfig');
const { updateSchedule, runTask } = require('../services/schedulerService');
const FTPConfig = require('../models/FTPConfig');

// 获取全部任务配置
router.get('/', async (req, res) => {
  try {
    const configs = await ScheduleConfig.find({});
    res.json({ success: true, data: configs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 更新指定任务配置（taskType: decrypt | copy）
router.post('/update', async (req, res) => {
  try {
    const { taskType, cron, enabled, params } = req.body || {};
    if (!taskType || !cron) {
      return res.status(400).json({ success: false, error: 'taskType 与 cron 为必填' });
    }
    const updated = await updateSchedule(taskType, { cron, enabled: !!enabled, params: params || {} });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

// 获取所有 FTP 配置
router.get('/ftp-config', async (req, res) => {
  try {
    const configs = await FTPConfig.find({}).sort({ updatedAt: -1 });
    res.json({ success: true, data: configs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 获取当前使用的 FTP 配置
router.get('/ftp-config/active', async (req, res) => {
  try {
    const cfg = await FTPConfig.findOne({ status: 1 });
    res.json({ success: true, data: cfg });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 创建或更新 FTP 配置（按名称唯一性）
router.post('/ftp-config', async (req, res) => {
  try {
    const { host, port, user, password, secure, name, userType } = req.body || {};
    if (!host) return res.status(400).json({ success: false, error: 'host 必填' });
    
    const configName = name || `${host}:${port || 21}`;
    
    // 查找是否存在相同名称的配置
    const existingConfig = await FTPConfig.findOne({ name: configName });
    
    if (existingConfig) {
      // 如果存在，更新现有配置
      const updated = await FTPConfig.findByIdAndUpdate(
        existingConfig._id,
        {
          host,
          port: port || 21,
          user: user || '',
          password: password || '',
          secure: secure || false,
          userType: userType || 'authenticated',
          name: configName,
          updatedAt: new Date()
        },
        { new: true }
      );
      res.json({ success: true, data: updated, isUpdate: true });
    } else {
      // 如果不存在，创建新配置
      const newConfig = new FTPConfig({
        host,
        port: port || 21,
        user: user || '',
        password: password || '',
        secure: secure || false,
        userType: userType || 'authenticated',
        name: configName,
        status: 0,
        updatedAt: new Date()
      });
      
      const saved = await newConfig.save();
      res.json({ success: true, data: saved, isUpdate: false });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 更新 FTP 配置
router.put('/ftp-config/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { host, port, user, password, secure, name, userType } = req.body || {};
    if (!host) return res.status(400).json({ success: false, error: 'host 必填' });
    
    const updated = await FTPConfig.findByIdAndUpdate(
      id,
      { host, port, user, password, secure, name, userType, updatedAt: new Date() },
      { new: true }
    );
    
    if (!updated) return res.status(404).json({ success: false, error: '配置不存在' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 设置 FTP 配置为活跃状态
router.post('/ftp-config/:id/activate', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 先将所有配置设为非活跃状态
    await FTPConfig.updateMany({}, { status: 0 });
    
    // 设置指定配置为活跃状态
    const activated = await FTPConfig.findByIdAndUpdate(
      id,
      { status: 1, updatedAt: new Date() },
      { new: true }
    );
    
    if (!activated) return res.status(404).json({ success: false, error: '配置不存在' });
    res.json({ success: true, data: activated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 删除 FTP 配置
router.delete('/ftp-config/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await FTPConfig.findByIdAndDelete(id);
    
    if (!deleted) return res.status(404).json({ success: false, error: '配置不存在' });
    res.json({ success: true, data: deleted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 手动触发某任务（taskType: decrypt | transfer）
router.post('/run', async (req, res) => {
  try {
    const { taskType, offsetDays } = req.body || {};
    if (!taskType) return res.status(400).json({ success: false, error: 'taskType 必填' });
    await runTask({ taskType, params: { offsetDays: offsetDays || 1 } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


