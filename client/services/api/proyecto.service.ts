import { Proyecto, DatosFormularioProyecto, DatosAsociarCliente, FiltrosProyecto } from '@/types/proyecto.types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

/**
 * Servicio para gestionar proyectos
 */
export const proyectoService = {
  /**
   * Obtener todos los proyectos con filtros opcionales
   */
  async obtenerTodos(filtros?: FiltrosProyecto): Promise<Proyecto[]> {
    try {
      const token = localStorage.getItem('crm_token')
      if (!token) {
        throw new Error('No autenticado: falta token (crm_token)')
      }
      
      const params = new URLSearchParams()
      if (filtros?.etiquetaId) params.append('etiquetaId', filtros.etiquetaId)
      if (filtros?.estado) params.append('estado', filtros.estado)
      if (filtros?.activo !== undefined) params.append('activo', String(filtros.activo))

      const url = `${API_URL}/proyectos${params.toString() ? `?${params.toString()}` : ''}`
      console.log('[proyectoService] GET', url)

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('[proyectoService] status', response.status)
      if (!response.ok) {
        let mensaje = `Error ${response.status} al obtener proyectos`
        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const body = await response.json()
            mensaje = body.mensaje || body.message || body.error || mensaje
          } else {
            const text = await response.text()
            if (text) mensaje = `${mensaje}: ${text}`
          }
        } catch {}
        throw new Error(mensaje)
      }

      const resultado = await response.json()
      // Asegurarse de que siempre devolvamos un array, ya sea que venga en resultado o resultado.datos
      const proyectos = Array.isArray(resultado) ? resultado : (resultado.datos || []);
      
      // Procesar las rutas de las imágenes para Electron
      if (typeof window !== 'undefined' && window.electron) {
        return proyectos.map((proyecto: any) => ({
          ...proyecto,
          // Si la imagen es una ruta local, convertirla a formato file://
          imagen: proyecto.imagen && !proyecto.imagen.startsWith('http') 
            ? `file://${proyecto.imagen.replace(/\\/g, '/')}`
            : proyecto.imagen
        }));
      }
      
      return proyectos;
    } catch (error) {
      console.error('Error al obtener proyectos:', error)
      throw error
    }
  },

  /**
   * Obtener un proyecto por ID
   */
  async obtenerPorId(id: string): Promise<Proyecto> {
    try {
      const token = localStorage.getItem('crm_token')
      if (!token) {
        throw new Error('No autenticado: falta token (crm_token)')
      }

      const response = await fetch(`${API_URL}/proyectos/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        let mensaje = `Error ${response.status} al obtener proyecto`
        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const body = await response.json()
            mensaje = body.mensaje || body.message || body.error || mensaje
          } else {
            const text = await response.text()
            if (text) mensaje = `${mensaje}: ${text}`
          }
        } catch {}
        throw new Error(mensaje)
      }

      const resultado = await response.json()
      const proyecto = resultado.datos;
      
      // Procesar la ruta de la imagen para Electron
      if (proyecto?.imagen && typeof window !== 'undefined' && window.electron && !proyecto.imagen.startsWith('http')) {
        return {
          ...proyecto,
          imagen: `file://${proyecto.imagen.replace(/\\/g, '/')}`
        };
      }
      
      return proyecto;
    } catch (error) {
      console.error('Error al obtener proyecto:', error)
      throw error
    }
  },

  /**
   * Crear un nuevo proyecto
   */
  async crear(datos: DatosFormularioProyecto): Promise<Proyecto> {
    try {
      const token = localStorage.getItem('crm_token')
      if (!token) {
        throw new Error('No autenticado: falta token (crm_token)')
      }

      const response = await fetch(`${API_URL}/proyectos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datos)
      })

      if (!response.ok) {
        let mensaje = 'Error al crear proyecto'
        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const error = await response.json()
            mensaje = error.mensaje || error.message || error.error || mensaje
          } else {
            const text = await response.text()
            if (text) mensaje = `${mensaje}: ${text}`
          }
        } catch {}
        throw new Error(mensaje)
      }

      const resultado = await response.json()
      return resultado.datos
    } catch (error) {
      console.error('Error al crear proyecto:', error)
      throw error
    }
  },

  /**
   * Actualizar un proyecto existente
   */
  async actualizar(id: string, datos: Partial<DatosFormularioProyecto>): Promise<Proyecto> {
    try {
      const token = localStorage.getItem('crm_token')
      if (!token) {
        throw new Error('No autenticado: falta token (crm_token)')
      }

      const response = await fetch(`${API_URL}/proyectos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datos)
      })

      if (!response.ok) {
        let mensaje = 'Error al actualizar proyecto'
        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const error = await response.json()
            mensaje = error.mensaje || error.message || error.error || mensaje
          } else {
            const text = await response.text()
            if (text) mensaje = `${mensaje}: ${text}`
          }
        } catch {}
        throw new Error(mensaje)
      }

      const resultado = await response.json()
      return resultado.datos
    } catch (error) {
      console.error('Error al actualizar proyecto:', error)
      throw error
    }
  },

  /**
   * Eliminar un proyecto (soft delete)
   */
  async eliminar(id: string): Promise<void> {
    try {
      const token = localStorage.getItem('crm_token')
      if (!token) {
        throw new Error('No autenticado: falta token (crm_token)')
      }

      const response = await fetch(`${API_URL}/proyectos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        let mensaje = 'Error al eliminar proyecto'
        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const error = await response.json()
            mensaje = error.mensaje || error.message || error.error || mensaje
          } else {
            const text = await response.text()
            if (text) mensaje = `${mensaje}: ${text}`
          }
        } catch {}
        throw new Error(mensaje)
      }
    } catch (error) {
      console.error('Error al eliminar proyecto:', error)
      throw error
    }
  },

  /**
   * Asignar etiquetas a un proyecto
   */
  async asignarEtiquetas(id: string, etiquetaIds: string[]): Promise<Proyecto> {
    try {
      const token = localStorage.getItem('crm_token')

      const response = await fetch(`${API_URL}/proyectos/${id}/etiquetas`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ etiquetaIds })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.mensaje || 'Error al asignar etiquetas')
      }

      const resultado = await response.json()
      return resultado.datos
    } catch (error) {
      console.error('Error al asignar etiquetas:', error)
      throw error
    }
  },

  /**
   * Asociar un cliente a un proyecto
   */
  async asociarCliente(id: string, datos: DatosAsociarCliente): Promise<Proyecto> {
    try {
      const token = localStorage.getItem('crm_token')

      const response = await fetch(`${API_URL}/proyectos/${id}/clientes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datos)
      })

      if (!response.ok) {
        let errorMessage = 'Error al asociar cliente';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const error = await response.json();
            errorMessage = error.mensaje || error.message || errorMessage;
          } else {
            const textError = await response.text();
            errorMessage = textError || errorMessage;
          }
        } catch (e) {
          console.error('Error al parsear respuesta:', e);
        }
        throw new Error(errorMessage);
      }

      const resultado = await response.json()
      return resultado.datos
    } catch (error) {
      console.error('Error al asociar cliente:', error)
      throw error
    }
  },

  /**
   * Actualizar notas de un cliente asociado
   */
  async actualizarNotasCliente(proyectoId: string, clienteId: string, notas: string): Promise<Proyecto> {
    try {
      const token = localStorage.getItem('crm_token')

      const response = await fetch(`${API_URL}/proyectos/${proyectoId}/clientes/${clienteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notas })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.mensaje || 'Error al actualizar notas')
      }

      const resultado = await response.json()
      return resultado.datos
    } catch (error) {
      console.error('Error al actualizar notas:', error)
      throw error
    }
  },

  /**
   * Desasociar un cliente de un proyecto
   */
  async desasociarCliente(proyectoId: string, clienteId: string): Promise<Proyecto> {
    try {
      const token = localStorage.getItem('crm_token')

      const response = await fetch(`${API_URL}/proyectos/${proyectoId}/clientes/${clienteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        let errorMessage = 'Error al desasociar cliente';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const error = await response.json();
            errorMessage = error.mensaje || error.message || errorMessage;
          } else {
            const textError = await response.text();
            errorMessage = textError || errorMessage;
          }
        } catch (e) {
          console.error('Error al parsear respuesta:', e);
        }
        throw new Error(errorMessage);
      }

      const resultado = await response.json()
      return resultado.datos
    } catch (error) {
      console.error('Error al desasociar cliente:', error)
      throw error
    }
  },

  /**
   * Obtener proyectos de un cliente específico
   */
  async obtenerPorCliente(clienteId: string): Promise<Proyecto[]> {
    try {
      const token = localStorage.getItem('crm_token')

      const response = await fetch(`${API_URL}/proyectos/cliente/${clienteId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al obtener proyectos del cliente')
      }

      const resultado = await response.json()
      return resultado.datos || []
    } catch (error) {
      console.error('Error al obtener proyectos del cliente:', error)
      throw error
    }
  },

  /**
   * Obtener proyectos de un contacto (lead o cliente)
   */
  async obtenerPorContacto(contactoId: string): Promise<Proyecto[]> {
    try {
      const token = localStorage.getItem('crm_token')

      const response = await fetch(`${API_URL}/proyectos/contacto/${contactoId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al obtener proyectos del contacto')
      }

      const resultado = await response.json()
      return resultado.datos || []
    } catch (error) {
      console.error('Error al obtener proyectos del contacto:', error)
      throw error
    }
  }
}
