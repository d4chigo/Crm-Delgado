"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, X } from 'lucide-react';

export default function ChatbotWidget() {
  const [iframeReady, setIframeReady] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (isExpanded) {
      setIframeReady(true);
    }
  }, [isExpanded]);

  const botcrmUrl = process.env.NEXT_PUBLIC_BOTCRM_URL || '/botcrm/index.html';

  return (
    <div className="w-full">
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full p-4 rounded-lg border-2 border-dashed border-[#FCBA00] bg-[#FCBA00]/5 hover:bg-[#FCBA00]/10 transition-all duration-200 flex items-center justify-center gap-2 text-[#FCBA00] font-semibold hover:shadow-lg hover:shadow-[#FCBA00]/20"
        >
          <MessageCircle className="w-5 h-5" />
          Abrir Asistente de IA
        </button>
      ) : (
        <Card className="border-border overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-bold text-[#303030] flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[#FCBA00]" />
              Asistente Delgado
            </CardTitle>
            <button
              onClick={() => {
                setIsExpanded(false);
                setIframeReady(false);
              }}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </CardHeader>
          <CardContent className="p-0">
            {iframeReady && (
              <iframe
                title="Asistente Delgado Propiedades"
                src={botcrmUrl}
                className="w-full h-[600px]"
                style={{ border: 0 }}
                allow="microphone; autoplay; clipboard-read; clipboard-write"
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
