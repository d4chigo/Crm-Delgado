'use client';

import React, { memo, useCallback, useRef, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DialogoWhatsAppProps {
  abierto: boolean;
  onCerrar: () => void;
  mensajeInicial?: string;
  telefono: string | null;
  onEnviar: (mensaje: string) => void;
  titulo?: string;
}

const DialogoWhatsApp = memo(({
  abierto,
  onCerrar,
  mensajeInicial = '',
  telefono,
  onEnviar,
  titulo = 'Enviar mensaje por WhatsApp'
}: DialogoWhatsAppProps) => {
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mensajeLocal, setMensajeLocal] = useState(mensajeInicial);

  // Sincronizar mensaje inicial cuando se abre
  useEffect(() => {
    if (abierto) {
      setMensajeLocal(mensajeInicial);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [abierto, mensajeInicial]);

  const handleCopiar = useCallback(() => {
    navigator.clipboard.writeText(mensajeLocal);
    toast({ title: 'Copiado', description: 'Mensaje copiado al portapapeles.' });
  }, [mensajeLocal, toast]);

  const handleTexareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMensajeLocal(e.target.value);
  }, []);

  const handleEnviar = useCallback(() => {
    onEnviar(mensajeLocal);
  }, [mensajeLocal, onEnviar]);

  return (
    <Dialog open={abierto} onOpenChange={onCerrar}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            {titulo}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <label className="block text-sm text-muted-foreground">Mensaje</label>
          <textarea
            ref={textareaRef}
            className="w-full border rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FCBA00] resize-none"
            rows={6}
            value={mensajeLocal}
            onChange={handleTexareaChange}
            placeholder="Escribe tu mensaje..."
            spellCheck="false"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button 
              variant="outline" 
              onClick={handleCopiar}
              size="sm"
            >
              Copiar
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleEnviar}
              size="sm"
            >
              Abrir WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

DialogoWhatsApp.displayName = 'DialogoWhatsApp';

export default DialogoWhatsApp;
