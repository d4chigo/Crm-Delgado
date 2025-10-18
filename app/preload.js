const { contextBridge, shell } = require('electron')

// Expose a minimal, safe API to the renderer process. This allows renderer
// code to call window.electron.shell.openExternal(url) to open links in the
// user's default browser without giving access to Node APIs.
contextBridge.exposeInMainWorld('electron', {
  shell: {
    openExternal: (url) => {
      try {
        return shell.openExternal(url)
      } catch (e) {
        // swallow errors to avoid breaking renderer
        console.error('Failed to open external URL:', e)
        return Promise.resolve(false)
      }
    }
  }
})

// Additionally, override window.open and intercept clicks on anchor tags
// that would open a new window. This prevents Electron from creating a
// BrowserWindow and instead opens the URL in the system default browser.
// We attach these safely once the DOM is ready in the renderer.
contextBridge.exposeInMainWorld('electronHelpers', {
  initExternalLinkHandling: () => {
    try {
      // Override window.open in the renderer to use shell.openExternal
      const originalOpen = window.open
      window.open = function (url, target, features) {
        // If target is not _self, open externally
        if (typeof url === 'string') {
          shell.openExternal(url).catch((e) => console.error('openExternal failed', e))
          return null
        }
        return originalOpen.apply(this, arguments)
      }

      // Delegate click handler for anchor elements to catch target=_blank
      document.addEventListener('click', (ev) => {
        try {
          const anchor = ev.target && (ev.target.closest ? ev.target.closest('a') : null)
          if (!anchor) return
          const href = anchor.getAttribute('href')
          const target = anchor.getAttribute('target')
          // If href starts with http(s) or mailto: and target is _blank or rel contains external, open externally
          if (href && /^(https?:|mailto:)/i.test(href)) {
            if (target === '_blank' || anchor.rel?.includes('external') || anchor.rel?.includes('noopener')) {
              ev.preventDefault()
              shell.openExternal(href).catch((e) => console.error('openExternal failed', e))
            }
          }
        } catch (e) {
          // ignore errors here to avoid breaking the page
          console.error('Error in external link handler', e)
        }
      }, { capture: true })
    } catch (e) {
      console.error('Failed to initialize external link handling in preload:', e)
    }
  }
})
