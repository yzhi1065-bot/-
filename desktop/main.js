/**
 * Electron 主进程 - 桌面采集客户端
 * 负责：设备连接管理、本地缓存、与后端API通信
 */

const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const axios = require('axios')

const API_BASE = 'http://localhost:8000/api'
let mainWindow = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    title: '中医智能诊断系统 - 采集端',
  })

  // 开发模式加载前端，生产模式加载打包文件
  if (process.argv.includes('--dev')) {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    // 生产模式：加载打包的前端资源
    const distPath = path.join(process.resourcesPath, 'frontend-dist', 'index.html')
    mainWindow.loadFile(distPath)
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// ========== IPC 处理 ==========

// 设备连接
ipcMain.handle('connect-device', async (event, { deviceType, port }) => {
  try {
    const res = await axios.post(`${API_BASE}/devices/register`, {
      name: `${deviceType}设备`,
      device_type: deviceType,
      serial_no: port || `local-${Date.now()}`,
    })
    return { success: true, data: res.data }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// 获取设备状态
ipcMain.handle('get-devices', async () => {
  try {
    const res = await axios.get(`${API_BASE}/devices`)
    return { success: true, data: res.data.data }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// 保存采集数据到本地
ipcMain.handle('save-collection-data', async (event, data) => {
  // 本地SQLite缓存实现
  const Database = require('sqlite3').verbose()
  const db = new Database.Database(path.join(app.getPath('userData'), 'tcm_cache.db'))

  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO collection_cache (session_id, data_type, data, created_at)
       VALUES (?, ?, ?, datetime('now'))`,
      [data.sessionId, data.dataType, JSON.stringify(data.payload)],
      (err) => {
        db.close()
        if (err) resolve({ success: false, error: err.message })
        else resolve({ success: true })
      }
    )
  })
})

// 获取离线缓存数据
ipcMain.handle('get-cached-data', async () => {
  const Database = require('sqlite3').verbose()
  const db = new Database.Database(path.join(app.getPath('userData'), 'tcm_cache.db'))

  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM collection_cache ORDER BY created_at', [], (err, rows) => {
      db.close()
      if (err) resolve([])
      else resolve(rows)
    })
  })
})
