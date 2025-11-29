"use client";
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Send, Loader2, Sparkles, Phone, Copy, Check, AlertCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp?: Date;
  isMarkdown?: boolean;
}

export default function ChatbotWidget() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: '👋 **Hola, soy el Asistente Inteligente de Delgado Propiedades**\n\nPuedo ayudarte con:\n• 📊 Análisis de CRM y estadísticas\n• 💰 Recomendaciones de ventas\n• 📈 Insights de marketing\n• 👥 Información de leads y clientes\n• 📞 Gestión de contactos\n\n¿Qué necesitas hoy?',
      timestamp: new Date(),
      isMarkdown: true
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: q, timestamp: new Date() }]);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/assistant/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q })
      });

      if (!response.ok) throw new Error('Error en la respuesta');
      const data = await response.json();
      const answer = data.datos?.answer || data.answer || 'No pude procesar tu pregunta.';
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: answer,
        timestamp: new Date(),
        isMarkdown: true
      }]);
    } catch (error: any) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: '❌ Lo siento, ocurrió un error. Por favor intenta de nuevo.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleCall() {
    setIsCalling(true);
    // Simular llamada
    setTimeout(() => {
      setIsCalling(false);
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: '📞 **Llamada iniciada**\n\nTe conectaré con un agente disponible. Por favor espera...',
        timestamp: new Date()
      }]);
    }, 2000);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function renderMessage(text: string): React.ReactNode {
    // Convertir markdown básico a elementos React
    const lines = text.split('\n');
    return (
      <div className="space-y-2">
        {lines.map((line, idx) => {
          if (line.startsWith('• ')) {
            return (
              <div key={idx} className="flex gap-2 ml-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>{line.substring(2)}</span>
              </div>
            );
          }
          if (line.startsWith('**') && line.endsWith('**')) {
            return <div key={idx} className="font-bold text-gray-900">{line.slice(2, -2)}</div>;
          }
          return line ? <div key={idx}>{line}</div> : null;
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-[85vh] bg-gradient-to-b from-slate-50 to-slate-100 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header Premium */}
      <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 p-5 text-white shadow-xl flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/20 backdrop-blur border-2 border-white/30 shadow-lg">
              <Image 
                src="/botdelgado.png" 
                alt="Delgado Bot" 
                fill 
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Asistente Inteligente
              </h3>
              <p className="text-xs opacity-90">Análisis en tiempo real • Disponible 24/7</p>
            </div>
          </div>
          <button
            onClick={handleCall}
            disabled={isCalling}
            className="bg-white/20 hover:bg-white/30 disabled:opacity-50 text-white p-2.5 rounded-full transition-all shadow-lg hover:shadow-xl flex-shrink-0 backdrop-blur"
            title="Llamar a un agente"
          >
            <Phone className={`w-5 h-5 ${isCalling ? 'animate-pulse' : ''}`} />
          </button>
        </div>
      </div>

      {/* Messages - Scrollable */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0 scrollbar-thin scrollbar-thumb-amber-300 scrollbar-track-transparent">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
            <div
              className={`max-w-md px-5 py-4 rounded-2xl text-sm leading-relaxed break-words transition-all ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-br-none shadow-lg hover:shadow-xl'
                  : 'bg-white text-gray-800 rounded-bl-none shadow-md border border-gray-200 hover:shadow-lg'
              }`}
            >
              {msg.isMarkdown ? renderMessage(msg.text) : <p className="whitespace-pre-wrap">{msg.text}</p>}
              {msg.timestamp && (
                <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                  {msg.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-fadeIn">
            <div className="bg-white text-gray-800 px-5 py-4 rounded-2xl rounded-bl-none shadow-md border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-700">Analizando datos...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-300 p-5 bg-white flex-shrink-0 shadow-lg">
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregunta sobre leads, ventas, estadísticas, análisis..."
            disabled={loading}
            className="flex-1 px-5 py-3 border-2 border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 bg-gray-50 hover:bg-white transition-all shadow-sm"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white p-3 rounded-full transition-all shadow-lg hover:shadow-xl disabled:shadow-none flex-shrink-0 font-bold"
            title="Enviar mensaje"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2 text-center">
          💡 Tip: Pregunta sobre análisis de CRM, leads, ventas o estadísticas
        </p>
      </div>
    </div>
  );
}
