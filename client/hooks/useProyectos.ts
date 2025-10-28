import { useState, useEffect, useCallback } from 'react'
import { Proyecto, DatosFormularioProyecto, DatosAsociarCliente, FiltrosProyecto } from '@/types/proyecto.types'
import { proyectoService } from '@/services/api/proyecto.service'
import { useToast } from './use-toast'

/**
 * Hook personalizado para gestionar proyectos
 */
export const useProyectos = (filtrosIniciales?: FiltrosProyecto) => {
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [estaCargando, setEstaCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  /**
   * Cargar proyectos desde la API
   */
  const cargarProyectos = useCallback(async (filtros?: FiltrosProyecto) => {
    setEstaCargando(true)
    setError(null)

    try {
      const datos = await proyectoService.obtenerTodos(filtros)
      setProyectos(datos)
    } catch (err: any) {
      const mensajeError = err.message || 'Error al cargar proyectos'
      setError(mensajeError)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: mensajeError
      })
    } finally {
      setEstaCargando(false)
    }
  }, [toast])

  /**
   * Crear un nuevo proyecto
   */
  const crearProyecto = useCallback(async (datos: DatosFormularioProyecto) => {
    setEstaCargando(true)
    setError(null)

    try {
      const nuevoProyecto = await proyectoService.crear(datos)
      setProyectos(prev => [nuevoProyecto, ...prev])
      
      toast({
        title: 'Proyecto creado',
        description: 'El proyecto se creó exitosamente'
      })

      return nuevoProyecto
    } catch (err: any) {
      const mensajeError = err.message || 'Error al crear proyecto'
      setError(mensajeError)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: mensajeError
      })
      throw err
    } finally {
      setEstaCargando(false)
    }
  }, [toast])

  /**
   * Actualizar un proyecto existente
   */
  const actualizarProyecto = useCallback(async (id: string, datos: Partial<DatosFormularioProyecto>) => {
    setEstaCargando(true)
    setError(null)

    try {
      const proyectoActualizado = await proyectoService.actualizar(id, datos)
      setProyectos(prev => prev.map(p => p.id === id ? proyectoActualizado : p))
      
      toast({
        title: 'Proyecto actualizado',
        description: 'El proyecto se actualizó exitosamente'
      })

      return proyectoActualizado
    } catch (err: any) {
      const mensajeError = err.message || 'Error al actualizar proyecto'
      setError(mensajeError)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: mensajeError
      })
      throw err
    } finally {
      setEstaCargando(false)
    }
  }, [toast])

  /**
   * Eliminar un proyecto
   */
  const eliminarProyecto = useCallback(async (id: string) => {
    setEstaCargando(true)
    setError(null)

    try {
      await proyectoService.eliminar(id)
      setProyectos(prev => prev.filter(p => p.id !== id))
      
      toast({
        title: 'Proyecto eliminado',
        description: 'El proyecto se eliminó exitosamente'
      })
    } catch (err: any) {
      const mensajeError = err.message || 'Error al eliminar proyecto'
      setError(mensajeError)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: mensajeError
      })
      throw err
    } finally {
      setEstaCargando(false)
    }
  }, [toast])

  /**
   * Asignar etiquetas a un proyecto
   */
  const asignarEtiquetas = useCallback(async (id: string, etiquetaIds: string[]) => {
    try {
      const proyectoActualizado = await proyectoService.asignarEtiquetas(id, etiquetaIds)
      setProyectos(prev => prev.map(p => p.id === id ? proyectoActualizado : p))
      
      toast({
        title: 'Etiquetas actualizadas',
        description: 'Las etiquetas se actualizaron exitosamente'
      })

      return proyectoActualizado
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Error al asignar etiquetas'
      })
      throw err
    }
  }, [toast])

  /**
   * Asociar un cliente a un proyecto
   */
  const asociarCliente = useCallback(async (id: string, datos: DatosAsociarCliente) => {
    try {
      const proyectoActualizado = await proyectoService.asociarCliente(id, datos)
      setProyectos(prev => prev.map(p => p.id === id ? proyectoActualizado : p))
      
      toast({
        title: 'Cliente asociado',
        description: 'El cliente se asoció exitosamente al proyecto'
      })

      return proyectoActualizado
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Error al asociar cliente'
      })
      throw err
    }
  }, [toast])

  /**
   * Desasociar un cliente de un proyecto
   */
  const desasociarCliente = useCallback(async (proyectoId: string, clienteId: string) => {
    try {
      const proyectoActualizado = await proyectoService.desasociarCliente(proyectoId, clienteId)
      setProyectos(prev => prev.map(p => p.id === proyectoId ? proyectoActualizado : p))
      
      toast({
        title: 'Cliente desasociado',
        description: 'El cliente se desasociado exitosamente del proyecto'
      })

      return proyectoActualizado
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Error al desasociar cliente'
      })
      throw err
    }
  }, [toast])

  // Cargar proyectos al montar el componente
  useEffect(() => {
    cargarProyectos(filtrosIniciales)
  }, [filtrosIniciales, cargarProyectos])

  return {
    proyectos,
    estaCargando,
    error,
    cargarProyectos,
    crearProyecto,
    actualizarProyecto,
    eliminarProyecto,
    asignarEtiquetas,
    asociarCliente,
    desasociarCliente
  }
}
