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
            if (textareaRef.current.scrollHeight < 192) {
                 textareaRef.current.style.height = `${e.target.scrollHeight}px`;
            } else {
                 textareaRef.current.style.height = '192px';
            }
        }
    };

    return (
        <div
            className="p-2 rounded-2xl flex items-end w-full max-w-4xl mx-auto border transition-colors"
            style={{ backgroundColor: 'var(--panel)', borderColor: 'var(--panel-border)' }}
        >
            <textarea
                ref={textareaRef}
                value={text}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu consulta aquí..."
                rows={1}
                className="w-full bg-transparent p-2 resize-none focus:outline-none max-h-48"
                style={{ color: 'var(--text)' }}
                disabled={isLoading}
            />
            <button
                onClick={handleSend}
                disabled={isLoading || !text.trim()}
                className="ml-2 flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none transition-all transform hover:scale-110"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)' }}
                aria-label="Enviar mensaje"
            >
               <SendIcon />
            </button>
        </div>
    );
};

export default ChatInput;