const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();
const { walkDir, paginate } = require('../services/fileService');
const config = require('../../../config');






// 文件浏览器 API - 层级浏览目录
router.get('/browser', (req, res) => {
  try {
    const rootPath = config.fileBrowser?.rootPath || process.cwd();
    const currentPath = req.query.path || '';
    const search = (req.query.search || '').toLowerCase();
    const page = parseInt(req.query.page || '1');
    const pageSize = parseInt(req.query.pageSize || '50');
    const sortBy = req.query.sortBy || 'name';
    const sortOrder = req.query.sortOrder || 'asc';
    const showHidden = req.query.showHidden === 'true';

    // 构建当前浏览路径
    const fullCurrentPath = path.resolve(rootPath, currentPath);
    
    // 安全检查：确保路径在根目录内
    if (!fullCurrentPath.startsWith(path.resolve(rootPath))) {
      return res.status(403).json({ 
        success: false, 
        error: '访问路径超出允许范围' 
      });
    }
    
    if (!fs.existsSync(fullCurrentPath)) {
      return res.status(404).json({ 
        success: false, 
        error: `目录不存在: ${fullCurrentPath}` 
      });
    }

    if (!fs.statSync(fullCurrentPath).isDirectory()) {
      return res.status(400).json({ 
        success: false, 
        error: '路径不是目录' 
      });
    }

    // 读取当前目录内容
    const items = fs.readdirSync(fullCurrentPath)
      .map(name => {
        const itemPath = path.join(fullCurrentPath, name);
        const stat = fs.statSync(itemPath);
        const relativePath = path.relative(rootPath, itemPath);
        
        return {
          name: name,
          path: relativePath,
          fullPath: itemPath,
          size: stat.size,
          mtime: stat.mtimeMs,
          isDirectory: stat.isDirectory(),
          isFile: stat.isFile(),
          extension: path.extname(name).toLowerCase()
        };
      })
      .filter(item => {
        // 过滤隐藏文件
        if (!showHidden && item.name.startsWith('.')) {
          return false;
        }
        // 搜索过滤
        if (search && !item.name.toLowerCase().includes(search)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        // 目录优先
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        
        // 按指定字段排序
        let aVal, bVal;
        switch (sortBy) {
          case 'size':
            aVal = a.size;
            bVal = b.size;
            break;
          case 'date':
            aVal = a.mtime;
            bVal = b.mtime;
            break;
          case 'type':
            // 目录优先逻辑已在上方处理，这里将目录视为 0，文件为 1
            aVal = a.isDirectory ? 0 : 1;
            bVal = b.isDirectory ? 0 : 1;
            break;
          case 'name':
          default:
            aVal = a.name.toLowerCase();
            bVal = b.name.toLowerCase();
            break;
        }
        
        if (sortOrder === 'desc') {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        } else {
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        }
      });

    const { total, items: paginatedItems } = paginate(items, page, pageSize);
    
    res.json({ 
      success: true, 
      data: { 
        total, 
        page, 
        pageSize, 
        items: paginatedItems,
        currentPath: currentPath,
        rootPath: rootPath,
        parentPath: currentPath ? path.dirname(currentPath) : null,
        config: {
          sortBy,
          sortOrder,
          showHidden
        }
      } 
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 创建目录 API
router.post('/create-directory', (req, res) => {
  try {
    const rootPath = config.fileBrowser?.rootPath || process.cwd();
    const { currentPath, directoryName } = req.body;
    
    if (!directoryName || !directoryName.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: '目录名称不能为空' 
      });
    }
    
    // 构建完整路径
    const fullCurrentPath = path.resolve(rootPath, currentPath || '');
    const newDirectoryPath = path.join(fullCurrentPath, directoryName.trim());
    
    // 安全检查：确保路径在根目录内
    if (!newDirectoryPath.startsWith(path.resolve(rootPath))) {
      return res.status(403).json({ 
        success: false, 
        error: '访问路径超出允许范围' 
      });
    }
    
    // 检查目录是否已存在
    if (fs.existsSync(newDirectoryPath)) {
      return res.status(400).json({ 
        success: false, 
        error: '目录已存在' 
      });
    }
    
    // 创建目录
    fs.mkdirSync(newDirectoryPath, { recursive: true });
    
    res.json({ 
      success: true, 
      message: '目录创建成功',
      data: {
        name: directoryName.trim(),
        path: path.relative(rootPath, newDirectoryPath),
        fullPath: newDirectoryPath
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 上传文件 API
// 使用内存存储，落盘时自行决定目标路径与文件名
const upload = multer({ storage: multer.memoryStorage() });
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    const rootPath = config.fileBrowser?.rootPath || process.cwd();
    const { targetPath = '', baseName } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: '未选择文件' });
    }

    if (!baseName || !baseName.trim()) {
      return res.status(400).json({ success: false, error: '文件名不能为空' });
    }

    // 以源文件扩展名为准
    const sourceExt = path.extname(file.originalname);
    const finalName = `${baseName.trim()}${sourceExt}`;

    // 计算落盘目录
    const fullTargetDir = path.resolve(rootPath, targetPath);
    if (!fullTargetDir.startsWith(path.resolve(rootPath))) {
      return res.status(403).json({ success: false, error: '访问路径超出允许范围' });
    }
    if (!fs.existsSync(fullTargetDir)) {
      return res.status(404).json({ success: false, error: `目标目录不存在: ${fullTargetDir}` });
    }
    if (!fs.statSync(fullTargetDir).isDirectory()) {
      return res.status(400).json({ success: false, error: '目标路径不是目录' });
    }

    const fullTargetPath = path.join(fullTargetDir, finalName);

    // 写入文件
    fs.writeFileSync(fullTargetPath, file.buffer);

    return res.json({
      success: true,
      message: '上传成功',
      data: {
        name: finalName,
        path: path.relative(rootPath, fullTargetPath),
        fullPath: fullTargetPath,
        size: file.size,
        mimetype: file.mimetype
      }
    });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// 下载文件 API
router.get('/download', (req, res) => {
  try {
    const rootPath = config.fileBrowser?.rootPath || process.cwd();
    const { path: filePath } = req.query;
    
    if (!filePath) {
      return res.status(400).json({ success: false, error: '文件路径不能为空' });
    }
    
    const fullFilePath = path.resolve(rootPath, filePath);
    
    // 安全检查：确保路径在根目录内
    if (!fullFilePath.startsWith(path.resolve(rootPath))) {
      return res.status(403).json({ success: false, error: '访问路径超出允许范围' });
    }
    
    if (!fs.existsSync(fullFilePath)) {
      return res.status(404).json({ success: false, error: '文件不存在' });
    }
    
    if (!fs.statSync(fullFilePath).isFile()) {
      return res.status(400).json({ success: false, error: '路径不是文件' });
    }
    
    const fileName = path.basename(fullFilePath);
    res.download(fullFilePath, fileName);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 删除文件 API
router.delete('/delete', (req, res) => {
  try {
    const rootPath = config.fileBrowser?.rootPath || process.cwd();
    const { path: filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ success: false, error: '文件路径不能为空' });
    }
    
    const fullFilePath = path.resolve(rootPath, filePath);
    
    // 安全检查：确保路径在根目录内
    if (!fullFilePath.startsWith(path.resolve(rootPath))) {
      return res.status(403).json({ success: false, error: '访问路径超出允许范围' });
    }
    
    if (!fs.existsSync(fullFilePath)) {
      return res.status(404).json({ success: false, error: '文件不存在' });
    }
    
    // 删除文件或目录
    if (fs.statSync(fullFilePath).isDirectory()) {
      fs.rmdirSync(fullFilePath, { recursive: true });
    } else {
      fs.unlinkSync(fullFilePath);
    }
    
    res.json({ success: true, message: '删除成功' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;


