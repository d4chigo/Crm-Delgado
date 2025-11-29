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
function cerrarSesionYRedirigir(razon?: string) {
  if (typeof window !== 'undefined') {
    console.warn('[API] Cerrando sesión:', razon || 'Sin especificar');
    // Limpiar localStorage
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    
    // Esperar un poco antes de redirigir para que se vea el error en consola
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  }
}

// Función helper para hacer requests
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('crm_token') : null;
  
  // Debug: mostrar si hay token
  console.log(`[fetchAPI] Endpoint: ${endpoint}`);
  console.log(`[fetchAPI] Token presente: ${token ? 'Sí' : 'No'}`);
  if (token) {
    console.log(`[fetchAPI] Token: ${token.substring(0, 30)}...`);
  } else {
    console.warn(`[fetchAPI] ⚠️ Sin token para ${endpoint}`);
  }
  
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
      console.error(`[API] 401 Unauthorized en ${endpoint}`);
      // Solo redirigir si el token existe pero es inválido
      // Si no hay token, dejar que el componente lo maneje
      if (token) {
        cerrarSesionYRedirigir(`401 Unauthorized en ${endpoint}`);
        throw new Error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
      } else {
        console.warn(`[API] Sin token para ${endpoint}, esperando token...`);
        throw new Error('Sin token de autenticación');
      }
    }

    // Si no hay respuesta o el servidor no responde
    if (!response.ok && response.status >= 500) {
      console.error(`[API] Error ${response.status} en ${endpoint}`);
      throw new Error(`Error del servidor (${response.status}). Intenta de nuevo más tarde.`);
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
        cerrarSesionYRedirigir(`${data.codigo} en ${endpoint}`);
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