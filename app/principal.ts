import { app, BrowserWindow, shell, ipcMain, Menu } from 'electron'
import path from 'path'

let ventanaPrincipal: BrowserWindow | null = null

/**
 * Crea la ventana principal de Electron
 */
const crearVentana = () => {
  const rutaIcono = path.join(__dirname, '..', '..', 'client', 'public', 'logodelgado.png')
  
  ventanaPrincipal = new BrowserWindow({
    width: 1200,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    icon: rutaIcono,
    webPreferences: {
      preload: path.join(__dirname, 'carga-previa.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      devTools: !app.isPackaged
    }
  })

  // En desarrollo, cargar desde localhost; en producción, desde archivo
  const urlCarga = app.isPackaged
    ? `file://${path.join(__dirname, '..', '..', 'client', '.next')}`
    : 'http://localhost:3000'

  ventanaPrincipal.loadURL(urlCarga)

  // Abrir DevTools en desarrollo
  if (!app.isPackaged) {
    ventanaPrincipal.webContents.openDevTools()
  }

  // Manejar apertura de enlaces externos
  ventanaPrincipal.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  ventanaPrincipal.on('closed', () => {
    ventanaPrincipal = null
  })
}

/**
 * Inicializa la aplicación
 */
app.whenReady().then(async () => {
  try {
    console.log('🚀 Iniciando ventana CRM Delgado...')

    // Crear ventana (el servidor ya está corriendo por iniciar.js)
    crearVentana()

    // Configurar permisos de micrófono
    app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required')

    // Crear menú
    crearMenu()

    console.log('✅ Ventana lista')

  } catch (error) {
    console.error('❌ Error al iniciar la aplicación:', error)
    app.quit()
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      crearVentana()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', async () => {
  console.log('👋 Cerrando aplicación...')
})

/**
 * Crea el menú de la aplicación
 */
const crearMenu = () => {
  const plantilla: any[] = [
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Salir',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'Ver',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' }
      ]
    },
    {
      label: 'Ayuda',
      submenu: [
        {
          label: 'Acerca de CRM Delgado',
          click: () => {
            if (ventanaPrincipal) {
              ventanaPrincipal.webContents.send('mostrarAcercaDe')
            }
          }
        }
      ]
    }
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(plantilla))
}

// IPC: Generar PDF
ipcMain.handle('generarPdf', async (_event, { html }) => {
  const ventanaOculta = new BrowserWindow({
    show: false,
    webPreferences: { offscreen: true }
  })

  try {
    await ventanaOculta.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))
    const bufferPdf = await ventanaOculta.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4'
    })
    return bufferPdf.toString('base64')
  } finally {
    ventanaOculta.destroy()
  }
})

// IPC: Obtener recurso público como Data URL
ipcMain.handle('obtenerRecursoPublico', async (_event, rutaRelativa) => {
  try {
    if (typeof rutaRelativa !== 'string') return ''

    const rutaSegura = rutaRelativa.replace(/\\/g, '/').replace(/^\//, '')
    const rutaAbsoluta = path.join(__dirname, '..', '..', 'client', 'public', rutaSegura)
    const extension = path.extname(rutaAbsoluta).toLowerCase()

    const tiposMime: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    }

    const tipoMime = tiposMime[extension] || 'application/octet-stream'
    const buffer = await import('fs').then(fs => fs.promises.readFile(rutaAbsoluta))
    const base64 = buffer.toString('base64')

    return `data:${tipoMime};base64,${base64}`
  } catch (error) {
    console.error('Error al obtener recurso:', error)
    return ''
  }
})
