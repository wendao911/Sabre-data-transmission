const express = require('express');
const router = express.Router();
const fileMappingService = require('../services/fileMappingService');

router.get('/', async (req, res) => {
  try {
    const { enabled, createdBy, sortBy, sortOrder } = req.query;
    const options = { enabled: enabled !== undefined ? enabled === 'true' : undefined, createdBy, sortBy, sortOrder: sortOrder ? parseInt(sortOrder) : -1 };
    const rules = await fileMappingService.getAllRules(options);
    res.json({ success: true, data: rules });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

router.get('/file-type-configs', async (req, res) => {
  try { const configs = await fileMappingService.getFileTypeConfigs(); res.json({ success: true, data: configs }); }
  catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

router.get('/:id', async (req, res) => {
  try { const rule = await fileMappingService.getRuleById(req.params.id); if (!rule) return res.status(404).json({ success: false, error: '映射规则不存在' }); res.json({ success: true, data: rule }); }
  catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

router.post('/', async (req, res) => {
  try {
    const validationErrors = fileMappingService.validateRuleData(req.body);
    if (validationErrors.length > 0) return res.status(400).json({ success: false, error: '数据验证失败', details: validationErrors });
    const existingRule = await fileMappingService.checkDescriptionExists(req.body.description);
    if (existingRule) return res.status(400).json({ success: false, error: '规则描述已存在' });
    const rule = await fileMappingService.createRule(req.body);
    res.status(201).json({ success: true, data: rule });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const validationErrors = fileMappingService.validateRuleData(req.body);
    if (validationErrors.length > 0) return res.status(400).json({ success: false, error: '数据验证失败', details: validationErrors });
    const existingRule = await fileMappingService.checkDescriptionExists(req.body.description, req.params.id);
    if (existingRule) return res.status(400).json({ success: false, error: '规则描述已存在' });
    const rule = await fileMappingService.updateRule(req.params.id, req.body);
    if (!rule) return res.status(404).json({ success: false, error: '映射规则不存在' });
    res.json({ success: true, data: rule });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

router.delete('/:id', async (req, res) => {
  try { const rule = await fileMappingService.deleteRule(req.params.id); if (!rule) return res.status(404).json({ success: false, error: '映射规则不存在' }); res.json({ success: true, message: '映射规则删除成功' }); }
  catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

router.delete('/', async (req, res) => {
  try { const { ids } = req.body; if (!ids || !Array.isArray(ids) || ids.length === 0) return res.status(400).json({ success: false, error: '请提供要删除的规则ID列表' }); const result = await fileMappingService.deleteRules(ids); res.json({ success: true, message: `成功删除 ${result.deletedCount} 个映射规则` }); }
  catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

router.patch('/:id/toggle', async (req, res) => {
  try { const { enabled } = req.body; if (typeof enabled !== 'boolean') return res.status(400).json({ success: false, error: 'enabled 字段必须是布尔值' }); const rule = await fileMappingService.toggleRule(req.params.id, enabled); if (!rule) return res.status(404).json({ success: false, error: '映射规则不存在' }); res.json({ success: true, data: rule }); }
  catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

router.patch('/:id/priority', async (req, res) => {
  try { const { priority } = req.body; if (typeof priority !== 'number' || priority < 1 || priority > 1000) return res.status(400).json({ success: false, error: '优先级必须是1-1000之间的数字' }); const rule = await fileMappingService.updatePriority(req.params.id, priority); if (!rule) return res.status(404).json({ success: false, error: '映射规则不存在' }); res.json({ success: true, data: rule }); }
  catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

router.get('/enabled/list', async (req, res) => {
  try { const rules = await fileMappingService.getEnabledRules(); res.json({ success: true, data: rules }); }
  catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

module.exports = router;


