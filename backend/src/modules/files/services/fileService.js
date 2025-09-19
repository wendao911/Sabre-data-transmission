const path = require('path');
const fs = require('fs');

function getProjectRoot() {
  return path.join(__dirname, '..', '..', '..');
}

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

module.exports = {
  getProjectRoot,
  walkDir,
  paginate
};


