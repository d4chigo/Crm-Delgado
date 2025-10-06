"use client"

import { useState } from "react"
import { useContactos } from "@/hooks/useContactos"
import { FormularioContacto } from "@/components/features/contacts/FormularioContacto"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Users, UserPlus, UserCheck, Loader2 } from "lucide-react"
import { TipoContacto } from "@/types/contacto.types"

export default function PaginaContactos() {
  const {
    contactos,
    estadisticas,
    estaCargando,
    error,
    paginacion,
    buscarContactos,
    filtrarPorTipo,
    crearContacto,
  } = useContactos()

  const [busqueda, setBusqueda] = useState("")

  const handleBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value
    setBusqueda(valor)
    
    // Buscar después de un pequeño delay
    const timer = setTimeout(() => {
      buscarContactos(valor)
    }, 500)
    
    return () => clearTimeout(timer)
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#303030]">Contactos</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus contactos y conviértelos en leads
          </p>
        </div>
        <FormularioContacto onCrear={crearContacto} />
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contactos</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{estadisticas.totalContactos}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads</CardTitle>
              <UserPlus className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{estadisticas.totalLeads}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{estadisticas.totalClientes}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Barra de búsqueda y filtros */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, apellido o correo..."
            value={busqueda}
            onChange={handleBusqueda}
            className="pl-9"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => filtrarPorTipo(undefined)}
          >
            Todos
          </Button>
          <Button
            variant="outline"
            onClick={() => filtrarPorTipo(TipoContacto.CONTACTO)}
          >
            Contactos
          </Button>
          <Button
            variant="outline"
            onClick={() => filtrarPorTipo(TipoContacto.LEAD)}
          >
            Leads
          </Button>
          <Button
            variant="outline"
            onClick={() => filtrarPorTipo(TipoContacto.CLIENTE)}
          >
            Clientes
          </Button>
        </div>
      </div>

      {/* Estado de carga */}
      {estaCargando && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#FCBA00]" />
        </div>
      )}

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Lista de contactos */}
      {!estaCargando && contactos.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contactos.map((contacto) => (
              <Card key={contacto.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {contacto.nombre} {contacto.apellido}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{contacto.correo}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {contacto.telefono && (
                      <p className="text-muted-foreground">📞 {contacto.telefono}</p>
                    )}
                    {contacto.ciudad && (
                      <p className="text-muted-foreground">📍 {contacto.ciudad}</p>
                    )}
                    {contacto.edad && (
                      <p className="text-muted-foreground">🎂 {contacto.edad} años</p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        contacto.tipo === TipoContacto.CLIENTE
                          ? 'bg-green-100 text-green-700'
                          : contacto.tipo === TipoContacto.LEAD
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {contacto.tipo}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Paginación */}
          {paginacion.totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <p className="text-sm text-muted-foreground">
                Página {paginacion.pagina} de {paginacion.totalPaginas} ({paginacion.total} contactos)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Estado vacío */}
      {!estaCargando && contactos.length === 0 && !error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay contactos</h3>
            <p className="text-muted-foreground text-center mb-4">
              {busqueda ? 'No se encontraron contactos con esa búsqueda' : 'Comienza agregando tu primer contacto'}
            </p>
            <Button className="bg-[#FCBA00] hover:bg-[#E0A800] text-[#303030]">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Contacto
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
