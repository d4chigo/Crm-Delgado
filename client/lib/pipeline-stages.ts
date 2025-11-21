/**
 * Configuración del Pipeline de Etapas
 */

export const PIPELINE_STAGES = {
  CONTACTO_INICIAL: 'CONTACTO_INICIAL',
  AGENDAMIENTO: 'AGENDAMIENTO',
  SEPARACION: 'SEPARACION',
  CIERRE_GANADO: 'CIERRE_GANADO',
  CIERRE_PERDIDO: 'CIERRE_PERDIDO',
  FIDELIZACION: 'FIDELIZACION'
} as const;

export const STAGE_LABELS: Record<string, string> = {
  'CONTACTO_INICIAL': 'Contacto Inicial',
  'AGENDAMIENTO': 'Agendamiento',
  'SEPARACION': 'Separación',
  'CIERRE_GANADO': 'Cierre Ganado',
  'CIERRE_PERDIDO': 'Cierre Perdido',
  'FIDELIZACION': 'Fidelización'
};

export const STAGE_PROBABILITIES: Record<string, number> = {
  'CONTACTO_INICIAL': 25,
  'AGENDAMIENTO': 40,
  'SEPARACION': 60,
  'CIERRE_GANADO': 100,
  'CIERRE_PERDIDO': 0,
  'FIDELIZACION': 100
};

export const STAGE_COLORS: Record<string, string> = {
  'CONTACTO_INICIAL': '#3b82f6', // Blue
  'AGENDAMIENTO': '#8b5cf6',      // Purple
  'SEPARACION': '#f59e0b',        // Amber
  'CIERRE_GANADO': '#10b981',     // Green
  'CIERRE_PERDIDO': '#ef4444',    // Red
  'FIDELIZACION': '#06b6d4'       // Cyan
};

/**
 * Obtener label amigable para una etapa
 */
export function getStageLabelMx(stage: string): string {
  return STAGE_LABELS[stage] || stage;
}

/**
 * Obtener probabilidad para una etapa
 */
export function getStageProbability(stage: string): number {
  return STAGE_PROBABILITIES[stage] || 25;
}

/**
 * Obtener color para una etapa
 */
export function getStageColor(stage: string): string {
  return STAGE_COLORS[stage] || '#6b7280';
}

/**
 * Orden de las etapas en el pipeline
 */
export const STAGES_ORDER = [
  'CONTACTO_INICIAL',
  'AGENDAMIENTO',
  'SEPARACION',
  'CIERRE_GANADO',
  'CIERRE_PERDIDO',
  'FIDELIZACION'
];

/**
 * Calcular progreso del pipeline
 */
export function calculatePipelineProgress(currentStage: string): number {
  const index = STAGES_ORDER.indexOf(currentStage);
  if (index === -1) return 0;
  // Excluir las etapas finales (CIERRE_GANADO, CIERRE_PERDIDO, FIDELIZACION)
  const progressStages = ['CONTACTO_INICIAL', 'AGENDAMIENTO', 'SEPARACION'];
  if (!progressStages.includes(currentStage)) {
    return progressStages.length > 0 ? (progressStages.length / progressStages.length) * 100 : 0;
  }
  return ((index + 1) / progressStages.length) * 100;
}
