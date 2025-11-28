"use client"

import { useState, useEffect } from "react"
import { PipelineKanban } from "@/components/features/opportunities"
import { useProtectedRoute } from "@/hooks/useProtectedRoute"

const ETAPAS = [
  { id: 'CONTACTO_INICIAL', titulo: 'Contacto Inicial', color: 'bg-blue-500' },
  { id: 'AGENDAMIENTO', titulo: 'Agendamiento', color: 'bg-purple-500' },
  { id: 'SEPARACION', titulo: 'Separación', color: 'bg-yellow-500' },
  { id: 'CIERRE_GANADO', titulo: 'Cierre Ganado', color: 'bg-green-500' },
  { id: 'CIERRE_PERDIDO', titulo: 'Cierre Perdido', color: 'bg-red-500' },
];

export default function PaginaKanban() {
  useProtectedRoute()
  
  const [columnas, setColumnas] = useState([
    {
      id: 'CONTACTO_INICIAL',
      titulo: 'Contacto Inicial',
      color: 'bg-blue-500',
      tarjetas: [
        { id: '1', titulo: 'Oportunidad 1', valor: 50000, cliente: 'Cliente A', probabilidad: 30 },
        { id: '2', titulo: 'Oportunidad 2', valor: 75000, cliente: 'Cliente B', probabilidad: 50 },
      ]
    },
    {
      id: 'AGENDAMIENTO',
      titulo: 'Agendamiento',
      color: 'bg-purple-500',
      tarjetas: [
        { id: '3', titulo: 'Oportunidad 3', valor: 100000, cliente: 'Cliente C', probabilidad: 70 },
      ]
    },
    {
      id: 'SEPARACION',
      titulo: 'Separación',
      color: 'bg-yellow-500',
      tarjetas: []
    },
    {
      id: 'CIERRE_GANADO',
      titulo: 'Cierre Ganado',
      color: 'bg-green-500',
      tarjetas: [
        { id: '4', titulo: 'Oportunidad 4', valor: 150000, cliente: 'Cliente D', probabilidad: 100 },
      ]
    },
    {
      id: 'CIERRE_PERDIDO',
      titulo: 'Cierre Perdido',
      color: 'bg-red-500',
      tarjetas: []
    },
  ])

  const handleMoverTarjeta = (tarjetaId: string, columnaDesdeId: string, columnaHastaId: string) => {
    if (columnaHastaId === 'trash') {
      // Eliminar tarjeta
      setColumnas(columnas.map(col => ({
        ...col,
        tarjetas: col.tarjetas.filter(t => t.id !== tarjetaId)
      })))
    } else {
      // Mover tarjeta entre columnas
      const tarjeta = columnas
        .find(col => col.id === columnaDesdeId)
        ?.tarjetas.find(t => t.id === tarjetaId)

      if (tarjeta) {
        setColumnas(columnas.map(col => {
          if (col.id === columnaDesdeId) {
            return {
              ...col,
              tarjetas: col.tarjetas.filter(t => t.id !== tarjetaId)
            }
          }
          if (col.id === columnaHastaId) {
            return {
              ...col,
              tarjetas: [...col.tarjetas, tarjeta]
            }
          }
          return col
        }))
      }
    }
  }

  const handleEliminarTarjeta = (tarjetaId: string) => {
    setColumnas(columnas.map(col => ({
      ...col,
      tarjetas: col.tarjetas.filter(t => t.id !== tarjetaId)
    })))
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Pipeline Kanban
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Arrastra las tarjetas entre columnas para cambiar el estado de las oportunidades
          </p>
        </div>

        {/* Kanban Board */}
        <PipelineKanban
          columnas={columnas}
          onMoverTarjeta={handleMoverTarjeta}
          onEliminarTarjeta={handleEliminarTarjeta}
        />
      </div>
    </div>
  )
}
