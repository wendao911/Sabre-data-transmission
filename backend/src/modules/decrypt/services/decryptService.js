/**
 * GPG文件解密服务（已迁移至 modules/decrypt）
 */
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

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
  if (fileDate < cutoffDate) {
    return 'AITS-primary-key.asc';
  } else {
    return 'K6-primary-key.asc';
  }
}

function getGpgFiles() {
  const gpgFiles = [];
  const projectRoot = path.join(__dirname, '..', '..', '..', '..');
  const encryptionDir = path.join(projectRoot, 'Sabre Data Encryption');
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
        gpgFiles.push({ filePath: itemPath, date, filename: item, keyFile, isGpg });
      }
    }
  }
  scanDirectory(encryptionDir);
  return gpgFiles;
}

function createDateDirectories(dates) {
  const projectRoot = path.join(__dirname, '..', '..', '..', '..');
  const decryptionDir = path.join(projectRoot, 'Sabre Data Decryption');
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

async function checkGpgInstalled() {
  try {
    await execAsync('gpg --version');
    return true;
  } catch (error) {
    return false;
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
    await execAsync(decryptCmd);
    return true;
  } catch (error) {
    return false;
  }
}

function readPassphrase(keyFile) {
  if (keyFile === 'AITS-primary-key.asc') {
    return null;
  } else if (keyFile === 'K6-primary-key.asc') {
    const projectRoot = path.join(__dirname, '..', '..', '..', '..');
    const passphraseFile = path.join(projectRoot, 'K6-gpg-psd.psd');
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
  } catch {
    return false;
  }
}

async function importAllPrivateKeys(keyFiles) {
  const results = [];
  const projectRoot = path.join(__dirname, '..', '..', '..', '..');
  for (const keyFile of keyFiles) {
    const keyPath = path.join(projectRoot, keyFile);
    if (!fs.existsSync(keyPath)) {
      results.push(false);
      continue;
    }
    try {
      const passphrase = readPassphrase(keyFile);
      const success = await importPrivateKey(keyPath, passphrase);
      results.push(success);
    } catch {
      results.push(false);
    }
  }
  return results.every(result => result);
}

async function decryptAllFiles(progressCallback = null, options = {}) {
  const results = { success: 0, total: 0, errors: [] };
  try {
    const projectRoot = path.join(__dirname, '..', '..', '..', '..');
    const aitsKey = path.join(projectRoot, 'AITS-primary-key.asc');
    const k6Key = path.join(projectRoot, 'K6-primary-key.asc');
    const k6PassphraseFile = path.join(projectRoot, 'K6-gpg-psd.psd');
    if (!fs.existsSync(aitsKey)) throw new Error(`AITS私钥文件 ${aitsKey} 不存在`);
    if (!fs.existsSync(k6Key)) throw new Error(`K6私钥文件 ${k6Key} 不存在`);
    if (!fs.existsSync(k6PassphraseFile)) throw new Error(`K6密码文件 ${k6PassphraseFile} 不存在`);

    let gpgFiles = getGpgFiles().filter(f => f.isGpg === true);
    if (options && options.date) {
      gpgFiles = gpgFiles.filter(f => f.date === options.date);
    }
    if (options && options.month) {
      const month = String(options.month);
      if (/^\d{6}$/.test(month)) {
        gpgFiles = gpgFiles.filter(f => typeof f.date === 'string' && f.date.startsWith(month));
      }
    }
    if (options && options.filePath) {
      gpgFiles = gpgFiles.filter(f => f.filePath === options.filePath || f.filename === options.filePath);
    }
    results.total = gpgFiles.length;
    if (gpgFiles.length === 0) {
      if (progressCallback) {
        progressCallback({ type: 'info', message: '没有找到需要解密的文件', progress: 100, current: 0, total: 0 });
      }
      return results;
    }

    const gpgOnlyFiles = gpgFiles.filter(f => f.isGpg);
    if (gpgOnlyFiles.length > 0) {
      if (!(await checkGpgInstalled())) throw new Error('系统未安装GPG，请先安装GPG');
    }

    const dates = new Set();
    const keyFiles = new Set();
    gpgFiles.forEach(file => {
      dates.add(file.date);
      if (file.isGpg && file.keyFile) keyFiles.add(file.keyFile);
    });

    createDateDirectories(dates);
    if (gpgOnlyFiles.length > 0) {
      if (!(await importAllPrivateKeys(keyFiles))) {
        throw new Error('私钥导入失败');
      }
    }

    const filesByDate = {};
    gpgFiles.forEach(file => {
      if (!filesByDate[file.date]) filesByDate[file.date] = [];
      filesByDate[file.date].push(file);
    });

    const totalFiles = results.total;
    let processedCount = 0;
    for (const [date, files] of Object.entries(filesByDate)) {
      const dateDir = path.join(projectRoot, 'Sabre Data Decryption', date);
      if (progressCallback) {
        progressCallback({ type: 'info', message: `正在解密日期 ${date} 的文件...`, progress: Math.round((processedCount / totalFiles) * 100), current: processedCount, total: totalFiles });
      }
      for (const file of files) {
        if (progressCallback) {
          progressCallback({ type: 'file_start', message: file.isGpg ? `正在解密：${file.filename}` : `正在复制：${file.filename}`, filename: file.filename, keyFile: file.keyFile, progress: Math.round((processedCount / totalFiles) * 100), current: processedCount, total: totalFiles });
        }
        try {
          if (file.isGpg) {
            const passphrase = readPassphrase(file.keyFile);
            if (await decryptGpgFile(file.filePath, dateDir, file.keyFile, passphrase)) {
              results.success++;
              processedCount++;
              if (progressCallback) {
                progressCallback({ type: 'file_success', message: `解密成功：${file.filename}` , filename: file.filename, progress: Math.round((processedCount / totalFiles) * 100), current: processedCount, total: totalFiles });
              }
            } else {
              results.errors.push(`解密失败：${file.filename}`);
              processedCount++;
              if (progressCallback) {
                progressCallback({ type: 'file_error', message: `解密失败：${file.filename}` , filename: file.filename, progress: Math.round((processedCount / totalFiles) * 100), current: processedCount, total: totalFiles });
              }
            }
          } else {
            const target = path.join(dateDir, file.filename);
            fs.copyFileSync(file.filePath, target);
            results.success++;
            processedCount++;
            if (progressCallback) {
              progressCallback({ type: 'file_success', message: `复制成功：${file.filename}` , filename: file.filename, progress: Math.round((processedCount / totalFiles) * 100), current: processedCount, total: totalFiles });
            }
          }
        } catch (error) {
          results.errors.push(`${file.isGpg ? '解密失败' : '复制失败'}：${file.filename} - ${error.message}`);
          processedCount++;
          if (progressCallback) {
            progressCallback({ type: 'file_error', message: `${file.isGpg ? '解密失败' : '复制失败'}：${file.filename} - ${error.message}`, filename: file.filename, error: error.message, progress: Math.round((processedCount / totalFiles) * 100), current: processedCount, total: totalFiles });
          }
        }
      }
    }
    return results;
  } catch (error) {
    results.errors.push(error.message);
    return results;
  }
}

function getDecryptStatus() {
  const projectRoot = path.join(__dirname, '..', '..', '..', '..');
  const encryptionDir = path.join(projectRoot, 'Sabre Data Encryption');
  const decryptionDir = path.join(projectRoot, 'Sabre Data Decryption');
  const status = {
    encryptionDir: { exists: fs.existsSync(encryptionDir), gpgFiles: 0, dates: new Set() },
    decryptionDir: { exists: fs.existsSync(decryptionDir), subdirs: [] },
    privateKeys: { aits: { exists: fs.existsSync(path.join(projectRoot, 'AITS-primary-key.asc')) }, k6: { exists: fs.existsSync(path.join(projectRoot, 'K6-primary-key.asc')) } },
    passphrases: { k6: { exists: fs.existsSync(path.join(projectRoot, 'K6-gpg-psd.psd')) } }
  };
  if (status.encryptionDir.exists) {
    try {
      const gpgFiles = getGpgFiles();
      status.encryptionDir.gpgFiles = gpgFiles.length;
      gpgFiles.forEach(file => status.encryptionDir.dates.add(file.date));
      status.encryptionDir.dates = Array.from(status.encryptionDir.dates).sort();
    } catch (error) {
      status.encryptionDir.error = error.message;
    }
  }
  if (status.decryptionDir.exists) {
    try {
      const items = fs.readdirSync(decryptionDir);
      status.decryptionDir.subdirs = items.filter(item => {
        const itemPath = path.join(decryptionDir, item);
        return fs.statSync(itemPath).isDirectory();
      }).sort();
    } catch (error) {
      status.decryptionDir.error = error.message;
    }
  }
  return status;
}

module.exports = {
  extractDateFromFilename,
  getKeyForDate,
  getGpgFiles,
  createDateDirectories,
  importPrivateKey,
  importAllPrivateKeys,
  decryptGpgFile,
  decryptAllFiles,
  getDecryptStatus
};


