import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import ChatPanel from './components/ChatPanel';
import CallPanel from './components/CallPanel';
import { Tab } from './types';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>(Tab.Chat);
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        try {
            const saved = localStorage.getItem('bot_theme');
            return (saved === 'light' || saved === 'dark') ? saved : 'dark';
        } catch {
            return 'dark';
        }
    });

    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
        try { localStorage.setItem('bot_theme', theme); } catch {}
    }, [theme]);

    return (
        <div className="h-screen w-screen p-0 md:p-4 flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
            <div className="flex flex-col h-full w-full max-w-5xl mx-auto md:rounded-3xl overflow-hidden shadow-2xl" style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--panel-border)' }}>
                <Header activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} />
                <main className="flex-1 overflow-y-auto">
                    {activeTab === Tab.Chat ? <ChatPanel /> : <CallPanel />}
                </main>
            </div>
        </div>
    );
};

export default App;