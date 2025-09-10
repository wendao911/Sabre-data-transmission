const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
// Helpers
function walkDir(dir, filterFn) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results.push(...walkDir(filePath, filterFn));
    } else {
      if (!filterFn || filterFn(file, filePath, stat)) results.push({ file, filePath, stat });
    }
  }
  return results;
}

function paginate(arr, page, pageSize) {
  const total = arr.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return { total, items: arr.slice(start, end) };
}

// GET /api/files/encrypted - list source files (include .gpg and non-.gpg) with search + pagination
router.get('/encrypted', (req, res) => {
  try {
    const projectRoot = path.join(__dirname, '..', '..', '..');
    const encDir = path.join(projectRoot, 'Sabre Data Encryption');
    const search = (req.query.search || '').toLowerCase();
    const page = parseInt(req.query.page || '1');
    const pageSize = parseInt(req.query.pageSize || '20');

    const datePattern = /(\d{8})/;
    const all = walkDir(encDir)
      .filter(({ file }) => datePattern.test(file))
      .map(({ file, filePath, stat }) => ({
        filename: file,
        path: filePath,
        size: stat.size,
        mtime: stat.mtimeMs,
        isGpg: file.endsWith('.gpg')
      }))
      .filter(f => (search ? f.filename.toLowerCase().includes(search) : true))
      .sort((a, b) => a.filename.localeCompare(b.filename));

    const { total, items } = paginate(all, page, pageSize);
    res.json({ success: true, data: { total, page, pageSize, items } });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/files/encrypted-groups - list YYYYMMDD groups from source filenames
router.get('/encrypted-groups', (req, res) => {
  try {
    const projectRoot = path.join(__dirname, '..', '..', '..');
    const encDir = path.join(projectRoot, 'Sabre Data Encryption');
    const page = parseInt(req.query.page || '1');
    const pageSize = parseInt(req.query.pageSize || '20');

    const datePattern = /(\d{8})/;
    const all = walkDir(encDir)
      .filter(({ file }) => datePattern.test(file))
      .map(({ file }) => {
        const m = file.match(datePattern);
        return m ? m[1] : null;
      })
      .filter(Boolean);

    // unique & count
    const map = new Map();
    for (const d of all) {
      map.set(d, (map.get(d) || 0) + 1);
    }
    let groups = Array.from(map.entries()).map(([date, count]) => ({ date, count }));
    // 按日期倒序
    groups.sort((a, b) => b.date.localeCompare(a.date));

    const { total, items } = paginate(groups, page, pageSize);
    res.json({ success: true, data: { total, page, pageSize, items } });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/files/encrypted-by-date?date=YYYYMMDD - list source files for a specific date
router.get('/encrypted-by-date', (req, res) => {
  try {
    const projectRoot = path.join(__dirname, '..', '..', '..');
    const encDir = path.join(projectRoot, 'Sabre Data Encryption');
    const date = req.query.date || '';
    const search = (req.query.search || '').toLowerCase();
    const page = parseInt(req.query.page || '1');
    const pageSize = parseInt(req.query.pageSize || '20');

    if (!/^[0-9]{8}$/.test(date)) {
      return res.status(400).json({ success: false, error: 'Invalid date' });
    }

    const datePattern = /(\d{8})/;
    const all = walkDir(encDir)
      .filter(({ file }) => {
        const m = file.match(datePattern);
        return m && m[1] === date;
      })
      .map(({ file, filePath, stat }) => ({ filename: file, path: filePath, size: stat.size, mtime: stat.mtimeMs, isGpg: file.endsWith('.gpg') }))
      .filter(f => (search ? f.filename.toLowerCase().includes(search) : true))
      .sort((a, b) => b.filename.localeCompare(a.filename));

    const { total, items } = paginate(all, page, pageSize);
    res.json({ success: true, data: { total, page, pageSize, date, items } });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/files/decrypted-dirs - list subdirectories under Decryption with search + pagination
router.get('/decrypted-dirs', (req, res) => {
  try {
    const projectRoot = path.join(__dirname, '..', '..', '..');
    const decRoot = path.join(projectRoot, 'Sabre Data Decryption');
    const search = (req.query.search || '').toLowerCase();
    const page = parseInt(req.query.page || '1');
    const pageSize = parseInt(req.query.pageSize || '20');

    if (!fs.existsSync(decRoot)) return res.json({ success: true, data: { total: 0, page, pageSize, items: [] } });

    const dirs = fs.readdirSync(decRoot)
      .filter(name => fs.statSync(path.join(decRoot, name)).isDirectory())
      .filter(name => (search ? name.toLowerCase().includes(search) : true))
      .sort()
      .reverse();

    const { total, items } = paginate(dirs, page, pageSize);
    const detailed = items.map(name => {
      const d = path.join(decRoot, name);
      const files = fs.readdirSync(d).filter(f => fs.statSync(path.join(d, f)).isFile());
      return { dirname: name, count: files.length };
    });
    res.json({ success: true, data: { total, page, pageSize, items: detailed } });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/files/decrypted - list files within a decrypted dir with search + pagination
router.get('/decrypted', (req, res) => {
  try {
    const projectRoot = path.join(__dirname, '..', '..', '..');
    const decRoot = path.join(projectRoot, 'Sabre Data Decryption');
    const dir = req.query.dir || '';
    const search = (req.query.search || '').toLowerCase();
    const page = parseInt(req.query.page || '1');
    const pageSize = parseInt(req.query.pageSize || '50');

    const target = path.join(decRoot, dir);
    if (!dir || !fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
      return res.status(400).json({ success: false, error: 'Invalid dir' });
    }

    const all = fs.readdirSync(target)
      .filter(name => fs.statSync(path.join(target, name)).isFile())
      .filter(name => (search ? name.toLowerCase().includes(search) : true))
      .sort()
      .reverse();

    const { total, items } = paginate(all, page, pageSize);
    const detailed = items.map(name => {
      const fp = path.join(target, name);
      const stat = fs.statSync(fp);
      return { filename: name, size: stat.size, mtime: stat.mtimeMs };
    });
    res.json({ success: true, data: { total, page, pageSize, dir, items: detailed } });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
