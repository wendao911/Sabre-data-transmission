# ACCA Backend - 三层架构与统一响应规范

基于 Node.js + Express 的后端服务。现已完成三层架构（routes/services/models）改造，并引入统一响应体与错误码约定。

## 功能特性

- 🔐 身份认证与用户管理
- 📁 服务器本地文件浏览（搜索/排序/分页）
- 🔑 Sabre 数据按天解密（支持密钥/密码自动选择）
- 🚀 SFTP 文件传输（两栏浏览、本地→SFTP 传输、映射同步）
- ⏲️ 任务配置与注册（前端配置 cron 与启用状态，后端 jobs 执行）
- 🛡️ 常用安全中间件、请求日志

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

## 模块与目录结构

```
backend/
└── src/
    ├── server.js               # 应用入口：中间件/路由注册、启动后注册 jobs
    ├── utils/                  # 工具（与业务弱相关）
    │   └── date.js
    ├── jobs/                   # 定时任务执行与注册
    │   ├── decrypt/
    │   ├── sftp/
    │   └── registry.js
    ├── models/                 # 数据模型（Mongoose）
    ├── services/               # 业务逻辑（不依赖 Express）
    └── routes/                 # 路由，仅做参数解析与调用 services
```

### 模块职责说明（要点）
- `utils/date`（工具模块）
  - 统一日期处理：格式化（YYYYMMDD/YYYY-MM-DD）、解析字符串、替换规则中的日期变量

- decrypt（`services/decryptService.js`）
  - `batchProcessFiles(date)`：批量解密；`getEncryptedFilesByDate`、`listDecryptedFiles` 查询

- sftp（`services/sftpService.js`、`services/syncService.js`、`services/sftpRouteService.js`）
  - 基础 SFTP 操作/映射同步/路由编排下沉

- fileMapping（文件映射规则）
  - 定义 `file_mapping_rules`，字段含 `source/destination/schedule/module/priority/enabled`
  - 被 `syncService` 消费以决定当天需要同步的源文件与目标命名/路径

- schedule（任务配置）
  - 仅存储配置（`config_schedule`：taskType/cron/enabled/params/lastRunAt/nextRunAt）
  - 保存配置后由 `jobs/registry.reloadTask(taskType)` 热更新定时器

- system（系统日志）

## 统一响应体与错误码

所有 API 返回统一结构：

```
{
  success: true|false,
  data?: any,
  message?: string,
  code?: string,
  error?: string,
  details?: object,
  pagination?: { current, pageSize, total, pages }
}
```

错误码建议：

- 通用：`OK`、`VALIDATION_ERROR`、`NOT_FOUND`、`INTERNAL_ERROR`
- auth：`AUTH_INVALID_CREDENTIALS`、`AUTH_TOKEN_MISSING`、`AUTH_TOKEN_INVALID`
- files：`FILES_PATH_OUT_OF_ROOT`、`FILES_PATH_NOT_FOUND`、`FILES_NOT_A_FILE`、`FILES_UPLOAD_FAILED`
- decrypt：`DECRYPT_INVALID_DATE`、`DECRYPT_KEY_MISSING`、`DECRYPT_EXEC_FAILED`
- fileTypeConfig：`FTC_SERIAL_EXISTS`、`FTC_CONFIG_NOT_FOUND`
- sftp：`SFTP_NOT_CONNECTED`、`SFTP_CONNECT_FAILED`、`SFTP_UPLOAD_FAILED`、`SFTP_DOWNLOAD_FAILED`
- schedule：`SCHEDULE_INVALID_PARAMS`、`SCHEDULE_UNSUPPORTED_TASK`

路由处理建议：将服务层抛出的错误映射为上述 `code` 与合适 HTTP 状态码（400/401/404/409/500）。
  - `SystemLog` 统一记录 Job 运行日志（成功/失败/统计数据/耗时）

- `jobs/decrypt`（Job 执行模块：解密）
  - 读取 `config_schedule` 的 decrypt 配置；若 `enabled=false` 且未强制，则跳过
  - 计算柬埔寨时区“前一天”日期（或用传入 `YYYYMMDD`）
  - 调用 `batchProcessFiles` 解密并写 `system_logs` + 更新 `lastRunAt`

- `jobs/sftp`（Job 执行模块：SFTP 映射同步）
  - 读取 `config_schedule` 的 transfer 配置；若 `enabled=false` 且未强制，则跳过
  - 计算柬埔寨时区“前一天”日期（或用传入 `YYYY-MM-DD`）
  - 连接激活 SFTP 配置后，调用 `syncByMapping` 同步，写日志并更新 `lastRunAt`

- `jobs/registry`（Job 注册模块）
  - `registerAllJobs()`：服务启动时按 DB 配置注册全部定时器
  - `reloadTask(taskType)`：保存配置后热更新指定任务（仅 cron/enabled）

## API 接口（选摘）

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

## 解密与 SFTP 任务

### 1) 解密任务（jobs/decrypt）
- 入口：`src/jobs/decrypt/index.js`
- 执行逻辑：
  - 读取 `config_schedule` 中 `taskType=decrypt` 配置（enabled/cron/params）
  - 默认取柬埔寨时区“前一天”为处理日期，可传 `{ date: 'YYYYMMDD' }` 覆盖
  - 调用 `modules/decrypt/services/decryptService.batchProcessFiles(date)` 执行
  - 写入系统日志 `system_logs` 并更新 `lastRunAt`

手动触发示例：
```js
const { decrypt } = require('./src/jobs');
await decrypt.run();                 // 前一天
await decrypt.run({ date: '20250925' });
await decrypt.run({ force: true });  // 忽略 DB 是否启用
```

输入/输出与边界情况：
- 入参 `date`：字符串 `YYYYMMDD`；若无则取柬埔寨时区“前一天”。
- 返回：`{ success, date, result | error }`，`result` 含 `total/processed/decrypted/copied/failed/errors`。
- 目录要求：
  - 加密目录：`config.decrypt.encryptionDir`
  - 解密输出：`config.decrypt.decryptionDir/{date}`（若不存在会自动创建）
- 密钥/密码：自动根据日期选择 `AITS-primary-key.asc` 或 `K6-primary-key.asc`；K6 密码文件位于 `backend/src/assets/K6-gpg-psd.psd`。
- 失败重试：暂不内置重试；错误会记录到 `system_logs`。

### 2) SFTP 映射同步任务（jobs/sftp）
- 入口：`src/jobs/sftp/index.js`
- 执行逻辑：
  - 读取 `config_schedule` 中 `taskType=transfer` 配置（enabled/cron/params）
  - 默认取柬埔寨时区“前一天”为处理日期（同步映射按 `YYYY-MM-DD`）
  - 连接激活的 SFTP 配置，调用 `modules/sftp/services/syncService.syncByMapping(dateStr)`
  - 写入系统日志并更新 `lastRunAt`

手动触发示例：
```js
const { sftp } = require('./src/jobs');
await sftp.run();                        // 前一天
await sftp.run({ date: '2025-09-25' });  // 指定日期（YYYY-MM-DD）
await sftp.run({ force: true });         // 忽略 DB 是否启用
```

同步细节说明（syncService.syncByMapping）：
- 数据模型：`file_mapping_rules` 中的规则，字段包含 `source/destination/schedule/module/priority/enabled`。
- 日期变量：
  - `{date}` -> `YYYYMMDD`
  - `{Date:YYYY-MM-DD}` -> `YYYY-MM-DD`
- 匹配逻辑（getFileList）：
  - 基于 `config.fileBrowser.rootPath + source.directory`；先替换日期变量，再将通配符转正则；文件匹配会以“文件名+真实后缀”做匹配，解决 `_TXT` 场景。
- 目标路径与文件名：
  - path 支持日期变量；filename 支持 `{baseName}` 与 `{ext}`。
- 冲突策略：
  - `skip`（默认）：存在则跳过
  - `overwrite`：覆盖
  - `rename`：自动在名称后追加 `_n` 直至唯一
- 周期判定：
  - daily/weekly/monthly/adhoc；weekly 需 `weekday(0-6)`，monthly 需 `monthday(1-31)`。
- 结果记录：
  - 会话级别 `sync_sessions`：总统计与 `ruleResults`；`ruleResults.failedFilesDetails` 中含失败文件清单
  - adhoc：使用 `adhoc_file_sync_schema` 避免重复同步同一文件

返回结构（简化）：
```json
{
  "success": true,
  "data": {
    "totalFiles": 10,
    "synced": 8,
    "skipped": 1,
    "failed": 1,
    "details": [
      {
        "ruleId": "...",
        "ruleName": "...",
        "periodType": "daily",
        "status": "partial",
        "totalFiles": 5,
        "syncedFiles": 4,
        "skippedFiles": 0,
        "failedFiles": 1,
        "failedFilesDetails": [ { "filename": "...", "errorMessage": "..." } ]
      }
    ]
  }
}
```

## 任务配置与热更新

- 前端页面：`/system-config/scheduled-task`
- 后端配置集合：`config_schedule`
  - 字段：`taskType`（decrypt/transfer）、`cron`、`enabled`、`params`、`lastRunAt`、`nextRunAt`
- 保存配置时：后端会调用 `jobs/registry.reloadTask(taskType)`，立即按最新 `cron` 与 `enabled` 重新注册任务（无需重启）
- 服务启动时：`server.js` 调用 `registerAllJobs()`，按 DB 配置注册全部任务

注意：调度时区固定为 `Asia/Phnom_Penh`。

### 任务热更新工作流
1. 前端在“定时任务配置”页面修改 `cron` 或 `启用` 并保存
2. 后端 `/api/schedule/update` 持久化配置后调用 `jobs/registry.reloadTask(taskType)`
3. 注册器会：
   - 若该任务已存在，`stop()` 并移除
   - 若 `enabled=false`，不注册
   - 否则用最新 `cron` 在 `Asia/Phnom_Penh` 时区重新 schedule

### 数据表结构摘录
- `config_schedule`
  - `taskType`: `decrypt|transfer`
  - `cron`: 字符串（如 `0 3 * * *`）
  - `enabled`: 布尔
  - `params`: 任意对象（预留）
  - `lastRunAt`: Date（由 job 更新）
  - `nextRunAt`: 仅保留字段，当前不由 schedule 服务维护
- `system_logs`
  - `level`: `info|warn|error`
  - `module`: `decrypt|sftp|...`
  - `action`: `daily_decrypt|daily_transfer|...`
  - `message`: 简短文本
  - `details`: 任意结构（包含 date、耗时、统计等）
  - `createdAt`: Date

## 配置要点

### 1) decrypt 配置（`src/config.js`）
- `decrypt.encryptionDir`: 加密文件根目录（绝对路径）
- `decrypt.decryptionDir`: 解密输出根目录（绝对路径）

### 2) 文件浏览器根目录
- `fileBrowser.rootPath`: 本地文件浏览器与同步源目录计算的基准路径

### 3) 时区
- `timezone.timezone`：建议与调度使用的 `Asia/Phnom_Penh` 保持一致（jobs 内部已固定调度时区）

## 运行与排错

### 常见问题
- 同步统计与前端显示不一致：检查前端是否读取 `data.details` 或 `ruleResults` 字段；当前前端映射为 `ruleResults <- details`。
- 模式匹配不上 `_TXT` 文件：确保规则 `*.TXT` 场景下，代码使用“文件名+真实后缀”做匹配（已在 `getFileList` 处理）。
- SFTP 提示未连接：确保先在页面点击连接，或在 job 中使用激活配置连接。
- 任务未按新 cron 执行：确认已保存配置，并在保存后后端日志出现 `Jobs 已根据配置完成注册` 或 `reloadTask` 执行；查看 `jobs/registry.js` 是否报错。

### 本地验证步骤
1. 配置 `config_schedule` 两条记录：
   - `{ taskType: 'decrypt', cron: '*/5 * * * *', enabled: true }`
   - `{ taskType: 'transfer', cron: '*/7 * * * *', enabled: true }`
2. 启动后端 `npm run dev`
3. 观察 5/7 分钟周期日志写入到 `system_logs`
4. 修改前端页面的 cron，保存；后端应热更新并立即应用新表达式


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
