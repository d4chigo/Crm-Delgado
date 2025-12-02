import { GoogleGenAI } from '@google/genai';
import prisma from '@/config/database';
import * as fs from 'fs';
import * as path from 'path';
import { socialMediaDownloaderService } from '@/services/social-media-downloader.service';

const apiKey = process.env.SERVER_GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Directorio temporal para descargar videos
const TEMP_DIR = path.join(process.cwd(), 'temp-videos');

// Crear directorio si no existe
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

export const videoTestimonialService = {
  /**
   * Descarga un video desde una URL (soporta redes sociales y URLs directas)
   */
  async descargarVideo(videoUrl: string): Promise<string> {
    try {
      // Verificar si es una red social
      if (socialMediaDownloaderService.esRedSocial(videoUrl)) {
        console.log(`[Video Testimonial] Detectada red social: ${socialMediaDownloaderService.obtenerPlataforma(videoUrl)}`);
        return await socialMediaDownloaderService.descargarDeRedSocial(videoUrl);
      }

      // Si no es red social, descargar como URL directa
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos timeout

      const response = await fetch(videoUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      const fileName = `video_${Date.now()}.mp4`;
      const filePath = path.join(TEMP_DIR, fileName);

      fs.writeFileSync(filePath, Buffer.from(buffer));
      return filePath;
    } catch (error) {
      console.error('Error descargando video:', error);
      throw new Error('No se pudo descargar el video');
    }
  },

  /**
   * Analiza un video con Gemini y extrae el testimonio
   */
  async analizarVideoConGemini(videoPath: string): Promise<{
    testimonio: string;
    nombre: string;
    rol: string;
    puntosClave: string[];
    calificacion: number;
  }> {
    if (!ai) {
      throw new Error('Gemini API no está configurada');
    }

    try {
      // Leer el archivo de video
      const videoBuffer = fs.readFileSync(videoPath);
      const base64Video = videoBuffer.toString('base64');

      // Determinar el tipo MIME
      const mimeType = 'video/mp4';

      // Enviar a Gemini para análisis
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Analiza este video de testimonio de cliente y extrae:

1. **Testimonio corto y directo** (máximo 200 caracteres, como si fuera una cita directa del cliente)
   - Debe sonar natural y auténtico
   - Incluir solo lo más importante que dice el cliente
   - Formato: "Texto del testimonio aquí"

2. **Nombre del cliente** (si se menciona, sino dejar vacío)

3. **Profesión/Rol del cliente** (ej: "Beneficiario de Techo Propio", "Empresario", etc. - si se menciona)

4. **Puntos clave** (máximo 3-4 puntos específicos mencionados)

5. **Calificación de satisfacción** (1-5 estrellas basada en el tono)

Responde en formato JSON:
{
  "testimonio": "Texto corto y directo del cliente",
  "nombre": "Nombre del cliente o vacío",
  "rol": "Rol/profesión del cliente o vacío",
  "puntosClave": ["punto1", "punto2", "punto3"],
  "calificacion": 5
}

IMPORTANTE: El testimonio debe ser corto, natural y sonar como una cita real del cliente, no un resumen.`,
              },
              {
                inlineData: {
                  mimeType,
                  data: base64Video,
                },
              },
            ],
          },
        ],
      });

      // Parsear la respuesta
      const textResponse = response.text || '';
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error('No se pudo extraer JSON de la respuesta de Gemini');
      }

      const resultado = JSON.parse(jsonMatch[0]);

      return {
        testimonio: resultado.testimonio || '',
        nombre: resultado.nombre || '',
        rol: resultado.rol || '',
        puntosClave: Array.isArray(resultado.puntosClave) ? resultado.puntosClave : [],
        calificacion: Math.min(5, Math.max(1, resultado.calificacion || 3)),
      };
    } catch (error) {
      console.error('Error analizando video con Gemini:', error);
      throw new Error('No se pudo analizar el video');
    }
  },

  /**
   * Procesa un video desde una URL y crea un testimonio
   */
  async procesarVideoYCrearTestimonio(
    videoUrl: string,
    nombre: string,
    correo: string,
    nombreProyecto?: string
  ): Promise<any> {
    let videoPath: string | null = null;

    try {
      // Descargar el video
      videoPath = await this.descargarVideo(videoUrl);

      // Analizar con Gemini
      const analisis = await this.analizarVideoConGemini(videoPath);

      // Crear el testimonio en la BD
      const testimonio = await prisma.testimonio.create({
        data: {
          nombre: analisis.nombre || nombre,
          correo,
          calificacion: analisis.calificacion,
          testimonio: analisis.testimonio,
          videoUrl,
          estado: 'PENDIENTE', // Requiere aprobación manual
          creadoEn: new Date(),
        } as any,
      });

      return {
        exito: true,
        testimonio,
        analisis: {
          testimonio: analisis.testimonio,
          nombre: analisis.nombre,
          rol: analisis.rol,
          puntosClave: analisis.puntosClave,
          calificacion: analisis.calificacion,
        },
      };
    } catch (error) {
      console.error('Error procesando video:', error);
      throw error;
    } finally {
      // Limpiar archivo temporal
      if (videoPath && fs.existsSync(videoPath)) {
        try {
          fs.unlinkSync(videoPath);
        } catch (e) {
          console.warn('No se pudo eliminar archivo temporal:', videoPath);
        }
      }
    }
  },

  /**
   * Limpia archivos temporales antiguos (más de 1 hora)
   */
  async limpiarArchivosTemporales(): Promise<void> {
    try {
      const archivos = fs.readdirSync(TEMP_DIR);
      const ahora = Date.now();
      const UNA_HORA = 60 * 60 * 1000;

      for (const archivo of archivos) {
        const rutaCompleta = path.join(TEMP_DIR, archivo);
        const stats = fs.statSync(rutaCompleta);
        const edad = ahora - stats.mtimeMs;

        if (edad > UNA_HORA) {
          fs.unlinkSync(rutaCompleta);
          console.log(`Archivo temporal eliminado: ${archivo}`);
        }
      }
    } catch (error) {
      console.warn('Error limpiando archivos temporales:', error);
    }
  },
};
