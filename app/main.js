const { app, BrowserWindow, shell, ipcMain } = require('electron/main')
const fs = require('node:fs')
const { session } = require('electron')
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
  // Allow autoplay without user gesture so TTS can play immediately
  try { app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required') } catch {}

  // Grant microphone permission inside Electron for getUserMedia
  try {
    const ses = session.defaultSession
    if (ses && typeof ses.setPermissionRequestHandler === 'function') {
      ses.setPermissionRequestHandler((webContents, permission, callback) => {
        if (permission === 'media' || permission === 'audioCapture' || permission === 'microphone') {
          return callback(true)
        }
        return callback(false)
      })
    }
    if (ses && typeof ses.setPermissionCheckHandler === 'function') {
      ses.setPermissionCheckHandler((_webContents, permission) => {
        if (permission === 'media' || permission === 'audioCapture' || permission === 'microphone') {
          return true
        }
        return false
      })
    }
  } catch (e) {
    // ignore
  }

  createWindow()

  app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, url) => {
      try {
        event.preventDefault()
        shell.openExternal(url)
      } catch (e) {
        console.error('Failed to open external url from new-window', e)
      }
    })

    contents.on('will-navigate', (event, url) => {
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
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  // IPC: Generate PDF from HTML and return base64 string
  try {
    ipcMain.handle('generate-pdf', async (_event, { html }) => {
      const win = new BrowserWindow({
        show: false,
        webPreferences: { offscreen: true }
      })
      try {
        await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))
        const pdfBuffer = await win.webContents.printToPDF({
          printBackground: true,
          pageSize: 'A4',
        })
        return pdfBuffer.toString('base64')
      } finally {
        try { win.destroy() } catch {}
      }
    })
  } catch (e) {
    // ignore
  }

  // IPC: Read public asset as data URL (only from client/public)
  try {
    ipcMain.handle('get-public-asset-dataurl', async (_event, relPath) => {
      try {
        if (typeof relPath !== 'string') return ''
        const safeRel = relPath.replace(/\\/g, '/').replace(/^\//, '')
        const abs = path.join(__dirname, '..', 'client', 'public', safeRel)
        const ext = path.extname(abs).toLowerCase()
        const mime = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.svg' ? 'image/svg+xml' : ''
        const buf = await fs.promises.readFile(abs)
        const base64 = buf.toString('base64')
        return mime ? `data:${mime};base64,${base64}` : `data:application/octet-stream;base64,${base64}`
      } catch (e) {
        return ''
      }
    })
  } catch {}
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})