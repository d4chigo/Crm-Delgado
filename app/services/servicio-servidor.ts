import { spawn, ChildProcess } from 'child_process'
import path from 'path'
import axios from 'axios'

const PUERTO_SERVIDOR = 5000
const URL_SALUD = `http://localhost:${PUERTO_SERVIDOR}/api/salud`
const INTENTOS_MAXIMOS = 30
const INTERVALO_INTENTO = 1000 // ms

/**
 * Inicia el servidor backend en un proceso separado
 */
export const iniciarServidor = async (): Promise<ChildProcess> => {
  return new Promise((resolutor, rechazador) => {
    try {
      const rutaServidor = path.join(__dirname, '..', '..', '..', 'server')

      console.log(`Iniciando servidor en ${rutaServidor}...`)

      const proceso = spawn('npm', ['run', 'dev'], {
        cwd: rutaServidor,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
          ...process.env,
          NODE_ENV: 'production',
          PORT: PUERTO_SERVIDOR.toString(),
          CORS_ORIGIN: 'http://localhost:3000'
        }
      })

      // Capturar salida del servidor
      proceso.stdout?.on('data', (datos) => {
        console.log(`[Servidor] ${datos.toString().trim()}`)
      })

      proceso.stderr?.on('data', (datos) => {
        console.warn(`[Servidor Error] ${datos.toString().trim()}`)
      })

      proceso.on('error', (error) => {
        console.error('Error al iniciar servidor:', error)
        rechazador(error)
      })

      // Esperar a que el servidor esté listo
      esperarServidorListo(INTENTOS_MAXIMOS)
        .then(() => {
          console.log(`✅ Servidor listo en puerto ${PUERTO_SERVIDOR}`)
          resolutor(proceso)
        })
        .catch((error) => {
          proceso.kill()
          rechazador(error)
        })

    } catch (error) {
      console.error('Error al crear proceso del servidor:', error)
      rechazador(error)
    }
  })
}

/**
 * Espera a que el servidor esté listo haciendo health checks
 */
const esperarServidorListo = async (intentosRestantes: number): Promise<void> => {
  if (intentosRestantes <= 0) {
    throw new Error('El servidor no respondió después de múltiples intentos')
  }

  try {
    const respuesta = await axios.get(URL_SALUD, { timeout: 5000 })
    if (respuesta.status === 200) {
      return
    }
  } catch (error) {
    // Continuar intentando
  }

  // Esperar antes de reintentar
  await new Promise(resolutor => setTimeout(resolutor, INTERVALO_INTENTO))
  return esperarServidorListo(intentosRestantes - 1)
}

/**
 * Detiene el servidor backend
 */
export const detenerServidor = async (proceso: ChildProcess): Promise<void> => {
  return new Promise((resolutor) => {
    if (!proceso) {
      resolutor()
      return
    }

    console.log('Deteniendo servidor...')

    const tiempoEspera = setTimeout(() => {
      console.warn('Forzando cierre del servidor...')
      proceso.kill('SIGKILL')
      resolutor()
    }, 5000)

    proceso.on('exit', () => {
      clearTimeout(tiempoEspera)
      console.log('✅ Servidor detenido')
      resolutor()
    })

    proceso.kill('SIGTERM')
  })
}

/**
 * Verifica si el servidor está activo
 */
export const verificarServidorActivo = async (): Promise<boolean> => {
  try {
    const respuesta = await axios.get(URL_SALUD, { timeout: 5000 })
    return respuesta.status === 200
  } catch (error) {
    return false
  }
}
