
import React from 'react';
import { Message, Role } from '../types';
import { marked } from 'marked';
import { AssistantAvatar } from './icons/AssistantAvatar';

interface MessageListProps {
    messages: Message[];
}

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const isUser = message.role === Role.User;
    
    const bubbleClasses = isUser
        ? 'bg-amber-400 text-black self-end rounded-br-none'
        : 'bg-gray-800 text-white self-start rounded-bl-none';

    const createMarkup = (text: string) => {
        const sanitizedText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const rawMarkup = marked.parse(sanitizedText, { gfm: true, breaks: true });
        // Adjust prose styles for user messages with black text
        const finalMarkup = isUser
            ? (rawMarkup as string).replace(/<p>/g, '<p style="color: black;">').replace(/<li>/g, '<li style="color: black;">')
            : rawMarkup;
        return { __html: finalMarkup as string };
    };

    return (
        <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-end space-x-3 max-w-xl lg:max-w-2xl ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                 {!isUser && (
                    <div className="flex-shrink-0">
                        <AssistantAvatar />
                    </div>
                )}
                <div
                    className={`px-5 py-3 rounded-2xl shadow-md transition-all duration-300 ${bubbleClasses}`}
                >
                    <div
                        className={`prose ${isUser ? '' : 'prose-invert'} prose-sm md:prose-base prose-p:my-2 prose-headings:my-3`}
                        dangerouslySetInnerHTML={createMarkup(message.text)}
                    />
                </div>
            </div>
        </div>
    );
};


const MessageList: React.FC<MessageListProps> = ({ messages }) => {
    return (
        <div className="flex-1 space-y-6 overflow-y-auto px-2">
            {messages.map((msg, index) => (
                <MessageBubble key={index} message={msg} />
            ))}
        </div>
    );
};

export default MessageList;
