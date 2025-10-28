import { fetchAPI } from './config';

// Tipos para autenticación
export interface LoginDTO {
  email: string;
  password: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
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
    const respuesta = await fetchAPI<RespuestaLogin>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(datos),
    });

    // Guardar token y usuario en localStorage
    this.guardarToken(respuesta.token.token);
    this.guardarUsuario(respuesta.usuario);

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
   * Guardar token en localStorage
   */
  private guardarToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  /**
   * Guardar usuario en localStorage
   */
  private guardarUsuario(usuario: Usuario): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(usuario));
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

    this.guardarUsuario(usuario);
    return usuario;
  }
}

export default new AuthService();