/**
 * Hook personalizado para gestionar contactos
 */

"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
    limite: 6,
    tipo: undefined // Inicialmente sin filtro, cada página debe especificar su tipo
  })

  /**
   * Refrescar contactos (actualiza filtros para disparar recarga)
   * Debe estar definido antes de funciones que lo referencian para evitar TDZ.
   */
  const refrescarContactos = useCallback(() => {
    setFiltros((prevFiltros: FiltrosContacto) => ({ ...prevFiltros }));
  }, []);

  /**
   * Cargar contactos con filtros opcionales. Actualiza `filtros` para
   * disparar la recarga automática en el useEffect que escucha `filtros`.
   */
  const cargarContactos = useCallback((nuevosFiltros?: Partial<FiltrosContacto>) => {
    setFiltros((prev: FiltrosContacto) => ({ ...prev, ...(nuevosFiltros || {}) }));
  }, []);

  // Ref para debounce de búsqueda
  const searchTimeoutRef = useRef<number | null>(null);

  /**
   * Cargar contactos desde el backend
   */
  const cargarEstadisticas = useCallback(async () => {
    try {
      const stats = await contactoService.obtenerEstadisticas()
      setEstadisticas(stats)
    } catch (err: any) {
      console.error('Error al cargar estadísticas:', err)
    }
  }, [])

  /**
   * Cargar contactos desde el backend
   */
  useEffect(() => {
    const fetchContactos = async () => {
      setEstaCargando(true)
      setError(null)

      try {
        console.log('🔍 Cargando contactos con filtros:', filtros)
        const respuesta = await contactoService.obtenerContactos(filtros)

        setContactos(respuesta.contactos)
        setPaginacion(respuesta.paginacion)

        await cargarEstadisticas()
      } catch (err: any) {
        setError(err.message || 'Error al cargar contactos')
        setContactos([])
      } finally {
        setEstaCargando(false)
      }
    }

    fetchContactos()
  }, [filtros, cargarEstadisticas])

  /**
   * Crear nuevo contacto
   */
  const crearContacto = useCallback(async (datos: CrearContactoDTO): Promise<Contacto> => {
    setEstaCargando(true)
    setError(null)
    
    try {
      const nuevoContacto = await contactoService.crearContacto(datos)
      
      // Recargar la lista
      refrescarContactos()
      
      return nuevoContacto
    } catch (err: any) {
      setError(err.message || 'Error al crear contacto')
      throw err
    } finally {
      setEstaCargando(false)
    }
  }, [refrescarContactos])

  /**
   * Actualizar contacto
   */
  const actualizarContacto = useCallback(async (id: string, datos: ActualizarContactoDTO): Promise<Contacto> => {
    setEstaCargando(true)
    setError(null)
    
    try {
      const contactoActualizado = await contactoService.actualizarContacto(id, datos)
      
      // Actualizar en la lista local
      setContactos((prev: Contacto[]) =>
        prev.map((c: Contacto) => c.id === id ? contactoActualizado : c)
      )
      
      await cargarEstadisticas()
      
      return contactoActualizado
    } catch (err: any) {
      setError(err.message || 'Error al actualizar contacto')
      throw err
    } finally {
      setEstaCargando(false)
    }
  }, [cargarEstadisticas])

  /**
   * Eliminar contacto
   */
  const eliminarContacto = useCallback(async (id: string): Promise<void> => {
    setEstaCargando(true)
    setError(null)
    
    try {
      await contactoService.eliminarContacto(id)
      
      // Recarga inteligente para evitar páginas vacías y llenar espacios automáticamente
      const paginaActual = paginacion.pagina;
      const elementosEnPagina = contactos.length;
      
      if (elementosEnPagina === 1 && paginaActual > 1) {
        // Si era el último elemento y no es la primera página, ir a página anterior
        setFiltros((prevFiltros: FiltrosContacto) => ({ ...prevFiltros, pagina: paginaActual - 1 }));
      } else {
        // Recargar la página actual para llenar automáticamente con más elementos
        refrescarContactos();
      }
    } catch (err: any) {
      setError(err.message || 'Error al eliminar contacto')
      throw err
    } finally {
      setEstaCargando(false)
    }
  }, [paginacion, contactos, refrescarContactos])

  /**
   * Convertir contacto a lead
   */
  const convertirALead = useCallback(async (id: string): Promise<Contacto> => {
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
        setFiltros((prevFiltros: FiltrosContacto) => ({ ...prevFiltros, pagina: paginaActual - 1 }));
      } else {
        // Recargar la página actual para llenar con más elementos
        refrescarContactos();
      }
      
      return contactoConvertido
    } catch (err: any) {
      setError(err.message || 'Error al convertir contacto')
      throw err
    } finally {
      setEstaCargando(false)
    }
  }, [paginacion, contactos, filtros, refrescarContactos])

  /**
   * Convertir múltiples contactos a leads
   */
  const convertirVariosALeads = useCallback(async (ids: string[]): Promise<{ convertidos: number; total: number; noConvertidos: number }> => {
    setEstaCargando(true)
    setError(null)
    
    try {
      const resultado = await contactoService.convertirVariosALeads(ids)
      
      // Esperar un momento para asegurar que la DB se actualizó
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Recarga inteligente después de conversión masiva
      const paginaActual = paginacion.pagina;
      const elementosEnPagina = contactos.length;
      const convertidosEnEstaPagina = ids.filter(id => contactos.some((c: Contacto) => c.id === id)).length;
      
      if (convertidosEnEstaPagina === elementosEnPagina && paginaActual > 1) {
        // Si se convirtieron todos los elementos de esta página, ir a la anterior
        setFiltros((prevFiltros: FiltrosContacto) => ({ ...prevFiltros, pagina: paginaActual - 1 }));
      } else {
        // Recargar la página actual para llenar con más elementos
        refrescarContactos();
      }
      
      return resultado
    } catch (err: any) {
      setError(err.message || 'Error al convertir contactos')
      throw err
    } finally {
      setEstaCargando(false)
    }
  }, [paginacion, contactos, refrescarContactos])

  /**
   * Buscar contactos con debounce
   */
  const buscarContactos = useCallback((busqueda: string) => {
    console.log('🔍 Buscando:', busqueda);
    
    // Limpiar el timeout anterior si existe
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    // Actualizar los filtros con debounce
    searchTimeoutRef.current = window.setTimeout(() => {
      setFiltros(prevFiltros => {
        // Si el término de búsqueda está vacío, lo eliminamos del filtro
        if (!busqueda || busqueda.trim() === '') {
          const { busqueda: _, ...nuevosFiltros } = prevFiltros;
          return { ...nuevosFiltros, pagina: 1 };
        }
        
        // Si el término de búsqueda es el mismo, no hacemos nada
        if (prevFiltros.busqueda === busqueda.trim()) {
          return prevFiltros;
        }
        
        // Actualizar el término de búsqueda y resetear a página 1
        return {
          ...prevFiltros,
          busqueda: busqueda.trim(),
          pagina: 1
        };
      });
    }, 500); // Debounce de 500ms
  }, []);

  /**
   * Filtrar por tipo
   */
  const filtrarPorTipo = useCallback((tipo?: TipoContacto) => {
    setFiltros((prevFiltros: FiltrosContacto) => {
      const nuevosFiltros = { ...prevFiltros, pagina: 1 };
      
      if (tipo) {
        nuevosFiltros.tipo = tipo;
      } else {
        delete nuevosFiltros.tipo;
      }
      
      return nuevosFiltros;
    });
  }, []);

  /**
   * Filtrar por ciudad
   */
  const filtrarPorCiudad = useCallback((ciudad?: string) => {
    setFiltros((prevFiltros: FiltrosContacto) => {
      const nuevosFiltros = { ...prevFiltros, pagina: 1 };
      
      if (ciudad) {
        nuevosFiltros.ciudad = ciudad;
      } else {
        delete nuevosFiltros.ciudad;
      }
      
      return nuevosFiltros;
    });
  }, []);

  /**
   * Cambiar página
   */
  const cambiarPagina = useCallback((pagina: number) => {
    setFiltros((prevFiltros: FiltrosContacto) => ({ ...prevFiltros, pagina }))
  }, []);

  /**
   * Limpiar todos los filtros
   */
  const limpiarFiltros = useCallback(() => {
    setFiltros({
      pagina: 1,
      limite: 6
    });
  }, []);

  /**
   * Iniciar flujo de importación desde Google
   */
  const iniciarImportacionGoogle = useCallback(async () => {
    try {
      console.log('🚀 Iniciando importación desde Google...');
      await googleAuthService.startAuthFlow();
    } catch (err: any) {
      setError(err.message || 'Error al iniciar la autenticación con Google');
      throw err;
    }
  }, []);

  /**
   * Completar importación desde Google (después del callback)
   */
  const completarImportacionGoogle = useCallback(async (accessToken: string) => {
    setEstaCargando(true);
    setError(null);
    
    try {
      console.log('📥 Importando contactos con el token recibido...');
      
      // Importar contactos con el token
      const resultado = await contactoService.importarDesdeGoogle(accessToken);
      
      console.log('✅ Contactos importados:', resultado);
      
      // Recargar la lista de contactos y estadísticas
      refrescarContactos();
      
      return resultado;
    } catch (err: any) {
      setError(err.message || 'Error al importar contactos desde Google');
      throw err;
    } finally {
      setEstaCargando(false);
      googleAuthService.clearPendingImport();
    }
  }, [refrescarContactos]);

  return {
    // Estado
    contactos,
    estadisticas,
    estaCargando,
    error,
    paginacion,
    filtros,
    setFiltros,
    
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
    cargarContactos,
    cambiarPagina,
    refrescarContactos,
    limpiarFiltros,
    
    // Importación desde Google
    iniciarImportacionGoogle,
    completarImportacionGoogle
  }
}