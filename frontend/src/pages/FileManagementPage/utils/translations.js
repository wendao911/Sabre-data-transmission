// 文件浏览器页面专用翻译
export const fileBrowserTranslations = {
  zh: {
    // 页面标题
    pageTitle: '文件浏览器',
    pageDescription: '浏览和管理文件系统中的文件和目录',
    
    // 工具栏
    toolbar: {
      searchPlaceholder: '搜索文件或目录...',
      sortBy: '排序方式',
      sortOrder: '排序顺序',
      showHidden: '显示隐藏文件',
      refresh: '刷新',
      createDirectory: '创建目录',
      uploadFile: '上传文件',
      backToParent: '返回上级',
      backToRoot: '返回根目录'
    },
    
    // 排序选项
    sortOptions: {
      name: '名称',
      size: '大小',
      date: '修改时间'
    },
    
    sortOrderOptions: {
      asc: '升序',
      desc: '降序'
    },
    
    // 表格列标题
    columns: {
      name: '名称',
      size: '大小',
      modified: '修改时间',
      type: '类型',
      actions: '操作'
    },
    
    // 文件类型
    fileTypes: {
      directory: '目录',
      file: '文件'
    },
    
    // 操作按钮
    actions: {
      download: '下载',
      delete: '删除',
      enterDirectory: '进入目录'
    },
    
    // 创建目录模态框
    createDirectory: {
      title: '创建新目录',
      currentPath: '当前路径',
      directoryName: '目录名称',
      directoryNamePlaceholder: '请输入新目录名称',
      create: '创建',
      cancel: '取消',
      validation: {
        required: '请输入目录名称',
        invalidChars: '目录名称不能包含特殊字符: < > : " / \\ | ? *',
        maxLength: '目录名称不能超过255个字符'
      }
    },
    
    // 上传文件模态框
    uploadFile: {
      title: '上传文件',
      selectFile: '选择文件',
      selectFileDescription: '点击或拖拽文件到此处上传',
      selectFileHint: '仅上传单个文件，文件名可在下方修改',
      fileType: '文件类型',
      fileTypePlaceholder: '请选择文件类型配置',
      targetDirectory: '目标目录',
      targetDirectoryPlaceholder: '默认当前目录',
      fileName: '保存文件名 (不含后缀)',
      fileNamePlaceholder: '请输入文件名',
      remark: '备注',
      remarkPlaceholder: '请输入备注信息（可选）',
      upload: '上传',
      cancel: '取消',
      validation: {
        fileRequired: '请选择要上传的文件',
        fileTypeRequired: '请选择文件类型配置',
        fileNameRequired: '请输入文件名',
        invalidChars: '文件名不能包含特殊字符: < > : " / \\ | ? *',
        maxLength: '文件名不能超过255个字符'
      }
    },
    
    // 消息提示
    messages: {
      loadError: '加载文件列表失败',
      createDirectorySuccess: '目录创建成功',
      createDirectoryError: '目录创建失败',
      uploadSuccess: '文件上传成功',
      uploadError: '文件上传失败',
      downloadSuccess: '下载成功',
      downloadError: '下载失败',
      deleteSuccess: '删除成功',
      deleteError: '删除失败',
      deleteConfirm: '确定要删除这个文件/目录吗？',
      deleteConfirmTitle: '确认删除'
    },
    
    // 文件大小单位
    fileSize: {
      bytes: 'B',
      kb: 'KB',
      mb: 'MB',
      gb: 'GB',
      tb: 'TB'
    },
    
    // 空状态
    empty: {
      noFiles: '暂无文件',
      noFilesDescription: '当前目录下没有文件或目录'
    },
    
    // 面包屑导航
    breadcrumb: {
      home: '首页',
      root: '根目录'
    }
  },
  en: {
    // Page title
    pageTitle: 'File Browser',
    pageDescription: 'Browse and manage files and directories in the file system',
    
    // Toolbar
    toolbar: {
      searchPlaceholder: 'Search files or directories...',
      sortBy: 'Sort by',
      sortOrder: 'Sort order',
      showHidden: 'Show hidden files',
      refresh: 'Refresh',
      createDirectory: 'Create Directory',
      uploadFile: 'Upload File',
      backToParent: 'Back to Parent',
      backToRoot: 'Back to Root'
    },
    
    // Sort options
    sortOptions: {
      name: 'Name',
      size: 'Size',
      date: 'Modified'
    },
    
    sortOrderOptions: {
      asc: 'Ascending',
      desc: 'Descending'
    },
    
    // Table columns
    columns: {
      name: 'Name',
      size: 'Size',
      modified: 'Modified',
      type: 'Type',
      actions: 'Actions'
    },
    
    // File types
    fileTypes: {
      directory: 'Directory',
      file: 'File'
    },
    
    // Action buttons
    actions: {
      download: 'Download',
      delete: 'Delete',
      enterDirectory: 'Enter Directory'
    },
    
    // Create directory modal
    createDirectory: {
      title: 'Create New Directory',
      currentPath: 'Current Path',
      directoryName: 'Directory Name',
      directoryNamePlaceholder: 'Enter new directory name',
      create: 'Create',
      cancel: 'Cancel',
      validation: {
        required: 'Please enter directory name',
        invalidChars: 'Directory name cannot contain special characters: < > : " / \\ | ? *',
        maxLength: 'Directory name cannot exceed 255 characters'
      }
    },
    
    // Upload file modal
    uploadFile: {
      title: 'Upload File',
      selectFile: 'Select File',
      selectFileDescription: 'Click or drag file to this area to upload',
      selectFileHint: 'Upload single file only, filename can be modified below',
      fileType: 'File Type',
      fileTypePlaceholder: 'Please select file type configuration',
      targetDirectory: 'Target Directory',
      targetDirectoryPlaceholder: 'Default current directory',
      fileName: 'Save as (without extension)',
      fileNamePlaceholder: 'Enter filename',
      remark: 'Remark',
      remarkPlaceholder: 'Enter remark information (optional)',
      upload: 'Upload',
      cancel: 'Cancel',
      validation: {
        fileRequired: 'Please select a file to upload',
        fileTypeRequired: 'Please select file type configuration',
        fileNameRequired: 'Please enter filename',
        invalidChars: 'Filename cannot contain special characters: < > : " / \\ | ? *',
        maxLength: 'Filename cannot exceed 255 characters'
      }
    },
    
    // Messages
    messages: {
      loadError: 'Failed to load file list',
      createDirectorySuccess: 'Directory created successfully',
      createDirectoryError: 'Failed to create directory',
      uploadSuccess: 'File uploaded successfully',
      uploadError: 'Failed to upload file',
      downloadSuccess: 'Download successful',
      downloadError: 'Download failed',
      deleteSuccess: 'Delete successful',
      deleteError: 'Delete failed',
      deleteConfirm: 'Are you sure you want to delete this file/directory?',
      deleteConfirmTitle: 'Confirm Delete'
    },
    
    // File size units
    fileSize: {
      bytes: 'B',
      kb: 'KB',
      mb: 'MB',
      gb: 'GB',
      tb: 'TB'
    },
    
    // Empty state
    empty: {
      noFiles: 'No files',
      noFilesDescription: 'No files or directories in current directory'
    },
    
    // Breadcrumb navigation
    breadcrumb: {
      home: 'Home',
      root: 'Root'
    }
  }
};

// 获取翻译文本
export const getFileBrowserTranslation = (key, language) => {
  const keys = key.split('.');
  let translation = fileBrowserTranslations[language];

  for (const k of keys) {
    if (translation && typeof translation === 'object' && k in translation) {
      translation = translation[k];
    } else {
      // Fallback to default language (Chinese)
      translation = fileBrowserTranslations['zh'];
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
