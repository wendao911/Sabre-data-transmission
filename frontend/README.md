# Sabre Data Management Desktop - 文件管理与解密系统

基于 Electron、React 18、Tailwind CSS 和 Ant Design 构建的现代化桌面应用程序。

## 🚀 功能特性

- **文件管理**: 上传、下载、删除和管理文件
- **GPG解密**: 批量解密GPG加密文件
- **现代化UI**: 使用Tailwind CSS和Ant Design构建的美观界面
- **跨平台**: 支持Windows、macOS和Linux
- **实时状态**: 实时显示解密进度和系统状态

## 🛠️ 技术栈

- **前端框架**: React 18
- **桌面框架**: Electron
- **样式框架**: Tailwind CSS
- **UI组件库**: Ant Design
- **状态管理**: React Context + Hooks
- **HTTP客户端**: Axios
- **路由**: React Router DOM
- **通知**: React Hot Toast

## 📦 安装依赖

```bash
npm install
```

## 🚀 开发模式

### 启动React开发服务器
```bash
npm start
```

### 启动Electron应用
```bash
npm run electron-dev
```

## 🏗️ 构建应用

### 构建React应用
```bash
npm run build
```

### 打包Electron应用
```bash
# 所有平台
npm run dist

# Windows
npm run dist-win

# macOS
npm run dist-mac

# Linux
npm run dist-linux
```

## 📁 项目结构

```
frontend/
├── public/                 # 静态资源
│   ├── electron.js        # Electron主进程
│   ├── preload.js         # 预加载脚本
│   ├── index.html         # HTML模板
│   └── manifest.json      # 应用清单
├── src/
│   ├── components/        # React组件
│   │   ├── Layout.jsx     # 布局组件
│   │   └── DecryptPanel.jsx # 解密面板
│   ├── pages/             # 页面组件
│   │   ├── HomePage.jsx   # 首页
│   │   ├── LoginPage.jsx  # 登录页
│   │   ├── FileManagementPage.jsx # 文件管理页
│   │   └── SettingsPage.jsx # 设置页
│   ├── contexts/          # React Context
│   │   ├── AuthContext.jsx # 认证上下文
│   │   └── FileContext.jsx # 文件上下文
│   ├── hooks/             # 自定义Hooks
│   │   ├── useAuth.js     # 认证Hook
│   │   └── useFiles.js    # 文件Hook
│   ├── services/          # API服务
│   │   └── api.js         # API客户端
│   ├── types/             # 类型定义
│   │   └── index.js       # 类型定义
│   ├── App.jsx            # 主应用组件
│   ├── index.jsx          # 入口文件
│   └── index.css          # 全局样式
├── package.json           # 项目配置
├── tailwind.config.js     # Tailwind配置
└── postcss.config.js      # PostCSS配置
```

## 🔧 配置说明

### Tailwind CSS
项目使用Tailwind CSS进行样式管理，配置文件位于 `tailwind.config.js`。

### Ant Design
使用Ant Design作为UI组件库，主题配置在 `App.jsx` 中。

### Electron
Electron主进程文件位于 `public/electron.js`，预加载脚本位于 `public/preload.js`。

## 🔐 解密功能

解密功能需要以下文件：
- `K6-primary-key.asc` - GPG私钥文件
- `backend/src/assets/K6-gpg-psd.psd` - 密码文件
- `Sabre Data Encryption/` - 加密文件目录

解密后的文件将保存在 `Sabre Data Decryption/` 目录下，按日期分组。

## 🌐 API接口

应用需要连接到后端API服务（默认端口3000）：

- `GET /api/decrypt/status` - 获取解密状态
- `POST /api/decrypt/start` - 开始解密
- `GET /api/decrypt/files` - 获取文件列表

## 📝 开发说明

1. 确保后端服务正在运行
2. 运行 `npm start` 启动React开发服务器
3. 运行 `npm run electron-dev` 启动Electron应用
4. 在浏览器中访问 `http://localhost:3000` 进行开发

## 🐛 故障排除

### 常见问题

1. **端口冲突**: 确保3000端口未被占用
2. **依赖安装失败**: 删除 `node_modules` 和 `package-lock.json`，重新运行 `npm install`
3. **Electron启动失败**: 确保已安装所有依赖，特别是 `electron-is-dev`

### 调试

- 开发模式下会自动打开开发者工具
- 查看控制台输出获取错误信息
- 检查网络请求是否正常

## 📄 许可证

MIT License
