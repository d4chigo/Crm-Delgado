import { fetchAPI } from './config';

// Tipos para autenticación
export interface LoginDTO {
  email: string;
  password: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  avatar?: string;
  telefono?: string;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

export interface RespuestaLogin {
  usuario: Usuario;
  token: {
    token: string;
    expiraEn: string;
  };
}

// Clave para localStorage
const TOKEN_KEY = 'crm_token';
const USER_KEY = 'crm_user';

class AuthService {
  /**
   * Iniciar sesión
   */
  async login(datos: LoginDTO): Promise<RespuestaLogin> {
    // Hacer petición directa sin usar fetchAPI para evitar loop
    const API_URL = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) || 'http://localhost:5000/api';
    const url = `${API_URL}/auth/login`;
    
    console.log('[AuthService.login] Iniciando petición a:', url);
    console.log('[AuthService.login] Datos enviados:', { email: datos.email });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datos),
    });

    console.log('[AuthService.login] Response status:', response.status);
    console.log('[AuthService.login] Response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[AuthService.login] ❌ Error en respuesta:', errorData);
      throw new Error(errorData.error || 'Error al iniciar sesión');
    }

    const data = await response.json();
    console.log('[AuthService.login] Respuesta recibida:', { exito: data.exito, tieneToken: !!data.datos?.token });
    
    const respuesta = data.datos as RespuestaLogin;

    console.log('[AuthService.login] Estructura respuesta:', {
      tieneToken: !!respuesta.token,
      tieneTokenToken: !!respuesta.token?.token,
      tieneUsuario: !!respuesta.usuario
    });

    // Guardar token y usuario en localStorage INMEDIATAMENTE
    if (typeof window !== 'undefined') {
      console.log('[AuthService.login] Guardando en localStorage...');
      console.log('[AuthService.login] Token a guardar:', respuesta.token.token.substring(0, 20) + '...');
      
      localStorage.setItem(TOKEN_KEY, respuesta.token.token);
      localStorage.setItem(USER_KEY, JSON.stringify(respuesta.usuario));
      
      const tokenGuardado = localStorage.getItem(TOKEN_KEY);
      const usuarioGuardado = localStorage.getItem(USER_KEY);
      
      console.log('[AuthService.login] ✅ Token guardado:', tokenGuardado?.substring(0, 20) + '...');
      console.log('[AuthService.login] ✅ Usuario guardado:', usuarioGuardado);
    }

    return respuesta;
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }

  /**
   * Obtener token guardado
   */
  obtenerToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  }

  /**
   * Obtener usuario guardado
   */
  obtenerUsuario(): Usuario | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  /**
   * Verificar si el usuario está autenticado
   */
  estaAutenticado(): boolean {
    return this.obtenerToken() !== null;
  }

  /**
   * Obtener perfil del usuario autenticado
   */
  async obtenerPerfil(): Promise<Usuario> {
    const token = this.obtenerToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const usuario = await fetchAPI<Usuario>('/auth/perfil', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(usuario));
    }
    return usuario;
  }
}

export default new AuthService();