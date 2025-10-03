# Assets 资源说明

目录：`src/assets/`

用于解密与 SFTP 相关的静态资源（密钥、密码文件等）。当前包含：
- `K6-primary-key.asc`：K6 私钥（较新日期使用）
- `AITS-primary-key.asc`：AITS 私钥（较早日期使用）
- `K6-gpg-psd.psd`：K6 私钥的密码文件（纯文本，服务在运行时读取）

## 使用位置
- `services/decryptService.js`
  - `getKeyForDate(date)`：根据日期选择 `AITS` 或 `K6` 私钥
  - `readPassphrase(keyFile)`：读取 `K6-gpg-psd.psd` 作为 passphrase（AITS 无口令）
- GPG 调用：`decryptGpgFile` / `importPrivateKey`

## 安全建议
- 生产环境中，避免将密钥与密码文件随代码仓库部署：
  - 将 `*.asc` 与 `*.psd` 放置到独立的安全挂载卷或密钥管理系统（如 KMS/HashiCorp Vault）
  - 通过环境变量配置实际路径（`config.decrypt` 中透传）
- 确保部署主机的文件权限严格（仅运行用户可读）
- 对资源的访问留痕（操作系统审计/容器审计）

## 配置要点
- `config.decrypt` 中的路径：
  - `encryptionDir`：待解密文件根目录
  - `decryptionDir`：输出目录
  - `keyDir`：密钥目录（默认 `src/assets/`）
  - `passphraseFile`：口令文件（默认 `src/assets/K6-gpg-psd.psd`）

根据业务需求可在 `config` 中改为绝对路径并与资产解耦。
