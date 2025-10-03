# Jobs 子系统

职责：承载跨模块的定时执行逻辑（解密、SFTP 同步），基于 DB 配置动态注册/热更新。

- 目录：`src/jobs/`
  - `decrypt/`：解密任务入口
  - `sftp/`：SFTP 同步任务入口
  - `registry.js`：任务注册器（读取 `config_schedule`，注册/热更新）

## 工作流概览
1. 服务启动时：`server.js` 调用 `registerAllJobs()`，按 DB 配置注册全部任务。
2. 前端保存任务配置：`POST /api/schedule/update` 写入 `config_schedule` 并触发 `reloadTask(taskType)` 热更新。
3. 到期触发：按 `Asia/Phnom_Penh` 时区执行对应 job 的 `run()`。

## 配置表：`config_schedule`
- `taskType`：`decrypt|transfer`
- `cron`：标准 crontab 表达式
- `enabled`：是否启用
- `params`：任务参数（预留）
- `lastRunAt`：上次执行时间（由 job 更新）
- `nextRunAt`：仅展示用途

## registry.js
- `registerAllJobs()`：读取全部配置，注册 enabled=true 的任务
- `reloadTask(taskType)`：
  - 若配置被删除：取消已注册任务
  - 若 `enabled=false`：取消并不再注册
  - 否则：用最新 `cron` 重新注册（时区固定 `Asia/Phnom_Penh`）
- `getAllSchedules()`：返回当前已注册任务及 `nextRunAt`

## decrypt 任务（`jobs/decrypt/index.js`）
- 读取 `taskType=decrypt` 配置；若 disabled 且 `force!==true`，跳过
- 计算柬埔寨时区“前一天”为默认日期（可通过参数覆盖 `YYYYMMDD`）
- 执行：`services/decryptService.batchProcessFiles(date)`（支持 SSE 进度）
- 写入：`SystemLogService.logSchedulerStatus(...)`、`logSystemError(...)`，并更新 `lastRunAt`

### 手动触发
```
POST /api/schedule/run
{ "taskType": "decrypt" }
```

## sftp 任务（`jobs/sftp/index.js`）
- 读取 `taskType=transfer` 配置；若 disabled 且 `force!==true`，跳过
- 计算柬埔寨时区“前一天”为默认日期，格式化 `YYYY-MM-DD`
- 连接激活的 `SFTPConfig`，执行 `services/syncService.syncByMapping(dateStr)`
- 写入：系统日志 + 更新 `lastRunAt`

### 手动触发
```
POST /api/schedule/run
{ "taskType": "transfer" }
```

## 时区与 cron
- 时区固定 `Asia/Phnom_Penh`
- cron 示例：
  - 每天 03:00：`0 3 * * *`
  - 每 5 分钟：`*/5 * * * *`

## 错误与日志
- 所有执行成功/失败均通过 `SystemLogService` 写入 `system_logs`
- 建议错误码：
  - `SCHEDULE_INVALID_PARAMS`、`SCHEDULE_UNSUPPORTED_TASK`
  - 任务内部错误交由对应模块（`DECRYPT_*`、`SFTP_*`）编码

## 本地验证
1. 写入两条配置：
```
{ taskType: 'decrypt', cron: '*/5 * * * *', enabled: true }
{ taskType: 'transfer', cron: '*/7 * * * *', enabled: true }
```
2. `npm run dev` 启动后端
3. 观察每 5/7 分钟的系统日志，或在 `/api/schedule/runtime` 查看注册情况
4. 修改 `cron/enabled` 后，确认已触发 `reloadTask` 并立即生效
