// Layout 组件专用翻译
export const layoutTranslations = {
  zh: {
    // 导航菜单
    home: '仪表盘',
    fileManagement: '文件浏览器',
    fileDecrypt: '文件解密',
    sftpTransfer: 'SFTP传输',
    systemConfig: '系统配置',
    about: '关于',
    
    // 用户菜单
    profile: '个人资料',
    logout: '退出登录',
    welcome: '欢迎',
    
    // 系统配置子菜单
    sftpConnectionConfig: 'SFTP连接配置',
    scheduledTaskConfig: '定时任务配置',
    fileMapping: '文件映射',
    
    // 通用
    collapse: '收起',
    expand: '展开',
    language: '语言',
    theme: '主题',
    light: '浅色',
    dark: '深色',
  },
  en: {
    // Navigation menu
    home: 'Dashboard',
    fileManagement: 'File Browser',
    fileDecrypt: 'File Decrypt',
    sftpTransfer: 'SFTP Transfer',
    systemConfig: 'System Config',
    about: 'About',
    
    // User menu
    profile: 'Profile',
    logout: 'Logout',
    welcome: 'Welcome',
    
    // System config submenu
    sftpConnectionConfig: 'SFTP Connection Config',
    scheduledTaskConfig: 'Scheduled Task Config',
    fileMapping: 'File Mapping',
    
    // Common
    collapse: 'Collapse',
    expand: 'Expand',
    language: 'Language',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
  }
};

// 获取翻译文本
export const getLayoutTranslation = (key, language) => {
  const translation = layoutTranslations[language]?.[key];
  return translation || key;
};
