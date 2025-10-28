
import React from 'react';

interface MicrophoneButtonProps {
    isActive: boolean;
    isListening: boolean;
    onClick: () => void;
}

const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({ isActive, isListening, onClick }) => {
    const baseClasses = "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out transform focus:outline-none focus:ring-4";
    const activeClasses = isActive 
        ? 'bg-red-500 hover:bg-red-600 focus:ring-red-400 shadow-lg shadow-red-500/50' 
        : 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-400 shadow-lg shadow-amber-500/50';
    
    const iconColor = isActive ? 'text-white' : 'text-black';

    return (
        <div className="relative">
            {isListening && (
                <>
                    <div className="absolute inset-0 bg-emerald-400/50 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 bg-emerald-400/30 rounded-full animate-ping delay-500"></div>
                </>
            )}
            <button
                onClick={onClick}
                className={`${baseClasses} ${activeClasses} relative`}
                aria-label={isActive ? 'Detener llamada' : 'Iniciar llamada'}
            >
                <svg className={`w-12 h-12 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    {isActive ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                    )}
                </svg>
            </button>
        </div>
    );
};

export default MicrophoneButton;
