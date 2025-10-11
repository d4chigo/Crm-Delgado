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
    limite: 6,
    total: 0,
    totalPaginas: 0
  })

  // Filtros
  const [filtros, setFiltros] = useState<FiltrosContacto>({
    pagina: 1,
    limite: 6
  })

  /**
   * Cargar contactos desde el backend
   */
  const cargarContactos = async (nuevosFiltros?: FiltrosContacto) => {
    setEstaCargando(true)
    setError(null)

    try {
      // Si no se pasan filtros, usar filtros vacíos para cargar todos los contactos
      const filtrosAplicar = nuevosFiltros !== undefined ? nuevosFiltros : filtros
      console.log('🔍 Cargando contactos con filtros:', filtrosAplicar)
      const respuesta = await contactoService.obtenerContactos(filtrosAplicar)

      setContactos(respuesta.contactos)
      setPaginacion(respuesta.paginacion)

      // Siempre actualizar los filtros si se pasaron nuevos (incluyendo objeto vacío)
      if (nuevosFiltros !== undefined) {
        setFiltros(filtrosAplicar)
        console.log('💾 Filtros guardados en estado:', filtrosAplicar)
      }
      
      // Cargar estadísticas también
      await cargarEstadisticas()
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
      
      // Recarga inteligente para evitar páginas vacías y llenar espacios automáticamente
      const paginaActual = paginacion.pagina;
      const elementosEnPagina = contactos.length;
      
      if (elementosEnPagina === 1 && paginaActual > 1) {
        // Si era el último elemento y no es la primera página, ir a página anterior
        await cargarContactos({ ...filtros, pagina: paginaActual - 1 });
      } else {
        // Recargar la página actual para llenar automáticamente con más elementos
        await cargarContactos({ ...filtros, pagina: paginaActual });
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
      console.log(`🔄 Convirtiendo contacto ${id} a lead...`)
      const contactoConvertido = await contactoService.convertirALead(id)
      console.log(`✅ Contacto convertido a tipo: ${contactoConvertido.tipo}`)
      
      // Recarga inteligente para evitar páginas vacías y llenar el espacio
      const paginaActual = paginacion.pagina;
      const elementosEnPagina = contactos.length;
      
      console.log(`📄 Recargando página ${paginaActual} con filtros:`, filtros)
      
      // Esperar un momento para asegurar que la DB se actualizó
      await new Promise(resolve => setTimeout(resolve, 200))
      
      if (elementosEnPagina === 1 && paginaActual > 1) {
        // Si era el último elemento y no es la primera página, ir a página anterior
        await cargarContactos({ ...filtros, pagina: paginaActual - 1 });
      } else {
        // Recargar la página actual para llenar con más elementos
        await cargarContactos({ ...filtros, pagina: paginaActual });
      }
      
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
      
      // Esperar un momento para asegurar que la DB se actualizó
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Recarga inteligente después de conversión masiva
      const paginaActual = paginacion.pagina;
      const elementosEnPagina = contactos.length;
      const convertidosEnEstaPagina = ids.filter(id => contactos.some(c => c.id === id)).length;
      
      if (convertidosEnEstaPagina === elementosEnPagina && paginaActual > 1) {
        // Si se convirtieron todos los elementos de esta página, ir a la anterior
        await cargarContactos({ ...filtros, pagina: paginaActual - 1 });
      } else {
        // Recargar la página actual para llenar con más elementos
        await cargarContactos({ ...filtros, pagina: paginaActual });
      }
      
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

  // NO cargar automáticamente - dejar que el componente padre controle la carga inicial
  // useEffect(() => {
  //   cargarContactos()
  //   cargarEstadisticas()
  // }, [])

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
