let __aiInstance: any | null = null;

export async function getAI() {
  if (typeof window === 'undefined') {
    throw new Error('getAI() solo debe ejecutarse en el cliente');
  }
  if (__aiInstance) return __aiInstance;
  const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

  // Intentar usar el módulo instalado primero
  let Ctor: any = null;
  try {
    const mod = await import('@google/generative-ai');
    Ctor = mod.GoogleGenerativeAI;
  } catch (err) {
    console.warn('No se pudo importar @google/generative-ai del bundle, intentando CDN...', err);
  }

  // Fallback a CDN UMD si el import falla
  if (!Ctor && !(window as any).GoogleGenerativeAI) {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.type = 'text/javascript';
      s.crossOrigin = 'anonymous';
      s.src = 'https://cdn.jsdelivr.net/npm/@google/generative-ai@0.24.1/dist/generative-ai.umd.js';
      s.onload = () => resolve(null);
      s.onerror = (e) => {
        console.error('Error cargando UMD desde CDN:', e);
        reject(new Error('load-failed'));
      };
      document.head.appendChild(s);
    });
  }

  if (!Ctor) {
    Ctor = (window as any).GoogleGenerativeAI;
  }

  if (!Ctor) {
    throw new Error('No se pudo cargar el SDK de Google Generative AI');
  }

  __aiInstance = new Ctor(key);
  return __aiInstance;
}
