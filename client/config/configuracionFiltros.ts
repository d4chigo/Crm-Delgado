import type { ConfiguracionFiltro } from '@/types/filtros.types';

// Meses
const MESES = [
  { valor: '1', label: 'Enero' },
  { valor: '2', label: 'Febrero' },
  { valor: '3', label: 'Marzo' },
  { valor: '4', label: 'Abril' },
  { valor: '5', label: 'Mayo' },
  { valor: '6', label: 'Junio' },
  { valor: '7', label: 'Julio' },
  { valor: '8', label: 'Agosto' },
  { valor: '9', label: 'Septiembre' },
  { valor: '10', label: 'Octubre' },
  { valor: '11', label: 'Noviembre' },
  { valor: '12', label: 'Diciembre' },
];

// Años (últimos 5 años)
const AÑOS = Array.from({ length: 5 }, (_, i) => {
  const año = new Date().getFullYear() - i;
  return { valor: año.toString(), label: año.toString() };
});

// Estados de leads
const ESTADOS_LEAD = [
  { valor: 'NUEVO', label: 'Nuevo' },
  { valor: 'CONTACTADO', label: 'Contactado' },
  { valor: 'CALIFICADO', label: 'Calificado' },
  { valor: 'NEGOCIACION', label: 'Negociación' },
  { valor: 'PROPUESTA', label: 'Propuesta' },
  { valor: 'GANADO', label: 'Ganado' },
  { valor: 'PERDIDO', label: 'Perdido' },
  { valor: 'EN_ESPERA', label: 'En espera' },
];

// Prioridades
const PRIORIDADES = [
  { valor: 'BAJA', label: 'Baja' },
  { valor: 'MEDIA', label: 'Media' },
  { valor: 'ALTA', label: 'Alta' },
  { valor: 'URGENTE', label: 'Urgente' },
];

// Etapas del pipeline
const ETAPAS_PIPELINE = [
  { valor: 'LEAD', label: 'Lead' },
  { valor: 'CONTACTO', label: 'Contacto' },
  { valor: 'VISITA', label: 'Visita' },
  { valor: 'NEGOCIACION', label: 'Negociación' },
  { valor: 'CIERRE', label: 'Cierre' },
  { valor: 'GANADO', label: 'Ganado' },
  { valor: 'PERDIDO', label: 'Perdido' },
];

// Configuración de filtros para LEADS
export const FILTROS_LEADS: ConfiguracionFiltro[] = [
  {
    tipo: 'mes',
    label: 'Mes',
    placeholder: 'Selecciona un mes',
    opciones: MESES,
  },
  {
    tipo: 'año',
    label: 'Año',
    placeholder: 'Selecciona un año',
    opciones: AÑOS,
  },
  {
    tipo: 'dni',
    label: 'DNI',
    placeholder: 'Ingresa DNI',
    esInput: true,
  },
  {
    tipo: 'estado',
    label: 'Estado',
    placeholder: 'Selecciona estado',
    opciones: ESTADOS_LEAD,
  },
  {
    tipo: 'prioridad',
    label: 'Prioridad',
    placeholder: 'Selecciona prioridad',
    opciones: PRIORIDADES,
  },
  {
    tipo: 'ciudad',
    label: 'Ciudad',
    placeholder: 'Ingresa ciudad',
    esInput: true,
  },
  {
    tipo: 'empresa',
    label: 'Empresa',
    placeholder: 'Ingresa empresa',
    esInput: true,
  },
];

// Configuración de filtros para CLIENTES
export const FILTROS_CLIENTES: ConfiguracionFiltro[] = [
  {
    tipo: 'mes',
    label: 'Mes',
    placeholder: 'Selecciona un mes',
    opciones: MESES,
  },
  {
    tipo: 'año',
    label: 'Año',
    placeholder: 'Selecciona un año',
    opciones: AÑOS,
  },
  {
    tipo: 'dni',
    label: 'DNI',
    placeholder: 'Ingresa DNI',
    esInput: true,
  },
  {
    tipo: 'prioridad',
    label: 'Prioridad',
    placeholder: 'Selecciona prioridad',
    opciones: PRIORIDADES,
  },
  {
    tipo: 'ciudad',
    label: 'Ciudad',
    placeholder: 'Ingresa ciudad',
    esInput: true,
  },
  {
    tipo: 'empresa',
    label: 'Empresa',
    placeholder: 'Ingresa empresa',
    esInput: true,
  },
];

// Configuración de filtros para PIPELINE
export const FILTROS_PIPELINE: ConfiguracionFiltro[] = [
  {
    tipo: 'mes',
    label: 'Mes',
    placeholder: 'Selecciona un mes',
    opciones: MESES,
  },
  {
    tipo: 'año',
    label: 'Año',
    placeholder: 'Selecciona un año',
    opciones: AÑOS,
  },
  {
    tipo: 'etapa',
    label: 'Etapa',
    placeholder: 'Selecciona etapa',
    opciones: ETAPAS_PIPELINE,
  },
  {
    tipo: 'prioridad',
    label: 'Prioridad',
    placeholder: 'Selecciona prioridad',
    opciones: PRIORIDADES,
  },
  {
    tipo: 'dni',
    label: 'DNI',
    placeholder: 'Ingresa DNI',
    esInput: true,
  },
  {
    tipo: 'empresa',
    label: 'Empresa',
    placeholder: 'Ingresa empresa',
    esInput: true,
  },
];
