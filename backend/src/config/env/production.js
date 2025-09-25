module.exports = {
  server: {
    port: 3000,
    nodeEnv: 'production'
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
    origin: 'http://your-production-domain'
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
  fileBrowser: {
    rootPath: 'C:\\Users\\18252\\Desktop\\K6\\coding\\ACCA', // 使用指定的根目录路径
    pageSize: 100, // 每页显示文件数
    allowedFileTypes: ['.gz', '.zip', '.txt', '.dat', '.done', '.csv', '.json'], // 允许的文件类型
    showHiddenFiles: false, // 是否显示隐藏文件
    sortBy: 'name', // 排序方式：name, size, date
    sortOrder: 'asc', // 排序顺序：asc, desc
  },
  decrypt: {
    // 加密文件目录 - 生产环境使用绝对路径，上线时修改
    encryptionDir: '/data/sabre/encryption',
    // 解密文件目录 - 生产环境使用绝对路径，上线时修改
    decryptionDir: '/data/sabre/decryption',
    // 密钥文件目录
    keyDir: '/app/src/assets',
    // 密码文件路径
    passphraseFile: '/app/backend/src/assets/K6-gpg-psd.psd'
  }
};


