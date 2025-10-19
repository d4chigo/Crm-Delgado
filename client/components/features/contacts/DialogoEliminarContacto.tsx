"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Contacto } from "@/types/contacto.types"

interface DialogoEliminarContactoProps {
  contacto: Contacto | null
  abierto: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

export function DialogoEliminarContacto({
  contacto,
  abierto,
  onConfirmar,
  onCancelar,
}: DialogoEliminarContactoProps) {
  if (!contacto) return null

  return (
    <AlertDialog open={abierto} onOpenChange={onCancelar}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar contacto?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente el contacto de{" "}
            <span className="font-semibold text-foreground">
              {contacto.nombre} {contacto.apellido}
            </span>
            .
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancelar}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirmar}
            className="bg-red-600 hover:bg-red-700"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
