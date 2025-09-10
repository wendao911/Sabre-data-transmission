# Sabre Data Management Desktop Application

一个基于Node.js后端和Electron + React 18前端的文件管理系统。

## 项目结构

```
ACCA/
├── backend/                 # Node.js 后端服务
│   ├── src/
│   │   ├── routes/         # API 路由
│   │   │   ├── auth.js     # 认证相关API
│   │   │   ├── users.js    # 用户管理API
│   │   │   └── files.js    # 文件管理API
│   │   └── server.js       # 服务器入口
│   ├── package.json        # 后端依赖配置
│   └── env.example         # 环境变量示例
├── frontend/                # Electron + React 18 桌面应用
│   ├── public/
│   │   ├── electron.js     # Electron主进程
│   │   └── preload.js      # 预加载脚本
│   ├── src/
│   │   ├── components/     # React组件
│   │   ├── pages/          # 页面组件
│   │   ├── contexts/       # 状态管理
│   │   ├── services/       # API服务
│   │   └── types/          # TypeScript类型
│   ├── package.json        # 前端依赖配置
│   └── tsconfig.json       # TypeScript配置
└── README.md
```

## 功能特性

### 后端功能
- ✅ 用户认证（注册/登录）
- ✅ JWT令牌验证
- ✅ 文件上传/下载
- ✅ 用户管理
- ✅ RESTful API设计
- ✅ 错误处理和日志记录

### 前端功能
- ✅ 现代化桌面界面设计
- ✅ 用户登录/注册界面
- ✅ 文件管理界面
- ✅ 设置页面
- ✅ 跨平台桌面支持
- ✅ 状态管理（Context API）
- ✅ 路由管理（React Router）
- ✅ TypeScript类型安全

## 技术栈

### 后端
- **Node.js** - JavaScript运行时
- **Express.js** - Web应用框架
- **JWT** - 身份验证
- **Multer** - 文件上传处理
- **bcryptjs** - 密码加密
- **CORS** - 跨域资源共享
- **Helmet** - 安全中间件

### 前端
- **Electron** - 桌面应用框架
- **React 18** - UI框架
- **TypeScript** - 类型安全
- **Styled Components** - CSS-in-JS
- **React Router** - 路由管理
- **React Query** - 数据获取
- **Axios** - API通信

## 快速开始

### 后端设置

1. 进入后端目录：
```bash
cd backend
```

2. 安装依赖：
```bash
npm install
```

3. 配置环境变量：
```bash
cp env.example .env
# 编辑 .env 文件，设置你的配置
```

4. 启动开发服务器：
```bash
npm run dev
```

后端服务将在 `http://localhost:3000` 运行

### 前端设置

1. 确保已安装Node.js 16+
2. 进入前端目录：
```bash
cd frontend
```

3. 安装依赖：
```bash
npm install
```

4. 运行应用：
```bash
# 开发模式（同时启动React和Electron）
npm run electron-dev

# 只运行React开发服务器
npm start

# 只运行Electron（需要先构建）
npm run build && npm run electron
```

## API 文档

### 认证接口

#### 用户注册
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "用户名",
  "email": "user@example.com",
  "password": "password123"
}
```

#### 用户登录
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### 验证令牌
```
GET /api/auth/verify
Authorization: Bearer <token>
```

### 文件管理接口

#### 上传文件
```
POST /api/files/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <file>
```

#### 获取文件列表
```
GET /api/files
Authorization: Bearer <token>
```

#### 下载文件
```
GET /api/files/download/:id
Authorization: Bearer <token>
```

#### 删除文件
```
DELETE /api/files/:id
Authorization: Bearer <token>
```

## 开发说明

### 后端开发
- 使用 `npm run dev` 启动开发服务器（支持热重载）
- 使用 `npm start` 启动生产服务器
- API路由位于 `src/routes/` 目录
- 中间件配置在 `src/server.js`

### 前端开发
- 使用 `npm run electron-dev` 启动开发模式
- 使用 `npm run build` 构建React应用
- 使用 `npm run dist` 构建Electron应用
- 界面组件位于 `src/pages/` 目录
- 状态管理在 `src/contexts/` 目录

## 部署说明

### 后端部署
1. 设置生产环境变量
2. 安装生产依赖：`npm install --production`
3. 启动服务：`npm start`

### 前端部署
1. 构建应用：
```bash
npm run dist-win   # Windows
npm run dist-mac   # macOS
npm run dist-linux # Linux
```
2. 分发构建产物（位于 `dist/` 目录）

## 扩展计划

### 移动端支持
- 当前Electron项目专注于桌面端
- 可以基于React代码库开发移动端应用
- 使用相同的API和业务逻辑

### 功能扩展
- [ ] 文件加密/解密
- [ ] 云存储集成
- [ ] 实时协作
- [ ] 高级搜索
- [ ] 文件版本控制
- [ ] 用户权限管理

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请通过以下方式联系：
- 项目Issues
- 邮箱：your-email@example.com
