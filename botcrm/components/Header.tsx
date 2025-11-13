import React from 'react';
import { Tab } from '../types';
import { ChatIcon } from './icons/ChatIcon';
import { CallIcon } from './icons/CallIcon';

interface HeaderProps {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, theme, onToggleTheme }) => {
    const TabButton: React.FC<{ tab: Tab; label: string; icon: React.ReactNode }> = ({ tab, label, icon }) => {
        const isActive = activeTab === tab;
        return (
            <button
                onClick={() => setActiveTab(tab)}
                className={"flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 border"}
                style={{
                    backgroundColor: isActive ? 'var(--bubble-assistant)' : 'transparent',
                    color: 'var(--text)',
                    borderColor: 'var(--panel-border)'
                }}
            >
                {icon}
                <span>{label}</span>
            </button>
        );
    };

    return (
        <header className="backdrop-blur-md p-4 flex justify-between items-center z-10 flex-shrink-0" style={{ borderBottom: '1px solid var(--panel-border)', backgroundColor: 'transparent' }}>
            <div className="flex items-center space-x-3">
                 <img src="/logodelgado.png" alt="Delgado Propiedades Logo" className="h-9 w-auto" />
                <h1 className="text-xl font-bold tracking-wide hidden sm:block" style={{ color: 'var(--text)' }}>Delgado Propiedades AI</h1>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex space-x-1 p-1 rounded-full border" style={{ backgroundColor: 'transparent', borderColor: 'var(--panel-border)' }}>
                    <TabButton tab={Tab.Chat} label="Chat" icon={<ChatIcon />} />
                    <TabButton tab={Tab.Call} label="Llamada" icon={<CallIcon />} />
                </div>
                <button onClick={onToggleTheme} className="ml-2 px-3 py-2 rounded-full text-sm font-medium border transition-colors" style={{ borderColor: 'var(--panel-border)', color: 'var(--text)', backgroundColor: 'transparent' }} aria-label="Cambiar tema">
                    {theme === 'dark' ? '☀️ Claro' : '🌙 Oscuro'}
                </button>
            </div>
        </header>
    );
};

export default Header;