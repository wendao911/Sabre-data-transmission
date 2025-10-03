# Files 模块

职责：本地文件浏览、上传/下载、上传日志与统计。

- 路由：`src/routes/files.js`
- 服务：`src/services/fileService.js`
- 模型：`src/models/FileUploadLog.js`

## 能力
- 浏览目录：分页/排序/隐藏文件过滤
- 上传文件：记录 `FileUploadLog`
- 下载/删除：越权路径校验、同步日志删除
- 日志查询/统计：分页与聚合

## API 摘要
- GET `/api/files/browser`
- POST `/api/files/upload` (multipart)
- GET `/api/files/download`
- DELETE `/api/files/delete`
- GET `/api/files/upload-logs`
- GET `/api/files/upload-log/by-path`
- PUT `/api/files/upload-log/:id/remark`
- GET `/api/files/upload-stats`

## 错误码
- `FILES_PATH_OUT_OF_ROOT`
- `FILES_PATH_NOT_FOUND`
- `FILES_NOT_A_FILE`
- `FILES_UPLOAD_FAILED`

## 响应示例（分页）
```
{
  success: true,
  data: { items: [] },
  pagination: { current: 1, pageSize: 20, total: 0, pages: 0 },
  code: "OK"
}
```
