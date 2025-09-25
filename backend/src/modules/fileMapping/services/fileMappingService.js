const FileMappingRule = require('../models/FileMappingRule');

class FileMappingService {
  // 获取所有映射规则
  async getAllRules(options = {}) {
    const { page = 1, pageSize = 10, search, enabled, createdBy, sortBy = 'priority', sortOrder = -1 } = options;
    
    const query = {};
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { 'source.directory': { $regex: search, $options: 'i' } },
        { 'source.pattern': { $regex: search, $options: 'i' } },
        { 'destination.path': { $regex: search, $options: 'i' } },
        { 'destination.filename': { $regex: search, $options: 'i' } }
      ];
    }
    if (enabled !== undefined) query.enabled = enabled;
    if (createdBy) query.createdBy = createdBy;
    
    const sort = {};
    sort[sortBy] = sortOrder;
    
    const skip = (page - 1) * pageSize;
    const limit = parseInt(pageSize);
    
    const [items, total] = await Promise.all([
      FileMappingRule.find(query).sort(sort).skip(skip).limit(limit),
      FileMappingRule.countDocuments(query)
    ]);
    
    return {
      items,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    };
  }
  
  // 根据ID获取映射规则
  async getRuleById(id) {
    return await FileMappingRule.findById(id);
  }
  
  // 创建映射规则
  async createRule(ruleData) {
    const rule = new FileMappingRule(ruleData);
    return await rule.save();
  }
  
  // 更新映射规则
  async updateRule(id, updateData) {
    return await FileMappingRule.findByIdAndUpdate(
      id, 
      { ...updateData, updated: new Date() }, 
      { new: true, runValidators: true }
    );
  }
  
  // 删除映射规则
  async deleteRule(id) {
    return await FileMappingRule.findByIdAndDelete(id);
  }
  
  // 批量删除映射规则
  async deleteRules(ids) {
    return await FileMappingRule.deleteMany({ _id: { $in: ids } });
  }
  
  // 启用/禁用映射规则
  async toggleRule(id, enabled) {
    return await FileMappingRule.findByIdAndUpdate(
      id, 
      { enabled, updated: new Date() }, 
      { new: true }
    );
  }
  
  // 更新规则优先级
  async updatePriority(id, priority) {
    return await FileMappingRule.findByIdAndUpdate(
      id, 
      { priority, updated: new Date() }, 
      { new: true }
    );
  }
  
  // 获取启用的映射规则（按优先级排序）
  async getEnabledRules() {
    return await FileMappingRule.find({ enabled: true }).sort({ priority: -1 });
  }
  
  // 验证映射规则数据
  validateRuleData(ruleData) {
    const errors = [];
    
    // 验证基本信息
    if (!ruleData.description || ruleData.description.trim().length === 0) {
      errors.push('规则描述不能为空');
    }
    
    if (!ruleData.module || !['SAL', 'UPL', 'OWB', 'IWB', 'MAS'].includes(ruleData.module)) {
      errors.push('所属模块必须选择SAL、UPL、OWB、IWB、MAS中的一个');
    }
    
    if (ruleData.priority && (ruleData.priority < 1 || ruleData.priority > 1000)) {
      errors.push('优先级必须在1-1000之间');
    }
    
    // 验证源配置
    if (!ruleData.source) {
      errors.push('源配置不能为空');
    } else {
      if (!ruleData.source.directory || ruleData.source.directory.trim().length === 0) {
        errors.push('源目录不能为空');
      }
      if (!ruleData.source.pattern || ruleData.source.pattern.trim().length === 0) {
        errors.push('源文件模式不能为空');
      }
    }
    
    // 验证目标配置
    if (!ruleData.destination) {
      errors.push('目标配置不能为空');
    } else {
      if (!ruleData.destination.path || ruleData.destination.path.trim().length === 0) {
        errors.push('目标路径不能为空');
      }
      if (!ruleData.destination.filename || ruleData.destination.filename.trim().length === 0) {
        errors.push('目标文件名模板不能为空');
      }
      if (ruleData.destination.conflict && !['overwrite', 'rename', 'skip'].includes(ruleData.destination.conflict)) {
        errors.push('冲突处理策略必须是 overwrite、rename 或 skip');
      }
    }
    
    // 验证重试配置
    if (ruleData.retry) {
      if (ruleData.retry.attempts && (ruleData.retry.attempts < 0 || ruleData.retry.attempts > 10)) {
        errors.push('重试次数必须在0-10之间');
      }
      if (ruleData.retry.delay && !['linear', 'exponential'].includes(ruleData.retry.delay)) {
        errors.push('重试延迟策略必须是 linear 或 exponential');
      }
    }
    
    return errors;
  }
  
  // 检查规则名称是否重复
  async checkDescriptionExists(description, excludeId = null) {
    const query = { description: description.trim() };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return await FileMappingRule.findOne(query);
  }
}

module.exports = new FileMappingService();
