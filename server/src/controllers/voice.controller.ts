import { WebSocket } from 'ws';
import { ai } from '../config/genai';
import { getCRMContext } from '@/services/crm-context.service';
import { registrarConexion, desregistrarConexion } from '@/services/notificacion-realtime.service';

export async function handleVoiceSession(ws: WebSocket) {
  let usuarioId: string | null = null;
  let liveSession: any = null;

  try {
    // Primero, esperar a que el cliente envíe su registro con usuarioId
    const registroPromise = new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(() => {
        // En lugar de rechazar, simplemente cerrar la conexión silenciosamente
        // ya que probablemente no es un cliente de voz
        ws.close();
        reject(new Error('No se recibió registro de usuario'));
      }, 5000);

      const messageHandler = (data: Buffer) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.tipo === 'registro' && msg.usuarioId) {
            clearTimeout(timeout);
            ws.removeListener('message', messageHandler);
            resolve(msg.usuarioId);
          }
        } catch (err) {
          console.warn('[Voice] Error parsing registro message:', err);
        }
      };

      ws.on('message', messageHandler);
    });

    usuarioId = await registroPromise;
    console.log(`✅ Usuario ${usuarioId} registrado para notificaciones`);
    
    // Registrar la conexión para notificaciones
    registrarConexion(usuarioId, ws);

    // Enviar confirmación de registro
    ws.send(JSON.stringify({ 
      tipo: 'registro_confirmado',
      usuarioId: usuarioId,
      mensaje: 'Conectado para recibir notificaciones'
    }));

    // Si no hay AI configurado, solo mantener la conexión para notificaciones
    if (!ai) {
      console.log(`[Voice] AI no configurado, manteniendo conexión solo para notificaciones`);
      
      ws.on('close', () => {
        if (usuarioId) {
          desregistrarConexion(usuarioId);
        }
      });

      ws.on('error', (err) => {
        console.error('[Voice] WebSocket error:', err);
        if (usuarioId) {
          desregistrarConexion(usuarioId);
        }
      });

      return;
    }

    // Si hay AI, continuar con la sesión de voz
    handleVoiceSessionWithAI(ws, usuarioId, liveSession);

  } catch (error: any) {
    // Solo loguear si es un error real, no si es el timeout esperado
    if (error.message !== 'No se recibió registro de usuario') {
      console.error('[Voice] Error en handleVoiceSession:', error);
      try {
        ws.send(JSON.stringify({ type: 'error', message: error.message || 'Setup failed' }));
      } catch (e) {
        // Ignorar si no se puede enviar el mensaje
      }
    }
    
    if (usuarioId) {
      desregistrarConexion(usuarioId);
    }
    
    try {
      ws.close();
    } catch (e) {
      // Ignorar si ya está cerrado
    }
  }
}

async function handleVoiceSessionWithAI(ws: WebSocket, usuarioId: string, liveSession: any) {
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
      if (usuarioId) {
        desregistrarConexion(usuarioId);
      }
    });

    ws.on('error', (err) => {
      console.error('[Voice] WebSocket error:', err);
      if (liveSession) {
        liveSession.close();
      }
      if (usuarioId) {
        desregistrarConexion(usuarioId);
      }
    });
  } catch (error: any) {
    console.error('[Voice] Error setting up AI session:', error);
    ws.send(JSON.stringify({ type: 'error', message: error.message || 'Setup failed' }));
    if (usuarioId) {
      desregistrarConexion(usuarioId);
    }
    ws.close();
  }
}
