import React, { useState } from 'react';
import Header from './components/Header';
import ChatPanel from './components/ChatPanel';
import CallPanel from './components/CallPanel';
import { Tab } from './types';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>(Tab.Chat);

    return (
        <div className="h-screen w-screen p-0 md:p-4 bg-[#0d0d0d] flex items-center justify-center">
            <div className="flex flex-col h-full w-full max-w-5xl mx-auto bg-black md:rounded-3xl shadow-2xl shadow-black/50 overflow-hidden border border-white/10">
                <Header activeTab={activeTab} setActiveTab={setActiveTab} />
                <main className="flex-1 overflow-y-auto">
                    {activeTab === Tab.Chat ? <ChatPanel /> : <CallPanel />}
                </main>
            </div>
        </div>
    );
};

export default App;