import { fetchAPI } from './config';
import authService from './auth.service';
import type {
  Contacto,
  CrearContactoDTO,
  ActualizarContactoDTO,
  FiltrosContacto,
  RespuestaContactos,
  EstadisticasContactos,
  LeadCliente,
  AsociarClienteDTO,
  ActualizarAsociacionDTO
} from '@/types/contacto.types';

class ContactoService {
  /**
   * Obtener todos los contactos con filtros
   */
  async obtenerContactos(filtros: FiltrosContacto = {}): Promise<RespuestaContactos> {
    const token = authService.obtenerToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    // Construir query params
    const params = new URLSearchParams();
    
    if (filtros.tipo) params.append('tipo', filtros.tipo);
    if (filtros.ciudad) params.append('ciudad', filtros.ciudad);
    if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
    if (filtros.pagina) params.append('pagina', filtros.pagina.toString());
    if (filtros.limite) params.append('limite', filtros.limite.toString());
    if (filtros.estadoLead) params.append('estadoLead', filtros.estadoLead);

    const queryString = params.toString();
    const url = `/contactos${queryString ? `?${queryString}` : ''}`;

    return fetchAPI<RespuestaContactos>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  /**
   * Obtener estadísticas de contactos
   */
  async obtenerEstadisticas(): Promise<EstadisticasContactos> {
    const token = authService.obtenerToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    return fetchAPI<EstadisticasContactos>('/contactos/estadisticas', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  /**
   * Obtener un contacto por ID
   */
  async obtenerContactoPorId(id: string): Promise<Contacto> {
    const token = authService.obtenerToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    return fetchAPI<Contacto>(`/contactos/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  /**
   * Crear un nuevo contacto
   */
  async crearContacto(datos: CrearContactoDTO): Promise<Contacto> {
    const token = authService.obtenerToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    return fetchAPI<Contacto>('/contactos', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(datos),
    });
  }

  /**
   * Actualizar un contacto
   */
  async actualizarContacto(id: string, datos: ActualizarContactoDTO): Promise<Contacto> {
    const token = authService.obtenerToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    return fetchAPI<Contacto>(`/contactos/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(datos),
    });
  }

  /**
   * Eliminar un contacto
   */
  async eliminarContacto(id: string): Promise<{ mensaje: string }> {
    const token = authService.obtenerToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    return fetchAPI<{ mensaje: string }>(`/contactos/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  /**
   * Convertir contacto a lead
   */
  async convertirALead(id: string): Promise<Contacto> {
    const token = authService.obtenerToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    return fetchAPI<Contacto>(`/contactos/${id}/convertir-lead`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  /**
   * Convertir múltiples contactos a leads
   */
  async convertirVariosALeads(ids: string[]): Promise<{ convertidos: number; total: number; noConvertidos: number }> {
    const token = authService.obtenerToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    return fetchAPI<{ convertidos: number; total: number; noConvertidos: number }>('/contactos/convertir-leads/masivo', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });
  }

  /**
   * Asociar un cliente a un lead
   */
  async asociarCliente(leadId: string, datos: AsociarClienteDTO): Promise<LeadCliente> {
    const token = authService.obtenerToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    return fetchAPI<LeadCliente>(`/contactos/${leadId}/clientes`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(datos),
    });
  }

  /**
   * Obtener clientes asociados a un lead
   */
  async obtenerClientesDeLeads(leadId: string): Promise<LeadCliente[]> {
    const token = authService.obtenerToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    return fetchAPI<LeadCliente[]>(`/contactos/${leadId}/clientes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  /**
   * Actualizar la asociación entre lead y cliente (notas/estado)
   */
  async actualizarAsociacion(
    leadId: string,
    clienteId: string,
    datos: ActualizarAsociacionDTO
  ): Promise<LeadCliente> {
    const token = authService.obtenerToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    return fetchAPI<LeadCliente>(`/contactos/${leadId}/clientes/${clienteId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(datos),
    });
  }

  /**
   * Desasociar un cliente de un lead
   */
  async desasociarCliente(leadId: string, clienteId: string): Promise<{ mensaje: string }> {
    const token = authService.obtenerToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    return fetchAPI<{ mensaje: string }>(`/contactos/${leadId}/clientes/${clienteId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  /**
   * Importar contactos desde Google
   */
  async importarDesdeGoogle(accessToken: string): Promise<{ importados: number; duplicados: number; errores: number }> {
    const token = authService.obtenerToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    return fetchAPI<{ importados: number; duplicados: number; errores: number }>('/contactos/importar/google', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken }),
    });
  }
}

export default new ContactoService();
