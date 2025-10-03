# SFTP 模块

职责：SFTP 连接/断开、远程目录文件操作、上传/下载、按映射规则同步，以及传输日志查询。

- 路由：`src/routes/sftp.js`、`src/routes/sftpTransferLogs.js`
- 服务：`src/services/sftpService.js`、`src/services/syncService.js`、`src/services/sftpRouteService.js`、`src/services/sftpLogsService.js`
- 模型：`src/models/SFTPConfig.js`、`src/models/TransferLogTask.js`、`src/models/TransferLogRule.js`、`src/models/TransferLogFile.js`

## API 摘要
- 状态/连接：`GET /status`、`POST /connect`、`POST /disconnect`、`POST /connect/active`
- 目录/文件：`GET /list`、`POST /mkdir`、`POST /download`、`GET /download-stream`、`DELETE /file`、`DELETE /dir`
- 映射同步：`POST /sync/by-mapping`
- 日志：`GET /transfer-logs/tasks|rules|files|stats`、`GET /transfer-logs/tasks/:taskId`

## 错误码
- `SFTP_NOT_CONNECTED`、`SFTP_CONNECT_FAILED`
- `SFTP_UPLOAD_FAILED`、`SFTP_DOWNLOAD_FAILED`

## 说明
- 连接参数来源：前端或激活的 `SFTPConfig`
- 同步逻辑见 `services/syncService.js`（按 `file_mapping_rules` 与日期变量执行）
