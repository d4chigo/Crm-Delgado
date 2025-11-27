import type { Contacto } from '@/types/contacto.types';
import type { OportunidadCliente } from '@/types/oportunidad.types';

/**
 * Funciones de mapeo para filtros de LEADS
 */
export const mapeoFiltrosLeads = {
  mes: (item: Contacto, valor: string) => {
    const fecha = new Date(item.creadoEn);
    return (fecha.getMonth() + 1).toString() === valor;
  },
  año: (item: Contacto, valor: string) => {
    const fecha = new Date(item.creadoEn);
    return fecha.getFullYear().toString() === valor;
  },
  dni: (item: Contacto, valor: string) => {
    return item.dni?.toLowerCase().includes(valor.toLowerCase()) || false;
  },
  estado: (item: Contacto, valor: string) => {
    return item.estadoLead === valor;
  },
  prioridad: (item: Contacto, valor: string) => {
    return item.prioridad === valor;
  },
  ciudad: (item: Contacto, valor: string) => {
    return item.ciudad?.toLowerCase().includes(valor.toLowerCase()) || false;
  },
  empresa: (item: Contacto, valor: string) => {
    return item.empresa?.toLowerCase().includes(valor.toLowerCase()) || false;
  },
  etiqueta: (item: Contacto, valor: string) => {
    return item.etiquetas?.some(e => e.etiqueta.id === valor) || false;
  },
};

/**
 * Funciones de mapeo para filtros de CLIENTES
 */
export const mapeoFiltrosClientes = {
  mes: (item: Contacto, valor: string) => {
    const fecha = new Date(item.creadoEn);
    return (fecha.getMonth() + 1).toString() === valor;
  },
  año: (item: Contacto, valor: string) => {
    const fecha = new Date(item.creadoEn);
    return fecha.getFullYear().toString() === valor;
  },
  dni: (item: Contacto, valor: string) => {
    return item.dni?.toLowerCase().includes(valor.toLowerCase()) || false;
  },
  prioridad: (item: Contacto, valor: string) => {
    return item.prioridad === valor;
  },
  ciudad: (item: Contacto, valor: string) => {
    return item.ciudad?.toLowerCase().includes(valor.toLowerCase()) || false;
  },
  empresa: (item: Contacto, valor: string) => {
    return item.empresa?.toLowerCase().includes(valor.toLowerCase()) || false;
  },
  etiqueta: (item: Contacto, valor: string) => {
    return item.etiquetas?.some(e => e.etiqueta.id === valor) || false;
  },
};

/**
 * Funciones de mapeo para filtros de PIPELINE
 */
export const mapeoFiltrosPipeline = {
  mes: (item: OportunidadCliente, valor: string) => {
    const fecha = new Date(item.creadoEn);
    return (fecha.getMonth() + 1).toString() === valor;
  },
  año: (item: OportunidadCliente, valor: string) => {
    const fecha = new Date(item.creadoEn);
    return fecha.getFullYear().toString() === valor;
  },
  etapa: (item: OportunidadCliente, valor: string) => {
    return item.etapa === valor;
  },
  prioridad: (item: OportunidadCliente, valor: string) => {
    // Obtener prioridad del cliente asociado
    return item.cliente?.etiquetasRel?.some(e => e.etiqueta.id === valor) || false;
  },
  dni: (item: OportunidadCliente, valor: string) => {
    const clienteDni = (item.cliente as any)?.dni;
    return clienteDni?.toLowerCase().includes(valor.toLowerCase()) || false;
  },
  empresa: (item: OportunidadCliente, valor: string) => {
    const clienteEmpresa = (item.cliente as any)?.empresa;
    return clienteEmpresa?.toLowerCase().includes(valor.toLowerCase()) || false;
  },
};
