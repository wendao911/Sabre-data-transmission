# Decrypt 模块

职责：加密文件发现、按天批量解密、目录准备、密钥/密码选择；提供日志与状态查询。

- 路由：`src/routes/decrypt.js`、`src/routes/decryptLogs.js`
- 服务：`src/services/decryptService.js`、`src/services/decryptLogsService.js`
- 模型：`src/models/DecryptLog.js`

## 能力
- `batchProcessFiles(date)`：批量解密（SSE 进度推送）
- 列出某日加密文件/已解密文件
- 解密日志分页与统计

## API 摘要
- GET `/api/decrypt/encrypted-dates-with-status`
- GET `/api/decrypt/encrypted-files?date=YYYYMMDD`
- GET `/api/decrypt/decrypted-files?date=YYYYMMDD`
- POST `/api/decrypt/batch-process-stream` (SSE)
- GET `/api/decrypt/logs`
- GET `/api/decrypt/logs/stats`

## 错误码
- `DECRYPT_INVALID_DATE`
- `DECRYPT_KEY_MISSING`
- `DECRYPT_EXEC_FAILED`

## 说明
- 密钥文件路径与密码文件由 `config.decrypt` 与 `src/assets/*` 提供
- 日期格式统一 `YYYYMMDD`
