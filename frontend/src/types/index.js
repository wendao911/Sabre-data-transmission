// 用户相关类型
export const User = {
  id: Number,
  email: String,
  name: String,
  role: String,
  createdAt: String,
  updatedAt: String,
};

// 文件相关类型
export const FileInfo = {
  id: Number,
  originalName: String,
  filename: String,
  size: Number,
  mimetype: String,
  uploadedAt: String,
  uploadedBy: String,
  downloadUrl: String,
};

// 认证响应类型
export const AuthResponse = {
  message: String,
  token: String,
  user: User,
};

// 文件上传响应类型
export const FileUploadResponse = {
  message: String,
  file: FileInfo,
};

// API错误类型
export const ApiError = {
  error: String,
  message: String,
};

// 解密状态类型
export const DecryptStatus = {
  encryptionDir: {
    exists: Boolean,
    gpgFiles: Number,
    dates: Array,
  },
  decryptionDir: {
    exists: Boolean,
    subdirs: Array,
  },
  privateKey: {
    exists: Boolean,
  },
  passphrase: {
    exists: Boolean,
  },
};

// 解密结果类型
export const DecryptResult = {
  total: Number,
  success: Number,
  failed: Number,
  errors: Array,
};

// 菜单操作类型
export const MenuAction = {
  type: String, // 'new-file' | 'open-file' | 'about'
};

// Electron API 类型
export const ElectronAPI = {
  selectFile: Function,
  saveFile: Function,
  minimizeWindow: Function,
  maximizeWindow: Function,
  closeWindow: Function,
  onMenuAction: Function,
  onNewFile: Function,
  onOpenFile: Function,
  onAbout: Function,
  getVersion: Function,
  getPlatform: Function,
  removeAllListeners: Function,
};
