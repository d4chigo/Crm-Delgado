"use client";
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Send, Loader2, Sparkles, Copy, Check, AlertCircle, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

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
  const [copied, setCopied] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Inicializar reconocimiento de voz
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'es-ES';
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onstart = () => {
          setIsListening(true);
          console.log('[Voz] Grabación iniciada');
        };

        recognitionRef.current.onresult = (event: any) => {
          let transcript = '';
          let isFinal = false;
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              isFinal = true;
            }
          }
          
          setInput(transcript);
          
          if (isFinal) {
            console.log('[Voz] Texto final:', transcript);
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          console.log('[Voz] Grabación finalizada');
        };

        recognitionRef.current.onerror = (event: any) => {
          // Solo loguear en desarrollo, no mostrar error en consola
          if (process.env.NODE_ENV === 'development') {
            console.log('[Voz] Error (ignorado):', event.error);
          }
          setIsListening(false);
          
          // Mostrar mensaje de error amigable SOLO para errores críticos
          let errorMsg = '';
          let showError = false;
          
          if (event.error === 'network') {
            // No mostrar error de red, es muy común en desarrollo
            console.log('[Voz] Error de red (esperado en desarrollo)');
          } else if (event.error === 'no-speech') {
            // No mostrar, es muy común
            console.log('[Voz] No se detectó voz');
          } else if (event.error === 'not-allowed') {
            errorMsg = '⚠️ Permiso de micrófono denegado. Habilítalo en configuración.';
            showError = true;
          } else if (event.error === 'service-not-allowed') {
            errorMsg = '⚠️ El servicio de voz no está disponible en tu región.';
            showError = true;
          }
          
          if (showError) {
            setMessages(prev => [...prev, {
              role: 'assistant',
              text: errorMsg,
              timestamp: new Date()
            }]);
          }
        };
      }
    }
  }, []);

  function startListening() {
    if (recognitionRef.current && !isListening) {
      setInput('');
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error al iniciar grabación:', error);
      }
    }
  }

  function stopListening() {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error al detener grabación:', error);
      }
    }
  }

  function speakText(text: string) {
    if (!voiceEnabled) return;

    // Limpiar síntesis anterior
    window.speechSynthesis.cancel();

    // Limpiar texto para lectura natural
    let cleanText = text
      .replace(/\*\*/g, '')
      .replace(/• /g, '')
      .replace(/👋|📊|💰|📈|👥|📞|❌|📞|⚠️|✅|❌|📄|📞|🎤|🔊|💡/g, '')
      .replace(/\n\n/g, '. ') // Párrafos a puntos
      .replace(/\n/g, ' ') // Saltos de línea a espacios
      .trim();

    // Dividir en oraciones para lectura más natural
    const sentences = cleanText.split(/(?<=[.!?])\s+/);
    
    // Procesar cada oración con pequeños delays
    sentences.forEach((sentence, index) => {
      if (!sentence.trim()) return;
      
      const utterance = new SpeechSynthesisUtterance(sentence.trim());
      utterance.lang = 'es-ES';
      
      // Configuración para voz fluida como Google Assistant
      utterance.rate = 1.0; // Velocidad natural
      utterance.pitch = 1.1; // Ligeramente más agudo (femenino)
      utterance.volume = 1;
      
      // Intentar obtener voz femenina de Google
      const voices = window.speechSynthesis.getVoices();
      
      // Prioridad: Google Spanish Female > Spanish Female > Spanish
      const googleFemaleVoice = voices.find(v => 
        v.lang === 'es-ES' && v.name.includes('Google') && (v.name.includes('female') || v.name.includes('mujer'))
      );
      const femaleVoice = voices.find(v => 
        v.lang === 'es-ES' && (v.name.includes('female') || v.name.includes('mujer'))
      );
      const spanishVoice = voices.find(v => v.lang === 'es-ES');
      
      const selectedVoice = googleFemaleVoice || femaleVoice || spanishVoice;
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      if (index === 0) {
        utterance.onstart = () => {
          setIsSpeaking(true);
        };
      }

      if (index === sentences.length - 1) {
        utterance.onend = () => {
          setIsSpeaking(false);
        };
      }

      utterance.onerror = (event) => {
        console.log('[Síntesis] Error:', event.error);
        setIsSpeaking(false);
      };

      // Agregar pequeño delay entre oraciones para naturalidad
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, index * 100);
    });
  }

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
      
      // Hablar la respuesta automáticamente con pequeño delay
      setTimeout(() => speakText(answer), 800);
    } catch (error: any) {
      console.error('[Chat] Error:', error);
      const errorMsg = 'Disculpa, tuve un problema procesando tu pregunta. Intenta de nuevo.';
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: errorMsg,
        timestamp: new Date()
      }]);
      setTimeout(() => speakText(errorMsg), 800);
    } finally {
      setLoading(false);
    }
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
    <div className="flex flex-col w-full bg-gradient-to-b from-slate-50 to-slate-100 rounded-2xl shadow-2xl overflow-hidden" style={{ height: '600px' }}>
      {/* Header Premium - FIJO */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 p-5 text-white shadow-xl flex-shrink-0">
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
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`${voiceEnabled ? 'bg-white/30' : 'bg-red-500/50'} hover:bg-white/40 text-white p-2.5 rounded-full transition-all shadow-lg hover:shadow-xl flex-shrink-0 backdrop-blur`}
            title={voiceEnabled ? 'Desactivar voz' : 'Activar voz'}
          >
            {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Messages - Scrollable */}
      <div className="messages-container flex-1 overflow-y-scroll overflow-x-hidden p-4 space-y-3 scroll-smooth" style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#fbbf24 #f3f4f6',
        flex: '1 1 auto',
        minHeight: '0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
            <div
              className={`max-w-sm px-4 py-3 rounded-2xl text-sm leading-relaxed break-words transition-all ${
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

      {/* Input - FIJO */}
      <div className="sticky bottom-0 z-40 border-t border-gray-300 p-4 bg-white flex-shrink-0 shadow-lg">
        <form onSubmit={handleSend} className="flex gap-2">
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            disabled={loading}
            className={`${
              isListening
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-blue-500 hover:bg-blue-600'
            } disabled:opacity-50 text-white p-2.5 rounded-full transition-all shadow-md hover:shadow-lg disabled:shadow-none flex-shrink-0`}
            title={isListening ? 'Detener grabación' : 'Iniciar grabación de voz'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? '🎤 Escuchando...' : 'Pregunta algo...'}
            disabled={loading}
            className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 bg-gray-50 hover:bg-white transition-all shadow-sm"
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
        <p className="text-xs text-gray-500 mt-1.5 text-center">
          🎤 Voz • 🔊 Audio • 💡 Análisis de CRM
        </p>
      </div>
    </div>
  );
}
