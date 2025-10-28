
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
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300
                    ${isActive
                        ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                        : 'bg-transparent text-gray-300 hover:bg-white/10'
                    }`}
            >
                {icon}
                <span>{label}</span>
            </button>
        );
    };

    return (
        <header className="bg-black/50 backdrop-blur-sm border-b border-amber-500/20 shadow-2xl p-4 flex justify-between items-center z-10 flex-shrink-0">
            <div className="flex items-center space-x-3">
                 <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path></svg>
                <h1 className="text-xl font-bold text-white tracking-wide">Delgado Propiedades AI</h1>
            </div>
            <div className="flex space-x-2 p-1 bg-black/30 rounded-lg">
                <TabButton tab={Tab.Chat} label="Chat de Texto" icon={<ChatIcon />} />
                <TabButton tab={Tab.Call} label="Llamada de Voz" icon={<CallIcon />} />
            </div>
        </header>
    );
};

export default Header;
