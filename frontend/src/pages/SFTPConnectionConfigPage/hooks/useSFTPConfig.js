import { useState, useEffect } from 'react';
import { message } from 'antd';
import sftpService from '../../../services/sftpService';
import { useLanguage } from './useLanguage';

export const useSFTPConfig = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeConfig, setActiveConfig] = useState(null);
  const { t } = useLanguage();

  // 加载 SFTP 配置列表
  const loadConfigs = async () => {
    setLoading(true);
    try {
      const response = await sftpService.getFtpConfigs();
      setConfigs(response.data || []);
    } catch (error) {
      message.error(t('messages.loadError'));
      console.error('Load SFTP configs error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载当前激活的配置
  const loadActiveConfig = async () => {
    try {
      const response = await sftpService.getActiveFtpConfig();
      setActiveConfig(response.data);
    } catch (error) {
      console.error('Load active config error:', error);
    }
  };

  // 新增 SFTP 配置
  const createConfig = async (configData) => {
    try {
      const response = await sftpService.createFtpConfig(configData);
      if (response.success) {
        message.success(t('messages.createSuccess'));
        await loadConfigs();
        return { success: true };
      } else {
        message.error(response.message || t('messages.createError'));
        return { success: false };
      }
    } catch (error) {
      message.error(t('messages.createError'));
      console.error('Create SFTP config error:', error);
      return { success: false };
    }
  };

  // 更新 SFTP 配置
  const updateConfig = async (id, configData) => {
    try {
      const response = await sftpService.updateFtpConfig(id, configData);
      if (response.success) {
        message.success(t('messages.updateSuccess'));
        await loadConfigs();
        return { success: true };
      } else {
        message.error(response.message || t('messages.updateError'));
        return { success: false };
      }
    } catch (error) {
      message.error(t('messages.updateError'));
      console.error('Update SFTP config error:', error);
      return { success: false };
    }
  };

  // 删除 SFTP 配置
  const deleteConfig = async (id) => {
    try {
      const response = await sftpService.deleteFtpConfig(id);
      if (response.success) {
        message.success(t('messages.deleteSuccess'));
        await loadConfigs();
        return { success: true };
      } else {
        message.error(response.message || t('messages.deleteError'));
        return { success: false };
      }
    } catch (error) {
      message.error(t('messages.deleteError'));
      console.error('Delete SFTP config error:', error);
      return { success: false };
    }
  };

  // 启用 SFTP 配置
  const activateConfig = async (id) => {
    try {
      // 调用专门的激活接口，后端会处理取消其他激活状态
      const response = await sftpService.activateFtpConfig(id);
      if (response.success) {
        message.success(t('messages.activateSuccess'));
        await loadConfigs();
        await loadActiveConfig();
        return { success: true };
      } else {
        message.error(response.message || t('messages.activateError'));
        return { success: false };
      }
    } catch (error) {
      message.error(t('messages.activateError'));
      console.error('Activate SFTP config error:', error);
      return { success: false };
    }
  };

  // 测试 SFTP 连接
  const testConnection = async (configData) => {
    try {
      const response = await sftpService.testConnection(configData);
      if (response.success) {
        message.success(t('messages.testSuccess'));
        return { success: true };
      } else {
        message.error(response.message || t('messages.testError'));
        return { success: false };
      }
    } catch (error) {
      message.error(t('messages.testError'));
      console.error('Test SFTP connection error:', error);
      return { success: false };
    }
  };

  useEffect(() => {
    loadConfigs();
    loadActiveConfig();
  }, []);

  return {
    configs,
    loading,
    activeConfig,
    loadConfigs,
    loadActiveConfig,
    createConfig,
    updateConfig,
    deleteConfig,
    activateConfig,
    testConnection
  };
};
