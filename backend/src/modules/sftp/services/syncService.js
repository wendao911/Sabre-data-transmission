const path = require('path');
const fs = require('fs');
const sftpService = require('./sftpService');
const FileMappingRule = require('../../fileMapping/models/FileMappingRule');
const { SyncSession, AdhocFileSync } = require('../../fileMapping/models/SyncRecord');
const config = require('../../../config');
const { replaceDateVariables, formatDate, parseDateString } = require('../../../utils/date');

/**
 * 1.根据规则获取文件列表
 * @param {*} rule 
 * @param {*} date 
 * @returns 
 */
function getFileList(rule, date) {
  const sourceDir = rule.source?.directory || '';
  const pattern = rule.source?.pattern || '*';
  const resolvedDir = replaceDateVariables(sourceDir, date);
  const rootPath = config.fileBrowser?.rootPath || process.cwd();
  const fullDir = path.resolve(rootPath, resolvedDir.startsWith('/') ? resolvedDir.substring(1) : resolvedDir);
  if (!fs.existsSync(fullDir) || !fs.statSync(fullDir).isDirectory()) {
    return { files: [], fullDir, reason: `dir-not-exist: ${fullDir}` };
  }
  // 先处理日期变量，再进行正则转义
  const processedPattern = replaceDateVariables(pattern, date);
  
  // 转义正则特殊字符（但不要转义花括号，因为已经处理了日期变量）
  const escapedPattern = processedPattern.replace(/[.+^$()|\[\]\\]/g, '\\$&');
  
  const regex = new RegExp('^' + escapedPattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$', 'i');
  const allFiles = fs.readdirSync(fullDir);
  const matchedFiles = allFiles.filter(filename => {
    const filePath = path.join(fullDir, filename);
    const stat = fs.statSync(filePath);
    return stat.isFile() && regex.test(filename);
  });
  console.log(`找到 ${matchedFiles.length} 个匹配文件:`, matchedFiles);
  return { files: matchedFiles, fullDir };
}

/**
 * 2.解析目标路径（支持日期变量）
 * @param {Object} rule - 文件映射规则
 * @param {string} date - 日期字符串
 * @returns {string} 解析后的目标路径
 */
function parseDestinationPath(rule, date) {
  const destPath = rule.destination?.path || '/';
  const parsedPath = replaceDateVariables(destPath, date);
  console.log(`解析目标路径: ${destPath} -> ${parsedPath}`);
  return parsedPath;
}

/**
 * 3.解析文件名模板（支持baseName、ext变量）
 * @param {Object} rule - 文件映射规则
 * @param {string} filename - 原始文件名
 * @returns {string} 解析后的文件名模板
 */
function parseFilenameTemplate(rule, filename) {
  const template = rule.destination?.filename || '{baseName}{ext}';
  const parsed = path.parse(filename);
  const baseName = parsed.name;
  const ext = parsed.ext;
  
  const parsedFilename = template
    .replace(/{baseName}/g, baseName)
    .replace(/{ext}/g, ext);
  
  console.log(`解析文件名模板: ${template} -> ${parsedFilename} (${filename})`);
  return parsedFilename;
}

/**
 * 4.处理冲突策略
 * @param {string} conflictStrategy - 冲突策略 (skip/overwrite/rename)
 * @param {string} remotePath - 远程文件路径
 * @param {string} filename - 文件名
 * @returns {Object} 处理结果 { action, finalPath, message }
 */
async function handleConflictStrategy(conflictStrategy, remotePath, filename) {
  console.log(`处理冲突策略: ${conflictStrategy}, 路径: ${remotePath}`);
  
  switch (conflictStrategy) {
    case 'skip':
      // 跳过策略：检查文件是否存在
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
        console.warn(`检查文件是否存在失败: ${error.message}`);
        return {
          action: 'upload',
          finalPath: remotePath,
          message: '无法检查文件状态，尝试上传'
        };
      }
      
    case 'overwrite':
      // 覆盖策略：直接上传覆盖
      return {
        action: 'upload',
        finalPath: remotePath,
        message: '覆盖已存在的文件'
      };
      
    case 'rename':
      // 重命名策略：生成唯一文件名
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
          console.warn(`检查重命名文件是否存在失败: ${error.message}`);
          break;
        }
      }
      
      return {
        action: 'upload',
        finalPath: finalPath,
        message: counter > 1 ? `重命名为: ${path.basename(finalPath)}` : '使用原文件名'
      };
      
    default:
      // 默认使用跳过策略
      console.warn(`未知的冲突策略: ${conflictStrategy}，使用默认的skip策略`);
      return await handleConflictStrategy('skip', remotePath, filename);
  }
}

/**
 * 5.上传文件到SFTP
 * @param {string} localPath - 本地文件路径
 * @param {string} remotePath - 远程文件路径
 * @returns {Object} 上传结果 { success, message }
 */
async function uploadFileToSFTP(localPath, remotePath) {
  console.log(`开始上传文件: ${localPath} -> ${remotePath}`);
  
  try {
    // 检查本地文件是否存在
    if (!fs.existsSync(localPath)) {
      return {
        success: false,
        message: `本地文件不存在: ${localPath}`
      };
    }
    
    // 获取文件信息
    const stats = fs.statSync(localPath);
    const fileSize = stats.size;
    
    console.log(`文件大小: ${fileSize} bytes`);
    
    // 调用SFTP服务上传文件
    const uploadResult = await sftpService.uploadFile(localPath, remotePath);
    
    if (uploadResult.success) {
      console.log(`文件上传成功: ${remotePath}`);
      return {
        success: true,
        message: `上传成功 (${fileSize} bytes)`
      };
    } else {
      console.error(`文件上传失败: ${uploadResult.message}`);
      return {
        success: false,
        message: uploadResult.message || '上传失败'
      };
    }
    
  } catch (error) {
    console.error(`上传文件异常: ${error.message}`);
    return {
      success: false,
      message: `上传异常: ${error.message}`
    };
  }
}

/**
 * 6.记录同步会话结果
 * @param {string} date - 日期字符串
 * @param {Date} startTime - 开始时间
 * @param {Object} results - 同步结果统计
 * @returns {Object} 记录结果 { success, message }
 */
async function recordSyncSession(date, startTime, results) {
  console.log(`记录同步会话: 日期=${date}, 开始时间=${startTime}`);
  
  try {
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    
    // 创建同步会话记录
    const syncSession = new SyncSession({
      syncDate: parseDateString(date),
      startTime: startTime,
      endTime: endTime,
      duration: duration,
      totalRules: results.totalRules || 0,
      totalFiles: results.totalFiles || 0,
      syncedFiles: results.synced || 0,
      skippedFiles: results.skipped || 0,
      failedFiles: results.failed || 0,
      status: results.failed > 0 ? 'partial' : (results.synced > 0 ? 'success' : 'no_files'),
      ruleResults: results.details || []
    });
    
    // 保存到数据库
    await syncSession.save();
    
    console.log(`同步会话已保存: ${syncSession._id}`);
    return {
      success: true,
      message: '同步会话记录成功',
      sessionId: syncSession._id
    };
    
  } catch (error) {
    console.error(`记录同步会话失败: ${error.message}`);
    return {
      success: false,
      message: `记录失败: ${error.message}`
    };
  }
}

/**
 * 根据规则处理文件同步（通用方法）
 * 步骤规划：
 * 1. 根据规则获取文件列表
 * 2. 解析目标路径（支持日期变量）
 * 3. 解析文件名模板（支持baseName、ext变量）
 * 4. 处理冲突策略（skip/overwrite/rename）
 * 5. 上传文件到SFTP
 * 6. 记录同步结果
 * @param {Object} rule - 文件映射规则
 * @param {string} date - 日期字符串
 * @param {string} periodType - 周期类型（daily/weekly/monthly/adhoc）
 * @returns {Object} 同步结果
 */
async function processRuleSync(rule, date, periodType) {
  console.log(`执行${periodType}同步: 规则=${rule.description || rule._id}, 日期=${date}`);
  
  const startTime = new Date();
  const results = { 
    totalFiles: 0, 
    synced: 0, 
    skipped: 0, 
    failed: 0, 
    details: [],
    startTime: startTime
  };

  try {
    // 1. 根据规则获取文件列表
    const fileResult = getFileList(rule, date);
    if (!fileResult.files || fileResult.files.length === 0) {
      console.log(`规则 ${rule._id} 没有找到匹配的文件`);
      results.status = 'no_files';
      await recordSyncResult(rule, date, periodType, results);
      return { success: true, message: '没有找到匹配的文件', data: results };
    }
    
    results.totalFiles = fileResult.files.length;
    console.log(`找到 ${fileResult.files.length} 个文件:`, fileResult.files);

    // 2. 解析目标路径（支持日期变量）
    const destPath = parseDestinationPath(rule, date);
    
    // 3. 解析冲突策略
    const conflictStrategy = rule.destination?.conflict || 'skip';
    console.log(`冲突策略: ${conflictStrategy}`);

    // 4. 循环处理每个文件
    for (const filename of fileResult.files) {
      try {
        console.log(`处理文件: ${filename}`);
        
        // 3. 解析文件名模板（支持baseName、ext变量）
        const destFilename = parseFilenameTemplate(rule, filename);
        const remotePath = path.posix.join(destPath, destFilename);
        
        // 4. 处理冲突策略
        const conflictResult = await handleConflictStrategy(conflictStrategy, remotePath, filename);
        
        if (conflictResult.action === 'skip') {
          results.skipped++;
          results.details.push({
            filename,
            status: 'skipped',
            message: conflictResult.message,
            remotePath: conflictResult.finalPath
          });
          console.log(`文件跳过: ${filename} - ${conflictResult.message}`);
          continue;
        }
        
        // 5. 上传文件到SFTP
        const localPath = path.join(fileResult.fullDir, filename);
        const uploadResult = await uploadFileToSFTP(localPath, conflictResult.finalPath);
        
        if (uploadResult.success) {
          results.synced++;
          results.details.push({
            filename,
            status: 'synced',
            message: uploadResult.message,
            remotePath: conflictResult.finalPath
          });
          console.log(`文件上传成功: ${filename} -> ${conflictResult.finalPath}`);
        } else {
          results.failed++;
          results.details.push({
            filename,
            status: 'failed',
            message: uploadResult.message,
            remotePath: conflictResult.finalPath
          });
          console.error(`文件上传失败: ${filename} - ${uploadResult.message}`);
        }
        
      } catch (error) {
        console.error(`处理文件 ${filename} 异常:`, error);
        results.failed++;
        results.details.push({
          filename,
          status: 'error',
          message: error.message
        });
      }
    }

    // 6. 设置状态
    results.status = results.failed > 0 ? 'partial' : (results.synced > 0 ? 'success' : 'no_files');
    
    console.log(`${periodType}同步完成: 成功=${results.synced}, 跳过=${results.skipped}, 失败=${results.failed}`);
    
    return { 
      success: true, 
      message: `${periodType}同步完成`, 
      data: results
    };
    
  } catch (error) {
    console.error(`${periodType}同步失败:`, error);
    results.status = 'failed';
    results.details.push({
      error: error.message,
      status: 'error'
    });
    
    return { 
      success: false, 
      message: error.message, 
      data: results 
    };
  }
}

/**
 * 每日同步处理方法
 * @param {*} rule 
 * @param {*} date 
 * @returns 
 */
async function processDailySync(rule, date) {
  return await processRuleSync(rule, date, 'daily');
}

/**
 * 每周同步处理方法
 * @param {*} rule 
 * @param {*} date 
 * @returns 
 */
async function processWeeklySync(rule, date) {
  // 检查是否配置了周几
  const scheduleWeekday = rule.schedule?.weekday;
  if (scheduleWeekday === undefined || scheduleWeekday === null) {
    return { success: true, message: '未配置周几，跳过每周同步' };
  }
  
  // 获取当前日期的周几（0=周日, 1=周一, ..., 6=周六）
  const currentDate = new Date(date + 'T00:00:00');
  const currentWeekday = currentDate.getDay();
  
  // 判断当前周几是否匹配配置的周几
  if (currentWeekday !== scheduleWeekday) {
    return { success: true, message: `当前周几(${currentWeekday})与配置周几(${scheduleWeekday})不匹配` };
  }

  return await processRuleSync(rule, date, 'weekly');
}

/**
 * 每月同步处理方法
 * @param {*} rule 
 * @param {*} date 
 * @returns 
 */
async function processMonthlySync(rule, date) {
  // 检查是否配置了每月几号
  const scheduleMonthday = rule.schedule?.monthday;
  if (scheduleMonthday === undefined || scheduleMonthday === null) {
    return { success: true, message: '未配置每月几号，跳过每月同步' };
  }
  
  // 获取当前日期的几号（1-31）
  const currentDate = new Date(date + 'T00:00:00');
  const currentMonthday = currentDate.getDate();
  
  // 判断当前几号是否匹配配置的几号
  if (currentMonthday !== scheduleMonthday) {
    return { success: true, message: `当前几号(${currentMonthday})与配置几号(${scheduleMonthday})不匹配` };
  }

  return await processRuleSync(rule, date, 'monthly');
}

/**
 * 非固定同步处理方法
 * 特点：每天执行，但每个文件只同步一次，需要检查数据库记录
 * @param {*} rule 
 * @param {*} date 
 * @returns 
 */
async function processAdhocSync(rule, date) {
  console.log(`执行非固定同步: 规则=${rule.description || rule._id}, 日期=${date}`);
  
  const startTime = new Date();
  const results = { 
    totalFiles: 0, 
    synced: 0, 
    skipped: 0, 
    failed: 0, 
    details: [],
    startTime: startTime
  };

  try {
    // 1. 根据规则获取文件列表
    const fileResult = getFileList(rule, date);
    if (!fileResult.files || fileResult.files.length === 0) {
      console.log(`规则 ${rule._id} 没有找到匹配的文件`);
      results.status = 'no_files';
      return { success: true, message: '没有找到匹配的文件', data: results };
    }
    
    results.totalFiles = fileResult.files.length;
    console.log(`找到 ${fileResult.files.length} 个文件:`, fileResult.files);

    // 2. 解析目标路径（支持日期变量）
    const destPath = parseDestinationPath(rule, date);
    
    // 3. 解析冲突策略
    const conflictStrategy = rule.destination?.conflict || 'skip';
    console.log(`冲突策略: ${conflictStrategy}`);

    // 4. 循环处理每个文件
    for (const filename of fileResult.files) {
      try {
        console.log(`处理文件: ${filename}`);
        
        // 检查文件是否已经同步过
        const existingRecord = await AdhocFileSync.findOne({
          ruleId: rule._id,
          filename: filename,
          status: 'synced'
        });
        
        if (existingRecord) {
          results.skipped++;
          results.details.push({
            filename,
            status: 'skipped',
            message: '文件已同步过，跳过',
            remotePath: ''
          });
          console.log(`文件已同步过，跳过: ${filename}`);
          continue;
        }
        
        // 解析文件名模板（支持baseName、ext变量）
        const destFilename = parseFilenameTemplate(rule, filename);
        const remotePath = path.posix.join(destPath, destFilename);
        
        // 处理冲突策略
        const conflictResult = await handleConflictStrategy(conflictStrategy, remotePath, filename);
        
        if (conflictResult.action === 'skip') {
          results.skipped++;
          results.details.push({
            filename,
            status: 'skipped',
            message: conflictResult.message,
            remotePath: conflictResult.finalPath
          });
          console.log(`文件跳过: ${filename} - ${conflictResult.message}`);
          continue;
        }
        
        // 上传文件到SFTP
        const localPath = path.join(fileResult.fullDir, filename);
        const uploadResult = await uploadFileToSFTP(localPath, conflictResult.finalPath);
        
        if (uploadResult.success) {
          results.synced++;
          results.details.push({
            filename,
            status: 'synced',
            message: uploadResult.message,
            remotePath: conflictResult.finalPath
          });
          console.log(`文件上传成功: ${filename} -> ${conflictResult.finalPath}`);
          
          // 为每个成功同步的文件插入一条记录
          const localPath = path.join(fileResult.fullDir, filename);
          const stats = fs.statSync(localPath);
          
          const fileRecord = new AdhocFileSync({
            ruleId: rule._id,
            ruleName: rule.description || rule.name || '未命名规则',
            module: rule.module || 'unknown',
            filename: filename,
            localPath: localPath,
            remotePath: conflictResult.finalPath,
            fileSize: stats.size,
            syncDate: parseDateString(date),
            syncTime: new Date(),
            status: 'synced',
            message: uploadResult.message
          });
          
          await fileRecord.save();
          console.log(`文件同步记录已保存: ${filename}`);
          
        } else {
          results.failed++;
          results.details.push({
            filename,
            status: 'failed',
            message: uploadResult.message,
            remotePath: conflictResult.finalPath
          });
          console.error(`文件上传失败: ${filename} - ${uploadResult.message}`);
        }
        
      } catch (error) {
        console.error(`处理文件 ${filename} 异常:`, error);
        results.failed++;
        results.details.push({
          filename,
          status: 'error',
          message: error.message
        });
      }
    }

    // 5. 设置状态
    results.status = results.failed > 0 ? 'partial' : (results.synced > 0 ? 'success' : 'no_files');
    
    console.log(`非固定同步完成: 成功=${results.synced}, 跳过=${results.skipped}, 失败=${results.failed}`);
    
    return { 
      success: true, 
      message: `非固定同步完成`, 
      data: results
    };
    
  } catch (error) {
    console.error(`非固定同步失败:`, error);
    results.status = 'failed';
    results.details.push({
      error: error.message,
      status: 'error'
    });
    
    return { 
      success: false, 
      message: error.message, 
      data: results 
    };
  }
}

async function syncByMapping(dateStr) {
  const startTime = new Date();
  const results = { totalRules: 0, totalFiles: 0, synced: 0, skipped: 0, failed: 0, details: [] };

  const rules = await FileMappingRule.find({ enabled: true }).sort({ priority: -1 });
  results.totalRules = rules.length;
  
  for (const rule of rules) {
    try {
      const period = rule.schedule?.period || 'adhoc';
      let ruleResult;
      
      switch (period) {
        case 'daily':
          ruleResult = await processDailySync(rule, dateStr);
          break;

        case 'weekly':
          ruleResult = await processWeeklySync(rule, dateStr);
          break;

        case 'monthly':
          ruleResult = await processMonthlySync(rule, dateStr);
          break;

        case 'adhoc':
        default:
          ruleResult = await processAdhocSync(rule, dateStr);
          break;
      }
      
      // 累加规则结果到总结果中
      if (ruleResult && ruleResult.success && ruleResult.data) {
        results.totalFiles += ruleResult.data.totalFiles || 0;
        results.synced += ruleResult.data.synced || 0;
        results.skipped += ruleResult.data.skipped || 0;
        results.failed += ruleResult.data.failed || 0;
        
        // 添加规则详情
        results.details.push({
          ruleId: rule._id,
          ruleName: rule.description || rule.name || '未命名规则',
          module: rule.module || 'unknown',
          periodType: period,
          status: ruleResult.data.status || 'unknown',
          totalFiles: ruleResult.data.totalFiles || 0,
          syncedFiles: ruleResult.data.synced || 0,
          skippedFiles: ruleResult.data.skipped || 0,
          failedFiles: ruleResult.data.failed || 0,
          message: ruleResult.message || ''
        });
      } else {
        // 处理跳过的情况（如周几不匹配）
        results.details.push({
          ruleId: rule._id,
          ruleName: rule.description || rule.name || '未命名规则',
          module: rule.module || 'unknown',
          periodType: period,
          status: 'skipped',
          totalFiles: 0,
          syncedFiles: 0,
          skippedFiles: 0,
          failedFiles: 0,
          message: ruleResult?.message || '规则跳过'
        });
      }
      
    } catch (e) {
      console.error(`处理规则失败: ${rule._id}`, e);
      results.details.push({ 
        ruleId: rule._id, 
        ruleName: rule.description || rule.name || '未命名规则',
        module: rule.module || 'unknown',
        periodType: rule.schedule?.period || 'adhoc',
        status: 'error', 
        message: e.message,
        totalFiles: 0,
        syncedFiles: 0,
        skippedFiles: 0,
        failedFiles: 0
      });
    }
  }
  
  // 记录同步会话
  const sessionResult = await recordSyncSession(dateStr, startTime, results);
  
  console.log(`同步完成统计: 总规则=${results.totalRules}, 总文件=${results.totalFiles}, 成功=${results.synced}, 跳过=${results.skipped}, 失败=${results.failed}`);
  return { 
    success: true, 
    data: results,
    sessionId: sessionResult.sessionId
  };
}

module.exports = { syncByMapping };


