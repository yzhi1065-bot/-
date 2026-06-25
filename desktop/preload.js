/**
 * Preload 脚本 - 安全暴露API到渲染进程
 */

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  connectDevice: (deviceType, port) =>
    ipcRenderer.invoke('connect-device', { deviceType, port }),

  getDevices: () =>
    ipcRenderer.invoke('get-devices'),

  saveCollectionData: (data) =>
    ipcRenderer.invoke('save-collection-data', data),

  getCachedData: () =>
    ipcRenderer.invoke('get-cached-data'),

  onDeviceData: (callback) =>
    ipcRenderer.on('device-data', (event, data) => callback(data)),

  showNotification: (title, body) =>
    new Notification(title, { body }),
})
