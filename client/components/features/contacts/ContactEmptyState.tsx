/**
 * Componente ContactEmptyState - Estado vacío cuando no hay contactos
 */

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { UserPlus } from "lucide-react"

interface ContactEmptyStateProps {
  hasSearchQuery: boolean
}

export function ContactEmptyState({ hasSearchQuery }: ContactEmptyStateProps) {
  return (
    <Card className="border-border">
      <CardContent className="p-12 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <UserPlus className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-[#303030] mb-2">
          No se encontraron contactos
        </h3>
        <p className="text-muted-foreground mb-4">
          {hasSearchQuery
            ? "Intenta con otros términos de búsqueda"
            : "Comienza agregando o importando contactos"}
        </p>
      </CardContent>
    </Card>
  )
}
