# System 模块

职责：系统与任务运行日志的统一记录、查询与统计。

- 路由：`src/routes/system.js`
- 服务：`src/services/systemLogService.js`
- 模型：`src/models/SystemLog.js`

## API 摘要（只读接口）
- `GET /api/system/logs`：分页查询（支持 level/module/action/时间范围/全文搜索）
- `GET /api/system/logs/stats`：聚合统计（按 level/module 汇总）
- `DELETE /api/system/logs`：清理旧日志（默认 30 天）
- `GET /api/system/status`：系统状态概览（24h 统计、最近错误、启动时间/uptime）

## 日志写入（服务端代码调用）
通过 `SystemLogService` 统一写入：

- `logSystemLifecycle(action, message, details?)`
- `logDatabaseStatus(action, message, details?)`
- `logSchedulerStatus(action, message, details?)`
- `logFileOperation(module, action, message, details?)`
- `logSystemError(module, action, message, error, details?)`
- `logSystemWarning(module, action, message, details?)`
- `logConfigChange(configType, action, message, details?)`
- `logPerformance(module, action, message, details?)`
- `logSecurityEvent(action, message, details?)`

示例：
```
await SystemLogService.logSchedulerStatus('jobs_registered', '定时任务注册完成', { registeredAt: new Date() });
await SystemLogService.logSystemError('sftp', 'daily_transfer', 'SFTP 映射同步失败', err, { date });
```

## Model 字段（`SystemLog`）
- `level`: `info|warn|error`
- `module`: 字符串，如 `system|database|scheduler|sftp|files|security|config`
- `action`: 动作名，如 `startup|connect|jobs_registered|task_failed`
- `message`: 简短文本
- `details`: 任意结构（上下文、统计、错误堆栈等）
- `createdAt`: Date（索引：`{ module, action, createdAt }`）

## 查询参数（摘录）
- `/api/system/logs?level=error&module=sftp&action=daily_transfer&startDate=2025-09-01&endDate=2025-09-30&searchText=failed&sortBy=createdAt&sortOrder=-1&page=1&pageSize=50`

## 响应示例（分页）
```
{
  success: true,
  data: {
    logs: [ { level: "info", module: "system", action: "startup", message: "系统启动中" } ],
    pagination: { current: 1, pageSize: 50, total: 123, pages: 3 }
  },
  code: "OK"
}
```

## 错误码（建议）
- 通用：`VALIDATION_ERROR`、`NOT_FOUND`、`INTERNAL_ERROR`
- 系统日志模块：按路由层统一规范返回（见根 README），本模块查询通常不返回专有错误码，失败时使用通用码

## 维护建议
- 在关键生命周期/错误路径调用 `SystemLogService`；不要直接写 `SystemLog.create`
- 大字段/高频日志中仅存必要信息，避免 `details` 过大影响查询与存储
