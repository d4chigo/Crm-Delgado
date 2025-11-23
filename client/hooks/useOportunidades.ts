import { useState, useEffect } from 'react'
import { 
  obtenerOportunidades, 
  obtenerEstadisticasOportunidades,
  cambiarEtapaOportunidad,
  crearOportunidad,
  eliminarOportunidad as apiEliminarOportunidad
} from '@/services/api/oportunidades'
import type { 
  OportunidadCliente, 
  EstadisticasOportunidad,
  EtapaPipeline,
  FiltrosOportunidad,
  CrearOportunidadDTO
} from '@/types/oportunidad.types'

export function useOportunidades() {
  const [oportunidades, setOportunidades] = useState<OportunidadCliente[]>([])
  const [estadisticas, setEstadisticas] = useState<EstadisticasOportunidad | null>(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cargarOportunidades = async (filtros?: FiltrosOportunidad) => {
    setCargando(true)
    setError(null)
    
    try {
      const respuesta = await obtenerOportunidades(filtros)
      setOportunidades(respuesta.oportunidades)
    } catch (err: any) {
      setError(err.message || 'Error al cargar oportunidades')
      console.error('Error cargando oportunidades:', err)
    } finally {
      setCargando(false)
    }
  }

  const cargarEstadisticas = async () => {
    try {
      const stats = await obtenerEstadisticasOportunidades()
      setEstadisticas(stats)
    } catch (err: any) {
      console.error('Error cargando estadísticas:', err)
    }
  }

  const moverOportunidad = async (id: string, nuevaEtapa: EtapaPipeline) => {
    try {
      await cambiarEtapaOportunidad(id, nuevaEtapa)
      
      // Actualizar localmente
      setOportunidades(prev => 
        prev.map(op => 
          op.id === id 
            ? { ...op, etapa: nuevaEtapa, ultimaActividad: new Date().toISOString() }
            : op
        )
      )

      // Recargar estadísticas
      await cargarEstadisticas()
      
      return true
    } catch (err: any) {
      setError(err.message || 'Error al mover oportunidad')
      return false
    }
  }

  const crearNuevaOportunidad = async (datos: CrearOportunidadDTO) => {
    try {
      const nuevaOportunidad = await crearOportunidad(datos)
      
      // Agregar localmente
      setOportunidades(prev => [...prev, nuevaOportunidad])
      
      // Recargar estadísticas
      await cargarEstadisticas()
      
      return nuevaOportunidad
    } catch (err: any) {
      setError(err.message || 'Error al crear oportunidad')
      throw err
    }
  }

  const eliminarOportunidadLocal = async (id: string) => {
    try {
      await apiEliminarOportunidad(id)
      
      // Eliminar localmente
      setOportunidades(prev => prev.filter(op => op.id !== id))
      
      // Recargar estadísticas
      await cargarEstadisticas()
      
      return true
    } catch (err: any) {
      setError(err.message || 'Error al eliminar oportunidad')
      throw err
    }
  }

  const removerDelPipelinePoCliente = async (clienteId: string) => {
    try {
      // Buscar la oportunidad del cliente
      const oportunidad = oportunidades.find(op => op.clienteId === clienteId)
      if (!oportunidad) {
        throw new Error('No hay oportunidad asociada a este cliente')
      }

      // Eliminar la oportunidad
      await apiEliminarOportunidad(oportunidad.id)
      
      // Eliminar localmente
      setOportunidades(prev => prev.filter(op => op.id !== oportunidad.id))
      
      // Recargar estadísticas
      await cargarEstadisticas()
      
      return true
    } catch (err: any) {
      setError(err.message || 'Error al remover del pipeline')
      throw err
    }
  }

  useEffect(() => {
    cargarOportunidades()
    cargarEstadisticas()
  }, [])

  return {
    oportunidades,
    estadisticas,
    cargando,
    error,
    cargarOportunidades,
    cargarEstadisticas,
    moverOportunidad,
    crearNuevaOportunidad,
    eliminarOportunidad: eliminarOportunidadLocal,
    removerDelPipeline: removerDelPipelinePoCliente,
    refrescar: () => {
      cargarOportunidades()
      cargarEstadisticas()
    }
  }
}
