// SFTP 连接配置页面专用翻译
export const sftpConfigTranslations = {
  zh: {
    // 页面标题
    pageTitle: 'SFTP连接配置',
    pageDescription: '配置SFTP服务器连接参数',
    
    // 工具栏
    addConfig: '新增配置',
    refresh: '刷新',
    totalConfigs: '共 {count} 个配置',
    
    // 表格列标题
    configName: '配置名称',
    serverAddress: '服务器地址',
    username: '用户名',
    status: '状态',
    updateTime: '更新时间',
    actions: '操作',
    
    // 状态标签
    active: '当前激活',
    enabled: '已启用',
    disabled: '未启用',
    
    // 操作按钮
    testConnection: '测试连接',
    edit: '编辑',
    activate: '启用',
    delete: '删除',
    
    // 表单
    formTitle: {
      create: '新增 SFTP 配置',
      edit: '编辑 SFTP 配置'
    },
    formFields: {
      configName: '配置名称',
      configNamePlaceholder: '请输入配置名称',
      description: '配置描述',
      descriptionPlaceholder: '请输入配置描述（可选）',
      serverAddress: '服务器地址',
      serverAddressPlaceholder: '请输入服务器地址',
      sftpPort: 'SFTP端口',
      sftpPortPlaceholder: '请输入SFTP端口号',
      username: '用户名',
      usernamePlaceholder: '请输入用户名',
      password: '密码',
      passwordPlaceholder: '请输入密码',
      secureConnection: '安全连接',
      userType: '用户类型',
      userTypePlaceholder: '请选择用户类型',
      status: '状态',
      statusPlaceholder: '请选择状态'
    },
    formOptions: {
      userType: {
        authenticated: '已认证',
        anonymous: '匿名'
      },
      status: {
        enabled: '启用',
        disabled: '禁用'
      }
    },
    
    // 按钮
    testConnectionBtn: '测试连接',
    cancel: '取消',
    create: '创建',
    update: '更新',
    
    // 消息提示
    messages: {
      createSuccess: 'SFTP 配置创建成功',
      updateSuccess: 'SFTP 配置更新成功',
      deleteSuccess: 'SFTP 配置删除成功',
      activateSuccess: 'SFTP 配置已启用',
      testSuccess: 'SFTP 连接测试成功',
      createError: '创建 SFTP 配置失败',
      updateError: '更新 SFTP 配置失败',
      deleteError: '删除 SFTP 配置失败',
      activateError: '启用 SFTP 配置失败',
      testError: 'SFTP 连接测试失败',
      loadError: '加载 SFTP 配置失败'
    },
    
    // 确认对话框
    confirmDelete: '确定要删除这个 SFTP 配置吗？',
    confirmOk: '确定',
    confirmCancel: '取消'
  },
  en: {
    // Page title
    pageTitle: 'SFTP Connection Config',
    pageDescription: 'Configure SFTP server connection parameters',
    
    // Toolbar
    addConfig: 'Add Config',
    refresh: 'Refresh',
    totalConfigs: 'Total {count} configs',
    
    // Table columns
    configName: 'Config Name',
    serverAddress: 'Server Address',
    username: 'Username',
    status: 'Status',
    updateTime: 'Update Time',
    actions: 'Actions',
    
    // Status tags
    active: 'Active',
    enabled: 'Enabled',
    disabled: 'Disabled',
    
    // Action buttons
    testConnection: 'Test Connection',
    edit: 'Edit',
    activate: 'Activate',
    delete: 'Delete',
    
    // Form
    formTitle: {
      create: 'Add SFTP Config',
      edit: 'Edit SFTP Config'
    },
    formFields: {
      configName: 'Config Name',
      configNamePlaceholder: 'Enter config name',
      description: 'Description',
      descriptionPlaceholder: 'Enter description (optional)',
      serverAddress: 'Server Address',
      serverAddressPlaceholder: 'Enter server address',
      sftpPort: 'SFTP Port',
      sftpPortPlaceholder: 'Enter SFTP port number',
      username: 'Username',
      usernamePlaceholder: 'Enter username',
      password: 'Password',
      passwordPlaceholder: 'Enter password',
      secureConnection: 'Secure Connection',
      userType: 'User Type',
      userTypePlaceholder: 'Select user type',
      status: 'Status',
      statusPlaceholder: 'Select status'
    },
    formOptions: {
      userType: {
        authenticated: 'Authenticated',
        anonymous: 'Anonymous'
      },
      status: {
        enabled: 'Enabled',
        disabled: 'Disabled'
      }
    },
    
    // Buttons
    testConnectionBtn: 'Test Connection',
    cancel: 'Cancel',
    create: 'Create',
    update: 'Update',
    
    // Messages
    messages: {
      createSuccess: 'SFTP config created successfully',
      updateSuccess: 'SFTP config updated successfully',
      deleteSuccess: 'SFTP config deleted successfully',
      activateSuccess: 'SFTP config activated successfully',
      testSuccess: 'SFTP connection test successful',
      createError: 'Failed to create SFTP config',
      updateError: 'Failed to update SFTP config',
      deleteError: 'Failed to delete SFTP config',
      activateError: 'Failed to activate SFTP config',
      testError: 'SFTP connection test failed',
      loadError: 'Failed to load SFTP configs'
    },
    
    // Confirm dialogs
    confirmDelete: 'Are you sure you want to delete this SFTP config?',
    confirmOk: 'OK',
    confirmCancel: 'Cancel'
  }
};

// 获取翻译文本
export const getSFTPConfigTranslation = (key, language) => {
  const keys = key.split('.');
  let translation = sftpConfigTranslations[language];

  for (const k of keys) {
    if (translation && typeof translation === 'object' && k in translation) {
      translation = translation[k];
    } else {
      // Fallback to default language (Chinese)
      translation = sftpConfigTranslations['zh'];
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
