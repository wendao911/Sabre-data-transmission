export const homePageTranslations = {
  zh: {
    // 页面标题
    pageTitle: '仪表盘',
    pageSubtitle: '系统概览和快速操作',
    
    // 定时任务相关
    scheduledTasks: '定时任务状态',
    taskType: '任务类型',
    cronExpression: 'Cron 表达式',
    enabled: '启用',
    disabled: '停用',
    nextRunTime: '下次运行时间',
    lastUpdateTime: '最近更新时间',
    actions: '操作',
    runNow: '立即运行',
    refresh: '刷新',
    run: '运行',
    running: '运行中',
    
    // 任务类型
    taskTypeDecrypt: '文件解密',
    taskTypeTransfer: 'SFTP传输',
    
    // 文件传输日志
    transferLogs: '文件传输日志',
    viewDetails: '查看详情',
    time: '时间',
    status: '状态',
    fileStats: '文件统计',
    total: '总计',
    success: '成功',
    skipped: '跳过',
    failed: '失败',
    successRate: '成功率',
    noTransferLogs: '暂无传输日志',
    
    // 状态
    statusSuccess: '成功',
    statusPartial: '部分成功',
    statusFailed: '失败',
    statusSkipped: '跳过',
    
    // 消息
    messageLoadFailed: '加载定时任务失败',
    messageTaskTriggered: '已触发任务运行',
    messageTriggerFailed: '触发失败',
  },
  en: {
    // Page Title
    pageTitle: 'Dashboard',
    pageSubtitle: 'System Overview and Quick Actions',
    
    // Scheduled Tasks
    scheduledTasks: 'Scheduled Tasks Status',
    taskType: 'Task Type',
    cronExpression: 'Cron Expression',
    enabled: 'Enabled',
    disabled: 'Disabled',
    nextRunTime: 'Next Run Time',
    lastUpdateTime: 'Last Update Time',
    actions: 'Actions',
    runNow: 'Run Now',
    refresh: 'Refresh',
    run: 'Run',
    running: 'Running',
    
    // Task Types
    taskTypeDecrypt: 'File Decrypt',
    taskTypeTransfer: 'SFTP Transfer',
    
    // Transfer Logs
    transferLogs: 'File Transfer Logs',
    viewDetails: 'View Details',
    time: 'Time',
    status: 'Status',
    fileStats: 'File Statistics',
    total: 'Total',
    success: 'Success',
    skipped: 'Skipped',
    failed: 'Failed',
    successRate: 'Success Rate',
    noTransferLogs: 'No Transfer Logs',
    
    // Status
    statusSuccess: 'Success',
    statusPartial: 'Partial Success',
    statusFailed: 'Failed',
    statusSkipped: 'Skipped',
    
    // Messages
    messageLoadFailed: 'Failed to load scheduled tasks',
    messageTaskTriggered: 'Task triggered successfully',
    messageTriggerFailed: 'Failed to trigger task',
  }
};

export const getHomePageTranslation = (key, language, params = {}) => {
  const translation = homePageTranslations[language]?.[key];
  if (translation) {
    let result = translation;
    for (const paramKey in params) {
      result = result.replace(`{${paramKey}}`, params[paramKey]);
    }
    return result;
  }
  return key;
};
