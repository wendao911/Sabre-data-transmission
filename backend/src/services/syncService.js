const path = require('path');
const fs = require('fs');
const sftpService = require('./sftpService');
const { FileMappingRule } = require('../models/FileMappingRule');
const { FileUploadLog } = require('../models/FileUploadLog');
const TransferLogTask = require('../models/TransferLogTask');
const TransferLogRule = require('../models/TransferLogRule');
const TransferLogFile = require('../models/TransferLogFile');
const config = require('../config');
const { replaceDateVariables, parseDateString } = require('../utils/date');

async function syncByMapping(dateStr) {
  const startTime = new Date();
  const taskLog = new TransferLogTask({ taskDate: dateStr, startTime: startTime, status: 'success' });
  await taskLog.save();
  try {
    const rules = await FileMappingRule.find({ enabled: true })
      .populate('source.fileTypeConfig', 'module fileType pushPath')
      .sort({ priority: -1 });
    taskLog.totalRules = rules.length;
    await taskLog.save();

    let totalFiles = 0, totalSuccess = 0, totalFailed = 0, totalSkipped = 0;
    const ruleResults = [];

    for (const rule of rules) {
      try {
        const ruleResult = await processRule(rule, dateStr, taskLog._id);
        totalFiles += ruleResult.totalFiles;
        totalSuccess += ruleResult.successCount;
        totalFailed += ruleResult.failedCount;
        totalSkipped += ruleResult.skippedCount;
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
        const failedRuleLog = new TransferLogRule({
          taskLogId: taskLog._id,
          ruleId: rule._id,
          ruleName: rule.description || rule.name || '未命名规则',
          module: rule.module || 'unknown',
          totalFiles: 0, successCount: 0, failedCount: 0, skippedCount: 0,
          status: 'fail', errorMessage: error.message
        });
        await failedRuleLog.save();
        ruleResults.push({
          ruleId: rule._id,
          ruleName: rule.description || rule.name || '未命名规则',
          module: rule.module || 'unknown',
          periodType: rule.schedule?.period || 'adhoc',
          totalFiles: 0, syncedFiles: 0, skippedFiles: 0, failedFiles: 0,
          status: 'fail', message: error.message
        });
      }
    }

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

    return { success: true, message: '同步完成', data: { taskLogId: taskLog._id, totalRules: rules.length, totalFiles, synced: totalSuccess, failed: totalFailed, skipped: totalSkipped, status: taskLog.status, duration, ruleResults } };
  } catch (error) {
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    taskLog.endTime = endTime;
    taskLog.duration = duration;
    taskLog.status = 'fail';
    taskLog.errorMessage = error.message;
    await taskLog.save();
    return { success: false, message: error.message, data: { taskLogId: taskLog._id, status: 'fail' } };
  }
}

async function processRule(rule, dateStr, taskLogId) {
  const period = rule.schedule?.period || 'adhoc';
  const shouldProcess = await checkPeriod(rule, dateStr, period);
  if (!shouldProcess) {
    return { totalFiles: 0, successCount: 0, failedCount: 0, skippedCount: 0, status: 'skipped' };
  }

  const ruleLog = new TransferLogRule({ taskLogId, ruleId: rule._id, ruleName: rule.description || rule.name || '未命名规则', module: rule.module || 'unknown', totalFiles: 0, successCount: 0, failedCount: 0, skippedCount: 0, status: 'success' });
  await ruleLog.save();

  try {
    const files = await getMatchedFiles(rule, dateStr);
    ruleLog.totalFiles = files.length; await ruleLog.save();
    if (files.length === 0) { ruleLog.status = 'success'; await ruleLog.save(); return { totalFiles: 0, successCount: 0, failedCount: 0, skippedCount: 0, status: 'success' }; }

    const destPath = parseDestinationPath(rule, dateStr);
    const conflictStrategy = rule.destination?.conflict || 'skip';
    let successCount = 0, failedCount = 0, skippedCount = 0;

    for (const file of files) {
      try {
        const fileResult = await processFile(file, rule, destPath, conflictStrategy, taskLogId, ruleLog._id);
        if (fileResult.status === 'success') successCount++; else if (fileResult.status === 'fail') failedCount++; else skippedCount++;
      } catch (error) {
        failedCount++;
        const fileLog = new TransferLogFile({ taskLogId, ruleLogId: ruleLog._id, fileName: file.filename, fileId: file.fileId, localPath: file.localPath, status: 'fail', errorMessage: error.message });
        await fileLog.save();
      }
    }

    ruleLog.successCount = successCount; ruleLog.failedCount = failedCount; ruleLog.skippedCount = skippedCount;
    ruleLog.status = failedCount > 0 ? 'partial' : (successCount > 0 ? 'success' : 'fail');
    await ruleLog.save();
    return { totalFiles: files.length, successCount, failedCount, skippedCount, status: ruleLog.status };
  } catch (error) {
    ruleLog.status = 'fail'; ruleLog.errorMessage = error.message; await ruleLog.save();
    throw error;
  }
}

async function checkPeriod(rule, dateStr, period) {
  switch (period) {
    case 'daily': return true;
    case 'weekly': {
      const scheduleWeekday = rule.schedule?.weekday; if (scheduleWeekday === undefined || scheduleWeekday === null) return false;
      const currentDate = new Date(dateStr + 'T00:00:00'); const currentWeekday = currentDate.getDay(); return currentWeekday === scheduleWeekday;
    }
    case 'monthly': {
      const scheduleMonthday = rule.schedule?.monthday; if (scheduleMonthday === undefined || scheduleMonthday === null) return false;
      const currentDate2 = new Date(dateStr + 'T00:00:00'); const currentMonthday = currentDate2.getDate(); return currentMonthday === scheduleMonthday;
    }
    case 'adhoc':
    default: return true;
  }
}

async function getMatchedFiles(rule, dateStr) {
  const sourceDir = rule.source?.directory || '';
  const resolvedDir = replaceDateVariables(sourceDir, dateStr);
  const rootPath = config.fileBrowser?.rootPath || process.cwd();
  const fullDir = path.resolve(rootPath, resolvedDir.startsWith('/') ? resolvedDir.substring(1) : resolvedDir);
  if (!fs.existsSync(fullDir) || !fs.statSync(fullDir).isDirectory()) return [];
  if (rule.matchType === 'filetype') return await getFilesByType(rule, fullDir, dateStr);
  return getFilesByPattern(rule, fullDir, dateStr);
}

function getFilesByPattern(rule, fullDir, dateStr) {
  const pattern = rule.source?.pattern || '*';
  const processedPattern = replaceDateVariables(pattern, dateStr);
  const escapedPattern = processedPattern.replace(/[.+^$()|\[\]\\]/g, '\\$&');
  let finalPattern = escapedPattern.replace(/\*/g, '.*').replace(/\?/g, '.');
  finalPattern = finalPattern.replace(/\\\.([A-Z0-9]+)$/i, '\\.$1');
  const regex = new RegExp('^' + finalPattern + '$', 'i');
  const allFiles = fs.readdirSync(fullDir);
  return allFiles.filter(filename => {
    const stat = fs.statSync(path.join(fullDir, filename)); if (!stat.isFile()) return false;
    const ext = path.extname(filename); const filenameWithExt = filename + ext; return regex.test(filenameWithExt);
  }).map(filename => ({ filename, localPath: path.join(fullDir, filename), fileId: null }));
}

async function getFilesByType(rule, fullDir, dateStr) {
  try {
    const fileTypeConfig = rule.source?.fileTypeConfig; if (!fileTypeConfig) return [];
    const query = { fileTypeConfigId: fileTypeConfig._id || fileTypeConfig, isDeleted: { $ne: true } };
    if (rule.schedule?.period === 'daily') {
      const targetDate = parseDateString(dateStr); const startOfDay = new Date(targetDate); startOfDay.setHours(0,0,0,0); const endOfDay = new Date(targetDate); endOfDay.setHours(23,59,59,999);
      query.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }
    const fileUploadLogs = await FileUploadLog.find(query).populate('fileTypeConfigId', 'module fileType pushPath').sort({ createdAt: -1 });
    const syncedFiles = await getSyncedFiles(rule._id, dateStr);
    const availableFiles = []; const allFiles = fs.readdirSync(fullDir);
    for (const log of fileUploadLogs) {
      const filename = log.filename; const localPath = log.localPath;
      const fileExists = allFiles.includes(filename) || (localPath && fs.existsSync(localPath));
      if (fileExists && !syncedFiles.has(filename)) { availableFiles.push({ filename, localPath: localPath || path.join(fullDir, filename), fileId: log._id }); }
    }
    return availableFiles;
  } catch (error) { return []; }
}

async function getSyncedFiles(ruleId, dateStr) {
  try {
    const targetDate = parseDateString(dateStr); const startOfDay = new Date(targetDate); startOfDay.setHours(0,0,0,0); const endOfDay = new Date(targetDate); endOfDay.setHours(23,59,59,999);
    const syncedRecords = await TransferLogFile.find({ ruleLogId: { $in: await TransferLogRule.find({ ruleId }).distinct('_id') }, transferTime: { $gte: startOfDay, $lte: endOfDay }, status: 'success' });
    return new Set(syncedRecords.map(record => record.fileName));
  } catch (error) { return new Set(); }
}

async function processFile(file, rule, destPath, conflictStrategy, taskLogId, ruleLogId) {
  try {
    const destFilename = parseFilenameTemplate(rule, file.filename);
    const remotePath = path.posix.join(destPath, destFilename);
    const conflictResult = await handleConflictStrategy(conflictStrategy, remotePath, file.filename);
    if (conflictResult.action === 'skip') {
      const fileLog = new TransferLogFile({ taskLogId, ruleLogId, fileName: file.filename, fileId: file.fileId, localPath: file.localPath, remotePath: conflictResult.finalPath, status: 'fail', errorMessage: conflictResult.message });
      await fileLog.save();
      return { status: 'skipped' };
    }
    const uploadResult = await uploadFileToSFTP(file.localPath, conflictResult.finalPath);
    const fileLog = new TransferLogFile({ taskLogId, ruleLogId, fileName: file.filename, fileId: file.fileId, localPath: file.localPath, remotePath: conflictResult.finalPath, fileSize: fs.statSync(file.localPath).size, status: uploadResult.success ? 'success' : 'fail', errorMessage: uploadResult.success ? null : uploadResult.message });
    await fileLog.save();
    return { status: uploadResult.success ? 'success' : 'fail', message: uploadResult.message };
  } catch (error) {
    const fileLog = new TransferLogFile({ taskLogId, ruleLogId, fileName: file.filename, fileId: file.fileId, localPath: file.localPath, status: 'fail', errorMessage: error.message });
    await fileLog.save();
    return { status: 'fail', message: error.message };
  }
}

function parseDestinationPath(rule, dateStr) {
  const destPath = rule.destination?.path || '/';
  return replaceDateVariables(destPath, dateStr);
}

function parseFilenameTemplate(rule, filename) {
  const template = rule.destination?.filename || '{baseName}{ext}';
  const parsed = path.parse(filename); const baseName = parsed.name; const ext = parsed.ext;
  return template.replace(/{baseName}/g, baseName).replace(/{ext}/g, ext);
}

async function handleConflictStrategy(conflictStrategy, remotePath, filename) {
  switch (conflictStrategy) {
    case 'skip':
      try { const exists = await sftpService.exists(remotePath); if (exists) return { action: 'skip', finalPath: remotePath, message: '文件已存在，跳过上传' }; return { action: 'upload', finalPath: remotePath, message: '文件不存在，可以上传' }; }
      catch (_) { return { action: 'upload', finalPath: remotePath, message: '无法检查文件状态，尝试上传' }; }
    case 'overwrite':
      return { action: 'upload', finalPath: remotePath, message: '覆盖已存在的文件' };
    case 'rename': {
      const parsed = path.parse(remotePath); const dir = parsed.dir; const name = parsed.name; const ext = parsed.ext;
      let counter = 1; let finalPath = remotePath;
      while (true) {
        try { const exists = await sftpService.exists(finalPath); if (!exists) break; finalPath = path.posix.join(dir, `${name}_${counter}${ext}`); counter++; }
        catch (_) { break; }
      }
      return { action: 'upload', finalPath, message: counter > 1 ? `重命名为: ${path.basename(finalPath)}` : '使用原文件名' };
    }
    default:
      return await handleConflictStrategy('skip', remotePath, filename);
  }
}

async function uploadFileToSFTP(localPath, remotePath) {
  try {
    if (!fs.existsSync(localPath)) return { success: false, message: `本地文件不存在: ${localPath}` };
    const stats = fs.statSync(localPath); const fileSize = stats.size;
    const uploadResult = await sftpService.uploadFile(localPath, remotePath);
    if (uploadResult.success) return { success: true, message: `上传成功 (${fileSize} bytes)` };
    return { success: false, message: uploadResult.message || '上传失败' };
  } catch (error) { return { success: false, message: `上传异常: ${error.message}` }; }
}

module.exports = { syncByMapping };


