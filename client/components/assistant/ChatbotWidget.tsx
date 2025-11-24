"use client";
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Send, Loader2, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export default function ChatbotWidget() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'Hola 👋 Soy el asistente de Delgado Propiedades. Puedo ayudarte con análisis de CRM, estadísticas de ventas y recomendaciones. ¿Qué necesitas?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
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
    setMessages(prev => [...prev, { role: 'user', text: q }]);
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
      setMessages(prev => [...prev, { role: 'assistant', text: answer }]);
    } catch (error: any) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'Lo siento, ocurrió un error. Por favor intenta de nuevo.'
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen max-h-[80vh] bg-gradient-to-b from-white to-gray-50">
      {/* Header Premium */}
      <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 p-4 text-white shadow-lg flex-shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white/20 backdrop-blur">
            <Image 
              src="/botdelgado.png" 
              alt="Delgado Bot" 
              fill 
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="font-bold text-sm flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              Asistente Delgado
            </h3>
            <p className="text-xs opacity-90">Análisis inteligente de CRM</p>
          </div>
        </div>
      </div>

      {/* Messages - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs px-4 py-3 rounded-2xl text-sm leading-relaxed break-words ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-br-none shadow-md'
                  : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                <span className="text-sm">Analizando...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregunta sobre leads, ventas, estadísticas..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 bg-gray-50 transition-all"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white p-2.5 rounded-full transition-all shadow-md hover:shadow-lg disabled:shadow-none flex-shrink-0"
            title="Enviar mensaje"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
