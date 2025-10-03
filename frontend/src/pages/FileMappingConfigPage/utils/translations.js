// 文件映射页面专用翻译
export const fileMappingTranslations = {
  zh: {
    // 页面标题和描述
    pageTitle: '文件映射管理',
    pageDescription: '管理文件映射规则，定义源文件到目标路径的映射关系',
    
    // 工具栏
    search: '搜索规则',
    searchPlaceholder: '输入规则描述或路径进行搜索',
    sortBy: '排序方式',
    priority: '优先级',
    created: '创建时间',
    updated: '更新时间',
    enabled: '启用状态',
    all: '全部',
    enabledOnly: '仅启用',
    disabledOnly: '仅禁用',
    refresh: '刷新',
    create: '新建规则',
    batchDelete: '批量删除',
    
    // 表格列
    description: '规则描述',
    module: '所属模块',
    matchType: '匹配类型',
    sourceDirectory: '源目录',
    sourcePattern: '源文件模式',
    fileTypeConfig: '文件类型配置',
    destinationPath: '目标路径',
    destinationFilename: '目标文件名',
    conflictStrategy: '冲突策略',
    retryAttempts: '重试次数',
    retryDelay: '重试延迟',
    createdBy: '创建者',
    operation: '操作',
    
    // 操作按钮
    edit: '编辑',
    delete: '删除',
    enable: '启用',
    disable: '禁用',
    view: '查看',
    
    // 查看模态框
    viewRuleDetails: '查看规则详情',
    enabledTag: '已启用',
    disabledTag: '已禁用',
    formView: '表单视图',
    jsonView: 'JSON视图',
    
    // 冲突策略
    overwrite: '覆盖',
    rename: '重命名',
    skip: '跳过',
    
    // 重试延迟策略
    linear: '线性',
    exponential: '指数',
    
    // 状态
    enabled: '已启用',
    disabled: '已禁用',
    
    // 配置分组
    sourceConfig: '源配置',
    destinationConfig: '目标配置',
    retryConfig: '重试配置',
    
    // 消息提示
    createSuccess: '映射规则创建成功',
    createFailed: '创建映射规则失败',
    updateSuccess: '映射规则更新成功',
    updateFailed: '更新映射规则失败',
    deleteSuccess: '映射规则删除成功',
    deleteFailed: '删除映射规则失败',
    batchDeleteSuccess: '批量删除成功',
    batchDeleteFailed: '批量删除失败',
    toggleSuccess: '规则状态切换成功',
    toggleFailed: '规则状态切换失败',
    priorityUpdateSuccess: '优先级更新成功',
    priorityUpdateFailed: '优先级更新失败',
    loadRulesFailed: '加载映射规则失败',
    
    // 确认对话框
    confirmDelete: '确认删除',
    confirmDeleteMessage: '确定要删除这个映射规则吗？删除后无法恢复。',
    confirmBatchDelete: '确认批量删除',
    confirmBatchDeleteMessage: '确定要删除选中的 {count} 个映射规则吗？删除后无法恢复。',
    
    // 表单验证
    descriptionRequired: '规则描述不能为空',
    moduleRequired: '所属模块不能为空',
    matchTypeRequired: '匹配类型不能为空',
    sourceDirectoryRequired: '源目录不能为空',
    sourcePatternRequired: '源文件模式不能为空',
    fileTypeConfigRequired: '文件类型配置不能为空',
    destinationPathRequired: '目标路径不能为空',
    destinationFilenameRequired: '目标文件名模板不能为空',
    priorityRequired: '优先级不能为空',
    priorityRange: '优先级必须在1-1000之间',
    retryAttemptsRange: '重试次数必须在0-10之间',
    
    // 分页
    totalRules: '共 {total} 个规则',
    pageSize: '条/页',
    goTo: '跳至',
    page: '页'
  },
  
  en: {
    // Page title and description
    pageTitle: 'File Mapping Management',
    pageDescription: 'Manage file mapping rules, define mapping relationships from source files to target paths',
    
    // Toolbar
    search: 'Search Rules',
    searchPlaceholder: 'Enter rule description or path to search',
    sortBy: 'Sort By',
    priority: 'Priority',
    created: 'Created',
    updated: 'Updated',
    enabled: 'Status',
    all: 'All',
    enabledOnly: 'Enabled Only',
    disabledOnly: 'Disabled Only',
    refresh: 'Refresh',
    create: 'Create Rule',
    batchDelete: 'Batch Delete',
    
    // Table columns
    description: 'Description',
    module: 'Module',
    matchType: 'Match Type',
    sourceDirectory: 'Source Directory',
    sourcePattern: 'Source Pattern',
    fileTypeConfig: 'File Type Config',
    destinationPath: 'Destination Path',
    destinationFilename: 'Destination Filename',
    conflictStrategy: 'Conflict Strategy',
    retryAttempts: 'Retry Attempts',
    retryDelay: 'Retry Delay',
    createdBy: 'Created By',
    operation: 'Operation',
    
    // Action buttons
    edit: 'Edit',
    delete: 'Delete',
    enable: 'Enable',
    disable: 'Disable',
    view: 'View',
    
    // View modal
    viewRuleDetails: 'View Rule Details',
    enabledTag: 'Enabled',
    disabledTag: 'Disabled',
    formView: 'Form View',
    jsonView: 'JSON View',
    
    // Conflict strategies
    overwrite: 'Overwrite',
    rename: 'Rename',
    skip: 'Skip',
    
    // Retry delay strategies
    linear: 'Linear',
    exponential: 'Exponential',
    
    // Status
    enabled: 'Enabled',
    disabled: 'Disabled',
    
    // Configuration groups
    sourceConfig: 'Source Configuration',
    destinationConfig: 'Destination Configuration',
    retryConfig: 'Retry Configuration',
    
    // Message prompts
    createSuccess: 'Mapping rule created successfully',
    createFailed: 'Failed to create mapping rule',
    updateSuccess: 'Mapping rule updated successfully',
    updateFailed: 'Failed to update mapping rule',
    deleteSuccess: 'Mapping rule deleted successfully',
    deleteFailed: 'Failed to delete mapping rule',
    batchDeleteSuccess: 'Batch delete successful',
    batchDeleteFailed: 'Batch delete failed',
    toggleSuccess: 'Rule status toggled successfully',
    toggleFailed: 'Failed to toggle rule status',
    priorityUpdateSuccess: 'Priority updated successfully',
    priorityUpdateFailed: 'Failed to update priority',
    loadRulesFailed: 'Failed to load mapping rules',
    
    // Confirmation dialogs
    confirmDelete: 'Confirm Delete',
    confirmDeleteMessage: 'Are you sure you want to delete this mapping rule? This action cannot be undone.',
    confirmBatchDelete: 'Confirm Batch Delete',
    confirmBatchDeleteMessage: 'Are you sure you want to delete {count} selected mapping rules? This action cannot be undone.',
    
    // Form validation
    descriptionRequired: 'Rule description is required',
    moduleRequired: 'Module is required',
    matchTypeRequired: 'Match type is required',
    sourceDirectoryRequired: 'Source directory is required',
    sourcePatternRequired: 'Source pattern is required',
    fileTypeConfigRequired: 'File type config is required',
    destinationPathRequired: 'Destination path is required',
    destinationFilenameRequired: 'Destination filename template is required',
    priorityRequired: 'Priority is required',
    priorityRange: 'Priority must be between 1 and 1000',
    retryAttemptsRange: 'Retry attempts must be between 0 and 10',
    
    // Pagination
    totalRules: 'Total {total} rules',
    pageSize: '/ page',
    goTo: 'Go to',
    page: 'Page'
  }
};

// 获取翻译文本
export const getFileMappingTranslation = (key, language, params = {}) => {
  const translation = fileMappingTranslations[language]?.[key] || key;
  
  // 处理参数替换
  if (params && Object.keys(params).length > 0) {
    return translation.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey] || match;
    });
  }
  
  return translation;
};
