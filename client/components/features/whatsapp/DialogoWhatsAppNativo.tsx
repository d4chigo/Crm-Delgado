'use client';

import React, { memo, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DialogoWhatsAppNativoProps {
  abierto: boolean;
  onCerrar: () => void;
  mensaje: string;
  onMensajeChange: (mensaje: string) => void;
  telefono: string | null;
  onEnviar: () => void;
  titulo?: string;
}

const DialogoWhatsAppNativo = memo(({
  abierto,
  onCerrar,
  mensaje,
  onMensajeChange,
  telefono,
  onEnviar,
  titulo = 'Enviar mensaje por WhatsApp'
}: DialogoWhatsAppNativoProps) => {
  const { toast } = useToast();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Controlar apertura/cierre con dialog nativo
  useEffect(() => {
    if (abierto && dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
      // Focus al textarea
      setTimeout(() => textareaRef.current?.focus(), 100);
    } else if (!abierto && dialogRef.current && dialogRef.current.open) {
      dialogRef.current.close();
    }
  }, [abierto]);

  const handleCopiar = useCallback(() => {
    navigator.clipboard.writeText(mensaje);
    toast({ title: 'Copiado', description: 'Mensaje copiado al portapapeles.' });
  }, [mensaje, toast]);

  const handleTexareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onMensajeChange(e.target.value);
  }, [onMensajeChange]);

  const handleDialogClose = useCallback(() => {
    onCerrar();
  }, [onCerrar]);

  return (
    <dialog
      ref={dialogRef}
      onClose={handleDialogClose}
      className="w-full max-w-md rounded-lg shadow-lg backdrop:bg-black/50 p-0"
    >
      <div className="bg-white rounded-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-green-600" />
            <h2 className="font-semibold text-lg">{titulo}</h2>
          </div>
          <button
            onClick={handleDialogClose}
            className="p-1 hover:bg-gray-100 rounded transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-3">
          <label className="block text-sm text-gray-600">Mensaje</label>
          <textarea
            ref={textareaRef}
            className="w-full border rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FCBA00] resize-none"
            rows={6}
            value={mensaje}
            onChange={handleTexareaChange}
            placeholder="Escribe tu mensaje..."
            spellCheck="false"
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-6 border-t bg-gray-50">
          <Button 
            variant="outline" 
            onClick={handleCopiar}
            size="sm"
          >
            Copiar
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={onEnviar}
            size="sm"
          >
            Abrir WhatsApp
          </Button>
        </div>
      </div>
    </dialog>
  );
});

DialogoWhatsAppNativo.displayName = 'DialogoWhatsAppNativo';

export default DialogoWhatsAppNativo;
