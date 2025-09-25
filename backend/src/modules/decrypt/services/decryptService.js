/**
 * GPG文件解密服务（已迁移至 modules/decrypt）
 */
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const config = require('../../../config');

const execAsync = promisify(exec);

// 获取配置路径的辅助函数
function getConfigPath(type) {
  const decryptConfig = config.decrypt || {};
  // 项目根目录 - 从 backend/src/modules/decrypt/services/ 到项目根目录
  const projectRoot = path.join(__dirname, '..', '..', '..', '..', '..');
  
  switch (type) {
    case 'encryptionDir':
      return decryptConfig.encryptionDir || 'C:\\Users\\18252\\Desktop\\K6\\coding\\ACCA\\Sabre Data Encryption';
    
    case 'decryptionDir':
      return decryptConfig.decryptionDir || 'C:\\Users\\18252\\Desktop\\K6\\coding\\ACCA\\Sabre Data Decryption';
    
    case 'keyDir':
      return decryptConfig.keyDir 
        ? (path.isAbsolute(decryptConfig.keyDir) 
           ? decryptConfig.keyDir 
           : path.join(projectRoot, decryptConfig.keyDir))
        : path.join(projectRoot, 'backend', 'src', 'assets');
    
    case 'passphraseFile':
      const passphrasePath = decryptConfig.passphraseFile 
        ? (path.isAbsolute(decryptConfig.passphraseFile) 
           ? decryptConfig.passphraseFile 
           : path.join(projectRoot, decryptConfig.passphraseFile))
        : path.join(projectRoot, 'K6-gpg-psd.psd');
      return passphrasePath;
    
    default:
      return projectRoot;
  }
}

function extractDateFromFilename(filename) {
  const datePattern = /(\d{8})/;
  const match = filename.match(datePattern);
  return match ? match[1] : null;
}

function getKeyForDate(date) {
  const year = parseInt(date.substring(0, 4));
  const month = parseInt(date.substring(4, 6));
  const day = parseInt(date.substring(6, 8));
  const fileDate = new Date(year, month - 1, day);
  const cutoffDate = new Date(2024, 7, 5);
  const keyDir = getConfigPath('keyDir');
  if (fileDate < cutoffDate) {
    return path.join(keyDir, 'AITS-primary-key.asc');
  } else {
    return path.join(keyDir, 'K6-primary-key.asc');
  }
}

function getGpgFiles() {
  const gpgFiles = [];
  const encryptionDir = getConfigPath('encryptionDir');
  if (!fs.existsSync(encryptionDir)) {
    throw new Error(`加密文件夹 ${encryptionDir} 不存在`);
  }
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      if (stat.isDirectory()) {
        scanDirectory(itemPath);
      } else {
        const date = extractDateFromFilename(item);
        if (!date) continue;
        const isGpg = item.endsWith('.gpg');
        const keyFile = isGpg ? getKeyForDate(date) : null;
        gpgFiles.push({ 
          filePath: itemPath, 
          date, 
          filename: item, 
          keyFile, 
          isGpg,
          size: stat.size,
          mtime: stat.mtime
        });
      }
    }
  }
  scanDirectory(encryptionDir);
  return gpgFiles;
}

function createDateDirectories(dates) {
  const decryptionDir = getConfigPath('decryptionDir');
  if (!fs.existsSync(decryptionDir)) {
    fs.mkdirSync(decryptionDir, { recursive: true });
  }
  for (const date of dates) {
    const dateDir = path.join(decryptionDir, date);
    if (!fs.existsSync(dateDir)) {
      fs.mkdirSync(dateDir, { recursive: true });
    }
  }
}


async function decryptGpgFile(gpgFile, outputDir, privateKey, passphrase) {
  try {
    const gpgPath = path.parse(gpgFile);
    const outputFilename = gpgPath.name;
    const outputFile = path.join(outputDir, outputFilename);
    let decryptCmd;
    if (passphrase) {
      decryptCmd = `gpg --batch --yes --passphrase "${passphrase}" --output "${outputFile}" --decrypt "${gpgFile}"`;
    } else {
      decryptCmd = `gpg --batch --yes --output "${outputFile}" --decrypt "${gpgFile}"`;
    }
    const result = await execAsync(decryptCmd);
    return true;
  } catch (error) {
    throw new Error(`解密文件失败: ${error.message}`);
  }
}

function readPassphrase(keyFile) {
  if (keyFile.includes('AITS-primary-key.asc')) {
    return null;
  } else if (keyFile.includes('K6-primary-key.asc')) {
    const passphraseFile = getConfigPath('passphraseFile');
    try {
      const passphrase = fs.readFileSync(passphraseFile, 'utf8').trim();
      return passphrase;
    } catch (error) {
      throw new Error(`无法读取密码文件 ${passphraseFile}：${error.message}`);
    }
  } else {
    throw new Error(`未知的密钥文件：${keyFile}`);
  }
}

async function importPrivateKey(privateKey, passphrase) {
  try {
    let importCmd;
    if (passphrase) {
      importCmd = `gpg --batch --yes --passphrase "${passphrase}" --import "${privateKey}"`;
    } else {
      importCmd = `gpg --batch --yes --import "${privateKey}"`;
    }
    await execAsync(importCmd);
    return true;
  } catch (error) {
    throw new Error(`导入密钥失败: ${error.message}`);
  }
}




// 批量处理指定日期的所有文件
async function batchProcessFiles(date, progressCallback = null) {
  try {
    const allFiles = getGpgFiles().filter(f => f.date === date);
    const results = {
      total: allFiles.length,
      processed: 0,
      decrypted: 0,
      copied: 0,
      failed: 0,
      errors: []
    };

    // 确保目标目录存在
    await createDateDirectories([date]);
    const decryptionDir = getConfigPath('decryptionDir');
    const targetDir = path.join(decryptionDir, date);
    
    // 发送初始进度
    if (progressCallback) {
      progressCallback({
        type: 'start',
        total: allFiles.length,
        processed: 0,
        decrypted: 0,
        copied: 0,
        failed: 0,
        currentFile: null
      });
    }
    
    // 预先导入密钥（只导入一次）
    const gpgFiles = allFiles.filter(f => f.isGpg);
    if (gpgFiles.length > 0) {
      const keyFile = getKeyForDate(date);
      const passphrase = readPassphrase(keyFile);
      
      if (progressCallback) {
        progressCallback({
          type: 'progress',
          total: allFiles.length,
          processed: 0,
          decrypted: 0,
          copied: 0,
          failed: 0,
          currentFile: '正在导入密钥...'
        });
      }
      
      await importPrivateKey(keyFile, passphrase);
    }
    
    for (let i = 0; i < allFiles.length; i++) {
      const file = allFiles[i];
      
      // 发送当前文件进度
      if (progressCallback) {
        progressCallback({
          type: 'progress',
          total: allFiles.length,
          processed: results.processed,
          decrypted: results.decrypted,
          copied: results.copied,
          failed: results.failed,
          currentFile: file.filename
        });
      }
      
      try {
        if (file.isGpg) {
          // 解密文件（密钥已预先导入）
          const keyFile = getKeyForDate(date);
          const passphrase = readPassphrase(keyFile);
          
          await decryptGpgFile(file.filePath, targetDir, keyFile, passphrase);
          results.decrypted++;
        } else {
          // 复制非加密文件
          const fileName = path.basename(file.filePath);
          const targetPath = path.join(targetDir, fileName);
          
          fs.copyFileSync(file.filePath, targetPath);
          results.copied++;
        }
        results.processed++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          file: file.filename,
          error: error.message
        });
      }
    }
    
    // 发送完成进度
    if (progressCallback) {
      progressCallback({
        type: 'complete',
        total: allFiles.length,
        processed: results.processed,
        decrypted: results.decrypted,
        copied: results.copied,
        failed: results.failed,
        currentFile: null
      });
    }

    return results;
  } catch (error) {
    throw error;
  }
}

// 获取加密文件日期列表
function getEncryptedDates() {
  const gpgFiles = getGpgFiles().filter(f => f.isGpg === true);
  const datesSet = new Set(gpgFiles.map(f => f.date));
  return Array.from(datesSet).sort().reverse();
}

// 检查指定日期的解密状态
function checkDecryptionStatus(date) {
  try {
    const decryptionDir = getConfigPath('decryptionDir');
    const targetDir = path.join(decryptionDir, date);
    
    // 检查解密目录是否存在
    if (!fs.existsSync(targetDir)) {
      return { isDecrypted: false, decryptedCount: 0, totalCount: 0 };
    }
    
    // 获取原始文件数量
    const allFiles = getGpgFiles().filter(f => f.date === date);
    const totalCount = allFiles.length;
    
    // 获取解密目录中的文件数量
    const decryptedFiles = fs.readdirSync(targetDir);
    const decryptedCount = decryptedFiles.length;
    
    // 如果解密文件数量大于等于原始文件数量，认为已解密
    const isDecrypted = decryptedCount >= totalCount;
    
    return { isDecrypted, decryptedCount, totalCount };
  } catch (error) {
    console.error('检查解密状态失败:', error);
    return { isDecrypted: false, decryptedCount: 0, totalCount: 0 };
  }
}

// 获取带解密状态的日期列表
function getEncryptedDatesWithStatus() {
  const dates = getEncryptedDates();
  return dates.map(date => {
    const status = checkDecryptionStatus(date);
    return {
      date,
      ...status
    };
  });
}

module.exports = {
  extractDateFromFilename,
  getKeyForDate,
  getGpgFiles,
  createDateDirectories,
  importPrivateKey,
  decryptGpgFile,
  batchProcessFiles,
  getEncryptedDates,
  getEncryptedDatesWithStatus,
  checkDecryptionStatus,
  getConfigPath
};


