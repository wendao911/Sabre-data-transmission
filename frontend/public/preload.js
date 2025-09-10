const { contextBridge, ipcRenderer } = require('electron');

// 暴露受保护的API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 文件操作
  selectFile: () => ipcRenderer.invoke('select-file'),
  saveFile: (data, filename) => ipcRenderer.invoke('save-file', data, filename),
  
  // 窗口控制
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  
  // 菜单事件
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-action', (event, action) => callback(event, action));
  },
  
  // 系统信息
  getVersion: () => ipcRenderer.invoke('get-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  
  // 清理监听器
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});
