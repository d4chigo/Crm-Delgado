"use client";
import React from 'react';
import Image from 'next/image';

export default function AssistantFab({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 rounded-full p-[3px] bg-gradient-to-br from-[#FCBA00] via-[#FFC94D] to-[#303030] shadow-[0_12px_30px_rgba(0,0,0,0.35)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.45)] transition-transform hover:scale-105 focus:outline-none"
      aria-label="Abrir asistente"
      title="Asistente Delgado"
    >
      <span className="sr-only">Abrir asistente</span>
      <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-white/90 backdrop-blur">
        <Image src="/botdelgado.png" alt="Asistente Delgado" fill sizes="(max-width: 768px) 64px, 80px" className="object-cover" />
      </div>
    </button>
  );
}
