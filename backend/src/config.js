module.exports = {
  server: {
    port: 3000,
    nodeEnv: 'development'
  },
  
  database: {
    uri: 'mongodb://localhost:27017/acca_db'
  },
  
  jwt: {
    secret: 'your_jwt_secret_key_here',
    expiresIn: '7d'
  },
  
  cors: {
    origin: 'http://localhost:3000'
  },
  
  file: {
    maxSize: 10485760, // 10MB
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
