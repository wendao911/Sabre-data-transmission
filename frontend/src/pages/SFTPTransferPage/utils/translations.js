// SFTP 传输页面专用翻译
export const translations = {
  zh: {
    // 页面标题与描述
    pageTitle: 'SFTP文件传输',
    pageDescription: '左侧浏览本地文件，右侧浏览远程SFTP文件，支持目录操作与传输',
    refresh: '刷新',

    // 传输模态框
    transferTitle: '传输到 SFTP',
    transferOk: '开始传输',
    transferCancel: '取消',
    labelLocalFile: '本地文件：',
    labelTargetHost: 'SFTP 目标主机：',
    labelTargetDir: 'SFTP 目标目录：',
    tipTransfer: '说明：将按原文件名上传到指定目录，必要时会自动创建远程目录。',

    // 同步进度模态
    syncProgressTitle: '文件同步进度',
    overallProgress: '总体进度',
    totalFiles: '总文件',
    synced: '已同步',
    skipped: '跳过',
    failed: '失败',
    ruleDetails: '规则处理详情',
    noneRuleInfo: '暂无规则处理信息',
    running: '正在同步文件，请稍候...',
    finished: '同步完成！',
    stopped: '同步已停止',
    module: '模块',
    ruleTotalFiles: '总文件',
    status_success: '成功',
    status_partial: '部分成功',
    status_failed: '失败',
    status_skipped: '跳过',
    status_no_files: '无文件',

    // 连接配置
    conn_title: 'SFTP 连接配置',
    conn_loading: '加载配置中...',
    conn_empty: '没有可用的 SFTP 配置',
    conn_hint: '请在系统设置中配置 SFTP 连接',
    conn_name: '配置名称',
    conn_unnamed: '未命名',
    conn_host: '主机',
    conn_port: '端口',
    conn_user: '用户名',
    conn_userType: '用户类型',
    conn_user_normal: '普通用户',
    conn_user_anonymous: '匿名用户',
    conn_status_connected: 'SFTP已连接',
    conn_status_disconnected: 'SFTP未连接',
    conn_since: '已连接',
    conn_btn_connect: '连接 SFTP',
    conn_btn_disconnect: '断开连接',
    conn_btn_refresh: '刷新配置',

    // File browser
    breadcrumb_root: '资源根目录',
    breadcrumb_path: '路径',
    sftp_remote_files: 'SFTP 远程文件',
    col_name: '名称',
    col_type: '类型',
    col_size: '大小',
    col_mtime: '修改时间',
    col_action: '操作',
    type_directory: '目录',
    type_file: '文件',
    action_download: '下载',
    action_delete: '删除',
    confirm_delete_prefix: '确认删除',
    ok_delete: '删除',
    cancel: '取消',
    tip_refresh: '刷新当前目录',
    tip_go_parent: '返回上级目录',
    action_create_dir: '创建目录',
    action_sync: '同步文件到SFTP（自动连接）',
    pagination_total: '第 {start}-{end} 条，共 {total} 条'
    ,
    // Local file browser
    local_server_files: '服务器本地文件',
    action_upload: '上传文件',
    action_transfer_to_sftp: '传输到SFTP',
    confirm_delete_desc_prefix: '将删除：'
  },
  en: {
    // Page title & desc
    pageTitle: 'SFTP File Transfer',
    pageDescription: 'Browse local files on the left and remote SFTP files on the right with directory ops and transfer',
    refresh: 'Refresh',

    // Transfer modal
    transferTitle: 'Transfer to SFTP',
    transferOk: 'Start Transfer',
    transferCancel: 'Cancel',
    labelLocalFile: 'Local File:',
    labelTargetHost: 'SFTP Target Host:',
    labelTargetDir: 'SFTP Target Directory:',
    tipTransfer: 'Note: Upload with original filename. Remote directory will be created if needed.',

    // Sync progress modal
    syncProgressTitle: 'File Sync Progress',
    overallProgress: 'Overall Progress',
    totalFiles: 'Total Files',
    synced: 'Synced',
    skipped: 'Skipped',
    failed: 'Failed',
    ruleDetails: 'Rule Details',
    noneRuleInfo: 'No rule information yet',
    running: 'Syncing files, please wait…',
    finished: 'Sync completed!',
    stopped: 'Sync stopped',
    module: 'Module',
    ruleTotalFiles: 'Total Files',
    status_success: 'Success',
    status_partial: 'Partial',
    status_failed: 'Failed',
    status_skipped: 'Skipped',
    status_no_files: 'No files',

    // Connection config
    conn_title: 'SFTP Connection',
    conn_loading: 'Loading configuration...',
    conn_empty: 'No available SFTP configuration',
    conn_hint: 'Please configure SFTP connection in System Settings',
    conn_name: 'Name',
    conn_unnamed: 'Unnamed',
    conn_host: 'Host',
    conn_port: 'Port',
    conn_user: 'Username',
    conn_userType: 'User Type',
    conn_user_normal: 'Authenticated',
    conn_user_anonymous: 'Anonymous',
    conn_status_connected: 'SFTP connected',
    conn_status_disconnected: 'SFTP disconnected',
    conn_since: 'Connected',
    conn_btn_connect: 'Connect SFTP',
    conn_btn_disconnect: 'Disconnect',
    conn_btn_refresh: 'Refresh',

    // File browser
    breadcrumb_root: 'Root',
    breadcrumb_path: 'Path',
    sftp_remote_files: 'SFTP Remote Files',
    col_name: 'Name',
    col_type: 'Type',
    col_size: 'Size',
    col_mtime: 'Modified Time',
    col_action: 'Actions',
    type_directory: 'Directory',
    type_file: 'File',
    action_download: 'Download',
    action_delete: 'Delete',
    confirm_delete_prefix: 'Confirm delete ',
    ok_delete: 'Delete',
    cancel: 'Cancel',
    tip_refresh: 'Refresh current directory',
    tip_go_parent: 'Go to parent',
    action_create_dir: 'Create directory',
    action_sync: 'Sync files to SFTP (auto connect)',
    pagination_total: '{start}-{end} of {total}'
    ,
    // Local file browser
    local_server_files: 'Server Local Files',
    action_upload: 'Upload',
    action_transfer_to_sftp: 'Transfer to SFTP',
    confirm_delete_desc_prefix: 'Will delete: '
  }
};

// 获取翻译文本（与解密页面风格一致）
export const getSftpTransferTranslation = (key, language, params = {}) => {
  const dict = translations[language] || translations.zh;
  const translation = dict[key] || key;
  if (params && Object.keys(params).length > 0) {
    return translation.replace(/\{(\w+)\}/g, (match, paramKey) => params[paramKey] || match);
  }
  return translation;
};


