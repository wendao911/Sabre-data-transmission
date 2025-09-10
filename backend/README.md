# Sabre Data Management Backend API

基于Node.js和Express的文件管理系统后端API。

## 功能特性

- 🔐 JWT身份验证
- 👥 用户管理
- 📁 文件上传/下载
- 🛡️ 安全中间件
- 📝 请求日志
- ⚡ 热重载开发

## 技术栈

- **Node.js** - JavaScript运行时
- **Express.js** - Web框架
- **JWT** - 身份验证
- **Multer** - 文件上传
- **bcryptjs** - 密码加密
- **CORS** - 跨域支持
- **Helmet** - 安全防护

## 快速开始

### 安装依赖

```bash
npm install
```

### 环境配置

复制环境变量示例文件：

```bash
cp env.example .env
```

编辑 `.env` 文件：

```env
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/acca_db

# JWT配置
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# CORS配置
CORS_ORIGIN=http://localhost:3000

# 文件上传配置
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### 启动服务

开发模式（热重载）：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

服务将在 `http://localhost:3000` 启动

## API 接口

### 认证接口

#### 用户注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "用户名",
  "email": "user@example.com",
  "password": "password123"
}
```

**响应：**
```json
{
  "message": "User created successfully",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "用户名",
    "role": "user"
  }
}
```

#### 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### 验证令牌
```http
GET /api/auth/verify
Authorization: Bearer <token>
```

### 用户管理接口

#### 获取所有用户
```http
GET /api/users
Authorization: Bearer <token>
```

#### 获取用户详情
```http
GET /api/users/:id
Authorization: Bearer <token>
```

#### 更新用户
```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "新用户名",
  "email": "new@example.com"
}
```

#### 删除用户
```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

### 文件管理接口

#### 上传文件
```http
POST /api/files/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <file>
```

**响应：**
```json
{
  "message": "File uploaded successfully",
  "file": {
    "id": 1,
    "originalName": "document.pdf",
    "filename": "file-1234567890.pdf",
    "size": 1024000,
    "mimetype": "application/pdf",
    "uploadedAt": "2024-01-01T00:00:00.000Z",
    "downloadUrl": "/api/files/download/1"
  }
}
```

#### 获取文件列表
```http
GET /api/files
Authorization: Bearer <token>
```

#### 下载文件
```http
GET /api/files/download/:id
Authorization: Bearer <token>
```

#### 删除文件
```http
DELETE /api/files/:id
Authorization: Bearer <token>
```

### 健康检查

```http
GET /api/health
```

**响应：**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

## 项目结构

```
backend/
├── src/
│   ├── routes/
│   │   ├── auth.js      # 认证路由
│   │   ├── users.js     # 用户管理路由
│   │   └── files.js     # 文件管理路由
│   └── server.js        # 服务器入口
├── uploads/             # 文件上传目录
├── package.json         # 依赖配置
├── env.example          # 环境变量示例
└── README.md           # 项目文档
```

## 开发说明

### 添加新路由

1. 在 `src/routes/` 目录创建新路由文件
2. 在 `src/server.js` 中注册路由
3. 添加相应的中间件和验证

### 中间件使用

- **helmet** - 安全头设置
- **cors** - 跨域资源共享
- **morgan** - 请求日志
- **express.json** - JSON解析
- **express.urlencoded** - URL编码解析

### 错误处理

所有路由错误都会被全局错误处理中间件捕获，返回统一的错误格式：

```json
{
  "error": "错误信息",
  "message": "详细描述（仅开发环境）"
}
```

## 部署

### 生产环境配置

1. 设置 `NODE_ENV=production`
2. 配置强密码的 `JWT_SECRET`
3. 设置正确的 `CORS_ORIGIN`
4. 配置数据库连接

### Docker 部署

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 安全考虑

- 使用HTTPS（生产环境）
- 定期更新依赖
- 设置强密码策略
- 限制文件上传大小和类型
- 实施速率限制
- 定期备份数据

## 故障排除

### 常见问题

1. **端口被占用**
   - 更改 `PORT` 环境变量
   - 或终止占用端口的进程

2. **文件上传失败**
   - 检查 `UPLOAD_PATH` 目录权限
   - 确认 `MAX_FILE_SIZE` 设置

3. **CORS错误**
   - 检查 `CORS_ORIGIN` 配置
   - 确认前端URL正确

## 许可证

MIT License
