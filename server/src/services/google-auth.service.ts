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
  getAuthUrl(state?: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/calendar'
    ];

    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state
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
    this.oauth2Client.setCredentials({ access_token: accessToken });
    
    const people = google.people({ version: 'v1', auth: this.oauth2Client });
    
    try {
      const response = await people.people.connections.list({
        resourceName: 'people/me',
        pageSize: 1000,
        personFields: 'names,emailAddresses,phoneNumbers,addresses'
      });

      return response.data.connections || [];
    } catch (error) {
      console.error('Error al obtener contactos de Google:', error);
      throw new Error('No se pudieron obtener los contactos de Google');
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
