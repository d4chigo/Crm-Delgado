/**
 * Componente ContactImportDialog - Diálogo para importar contactos de Google
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Upload, Loader2 } from "lucide-react"
import { useContactos } from "@/hooks/useContactos"
import { toast } from "@/hooks/use-toast"
import googleAuthService from "@/services/api/google-auth.service"

interface ContactImportDialogProps {
  onImport: () => void
}

export function ContactImportDialog({ onImport }: ContactImportDialogProps) {
  const [open, setOpen] = useState(false)
  const [cargando, setCargando] = useState(false)
  const { iniciarImportacionGoogle } = useContactos()

  const handleImport = async () => {
    setCargando(true)
    try {
      // Iniciar el flujo de autenticación con Google
      await iniciarImportacionGoogle()
      setOpen(false)
      onImport()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo iniciar la importación",
        variant: "destructive",
      })
    } finally {
      setCargando(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-[#FCBA00] text-[#FCBA00] hover:bg-[#FCBA00]/10 bg-transparent"
        >
          <Upload className="w-4 h-4 mr-2" />
          Importar de Google
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Contactos de Google</DialogTitle>
          <DialogDescription>
            Conecta tu cuenta de Google para importar tus contactos
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-center p-8 border-2 border-dashed border-border rounded-lg">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-[#FCBA00]/10 rounded-full flex items-center justify-center mx-auto">
                <Upload className="w-8 h-8 text-[#FCBA00]" />
              </div>
              <div>
                <p className="font-medium text-[#303030]">Conectar con Google</p>
                <p className="text-sm text-muted-foreground">
                  Autoriza el acceso a tus contactos de Google
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={handleImport}
            disabled={cargando}
            className="w-full bg-[#FCBA00] hover:bg-[#E0A800] text-[#303030] font-semibold"
          >
            {cargando ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Conectando...
              </>
            ) : (
              "Conectar e Importar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
