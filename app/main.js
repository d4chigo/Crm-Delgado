const { app, BrowserWindow, shell } = require('electron/main')
const path = require('node:path')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadURL('http://localhost:3000')
  // Ensure any attempts to open a new window (e.g. window.open or target="_blank")
  // are redirected to the user's default browser instead of creating a new
  // Electron BrowserWindow. This makes links (like WhatsApp) open externally.
  if (win && win.webContents && typeof win.webContents.setWindowOpenHandler === 'function') {
    win.webContents.setWindowOpenHandler(({ url }) => {
      // Open URL in the system's default browser
      shell.openExternal(url)
      // Prevent Electron from opening a new window
      return { action: 'deny' }
    })
  }
}

app.whenReady().then(() => {
  createWindow()

  // Global handler: whenever any webContents attempts to open a new window
  // or navigate to an external url, prefer opening in the external browser.
  const { webContents } = require('electron')
  webContents.on('new-window', (event, url) => {
    try {
      event.preventDefault()
      shell.openExternal(url)
    } catch (e) {
      console.error('Failed to open external url from new-window', e)
    }
  })

  webContents.on('will-navigate', (event, url) => {
    try {
      // If navigation is to an external origin, open externally
      const win = BrowserWindow.getFocusedWindow()
      if (!win) return
      const origin = new URL(win.webContents.getURL()).origin
      if (new URL(url).origin !== origin) {
        event.preventDefault()
        shell.openExternal(url)
      }
    } catch (e) {
      // ignore errors
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})