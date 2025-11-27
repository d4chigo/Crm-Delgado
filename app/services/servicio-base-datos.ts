import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import { existsSync, mkdirSync } from 'fs'

const ejecutar = promisify(exec)

/**
 * Inicializa la base de datos ejecutando migraciones de Prisma
 */
export const inicializarBaseDatos = async () => {
  try {
    const rutaServidor = path.join(__dirname, '..', '..', '..', 'server')
    const rutaPrisma = path.join(rutaServidor, 'prisma')

    // Verificar que exista la carpeta de migraciones
    if (!existsSync(rutaPrisma)) {
      mkdirSync(rutaPrisma, { recursive: true })
    }

    console.log('Ejecutando migraciones de Prisma...')
    
    // Ejecutar migraciones
    const { stdout, stderr } = await ejecutar(
      'npx prisma migrate deploy',
      { cwd: rutaServidor, timeout: 60000 }
    )

    if (stdout) console.log('Migraciones:', stdout)
    if (stderr) console.warn('Advertencias:', stderr)

    console.log('✅ Migraciones completadas')

    // Ejecutar seed si es necesario
    if (process.env.ALLOW_DEV_SEED === 'true') {
      console.log('Ejecutando seed...')
      try {
        await ejecutar('npx prisma db seed', { cwd: rutaServidor, timeout: 30000 })
        console.log('✅ Seed completado')
      } catch (error) {
        console.warn('⚠️ Seed no disponible o ya ejecutado:', error)
      }
    }

  } catch (error) {
    console.error('❌ Error al inicializar base de datos:', error)
    throw error
  }
}

/**
 * Verifica la conexión a la base de datos
 */
export const verificarConexionBD = async (): Promise<boolean> => {
  try {
    const rutaServidor = path.join(__dirname, '..', '..', '..', 'server')
    
    const { stdout } = await ejecutar(
      'npx prisma db execute --stdin < /dev/null',
      { cwd: rutaServidor, timeout: 10000 }
    )

    return true
  } catch (error) {
    console.error('Error al verificar conexión:', error)
    return false
  }
}
