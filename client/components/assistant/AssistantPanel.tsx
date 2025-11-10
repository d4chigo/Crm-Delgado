"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { preguntarAsistente } from '@/services/api/assistant.service';
import { useVoiceCall } from '@/hooks/useVoiceCall';
import MicrophoneButton from '@/components/assistant/MicrophoneButton';
import type { Message as VoiceMsg } from '@/types/assistant.types';
import { CallStatus } from '@/types/assistant.types';
import { MessageCircle, Phone, X, Mic, Activity, Loader2 } from 'lucide-react';

type Tab = 'chat' | 'llamada';
interface Msg { role: 'user' | 'assistant'; text: string }

export default function AssistantPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('chat');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const { conversation, status, liveTranscript, isCallActive, startCall, stopCall } = useVoiceCall();

  const isListeningState = status === CallStatus.Listening;
  const isSpeakingState = status === CallStatus.Speaking;

  // Procesar automáticamente mensajes finales provenientes de la pestaña de voz
  const processedVoiceIdxRef = useRef<Set<number>>(new Set());
  useEffect(() => {
    // Busca nuevos mensajes de usuario en conversation no procesados
    for (let i = 0; i < conversation.length; i++) {
      const m = conversation[i] as any;
      if (m?.role === 'user' && !processedVoiceIdxRef.current.has(i)) {
        processedVoiceIdxRef.current.add(i);
        const q = String(m.text || '').trim();
        if (!q) { continue; }
        try { console.log('[AssistantPanel][VOZ] Mensaje de usuario detectado:', q); } catch {}
        // Mostrar también en el chat
        setMessages(prev => [...prev, { role: 'user', text: q }]);
        (async () => {
          setLoading(true);
          try {
            console.log('[AssistantPanel][VOZ] Enviando a /api/assistant/ask ...');
            const res = await preguntarAsistente(q);
            console.log('[AssistantPanel][VOZ] Respuesta recibida:', res);
            setMessages(prev => [...prev, { role: 'assistant', text: res.answer }]);
            if (res.action?.type === 'navigate' && res.action.target) {
              const params = new URLSearchParams(res.action.params || {});
              router.push(`${res.action.target}${params.toString() ? `?${params.toString()}` : ''}`);
            }
          } catch {
            setMessages(prev => [...prev, { role: 'assistant', text: 'No fue posible obtener la respuesta.' }]);
          } finally {
            setLoading(false);
          }
        })();
      }
    }
  }, [conversation, router]);

  if (!open) return null;

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const q = input.trim();
    if (!q) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setLoading(true);
    try {
      const res = await preguntarAsistente(q);
      setMessages(prev => [...prev, { role: 'assistant', text: res.answer }]);
      // Ejecutar acción si viene del backend
      if (res.action?.type === 'navigate' && res.action.target) {
        const params = new URLSearchParams(res.action.params || {});
        router.push(`${res.action.target}${params.toString() ? `?${params.toString()}` : ''}`);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Ocurrió un error consultando al asistente.' }]);
    } finally {
      setLoading(false);
    }
  }

  async function sendQuick(q: string) {
    if (!q) return;
    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setLoading(true);
    try {
      const res = await preguntarAsistente(q);
      setMessages(prev => [...prev, { role: 'assistant', text: res.answer }]);
      if (res.action?.type === 'navigate' && res.action.target) {
        const params = new URLSearchParams(res.action.params || {});
        router.push(`${res.action.target}${params.toString() ? `?${params.toString()}` : ''}`);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'No fue posible obtener la respuesta.' }]);
    } finally {
      setLoading(false);
    }
  }

  const src = process.env.NEXT_PUBLIC_BOTCRM_URL || '/botcrm/index.html';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end pointer-events-none">
      <div className="m-4 w-full max-w-md pointer-events-auto">
        <div className="relative p-[1.5px] rounded-2xl bg-gradient-to-br from-[#FCBA00] via-[#FFC94D] to-[#303030] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)]">
          {/* Botón de cierre sutil */}
          <button
            onClick={onClose}
            aria-label="Cerrar"
            title="Cerrar"
            className="absolute -top-2 -right-2 z-20 h-7 w-7 rounded-full bg-black/30 text-white flex items-center justify-center opacity-60 hover:opacity-100 backdrop-blur-sm shadow-md"
            style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}
          >
            ×
          </button>
          <div className="rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 max-h-[80vh]">
            <iframe
              title="Asistente Delgado"
              src={src}
              className="w-full h-[70vh]"
              style={{ border: 0 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
