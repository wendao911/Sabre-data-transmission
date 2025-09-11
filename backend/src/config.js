module.exports = {
  server: {
    port: 3000,
    nodeEnv: 'development'
  },
  
  database: {
    // MongoDB 连接 URI（写死）
    uri: 'mongodb://localhost:27017/sabre_data_management_db',
    // 如果不使用完整 URI，可使用以下离散配置项（写死）
    host: 'localhost',
    port: 27017,
    dbName: 'sabre_data_management_db',
    user: '',
    pass: '',
    authSource: 'admin',
    replicaSet: undefined,
    ssl: false,
    // 通用驱动/Mongoose 连接选项（写死）
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
    maxSize: 10485760, // 最大上传大小：10MB
    uploadPath: './uploads'
  },
  
  ftp: {
    host: '10.125.5.37',
    port: 21,
    user: '',
    password: '',
    secure: false
  }
};
