
import React, { useState, useRef, KeyboardEvent } from 'react';
import { SendIcon } from './icons/SendIcon';

interface ChatInputProps {
    onSendMessage: (text: string) => void;
    isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
    const [text, setText] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = () => {
        if (text.trim() && !isLoading) {
            onSendMessage(text);
            setText('');
            if (textareaRef.current) {
               textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${e.target.scrollHeight}px`;
        }
    };

    return (
        <div className="bg-gray-900 p-2 rounded-2xl shadow-inner flex items-center w-full max-w-4xl mx-auto border border-gray-700 focus-within:border-amber-400 transition-colors">
            <textarea
                ref={textareaRef}
                value={text}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu consulta aquí..."
                rows={1}
                className="w-full bg-transparent p-2 text-gray-200 resize-none focus:outline-none placeholder-gray-500 max-h-48"
                disabled={isLoading}
            />
            <button
                onClick={handleSend}
                disabled={isLoading || !text.trim()}
                className="ml-2 p-3 rounded-full bg-amber-500 text-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all transform hover:scale-105"
                aria-label="Enviar mensaje"
            >
               <SendIcon />
            </button>
        </div>
    );
};

export default ChatInput;
