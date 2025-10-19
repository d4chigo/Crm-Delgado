import { useState, useEffect } from 'react'
import { 
  obtenerOportunidades, 
  obtenerEstadisticasOportunidades,
  cambiarEtapaOportunidad 
} from '@/services/api/oportunidades'
import type { 
  OportunidadCliente, 
  EstadisticasOportunidad,
  EtapaPipeline,
  FiltrosOportunidad 
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
    refrescar: () => {
      cargarOportunidades()
      cargarEstadisticas()
    }
  }
}
