import { useState, useEffect } from 'react';
import { message } from 'antd';
import scheduleService from '../../../services/scheduleService';
import { useLanguage } from './useLanguage';

export const useScheduledTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  // 加载定时任务列表
  const loadTasks = async () => {
    setLoading(true);
    try {
      const configs = await scheduleService.getConfigs();
      
      // 确保 configs 是数组
      const configsArray = Array.isArray(configs) ? configs : [];
      
      // 转换为任务列表格式
      const decryptConfig = configsArray.find(c => c.taskType === 'decrypt');
      const transferConfig = configsArray.find(c => c.taskType === 'transfer');
      
      const taskList = [
        {
          id: 'decrypt',
          name: t('taskTypes.decrypt'),
          type: 'decrypt',
          enabled: decryptConfig?.enabled || false,
          cron: decryptConfig?.cron || '0 2 * * *',
          description: '自动解密Sabre数据文件',
          lastRun: decryptConfig?.lastRunAt || null,
          nextRun: decryptConfig?.nextRunAt || null
        },
        {
          id: 'transfer',
          name: t('taskTypes.transfer'),
          type: 'transfer',
          enabled: transferConfig?.enabled || false,
          cron: transferConfig?.cron || '0 3 * * *',
          description: '自动传输解密后的文件到SFTP服务器',
          lastRun: transferConfig?.lastRunAt || null,
          nextRun: transferConfig?.nextRunAt || null
        }
      ];
      
      setTasks(taskList);
    } catch (error) {
      message.error(t('messages.loadError'));
      console.error('Load scheduled tasks error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 更新定时任务
  const updateTask = async (taskType, taskData) => {
    try {
      const response = await scheduleService.update({
        taskType,
        cron: taskData.cron,
        enabled: taskData.enabled,
        params: taskData.params || {}
      });
      
      if (response?.success) {
        message.success(t('messages.updateSuccess'));
        await loadTasks();
        return { success: true };
      } else {
        message.error(t('messages.updateError'));
        return { success: false };
      }
    } catch (error) {
      message.error(t('messages.updateError'));
      console.error('Update scheduled task error:', error);
      return { success: false };
    }
  };

  // 立即执行任务
  const runTask = async (taskType) => {
    try {
      const response = await scheduleService.run({
        taskType,
        offsetDays: 1
      });
      
      if (response?.success) {
        message.success(t('messages.runSuccess'));
        return { success: true };
      } else {
        message.error(t('messages.runError'));
        return { success: false };
      }
    } catch (error) {
      message.error(t('messages.runError'));
      console.error('Run scheduled task error:', error);
      return { success: false };
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  return {
    tasks,
    loading,
    loadTasks,
    updateTask,
    runTask
  };
};
