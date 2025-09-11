const { Client } = require('basic-ftp');
const fs = require('fs');
const path = require('path');
const config = require('../config');

class FTPService {
  constructor() {
    this.client = new Client();
    this.isConnected = false;
    this.lastConnectionTime = null;
  }

  /**
   * 连接到FTP服务器
   * @param {Object} ftpParams - FTP配置参数
   * @param {string} ftpParams.host - FTP服务器地址
   * @param {number} ftpParams.port - FTP端口
   * @param {string} ftpParams.user - 用户名
   * @param {string} ftpParams.password - 密码
   * @param {boolean} ftpParams.secure - 是否使用FTPS
   */
  async connect(ftpParams = {}) {
    const maxRetries = 3;
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // 如果之前有连接，先关闭
        if (this.client && this.isConnected) {
          try {
            await this.client.close();
          } catch (closeError) {
            console.log('关闭旧连接时出错:', closeError.message);
          }
        }
        
        this.client = new Client();
        
        // 设置更长的超时时间和重试配置
        this.client.ftp.timeout = 60000; // 60秒
        this.client.ftp.verbose = false; // 减少日志输出
        
        // 从配置获取默认值，API参数优先
        const ftpConfig = {
          host: ftpParams.host || config.ftp.host,
          port: ftpParams.port || config.ftp.port,
          user: ftpParams.user || config.ftp.user,
          password: ftpParams.password || config.ftp.password,
          secure: ftpParams.secure !== undefined ? ftpParams.secure : config.ftp.secure
        };
        
        // 调试信息：打印连接参数
        console.log(`FTP连接尝试 ${attempt}/${maxRetries}:`);
        console.log('Host:', ftpConfig.host);
        console.log('Port:', ftpConfig.port);
        console.log('User:', ftpConfig.user || '(空)');
        console.log('Password:', ftpConfig.password || '(空)');
        console.log('Secure:', ftpConfig.secure);
        
        // 验证必需的配置（只验证host）
        if (!ftpConfig.host) {
          return { 
            success: false, 
            message: 'FTP配置不完整，缺少host。请检查配置文件。' 
          };
        }
        
        // 构建连接参数，只包含非空的参数
        const accessOptions = {
          host: ftpConfig.host,
          port: ftpConfig.port,
          secure: ftpConfig.secure,
          secureOptions: ftpConfig.secure ? { rejectUnauthorized: false } : undefined,
          // 改进的连接选项
          passive: true,
          passiveOverHttp: false,
          forcePasv: true,
          ignorePasvIp: false,
          // 添加重试和超时配置
          retries: 2,
          retryDelayMs: 1000
        };
        
        // 只有当用户名和密码不为空时才添加认证信息
        if (ftpConfig.user && ftpConfig.user.trim() !== '') {
          accessOptions.user = ftpConfig.user;
        }
        if (ftpConfig.password && ftpConfig.password.trim() !== '') {
          accessOptions.password = ftpConfig.password;
        }
        
        console.log('实际使用的连接参数:', accessOptions);
        
        await this.client.access(accessOptions);
        
        // 测试连接是否真正可用
        await this.client.pwd();
        
        this.isConnected = true;
        this.lastConnectionTime = new Date();
        console.log('FTP连接成功');
        return { success: true, message: 'FTP连接成功' };
        
      } catch (error) {
        lastError = error;
        this.isConnected = false;
        
        console.log(`FTP连接尝试 ${attempt} 失败:`, error.message);
        
        // 如果不是最后一次尝试，等待后重试
        if (attempt < maxRetries) {
          const waitTime = attempt * 2000; // 递增等待时间
          console.log(`等待 ${waitTime}ms 后重试...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    // 所有重试都失败了
    let errorMessage = lastError.message;
    if (lastError.message.includes('530')) {
      errorMessage = 'FTP认证失败：用户名或密码不正确，或用户账户被禁用';
    } else if (lastError.message.includes('421')) {
      errorMessage = 'FTP服务器连接数过多，请稍后重试';
    } else if (lastError.message.includes('425')) {
      errorMessage = 'FTP数据连接失败，请检查网络设置';
    } else if (lastError.message.includes('ECONNREFUSED')) {
      errorMessage = '无法连接到FTP服务器，请检查服务器地址和端口';
    } else if (lastError.message.includes('ECONNRESET')) {
      errorMessage = 'FTP连接被重置，可能是网络不稳定或服务器问题';
    } else if (lastError.message.includes('ETIMEDOUT')) {
      errorMessage = 'FTP连接超时，请检查网络连接和服务器状态';
    }
    
    return { 
      success: false, 
      message: `FTP连接失败 (${maxRetries}次尝试): ${errorMessage}` 
    };
  }

  /**
   * 使用状态为正在使用的 FTP 配置连接FTP服务器
   */
  async connectWithEnvConfig() {
    const FTPConfig = require('../models/FTPConfig');
    const cfg = await FTPConfig.findOne({ status: 1 });
    if (!cfg || !cfg.host) {
      return { success: false, message: 'FTP 配置未设置或未激活' };
    }
    
    // 根据用户类型设置连接参数
    const connectParams = {
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure
    };
    
    if (cfg.userType === 'authenticated' && cfg.user) {
      connectParams.user = cfg.user;
      connectParams.password = cfg.password;
    } else {
      connectParams.user = '';
      connectParams.password = '';
    }
    
    return await this.connect(connectParams);
  }

  /**
   * 断开FTP连接
   */
  async disconnect() {
    try {
      if (this.isConnected) {
        await this.client.close();
        this.isConnected = false;
        this.lastConnectionTime = null;
      }
      return { success: true, message: 'FTP连接已断开' };
    } catch (error) {
      return { success: false, message: `断开连接失败: ${error.message}` };
    }
  }

  /**
   * 检查连接状态
   */
  isConnectedToFTP() {
    // 如果连接时间超过1小时，自动标记为未连接
    if (this.isConnected && this.lastConnectionTime) {
      const now = new Date();
      const timeDiff = now - this.lastConnectionTime;
      const oneHour = 60 * 60 * 1000; // 1小时的毫秒数
      
      if (timeDiff > oneHour) {
        console.log('连接超时，自动断开');
        this.isConnected = false;
        this.lastConnectionTime = null;
        return false;
      }
    }
    
    return this.isConnected;
  }

  /**
   * 检查并确保连接有效
   */
  async ensureConnection() {
    if (!this.isConnected) {
      return { success: false, message: 'FTP未连接' };
    }

    try {
      // 尝试执行一个简单的命令来检查连接
      await this.client.pwd();
      return { success: true };
    } catch (error) {
      console.log('连接检查失败，尝试重新连接...', error.message);
      this.isConnected = false;
      
      // 尝试重新连接
      const reconnectResult = await this.connect();
      return reconnectResult;
    }
  }

  /**
   * 列出远程目录内容
   * @param {string} remotePath - 远程路径
   */
  async listDirectory(remotePath = '/') {
    try {
      // 确保连接有效
      const connectionCheck = await this.ensureConnection();
      if (!connectionCheck.success) {
        return connectionCheck;
      }

      const files = await this.client.list(remotePath);
      
      // 调试信息：打印文件信息
      console.log('FTP文件列表原始数据:');
      files.forEach((file, index) => {
        console.log(`文件 ${index}:`, {
          name: file.name,
          type: file.type,
          isDirectory: file.isDirectory,
          isFile: file.isFile,
          size: file.size,
          date: file.date,
          permissions: file.permissions,
          // 打印所有可用的属性
          allProperties: Object.keys(file)
        });
      });
      
      return {
        success: true,
        data: files.map(file => {
          // 多种方式判断文件类型
          let fileType = 'file';
          
          console.log(`判断文件 "${file.name}" 的类型:`);
          console.log('  - file.type:', file.type);
          console.log('  - file.isDirectory:', file.isDirectory);
          console.log('  - file.isFile:', file.isFile);
          console.log('  - file.permissions:', file.permissions);
          
          // 优先使用文件名扩展名判断（最可靠）
          if (file.name && file.name.includes('.')) {
            fileType = 'file';
            console.log('  -> 文件名包含扩展名，判断为文件');
          }
          // 方法1: 使用 isFile 属性为 true 时判断为文件
          else if (file.isFile === true) {
            fileType = 'file';
            console.log('  -> 使用方法1 (isFile === true) 判断为文件');
          }
          // 方法2: 使用 isDirectory 属性
          else if (file.isDirectory === true) {
            fileType = 'directory';
            console.log('  -> 使用方法2 (isDirectory) 判断为目录');
          }
          // 方法3: 使用 type 属性 (1 表示目录)
          else if (file.type === 1) {
            fileType = 'directory';
            console.log('  -> 使用方法3 (type === 1) 判断为目录');
          }
          // 方法4: 使用权限字符串判断 (d开头表示目录)
          else if (file.permissions && file.permissions.startsWith('d')) {
            fileType = 'directory';
            console.log('  -> 使用方法4 (permissions starts with d) 判断为目录');
          }
          // 方法5: 使用 isFile 属性为 false 时判断为目录
          else if (file.isFile === false) {
            fileType = 'directory';
            console.log('  -> 使用方法5 (isFile === false) 判断为目录');
          }
          // 方法6: 使用 size 属性判断 (目录通常没有大小或为0)
          else if (file.size === undefined || file.size === null || file.size === 0) {
            // 但需要排除空文件
            if (file.name && !file.name.includes('.')) {
              fileType = 'directory';
              console.log('  -> 使用方法6 (size判断) 判断为目录');
            }
          }
          // 方法7: 如果有明确的大小值，很可能是文件
          else if (file.size && file.size > 0) {
            fileType = 'file';
            console.log('  -> 使用方法7 (有明确大小) 判断为文件');
          }
          // 方法8: 根据文件名模式判断（包含日期、时间等模式的文件）
          else if (file.name && /^\w+_\d{8}_\d{4}$/.test(file.name)) {
            // 匹配类似 SABRE_K6_ACCB_20250903_1333 的模式
            fileType = 'file';
            console.log('  -> 使用方法8 (文件名模式匹配) 判断为文件');
          }
          else {
            console.log('  -> 默认判断为文件');
          }
          
          const result = {
            name: file.name,
            type: fileType,
            size: file.size,
            date: file.date,
            permissions: file.permissions
          };
          
          console.log(`  -> 最终结果:`, result);
          return result;
        })
      };
    } catch (error) {
      // 如果是连接相关错误，标记为未连接
      if (error.message.includes('ECONNRESET') || 
          error.message.includes('Client is closed') ||
          error.message.includes('Connection lost') ||
          error.message.includes('Connection reset')) {
        this.isConnected = false;
        return { 
          success: false, 
          message: 'FTP连接已断开，请重新连接。错误详情: ' + error.message 
        };
      }
      return { success: false, message: `列出目录失败: ${error.message}` };
    }
  }

  /**
   * 创建远程目录
   * @param {string} remotePath - 远程路径
   */
  async createDirectory(remotePath) {
    try {
      console.log(`尝试创建目录: ${remotePath}`);
      
      // 确保连接有效
      const connectionCheck = await this.ensureConnection();
      if (!connectionCheck.success) {
        console.log('连接检查失败:', connectionCheck.message);
        return connectionCheck;
      }

      console.log('连接检查通过，开始创建目录...');
      await this.client.ensureDir(remotePath);
      console.log(`目录创建成功: ${remotePath}`);
      return { success: true, message: '目录创建成功' };
    } catch (error) {
      console.error('创建目录时出错:', error);
      
      // 如果是连接相关错误，标记为未连接
      if (error.message.includes('ECONNRESET') || 
          error.message.includes('Client is closed') ||
          error.message.includes('Connection lost')) {
        this.isConnected = false;
        return { 
          success: false, 
          message: 'FTP连接已断开，请重新连接。错误详情: ' + error.message 
        };
      }
      return { success: false, message: `创建目录失败: ${error.message}` };
    }
  }

  /**
   * 上传文件到FTP服务器
   * @param {string} localPath - 本地文件路径
   * @param {string} remotePath - 远程文件路径
   * @param {Function} progressCallback - 进度回调函数
   */
  async uploadFile(localPath, remotePath, progressCallback = null) {
    try {
      console.log(`开始上传文件: ${localPath} -> ${remotePath}`);
      
      // 确保连接有效
      const connectionCheck = await this.ensureConnection();
      if (!connectionCheck.success) {
        return connectionCheck;
      }

      if (!fs.existsSync(localPath)) {
        return { success: false, message: '本地文件不存在' };
      }

      // 获取文件大小
      const fileStats = fs.statSync(localPath);
      const fileSize = fileStats.size;
      console.log(`文件大小: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);

      // 确保远程目录存在
      const remoteDir = path.dirname(remotePath);
      if (remoteDir !== '.') {
        await this.client.ensureDir(remoteDir);
      }

      // 设置上传超时（根据文件大小动态调整）
      const timeoutMs = Math.max(30000, fileSize / 1024 * 100); // 至少30秒，每KB增加0.1秒
      console.log(`设置上传超时: ${timeoutMs}ms`);

      // 创建超时Promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`上传超时 (${timeoutMs}ms)`));
        }, timeoutMs);
      });

      // 上传文件
      const uploadPromise = this.client.uploadFrom(localPath, remotePath);
      
      // 使用Promise.race实现超时控制
      await Promise.race([uploadPromise, timeoutPromise]);
      
      console.log(`文件上传成功: ${remotePath}`);
      return { success: true, message: '文件上传成功' };
    } catch (error) {
      console.error('上传文件时出错:', error);
      
      // 如果是超时错误
      if (error.message.includes('上传超时')) {
        return { 
          success: false, 
          message: `文件上传超时，请检查网络连接或尝试上传较小的文件` 
        };
      }
      
      // 如果是连接相关错误，标记为未连接
      if (error.message.includes('ECONNRESET') || 
          error.message.includes('Client is closed') ||
          error.message.includes('Connection lost') ||
          error.message.includes('ETIMEDOUT')) {
        this.isConnected = false;
        return { 
          success: false, 
          message: 'FTP连接已断开，请重新连接。错误详情: ' + error.message 
        };
      }
      
      return { success: false, message: `文件上传失败: ${error.message}` };
    }
  }

  /**
   * 从FTP服务器下载文件
   * @param {string} remotePath - 远程文件路径
   * @param {string} localPath - 本地文件路径
   * @param {Function} progressCallback - 进度回调函数
   */
  async downloadFile(remotePath, localPath, progressCallback = null) {
    try {
      if (!this.isConnected) {
        return { success: false, message: 'FTP未连接' };
      }

      // 确保本地目录存在
      const localDir = path.dirname(localPath);
      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true });
      }

      // 下载文件
      await this.client.downloadTo(localPath, remotePath);
      
      return { success: true, message: '文件下载成功' };
    } catch (error) {
      return { success: false, message: `文件下载失败: ${error.message}` };
    }
  }

  /**
   * 删除远程文件
   * @param {string} remotePath - 远程文件路径
   */
  async deleteFile(remotePath) {
    try {
      if (!this.isConnected) {
        return { success: false, message: 'FTP未连接' };
      }

      await this.client.remove(remotePath);
      return { success: true, message: '文件删除成功' };
    } catch (error) {
      return { success: false, message: `文件删除失败: ${error.message}` };
    }
  }

  /**
   * 删除远程目录
   * @param {string} remotePath - 远程目录路径
   */
  async deleteDirectory(remotePath) {
    try {
      if (!this.isConnected) {
        return { success: false, message: 'FTP未连接' };
      }

      await this.client.removeDir(remotePath);
      return { success: true, message: '目录删除成功' };
    } catch (error) {
      return { success: false, message: `目录删除失败: ${error.message}` };
    }
  }

  /**
   * 检查远程文件是否存在
   * @param {string} remotePath - 远程文件路径
   */
  async fileExists(remotePath) {
    try {
      if (!this.isConnected) {
        return { success: false, message: 'FTP未连接' };
      }

      const size = await this.client.size(remotePath);
      return { success: true, exists: size !== undefined, size: size };
    } catch (error) {
      return { success: true, exists: false };
    }
  }

  /**
   * 获取远程文件信息
   * @param {string} remotePath - 远程文件路径
   */
  async getFileInfo(remotePath) {
    try {
      if (!this.isConnected) {
        return { success: false, message: 'FTP未连接' };
      }

      const size = await this.client.size(remotePath);
      const lastModified = await this.client.lastMod(remotePath);
      
      return {
        success: true,
        data: {
          size: size,
          lastModified: lastModified,
          exists: size !== undefined
        }
      };
    } catch (error) {
      return { success: false, message: `获取文件信息失败: ${error.message}` };
    }
  }

  /**
   * 批量上传文件
   * @param {Array} files - 文件列表 [{localPath, remotePath}]
   * @param {Function} progressCallback - 进度回调函数
   */
  async uploadMultipleFiles(files, progressCallback = null) {
    const results = [];
    
    for (let i = 0; i < files.length; i++) {
      const { localPath, remotePath } = files[i];
      
      if (progressCallback) {
        progressCallback(i + 1, files.length, localPath);
      }
      
      const result = await this.uploadFile(localPath, remotePath);
      results.push({
        localPath,
        remotePath,
        ...result
      });
    }
    
    return {
      success: true,
      data: results,
      message: `批量上传完成，成功: ${results.filter(r => r.success).length}/${files.length}`
    };
  }

  /**
   * 批量下载文件
   * @param {Array} files - 文件列表 [{remotePath, localPath}]
   * @param {Function} progressCallback - 进度回调函数
   */
  async downloadMultipleFiles(files, progressCallback = null) {
    const results = [];
    
    for (let i = 0; i < files.length; i++) {
      const { remotePath, localPath } = files[i];
      
      if (progressCallback) {
        progressCallback(i + 1, files.length, remotePath);
      }
      
      const result = await this.downloadFile(remotePath, localPath);
      results.push({
        remotePath,
        localPath,
        ...result
      });
    }
    
    return {
      success: true,
      data: results,
      message: `批量下载完成，成功: ${results.filter(r => r.success).length}/${files.length}`
    };
  }
}

module.exports = new FTPService();
