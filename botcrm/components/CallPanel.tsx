
import React from 'react';
import { useVoiceCall } from '../hooks/useVoiceCall';
import MessageList from './MessageList';
import MicrophoneButton from './MicrophoneButton';
import { CallStatus } from '../types';

const CallPanel: React.FC = () => {
    const { conversation, status, liveTranscript, isCallActive, startCall, stopCall, errorMessage } = useVoiceCall();

    const getStatusInfo = () => {
        switch (status) {
            case CallStatus.CheckingPermission:
                return { text: 'Verificando permisos...', color: 'text-gray-400', pulse: false };
            case CallStatus.RequestingMic:
                return { text: 'Solicitando micrófono...', color: 'text-gray-400', pulse: false };
            case CallStatus.Connecting:
                return { text: 'Conectando...', color: 'text-amber-400', pulse: true };
            case CallStatus.Listening:
                return { text: 'Escuchando...', color: 'text-emerald-400', pulse: true };
            case CallStatus.Processing:
                return { text: 'Procesando...', color: 'text-yellow-400', pulse: false };
            case CallStatus.Speaking:
                return { text: 'Hablando...', color: 'text-amber-400', pulse: false };
            case CallStatus.Error:
                return { text: errorMessage || 'Error en la conexión', color: 'text-red-500', pulse: false };
            default:
                return { text: 'Toca el micrófono para iniciar', color: 'text-gray-400', pulse: false };
        }
    };
    
    const statusInfo = getStatusInfo();
    const displayTranscript = status === CallStatus.Listening && liveTranscript.trim() !== '';
    const statusText = displayTranscript ? liveTranscript : statusInfo.text;

    return (
        <div className="flex flex-col h-full text-center">
            <div className="flex-1 overflow-y-auto mb-4">
                {conversation.length > 0 ? (
                    <MessageList messages={conversation} />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                       <img src="/botdelgado.png" alt="Bot Avatar" className="w-24 h-24 rounded-full mb-6 border-2 border-white/10" />
                       <h2 className="text-2xl font-bold text-white mb-2">Llamada de Voz</h2>
                       <p className="max-w-xs">{isCallActive ? 'El historial de la llamada aparecerá aquí.' : 'Inicia una conversación por voz con el asistente para gestionar tu CRM.'}</p>
                    </div>
                )}
            </div>

            <div className="flex flex-col items-center justify-end space-y-4 flex-shrink-0 p-6 bg-black/50 backdrop-blur-sm border-t border-white/10">
                <div className="h-8">
                    <p className={`text-xl font-medium transition-all duration-300 ${statusInfo.color} ${statusInfo.pulse ? 'animate-pulse' : ''}`}>
                        {statusText}
                    </p>
                </div>
                <MicrophoneButton
                    isActive={isCallActive}
                    isListening={status === CallStatus.Listening}
                    onClick={isCallActive ? stopCall : startCall}
                />
            </div>
        </div>
    );
};

export default CallPanel;