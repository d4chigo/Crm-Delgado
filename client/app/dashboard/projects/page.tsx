"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Search, Filter, Tag, Loader2 } from "lucide-react"
import { useProyectos } from "@/hooks/useProyectos"
import { TarjetaProyecto } from "@/components/features/projects/TarjetaProyecto"
import { DialogoProyecto } from "@/components/features/projects/DialogoProyecto"
import { DatosFormularioProyecto, Proyecto, EstadoProyecto } from "@/types/proyecto.types"
import { Etiqueta } from "@/types/etiqueta.types"
import { etiquetaService } from "@/services/api/etiqueta.service"

export default function PaginaProyectos() {
  const [busqueda, setBusqueda] = useState("")
  const [etiquetaFiltro, setEtiquetaFiltro] = useState<string>("todas")
  const [estadoFiltro, setEstadoFiltro] = useState<string>("todos")
  const [dialogoAbierto, setDialogoAbierto] = useState(false)
  const [proyectoEditar, setProyectoEditar] = useState<Proyecto | undefined>(undefined)
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([])
  const [cargandoEtiquetas, setCargandoEtiquetas] = useState(false)

  const {
    proyectos,
    estaCargando,
    crearProyecto,
    actualizarProyecto,
    eliminarProyecto
  } = useProyectos()

  useEffect(() => {
    const cargarEtiquetas = async () => {
      setCargandoEtiquetas(true)
      try {
        const datos = await etiquetaService.obtenerTodas()
        setEtiquetas(Array.isArray(datos) ? datos : [])
      } catch (error) {
        console.error("Error al cargar etiquetas:", error)
        setEtiquetas([])
      } finally {
        setCargandoEtiquetas(false)
      }
    }
    cargarEtiquetas()
  }, [])

  const proyectosFiltrados = proyectos.filter((proyecto) => {
    const cumpleBusqueda =
      proyecto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      proyecto.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
      proyecto.ubicacion?.toLowerCase().includes(busqueda.toLowerCase())

    const cumpleEtiqueta =
      etiquetaFiltro === "todas" ||
      proyecto.etiquetas?.some((e) => e.etiquetaId === etiquetaFiltro)

    const cumpleEstado =
      estadoFiltro === "todos" || proyecto.estado === estadoFiltro

    return cumpleBusqueda && cumpleEtiqueta && cumpleEstado && proyecto.activo
  })

  const estadisticas = {
    total: proyectos.filter(p => p.activo).length,
    disponibles: proyectos.filter((p) => p.estado === EstadoProyecto.DISPONIBLE && p.activo).length,
    reservados: proyectos.filter((p) => p.estado === EstadoProyecto.RESERVADO && p.activo).length,
    vendidos: proyectos.filter((p) => p.estado === EstadoProyecto.VENDIDO && p.activo).length,
    construccion: proyectos.filter((p) => p.estado === EstadoProyecto.CONSTRUCCION && p.activo).length
  }

  const handleAbrirDialogo = (proyecto?: Proyecto) => {
    setProyectoEditar(proyecto)
    setDialogoAbierto(true)
  }

  const handleCerrarDialogo = () => {
    setDialogoAbierto(false)
    setProyectoEditar(undefined)
  }

  const handleSubmit = async (datos: DatosFormularioProyecto) => {
    try {
      if (proyectoEditar) {
        await actualizarProyecto(proyectoEditar.id, datos)
      } else {
        await crearProyecto(datos)
      }
      handleCerrarDialogo()
    } catch (error) {
      console.error("Error al guardar proyecto:", error)
    }
  }

  const handleEliminar = async (id: string) => {
    try {
      await eliminarProyecto(id)
    } catch (error) {
      console.error("Error al eliminar proyecto:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#303030]">Proyectos</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus proyectos inmobiliarios
          </p>
        </div>
        <Button
          onClick={() => handleAbrirDialogo()}
          className="bg-[#FCBA00] hover:bg-[#E0A800] text-[#303030] font-semibold"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Proyecto
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-4 border shadow-sm">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{estadisticas.total}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200 shadow-sm">
          <p className="text-sm text-green-700">Disponibles</p>
          <p className="text-2xl font-bold text-green-800">{estadisticas.disponibles}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 shadow-sm">
          <p className="text-sm text-yellow-700">Reservados</p>
          <p className="text-2xl font-bold text-yellow-800">{estadisticas.reservados}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 shadow-sm">
          <p className="text-sm text-blue-700">Vendidos</p>
          <p className="text-2xl font-bold text-blue-800">{estadisticas.vendidos}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200 shadow-sm">
          <p className="text-sm text-orange-700">En Construcción</p>
          <p className="text-2xl font-bold text-orange-800">{estadisticas.construccion}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar proyectos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={etiquetaFiltro} onValueChange={setEtiquetaFiltro}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <Tag className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Todas las etiquetas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las etiquetas</SelectItem>
            {etiquetas.map((etiqueta) => (
              <SelectItem key={etiqueta.id} value={etiqueta.id}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: etiqueta.color }} />
                  {etiqueta.nombre}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value={EstadoProyecto.DISPONIBLE}>Disponible</SelectItem>
            <SelectItem value={EstadoProyecto.RESERVADO}>Reservado</SelectItem>
            <SelectItem value={EstadoProyecto.VENDIDO}>Vendido</SelectItem>
            <SelectItem value={EstadoProyecto.CONSTRUCCION}>En Construcción</SelectItem>
            <SelectItem value={EstadoProyecto.FINALIZADO}>Finalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {estaCargando || cargandoEtiquetas ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : proyectosFiltrados.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {proyectos.length === 0
              ? "No hay proyectos. Crea tu primer proyecto."
              : "No se encontraron proyectos con los filtros seleccionados."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proyectosFiltrados.map((proyecto) => (
            <TarjetaProyecto
              key={proyecto.id}
              proyecto={proyecto}
              onEditar={handleAbrirDialogo}
              onEliminar={handleEliminar}
            />
          ))}
        </div>
      )}

      <DialogoProyecto
        abierto={dialogoAbierto}
        onCerrar={handleCerrarDialogo}
        onSubmit={handleSubmit}
        proyecto={proyectoEditar}
        etiquetas={etiquetas}
        estaCargando={estaCargando}
      />
    </div>
  )
}
