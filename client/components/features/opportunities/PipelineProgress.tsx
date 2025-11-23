import React from 'react';
import { STAGE_LABELS, STAGE_COLORS, STAGE_PROBABILITIES, STAGES_ORDER } from '@/lib/pipeline-stages';

interface PipelineStageProps {
  stage: string;
  probabilidad: number;
  isActive?: boolean;
  onClick?: () => void;
}

const PipelineStageItem: React.FC<PipelineStageProps> = ({
  stage,
  probabilidad,
  isActive = false,
  onClick
}) => {
  const label = STAGE_LABELS[stage] || stage;
  const color = STAGE_COLORS[stage] || '#6b7280';

  return (
    <div
      className={`flex flex-col items-center cursor-pointer transition-all ${
        isActive ? 'opacity-100 scale-105' : 'opacity-70 hover:opacity-85'
      }`}
      onClick={onClick}
    >
      {/* Circle with stage icon */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold shadow-md hover:shadow-lg transition-shadow"
        style={{ backgroundColor: color }}
      >
        <div className="text-center">
          <div className="text-2xl font-bold">{probabilidad}%</div>
        </div>
      </div>
      {/* Stage label */}
      <div className="mt-2 text-xs font-medium text-center text-gray-700 dark:text-gray-300">
        {label}
      </div>
    </div>
  );
};

interface PipelineProgressProps {
  currentStage?: string;
  stages?: string[];
  onStageClick?: (stage: string) => void;
  showProbabilities?: boolean;
  className?: string;
}

/**
 * Componente para visualizar el Pipeline de Etapas
 * Muestra todas las etapas con sus probabilidades y permite interacción
 */
export const PipelineProgress: React.FC<PipelineProgressProps> = ({
  currentStage = 'CONTACTO_INICIAL',
  stages = STAGES_ORDER,
  onStageClick,
  showProbabilities = true,
  className = ''
}) => {
  return (
    <div className={`w-full bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md ${className}`}>
      {/* Header */}
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
        Pipeline de Ventas
      </h3>

      {/* Stages Container */}
      <div className="relative">
        {/* Connection line */}
        <div className="absolute top-8 left-8 right-8 h-1 bg-gray-200 dark:bg-gray-600 -z-10">
          {/* Progress fill */}
          {currentStage && (
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{
                width: `${(stages.indexOf(currentStage) / (stages.length - 1)) * 100}%`
              }}
            />
          )}
        </div>

        {/* Stages */}
        <div className="flex justify-between items-start px-4">
          {stages.map((stage) => (
            <PipelineStageItem
              key={stage}
              stage={stage}
              probabilidad={STAGE_PROBABILITIES[stage] || 25}
              isActive={stage === currentStage}
              onClick={() => onStageClick?.(stage)}
            />
          ))}
        </div>
      </div>

      {/* Current stage info */}
      {currentStage && (
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Etapa Actual</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                {STAGE_LABELS[currentStage] || currentStage}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Probabilidad</p>
              <p className="text-3xl font-bold" style={{ color: STAGE_COLORS[currentStage] }}>
                {STAGE_PROBABILITIES[currentStage] || 25}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Componente compacto del pipeline para tarjetas
 */
export const PipelineProgressCompact: React.FC<{
  stage: string;
  className?: string;
}> = ({ stage, className = '' }) => {
  const label = STAGE_LABELS[stage] || stage;
  const color = STAGE_COLORS[stage] || '#6b7280';
  const probability = STAGE_PROBABILITIES[stage] || 25;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className="px-3 py-1 rounded-full text-white text-xs font-semibold"
        style={{ backgroundColor: color }}
      >
        {label}
      </div>
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
        {probability}%
      </span>
    </div>
  );
};

export default PipelineProgress;
