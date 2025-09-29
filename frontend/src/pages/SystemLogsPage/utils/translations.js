// 系统日志页面翻译
export const systemLogsTranslations = {
  zh: {
    // 页面标题
    systemLogs: '系统日志',
    systemLogsDescription: '查看系统运行状态、文件解密和传输日志',
    
    
    // 标签页
    systemLogsTab: '系统日志',
    decryptLogsTab: '文件解密日志',
    transferLogsTab: '文件传输日志',
    
    // 表格列
    colTime: '时间',
    colLevel: '级别',
    colModule: '模块',
    colAction: '操作',
    colMessage: '消息',
    colDetails: '详情',
    colDate: '日期',
    colStatus: '状态',
    colCreatedTime: '创建时间',
    colSyncDate: '同步日期',
    colDuration: '耗时',
    colTotalFiles: '总文件数',
    colSynced: '已同步',
    colSkipped: '已跳过',
    colFailed: '失败',
    colActions: '操作',
    
    // 状态
    success: '成功',
    failed: '失败',
    statusSuccess: '成功',
    statusPartial: '部分成功',
    statusNoFiles: '无文件',
    statusFailed: '失败',
    statusSkipped: '跳过',
    status_success: '成功',
    status_partial: '部分成功',
    status_no_files: '无文件',
    status_failed: '失败',
    status_skipped: '跳过',
    
    // 筛选器
    selectLevel: '选择级别',
    selectModule: '选择模块',
    selectStatus: '选择状态',
    searchMessage: '搜索消息内容',
    searchDate: '搜索日期',
    searchSyncDate: '搜索同步日期',
    search: '搜索',
    refresh: '刷新',
    reset: '重置',
    
    // 筛选器说明
    systemLogFilterDesc: '筛选系统运行日志，可按级别、模块、时间范围和消息内容进行筛选',
    decryptLogFilterDesc: '筛选文件解密日志，可按状态、时间范围和日期进行筛选',
    transferLogFilterDesc: '筛选文件传输日志，可按状态、时间范围和同步日期进行筛选',
    
    // 筛选字段标签
    filterByLevel: '按级别筛选',
    filterByModule: '按模块筛选',
    filterByStatus: '按状态筛选',
    filterByDateRange: '按日期范围筛选',
    searchInMessage: '在消息中搜索',
    searchInDate: '在日期中搜索',
    searchInSyncDate: '在同步日期中搜索',
    
    // 操作
    view: '查看',
    viewDetails: '查看详情',
    close: '关闭',
    
    // 模态框
    systemLogDetails: '系统日志详情',
    technicalDetails: '技术详情',
    
    // 传输详情
    transferDetails: '传输详情',
    sessionOverview: '会话概览',
    fileStatistics: '文件统计',
    ruleResults: '规则结果',
    failedFilesDetails: '失败文件详情',
    sessionDetails: '会话详情',
    filename: '文件名',
    localPath: '本地路径',
    remotePath: '远程路径',
    fileSize: '文件大小',
    errorMessage: '错误信息',
    startTime: '开始时间',
    endTime: '结束时间',
    
    // 分页
    itemsPerPage: '条/页',
    totalItems: '共 {total} 条',
    currentPage: '第 {current} 页',
    
    // 详情
    logDetails: '日志详情',
    close: '关闭',
    copy: '复制',
    download: '下载',
    
    // 传输日志详情
    transferDetails: '传输详情',
    sessionOverview: '会话概览',
    fileStatistics: '文件统计',
    successRate: '成功率',
    startTime: '开始时间',
    endTime: '结束时间',
    totalRules: '总规则数',
    createdAt: '创建时间',
    ruleResults: '规则结果',
    sessionDetails: '会话详情',
    ruleName: '规则名称',
    module: '模块',
    periodType: '周期类型',
    totalFiles: '总文件数',
    syncedFiles: '已同步',
    skippedFiles: '已跳过',
    failedFiles: '失败',
    message: '消息',
    failedFilesDetails: '失败文件详情',
    filename: '文件名',
    localPath: '本地路径',
    remotePath: '远程路径',
    errorMessage: '错误信息',
    fileSize: '文件大小',
    
    // 空状态
    noData: '暂无数据',
    noLogsFound: '未找到日志记录',
    tryRefresh: '尝试刷新页面',
    
    // 错误信息
    loadFailed: '加载失败',
    retry: '重试',
  },
  en: {
    // Page title
    systemLogs: 'System Logs',
    systemLogsDescription: 'View system status, file decryption and transfer logs',
    
    
    // Tabs
    systemLogsTab: 'System Logs',
    decryptLogsTab: 'Decrypt Logs',
    transferLogsTab: 'Transfer Logs',
    
    // Table columns
    colTime: 'Time',
    colLevel: 'Level',
    colModule: 'Module',
    colAction: 'Action',
    colMessage: 'Message',
    colDetails: 'Details',
    colDate: 'Date',
    colStatus: 'Status',
    colCreatedTime: 'Created Time',
    colSyncDate: 'Sync Date',
    colDuration: 'Duration',
    colTotalFiles: 'Total Files',
    colSynced: 'Synced',
    colSkipped: 'Skipped',
    colFailed: 'Failed',
    colActions: 'Actions',
    
    // Status
    success: 'Success',
    failed: 'Failed',
    statusSuccess: 'Success',
    statusPartial: 'Partial',
    statusNoFiles: 'No Files',
    statusFailed: 'Failed',
    statusSkipped: 'Skipped',
    status_success: 'Success',
    status_partial: 'Partial',
    status_no_files: 'No Files',
    status_failed: 'Failed',
    status_skipped: 'Skipped',
    
    // Filters
    selectLevel: 'Select Level',
    selectModule: 'Select Module',
    selectStatus: 'Select Status',
    searchMessage: 'Search message content',
    searchDate: 'Search date',
    searchSyncDate: 'Search sync date',
    search: 'Search',
    refresh: 'Refresh',
    reset: 'Reset',
    
    // Filter descriptions
    systemLogFilterDesc: 'Filter system logs by level, module, date range and message content',
    decryptLogFilterDesc: 'Filter decryption logs by status, date range and date',
    transferLogFilterDesc: 'Filter transfer logs by status, date range and sync date',
    
    // Filter field labels
    filterByLevel: 'Filter by Level',
    filterByModule: 'Filter by Module',
    filterByStatus: 'Filter by Status',
    filterByDateRange: 'Filter by Date Range',
    searchInMessage: 'Search in Message',
    searchInDate: 'Search in Date',
    searchInSyncDate: 'Search in Sync Date',
    
    // Actions
    view: 'View',
    viewDetails: 'View Details',
    close: 'Close',
    
    // Modal
    systemLogDetails: 'System Log Details',
    technicalDetails: 'Technical Details',
    
    // Transfer Details
    transferDetails: 'Transfer Details',
    sessionOverview: 'Session Overview',
    fileStatistics: 'File Statistics',
    ruleResults: 'Rule Results',
    failedFilesDetails: 'Failed Files Details',
    sessionDetails: 'Session Details',
    filename: 'Filename',
    localPath: 'Local Path',
    remotePath: 'Remote Path',
    fileSize: 'File Size',
    errorMessage: 'Error Message',
    startTime: 'Start Time',
    endTime: 'End Time',
    
    // Pagination
    itemsPerPage: 'items/page',
    totalItems: 'Total {total} items',
    currentPage: 'Page {current}',
    
    // Details
    logDetails: 'Log Details',
    close: 'Close',
    copy: 'Copy',
    download: 'Download',
    
    // Transfer log details
    transferDetails: 'Transfer Details',
    sessionOverview: 'Session Overview',
    fileStatistics: 'File Statistics',
    successRate: 'Success Rate',
    startTime: 'Start Time',
    endTime: 'End Time',
    totalRules: 'Total Rules',
    createdAt: 'Created At',
    ruleResults: 'Rule Results',
    sessionDetails: 'Session Details',
    ruleName: 'Rule Name',
    module: 'Module',
    periodType: 'Period Type',
    totalFiles: 'Total Files',
    syncedFiles: 'Synced Files',
    skippedFiles: 'Skipped Files',
    failedFiles: 'Failed Files',
    message: 'Message',
    failedFilesDetails: 'Failed Files Details',
    filename: 'Filename',
    localPath: 'Local Path',
    remotePath: 'Remote Path',
    errorMessage: 'Error Message',
    fileSize: 'File Size',
    
    // Empty states
    noData: 'No Data',
    noLogsFound: 'No logs found',
    tryRefresh: 'Try refreshing the page',
    
    // Error messages
    loadFailed: 'Load Failed',
    retry: 'Retry',
  }
};

// 获取翻译文本
export const getSystemLogsTranslation = (key, language, params = {}) => {
  let translation = systemLogsTranslations[language]?.[key] || key;
  
  // 替换参数
  Object.keys(params).forEach(param => {
    translation = translation.replace(`{${param}}`, params[param]);
  });
  
  return translation;
};
