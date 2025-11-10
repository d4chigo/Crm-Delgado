"use client";
import React from 'react';
import { Mic, PhoneOff } from 'lucide-react';

interface MicrophoneButtonProps {
  isActive: boolean;
  isListening: boolean;
  onClick?: () => void;
  onStart?: () => void;
  onStop?: () => void;
}

export default function MicrophoneButton({ isActive, isListening, onClick, onStart, onStop }: MicrophoneButtonProps) {
  const baseClasses = "w-16 h-16 md:w-18 md:h-18 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out transform focus:outline-none";
  const gradientIdle = "bg-[radial-gradient(ellipse_at_center,rgba(252,186,0,0.95),rgba(48,48,48,0.9))]";
  const gradientActive = "bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.95),rgba(48,48,48,0.9))]";
  const ringClasses = isActive
    ? "ring-2 ring-red-400/70 shadow-[0_0_25px_rgba(239,68,68,0.55)]"
    : "ring-2 ring-[#FCBA00]/70 shadow-[0_0_25px_rgba(252,186,0,0.45)]";

  const handleClick = () => {
    console.log('MicrophoneButton clicked, isActive:', isActive);
    // Preferir control explícito si se provee
    if (onStart || onStop) {
      if (isActive || isListening) {
        onStop && onStop();
      } else {
        onStart && onStart();
      }
      return;
    }
    // Compatibilidad hacia atrás
    onClick && onClick();
  };

  return (
    <div className="relative">
      {isListening && (
        <div className="absolute inset-0 rounded-full blur-md opacity-70 animate-pulse bg-[#FCBA00]/40" />
      )}
      <button
        onClick={handleClick}
        className={`${baseClasses} ${isActive ? gradientActive : gradientIdle} ${ringClasses}`}
        aria-label={isActive ? 'Detener voz' : 'Iniciar voz'}
        title={isActive ? 'Detener voz' : 'Iniciar voz'}
      >
        {isActive ? (
          <PhoneOff className="w-7 h-7 text-white" />
        ) : (
          <Mic className="w-7 h-7 text-white" />
        )}
      </button>
    </div>
  );
}
