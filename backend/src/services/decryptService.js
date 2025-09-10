/**
 * GPG文件解密服务
 * 功能：
 * 1. 解析Sabre Data Encryption文件夹中的文件名，提取YYYYMMDD日期
 * 2. 在Sabre Data Decryption下创建对应的YYYYMMDD目录
 * 3. 根据日期选择密钥：8月5号之前用AITS-primary-key.asc，8月5日及之后用K6-primary-key.asc
 * 4. 将解密后的文件保存到对应的YYYYMMDD目录
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * 从文件名中提取YYYYMMDD格式的日期
 * @param {string} filename - 文件名
 * @returns {string|null} - 提取的日期或null
 */
function extractDateFromFilename(filename) {
    // 匹配8位数字的日期格式
    const datePattern = /(\d{8})/;
    const match = filename.match(datePattern);
    return match ? match[1] : null;
}

/**
 * 根据日期判断应该使用哪个密钥
 * @param {string} date - YYYYMMDD格式的日期
 * @returns {string} - 密钥文件名
 */
function getKeyForDate(date) {
    // 解析日期
    const year = parseInt(date.substring(0, 4));
    const month = parseInt(date.substring(4, 6));
    const day = parseInt(date.substring(6, 8));
    
    // 创建日期对象进行比较
    const fileDate = new Date(year, month - 1, day); // month是0-based
    const cutoffDate = new Date(2024, 7, 5); // 2024年8月5日 (month是0-based，所以7代表8月)
    
    // 8月5号之前用AITS密钥，8月5日及之后用K6密钥
    if (fileDate < cutoffDate) {
        return 'AITS-primary-key.asc';
    } else {
        return 'K6-primary-key.asc';
    }
}

/**
 * 获取输入文件（包含 .gpg 与非 .gpg），并附带日期、密钥与是否为GPG标记
 * @returns {Array<{filePath: string, date: string, filename: string, keyFile: string|null, isGpg: boolean}>}
 */
function getGpgFiles() {
    const gpgFiles = [];
    const projectRoot = path.join(__dirname, '..', '..', '..');
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
                if (!date) continue; // 跳过无法识别日期的文件
                const isGpg = item.endsWith('.gpg');
                const keyFile = isGpg ? getKeyForDate(date) : null;
                gpgFiles.push({
                    filePath: itemPath,
                    date: date,
                    filename: item,
                    keyFile: keyFile,
                    isGpg: isGpg
                });
            }
        }
    }
    
    scanDirectory(encryptionDir);
    return gpgFiles;
}

/**
 * 创建日期目录
 * @param {Set<string>} dates - 日期集合
 */
function createDateDirectories(dates) {
    const projectRoot = path.join(__dirname, '..', '..', '..');
    const decryptionDir = path.join(projectRoot, 'Sabre Data Decryption');
    
    // 确保解密目录存在
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

/**
 * 检查系统是否安装了GPG
 * @returns {Promise<boolean>} - 是否安装了GPG
 */
async function checkGpgInstalled() {
    try {
        await execAsync('gpg --version');
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * 解密单个GPG文件
 * @param {string} gpgFile - GPG文件路径
 * @param {string} outputDir - 输出目录
 * @param {string} privateKey - 私钥文件路径（已导入，此参数保留用于兼容性）
 * @param {string|null} passphrase - 密码，null表示无密码
 * @returns {Promise<boolean>} - 是否解密成功
 */
async function decryptGpgFile(gpgFile, outputDir, privateKey, passphrase) {
    try {
        const gpgPath = path.parse(gpgFile);
        const outputFilename = gpgPath.name; // 去掉.gpg后缀
        const outputFile = path.join(outputDir, outputFilename);
        
        // 解密文件（私钥已在之前导入）
        let decryptCmd;
        if (passphrase) {
            // 有密码的密钥
            decryptCmd = `gpg --batch --yes --passphrase "${passphrase}" --output "${outputFile}" --decrypt "${gpgFile}"`;
        } else {
            // 无密码的密钥
            decryptCmd = `gpg --batch --yes --output "${outputFile}" --decrypt "${gpgFile}"`;
        }
        await execAsync(decryptCmd); // 移除超时限制
        
        return true;
        
    } catch (error) {
        // 静默处理错误，错误信息通过结果聚合返回
        return false;
    }
}

/**
 * 读取密码文件
 * @param {string} keyFile - 密钥文件名
 * @returns {string|null} - 密码，AITS密钥返回null
 */
function readPassphrase(keyFile) {
    if (keyFile === 'AITS-primary-key.asc') {
        // AITS密钥不需要密码
        return null;
    } else if (keyFile === 'K6-primary-key.asc') {
        const projectRoot = path.join(__dirname, '..', '..', '..');
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

/**
 * 导入私钥
 * @param {string} privateKey - 私钥文件路径
 * @param {string|null} passphrase - 密码，null表示无密码
 * @returns {Promise<boolean>} - 是否导入成功
 */
async function importPrivateKey(privateKey, passphrase) {
    try {
        let importCmd;
        if (passphrase) {
            // 有密码的密钥
            importCmd = `gpg --batch --yes --passphrase "${passphrase}" --import "${privateKey}"`;
        } else {
            // 无密码的密钥
            importCmd = `gpg --batch --yes --import "${privateKey}"`;
        }
        await execAsync(importCmd); // 移除超时限制
        return true;
    } catch (error) {
        // 静默处理错误，错误信息通过结果聚合返回
        return false;
    }
}

/**
 * 导入所有需要的私钥
 * @param {Set<string>} keyFiles - 需要导入的密钥文件集合
 * @returns {Promise<boolean>} - 是否全部导入成功
 */
async function importAllPrivateKeys(keyFiles) {
    const results = [];
    const projectRoot = path.join(__dirname, '..', '..', '..');
    
    for (const keyFile of keyFiles) {
        const keyPath = path.join(projectRoot, keyFile);
        if (!fs.existsSync(keyPath)) {
            // 静默处理错误，错误信息通过结果聚合返回
            results.push(false);
            continue;
        }
        
        try {
            // 读取对应密钥的密码
            const passphrase = readPassphrase(keyFile);
            
            // 省略控制台输出：正在导入密钥
            const success = await importPrivateKey(keyPath, passphrase);
            results.push(success);
            
            if (success) {
                // 省略控制台输出：密钥导入成功
            } else {
                // 省略控制台输出：密钥导入失败
            }
        } catch (error) {
            // 静默处理错误，错误信息通过结果聚合返回
            results.push(false);
        }
    }
    
    return results.every(result => result);
}

/**
 * 执行批量解密
 * @param {Function} progressCallback - 进度回调函数
 * @returns {Promise<{success: number, total: number, errors: string[]}>} - 解密结果
 */
async function decryptAllFiles(progressCallback = null, options = {}) {
    const results = {
        success: 0,
        total: 0,
        errors: []
    };
    
    try {
        // 检查必要文件（仅当存在GPG文件时）
        const projectRoot = path.join(__dirname, '..', '..', '..');
        const aitsKey = path.join(projectRoot, 'AITS-primary-key.asc');
        const k6Key = path.join(projectRoot, 'K6-primary-key.asc');
        const k6PassphraseFile = path.join(projectRoot, 'K6-gpg-psd.psd');
        
        if (!fs.existsSync(aitsKey)) {
            throw new Error(`AITS私钥文件 ${aitsKey} 不存在`);
        }
        
        if (!fs.existsSync(k6Key)) {
            throw new Error(`K6私钥文件 ${k6Key} 不存在`);
        }
        
        if (!fs.existsSync(k6PassphraseFile)) {
            throw new Error(`K6密码文件 ${k6PassphraseFile} 不存在`);
        }
        
        // 获取输入文件，并按需过滤
        let gpgFiles = getGpgFiles();
        if (options && options.date) {
            gpgFiles = gpgFiles.filter(f => f.date === options.date);
        }
        // 支持按月份过滤（YYYYMM）
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
                progressCallback({
                    type: 'info',
                    message: '没有找到需要解密的文件',
                    progress: 100,
                    current: 0,
                    total: 0
                });
            }
            return results;
        }
        
        // 若存在GPG文件，则检查GPG环境与密钥
        const gpgOnlyFiles = gpgFiles.filter(f => f.isGpg);
        if (gpgOnlyFiles.length > 0) {
            // 检查必要文件
            if (!fs.existsSync(aitsKey)) {
                throw new Error(`AITS私钥文件 ${aitsKey} 不存在`);
            }
            
            if (!fs.existsSync(k6Key)) {
                throw new Error(`K6私钥文件 ${k6Key} 不存在`);
            }
            
            if (!fs.existsSync(k6PassphraseFile)) {
                throw new Error(`K6密码文件 ${k6PassphraseFile} 不存在`);
            }
            
            // 检查GPG是否安装
            if (!(await checkGpgInstalled())) {
                throw new Error('系统未安装GPG，请先安装GPG');
            }
        }

        // 提取所有日期和需要的密钥
        const dates = new Set();
        const keyFiles = new Set();
        gpgFiles.forEach(file => {
            dates.add(file.date);
            if (file.isGpg && file.keyFile) keyFiles.add(file.keyFile);
        });
        
        // 创建日期目录
        createDateDirectories(dates);
        
        // 导入所有需要的私钥（省略控制台输出）
        if (gpgOnlyFiles.length > 0) {
            if (!(await importAllPrivateKeys(keyFiles))) {
                throw new Error('私钥导入失败');
            }
        }
        // 私钥导入成功（省略控制台输出）
        
        // 按日期分组文件
        const filesByDate = {};
        gpgFiles.forEach(file => {
            if (!filesByDate[file.date]) {
                filesByDate[file.date] = [];
            }
            filesByDate[file.date].push(file);
        });
        
        // 开始解密
        const totalFiles = results.total;
        let processedCount = 0; // 已完成（成功或失败）的文件数
        for (const [date, files] of Object.entries(filesByDate)) {
            const dateDir = path.join(projectRoot, 'Sabre Data Decryption', date);
            // 省略控制台输出：正在解密某日期的文件
            
            if (progressCallback) {
                progressCallback({
                    type: 'info',
                    message: `正在解密日期 ${date} 的文件...`,
                    progress: Math.round((processedCount / totalFiles) * 100),
                    current: processedCount,
                    total: totalFiles
                });
            }
            
            for (const file of files) {
                // 省略控制台输出：解密文件开始
                
                if (progressCallback) {
                    progressCallback({
                        type: 'file_start',
                        message: file.isGpg ? `正在解密：${file.filename}` : `正在复制：${file.filename}`,
                        filename: file.filename,
                        keyFile: file.keyFile,
                        progress: Math.round((processedCount / totalFiles) * 100),
                        current: processedCount,
                        total: totalFiles
                    });
                }
                
                try {
                    if (file.isGpg) {
                        const passphrase = readPassphrase(file.keyFile);
                        if (await decryptGpgFile(file.filePath, dateDir, file.keyFile, passphrase)) {
                            results.success++;
                            processedCount++;
                            if (progressCallback) {
                                progressCallback({
                                    type: 'file_success',
                                    message: `解密成功：${file.filename}`,
                                    filename: file.filename,
                                    progress: Math.round((processedCount / totalFiles) * 100),
                                    current: processedCount,
                                    total: totalFiles
                                });
                            }
                        } else {
                            results.errors.push(`解密失败：${file.filename}`);
                            processedCount++;
                            if (progressCallback) {
                                progressCallback({
                                    type: 'file_error',
                                    message: `解密失败：${file.filename}`,
                                    filename: file.filename,
                                    progress: Math.round((processedCount / totalFiles) * 100),
                                    current: processedCount,
                                    total: totalFiles
                                });
                            }
                        }
                    } else {
                        // 非加密文件，直接复制
                        const target = path.join(dateDir, file.filename);
                        fs.copyFileSync(file.filePath, target);
                        results.success++;
                        processedCount++;
                        if (progressCallback) {
                            progressCallback({
                                type: 'file_success',
                                message: `复制成功：${file.filename}`,
                                filename: file.filename,
                                progress: Math.round((processedCount / totalFiles) * 100),
                                current: processedCount,
                                total: totalFiles
                            });
                        }
                    }
                } catch (error) {
                    results.errors.push(`${file.isGpg ? '解密失败' : '复制失败'}：${file.filename} - ${error.message}`);
                    // 省略控制台输出：解密异常
                    processedCount++;
                    
                    if (progressCallback) {
                        progressCallback({
                            type: 'file_error',
                            message: `${file.isGpg ? '解密失败' : '复制失败'}：${file.filename} - ${error.message}`,
                            filename: file.filename,
                            error: error.message,
                            progress: Math.round((processedCount / totalFiles) * 100),
                            current: processedCount,
                            total: totalFiles
                        });
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

/**
 * 获取解密状态
 * @returns {Object} - 解密状态信息
 */
function getDecryptStatus() {
    // 获取项目根目录
    // __dirname 指向 backend/src/services/ 目录
    // 需要回到项目根目录: backend/src/services -> backend/src -> backend -> 项目根目录
    const projectRoot = path.join(__dirname, '..', '..', '..');
    const encryptionDir = path.join(projectRoot, 'Sabre Data Encryption');
    const decryptionDir = path.join(projectRoot, 'Sabre Data Decryption');
    
    
    
    const status = {
        encryptionDir: {
            exists: fs.existsSync(encryptionDir),
            gpgFiles: 0,
            dates: new Set()
        },
        decryptionDir: {
            exists: fs.existsSync(decryptionDir),
            subdirs: []
        },
        privateKeys: {
            aits: {
                exists: fs.existsSync(path.join(projectRoot, 'AITS-primary-key.asc'))
            },
            k6: {
                exists: fs.existsSync(path.join(projectRoot, 'K6-primary-key.asc'))
            }
        },
        passphrases: {
            k6: {
                exists: fs.existsSync(path.join(projectRoot, 'K6-gpg-psd.psd'))
            }
        }
    };
    
    // 统计加密文件夹中的GPG文件
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
    
    // 统计解密文件夹中的子目录
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
