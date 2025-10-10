import { 
  OportunidadCliente, 
  CrearOportunidadDTO, 
  ActualizarOportunidadDTO,
  FiltrosOportunidad,
  EstadisticasOportunidad,
  RespuestaOportunidades,
  EtapaPipeline
} from '@/types/oportunidad.types';
import { obtenerToken } from '@/lib/autenticacion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Crear una nueva oportunidad
 */
export async function crearOportunidad(datos: CrearOportunidadDTO): Promise<OportunidadCliente> {
  const token = obtenerToken();
  
  const respuesta = await fetch(`${API_URL}/oportunidades`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(datos)
  });

  if (!respuesta.ok) {
    const error = await respuesta.json();
    throw new Error(error.mensaje || 'Error al crear oportunidad');
  }

  const resultado = await respuesta.json();
  return resultado.datos;
}

/**
 * Obtener todas las oportunidades con filtros
 */
export async function obtenerOportunidades(
  filtros?: FiltrosOportunidad
): Promise<RespuestaOportunidades> {
  const token = obtenerToken();
  
  const params = new URLSearchParams();
  if (filtros?.clienteId) params.append('clienteId', filtros.clienteId);
  if (filtros?.etapa) params.append('etapa', filtros.etapa);
  if (filtros?.busqueda) params.append('busqueda', filtros.busqueda);
  if (filtros?.pagina) params.append('pagina', filtros.pagina.toString());
  if (filtros?.limite) params.append('limite', filtros.limite.toString());

  const url = `${API_URL}/oportunidades${params.toString() ? `?${params.toString()}` : ''}`;

  const respuesta = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!respuesta.ok) {
    const error = await respuesta.json();
    throw new Error(error.mensaje || 'Error al obtener oportunidades');
  }

  const resultado = await respuesta.json();
  return resultado.datos;
}

/**
 * Obtener una oportunidad por ID
 */
export async function obtenerOportunidadPorId(id: string): Promise<OportunidadCliente> {
  const token = obtenerToken();
  
  const respuesta = await fetch(`${API_URL}/oportunidades/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!respuesta.ok) {
    const error = await respuesta.json();
    throw new Error(error.mensaje || 'Error al obtener oportunidad');
  }

  const resultado = await respuesta.json();
  return resultado.datos;
}

/**
 * Actualizar una oportunidad
 */
export async function actualizarOportunidad(
  id: string,
  datos: ActualizarOportunidadDTO
): Promise<OportunidadCliente> {
  const token = obtenerToken();
  
  const respuesta = await fetch(`${API_URL}/oportunidades/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(datos)
  });

  if (!respuesta.ok) {
    const error = await respuesta.json();
    throw new Error(error.mensaje || 'Error al actualizar oportunidad');
  }

  const resultado = await respuesta.json();
  return resultado.datos;
}

/**
 * Cambiar la etapa de una oportunidad
 */
export async function cambiarEtapaOportunidad(
  id: string,
  etapa: EtapaPipeline,
  notas?: string
): Promise<OportunidadCliente> {
  const token = obtenerToken();
  
  const respuesta = await fetch(`${API_URL}/oportunidades/${id}/etapa`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ etapa, notas })
  });

  if (!respuesta.ok) {
    const error = await respuesta.json();
    throw new Error(error.mensaje || 'Error al cambiar etapa');
  }

  const resultado = await respuesta.json();
  return resultado.datos;
}

/**
 * Eliminar una oportunidad
 */
export async function eliminarOportunidad(id: string): Promise<void> {
  const token = obtenerToken();
  
  const respuesta = await fetch(`${API_URL}/oportunidades/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!respuesta.ok) {
    const error = await respuesta.json();
    throw new Error(error.mensaje || 'Error al eliminar oportunidad');
  }
}

/**
 * Obtener estadísticas del pipeline
 */
export async function obtenerEstadisticasOportunidades(): Promise<EstadisticasOportunidad> {
  const token = obtenerToken();
  
  const respuesta = await fetch(`${API_URL}/oportunidades/estadisticas`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!respuesta.ok) {
    const error = await respuesta.json();
    throw new Error(error.mensaje || 'Error al obtener estadísticas');
  }

  const resultado = await respuesta.json();
  return resultado.datos;
}

/**
 * Obtener oportunidades de un cliente específico
 */
export async function obtenerOportunidadesDeCliente(clienteId: string): Promise<OportunidadCliente[]> {
  const token = obtenerToken();
  
  const respuesta = await fetch(`${API_URL}/oportunidades/cliente/${clienteId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!respuesta.ok) {
    const error = await respuesta.json();
    throw new Error(error.mensaje || 'Error al obtener oportunidades del cliente');
  }

  const resultado = await respuesta.json();
  return resultado.datos;
}
