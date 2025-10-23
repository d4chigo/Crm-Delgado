"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { preguntarAsistente } from '@/services/api/assistant.service';
import { useVoiceCall } from '@/hooks/useVoiceCall';
import MicrophoneButton from '@/components/assistant/MicrophoneButton';
import type { Message as VoiceMsg, CallStatus } from '@/types/assistant.types';
import { MessageCircle, Phone, X, Mic, Activity, Loader2 } from 'lucide-react';

type Tab = 'chat' | 'llamada';
interface Msg { role: 'user' | 'assistant'; text: string }

export default function AssistantPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('chat');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const { conversation, status, liveTranscript, isCallActive, startCall, stopCall } = useVoiceCall();

  const isListeningState = status === ("ESCUCHANDO..." as unknown as CallStatus);
  const isSpeakingState = status === ("HABLANDO..." as unknown as CallStatus);

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
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'No fue posible obtener la respuesta.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end pointer-events-none">
      <div className="m-4 w-full max-w-md pointer-events-auto">
        <div className="p-[1.5px] rounded-2xl bg-gradient-to-br from-[#FCBA00] via-[#FFC94D] to-[#303030] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)]">
          <div className="rounded-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="px-4 py-3 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-[#FCBA00]/70 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900">
                  {(isListeningState || isSpeakingState || isCallActive) && (
                    <div className="absolute -inset-1 rounded-full bg-[#FCBA00]/30 blur-md animate-pulse" />
                  )}
                  <Image src="/botdelgado.png" alt="Bot Delgado" fill sizes="36px" className="object-cover relative" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="font-semibold text-[#303030] dark:text-white">Asistente Delgado</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FCBA00]/20 text-[#303030] w-fit">beta</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setTab('chat')}
                  className={`p-2 rounded-md transition ${tab==='chat' ? 'bg-[#FCBA00] text-[#303030]' : 'text-muted-foreground hover:bg-muted'}`}
                  aria-label="Chat"
                  title="Chat"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTab('llamada')}
                  className={`p-2 rounded-md transition ${tab==='llamada' ? 'bg-[#FCBA00] text-[#303030]' : 'text-muted-foreground hover:bg-muted'}`}
                  aria-label="Voz"
                  title="Voz"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button onClick={onClose} className="p-2 rounded-md text-muted-foreground hover:bg-muted" aria-label="Cerrar" title="Cerrar">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2 border-b border-black/5 dark:border-white/10 flex gap-2 flex-wrap">
              <button onClick={() => sendQuick('¿Cuántos leads tenemos y cuántos se crearon este mes?')} className="text-xs px-2 py-1 rounded-full bg-[#FCBA00]/25 text-[#303030] hover:bg-[#FCBA00]/35 transition">Leads</button>
              <button onClick={() => sendQuick('¿Cuál es el valor total ganado y el número de oportunidades ganadas?')} className="text-xs px-2 py-1 rounded-full bg-[#FCBA00]/25 text-[#303030] hover:bg-[#FCBA00]/35 transition">Valor ganado</button>
              <button onClick={() => sendQuick('¿Estado de las oportunidades por etapa?')} className="text-xs px-2 py-1 rounded-full bg-[#FCBA00]/25 text-[#303030] hover:bg-[#FCBA00]/35 transition">Etapas</button>
              <button onClick={() => sendQuick('¿Top proyectos por ventas este año?')} className="text-xs px-2 py-1 rounded-full bg-[#FCBA00]/25 text-[#303030] hover:bg-[#FCBA00]/35 transition">Top proyectos</button>
            </div>

            {/* Body */}
            {tab === 'chat' ? (
              <>
                <div className="p-4 space-y-3 overflow-auto grow">
                  {messages.map((m, i) => (
                    <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                      <div
                        className={`inline-block px-3 py-2 rounded-2xl text-sm shadow ${
                          m.role === 'user'
                            ? 'bg-gradient-to-br from-[#FCBA00] to-[#FFC94D] text-[#303030]'
                            : 'bg-white/70 dark:bg-neutral-800/70 border border-black/5 dark:border-white/10 text-foreground'
                        }`}
                        dangerouslySetInnerHTML={{ __html: m.text.replace(/\n/g, '<br/>') }}
                      />
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSend} className="p-3 border-t border-black/5 dark:border-white/10 flex gap-2">
                  <input
                    className="flex-1 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white/70 dark:bg-neutral-900/70 focus:outline-none focus:ring-2 focus:ring-[#FCBA00]"
                    placeholder="Escribe tu pregunta..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-3 py-2 rounded-lg bg-[#FCBA00] text-[#303030] font-medium disabled:opacity-60 flex items-center gap-2 shadow hover:shadow-md transition"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col h-full">
                <div className="p-4 overflow-auto grow space-y-3">
                  {conversation.map((m: VoiceMsg, i: number) => (
                    <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                      <div
                        className={`inline-block px-3 py-2 rounded-2xl text-sm shadow ${
                          m.role === 'user'
                            ? 'bg-gradient-to-br from-[#FCBA00] to-[#FFC94D] text-[#303030]'
                            : 'bg-white/70 dark:bg-neutral-800/70 border border-black/5 dark:border-white/10 text-foreground'
                        }`}
                        dangerouslySetInnerHTML={{ __html: m.text.replace(/\n/g, '<br/>') }}
                      />
                    </div>
                  ))}
                  <div className="flex items-center gap-2 flex-wrap">
                    {status && (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted">
                        <Activity className="w-3 h-3" /> {String(status)}
                      </span>
                    )}
                    {liveTranscript && (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted/70">
                        <Mic className="w-3 h-3" /> {liveTranscript.length > 28 ? `${liveTranscript.slice(0,28)}…` : liveTranscript}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4 border-t border-black/5 dark:border-white/10 flex items-center justify-center">
                  <MicrophoneButton
                    isActive={isCallActive}
                    isListening={isListeningState}
                    onClick={isCallActive ? stopCall : startCall}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
