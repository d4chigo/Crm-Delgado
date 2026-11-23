import { fetchAPI } from './config';
import authService from './auth.service';

class GoogleAuthService {
  private static readonly PENDING_IMPORT_KEY = 'google_import_pending';

  /**
   * Obtener URL de autorización de Google
   */
  async getAuthUrl(): Promise<string> {
    const token = authService.obtenerToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetchAPI<{ authUrl: string }>('/auth/google', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.authUrl;
  }

  /**
   * Iniciar el flujo de autenticación de Google
   * Guarda el estado y redirige a Google
   */
  async startAuthFlow(): Promise<void> {
    console.log('🚀 Iniciando flujo de autenticación con Google...');
    
    // Marcar que hay una importación pendiente
    sessionStorage.setItem(GoogleAuthService.PENDING_IMPORT_KEY, 'true');
    
    // Obtener URL de autorización y redirigir
    const authUrl = await this.getAuthUrl();
    console.log('🔗 Redirigiendo a Google para autorización...');
    window.location.href = authUrl;
  }

  /**
   * Verificar si hay una importación pendiente (después del callback)
   */
  isPendingImport(): boolean {
    return sessionStorage.getItem(GoogleAuthService.PENDING_IMPORT_KEY) === 'true';
  }

  /**
   * Limpiar el estado de importación pendiente
   */
  clearPendingImport(): void {
    sessionStorage.removeItem(GoogleAuthService.PENDING_IMPORT_KEY);
  }

  getTokenFromCallback(): string | null {
    return null;
  }

  /**
   * Verificar si hay un error en el callback
   */
  getErrorFromCallback(): { error: string; message?: string } | null {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('google_error');
    const message = params.get('message');
    
    if (error) {
      console.log('❌ Error de Google en URL:', error, message);
      // Limpiar URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return { error, message: message || undefined };
    }
    
    return null;
  }


  /**
   * Obtener mensaje de error amigable
   */
  getErrorMessage(error: string): string {
    const errorMessages: { [key: string]: string } = {
      'access_denied': 'Acceso denegado por el usuario',
      'invalid_request': 'Solicitud inválida',
      'unauthorized_client': 'Cliente no autorizado - verifica la configuración de OAuth',
      'unsupported_response_type': 'Tipo de respuesta no soportado',
      'invalid_scope': 'Alcance inválido',
      'server_error': 'Error del servidor de Google',
      'temporarily_unavailable': 'Servicio temporalmente no disponible',
      'cancelled': 'Autenticación cancelada',
      'no_code': 'No se recibió el código de autorización',
      'auth_failed': 'Error en la autenticación con Google',
    };

    return errorMessages[error] || `Error de Google: ${error}`;
  }
}

export default new GoogleAuthService();

