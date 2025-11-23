export enum EstadoLead {
  NUEVO = 'NUEVO',
  CONTACTADO = 'CONTACTADO',
  CALIFICADO = 'CALIFICADO',
  NEGOCIACION = 'NEGOCIACION',
  PROPUESTA = 'PROPUESTA',
  GANADO = 'GANADO',
  PERDIDO = 'PERDIDO',
  EN_ESPERA = 'EN_ESPERA'
}

export const ESTADOS_LEAD_DISPLAY = {
  [EstadoLead.NUEVO]: {
    label: 'Sin Contactar',
    icon: '📋',
    color: 'bg-blue-100 text-blue-800',
    description: 'Nuevos leads sin contactar',
    badge: 'bg-blue-500'
  },
  [EstadoLead.CONTACTADO]: {
    label: 'En Contacto',
    icon: '📞',
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Seguimiento inicial en progreso',
    badge: 'bg-yellow-500'
  },
  [EstadoLead.CALIFICADO]: {
    label: 'Calificados',
    icon: '✅',
    color: 'bg-green-100 text-green-800',
    description: 'Listos para oportunidad',
    badge: 'bg-green-500'
  },
  [EstadoLead.NEGOCIACION]: {
    label: 'Negociación',
    icon: '💬',
    color: 'bg-purple-100 text-purple-800',
    description: 'En proceso de negociación',
    badge: 'bg-purple-500'
  },
  [EstadoLead.PROPUESTA]: {
    label: 'Propuesta',
    icon: '📄',
    color: 'bg-indigo-100 text-indigo-800',
    description: 'Propuesta enviada',
    badge: 'bg-indigo-500'
  },
  [EstadoLead.GANADO]: {
    label: 'Ganado',
    icon: '🎉',
    color: 'bg-green-100 text-green-800',
    description: 'Convertido a cliente',
    badge: 'bg-green-500'
  },
  [EstadoLead.PERDIDO]: {
    label: 'Descalificados',
    icon: '❌',
    color: 'bg-gray-100 text-gray-800',
    description: 'Archivados sin interés',
    badge: 'bg-gray-500'
  },
  [EstadoLead.EN_ESPERA]: {
    label: 'En espera',
    icon: '⏳',
    color: 'bg-orange-100 text-orange-800',
    description: 'Esperando seguimiento',
    badge: 'bg-orange-500'
  }
};

export const FILTROS_LEADS = [
  { value: '', label: '👥 Todos los leads' },
  { value: EstadoLead.NUEVO, label: '📋 Sin Contactar' },
  { value: EstadoLead.CONTACTADO, label: '📞 En Contacto' },
  { value: EstadoLead.GANADO, label: '✅ Calificados' },
  { value: EstadoLead.PERDIDO, label: '❌ Descalificados' }
];
