const path = require('path');
const fs = require('fs');
const sftpService = require('./sftpService');
const FileMappingRule = require('../../fileMapping/models/FileMappingRule');
const SyncRecord = require('../../fileMapping/models/SyncRecord');
const config = require('../../../config');

function buildRegexFromPattern(pattern) {
  const esc = pattern.replace(/[.+^${}()|\[\]\\]/g, '\\$&');
  return new RegExp('^' + esc.replace(/\*/g, '.*').replace(/\?/g, '.') + '$', 'i');
}

function replaceDateVars(str, date) {
  if (!str) return str;
  return str
    .replace(/{Date:YYYY-MM-DD}/g, date)
    .replace(/{date}/g, date.replace(/-/g, ''));
}

function buildDestName(tpl, name) {
  const baseName = path.parse(name).name;
  const ext = path.parse(name).ext;
  const safeTpl = tpl || '{baseName}{ext}';
  return safeTpl.replace(/{baseName}/g, baseName).replace(/{ext}/g, ext);
}

async function syncByMapping(date) {
  const results = { totalRules: 0, totalFiles: 0, synced: 0, skipped: 0, failed: 0, details: [] };

  // 连接校验
  const ensure = await sftpService.ensureConnection();
  if (!ensure.success) return { success: false, message: ensure.message || 'SFTP未连接' };

  const rules = await FileMappingRule.find({ enabled: true }).sort({ priority: -1 });
  results.totalRules = rules.length;

  const d = new Date(date + 'T00:00:00');
  const weekday = d.getDay(); // 0-6
  const monthday = d.getDate(); // 1-31

  const rootPath = config.fileBrowser?.rootPath || process.cwd();

  for (const rule of rules) {
    try {
      const period = rule.schedule?.period || 'adhoc';
      if (period === 'weekly' && !(rule.schedule?.weekdays || []).includes(weekday)) {
        results.details.push({ ruleId: rule._id, status: 'skip', reason: 'weekly-not-match' });
        continue;
      }
      if (period === 'monthly' && !(rule.schedule?.monthDays || []).includes(monthday)) {
        results.details.push({ ruleId: rule._id, status: 'skip', reason: 'monthly-not-match' });
        continue;
      }

      const dir = replaceDateVars(rule.source?.directory || '', date);
      const pattern = rule.source?.pattern || '*';
      const fullDir = path.resolve(rootPath, dir.startsWith('/') ? dir.substring(1) : dir);
      if (!fs.existsSync(fullDir) || !fs.statSync(fullDir).isDirectory()) {
        results.details.push({ ruleId: rule._id, status: 'skip', reason: `dir-not-exist: ${fullDir}` });
        continue;
      }

      const regex = buildRegexFromPattern(pattern);
      const files = fs.readdirSync(fullDir).filter(n => regex.test(n));
      results.totalFiles += files.length;

      const destPathTpl = replaceDateVars(rule.destination?.path || '/', date).replace(/\\/g, '/');
      for (const name of files) {
        try {
          if (period === 'adhoc') {
            const exists = await SyncRecord.findOne({ ruleId: rule._id, filename: name });
            if (exists) { results.skipped++; results.details.push({ ruleId: rule._id, file: name, status: 'skip-adhoc-record' }); continue; }
          }

          const localAbs = path.join(fullDir, name);
          const remoteName = buildDestName(rule.destination?.filename, name);
          const remotePath = path.posix.join(destPathTpl, remoteName);

          const resp = await sftpService.uploadFile(localAbs, remotePath);
          if (!resp?.success) {
            results.failed++;
            results.details.push({ ruleId: rule._id, file: name, status: 'fail', reason: resp?.message });
            continue;
          }

          if (period === 'adhoc') {
            await SyncRecord.create({ ruleId: rule._id, filename: name, date });
          }
          results.synced++;
          results.details.push({ ruleId: rule._id, file: name, status: 'ok', remotePath });
        } catch (e) {
          results.failed++;
          results.details.push({ ruleId: rule._id, file: name, status: 'error', reason: e.message });
        }
      }
    } catch (e) {
      results.details.push({ ruleId: rule._id, status: 'error', reason: e.message });
    }
  }

  return { success: true, data: results };
}

module.exports = { syncByMapping };


