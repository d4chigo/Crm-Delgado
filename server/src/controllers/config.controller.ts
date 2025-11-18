import { Request, Response } from 'express';

export class ConfigController {
  /**
   * GET /api/config/google-api-key
   * Obtiene la clave de Google Gemini API desde el servidor
   */
  async getGoogleApiKey(req: Request, res: Response): Promise<void> {
    try {
      const apiKey = process.env.SERVER_GEMINI_API_KEY || '';
      
      if (!apiKey) {
        res.status(400).json({
          exito: false,
          error: 'Google API Key no configurada en el servidor'
        });
        return;
      }

      res.json({
        exito: true,
        apiKey
      });
    } catch (error: any) {
      console.error('[Config] Error obteniendo API key:', error);
      res.status(500).json({
        exito: false,
        error: 'Error al obtener configuración'
      });
    }
  }
}

export default new ConfigController();
