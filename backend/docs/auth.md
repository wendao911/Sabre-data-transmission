# Auth 模块

职责：用户注册/登录/令牌校验。

- 路由：`src/routes/auth.js`
- 服务：`src/services/authService.js`
- 模型：`src/models/User.js`

## API 摘要
- 注册：`POST /api/auth/register`
- 登录：`POST /api/auth/login`
- 验证：`GET /api/auth/verify`（Header: `Authorization: Bearer <token>`）

## 请求示例
注册：
```
POST /api/auth/register
Content-Type: application/json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "secret123"
}
```

登录：
```
POST /api/auth/login
Content-Type: application/json
{
  "email": "alice@example.com",
  "password": "secret123"
}
```

## 响应（成功）
```
{
  "message": "Login successful",
  "token": "<jwt>",
  "user": { "id": "...", "email": "...", "name": "...", "role": "user" }
}
```

## 错误码
- `AUTH_INVALID_CREDENTIALS`
- `AUTH_TOKEN_MISSING`
- `AUTH_TOKEN_INVALID`

## 说明
- JWT 配置来自 `config.jwt`（secret、expiresIn）
- 密码使用 `bcryptjs` 进行加密与校验
