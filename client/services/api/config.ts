// Configuración base de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

// Función helper para hacer requests
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    // Si no hay respuesta o el servidor no responde
    if (!response.ok && response.status >= 500) {
      throw new Error('Error del servidor. Intenta de nuevo más tarde.');
    }

    const data: RespuestaAPI<T> = await response.json();

    if (!data.exito) {
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
      
      throw new Error(data.error || 'Error en la petición');
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
