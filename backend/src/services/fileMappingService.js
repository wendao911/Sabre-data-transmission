const { FileMappingRule } = require('../models/FileMappingRule');

class FileMappingService {
  async getAllRules(options = {}) {
    const { page = 1, pageSize = 10, search, enabled, matchType, createdBy, sortBy = 'priority', sortOrder = -1 } = options;
    const query = {};
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { 'source.directory': { $regex: search, $options: 'i' } },
        { 'source.pattern': { $regex: search, $options: 'i' } },
        { 'destination.path': { $regex: search, $options: 'i' } },
        { 'destination.filename': { $regex: search, $options: 'i' } },
        { matchType: { $regex: search, $options: 'i' } }
      ];
    }
    if (enabled !== undefined) query.enabled = enabled;
    if (matchType) query.matchType = matchType;
    if (createdBy) query.createdBy = createdBy;
    const sort = {}; sort[sortBy] = sortOrder; const skip = (page - 1) * pageSize; const limit = parseInt(pageSize);
    const [items, total] = await Promise.all([
      FileMappingRule.find(query).populate('source.fileTypeConfig', 'module fileType pushPath').sort(sort).skip(skip).limit(limit),
      FileMappingRule.countDocuments(query)
    ]);
    return { items, total, page: parseInt(page), pageSize: parseInt(pageSize) };
  }

  async getRuleById(id) { return await FileMappingRule.findById(id).populate('source.fileTypeConfig', 'module fileType pushPath'); }
  async createRule(ruleData) { const rule = new FileMappingRule(ruleData); return await rule.save(); }
  async updateRule(id, updateData) { return await FileMappingRule.findByIdAndUpdate(id, { ...updateData, updated: new Date() }, { new: true, runValidators: true }); }
  async deleteRule(id) { return await FileMappingRule.findByIdAndDelete(id); }
  async deleteRules(ids) { return await FileMappingRule.deleteMany({ _id: { $in: ids } }); }
  async toggleRule(id, enabled) { return await FileMappingRule.findByIdAndUpdate(id, { enabled, updated: new Date() }, { new: true }); }
  async updatePriority(id, priority) { return await FileMappingRule.findByIdAndUpdate(id, { priority, updated: new Date() }, { new: true }); }
  async getEnabledRules() { return await FileMappingRule.find({ enabled: true }).populate('source.fileTypeConfig', 'module fileType pushPath').sort({ priority: -1 }); }
  validateRuleData(ruleData) {
    const errors = [];
    if (!ruleData.description || ruleData.description.trim().length === 0) errors.push('规则描述不能为空');
    if (!ruleData.module || !['SAL', 'UPL', 'OWB', 'IWB', 'MAS'].includes(ruleData.module)) errors.push('所属模块必须选择SAL、UPL、OWB、IWB、MAS中的一个');
    if (ruleData.priority && (ruleData.priority < 1 || ruleData.priority > 1000)) errors.push('优先级必须在1-1000之间');
    if (!ruleData.matchType || !['filename', 'filetype'].includes(ruleData.matchType)) errors.push('匹配类型必须是 filename 或 filetype');
    if (!ruleData.source) errors.push('源配置不能为空');
    else {
      if (!ruleData.source.directory || ruleData.source.directory.trim().length === 0) errors.push('源目录不能为空');
      if (ruleData.matchType === 'filename') { if (!ruleData.source.pattern || ruleData.source.pattern.trim().length === 0) errors.push('源文件模式不能为空'); }
      else if (ruleData.matchType === 'filetype') { if (!ruleData.source.fileTypeConfig) errors.push('文件类型配置不能为空'); }
    }
    if (!ruleData.destination) errors.push('目标配置不能为空');
    else {
      if (!ruleData.destination.path || ruleData.destination.path.trim().length === 0) errors.push('目标路径不能为空');
      if (!ruleData.destination.filename || ruleData.destination.filename.trim().length === 0) errors.push('目标文件名模板不能为空');
      if (ruleData.destination.conflict && !['overwrite', 'rename', 'skip'].includes(ruleData.destination.conflict)) errors.push('冲突处理策略必须是 overwrite、rename 或 skip');
    }
    if (ruleData.retry) {
      if (ruleData.retry.attempts && (ruleData.retry.attempts < 0 || ruleData.retry.attempts > 10)) errors.push('重试次数必须在0-10之间');
      if (ruleData.retry.delay && !['linear', 'exponential'].includes(ruleData.retry.delay)) errors.push('重试延迟策略必须是 linear 或 exponential');
    }
    return errors;
  }
  async checkDescriptionExists(description, excludeId = null) { const query = { description: description.trim() }; if (excludeId) query._id = { $ne: excludeId }; return await FileMappingRule.findOne(query); }
  async getFileTypeConfigs() { const FileTypeConfig = require('../models/FileTypeConfig'); return await FileTypeConfig.find({ isDeleted: { $ne: true }, enabled: true }).select('_id module fileType pushPath').sort({ module: 1, fileType: 1 }); }
}

module.exports = new FileMappingService();


