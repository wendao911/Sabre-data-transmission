# FileTypeConfig 模块

职责：维护模块文件类型至推送路径的配置，供上传/同步等场景引用。

- 路由：`src/routes/fileTypeConfig.js`
- 服务：`src/services/fileTypeConfigService.js`
- 模型：`src/models/FileTypeConfig.js`

## API 摘要
- 列表/详情：`GET /api/file-type-config`、`GET /api/file-type-config/:id`
- 新增/更新/删除/批量删除
- 模块选项：`GET /api/file-type-config/modules`

## 错误码
- `FTC_SERIAL_EXISTS`
- `FTC_CONFIG_NOT_FOUND`

## 说明
- `serialNumber` 可选但唯一（稀疏）
- 变更会记录系统日志
