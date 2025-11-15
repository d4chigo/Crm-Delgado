"use client";
import { useState, useRef, useCallback, useEffect } from 'react';
import { Message, Role, CallStatus } from '@/types/assistant.types';

// --- Type Definitions for Web APIs ---
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodePcmAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

function createPcmBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) int16[i] = data[i] * 32768;
  return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
}

export const useVoiceCall = () => {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [status, setStatus] = useState<CallStatus>(CallStatus.Inactive);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);

  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  const isCallActiveRef = useRef(isCallActive);
  useEffect(() => { isCallActiveRef.current = isCallActive; }, [isCallActive]);

  const stopCallCleanup = useCallback(() => {
    setIsCallActive(false);
    isCallActiveRef.current = false;
    setStatus(CallStatus.Inactive);
    setLiveTranscript('');

    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    if (wsRef.current) {
      try { wsRef.current.onopen = null as any; wsRef.current.onmessage = null as any; wsRef.current.onerror = null as any; wsRef.current.onclose = null as any; } catch {}
      try { if (wsRef.current.readyState === WebSocket.OPEN) wsRef.current.send(JSON.stringify({ type: 'close' })); } catch {}
      try { wsRef.current.close(); } catch {}
      wsRef.current = null;
    }
  }, []);

  useEffect(() => () => stopCallCleanup(), [stopCallCleanup]);

  const startCall = useCallback(async () => {
    setConversation([]);
    setLiveTranscript('');
    setIsCallActive(true);
    setStatus(CallStatus.RequestingMic);

    try {
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStatus(CallStatus.Connecting);

      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      inputAudioContextRef.current = new AudioContextCtor({ sampleRate: 16000 });
      outputAudioContextRef.current = new AudioContextCtor({ sampleRate: 24000 });

      let nextStartTime = 0;
      let currentInputTranscription = '';
      let currentOutputTranscription = '';
      let pushedUserThisTurn = false;
      let dispatchedThisTurn = false;

      // Conectar al WebSocket del backend, normalizando URL con o sin sufijo /api
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const u = new URL(base);
      u.protocol = u.protocol.startsWith('https') ? 'wss:' : 'ws:';
      // eliminar posibles duplicados de / al final y el sufijo /api si existe
      const cleanPath = u.pathname.replace(/\/+$/, '');
      const noApi = cleanPath.endsWith('/api') ? cleanPath.slice(0, -4) : cleanPath;
      u.pathname = `${noApi}/api/voice`.replace(/\/+/, '/');
      
      console.log('[VoiceCall] Conectando a WebSocket:', u.toString());
      
      const ws = new WebSocket(u.toString());
      wsRef.current = ws;
      
      // Timeout para conexión WebSocket
      const wsTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          console.error('[VoiceCall] WebSocket connection timeout');
          ws.close();
          setStatus(CallStatus.Error);
          alert('Timeout al conectar con el servidor de voz. Intenta de nuevo.');
          stopCallCleanup();
        }
      }, 10000); // 10 segundos

      ws.onopen = () => {
        clearTimeout(wsTimeout);
        console.log('[VoiceCall] WebSocket connected');
        if (!mediaStreamRef.current || !inputAudioContextRef.current) return;
        setStatus(CallStatus.Listening);
        const source = inputAudioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
        scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
          if (!isCallActiveRef.current || ws.readyState !== WebSocket.OPEN) return;
          const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
          const pcmBlob = createPcmBlob(inputData);
          ws.send(JSON.stringify({ type: 'audio', data: pcmBlob }));
        };
        source.connect(scriptProcessorRef.current);
        scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
      };

      ws.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'message' && msg.data) {
          const message = msg.data;
          if (message.serverContent?.inputTranscription) {
            setLiveTranscript(currentInputTranscription + message.serverContent.inputTranscription.text);
            if ((message.serverContent.inputTranscription as any)?.isFinal) {
              currentInputTranscription += message.serverContent.inputTranscription.text + ' ';
              try { console.debug('[VoiceHook] input FINAL:', currentInputTranscription.trim()); } catch {}
              if (!pushedUserThisTurn && currentInputTranscription.trim()) {
                // Emitir ya el mensaje del usuario para que AssistantPanel dispare la acción
                setConversation(prev => [...prev, { role: Role.User, text: currentInputTranscription.trim() }]);
                pushedUserThisTurn = true;
              }
              // BYPASS: Enviar de inmediato al backend y navegar
              const phrase = currentInputTranscription.trim();
              if (phrase && !dispatchedThisTurn) {
                dispatchedThisTurn = true;
                try {
                  const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
                  const api = `${base.endsWith('/api') ? base : base + '/api'}`;
                  console.log('[VoiceHook][Bypass] Enviando a', `${api}/assistant/ask`, phrase);
                  const res = await fetch(`${api}/assistant/ask`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: phrase }) });
                  const json = await res.json().catch(() => null);
                  const action = json?.datos?.action;
                  if (action?.type === 'navigate' && action?.target) {
                    const params = new URLSearchParams(action.params || {});
                    const targetUrl = `${action.target}${params.toString() ? `?${params.toString()}` : ''}`;
                    console.log('[VoiceHook][Bypass] Navegando a', targetUrl);
                    try { (window as any).electron?.navigation?.navigateTo?.(targetUrl); } catch {}
                    if (!((window as any).electron?.navigation?.navigateTo)) window.location.href = targetUrl;
                  }
                } catch (e) {
                  console.warn('[VoiceHook][Bypass] Error enviando a assistant/ask:', e);
                }
              }
            }
          }
          if (message.serverContent?.outputTranscription) {
            currentOutputTranscription += message.serverContent.outputTranscription.text;
          }
          if (message.serverContent?.turnComplete) {
            if (currentInputTranscription.trim() && !pushedUserThisTurn) setConversation(prev => [...prev, { role: Role.User, text: currentInputTranscription.trim() }]);
            if (currentOutputTranscription.trim()) setConversation(prev => [...prev, { role: Role.Assistant, text: currentOutputTranscription.trim() }]);
            currentInputTranscription = '';
            currentOutputTranscription = '';
            dispatchedThisTurn = false;
            pushedUserThisTurn = false;
            setLiveTranscript('');
            setStatus(CallStatus.Listening);
          }

          const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (base64Audio && outputAudioContextRef.current) {
            setStatus(CallStatus.Speaking);
            const outputCtx = outputAudioContextRef.current;
            if (outputCtx.state === 'suspended') await outputCtx.resume();
            nextStartTime = Math.max(nextStartTime, outputCtx.currentTime);
            const audioBuffer = await decodePcmAudioData(decode(base64Audio), outputCtx, 24000, 1);
            const source = outputCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputCtx.destination);
            source.start(nextStartTime);
            nextStartTime += audioBuffer.duration;
          }
        } else if (msg.type === 'error') {
          console.error('Voice session error:', msg.message);
          setStatus(CallStatus.Error);
          stopCallCleanup();
        } else if (msg.type === 'session_close') {
          if (isCallActiveRef.current) stopCallCleanup();
        }
      };

      ws.onerror = (e) => {
        console.error('WebSocket error:', e);
        setStatus(CallStatus.Error);
        stopCallCleanup();
      };

      ws.onclose = () => {
        if (isCallActiveRef.current) stopCallCleanup();
      };
    } catch (err: any) {
      console.error('Error setting up voice call:', err);
      setStatus(CallStatus.Error);
      
      // Determinar el tipo de error específico
      let errorMessage = 'Se necesita permiso para acceder al micrófono o no es compatible.';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Permiso de micrófono denegado. Por favor, verifica la configuración de permisos del navegador.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No se encontró ningún micrófono. Verifica que tu dispositivo tenga un micrófono conectado.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'El micrófono está siendo usado por otra aplicación. Ciérrala e intenta de nuevo.';
      } else if (err.name === 'SecurityError') {
        errorMessage = 'Error de seguridad. El acceso al micrófono no está permitido en este contexto.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      console.error('Error details:', { name: err.name, message: err.message });
      alert(errorMessage);
      stopCallCleanup();
    }
  }, [stopCallCleanup]);

  const stopCall = useCallback(() => {
    stopCallCleanup();
  }, [stopCallCleanup]);

  return { conversation, status, liveTranscript, isCallActive, startCall, stopCall };
};
