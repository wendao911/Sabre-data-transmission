// 定时任务配置页面专用翻译
export const scheduledTaskTranslations = {
  zh: {
    // 页面标题
    pageTitle: '定时任务配置',
    pageDescription: '管理系统的定时任务，包括数据解密和文件传输',
    
    // 任务类型
    taskTypes: {
      decrypt: 'Sabre Data解密',
      transfer: 'SFTP文件传输'
    },
    
    // 表格列标题
    taskName: '任务名称',
    taskType: '任务类型',
    enabled: '启用状态',
    cronExpression: '执行时间',
    lastRun: '上次执行',
    nextRun: '下次执行',
    actions: '操作',
    
    // 状态标签
    status: {
      enabled: '已启用',
      disabled: '已禁用'
    },
    
    // 时间状态
    neverRun: '从未执行',
    notScheduled: '未计划',
    
    // 操作按钮
    edit: '编辑',
    runNow: '立即执行',
    
    // 编辑表单
    editForm: {
      title: '编辑定时任务',
      taskName: '任务名称',
      cronExpression: 'Cron表达式',
      cronPlaceholder: '请输入Cron表达式，如：0 2 * * *',
      enabled: '启用任务',
      description: '任务描述',
      descriptionPlaceholder: '请输入任务描述（可选）'
    },
    
    // 按钮
    save: '保存',
    cancel: '取消',
    
    // 消息提示
    messages: {
      loadError: '加载定时任务失败',
      updateSuccess: '定时任务更新成功',
      updateError: '定时任务更新失败',
      runSuccess: '定时任务执行成功',
      runError: '定时任务执行失败',
      cronInvalid: 'Cron表达式格式不正确'
    },
    
    // 确认对话框
    confirmRun: '确定要立即执行这个定时任务吗？',
    confirmOk: '确定',
    confirmCancel: '取消',
    
    // Cron 表达式说明
    cronHelp: {
      title: 'Cron表达式说明',
      examples: [
        '0 2 * * * - 每天凌晨2点执行',
        '0 */6 * * * - 每6小时执行一次',
        '0 0 1 * * - 每月1号执行',
        '0 0 * * 1 - 每周一执行'
      ]
    }
  },
  en: {
    // Page title
    pageTitle: 'Scheduled Task Config',
    pageDescription: 'Manage system scheduled tasks including data decryption and file transfer',
    
    // Task types
    taskTypes: {
      decrypt: 'Sabre Data Decrypt',
      transfer: 'SFTP File Transfer'
    },
    
    // Table columns
    taskName: 'Task Name',
    taskType: 'Task Type',
    enabled: 'Status',
    cronExpression: 'Schedule',
    lastRun: 'Last Run',
    nextRun: 'Next Run',
    actions: 'Actions',
    
    // Status tags
    status: {
      enabled: 'Enabled',
      disabled: 'Disabled'
    },
    
    // Time status
    neverRun: 'Never run',
    notScheduled: 'Not scheduled',
    
    // Action buttons
    edit: 'Edit',
    runNow: 'Run Now',
    
    // Edit form
    editForm: {
      title: 'Edit Scheduled Task',
      taskName: 'Task Name',
      cronExpression: 'Cron Expression',
      cronPlaceholder: 'Enter cron expression, e.g.: 0 2 * * *',
      enabled: 'Enable Task',
      description: 'Description',
      descriptionPlaceholder: 'Enter task description (optional)'
    },
    
    // Buttons
    save: 'Save',
    cancel: 'Cancel',
    
    // Messages
    messages: {
      loadError: 'Failed to load scheduled tasks',
      updateSuccess: 'Scheduled task updated successfully',
      updateError: 'Failed to update scheduled task',
      runSuccess: 'Scheduled task executed successfully',
      runError: 'Failed to execute scheduled task',
      cronInvalid: 'Invalid cron expression format'
    },
    
    // Confirm dialogs
    confirmRun: 'Are you sure you want to run this scheduled task now?',
    confirmOk: 'OK',
    confirmCancel: 'Cancel',
    
    // Cron expression help
    cronHelp: {
      title: 'Cron Expression Help',
      examples: [
        '0 2 * * * - Run at 2:00 AM daily',
        '0 */6 * * * - Run every 6 hours',
        '0 0 1 * * - Run on 1st of every month',
        '0 0 * * 1 - Run every Monday'
      ]
    }
  }
};

// 获取翻译文本
export const getScheduledTaskTranslation = (key, language) => {
  const keys = key.split('.');
  let translation = scheduledTaskTranslations[language];

  for (const k of keys) {
    if (translation && typeof translation === 'object' && k in translation) {
      translation = translation[k];
    } else {
      // Fallback to default language (Chinese)
      translation = scheduledTaskTranslations['zh'];
      for (const k of keys) {
        if (translation && typeof translation === 'object' && k in translation) {
          translation = translation[k];
        } else {
          return key; // If translation not found, return original key
        }
      }
      break;
    }
  }

  return translation || key;
};
