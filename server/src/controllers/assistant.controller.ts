import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { getCRMContext } from '@/services/crm-context.service';
import prisma from '@/config/database';
import cotizacionService from '@/services/cotizacion.service';
import { videoTestimonialService } from '@/services/video-testimonial.service';

const apiKey = process.env.SERVER_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function askAssistant(req: Request, res: Response) {
  try {
    const { question } = req.body as { question: string };
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ exito: false, error: 'Pregunta inválida' });
    }

    // Intent detection: process video testimonial
    // Look for video URLs (http/https) - soporta redes sociales y URLs directas
    const videoUrlRegex = /(https?:\/\/[^\s]+)/i;
    const videoMatch = question.match(videoUrlRegex);
    const isVideoRequest = videoMatch || (question.toLowerCase().includes('video') && question.toLowerCase().includes('testimonio'));

    // Detectar si es una solicitud de video (redes sociales o URL directa)
    if (videoMatch && (question.toLowerCase().includes('testimonio') || question.toLowerCase().includes('resumen') || question.toLowerCase().includes('video'))) {
      try {
        const videoUrl = videoMatch[1];
        
        // Extraer nombre del usuario si está disponible
        const nombreMatch = question.match(/(?:para|de|por)\s+([a-záéíóúñ]+(?:\s+[a-záéíóúñ]+)?)/i);
        const nombre = nombreMatch ? nombreMatch[1].trim() : 'Cliente';
        
        // Extraer email si está disponible
        const emailMatch = question.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        const correo = emailMatch ? emailMatch[1] : undefined;

        // Procesar el video
        const resultado = await videoTestimonialService.procesarVideoYCrearTestimonio(
          videoUrl,
          nombre,
          correo || 'no-especificado@ejemplo.com'
        );

        // Construir respuesta en formato de testimonio visual
        const nombreCliente = resultado.analisis.nombre || nombre;
        const rolCliente = resultado.analisis.rol ? `\n${resultado.analisis.rol}` : '';
        const textoTestimonio = resultado.analisis.testimonio;
        const estrellas = '⭐'.repeat(resultado.analisis.calificacion);
        const puntosClaveLista = resultado.analisis.puntosClave.map((p: string) => `• ${p}`).join('\n');

        const respuesta = `✅ Testimonio procesado exitosamente

**${nombreCliente}**${rolCliente}
"${textoTestimonio}"
${estrellas}

**Puntos clave:**
${puntosClaveLista}

El testimonio ha sido guardado en la base de datos y está pendiente de aprobación.`;

        return res.json({ exito: true, datos: { answer: respuesta, action: { type: 'none' } } });
      } catch (error: any) {
        console.error('[Assistant] Error procesando video:', error);
        
        // Mensajes de error personalizados
        let mensaje = error.message || 'Error desconocido';
        let sugerencias = '';

        if (mensaje.includes('TikTok')) {
          sugerencias = `
Sugerencias para TikTok:
- Asegúrate de que el video sea **público**
- Intenta con un video de tu perfil o de otro usuario
- Si el problema persiste, intenta descargar el video manualmente y sube la URL directa`;
        } else if (mensaje.includes('Instagram')) {
          sugerencias = `
Sugerencias para Instagram:
- El video debe ser público
- Los videos privados no se pueden procesar
- Intenta con un Reel o video de tu feed`;
        } else if (mensaje.includes('Facebook')) {
          sugerencias = `
Sugerencias para Facebook:
- El video debe ser público
- Los videos privados no se pueden procesar`;
        } else {
          sugerencias = `
Sugerencias generales:
- La URL del video debe ser válida y accesible
- El video debe estar en formato MP4, MOV, AVI, WebM o MKV
- El video debe contener audio claro con el testimonio
- Si es de una red social, asegúrate de que sea público`;
        }

        const respuesta = `❌ No se pudo procesar el video: ${mensaje}${sugerencias}`;
        return res.json({ exito: true, datos: { answer: respuesta, action: { type: 'none' } } });
      }
    }

    // Intent detection: create quote for a contact
    // Very simple heuristic: look for "cotiz" + capture a name after "para"
    const lowerQ = question.toLowerCase();
    let action: { type: 'navigate' | 'open_lead_cotizacion' | 'none'; target?: string; params?: Record<string, string> } | undefined;
    if (lowerQ.includes('cotiz')) {
      // Try to extract a name after 'para'
      const m = lowerQ.match(/para\s+([a-záéíóúñ]+(?:\s+[a-záéíóúñ]+){0,2})/i);
      let contactoId: string | null = null;
      if (m && m[1]) {
        const nombreLike = m[1].trim().split(/\s+/).join(' ');
        // Buscar primer contacto que contenga todas las partes del nombre
        const partes = nombreLike.split(' ');
        const candidatos = await prisma.contacto.findMany({
          take: 10,
          select: { id: true, nombre: true, apellido: true },
          where: {
            OR: partes.map(p => ({
              OR: [
                { nombre: { contains: p } },
                { apellido: { contains: p } }
              ]
            }))
          }
        });
        if (candidatos.length > 0) {
          contactoId = candidatos[0].id;
        }
      }
      // Intentar extraer parámetros financieros simples
      // precio (número grande), inicial (porcentaje o monto), meses, tasa (porcentaje), proyecto
      const precioMatch = lowerQ.match(/precio\s*(?:de\s*)?\$?\s*([0-9][0-9\.\,]+)/);
      const inicialPctMatch = lowerQ.match(/(\d{1,2})\s*%\s*(?:de\s*)?inicial|inicial\s*(\d{1,2})\s*%/);
      const inicialMontoMatch = lowerQ.match(/inicial\s*\$?\s*([0-9][0-9\.\,]+)/);
      const mesesMatch = lowerQ.match(/(\d{1,3})\s*mes(?:es)?/);
      const tasaMatch = lowerQ.match(/tasa\s*(\d{1,2}(?:\.\d{1,2})?)\s*%/);
      const proyectoMatch = lowerQ.match(/proyecto\s+([a-z0-9áéíóúñ\s\-]+)/i);

      const parseNum = (s?: string | null) => s ? Number(String(s).replace(/\./g,'').replace(',','.')) : undefined;
      const precio = parseNum(precioMatch?.[1]);
      const plazoMeses = mesesMatch ? Number(mesesMatch[1]) : undefined;
      const tasa = tasaMatch ? Number(tasaMatch[1]) : undefined;
      const nombreProyecto = proyectoMatch ? proyectoMatch[1].trim() : undefined;
      let cuotaInicial: number | undefined = undefined;
      if (inicialPctMatch && precio) {
        const pct = Number(inicialPctMatch[1] || inicialPctMatch[2]);
        if (!isNaN(pct)) cuotaInicial = Math.round((precio * pct / 100));
      } else if (inicialMontoMatch) {
        cuotaInicial = parseNum(inicialMontoMatch[1]);
      }

      // Si tenemos mínimos, crear directamente la cotización
      if (contactoId && precio && plazoMeses && tasa && (cuotaInicial ?? 0) >= 0) {
        try {
          const nueva = await cotizacionService.crearCotizacion({
            contactoId,
            nombreProyecto: nombreProyecto || 'Proyecto sin nombre',
            precioInmueble: precio,
            cuotaInicial: cuotaInicial || 0,
            plazoMeses,
            tipoCuota: 'FIJA' as any,
            tasaInteresAnual: tasa
          } as any);
          const createdMsg = `Se creó la cotización ${nueva.numeroReferencia} para ${nueva.contacto?.nombre || ''} ${nueva.contacto?.apellido || ''} por S/ ${nueva.precioInmueble}. Cuota mensual estimada: S/ ${nueva.cuotaMensualEstimada}.`;
          return res.json({ exito: true, datos: { answer: createdMsg, action: { type: 'navigate', target: '/dashboard/leads', params: { cotizarContactoId: contactoId, nombreProyecto: (nombreProyecto || ''), precioInmueble: String(precio), cuotaInicial: String(cuotaInicial || 0), plazoMeses: String(plazoMeses), tasaInteresAnual: String(tasa) } } } });
        } catch (e: any) {
          // Si falla la creación, caemos al flujo de navegación
        }
      }

      // Si no hay datos suficientes o falló, navegar para completar en UI
      action = contactoId ? { type: 'navigate', target: '/dashboard/leads', params: { cotizarContactoId: contactoId, ...(nombreProyecto ? { nombreProyecto } : {}), ...(precio ? { precioInmueble: String(precio) } : {}), ...(typeof cuotaInicial === 'number' ? { cuotaInicial: String(cuotaInicial) } : {}), ...(plazoMeses ? { plazoMeses: String(plazoMeses) } : {}), ...(tasa ? { tasaInteresAnual: String(tasa) } : {}) } } : { type: 'none' };
    }

    // Obtener contexto completo del CRM (solo si hay IA; si no, podemos devolver fallback)
    const context = ai ? await getCRMContext() : null;

    const systemInstruction = `Eres un asistente experto para un CRM inmobiliario llamado "CRM Delgado".

Respondes en español, de manera concisa y profesional, usando métricas y datos concretos del contexto proporcionado.

CAPACIDADES COMPLETAS:
1. ANÁLISIS Y REPORTES:
   - Analizar leads, contactos, clientes, oportunidades y cotizaciones
   - Análisis demográfico completo (edades, departamentos, ciudades, distritos, provincias, sexo)
   - Reportar ventas ganadas y valores monetarios
   - Identificar tendencias mensuales y anuales
   - Comparar proyectos, estados y usuarios
   - Calcular tasas de conversión
   - Analizar actividades recientes del sistema
   - Proporcionar insights sobre etiquetas y categorización
   - Análisis de rendimiento por usuario y rol

2. EMAIL MARKETING:
   - Generar textos persuasivos para campañas de email marketing
   - Crear asuntos atractivos y llamadas a la acción (CTA)
   - Adaptar mensajes según el tipo de contacto (leads, clientes)
   - Sugerir temas de interés según etiquetas (ej: "Techo Propio", "Crédito Mi Vivienda")
   - Incluir datos del CRM para personalizar mensajes
   - Crear variaciones de textos para A/B testing
   - IMPORTANTE: Usar variables como {nombre}, {apellido}, {proyecto} para mensajes que se envíen a múltiples contactos
   - Los placeholders permiten personalizar automáticamente cada email sin escribir uno por uno

3. GUIONES PARA VIDEOS:
   - Crear guiones profesionales para videos de promoción de proyectos
   - Adaptar guiones según características del proyecto
   - Incluir puntos de venta clave (ubicación, precio, amenidades)
   - Sugerir estructura narrativa y timing
   - Crear variaciones cortas (15-30 seg) y largas (1-2 min)
   - Incluir calls-to-action efectivos

4. PROCESAMIENTO DE VIDEOS DE TESTIMONIOS:
   - Procesar videos de testimonios desde URLs
   - Extraer automáticamente el contenido del testimonio
   - Resumir el contenido en texto
   - Identificar puntos clave mencionados
   - Evaluar la satisfacción del cliente
   - Guardar testimonios en la base de datos
   - NOTA: El usuario puede enviar un link de video con palabras como "testimonio" o "resumen"

DATOS DISPONIBLES:
- Resumen: estadísticas generales del CRM
- Detalles: análisis por categorías (estado, tipo, ubicación, demografía, etc.)
- Actividades Recientes: últimos contactos, oportunidades y cotizaciones
- Datos Completos: información detallada de todos los registros
- Proyectos: información de propiedades y proyectos inmobiliarios

Cuando te pregunten por datos que están en el contexto, úsalos directamente. Tienes acceso a TODOS los datos del CRM.

INSTRUCCIONES ESPECIALES:
- Para EMAIL MARKETING: Pregunta sobre el tipo de contacto, etiqueta o proyecto si no está claro
- Para GUIONES: Pregunta sobre duración, tono (formal/casual), y características del proyecto
- Siempre proporciona opciones y variaciones
- Mantén un tono profesional pero amigable

Formato de respuesta:
- Usa números concretos del contexto
- Incluye montos en soles (S/) cuando sea relevante
- Para textos de EMAIL: 
  * Presenta opciones numeradas
  * SIEMPRE usa placeholders como {nombre}, {apellido}, {proyecto} para campos variables
  * Ejemplo: "Hola {nombre}, te presentamos el proyecto {proyecto}..."
  * Esto permite enviar el mismo email a múltiples contactos con personalización automática
- Para guiones: usa formato de diálogo con [INDICACIONES] entre corchetes
- Mantén respuestas claras y bien estructuradas`;

    // El contexto ya incluye todos los datos necesarios

    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `Contexto del CRM (datos actuales):
${JSON.stringify(context, null, 2)}

Pregunta del usuario:
${question}` }] },
        ],
        config: { systemInstruction },
      });
      return res.json({ exito: true, datos: { answer: response.text, action } });
    } else {
      // Fallback sin IA
      const fallback = 'Asistente en modo básico: puedo ejecutar acciones soportadas (como navegar o preparar la cotización) aunque no haya IA activa.';
      return res.json({ exito: true, datos: { answer: fallback, action } });
    }
  } catch (error) {
    console.error('[Assistant] Error:', error);
    return res.status(500).json({ exito: false, error: 'Error procesando la pregunta' });
  }
}
