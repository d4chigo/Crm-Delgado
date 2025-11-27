import { contextBridge, shell, ipcRenderer } from 'electron'

/**
 * API segura expuesta al proceso de renderizado
 */
contextBridge.exposeInMainWorld('electron', {
  shell: {
    /**
     * Abre una URL en el navegador predeterminado del sistema
     */
    abrirExterno: (url: string): Promise<void> => {
      try {
        return shell.openExternal(url)
      } catch (error) {
        console.error('Error al abrir URL externa:', error)
        return Promise.resolve()
      }
    }
  },

  pdf: {
    /**
     * Genera un PDF a partir de HTML y retorna como base64
     */
    generar: async (html: string): Promise<string> => {
      try {
        const base64 = await ipcRenderer.invoke('generarPdf', { html })
        return base64
      } catch (error) {
        console.error('Error al generar PDF:', error)
        throw error
      }
    }
  },

  recursos: {
    /**
     * Obtiene un recurso público como Data URL
     */
    obtenerDataUrl: async (rutaRelativa: string): Promise<string> => {
      try {
        return await ipcRenderer.invoke('obtenerRecursoPublico', rutaRelativa)
      } catch (error) {
        console.error('Error al obtener recurso:', error)
        return ''
      }
    }
  },

  app: {
    /**
     * Obtiene información de la aplicación
     */
    obtenerInfo: async (): Promise<{ version: string; plataforma: string }> => {
      return {
        version: '1.0.0',
        plataforma: process.platform
      }
    }
  }
})

/**
 * Escuchar eventos del proceso principal
 */
ipcRenderer.on('mostrarAcercaDe', () => {
  console.log('Mostrar diálogo "Acerca de"')
})
