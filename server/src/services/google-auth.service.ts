import { google } from 'googleapis';

class GoogleAuthService {
  private oauth2Client;

  constructor() {
    // Configuración de OAuth2
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID || '',
      process.env.GOOGLE_CLIENT_SECRET || '',
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
    
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      
      console.log('✅ Tokens obtenidos exitosamente');
      console.log('Access token:', tokens.access_token ? 'Presente' : 'Ausente');
      console.log('Refresh token:', tokens.refresh_token ? 'Presente' : 'Ausente');
      
      return tokens;
    } catch (error: any) {
      console.error('❌ Error al obtener tokens:', error.message);
      throw new Error(`Error al obtener tokens de Google: ${error.message}`);
    }
  }

  /**
   * Obtener contactos de Google usando el access token
   */
  async getContacts(accessToken: string) {
    console.log('[Google Auth] Obteniendo contactos...');
    console.log('[Google Auth] Access token recibido, longitud:', accessToken?.length || 0);
    
    this.oauth2Client.setCredentials({ access_token: accessToken });
    
    const people = google.people({ version: 'v1', auth: this.oauth2Client });
    
    try {
      console.log('[Google Auth] Llamando a Google People API...');
      const response = await people.people.connections.list({
        resourceName: 'people/me',
        pageSize: 1000,
        personFields: 'names,emailAddresses,phoneNumbers,addresses'
      });

      console.log('[Google Auth] Contactos recibidos:', response.data.connections?.length || 0);
      return response.data.connections || [];
    } catch (error: any) {
      console.error('[Google Auth] Error al obtener contactos de Google:', error.message);
      console.error('[Google Auth] Error code:', error.code);
      console.error('[Google Auth] Error response:', error.response?.data);
      throw new Error(`No se pudieron obtener los contactos de Google: ${error.message}`);
    }
  }

  /**
   * Verificar si las credenciales están configuradas
   */
  isConfigured(): boolean {
    return !!(
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET
    );
  }
}

export default new GoogleAuthService();
