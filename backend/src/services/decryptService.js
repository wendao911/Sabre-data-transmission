const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const config = require('../config');
const { DecryptLog } = require('../models/DecryptLog');

const execAsync = promisify(exec);

function getConfigPath(type) {
  const decryptConfig = config.decrypt || {};
  const projectRoot = path.join(__dirname, '..', '..');
  switch (type) {
    case 'encryptionDir': return decryptConfig.encryptionDir;
    case 'decryptionDir': return decryptConfig.decryptionDir;
    case 'keyDir': return path.join(projectRoot, 'assets');
    case 'passphraseFile': return path.join(projectRoot, 'assets', 'K6-gpg-psd.psd');
    default: return projectRoot;
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
  if (fileDate < cutoffDate) return path.join(keyDir, 'AITS-primary-key.asc');
  return path.join(keyDir, 'K6-primary-key.asc');
}

function getGpgFiles() {
  const gpgFiles = [];
  const encryptionDir = getConfigPath('encryptionDir');
  if (!fs.existsSync(encryptionDir)) throw new Error(`加密文件夹 ${encryptionDir} 不存在`);
  (function scanDirectory(dir) {
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
        gpgFiles.push({ filePath: itemPath, date, filename: item, keyFile, isGpg, size: stat.size, mtime: stat.mtime });
      }
    }
  })(encryptionDir);
  return gpgFiles;
}

function createDateDirectories(dates) {
  const decryptionDir = getConfigPath('decryptionDir');
  if (!fs.existsSync(decryptionDir)) fs.mkdirSync(decryptionDir, { recursive: true });
  for (const date of dates) {
    const dateDir = path.join(decryptionDir, date);
    if (!fs.existsSync(dateDir)) fs.mkdirSync(dateDir, { recursive: true });
  }
}

async function decryptGpgFile(gpgFile, outputDir, privateKey, passphrase) {
  try {
    const gpgPath = path.parse(gpgFile);
    const outputFilename = gpgPath.name;
    const outputFile = path.join(outputDir, outputFilename);
    let decryptCmd;
    if (passphrase) decryptCmd = `gpg --batch --yes --passphrase "${passphrase}" --output "${outputFile}" --decrypt "${gpgFile}"`;
    else decryptCmd = `gpg --batch --yes --output "${outputFile}" --decrypt "${gpgFile}"`;
    await execAsync(decryptCmd);
    return true;
  } catch (error) {
    throw new Error(`解密文件失败: ${error.message}`);
  }
}

function readPassphrase(keyFile) {
  if (keyFile.includes('AITS-primary-key.asc')) return null;
  if (keyFile.includes('K6-primary-key.asc')) {
    const passphraseFile = getConfigPath('passphraseFile');
    try { return fs.readFileSync(passphraseFile, 'utf8').trim(); } 
    catch (error) { throw new Error(`无法读取密码文件 ${passphraseFile}：${error.message}`); }
  }
  throw new Error(`未知的密钥文件：${keyFile}`);
}

async function importPrivateKey(privateKey, passphrase) {
  try {
    let importCmd;
    if (passphrase) importCmd = `gpg --batch --yes --passphrase "${passphrase}" --import "${privateKey}"`;
    else importCmd = `gpg --batch --yes --import "${privateKey}"`;
    await execAsync(importCmd);
    return true;
  } catch (error) {
    throw new Error(`导入密钥失败: ${error.message}`);
  }
}

async function batchProcessFiles(date, progressCallback = null) {
  try {
    const allFiles = getGpgFiles().filter(f => f.date === date);
    const results = { total: allFiles.length, processed: 0, decrypted: 0, copied: 0, failed: 0, errors: [] };
    await createDateDirectories([date]);
    const decryptionDir = getConfigPath('decryptionDir');
    const targetDir = path.join(decryptionDir, date);
    if (progressCallback) progressCallback({ type: 'start', total: allFiles.length, processed: 0, decrypted: 0, copied: 0, failed: 0, currentFile: null });
    const gpgFiles = allFiles.filter(f => f.isGpg);
    if (gpgFiles.length > 0) {
      const keyFile = getKeyForDate(date);
      const passphrase = readPassphrase(keyFile);
      if (progressCallback) progressCallback({ type: 'progress', total: allFiles.length, processed: 0, decrypted: 0, copied: 0, failed: 0, currentFile: '正在导入密钥...' });
      await importPrivateKey(keyFile, passphrase);
    }
    for (const file of allFiles) {
      if (progressCallback) progressCallback({ type: 'progress', total: allFiles.length, processed: results.processed, decrypted: results.decrypted, copied: results.copied, failed: results.failed, currentFile: file.filename });
      try {
        if (file.isGpg) {
          const keyFile = getKeyForDate(date);
          const passphrase = readPassphrase(keyFile);
          await decryptGpgFile(file.filePath, targetDir, keyFile, passphrase);
          results.decrypted++;
        } else {
          const fileName = path.basename(file.filePath);
          const targetPath = path.join(targetDir, fileName);
          fs.copyFileSync(file.filePath, targetPath);
          results.copied++;
        }
        results.processed++;
      } catch (error) {
        results.failed++;
        results.errors.push({ file: file.filename, error: error.message });
      }
    }
    if (progressCallback) progressCallback({ type: 'complete', total: allFiles.length, processed: results.processed, decrypted: results.decrypted, copied: results.copied, failed: results.failed, currentFile: null });
    try {
      const logData = { date, status: results.failed === 0 ? 'success' : 'fail', processedFiles: results.processed, successFiles: results.decrypted + results.copied, failedFiles: results.failed, duration: 0, message: results.failed === 0 ? `成功处理 ${results.processed} 个文件，解密 ${results.decrypted} 个，复制 ${results.copied} 个` : `处理完成，成功 ${results.decrypted + results.copied} 个，失败 ${results.failed} 个` };
      await DecryptLog.create(logData);
    } catch (logError) { console.error('记录解密日志失败:', logError); }
    return results;
  } catch (error) {
    try {
      await DecryptLog.create({ date, status: 'fail', processedFiles: 0, successFiles: 0, failedFiles: 0, duration: 0, message: `解密任务失败: ${error.message}` });
    } catch (logError) { console.error('记录失败日志失败:', logError); }
    throw error;
  }
}

function getEncryptedDates() {
  const gpgFiles = getGpgFiles().filter(f => f.isGpg === true);
  const datesSet = new Set(gpgFiles.map(f => f.date));
  return Array.from(datesSet).sort().reverse();
}

function checkDecryptionStatus(date) {
  try {
    const decryptionDir = getConfigPath('decryptionDir');
    const targetDir = path.join(decryptionDir, date);
    if (!fs.existsSync(targetDir)) return { isDecrypted: false, decryptedCount: 0, totalCount: 0 };
    const allFiles = getGpgFiles().filter(f => f.date === date);
    const totalCount = allFiles.length;
    const decryptedFiles = fs.readdirSync(targetDir);
    const decryptedCount = decryptedFiles.length;
    const isDecrypted = decryptedCount >= totalCount;
    return { isDecrypted, decryptedCount, totalCount };
  } catch (error) {
    console.error('检查解密状态失败:', error);
    return { isDecrypted: false, decryptedCount: 0, totalCount: 0 };
  }
}

function getEncryptedDatesWithStatus() {
  const dates = getEncryptedDates();
  return dates.map(date => ({ date, ...checkDecryptionStatus(date) }));
}

module.exports = { extractDateFromFilename, getKeyForDate, getGpgFiles, createDateDirectories, importPrivateKey, decryptGpgFile, batchProcessFiles, getEncryptedDates, getEncryptedDatesWithStatus, checkDecryptionStatus, getConfigPath };

// 下沉给路由使用的便捷方法
function validateYyyyMmDd(date) {
  return typeof date === 'string' && /^\d{8}$/.test(date);
}

function getEncryptedFilesByDate(date) {
  if (!validateYyyyMmDd(date)) {
    throw new Error('Invalid date. Expect YYYYMMDD');
  }
  return getGpgFiles().filter(f => f.date === date);
}

function listDecryptedFiles(date) {
  if (!validateYyyyMmDd(date)) {
    throw new Error('Invalid date. Expect YYYYMMDD');
  }
  const decryptionDir = getConfigPath('decryptionDir');
  const targetDir = path.join(decryptionDir, date);
  if (!fs.existsSync(targetDir)) return [];
  const files = fs.readdirSync(targetDir);
  return files.map(filename => {
    const filePath = path.join(targetDir, filename);
    const stat = fs.statSync(filePath);
    return { filename, filePath, size: stat.size, mtime: stat.mtime, isDirectory: stat.isDirectory() };
  });
}

module.exports.getEncryptedFilesByDate = getEncryptedFilesByDate;
module.exports.listDecryptedFiles = listDecryptedFiles;
module.exports.validateYyyyMmDd = validateYyyyMmDd;


