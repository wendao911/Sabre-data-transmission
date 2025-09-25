// 根目录路径
const rootPath = 'C:\\Users\\18252\\Desktop\\K6\\coding\\ACCA';

module.exports = {
  server: {
    port: 3000,
    nodeEnv: 'development'
  },
  database: {
    uri: 'mongodb://localhost:27017/sabre_data_management_db',
    host: 'localhost',
    port: 27017,
    dbName: 'sabre_data_management_db',
    user: '',
    pass: '',
    authSource: 'admin',
    replicaSet: undefined,
    ssl: false,
    options: {
      maxPoolSize: 10,
      minPoolSize: 0,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 10000,
      retryWrites: true,
      w: 'majority',
      readPreference: 'primary'
    }
  },
  jwt: {
    secret: 'your_jwt_secret_key_here',
    expiresIn: '7d'
  },
  cors: {
    origin: 'http://localhost:3000'
  },
  file: {
    maxSize: 10485760,
    uploadPath: './uploads'
  },
  timezone: {
    // 柬埔寨时区 (UTC+7)
    timezone: 'Asia/Phnom_Penh',
    offset: '+07:00'
  },
  // 根目录路径
  rootPath: rootPath,
  
  fileBrowser: {
    rootPath: rootPath, // 使用指定的根目录路径
    pageSize: 50, // 每页显示文件数
    allowedFileTypes: ['.gz', '.zip', '.txt', '.dat', '.done', '.csv', '.json'], // 允许的文件类型
    showHiddenFiles: false, // 是否显示隐藏文件
    sortBy: 'name', // 排序方式：name, size, date
    sortOrder: 'asc', // 排序顺序：asc, desc
  },
  decrypt: {
    // 加密文件目录 - 独立配置，不基于 rootPath
    encryptionDir: 'C:\\Users\\18252\\Desktop\\K6\\coding\\ACCA\\Sabre Data Encryption',
    // 解密文件目录 - 基于 rootPath 拼接
    decryptionDir: `${rootPath}\\Sabre Data Decryption`
  }
};


