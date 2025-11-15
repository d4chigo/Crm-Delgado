/**
 * Servicio de Leads
 * Alias del servicio de contactos que ahora maneja todos los leads
 */

import { fetchAPI } from './config';
import authService from './auth.service';

class LeadService {
  /**
   * Obtener todos los leads
   */
  async obtenerLeads(filtros?: any) {
    const token = authService.obtenerToken();
    if (!token) throw new Error('No hay token de autenticación');

    const params = new URLSearchParams();
    if (filtros?.tipo) params.append('tipo', filtros.tipo);
    if (filtros?.pagina) params.append('pagina', filtros.pagina);
    if (filtros?.limite) params.append('limite', filtros.limite);
    if (filtros?.busqueda) params.append('busqueda', filtros.busqueda);
    if (filtros?.estadoLead) params.append('estadoLead', filtros.estadoLead);

    const queryString = params.toString();
    const url = `/contactos${queryString ? `?${queryString}` : ''}`;

    return fetchAPI(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  /**
   * Obtener un lead por ID
   */
  async obtenerLeadPorId(id: string) {
    const token = authService.obtenerToken();
    if (!token) throw new Error('No hay token de autenticación');

    return fetchAPI(`/contactos/${id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  /**
   * Crear un nuevo lead
   */
  async crearLead(datos: any) {
    const token = authService.obtenerToken();
    if (!token) throw new Error('No hay token de autenticación');

    return fetchAPI('/contactos', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(datos),
    });
  }

  /**
   * Actualizar un lead
   */
  async actualizarLead(id: string, datos: any) {
    const token = authService.obtenerToken();
    if (!token) throw new Error('No hay token de autenticación');

    return fetchAPI(`/contactos/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(datos),
    });
  }

  /**
   * Eliminar un lead
   */
  async eliminarLead(id: string) {
    const token = authService.obtenerToken();
    if (!token) throw new Error('No hay token de autenticación');

    return fetchAPI(`/contactos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  /**
   * Convertir un lead a cliente
   */
  async convertirACliente(id: string) {
    const token = authService.obtenerToken();
    if (!token) throw new Error('No hay token de autenticación');

    return fetchAPI(`/contactos/${id}/convertir-cliente`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  /**
   * Obtener estadísticas de leads
   */
  async obtenerEstadisticas() {
    const token = authService.obtenerToken();
    if (!token) throw new Error('No hay token de autenticación');

    return fetchAPI('/contactos/estadisticas', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  /**
   * Eliminar un contacto
   */
  async eliminarContacto(id: string) {
    const token = authService.obtenerToken();
    if (!token) throw new Error('No hay token de autenticación');

    return fetchAPI(`/contactos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  /**
   * Agregar un lead al pipeline (crear oportunidad)
   */
  async agregarAlPipeline(id: string, datos?: any) {
    const token = authService.obtenerToken();
    if (!token) throw new Error('No hay token de autenticación');

    return fetchAPI(`/contactos/${id}/agregar-pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: datos ? JSON.stringify(datos) : undefined,
    });
  }
}

export default new LeadService();
