import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { fileTypeConfigService } from '../services/fileTypeConfigService';
import { useLanguage } from './useLanguage';

export const useFileTypeConfigPage = () => {
  const { t } = useLanguage();
  
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [configs, setConfigs] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  
  // 模态框状态
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);

  // 模块选项
  const moduleOptions = [
    { value: 'SAL', label: 'SAL' },
    { value: 'UPL', label: 'UPL' },
    { value: 'OWB', label: 'OWB' },
    { value: 'IWB', label: 'IWB' },
    { value: 'MAS', label: 'MAS' },
    { value: 'OTHER', label: t('moduleOther') }
  ];

  // 加载数据
  const loadConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        pageSize
      };
      
      const response = await fileTypeConfigService.getConfigs(params);
      
      if (response.success) {
        setConfigs(response.data.configs);
        setTotal(response.data.pagination.total);
      } else {
        message.error(response.error || '加载数据失败');
      }
    } catch (error) {
      console.error('加载文件类型配置失败:', error);
      message.error('加载数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  // 初始加载
  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  // 添加配置
  const handleAdd = () => {
    setIsAddModalVisible(true);
  };

  // 编辑配置
  const handleEdit = (record) => {
    setEditingConfig(record);
    setIsEditModalVisible(true);
  };

  // 删除配置
  const handleDelete = async (id) => {
    try {
      const response = await fileTypeConfigService.deleteConfig(id);
      
      if (response.success) {
        message.success('删除成功');
        loadConfigs();
      } else {
        message.error(response.error || '删除失败');
      }
    } catch (error) {
      console.error('删除文件类型配置失败:', error);
      message.error('删除失败，请稍后重试');
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的配置');
      return;
    }

    try {
      const response = await fileTypeConfigService.batchDeleteConfigs(selectedRowKeys);
      
      if (response.success) {
        message.success(response.message);
        setSelectedRowKeys([]);
        loadConfigs();
      } else {
        message.error(response.error || '批量删除失败');
      }
    } catch (error) {
      console.error('批量删除失败:', error);
      message.error('批量删除失败，请稍后重试');
    }
  };

  // 提交添加
  const handleAddSubmit = async (values) => {
    try {
      console.log('提交的数据:', values);
      const response = await fileTypeConfigService.createConfig(values);
      
      if (response.success) {
        message.success('添加成功');
        setIsAddModalVisible(false);
        loadConfigs();
      } else {
        message.error(response.error || '添加失败');
      }
    } catch (error) {
      console.error('添加文件类型配置失败:', error);
      const errorMessage = error.response?.data?.error || error.message || '添加失败，请稍后重试';
      message.error(errorMessage);
    }
  };

  // 提交编辑
  const handleEditSubmit = async (values) => {
    try {
      console.log('更新数据:', values);
      const response = await fileTypeConfigService.updateConfig(editingConfig._id, values);
      
      if (response.success) {
        message.success('更新成功');
        setIsEditModalVisible(false);
        loadConfigs();
      } else {
        message.error(response.error || '更新失败');
      }
    } catch (error) {
      console.error('更新文件类型配置失败:', error);
      const errorMessage = error.response?.data?.error || error.message || '更新失败，请稍后重试';
      message.error(errorMessage);
    }
  };

  // 关闭模态框
  const handleAddCancel = () => {
    setIsAddModalVisible(false);
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setEditingConfig(null);
  };

  return {
    // 状态
    loading,
    configs,
    total,
    currentPage,
    pageSize,
    selectedRowKeys,
    isAddModalVisible,
    isEditModalVisible,
    editingConfig,
    moduleOptions,
    
    // 方法
    loadConfigs,
    handleAdd,
    handleEdit,
    handleDelete,
    handleBatchDelete,
    handleAddSubmit,
    handleEditSubmit,
    handleAddCancel,
    handleEditCancel,
    setCurrentPage,
    setPageSize,
    setSelectedRowKeys
  };
};
