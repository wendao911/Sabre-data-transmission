# Config 配置说明（键位含义）

目录：`src/config/`
- `index.js`：聚合并导出配置；按 `NODE_ENV` 读取 `env/<env>.js` 覆盖默认值。
- `env/development.js` / `env/production.js`：环境差异化配置文件。

## 顶层键位

- `server`
  - `port`：HTTP 服务监听端口。
  - `nodeEnv`：运行环境标识（development/production/test）。仅用于日志与条件分支控制。

- `cors`
  - `origin`：允许的前端来源（字符串或数组）。用于跨域访问控制。

- `database`
  - `uri`：MongoDB 连接串（含库名与认证信息）。
  - `options.maxPoolSize`：最大连接池大小（并发访问上限）。
  - `options.minPoolSize`：最小连接池大小（空闲连接保留）。
  - `options.connectTimeoutMS`：建连超时时间（毫秒）。
  - `options.socketTimeoutMS`：套接字空闲超时时间（毫秒）。
  - `options.serverSelectionTimeoutMS`：服务发现超时时间（毫秒）。

- `jwt`
  - `secret`：JWT 签名密钥，影响登录令牌签发与校验。
  - `expiresIn`：JWT 过期时间（如 `7d`）。

- `file`
  - `maxSize`：单次请求体/上传数据大小上限（字节）。影响 `express.json/urlencoded` 与上传限制。

- `fileBrowser`
  - `rootPath`：本地文件浏览与映射同步的基准根路径。所有路径解析会校验不得越出该根目录。

- `decrypt`
  - `encryptionDir`：待解密文件的根目录。
  - `decryptionDir`：解密输出根目录（解密后会在此目录下按日期分组存放）。
  - （说明）密钥与口令默认从 `src/assets` 推导；如需自定义，可在环境配置中扩展相应路径并在服务内读取。

- `timezone`
  - `timezone`：后端统一使用的时区标识。Jobs 注册与统计均以该时区计算时间（例如 `Asia/Phnom_Penh`）。

- `sftp`
  - `connectionMaxMs`：SFTP 连接有效期（毫秒）。超出时视为失效，需重连。

## 行为说明

- 配置合并：`index.js` 提供默认值，按 `NODE_ENV` 合并 `env/<env>.js` 后导出。
- 敏感信息：仅在调试接口 `/api/config-check` 中脱敏展示可见性；不要在日志中输出明文密钥。
- 路由/服务使用：
  - 鉴权：`authService` 使用 `jwt.*`。
  - 数据库：`server.js` 使用 `database.*` 建立连接。
  - 上传/浏览：`files` 相关服务使用 `file.*` 与 `fileBrowser.rootPath`。
  - 解密：`decryptService` 使用 `decrypt.*`。
  - 调度：`jobs/registry` 与业务服务使用 `timezone.timezone`。
  - SFTP：`sftpService` 使用 `sftp.connectionMaxMs` 判断连接是否过期。

## 调优与安全建议

- 生产环境设置独立的 `env/production.js`：覆盖端口、数据库、CORS、文件根路径与时区等关键项。
- 数据库连接池参数应结合并发量与 MongoDB 部署规模调优。
- 将密钥/口令与目录路径配置为绝对路径，放置于挂载卷或密钥管理系统，避免随代码分发。
- 定期检查 `/api/config-check` 结果（敏感信息脱敏）以验证环境配置生效情况。
