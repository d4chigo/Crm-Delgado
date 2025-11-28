import { google } from 'googleapis';

class GoogleAuthService {
  private oauth2Client;

  constructor() {
    // Configuración de OAuth2
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID || 'your-client-id',
      process.env.GOOGLE_CLIENT_SECRET || 'your-client-secret',
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'
    );
  }

  /**
   * Generar URL de autorización de Google
   */
  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/contacts.readonly',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ];

    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });

    console.log('🔗 URL de autorización generada');
    console.log('Redirect URI configurado:', process.env.GOOGLE_REDIRECT_URI);
    
    return authUrl;
  }

  /**
   * Obtener tokens con el código de autorización
   */
  async getTokens(code: string) {
    console.log('🔄 Intentando obtener tokens con código de autorización...');
    console.log('Code recibido, longitud:', code?.length || 0);
    
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      
      console.log('✅ Tokens obtenidos exitosamente');
      console.log('Access token:', tokens.access_token ? `Presente (${tokens.access_token.length} chars)` : 'Ausente ❌');
      console.log('Refresh token:', tokens.refresh_token ? 'Presente' : 'Ausente');
      console.log('Token type:', tokens.token_type);
      console.log('Expiry date:', tokens.expiry_date);
      
      if (!tokens.access_token) {
        console.error('❌ Access token no recibido en la respuesta de Google');
        console.error('Tokens recibidos:', {
          access_token: tokens.access_token ? 'PRESENTE' : 'AUSENTE',
          refresh_token: tokens.refresh_token ? 'PRESENTE' : 'AUSENTE',
          token_type: tokens.token_type,
          expiry_date: tokens.expiry_date,
          scope: tokens.scope
        });
      }
      
      return tokens;
    } catch (error: any) {
      console.error('❌ Error al obtener tokens:', error.message);
      console.error('Error code:', error.code);
      console.error('Error response:', error.response?.data);
      throw new Error(`Error al obtener tokens de Google: ${error.message}`);
    }
  }

  /**
   * Obtener contactos de Google usando el access token
   */
  async getContacts(accessToken: string) {
    console.log('[Google Auth] Obteniendo contactos...');
    console.log('[Google Auth] Access token recibido, longitud:', accessToken?.length || 0);
    console.log('[Google Auth] Primeros 20 chars del token:', accessToken?.substring(0, 20) || 'N/A');
    
    if (!accessToken || accessToken.trim() === '') {
      throw new Error('Access token vacío o inválido');
    }
    
    try {
      // Crear un nuevo cliente OAuth para este token específico
      const oauth2ClientTemp = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID || 'your-client-id',
        process.env.GOOGLE_CLIENT_SECRET || 'your-client-secret',
        process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'
      );
      
      oauth2ClientTemp.setCredentials({ access_token: accessToken });
      
      const people = google.people({ version: 'v1', auth: oauth2ClientTemp });
      
      console.log('[Google Auth] Llamando a Google People API...');
      const response = await people.people.connections.list({
        resourceName: 'people/me',
        pageSize: 1000,
        personFields: 'names,emailAddresses,phoneNumbers,addresses'
      });

      console.log('[Google Auth] Respuesta recibida');
      console.log('[Google Auth] Contactos en respuesta:', response.data.connections?.length || 0);
      console.log('[Google Auth] Datos de respuesta:', {
        totalConnections: response.data.totalPeople,
        nextPageToken: response.data.nextPageToken ? 'Presente' : 'No',
        hasConnections: !!response.data.connections
      });
      
      // Si no hay contactos, retornar array vacío pero loguear
      if (!response.data.connections || response.data.connections.length === 0) {
        console.warn('[Google Auth] ⚠️ No se encontraron contactos en Google');
        return [];
      }
      
      return response.data.connections;
    } catch (error: any) {
      console.error('[Google Auth] Error al obtener contactos de Google:', error.message);
      console.error('[Google Auth] Error code:', error.code);
      console.error('[Google Auth] Status code:', error.response?.status);
      console.error('[Google Auth] Error response:', error.response?.data);
      
      // Proporcionar mensaje de error más específico
      if (error.response?.status === 403) {
        throw new Error(`Permiso denegado: El token no tiene permisos para acceder a los contactos. Detalle: ${error.response?.data?.error?.message || error.message}`);
      } else if (error.response?.status === 401) {
        throw new Error(`Token inválido o expirado. Por favor vuelve a autorizar.`);
      }
      
      throw new Error(`No se pudieron obtener los contactos de Google: ${error.message}`);
    }
  }

  /**
   * Verificar si las credenciales están configuradas
   */
  isConfigured(): boolean {
    return !!(
      process.env.GOOGLE_CLIENT_ID && 
      process.env.GOOGLE_CLIENT_ID !== 'your-client-id' &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_CLIENT_SECRET !== 'your-client-secret'
    );
  }
}

export default new GoogleAuthService();
