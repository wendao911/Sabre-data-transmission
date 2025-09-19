# SFTP 测试环境

这个文件夹包含了用于测试 SFTP 功能的 Docker 配置。

## 文件说明

- `docker-compose.yml` - 使用官方 atmoz/sftp 镜像的简单配置
- `docker-compose.custom.yml` - 使用自定义 Dockerfile 的配置
- `Dockerfile.sftp` - 自定义 SFTP 服务器配置
- `README.md` - 本说明文件

## 快速开始

### 方法一：使用官方镜像（推荐）

```bash
# 进入测试目录
cd sftp_test

# 启动 SFTP 服务器
docker-compose up -d

# 查看服务状态
docker-compose ps

# 停止服务
docker-compose down
```

### 方法二：使用自定义镜像

```bash
# 进入测试目录
cd sftp_test

# 启动自定义 SFTP 服务器
docker-compose -f docker-compose.custom.yml up -d

# 查看服务状态
docker-compose -f docker-compose.custom.yml ps

# 停止服务
docker-compose -f docker-compose.custom.yml down
```

## 连接信息

### SFTP 连接参数
- **主机**: localhost
- **端口**: 2222
- **用户名**: testuser
- **密码**: password
- **根目录**: /uploads

### 文件管理界面
- **URL**: http://localhost:8080
- **用途**: 通过 Web 界面管理 SFTP 文件

## 测试用户

### 方法一（官方镜像）
- 用户名: `testuser`
- 密码: `password`
- 用户ID: 1001
- 主目录: `/home/testuser/uploads`

### 方法二（自定义镜像）
- 用户1: `testuser` / `password` (ID: 1001)
- 用户2: `admin` / `admin123` (ID: 1002)

## 目录结构

```
sftp_test/
├── sftp-data/          # testuser 的文件目录
├── sftp-admin-data/    # admin 的文件目录（仅自定义版本）
├── docker-compose.yml
├── docker-compose.custom.yml
├── Dockerfile.sftp
└── README.md
```

## 在应用中测试

1. 启动 SFTP 测试服务器
2. 在系统设置中配置 SFTP 连接：
   - 主机: `localhost`
   - 端口: `2222`
   - 用户名: `testuser`
   - 密码: `password`
   - 协议: `SFTP`
3. 在 SFTP 传输页面测试连接和文件操作

## 清理

```bash
# 停止并删除容器
docker-compose down

# 删除数据卷（可选）
docker-compose down -v

# 删除自定义镜像（如果使用）
docker rmi sftp_test_custom-sftp-server
```
