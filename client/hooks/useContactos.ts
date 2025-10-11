/**
 * Hook personalizado para gestionar contactos
 */

"use client"

import { useState, useEffect } from "react"
import contactoService from "@/services/api/contacto.service"
import googleAuthService from "@/services/api/google-auth.service"
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
    limite: 9,
    total: 0,
    totalPaginas: 0
  })

  // Filtros
  const [filtros, setFiltros] = useState<FiltrosContacto>({
    pagina: 1,
    limite: 9
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
      const nuevosContactos = contactos.filter(c => c.id !== id)
      setContactos(nuevosContactos)
      
      // Si la página queda vacía y no es la primera, ir a la página anterior
      if (nuevosContactos.length === 0 && paginacion.pagina > 1) {
        const nuevaPagina = paginacion.pagina - 1
        await cargarContactos({ ...filtros, pagina: nuevaPagina })
      } else if (nuevosContactos.length === 0 && paginacion.pagina === 1) {
        // Si es la primera página y queda vacía, recargar para actualizar
        await cargarContactos()
      } else {
        // Si aún hay elementos, solo recargar la misma página para llenar
        await cargarContactos({ ...filtros, pagina: paginacion.pagina })
      }
      
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
   * Iniciar flujo de importación desde Google
   */
  const iniciarImportacionGoogle = async () => {
    try {
      console.log('🚀 Iniciando importación desde Google...');
      await googleAuthService.startAuthFlow();
    } catch (err: any) {
      setError(err.message || 'Error al iniciar la autenticación con Google');
      throw err;
    }
  };

  /**
   * Completar importación desde Google (después del callback)
   */
  const completarImportacionGoogle = async (accessToken: string) => {
    setEstaCargando(true);
    setError(null);
    
    try {
      console.log('📥 Importando contactos con el token recibido...');
      
      // Importar contactos con el token
      const resultado = await contactoService.importarDesdeGoogle(accessToken);
      
      console.log('✅ Contactos importados:', resultado);
      
      // Recargar la lista de contactos y estadísticas
      await cargarContactos();
      await cargarEstadisticas();
      
      return resultado;
    } catch (err: any) {
      setError(err.message || 'Error al importar contactos desde Google');
      throw err;
    } finally {
      setEstaCargando(false);
      googleAuthService.clearPendingImport();
    }
  };

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
    
    // Importación desde Google
    iniciarImportacionGoogle,
    completarImportacionGoogle
  }
}
