'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface DialogoConfirmarEliminarProps {
  abierto: boolean
  onCerrar: () => void
  onConfirmar: () => Promise<void>
  nombre: string
  cargando?: boolean
}

export function DialogoConfirmarEliminar({ 
  abierto, 
  onCerrar, 
  onConfirmar, 
  nombre,
  cargando = false 
}: DialogoConfirmarEliminarProps) {
  return (
    <Dialog open={abierto} onOpenChange={onCerrar}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle>Eliminar contacto</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            ¿Estás seguro de que deseas eliminar a <strong>{nombre}</strong>? 
            Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 justify-end pt-4">
          <Button
            variant="outline"
            onClick={onCerrar}
            disabled={cargando}
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirmar}
            disabled={cargando}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {cargando ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Eliminando...
              </>
            ) : (
              'Eliminar'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
