import { 
  OportunidadCliente, 
  CrearOportunidadDTO, 
  ActualizarOportunidadDTO,
  FiltrosOportunidad,
  EstadisticasOportunidad,
  RespuestaOportunidades,
  EtapaPipeline
} from '@/types/oportunidad.types';
import { fetchAPI } from './config';

/**
 * Crear una nueva oportunidad
 */
export async function crearOportunidad(datos: CrearOportunidadDTO): Promise<OportunidadCliente> {
  return fetchAPI<OportunidadCliente>('/oportunidades', {
    method: 'POST',
    body: JSON.stringify(datos)
  });
}

/**
 * Obtener todas las oportunidades con filtros
 */
export async function obtenerOportunidades(
  filtros?: FiltrosOportunidad
): Promise<RespuestaOportunidades> {
  const params = new URLSearchParams();
  if (filtros?.clienteId) params.append('clienteId', filtros.clienteId);
  if (filtros?.etapa) params.append('etapa', filtros.etapa);
  if (filtros?.busqueda) params.append('busqueda', filtros.busqueda);
  if (filtros?.pagina) params.append('pagina', filtros.pagina.toString());
  if (filtros?.limite) params.append('limite', filtros.limite.toString());

  const url = `/oportunidades${params.toString() ? `?${params.toString()}` : ''}`;
  
  return fetchAPI<RespuestaOportunidades>(url);
}

/**
 * Obtener una oportunidad por ID
 */
export async function obtenerOportunidadPorId(id: string): Promise<OportunidadCliente> {
  return fetchAPI<OportunidadCliente>(`/oportunidades/${id}`);
}

/**
 * Actualizar una oportunidad
 */
export async function actualizarOportunidad(
  id: string,
  datos: ActualizarOportunidadDTO
): Promise<OportunidadCliente> {
  return fetchAPI<OportunidadCliente>(`/oportunidades/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos)
  });
}

/**
 * Cambiar la etapa de una oportunidad
 */
export async function cambiarEtapaOportunidad(
  id: string,
  etapa: EtapaPipeline,
  notas?: string
): Promise<OportunidadCliente> {
  return fetchAPI<OportunidadCliente>(`/oportunidades/${id}/etapa`, {
    method: 'PATCH',
    body: JSON.stringify({ etapa, notas })
  });
}

/**
 * Eliminar una oportunidad
 */
export async function eliminarOportunidad(id: string): Promise<void> {
  return fetchAPI<void>(`/oportunidades/${id}`, {
    method: 'DELETE'
  });
}

/**
 * Obtener estadísticas del pipeline
 */
export async function obtenerEstadisticasOportunidades(): Promise<EstadisticasOportunidad> {
  return fetchAPI<EstadisticasOportunidad>('/oportunidades/estadisticas');
}

/**
 * Obtener oportunidades de un cliente específico
 */
export async function obtenerOportunidadesDeCliente(clienteId: string): Promise<OportunidadCliente[]> {
  return fetchAPI<OportunidadCliente[]>(`/oportunidades/cliente/${clienteId}`);
}

/**
 * Actualizar etapa de oportunidad por leadId (sincronización con estado del lead)
 */
export async function actualizarEtapaOportunidadPorLead(
  leadId: string,
  estadoLead: string
): Promise<OportunidadCliente | null> {
  try {
    // Mapear estados del lead a etapas del pipeline
    const mapeoEstados: { [key: string]: EtapaPipeline } = {
      'CALIFICADO': 'CONTACTO',
      'DESCALIFICADO': 'PERDIDO',
      'NEGOCIACION': 'NEGOCIACION',
      'PROPUESTA': 'CIERRE'
    };

    const etapa = mapeoEstados[estadoLead];
    if (!etapa) return null;

    // Llamar endpoint que actualiza la oportunidad por leadId
    return fetchAPI<OportunidadCliente>(`/oportunidades/por-lead/${leadId}`, {
      method: 'PATCH',
      body: JSON.stringify({ etapa })
    });
  } catch (error) {
    console.error('Error al actualizar oportunidad:', error);
    return null;
  }
}
