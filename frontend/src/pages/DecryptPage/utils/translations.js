// 解密页面专用翻译
export const decryptTranslations = {
  zh: {
    // 页面标题和描述
    pageTitle: '文件解密管理',
    pageDescription: '管理加密文件的解密操作，查看解密状态和已解密文件',
    
    // 刷新按钮
    refresh: '刷新',
    
    // 文件日期列表
    fileDateList: '文件日期列表',
    noFiles: '该日期下没有文件',
    decrypted: '已解密',
    notDecrypted: '未解密',
    files: '个文件',
    
    // 文件列表
    fileList: '文件列表',
    batchProcess: '批量处理',
    noDecryptionNeeded: '无需解密',
    decrypt: '解密',
    fileName: '文件名',
    type: '类型',
    size: '大小',
    modificationTime: '修改时间',
    operation: '操作',
    
    // 已解密文件列表
    decryptedFileList: '已解密文件',
    download: '下载',
    noDecryptedFiles: '该日期下没有已解密文件',
    
    // 文件类型标签
    gpgEncrypted: 'GPG加密',
    doneFile: 'DONE文件',
    zipCompressed: 'ZIP压缩',
    jsonFile: 'JSON文件',
    otherFile: '其他文件',
    textFile: '文本文件',
    dataFile: '数据文件',
    csvFile: 'CSV文件',
    gzCompressed: 'GZ压缩',
    
    // 批量处理进度
    batchProcessing: '批量处理中...',
    processingProgress: '处理进度',
    currentFile: '当前文件',
    totalFiles: '总文件数',
    processed: '已处理',
    decrypted: '已解密',
    copied: '已复制',
    failed: '失败',
    success: '成功',
    error: '错误',
    
    // 消息提示
    selectDateFirst: '请先选择一个日期',
    batchProcessSuccess: '批量处理完成',
    batchProcessFailed: '批量处理失败',
    loadFilesFailed: '加载文件列表失败',
    loadDecryptedFilesFailed: '加载已解密文件失败',
    downloadSuccess: '文件下载成功',
    downloadFailed: '文件下载失败',
    
    // 分页
    totalFiles: '共 {total} 个文件',
    pageSize: '条/页',
    goTo: '跳至',
    page: '页'
  },
  
  en: {
    // Page title and description
    pageTitle: 'File Decryption Management',
    pageDescription: 'Manage encrypted file decryption operations, view decryption status and decrypted files',
    
    // Refresh button
    refresh: 'Refresh',
    
    // File date list
    fileDateList: 'File Date List',
    noFiles: 'No files for this date',
    decrypted: 'Decrypted',
    notDecrypted: 'Not Decrypted',
    files: ' files',
    
    // File list
    fileList: 'File List',
    batchProcess: 'Batch Process',
    noDecryptionNeeded: 'No Decryption Needed',
    decrypt: 'Decrypt',
    fileName: 'File Name',
    type: 'Type',
    size: 'Size',
    modificationTime: 'Modification Time',
    operation: 'Operation',
    
    // Decrypted file list
    decryptedFileList: 'Decrypted Files',
    download: 'Download',
    noDecryptedFiles: 'No decrypted files for this date',
    
    // File type tags
    gpgEncrypted: 'GPG Encrypted',
    doneFile: 'DONE File',
    zipCompressed: 'ZIP Compressed',
    jsonFile: 'JSON File',
    otherFile: 'Other File',
    textFile: 'Text File',
    dataFile: 'Data File',
    csvFile: 'CSV File',
    gzCompressed: 'GZ Compressed',
    
    // Batch processing progress
    batchProcessing: 'Batch Processing...',
    processingProgress: 'Processing Progress',
    currentFile: 'Current File',
    totalFiles: 'Total Files',
    processed: 'Processed',
    decrypted: 'Decrypted',
    copied: 'Copied',
    failed: 'Failed',
    success: 'Success',
    error: 'Error',
    
    // Message prompts
    selectDateFirst: 'Please select a date first',
    batchProcessSuccess: 'Batch processing completed',
    batchProcessFailed: 'Batch processing failed',
    loadFilesFailed: 'Failed to load file list',
    loadDecryptedFilesFailed: 'Failed to load decrypted files',
    downloadSuccess: 'File download successful',
    downloadFailed: 'File download failed',
    
    // Pagination
    totalFiles: 'Total {total} files',
    pageSize: '/ page',
    goTo: 'Go to',
    page: 'Page'
  }
};

// 获取翻译文本
export const getDecryptTranslation = (key, language, params = {}) => {
  const translation = decryptTranslations[language]?.[key] || key;
  
  // 处理参数替换
  if (params && Object.keys(params).length > 0) {
    return translation.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey] || match;
    });
  }
  
  return translation;
};
