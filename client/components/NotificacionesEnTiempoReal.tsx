"use client"

import { useEffect, useState } from "react"
import { Bell, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Notificacion {
  id: string
  mensaje: string
  tipo: "lead" | "oportunidad" | "cotizacion"
  datos: any
  timestamp: Date
}

export function NotificacionesEnTiempoReal() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [mostrarPanel, setMostrarPanel] = useState(false)
  const [ultimoLeadId, setUltimoLeadId] = useState<string>("")

  useEffect(() => {
    // Usar polling para obtener leads recientes
    const intervalo = setInterval(async () => {
      try {
        // Construir URL correctamente
        let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        apiUrl = apiUrl.replace(/\/$/, '') // Remover trailing slash
        
        // Asegurar que tenga /api
        if (!apiUrl.includes('/api')) {
          apiUrl = `${apiUrl}/api`
        }
        
        const url = `${apiUrl}/public/leads/recientes`
        
        console.log("📡 Consultando:", url)
        const response = await fetch(url)
        
        if (!response.ok) return

        const result = await response.json()
        
        if (result.exito && result.datos && result.datos.length > 0) {
          const primerLead = result.datos[0]
          
          // Si es un lead nuevo (diferente al último que vimos)
          if (primerLead.id !== ultimoLeadId) {
            console.log("📬 Nuevo lead recibido:", primerLead)
            
            const nuevaNotificacion: Notificacion = {
              id: `lead-${primerLead.id}`,
              mensaje: `Nuevo lead: ${primerLead.nombre} ${primerLead.apellido}`,
              tipo: "lead",
              datos: primerLead,
              timestamp: new Date()
            }

            setUltimoLeadId(primerLead.id)
            setNotificaciones((prev) => [nuevaNotificacion, ...prev])
            
            // Auto-remover después de 1 hora (3600000 ms)
            setTimeout(() => {
              setNotificaciones((prev) => prev.filter((n) => n.id !== nuevaNotificacion.id))
            }, 3600000)
          }
        }
      } catch (error) {
        console.error("Error al obtener leads:", error)
      }
    }, 3000) // Verificar cada 3 segundos

    return () => clearInterval(intervalo)
  }, [ultimoLeadId])

  const removerNotificacion = (id: string) => {
    setNotificaciones((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="relative">
      {/* Botón de campana */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setMostrarPanel(!mostrarPanel)}
      >
        <Bell className="h-5 w-5" />
        {notificaciones.length > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
        )}
      </Button>

      {/* Panel de notificaciones */}
      {mostrarPanel && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notificaciones</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notificaciones.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No hay notificaciones
              </div>
            ) : (
              notificaciones.map((notif) => (
                <div
                  key={notif.id}
                  className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      {notif.tipo === "lead" && (
                        <>
                          <p className="font-medium text-gray-900">
                            {notif.datos.nombre}
                          </p>
                          <p className="text-sm text-gray-600">
                            {notif.datos.email}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Teléfono: {notif.datos.telefono}
                          </p>
                          <p className="text-sm text-gray-500">
                            Interés: {notif.datos.interes}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(notif.timestamp).toLocaleTimeString()}
                          </p>
                        </>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0"
                      onClick={() => removerNotificacion(notif.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
