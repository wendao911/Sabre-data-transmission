# Schedule 模块

职责：任务配置（decrypt/transfer）的持久化、热更新与手动触发（执行由 jobs 层负责）。

- 路由：`src/routes/schedule.js`
- 服务：`src/services/schedulerService.js`、`src/services/scheduleRouteService.js`
- 模型：`src/models/ScheduleConfig.js`
- Jobs：`src/jobs/*`、`src/jobs/registry.js`

## API 摘要
- `GET /api/schedule`：列表
- `POST /api/schedule/update`：保存并热更新
- `GET /api/schedule/runtime`：查看已注册任务
- `POST /api/schedule/run`：手动触发

## 错误码
- `SCHEDULE_INVALID_PARAMS`
- `SCHEDULE_UNSUPPORTED_TASK`

## 说明
- 调度时区固定 `Asia/Phnom_Penh`
- 保存后调用 `registry.reloadTask` 即刻生效
