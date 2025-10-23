
import React, { useState } from 'react';
import Header from './components/Header';
import ChatPanel from './components/ChatPanel';
import CallPanel from './components/CallPanel';
import { Tab } from './types';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>(Tab.Chat);

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-[#1c1c1c] to-[#000000] text-gray-100 overflow-hidden">
            <Header activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="flex-1 overflow-y-auto">
                {activeTab === Tab.Chat ? <ChatPanel /> : <CallPanel />}
            </main>
        </div>
    );
};

export default App;
