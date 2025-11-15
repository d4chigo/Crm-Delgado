import React from 'react';
import { Tab } from '../types';
import { ChatIcon } from './icons/ChatIcon';
import { CallIcon } from './icons/CallIcon';

interface HeaderProps {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
    const TabButton: React.FC<{ tab: Tab; label: string; icon: React.ReactNode }> = ({ tab, label, icon }) => {
        const isActive = activeTab === tab;
        return (
            <button
                onClick={() => setActiveTab(tab)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300
                    ${isActive
                        ? 'bg-gray-200 text-black'
                        : 'bg-transparent text-gray-300 hover:bg-white/10'
                    }`}
            >
                {icon}
                <span>{label}</span>
            </button>
        );
    };

    return (
        <header className="bg-black/50 backdrop-blur-md border-b border-white/10 p-4 flex justify-between items-center z-10 flex-shrink-0">
            <div className="flex items-center space-x-3">
                 <img src="/logodelgado.png" alt="Delgado Propiedades Logo" className="h-9 w-auto" />
                <h1 className="text-xl font-bold text-white tracking-wide hidden sm:block">Delgado Propiedades AI</h1>
            </div>
            <div className="flex space-x-1 p-1 bg-gray-800/60 rounded-full border border-white/10">
                <TabButton tab={Tab.Chat} label="Chat" icon={<ChatIcon />} />
                <TabButton tab={Tab.Call} label="Llamada" icon={<CallIcon />} />
            </div>
        </header>
    );
};

export default Header;