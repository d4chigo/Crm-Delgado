import { useEffect, useState } from 'react'

/**
 * Hook que espera a que el token esté disponible en localStorage
 * Útil cuando el componente se monta antes de que el token se guarde
 */
export function useEsperarToken(maxIntentos: number = 100) {
  const [tokenDisponible, setTokenDisponible] = useState(false)
  const [intentos, setIntentos] = useState(0)

  useEffect(() => {
    const verificarToken = () => {
      const token = localStorage.getItem('crm_token')
      
      // Solo log cada 5 intentos para no saturar la consola
      if ((intentos + 1) % 5 === 0 || token) {
        console.log(`[useEsperarToken] Intento ${intentos + 1}/${maxIntentos} - Token: ${token ? '✅ Encontrado' : '❌ No encontrado'}`)
      }
      
      if (token) {
        console.log('[useEsperarToken] ✅ Token encontrado, inicializando pipeline')
        setTokenDisponible(true)
        return
      }

      if (intentos < maxIntentos) {
        setIntentos(intentos + 1)
        // Esperar 100ms antes de reintentar (total: hasta 10 segundos)
        setTimeout(verificarToken, 100)
      } else {
        console.warn('[useEsperarToken] ⚠️ Token no encontrado después de 10 segundos')
        console.warn('[useEsperarToken] Posibles causas:')
        console.warn('  1. El login no se completó correctamente')
        console.warn('  2. El token no se guardó en localStorage')
        console.warn('  3. Hay un error en authService.login()')
        console.warn('[useEsperarToken] Redirigiendo al login...')
        // Redirigir al login después de esperar
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            window.location.href = '/login'
          }, 1000)
        }
        setTokenDisponible(false)
      }
    }

    verificarToken()
  }, [intentos, maxIntentos])

  return tokenDisponible
}
