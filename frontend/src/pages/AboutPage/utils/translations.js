// 关于页面翻译文件
export const aboutPageTranslations = {
  zh: {
    // 页面标题和描述
    aboutApp: '关于应用',
    systemDescription: '本系统是柬埔寨国家航空（AIR CAMBODIA）的数据管理平台，用于通过SFTP安全传输文件，支持文件管理、解密、定时任务等功能。适用于ACCA内部团队，用于管理SAL、UPL、OWB、IWB、MAS等模块的文件传输。',
    
    // 应用信息
    appInfo: '应用信息',
    version: '版本',
    buildDate: '构建日期',
    developer: '开发者',
    
    // 系统功能说明
    systemFeatures: '系统功能说明',
    systemFeaturesTitle: 'SFTP文件传输系统主要功能模块介绍',
    fileManagement: '文件管理',
    fileManagementDesc: '支持本地文件浏览、搜索、排序和分页功能，可管理多种文件格式',
    fileManagementFeatures: ['文件浏览', '搜索过滤', '排序功能', '分页显示', '文件预览'],
    
    decrypt: '文件解密',
    decryptDesc: 'Sabre数据文件自动解密，支持密钥和密码自动选择',
    decryptFeatures: ['自动解密', '密钥管理', '批量处理', '进度监控', '日志记录'],
    
    sftpTransfer: 'SFTP传输',
    sftpTransferDesc: '安全的文件传输，支持两栏浏览和本地到SFTP的传输',
    sftpTransferFeatures: ['SFTP连接', '文件传输', '映射同步', '连接管理', '传输监控'],
    
    scheduledTasks: '定时任务',
    scheduledTasksDesc: '可配置的定时任务，支持解密和传输任务的自动化执行',
    scheduledTasksFeatures: ['任务配置', '定时执行', '状态监控', '日志记录', '任务管理'],
    
    systemConfig: '系统配置',
    systemConfigDesc: 'SFTP连接配置、文件映射规则和系统参数设置',
    systemConfigFeatures: ['SFTP配置', '文件映射', '系统参数', '用户管理', '安全设置'],
    
    systemLogs: '系统日志',
    systemLogsDesc: '完整的系统运行日志，包括解密日志和传输日志',
    systemLogsFeatures: ['系统日志', '解密日志', '传输日志', '日志搜索', '详情查看'],
    
    // 快速入门指南
    quickStartGuide: '快速入门指南',
    quickStartTitle: '如何快速上手使用系统',
    quickStartDesc: '按照以下步骤快速配置和使用系统的主要功能',
    configureSftp: '配置SFTP连接',
    configureSftpSteps: [
      '进入"系统配置" → "SFTP连接配置"',
      '填写SFTP服务器地址、端口、用户名和密码',
      '测试连接确保配置正确',
      '保存配置并激活连接'
    ],
    uploadDecryptFiles: '上传或解密文件',
    uploadDecryptFilesSteps: [
      '进入"文件管理"页面浏览本地文件',
      '选择需要处理的文件（支持批量选择）',
      '点击"解密"按钮进行文件解密',
      '进入"SFTP传输"页面上传文件到远程服务器'
    ],
    setScheduledTasks: '设置定时任务',
    setScheduledTasksSteps: [
      '进入"系统配置" → "定时任务配置"',
      '选择任务类型（解密或传输）',
      '设置Cron表达式定义执行时间',
      '启用任务并保存配置'
    ],
    
    // SFTP传输功能详解
    sftpFeatures: 'SFTP传输功能详解',
    sftpFeaturesTitle: 'SFTP文件传输系统核心功能特性',
    sftpFeaturesDesc: '深入了解SFTP传输系统的各项功能特性和文件推送路径配置',
    connectionManagement: '连接管理',
    connectionManagementDesc: '安全稳定的SFTP连接建立和维护',
    connectionManagementFeatures: [
      '支持多种认证方式（用户名密码、密钥认证）',
      '连接状态实时监控和自动重连',
      '连接超时和重试机制',
      '连接池管理，提高传输效率'
    ],
    fileBrowsing: '双栏文件浏览',
    fileBrowsingDesc: '本地和远程文件系统同步浏览',
    fileBrowsingFeatures: [
      '本地文件浏览器，支持搜索和过滤',
      '远程SFTP目录实时浏览',
      '文件大小、修改时间等信息显示',
      '支持文件夹创建、删除等操作'
    ],
    fileMapping: '智能文件映射',
    fileMappingDesc: '根据文件类型自动匹配推送路径',
    fileMappingFeatures: [
      '支持14种文件类型的自动识别',
      'SAL、UPL、OWB、IWB、MAS模块分类',
      '自定义文件映射规则配置',
      '批量文件自动分类和推送'
    ],
    transferMonitoring: '传输监控',
    transferMonitoringDesc: '实时监控文件传输状态和进度',
    transferMonitoringFeatures: [
      '传输进度实时显示',
      '成功/失败状态统计',
      '传输速度监控',
      '错误日志和重试机制'
    ],
    
    // 文件推送路径配置表
    filePushPathConfig: '文件推送路径配置表',
    filePushPathDesc: '系统支持的文件类型及其对应的SFTP推送路径，支持14种文件类型的自动识别和分类推送',
    serialNumber: '序号',
    module: '所属模块',
    fileType: '文件类型',
    pushPath: '推送路径',
    
    // 文件类型
    tcnFile: 'TCN文件',
    bspFile: 'BSP文件',
    arcFile: 'ARC文件',
    tktCouponFile: 'TktCoupon文件',
    tktRemarkFile: 'TktRemark文件',
    vcrFlownData: 'VCR Flown数据',
    flightInfo: '航班信息',
    xlFile: 'XL文件',
    idecFile: 'IDEC文件',
    form1File: 'Form1文件',
    priceComparisonFile: '5天比价文件',
    allocationCoefficient: '分摊系数',
    atpcoTax: 'ATPCO TAX',
    atpcoYqyr: 'ATPCO YQYR'
  },
  
  en: {
    // 页面标题和描述
    aboutApp: 'About Application',
    systemDescription: 'This system is the data management platform of Cambodia National Airlines (AIR CAMBODIA), used for secure file transmission through SFTP, supporting file management, decryption, scheduled tasks and other functions. It is suitable for ACCA internal teams to manage file transmission of SAL, UPL, OWB, IWB, MAS and other modules.',
    
    // 应用信息
    appInfo: 'Application Information',
    version: 'Version',
    buildDate: 'Build Date',
    developer: 'Developer',
    
    // 系统功能说明
    systemFeatures: 'System Features',
    systemFeaturesTitle: 'SFTP File Transfer System Main Function Modules',
    fileManagement: 'File Management',
    fileManagementDesc: 'Supports local file browsing, search, sorting and pagination functions, can manage multiple file formats',
    fileManagementFeatures: ['File Browsing', 'Search & Filter', 'Sorting', 'Pagination', 'File Preview'],
    
    decrypt: 'File Decryption',
    decryptDesc: 'Automatic Sabre data file decryption, supports automatic key and password selection',
    decryptFeatures: ['Auto Decryption', 'Key Management', 'Batch Processing', 'Progress Monitoring', 'Log Recording'],
    
    sftpTransfer: 'SFTP Transfer',
    sftpTransferDesc: 'Secure file transfer, supports dual-pane browsing and local to SFTP transfer',
    sftpTransferFeatures: ['SFTP Connection', 'File Transfer', 'Mapping Sync', 'Connection Management', 'Transfer Monitoring'],
    
    scheduledTasks: 'Scheduled Tasks',
    scheduledTasksDesc: 'Configurable scheduled tasks, supports automated execution of decryption and transfer tasks',
    scheduledTasksFeatures: ['Task Configuration', 'Scheduled Execution', 'Status Monitoring', 'Log Recording', 'Task Management'],
    
    systemConfig: 'System Configuration',
    systemConfigDesc: 'SFTP connection configuration, file mapping rules and system parameter settings',
    systemConfigFeatures: ['SFTP Config', 'File Mapping', 'System Parameters', 'User Management', 'Security Settings'],
    
    systemLogs: 'System Logs',
    systemLogsDesc: 'Complete system operation logs, including decryption logs and transfer logs',
    systemLogsFeatures: ['System Logs', 'Decrypt Logs', 'Transfer Logs', 'Log Search', 'Detail View'],
    
    // 快速入门指南
    quickStartGuide: 'Quick Start Guide',
    quickStartTitle: 'How to Get Started with the System',
    quickStartDesc: 'Follow these steps to quickly configure and use the main functions of the system',
    configureSftp: 'Configure SFTP Connection',
    configureSftpSteps: [
      'Go to "System Config" → "SFTP Connection Config"',
      'Fill in SFTP server address, port, username and password',
      'Test connection to ensure correct configuration',
      'Save configuration and activate connection'
    ],
    uploadDecryptFiles: 'Upload or Decrypt Files',
    uploadDecryptFilesSteps: [
      'Go to "File Management" page to browse local files',
      'Select files to process (supports batch selection)',
      'Click "Decrypt" button to decrypt files',
      'Go to "SFTP Transfer" page to upload files to remote server'
    ],
    setScheduledTasks: 'Set Scheduled Tasks',
    setScheduledTasksSteps: [
      'Go to "System Config" → "Scheduled Task Config"',
      'Select task type (decrypt or transfer)',
      'Set Cron expression to define execution time',
      'Enable task and save configuration'
    ],
    
    // SFTP传输功能详解
    sftpFeatures: 'SFTP Transfer Features',
    sftpFeaturesTitle: 'SFTP File Transfer System Core Features',
    sftpFeaturesDesc: 'In-depth understanding of SFTP transfer system features and file push path configuration',
    connectionManagement: 'Connection Management',
    connectionManagementDesc: 'Secure and stable SFTP connection establishment and maintenance',
    connectionManagementFeatures: [
      'Supports multiple authentication methods (username/password, key authentication)',
      'Real-time connection status monitoring and auto-reconnection',
      'Connection timeout and retry mechanisms',
      'Connection pool management for improved transfer efficiency'
    ],
    fileBrowsing: 'Dual-Pane File Browsing',
    fileBrowsingDesc: 'Synchronized browsing of local and remote file systems',
    fileBrowsingFeatures: [
      'Local file browser with search and filter support',
      'Real-time remote SFTP directory browsing',
      'File size, modification time and other information display',
      'Support for folder creation, deletion and other operations'
    ],
    fileMapping: 'Smart File Mapping',
    fileMappingDesc: 'Automatic matching of push paths based on file types',
    fileMappingFeatures: [
      'Supports automatic recognition of 14 file types',
      'SAL, UPL, OWB, IWB, MAS module classification',
      'Custom file mapping rule configuration',
      'Batch file automatic classification and push'
    ],
    transferMonitoring: 'Transfer Monitoring',
    transferMonitoringDesc: 'Real-time monitoring of file transfer status and progress',
    transferMonitoringFeatures: [
      'Real-time transfer progress display',
      'Success/failure status statistics',
      'Transfer speed monitoring',
      'Error logging and retry mechanisms'
    ],
    
    // 文件推送路径配置表
    filePushPathConfig: 'File Push Path Configuration',
    filePushPathDesc: 'File types supported by the system and their corresponding SFTP push paths, supports automatic recognition and classification push of 14 file types',
    serialNumber: 'No.',
    module: 'Module',
    fileType: 'File Type',
    pushPath: 'Push Path',
    
    // 文件类型
    tcnFile: 'TCN File',
    bspFile: 'BSP File',
    arcFile: 'ARC File',
    tktCouponFile: 'TktCoupon File',
    tktRemarkFile: 'TktRemark File',
    vcrFlownData: 'VCR Flown Data',
    flightInfo: 'Flight Information',
    xlFile: 'XL File',
    idecFile: 'IDEC File',
    form1File: 'Form1 File',
    priceComparisonFile: '5-day Price Comparison File',
    allocationCoefficient: 'Allocation Coefficient',
    atpcoTax: 'ATPCO TAX',
    atpcoYqyr: 'ATPCO YQYR'
  }
};

// 获取翻译文本
export const getAboutPageTranslation = (key, language, params = {}) => {
  let translation = aboutPageTranslations[language]?.[key] || key;
  
  // 替换参数
  Object.keys(params).forEach(param => {
    translation = translation.replace(`{${param}}`, params[param]);
  });
  
  return translation;
};
