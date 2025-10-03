import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { fileMappingService } from '../services/fileMappingService';

export const useFileMappingPage = () => {
  // 状态管理
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [enabled, setEnabled] = useState(undefined);
  const [matchType, setMatchType] = useState(undefined);
  
  // 模态框状态
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [viewingRule, setViewingRule] = useState(null);

  // 加载映射规则列表
  const loadRules = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        search: searchTerm,
        enabled,
        matchType
      };
      
      const result = await fileMappingService.getRules(params);
      if (result.success) {
        setRules(result.data.items || []);
        setPagination(prev => ({
          ...prev,
          total: result.data.total || 0
        }));
      } else {
        message.error(result.error || '加载映射规则失败');
      }
    } catch (error) {
      console.error('加载映射规则失败:', error);
      message.error('加载映射规则失败');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchTerm, enabled, matchType]);

  // 初始加载
  useEffect(() => {
    loadRules();
  }, [loadRules]);

  // 分页变化
  const handlePageChange = (page, pageSize) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize
    }));
  };


  // 切换启用状态过滤
  const handleToggleEnabled = (value) => {
    setEnabled(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // 切换匹配类型过滤
  const handleMatchTypeChange = (value) => {
    setMatchType(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // 刷新
  const handleRefresh = () => {
    loadRules();
  };

  // 创建映射规则
  const handleCreate = () => {
    setCreateModalVisible(true);
  };

  const handleCreateConfirm = async (ruleData) => {
    try {
      const result = await fileMappingService.createRule(ruleData);
      if (result.success) {
        message.success('映射规则创建成功');
        setCreateModalVisible(false);
        loadRules();
      } else {
        message.error(result.error || '创建映射规则失败');
      }
    } catch (error) {
      console.error('创建映射规则失败:', error);
      message.error('创建映射规则失败');
    }
  };

  const handleCreateCancel = () => {
    setCreateModalVisible(false);
  };

  // 查看映射规则
  const handleView = (rule) => {
    setViewingRule(rule);
    setViewModalVisible(true);
  };

  const handleViewCancel = () => {
    setViewModalVisible(false);
    setViewingRule(null);
  };

  // 编辑映射规则
  const handleEdit = (rule) => {
    setEditingRule(rule);
    setEditModalVisible(true);
  };

  const handleEditConfirm = async (ruleData) => {
    try {
      const result = await fileMappingService.updateRule(editingRule._id, ruleData);
      if (result.success) {
        message.success('映射规则更新成功');
        setEditModalVisible(false);
        setEditingRule(null);
        loadRules();
      } else {
        message.error(result.error || '更新映射规则失败');
      }
    } catch (error) {
      console.error('更新映射规则失败:', error);
      message.error('更新映射规则失败');
    }
  };

  const handleEditCancel = () => {
    setEditModalVisible(false);
    setEditingRule(null);
  };

  // 删除映射规则
  const handleDelete = async (rule) => {
    try {
      const result = await fileMappingService.deleteRule(rule._id);
      if (result.success) {
        message.success('映射规则删除成功');
        loadRules();
      } else {
        message.error(result.error || '删除映射规则失败');
      }
    } catch (error) {
      console.error('删除映射规则失败:', error);
      message.error('删除映射规则失败');
    }
  };


  // 切换规则启用状态
  const handleToggleRule = async (rule) => {
    try {
      const result = await fileMappingService.toggleRule(rule._id, !rule.enabled);
      if (result.success) {
        message.success(`映射规则已${rule.enabled ? '禁用' : '启用'}`);
        loadRules();
      } else {
        message.error(result.error || '切换规则状态失败');
      }
    } catch (error) {
      console.error('切换规则状态失败:', error);
      message.error('切换规则状态失败');
    }
  };

  // 更新规则优先级
  const handleUpdatePriority = async (rule, newPriority) => {
    try {
      const result = await fileMappingService.updatePriority(rule._id, newPriority);
      if (result.success) {
        message.success('优先级更新成功');
        loadRules();
      } else {
        message.error(result.error || '更新优先级失败');
      }
    } catch (error) {
      console.error('更新优先级失败:', error);
      message.error('更新优先级失败');
    }
  };


  return {
    // 状态
    rules,
    loading,
    pagination,
    searchTerm,
    enabled,
    matchType,
    createModalVisible,
    editModalVisible,
    viewModalVisible,
    editingRule,
    viewingRule,
    
    // 方法
    setSearchTerm,
    handlePageChange,
    handleToggleEnabled,
    handleMatchTypeChange,
    handleRefresh,
    handleCreate,
    handleCreateConfirm,
    handleCreateCancel,
    handleEdit,
    handleView,
    handleViewCancel,
    handleEditConfirm,
    handleEditCancel,
    handleDelete,
    handleToggleRule,
    handleUpdatePriority
  };
};
