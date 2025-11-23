// Configuración base de la API
const API_URL = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) || 'http://localhost:5000/api';

// Tipos de respuesta del backend
interface RespuestaExito<T> {
  exito: true;
  datos: T;
  mensaje?: string;
}

interface RespuestaError {
  exito: false;
  error: string;
  detalles?: any;
  codigo?: string;
}

type RespuestaAPI<T> = RespuestaExito<T> | RespuestaError;

// Función para cerrar sesión y redirigir al login
function cerrarSesionYRedirigir() {
  if (typeof window !== 'undefined') {
    // Limpiar localStorage
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    
    // Redirigir al login
    window.location.href = '/login';
  }
}

// Función helper para hacer requests
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('crm_token') : null;
  
  try {
    const response = await fetch(url, {
      ...options,
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options?.headers,
      },
    });

    // Si el token es inválido o expiró (401 Unauthorized)
    if (response.status === 401) {
      cerrarSesionYRedirigir();
      throw new Error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
    }

    // Si no hay respuesta o el servidor no responde
    if (!response.ok && response.status >= 500) {
      console.error(`[API] Error 500 en ${endpoint}`);
      throw new Error('Error del servidor. Intenta de nuevo más tarde.');
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const errorText = await response.text();
      console.error(`[API] Respuesta no JSON en ${endpoint}:`, errorText);
      throw new Error(errorText || 'Respuesta inesperada del servidor');
    }

    const data: RespuestaAPI<T> = await response.json();

    if (!data.exito) {
      // Log de errores para debugging
      console.error(`[API] Error en ${endpoint}:`, data.error, data.detalles);
      
      // Mensajes de error mejorados según el código
      if (data.codigo === 'CREDENCIALES_INVALIDAS') {
        throw new Error('Email o contraseña incorrectos');
      }
      if (data.codigo === 'VALIDACION_ERROR') {
        throw new Error('Por favor verifica que el email sea válido');
      }
      if (data.codigo === 'EMAIL_DUPLICADO') {
        throw new Error('Este email ya está registrado');
      }
      if (data.codigo === 'TOKEN_INVALIDO' || data.codigo === 'TOKEN_EXPIRADO') {
        cerrarSesionYRedirigir();
        throw new Error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
      }
      
      // Si hay detalles del error, incluirlos
      const mensajeError = data.detalles ? `${data.error}: ${data.detalles}` : data.error;
      throw new Error(mensajeError || 'Error en la petición');
    }

    return data.datos;
  } catch (error: any) {
    // Si es un error de red o el servidor no está disponible
    if (error.message === 'Failed to fetch' || error instanceof TypeError) {
      throw new Error('No se puede conectar con el servidor. Verifica que esté corriendo.');
    }
    
    // Re-lanzar el error si ya tiene mensaje personalizado
    throw error;
  }
}

export { API_URL, fetchAPI };
export type { RespuestaExito, RespuestaError, RespuestaAPI };