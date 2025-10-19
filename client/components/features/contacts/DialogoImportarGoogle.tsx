"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface DialogoImportarGoogleProps {
  onImportar: () => Promise<void>
}

export function DialogoImportarGoogle({ onImportar }: DialogoImportarGoogleProps) {
  const handleImportar = async () => {
    try {
      await onImportar()
    } catch (err: any) {
      console.error('Error al iniciar importación:', err)
    }
  }

  return (
    <Button onClick={handleImportar} variant="outline">
      <Download className="mr-2 h-4 w-4" />
      Importar de Google
    </Button>
  )
}
