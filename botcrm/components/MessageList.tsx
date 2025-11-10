import React from 'react';
import { Message, Role } from '../types';
import { marked } from 'marked';
import { AssistantAvatar } from './icons/AssistantAvatar';

interface MessageListProps {
    messages: Message[];
}

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const isUser = message.role === Role.User;
    
    const bubbleBase = 'self-end rounded-br-none';
    const bubbleOther = 'self-start rounded-bl-none';

    const createMarkup = (text: string) => {
        const sanitizedText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const rawMarkup = marked.parse(sanitizedText, { gfm: true, breaks: true });
        
        if (isUser && typeof rawMarkup === 'string') {
           return { __html: rawMarkup.replace(/<p>|<ul>|<ol>|<li>|<h[1-6]>/g, (match) => `${match.slice(0, -1)} style="color: black;">`) };
        }
        return { __html: rawMarkup as string };
    };

    return (
        <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-end space-x-3 max-w-xl lg:max-w-3xl ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                 {!isUser && <AssistantAvatar />}
                <div
                    className={`px-5 py-3 rounded-2xl shadow-md transition-all duration-300 ${isUser ? bubbleBase : bubbleOther}`}
                    style={{
                        backgroundColor: isUser ? 'var(--bubble-user)' : 'var(--bubble-assistant)',
                        color: isUser ? 'var(--accent-contrast)' : 'var(--text)'
                    }}
                >
                    <div
                        className={`prose prose-sm md:prose-base prose-p:my-2 prose-headings:my-3`}
                        dangerouslySetInnerHTML={createMarkup(message.text)}
                    />
                </div>
            </div>
        </div>
    );
};


const MessageList: React.FC<MessageListProps> = ({ messages }) => {
    return (
        <div className="flex-1 space-y-6 overflow-y-auto px-4 pt-4">
            {messages.map((msg, index) => (
                <MessageBubble key={index} message={msg} />
            ))}
        </div>
    );
};

export default MessageList;