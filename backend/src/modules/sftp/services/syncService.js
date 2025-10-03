const path = require('path');
const fs = require('fs');
const sftpService = require('./sftpService');
const FileMappingRule = require('../../fileMapping/models/FileMappingRule');
const FileUploadLog = require('../../files/models/FileUploadLog');
const TransferLogTask = require('../models/TransferLogTask');
const TransferLogRule = require('../models/TransferLogRule');
const TransferLogFile = require('../models/TransferLogFile');
const config = require('../../../config');
const { replaceDateVariables, parseDateString } = require('../../../utils/date');

/**
 * 重构后的SFTP文件同步服务
 * 按照新的逻辑流程：
 * 1.获取所有规则
 * 2.遍历所有规则
 * 3.判断规则的周期
 * 4.区分规则类型是按文件名匹配，还是按文件类型匹配
 * 5.根据规则获取所有匹配文件
 * 6.解析目标路径和冲突策略
 * 7.循环处理每个文件
 * 8.上传，并记录日志（成功/失败）
 * 9.结束循环后，记录日志上一级
 */

/**
 * 主同步入口函数
 * @param {string} dateStr - 日期字符串
 * @returns {Object} 同步结果
 */
async function syncByMapping(dateStr) {
  const startTime = new Date();
  
  // 1. 创建任务日志
  const taskLog = new TransferLogTask({
    taskDate: dateStr, // 直接使用 YYYYMMDD 格式的字符串
    startTime: startTime,
    status: 'success' // 初始状态，后续会根据结果更新
  });
  await taskLog.save();
  
  try {
    // 2. 获取所有启用的规则
    const rules = await FileMappingRule.find({ enabled: true })
      .populate('source.fileTypeConfig', 'module fileType pushPath')
      .sort({ priority: -1 });
    
    taskLog.totalRules = rules.length;
    await taskLog.save();
    
    let totalFiles = 0;
    let totalSuccess = 0;
    let totalFailed = 0;
    let totalSkipped = 0;
    const ruleResults = [];
    
    // 3. 遍历所有规则
    for (const rule of rules) {
      try {
        const ruleResult = await processRule(rule, dateStr, taskLog._id);
        
        // 累加统计
        totalFiles += ruleResult.totalFiles;
        totalSuccess += ruleResult.successCount;
        totalFailed += ruleResult.failedCount;
        totalSkipped += ruleResult.skippedCount;
        
        // 收集规则结果用于前端显示
        ruleResults.push({
          ruleId: rule._id,
          ruleName: rule.description || rule.name || '未命名规则',
          module: rule.module || 'unknown',
          periodType: rule.schedule?.period || 'adhoc',
          totalFiles: ruleResult.totalFiles,
          syncedFiles: ruleResult.successCount,
          skippedFiles: ruleResult.skippedCount,
          failedFiles: ruleResult.failedCount,
          status: ruleResult.status,
          message: ruleResult.message || ''
        });
        
      } catch (error) {
        console.error(`规则 ${rule._id} 处理失败:`, error);
        
        // 创建失败的规则日志
        const failedRuleLog = new TransferLogRule({
          taskLogId: taskLog._id,
          ruleId: rule._id,
          ruleName: rule.description || rule.name || '未命名规则',
          module: rule.module || 'unknown',
          totalFiles: 0,
          successCount: 0,
          failedCount: 0,
          skippedCount: 0,
          status: 'fail',
          errorMessage: error.message
        });
        await failedRuleLog.save();
        
        // 添加失败的规则结果
        ruleResults.push({
          ruleId: rule._id,
          ruleName: rule.description || rule.name || '未命名规则',
          module: rule.module || 'unknown',
          periodType: rule.schedule?.period || 'adhoc',
          totalFiles: 0,
          syncedFiles: 0,
          skippedFiles: 0,
          failedFiles: 0,
          status: 'fail',
          message: error.message
        });
      }
    }
    
    // 4. 更新任务日志
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    
    taskLog.endTime = endTime;
    taskLog.duration = duration;
    taskLog.totalFiles = totalFiles;
    taskLog.successCount = totalSuccess;
    taskLog.failedCount = totalFailed;
    taskLog.skippedCount = totalSkipped;
    taskLog.status = totalFailed > 0 ? 'partial' : (totalSuccess > 0 ? 'success' : 'fail');
    
    await taskLog.save();
    
    return {
      success: true,
      message: '同步完成',
      data: {
        taskLogId: taskLog._id,
        totalRules: rules.length,
        totalFiles,
        synced: totalSuccess,
        failed: totalFailed,
        skipped: totalSkipped,
        status: taskLog.status,
        duration,
        ruleResults: ruleResults
      }
    };
    
  } catch (error) {
    console.error('同步任务失败:', error);
    
    // 更新任务日志为失败状态
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    
    taskLog.endTime = endTime;
    taskLog.duration = duration;
    taskLog.status = 'fail';
    taskLog.errorMessage = error.message;
    
    await taskLog.save();
    
    return {
      success: false,
      message: error.message,
      data: {
        taskLogId: taskLog._id,
        status: 'fail'
      }
    };
  }
}

/**
 * 处理单个规则
 * @param {Object} rule - 文件映射规则
 * @param {string} dateStr - 日期字符串
 * @param {string} taskLogId - 任务日志ID
 * @returns {Object} 规则处理结果
 */
async function processRule(rule, dateStr, taskLogId) {
  // 1. 判断规则的周期
  const period = rule.schedule?.period || 'adhoc';
  const shouldProcess = await checkPeriod(rule, dateStr, period);
  
  if (!shouldProcess) {
    return {
      totalFiles: 0,
      successCount: 0,
      failedCount: 0,
      skippedCount: 0,
      status: 'skipped'
    };
  }
  
  // 2. 创建规则日志
  const ruleLog = new TransferLogRule({
    taskLogId: taskLogId,
    ruleId: rule._id,
    ruleName: rule.description || rule.name || '未命名规则',
    module: rule.module || 'unknown',
    totalFiles: 0,
    successCount: 0,
    failedCount: 0,
    skippedCount: 0,
    status: 'success'
  });
  await ruleLog.save();
  
  try {
    // 3. 根据规则类型获取匹配文件
    const files = await getMatchedFiles(rule, dateStr);
    
    ruleLog.totalFiles = files.length;
    await ruleLog.save();
    
    if (files.length === 0) {
      ruleLog.status = 'success';
      await ruleLog.save();
      return {
        totalFiles: 0,
        successCount: 0,
        failedCount: 0,
        skippedCount: 0,
        status: 'success'
      };
    }
    
    // 4. 解析目标路径和冲突策略
    const destPath = parseDestinationPath(rule, dateStr);
    const conflictStrategy = rule.destination?.conflict || 'skip';
    
    let successCount = 0;
    let failedCount = 0;
    let skippedCount = 0;
    
    // 5. 循环处理每个文件
    for (const file of files) {
      try {
        const fileResult = await processFile(file, rule, destPath, conflictStrategy, taskLogId, ruleLog._id);
        
        if (fileResult.status === 'success') {
          successCount++;
        } else if (fileResult.status === 'fail') {
          failedCount++;
        } else {
          skippedCount++;
        }
        
      } catch (error) {
        console.error(`文件 ${file.filename} 处理失败:`, error);
        failedCount++;
        
        // 记录失败的文件日志
        const fileLog = new TransferLogFile({
          taskLogId: taskLogId,
          ruleLogId: ruleLog._id,
          fileName: file.filename,
          fileId: file.fileId,
          localPath: file.localPath,
          status: 'fail',
          errorMessage: error.message
        });
        await fileLog.save();
      }
    }
    
    // 6. 更新规则日志
    ruleLog.successCount = successCount;
    ruleLog.failedCount = failedCount;
    ruleLog.skippedCount = skippedCount;
    ruleLog.status = failedCount > 0 ? 'partial' : (successCount > 0 ? 'success' : 'fail');
    await ruleLog.save();
    
    return {
      totalFiles: files.length,
      successCount,
      failedCount,
      skippedCount,
      status: ruleLog.status
    };
    
  } catch (error) {
    console.error(`规则 ${rule._id} 处理失败:`, error);
    
    ruleLog.status = 'fail';
    ruleLog.errorMessage = error.message;
    await ruleLog.save();
    
    throw error;
  }
}

/**
 * 检查周期是否匹配
 * @param {Object} rule - 规则
 * @param {string} dateStr - 日期字符串
 * @param {string} period - 周期类型
 * @returns {boolean} 是否应该处理
 */
async function checkPeriod(rule, dateStr, period) {
  switch (period) {
    case 'daily':
      return true;
      
    case 'weekly':
      const scheduleWeekday = rule.schedule?.weekday;
      if (scheduleWeekday === undefined || scheduleWeekday === null) {
        return false;
      }
      const currentDate = new Date(dateStr + 'T00:00:00');
      const currentWeekday = currentDate.getDay();
      return currentWeekday === scheduleWeekday;
      
    case 'monthly':
      const scheduleMonthday = rule.schedule?.monthday;
      if (scheduleMonthday === undefined || scheduleMonthday === null) {
        return false;
      }
      const currentDate2 = new Date(dateStr + 'T00:00:00');
      const currentMonthday = currentDate2.getDate();
      return currentMonthday === scheduleMonthday;
      
    case 'adhoc':
    default:
      return true;
  }
}

/**
 * 根据规则类型获取匹配文件
 * @param {Object} rule - 规则
 * @param {string} dateStr - 日期字符串
 * @returns {Array} 匹配的文件列表
 */
async function getMatchedFiles(rule, dateStr) {
  const sourceDir = rule.source?.directory || '';
  const resolvedDir = replaceDateVariables(sourceDir, dateStr);
  const rootPath = config.fileBrowser?.rootPath || process.cwd();
  const fullDir = path.resolve(rootPath, resolvedDir.startsWith('/') ? resolvedDir.substring(1) : resolvedDir);
  
  if (!fs.existsSync(fullDir) || !fs.statSync(fullDir).isDirectory()) {
    return [];
  }
  
  if (rule.matchType === 'filetype') {
    // 按文件类型匹配
    return await getFilesByType(rule, fullDir, dateStr);
  } else {
    // 按文件名匹配
    return getFilesByPattern(rule, fullDir, dateStr);
  }
}

/**
 * 按文件名模式获取文件列表
 * @param {Object} rule - 规则
 * @param {string} fullDir - 完整目录路径
 * @param {string} dateStr - 日期字符串
 * @returns {Array} 文件列表
 */
function getFilesByPattern(rule, fullDir, dateStr) {
  const pattern = rule.source?.pattern || '*';
  const processedPattern = replaceDateVariables(pattern, dateStr);
  const escapedPattern = processedPattern.replace(/[.+^$()|\[\]\\]/g, '\\$&');
  let finalPattern = escapedPattern.replace(/\*/g, '.*').replace(/\?/g, '.');
  finalPattern = finalPattern.replace(/\\\.([A-Z0-9]+)$/i, '\\.$1');
  
  const regex = new RegExp('^' + finalPattern + '$', 'i');
  const allFiles = fs.readdirSync(fullDir);
  
  return allFiles.filter(filename => {
    const stat = fs.statSync(path.join(fullDir, filename));
    if (!stat.isFile()) return false;
    
    const ext = path.extname(filename);
    const filenameWithExt = filename + ext;
    return regex.test(filenameWithExt);
  }).map(filename => ({
    filename,
    localPath: path.join(fullDir, filename),
    fileId: null
  }));
}

/**
 * 按文件类型获取文件列表
 * @param {Object} rule - 规则
 * @param {string} fullDir - 完整目录路径
 * @param {string} dateStr - 日期字符串
 * @returns {Array} 文件列表
 */
async function getFilesByType(rule, fullDir, dateStr) {
  try {
    const fileTypeConfig = rule.source?.fileTypeConfig;
    if (!fileTypeConfig) {
      return [];
    }
    
    const query = {
      fileTypeConfigId: fileTypeConfig._id || fileTypeConfig,
      isDeleted: { $ne: true }
    };
    
    // 根据日期范围查询
    if (rule.schedule?.period === 'daily') {
      const targetDate = parseDateString(dateStr);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      query.createdAt = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }
    
    const fileUploadLogs = await FileUploadLog.find(query)
      .populate('fileTypeConfigId', 'module fileType pushPath')
      .sort({ createdAt: -1 });
    
    // 获取已同步的文件列表，避免重复同步
    const syncedFiles = await getSyncedFiles(rule._id, dateStr);
    
    const availableFiles = [];
    const allFiles = fs.readdirSync(fullDir);
    
    for (const log of fileUploadLogs) {
      const filename = log.filename;
      const localPath = log.localPath;
      
      const fileExists = allFiles.includes(filename) || 
                       (localPath && fs.existsSync(localPath));
      
      if (fileExists && !syncedFiles.has(filename)) {
        availableFiles.push({
          filename,
          localPath: localPath || path.join(fullDir, filename),
          fileId: log._id
        });
      }
    }
    
    return availableFiles;
    
  } catch (error) {
    console.error('按文件类型获取文件列表失败:', error);
    return [];
  }
}

/**
 * 获取已同步的文件列表
 * @param {string} ruleId - 规则ID
 * @param {string} dateStr - 日期字符串
 * @returns {Set} 已同步的文件名集合
 */
async function getSyncedFiles(ruleId, dateStr) {
  try {
    const targetDate = parseDateString(dateStr);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const syncedRecords = await TransferLogFile.find({
      ruleLogId: { $in: await TransferLogRule.find({ ruleId }).distinct('_id') },
      transferTime: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: 'success'
    });
    
    return new Set(syncedRecords.map(record => record.fileName));
  } catch (error) {
    console.error('获取已同步文件列表失败:', error);
    return new Set();
  }
}

/**
 * 处理单个文件
 * @param {Object} file - 文件信息
 * @param {Object} rule - 规则
 * @param {string} destPath - 目标路径
 * @param {string} conflictStrategy - 冲突策略
 * @param {string} taskLogId - 任务日志ID
 * @param {string} ruleLogId - 规则日志ID
 * @returns {Object} 处理结果
 */
async function processFile(file, rule, destPath, conflictStrategy, taskLogId, ruleLogId) {
  try {
    // 解析文件名模板
    const destFilename = parseFilenameTemplate(rule, file.filename);
    const remotePath = path.posix.join(destPath, destFilename);
    
    // 处理冲突策略
    const conflictResult = await handleConflictStrategy(conflictStrategy, remotePath, file.filename);
    
    if (conflictResult.action === 'skip') {
      // 记录跳过的文件日志
      const fileLog = new TransferLogFile({
        taskLogId: taskLogId,
        ruleLogId: ruleLogId,
        fileName: file.filename,
        fileId: file.fileId,
        localPath: file.localPath,
        remotePath: conflictResult.finalPath,
        status: 'fail', // 跳过视为失败
        errorMessage: conflictResult.message
      });
      await fileLog.save();
      
      return { status: 'skipped' };
    }
    
    // 上传文件
    const uploadResult = await uploadFileToSFTP(file.localPath, conflictResult.finalPath);
    
    // 记录文件传输日志
    const fileLog = new TransferLogFile({
      taskLogId: taskLogId,
      ruleLogId: ruleLogId,
      fileName: file.filename,
      fileId: file.fileId,
      localPath: file.localPath,
      remotePath: conflictResult.finalPath,
      fileSize: fs.statSync(file.localPath).size,
      status: uploadResult.success ? 'success' : 'fail',
      errorMessage: uploadResult.success ? null : uploadResult.message
    });
    await fileLog.save();
    
    return {
      status: uploadResult.success ? 'success' : 'fail',
      message: uploadResult.message
    };
    
  } catch (error) {
    console.error(`文件 ${file.filename} 处理异常:`, error);
    
    // 记录异常的文件日志
    const fileLog = new TransferLogFile({
      taskLogId: taskLogId,
      ruleLogId: ruleLogId,
      fileName: file.filename,
      fileId: file.fileId,
      localPath: file.localPath,
      status: 'fail',
      errorMessage: error.message
    });
    await fileLog.save();
    
    return { status: 'fail', message: error.message };
  }
}

/**
 * 解析目标路径
 * @param {Object} rule - 规则
 * @param {string} dateStr - 日期字符串
 * @returns {string} 解析后的目标路径
 */
function parseDestinationPath(rule, dateStr) {
  const destPath = rule.destination?.path || '/';
  return replaceDateVariables(destPath, dateStr);
}

/**
 * 解析文件名模板
 * @param {Object} rule - 规则
 * @param {string} filename - 原始文件名
 * @returns {string} 解析后的文件名
 */
function parseFilenameTemplate(rule, filename) {
  const template = rule.destination?.filename || '{baseName}{ext}';
  const parsed = path.parse(filename);
  const baseName = parsed.name;
  const ext = parsed.ext;
  
  return template
    .replace(/{baseName}/g, baseName)
    .replace(/{ext}/g, ext);
}

/**
 * 处理冲突策略
 * @param {string} conflictStrategy - 冲突策略
 * @param {string} remotePath - 远程路径
 * @param {string} filename - 文件名
 * @returns {Object} 处理结果
 */
async function handleConflictStrategy(conflictStrategy, remotePath, filename) {
  switch (conflictStrategy) {
    case 'skip':
      try {
        const exists = await sftpService.exists(remotePath);
        if (exists) {
          return {
            action: 'skip',
            finalPath: remotePath,
            message: '文件已存在，跳过上传'
          };
        }
        return {
          action: 'upload',
          finalPath: remotePath,
          message: '文件不存在，可以上传'
        };
      } catch (error) {
        return {
          action: 'upload',
          finalPath: remotePath,
          message: '无法检查文件状态，尝试上传'
        };
      }
      
    case 'overwrite':
      return {
        action: 'upload',
        finalPath: remotePath,
        message: '覆盖已存在的文件'
      };
      
    case 'rename':
      const parsed = path.parse(remotePath);
      const dir = parsed.dir;
      const name = parsed.name;
      const ext = parsed.ext;
      
      let counter = 1;
      let finalPath = remotePath;
      
      while (true) {
        try {
          const exists = await sftpService.exists(finalPath);
          if (!exists) {
            break;
          }
          finalPath = path.posix.join(dir, `${name}_${counter}${ext}`);
          counter++;
        } catch (error) {
          break;
        }
      }
      
      return {
        action: 'upload',
        finalPath: finalPath,
        message: counter > 1 ? `重命名为: ${path.basename(finalPath)}` : '使用原文件名'
      };
      
    default:
      return await handleConflictStrategy('skip', remotePath, filename);
  }
}

/**
 * 上传文件到SFTP
 * @param {string} localPath - 本地文件路径
 * @param {string} remotePath - 远程文件路径
 * @returns {Object} 上传结果
 */
async function uploadFileToSFTP(localPath, remotePath) {
  try {
    if (!fs.existsSync(localPath)) {
      return {
        success: false,
        message: `本地文件不存在: ${localPath}`
      };
    }
    
    const stats = fs.statSync(localPath);
    const fileSize = stats.size;
    
    const uploadResult = await sftpService.uploadFile(localPath, remotePath);
    
    if (uploadResult.success) {
      return {
        success: true,
        message: `上传成功 (${fileSize} bytes)`
      };
    } else {
      return {
        success: false,
        message: uploadResult.message || '上传失败'
      };
    }
    
  } catch (error) {
    return {
      success: false,
      message: `上传异常: ${error.message}`
    };
  }
}

module.exports = { syncByMapping };
