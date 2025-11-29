import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import authService from '@/services/api/auth.service'

/**
 * Hook para proteger rutas que requieren autenticación
 * Redirige al login si no hay token (desactivado temporalmente para debugging)
 */
export function useProteccionRuta() {
  const router = useRouter()

  useEffect(() => {
    const token = authService.obtenerToken()
    
    console.log('[Protección] Token presente:', token ? 'Sí' : 'No')
    
    // Desactivado temporalmente - el hook useEsperarToken se encarga
    // if (!token) {
    //   console.log('[Protección] Sin token, redirigiendo al login')
    //   router.push('/login')
    // }
  }, [router])
}

/**
 * Componente wrapper para proteger rutas
 */
export function ProtectorRuta({ children }: { children: React.ReactNode }) {
  useProteccionRuta()
  return children
}
