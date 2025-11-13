import { WebSocket } from 'ws';
import { ai } from '../config/genai';
import { getCRMContext } from '@/services/crm-context.service';

export async function handleVoiceSession(ws: WebSocket) {
  if (!ai) {
    ws.send(JSON.stringify({ type: 'error', message: 'AI not configured' }));
    ws.close();
    return;
  }

  let liveSession: any = null;

  try {
    // Obtener contexto del CRM al iniciar la sesión
    const context = await getCRMContext();
    const contextSummary = `
DATOS DEL CRM ACTUALES:
- Total contactos: ${context.resumen.totalContactos}
- Total leads: ${context.resumen.totalLeads} (${context.resumen.leadsEsteMes} este mes)
- Oportunidades activas: ${context.resumen.oportunidadesActivas} (${context.resumen.oportunidadesGanadas} ganadas)
- Valor ganado: S/ ${context.resumen.valorGanado.toLocaleString('es-PE')}
- Cotizaciones totales: ${context.resumen.cotizacionesTotales}
- Proyectos activos: ${context.resumen.proyectosActivos}
- Tasa conversión: ${context.resumen.tasaConversion}%

ESTADOS DE LEADS:
${context.detalles.contactosPorEstado.map((c: any) => `  - ${c.estado}: ${c.cantidad}`).join('\n')}

OPORTUNIDADES POR ETAPA:
${context.detalles.oportunidadesPorEtapa.map((o: any) => `  - ${o.etapa}: ${o.cantidad}`).join('\n')}

TOP PROYECTOS (año actual):
${context.detalles.topProyectos.map((p: any, i: number) => `  ${i + 1}. ${p.proyecto}: ${p.oportunidades} ops, S/ ${p.valorTotal.toLocaleString('es-PE')}`).join('\n')}
`;

    const liveConfig = {
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        systemInstruction: `Eres un asistente analítico experto para el CRM inmobiliario "CRM Delgado".

Respondes en español de manera concisa y profesional, usando métricas y datos concretos.

${contextSummary}

Capacidades:
- Reportar leads, contactos y oportunidades con números exactos
- Analizar ventas ganadas y valores monetarios
- Comparar proyectos y estados
- Identificar tendencias

Estilo de respuesta en VOZ:
- MUY BREVE (máximo 2-3 oraciones)
- Usa números concretos del contexto arriba
- Incluye montos en soles cuando sea relevante
- Evita respuestas largas o técnicas`,
        inputAudioTranscription: {},
        outputAudioTranscription: {},
      },
      callbacks: {
        onopen: () => {
          ws.send(JSON.stringify({ type: 'session_open' }));
        },
        onmessage: (message: any) => {
          ws.send(JSON.stringify({ type: 'message', data: message }));
        },
        onerror: (error: any) => {
          console.error('[Voice] Live session error:', error);
          ws.send(JSON.stringify({ type: 'error', message: error.message || 'Session error' }));
        },
        onclose: () => {
          ws.send(JSON.stringify({ type: 'session_close' }));
        },
      },
    };

    liveSession = await (ai as any).live.connect(liveConfig);

    ws.on('message', (data: Buffer) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'audio' && liveSession) {
          liveSession.sendRealtimeInput({ media: msg.data });
        } else if (msg.type === 'close') {
          if (liveSession) liveSession.close();
          ws.close();
        }
      } catch (err) {
        console.error('[Voice] Error processing client message:', err);
      }
    });

    ws.on('close', () => {
      if (liveSession) {
        liveSession.close();
      }
    });

    ws.on('error', (err) => {
      console.error('[Voice] WebSocket error:', err);
      if (liveSession) {
        liveSession.close();
      }
    });
  } catch (error: any) {
    console.error('[Voice] Error setting up session:', error);
    ws.send(JSON.stringify({ type: 'error', message: error.message || 'Setup failed' }));
    ws.close();
  }
}
