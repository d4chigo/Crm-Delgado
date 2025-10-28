'use client';

import { useRouter } from 'next/navigation';
import { toast } from './use-toast';

/**
 * Hook para manejar el token de autenticación
 * Proporciona funciones para obtener el token y manejar sesiones expiradas
 */
export function useAuthToken() {
  const router = useRouter();

  /**
   * Obtiene el token del localStorage
   * Si no existe, redirige al login
   */
  const getToken = (): string | null => {
    const token = localStorage.getItem('crm_token');
    
    if (!token) {
      toast({
        title: 'No autenticado',
        description: 'Por favor inicia sesión para continuar',
        variant: 'destructive',
      });
      router.push('/login');
      return null;
    }
    
    return token;
  };

  /**
   * Maneja respuestas de API que indican token expirado (401)
   * Limpia el localStorage y redirige al login
   */
  const handleUnauthorized = (mensaje?: string) => {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    
    toast({
      title: 'Sesión expirada',
      description: mensaje || 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
      variant: 'destructive',
    });
    
    router.push('/login');
  };

  /**
   * Verifica el status de una respuesta fetch y maneja 401
   * Retorna true si la respuesta es válida, false si hubo error 401
   */
  const checkResponseAuth = (response: Response): boolean => {
    if (response.status === 401) {
      handleUnauthorized();
      return false;
    }
    return true;
  };

  return {
    getToken,
    handleUnauthorized,
    checkResponseAuth,
  };
}
