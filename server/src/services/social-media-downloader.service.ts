import * as fs from 'fs';
import * as path from 'path';

// Directorio temporal para descargar videos
const TEMP_DIR = path.join(process.cwd(), 'temp-videos');

// Crear directorio si no existe
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Detecta la plataforma social del URL
 */
function detectarPlataforma(url: string): 'tiktok' | 'instagram' | 'youtube' | 'facebook' | 'desconocida' {
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('facebook.com')) return 'facebook';
  return 'desconocida';
}

/**
 * Extrae el ID del video de TikTok
 */
function extraerIdTikTok(url: string): string | null {
  // Formato: https://www.tiktok.com/@usuario/video/7541954101563657490
  const match = url.match(/\/video\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Descarga video de TikTok usando API pública
 */
async function descargarDeTikTok(url: string): Promise<string> {
  try {
    const videoId = extraerIdTikTok(url);
    if (!videoId) {
      throw new Error('No se pudo extraer el ID del video de TikTok');
    }

    // Intentar con múltiples APIs públicas de TikTok
    const apis = [
      `https://api.tiktok.com/v1/video/${videoId}/download`,
      `https://www.tiktok.com/api/v1/video/${videoId}`,
    ];

    let videoUrl: string | null = null;

    // Intentar obtener el video usando método alternativo
    // Usar un servicio de descarga de TikTok público
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      // Usar API de TikTok Downloader pública
      const response = await fetch(`https://api.tiktok.com/v1/video/${videoId}`, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json() as any;
        videoUrl = data.video?.downloadAddr || data.video?.playAddr || null;
      }
    } catch (e) {
      clearTimeout(timeoutId);
      console.warn('API principal de TikTok falló, intentando alternativa...');
    }

    // Si la API principal falla, usar un servicio externo
    if (!videoUrl) {
      // Usar servicio de descarga de TikTok (sin marca de agua)
      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 30000);

      try {
        const response = await fetch('https://api.douyin.com/aweme/v1/web/feed/', {
          method: 'POST',
          signal: controller2.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `aweme_id=${videoId}`,
        });

        clearTimeout(timeoutId2);

        if (response.ok) {
          const data = await response.json() as any;
          videoUrl = data.aweme_detail?.video?.downloadAddr || null;
        }
      } catch (e) {
        clearTimeout(timeoutId2);
        console.warn('API alternativa también falló');
      }
    }

    if (!videoUrl) {
      throw new Error('No se pudo obtener la URL de descarga del video de TikTok');
    }

    // Descargar el video
    const controller3 = new AbortController();
    const timeoutId3 = setTimeout(() => controller3.abort(), 60000);

    const videoResponse = await fetch(videoUrl, {
      signal: controller3.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    clearTimeout(timeoutId3);

    if (!videoResponse.ok) {
      throw new Error(`HTTP ${videoResponse.status}: No se pudo descargar el video`);
    }

    const buffer = await videoResponse.arrayBuffer();
    const fileName = `tiktok_${videoId}_${Date.now()}.mp4`;
    const filePath = path.join(TEMP_DIR, fileName);

    fs.writeFileSync(filePath, Buffer.from(buffer));
    return filePath;
  } catch (error) {
    console.error('Error descargando de TikTok:', error);
    throw new Error('No se pudo descargar el video de TikTok. Intenta con un video público.');
  }
}

/**
 * Descarga video de Instagram
 */
async function descargarDeInstagram(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    // Usar API pública de Instagram
    const response = await fetch(`https://api.instagram.com/v1/media/?url=${encodeURIComponent(url)}`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('No se pudo acceder a Instagram');
    }

    const data = await response.json() as any;
    const videoUrl = data.media_url || data.video_url;

    if (!videoUrl) {
      throw new Error('No se encontró URL de video en Instagram');
    }

    // Descargar el video
    const videoResponse = await fetch(videoUrl);
    const buffer = await videoResponse.arrayBuffer();
    const fileName = `instagram_${Date.now()}.mp4`;
    const filePath = path.join(TEMP_DIR, fileName);

    fs.writeFileSync(filePath, Buffer.from(buffer));
    return filePath;
  } catch (error) {
    console.error('Error descargando de Instagram:', error);
    throw new Error('No se pudo descargar el video de Instagram');
  }
}

/**
 * Descarga video de Facebook
 */
async function descargarDeFacebook(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    // Usar API pública de Facebook
    const response = await fetch(`https://graph.facebook.com/v18.0/video?url=${encodeURIComponent(url)}`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('No se pudo acceder a Facebook');
    }

    const data = await response.json() as any;
    const videoUrl = data.source || data.video_url;

    if (!videoUrl) {
      throw new Error('No se encontró URL de video en Facebook');
    }

    // Descargar el video
    const videoResponse = await fetch(videoUrl);
    const buffer = await videoResponse.arrayBuffer();
    const fileName = `facebook_${Date.now()}.mp4`;
    const filePath = path.join(TEMP_DIR, fileName);

    fs.writeFileSync(filePath, Buffer.from(buffer));
    return filePath;
  } catch (error) {
    console.error('Error descargando de Facebook:', error);
    throw new Error('No se pudo descargar el video de Facebook');
  }
}

export const socialMediaDownloaderService = {
  /**
   * Descarga video desde cualquier red social
   */
  async descargarDeRedSocial(url: string): Promise<string> {
    const plataforma = detectarPlataforma(url);

    console.log(`[Social Media] Descargando de ${plataforma}: ${url}`);

    switch (plataforma) {
      case 'tiktok':
        return await descargarDeTikTok(url);
      case 'instagram':
        return await descargarDeInstagram(url);
      case 'facebook':
        return await descargarDeFacebook(url);
      case 'youtube':
        throw new Error('YouTube requiere configuración especial. Usa URLs directas de video MP4.');
      default:
        throw new Error('Plataforma no soportada. Usa TikTok, Instagram o Facebook.');
    }
  },

  /**
   * Detecta si es una URL de red social
   */
  esRedSocial(url: string): boolean {
    return detectarPlataforma(url) !== 'desconocida';
  },

  /**
   * Obtiene la plataforma del URL
   */
  obtenerPlataforma(url: string): string {
    return detectarPlataforma(url);
  },
};
