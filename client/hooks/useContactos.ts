/**
 * Hook personalizado para gestionar contactos
 */

"use client"

import { useState, useEffect } from "react"
import contactoService from "@/services/api/contacto.service"
import type {
  Contacto,
  CrearContactoDTO,
  ActualizarContactoDTO,
  FiltrosContacto,
  EstadisticasContactos,
  TipoContacto
} from "@/types/contacto.types"

export function useContactos() {
  const [contactos, setContactos] = useState<Contacto[]>([])
  const [estadisticas, setEstadisticas] = useState<EstadisticasContactos | null>(null)
  const [estaCargando, setEstaCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paginacion, setPaginacion] = useState({
    pagina: 1,
    limite: 10,
    total: 0,
    totalPaginas: 0
  })

  // Filtros
  const [filtros, setFiltros] = useState<FiltrosContacto>({
    pagina: 1,
    limite: 10
  })

  /**
   * Cargar contactos desde el backend
   */
  const cargarContactos = async (nuevosFiltros?: FiltrosContacto) => {
    setEstaCargando(true)
    setError(null)
    
    try {
      const filtrosAplicar = nuevosFiltros || filtros
      const respuesta = await contactoService.obtenerContactos(filtrosAplicar)
      
      setContactos(respuesta.contactos)
      setPaginacion(respuesta.paginacion)
      
      if (nuevosFiltros) {
        setFiltros(filtrosAplicar)
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar contactos')
      setContactos([])
    } finally {
      setEstaCargando(false)
    }
  }

  /**
   * Cargar estadísticas
   */
  const cargarEstadisticas = async () => {
    try {
      const stats = await contactoService.obtenerEstadisticas()
      setEstadisticas(stats)
    } catch (err: any) {
      console.error('Error al cargar estadísticas:', err)
    }
  }

  /**
   * Crear nuevo contacto
   */
  const crearContacto = async (datos: CrearContactoDTO): Promise<Contacto> => {
    setEstaCargando(true)
    setError(null)
    
    try {
      const nuevoContacto = await contactoService.crearContacto(datos)
      
      // Recargar la lista
      await cargarContactos()
      await cargarEstadisticas()
      
      return nuevoContacto
    } catch (err: any) {
      setError(err.message || 'Error al crear contacto')
      throw err
    } finally {
      setEstaCargando(false)
    }
  }

  /**
   * Actualizar contacto
   */
  const actualizarContacto = async (id: string, datos: ActualizarContactoDTO): Promise<Contacto> => {
    setEstaCargando(true)
    setError(null)
    
    try {
      const contactoActualizado = await contactoService.actualizarContacto(id, datos)
      
      // Actualizar en la lista local
      setContactos(prev =>
        prev.map(c => c.id === id ? contactoActualizado : c)
      )
      
      await cargarEstadisticas()
      
      return contactoActualizado
    } catch (err: any) {
      setError(err.message || 'Error al actualizar contacto')
      throw err
    } finally {
      setEstaCargando(false)
    }
  }

  /**
   * Eliminar contacto
   */
  const eliminarContacto = async (id: string): Promise<void> => {
    setEstaCargando(true)
    setError(null)
    
    try {
      await contactoService.eliminarContacto(id)
      
      // Eliminar de la lista local
      setContactos(prev => prev.filter(c => c.id !== id))
      
      await cargarEstadisticas()
    } catch (err: any) {
      setError(err.message || 'Error al eliminar contacto')
      throw err
    } finally {
      setEstaCargando(false)
    }
  }

  /**
   * Convertir contacto a lead
   */
  const convertirALead = async (id: string): Promise<Contacto> => {
    setEstaCargando(true)
    setError(null)
    
    try {
      const contactoConvertido = await contactoService.convertirALead(id)
      
      // Actualizar en la lista local
      setContactos(prev =>
        prev.map(c => c.id === id ? contactoConvertido : c)
      )
      
      await cargarEstadisticas()
      
      return contactoConvertido
    } catch (err: any) {
      setError(err.message || 'Error al convertir contacto')
      throw err
    } finally {
      setEstaCargando(false)
    }
  }

  /**
   * Convertir múltiples contactos a leads
   */
  const convertirVariosALeads = async (ids: string[]): Promise<{ convertidos: number; total: number; noConvertidos: number }> => {
    setEstaCargando(true)
    setError(null)
    
    try {
      const resultado = await contactoService.convertirVariosALeads(ids)
      
      // Recargar la lista completa después de la conversión masiva
      await cargarContactos()
      await cargarEstadisticas()
      
      return resultado
    } catch (err: any) {
      setError(err.message || 'Error al convertir contactos')
      throw err
    } finally {
      setEstaCargando(false)
    }
  }

  /**
   * Buscar contactos
   */
  const buscarContactos = (busqueda: string) => {
    cargarContactos({ ...filtros, busqueda, pagina: 1 })
  }

  /**
   * Filtrar por tipo
   */
  const filtrarPorTipo = (tipo?: TipoContacto) => {
    cargarContactos({ ...filtros, tipo, pagina: 1 })
  }

  /**
   * Filtrar por ciudad
   */
  const filtrarPorCiudad = (ciudad?: string) => {
    cargarContactos({ ...filtros, ciudad, pagina: 1 })
  }

  /**
   * Cambiar página
   */
  const cambiarPagina = (pagina: number) => {
    cargarContactos({ ...filtros, pagina })
  }

  /**
   * Importar desde Google (placeholder)
   */
  const importarDesdeGoogle = async () => {
    // TODO: Implementar OAuth de Google y importación
    console.log('Función de importación desde Google pendiente')
  }

  // Cargar contactos al montar el componente
  useEffect(() => {
    cargarContactos()
    cargarEstadisticas()
  }, [])

  return {
    // Estado
    contactos,
    estadisticas,
    estaCargando,
    error,
    paginacion,
    filtros,
    
    // Funciones CRUD
    crearContacto,
    actualizarContacto,
    eliminarContacto,
    convertirALead,
    convertirVariosALeads,
    
    // Funciones de filtrado/búsqueda
    buscarContactos,
    filtrarPorTipo,
    filtrarPorCiudad,
    cambiarPagina,
    cargarContactos,
    
    // Importación
    importarDesdeGoogle
  }
}
