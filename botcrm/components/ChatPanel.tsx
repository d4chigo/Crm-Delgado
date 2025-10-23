
import React, { useState, useRef, useEffect } from 'react';
import { Message, Role } from '../types';
import { getChatResponse } from '../services/geminiService';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-2 p-4">
        <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
        <span className="ml-2 text-gray-400 text-sm">El asistente está escribiendo...</span>
    </div>
);


const ChatPanel: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);
    
    useEffect(() => {
        setMessages([{
            role: Role.Assistant,
            text: "Hola, soy el asistente de **Delgado Propiedades**. ¿En qué puedo ayudarte hoy a analizar tus datos?"
        }]);
    }, []);

    const handleSendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const newMessages: Message[] = [...messages, { role: Role.User, text }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const responseText = await getChatResponse(messages, text);
            setMessages(prev => [...prev, { role: Role.Assistant, text: responseText }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: Role.Assistant, text: "Hubo un error al contactar al asistente." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full p-4 md:p-6 space-y-4">
            <MessageList messages={messages} />
            <div ref={messagesEndRef} />
             {isLoading && <TypingIndicator />}
            <div className="mt-auto">
              <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            </div>
        </div>
    );
};

export default ChatPanel;
