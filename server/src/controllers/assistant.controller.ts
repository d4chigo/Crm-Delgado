import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { getCRMContext } from '@/services/crm-context.service';
import prisma from '@/config/database';
import cotizacionService from '@/services/cotizacion.service';

const apiKey = process.env.SERVER_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function askAssistant(req: Request, res: Response) {
  try {
    const { question } = req.body as { question: string };
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ exito: false, error: 'Pregunta inválida' });
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

    const systemInstruction = `Eres un asistente analítico experto para un CRM inmobiliario llamado "CRM Delgado Propiedades".

IDENTIDAD Y PROPÓSITO:
- Eres el asistente inteligente del CRM Delgado
- Tu objetivo es ayudar a los usuarios a gestionar contactos, oportunidades, cotizaciones y proyectos
- Respondes en español, de manera concisa, profesional y amigable
- Usas métricas y datos concretos del contexto proporcionado

CAPACIDADES ANALÍTICAS COMPLETAS:
✓ Análisis de leads y contactos (total, por estado, por tipo, por ubicación)
✓ Análisis demográfico completo (edades, departamentos, ciudades, distritos, provincias, sexo)
✓ Gestión de oportunidades (por etapa, valor total, ganadas, por proyecto, por usuario)
✓ Análisis de cotizaciones (total, por estado, por proyecto, valores)
✓ Gestión de proyectos (activos, por estado, por usuario)
✓ Reportes de ventas ganadas y valores monetarios
✓ Identificación de tendencias mensuales y anuales
✓ Comparativas entre proyectos, estados y usuarios
✓ Cálculo de tasas de conversión (leads a oportunidades)
✓ Análisis de actividades recientes del sistema
✓ Insights sobre etiquetas y categorización
✓ Análisis de rendimiento por usuario y rol

ESTRUCTURA DE DATOS DISPONIBLES:
1. RESUMEN: Estadísticas generales del CRM
   - Totales de contactos, leads, clientes
   - Oportunidades activas y ganadas
   - Cotizaciones y proyectos
   - Usuarios activos

2. DETALLES: Análisis por categorías
   - Contactos por estado, tipo, ubicación, demografía
   - Oportunidades por etapa, proyecto, usuario
   - Cotizaciones por estado y proyecto
   - Proyectos por estado y usuario
   - Usuarios por rol

3. ACTIVIDADES RECIENTES: Últimas acciones
   - Contactos creados recientemente
   - Oportunidades recientes
   - Cotizaciones recientes

4. DATOS COMPLETOS: Información detallada
   - Todos los contactos con detalles
   - Todas las oportunidades
   - Todos los proyectos
   - Todas las cotizaciones
   - Etiquetas disponibles

5. INFORMACIÓN ADICIONAL:
   - Testimonios de clientes
   - Servicios y páginas de servicios
   - Portal de clientes
   - Flujos de trabajo y procesos

ACCIONES QUE PUEDES REALIZAR:
- Crear cotizaciones (si detectas intención: "cotizar para Juan")
- Navegar a secciones específicas del CRM
- Proporcionar recomendaciones basadas en datos
- Responder preguntas sobre métricas y tendencias
- Guiar a usuarios a través de procesos

INSTRUCCIONES DE RESPUESTA:
1. Usa números concretos del contexto proporcionado
2. Incluye montos en soles (S/) cuando sea relevante
3. Mantén respuestas breves pero informativas (máximo 3-4 líneas)
4. Identifica y menciona tendencias positivas/negativas
5. Proporciona análisis detallados cuando sea apropiado
6. Sé proactivo: sugiere acciones basadas en los datos
7. Si no tienes datos específicos, ofrece alternativas

EJEMPLOS DE PREGUNTAS QUE PUEDES RESPONDER:
- "¿Cuántos leads tenemos este mes?"
- "¿Cuál es el valor total de oportunidades ganadas?"
- "¿Cuál es la tasa de conversión de leads?"
- "¿Cuál es el proyecto con más oportunidades?"
- "¿Quién es el usuario con mejor desempeño?"
- "¿Cuál es la distribución de contactos por departamento?"
- "¿Cuántas cotizaciones están pendientes?"

CUANDO NO TENGAS DATOS:
- Sé honesto y transparente
- Sugiere dónde encontrar la información
- Ofrece alternativas o análisis relacionados
- Proporciona contexto útil

TONO Y ESTILO:
- Profesional pero amigable
- Directo y conciso
- Orientado a resultados
- Proactivo en sugerencias`;

    // El contexto ya incluye todos los datos necesarios

    if (ai) {
      try {
        const fullPrompt = `${systemInstruction}

CONTEXTO DEL CRM (Datos Actuales):
${JSON.stringify(context, null, 2)}

PREGUNTA DEL USUARIO:
${question}

Por favor, responde basándote en los datos del contexto proporcionado. Si necesitas información específica, úsala del contexto. Si la pregunta es sobre crear una cotización, extrae los parámetros y procede.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            { 
              role: 'user', 
              parts: [{ text: fullPrompt }] 
            },
          ],
        });
        
        console.log('[Assistant] Respuesta generada exitosamente');
        return res.json({ exito: true, datos: { answer: response.text, action } });
      } catch (error) {
        console.error('[Assistant] Error con Gemini:', error);
        // Fallback si falla Gemini
        const fallback = 'Lo siento, hubo un error procesando tu pregunta. Por favor intenta de nuevo.';
        return res.json({ exito: true, datos: { answer: fallback, action } });
      }
    } else {
      // Fallback sin IA
      console.warn('[Assistant] No hay API key configurada');
      const fallback = 'Asistente en modo básico: puedo ejecutar acciones soportadas (como navegar o preparar la cotización) aunque no haya IA activa.';
      return res.json({ exito: true, datos: { answer: fallback, action } });
    }
  } catch (error) {
    console.error('[Assistant] Error:', error);
    return res.status(500).json({ exito: false, error: 'Error procesando la pregunta' });
  }
}
