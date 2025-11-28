import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { obtenerUsuario, obtenerToken } from '@/lib/autenticacion';

/**
 * Hook para proteger rutas que requieren autenticación
 * Redirige a login si no hay token o usuario
 */
export function useProtectedRoute() {
  const router = useRouter();

  useEffect(() => {
    const token = obtenerToken();
    const usuario = obtenerUsuario();

    // Si no hay token o usuario, redirigir al login
    if (!token || !usuario) {
      router.push('/login');
    }
  }, [router]);
}
