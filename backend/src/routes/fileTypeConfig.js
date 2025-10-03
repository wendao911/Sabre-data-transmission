const express = require('express');
const router = express.Router();
const svc = require('../services/fileTypeConfigService');

// 获取文件类型配置列表
router.get('/', async (req, res) => {
  try {
    const data = await svc.listConfigs(req.query);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取文件类型配置列表失败' });
  }
});

// 获取单个文件类型配置
router.get('/:id', async (req, res) => {
  try {
    const config = await svc.getConfigById(req.params.id);
    if (!config) return res.status(404).json({ success: false, error: '文件类型配置不存在' });
    res.json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取文件类型配置失败' });
  }
});

// 创建文件类型配置
router.post('/', async (req, res) => {
  try {
    const config = await svc.createConfig(req.body, req.headers['x-user-name'] || 'system');
    res.status(201).json({ success: true, data: config, message: '文件类型配置创建成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || '创建文件类型配置失败' });
  }
});

// 更新文件类型配置
router.put('/:id', async (req, res) => {
  try {
    const updatedConfig = await svc.updateConfig(req.params.id, req.body, req.headers['x-user-name'] || 'system');
    res.json({ success: true, data: updatedConfig, message: '文件类型配置更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || '更新文件类型配置失败' });
  }
});

// 删除文件类型配置
router.delete('/:id', async (req, res) => {
  try {
    await svc.deleteConfig(req.params.id);
    res.json({ success: true, message: '文件类型配置删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: '删除文件类型配置失败' });
  }
});

// 批量删除
router.delete('/batch', async (req, res) => {
  try {
    const { ids } = req.body;
    const deleted = await svc.batchDelete(ids);
    res.json({ success: true, message: `成功删除 ${deleted} 个文件类型配置` });
  } catch (error) {
    res.status(500).json({ success: false, error: '批量删除文件类型配置失败' });
  }
});

// 获取模块列表
router.get('/modules', async (req, res) => {
  try {
    res.json({ success: true, data: svc.listModules() });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取模块列表失败' });
  }
});

module.exports = router;


