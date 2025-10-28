
import React from 'react';
import { useVoiceCall } from '../hooks/useVoiceCall';
import MessageList from './MessageList';
import MicrophoneButton from './MicrophoneButton';
import { CallStatus } from '../types';

const CallPanel: React.FC = () => {
    const { conversation, status, liveTranscript, isCallActive, startCall, stopCall } = useVoiceCall();

    const getStatusInfo = () => {
        switch (status) {
            case CallStatus.Connecting:
                return { text: 'Conectando...', color: 'text-amber-400', pulse: true };
            case CallStatus.Listening:
                return { text: 'Escuchando...', color: 'text-emerald-400', pulse: true };
            case CallStatus.Processing:
                return { text: 'Procesando...', color: 'text-yellow-400', pulse: false };
            case CallStatus.Speaking:
                return { text: 'Hablando...', color: 'text-amber-400', pulse: false };
            case CallStatus.Error:
                return { text: 'Error en la conexión', color: 'text-red-500', pulse: false };
            default:
                return { text: 'Presiona el micrófono para iniciar', color: 'text-gray-400', pulse: false };
        }
    };
    
    const statusInfo = getStatusInfo();
    const displayTranscript = status === CallStatus.Listening && liveTranscript.trim() !== '';

    return (
        <div className="flex flex-col h-full p-4 md:p-6 text-center">
            <div className="flex-1 overflow-y-auto mb-4">
                {conversation.length > 0 ? (
                    <MessageList messages={conversation} />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-gray-500">
                           <p>El historial de la llamada aparecerá aquí.</p>
                           <p className="text-sm mt-2">{statusInfo.text}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col items-center justify-end space-y-4 flex-shrink-0">
                <div className="h-10">
                    <p className={`text-xl font-medium transition-opacity duration-300 ${statusInfo.color} ${statusInfo.pulse ? 'animate-pulse' : ''}`}>
                        {displayTranscript ? liveTranscript : statusInfo.text}
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
