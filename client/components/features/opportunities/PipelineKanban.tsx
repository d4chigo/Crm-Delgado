"use client"

import React, { useState } from 'react';
import { Trash2, DollarSign, TrendingUp } from 'lucide-react';

interface Tarjeta {
  id: string;
  titulo: string;
  valor?: number;
  cliente?: string;
  probabilidad?: number;
}

interface Columna {
  id: string;
  titulo: string;
  color: string;
  icono?: string;
  tarjetas: Tarjeta[];
}

interface PipelineKanbanProps {
  columnas: Columna[];
  onMoverTarjeta?: (tarjetaId: string, columnaDesdeId: string, columnaHastaId: string) => void;
  onEliminarTarjeta?: (tarjetaId: string) => void;
}

export const PipelineKanban: React.FC<PipelineKanbanProps> = ({
  columnas,
  onMoverTarjeta,
  onEliminarTarjeta
}) => {
  const [draggedCard, setDraggedCard] = useState<{ cardId: string; fromColumnId: string } | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);

  const handleDragStart = (cardId: string, columnId: string) => {
    setDraggedCard({ cardId, fromColumnId: columnId });
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDraggedOverColumn(columnId);
  };

  const handleDrop = (e: React.DragEvent, toColumnId: string) => {
    e.preventDefault();
    if (draggedCard && draggedCard.fromColumnId !== toColumnId) {
      onMoverTarjeta?.(draggedCard.cardId, draggedCard.fromColumnId, toColumnId);
    }
    setDraggedCard(null);
    setDraggedOverColumn(null);
  };

  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  const colorMap: { [key: string]: string } = {
    'bg-blue-500': 'bg-blue-100 dark:bg-blue-900 border-l-4 border-blue-500',
    'bg-purple-500': 'bg-purple-100 dark:bg-purple-900 border-l-4 border-purple-500',
    'bg-yellow-500': 'bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500',
    'bg-green-500': 'bg-green-100 dark:bg-green-900 border-l-4 border-green-500',
    'bg-red-500': 'bg-red-100 dark:bg-red-900 border-l-4 border-red-500',
  };

  return (
    <div className="w-full overflow-x-auto bg-white dark:bg-gray-800 rounded-lg p-6">
      <div className="flex gap-4 min-w-max">
        {columnas.map((columna) => {
          const totalValor = columna.tarjetas.reduce((sum, t) => sum + (t.valor || 0), 0);
          const totalProbabilidad = columna.tarjetas.length > 0 
            ? Math.round(columna.tarjetas.reduce((sum, t) => sum + (t.probabilidad || 0), 0) / columna.tarjetas.length)
            : 0;

          return (
            <div
              key={columna.id}
              className="w-72 flex-shrink-0"
            >
              {/* Encabezado de la columna */}
              <div className={`${columna.color} rounded-t-lg p-4 text-white`}>
                <h3 className="font-bold text-lg">{columna.titulo}</h3>
                <p className="text-sm text-white text-opacity-80 mt-1">
                  {columna.tarjetas.length} oportunidades
                </p>
              </div>

              {/* Estadísticas */}
              <div className={`${colorMap[columna.color] || 'bg-gray-50'} p-3 border-b`}>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <DollarSign size={14} className="text-green-600" />
                    <span className="font-semibold text-green-600">${(totalValor / 1000).toFixed(1)}K</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp size={14} className="text-blue-600" />
                    <span className="font-semibold text-blue-600">{totalProbabilidad}%</span>
                  </div>
                </div>
              </div>

              {/* Área de drop */}
              <div
                onDragOver={(e) => handleDragOver(e, columna.id)}
                onDrop={(e) => handleDrop(e, columna.id)}
                onDragLeave={handleDragLeave}
                className={`min-h-96 bg-white dark:bg-gray-700 rounded-b-lg p-3 transition-all ${
                  draggedOverColumn === columna.id ? 'ring-2 ring-blue-400 bg-blue-50 dark:bg-blue-900' : ''
                }`}
              >
                <div className="space-y-2">
                  {columna.tarjetas.map((tarjeta) => (
                    <div
                      key={tarjeta.id}
                      draggable
                      onDragStart={() => handleDragStart(tarjeta.id, columna.id)}
                      className="bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg p-3 cursor-move hover:shadow-lg transition-shadow group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {tarjeta.titulo}
                          </h4>
                          {tarjeta.cliente && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {tarjeta.cliente}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => onEliminarTarjeta?.(tarjeta.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Información adicional */}
                      <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-500 flex items-center justify-between text-xs">
                        {tarjeta.valor && (
                          <span className="text-green-600 dark:text-green-400 font-semibold">
                            ${(tarjeta.valor / 1000).toFixed(1)}K
                          </span>
                        )}
                        {tarjeta.probabilidad && (
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">
                            {tarjeta.probabilidad}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {columna.tarjetas.length === 0 && (
                    <div className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-500">
                      <p className="text-sm">Sin oportunidades</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Papelera */}
        <div className="w-72 flex-shrink-0">
          <div className="bg-red-500 rounded-t-lg p-4 text-white">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Trash2 size={18} />
              Papelera
            </h3>
          </div>

          <div className="bg-red-50 dark:bg-red-900 p-3 border-b border-red-200 dark:border-red-700">
            <p className="text-xs text-red-600 dark:text-red-300">Arrastra aquí para eliminar</p>
          </div>

          <div
            onDragOver={(e) => handleDragOver(e, 'trash')}
            onDrop={(e) => handleDrop(e, 'trash')}
            onDragLeave={handleDragLeave}
            className={`min-h-96 bg-white dark:bg-gray-700 rounded-b-lg p-3 transition-all flex items-center justify-center ${
              draggedOverColumn === 'trash' ? 'ring-2 ring-red-400 bg-red-50 dark:bg-red-900' : ''
            }`}
          >
            <div className="text-center text-gray-400 dark:text-gray-500">
              <Trash2 size={40} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Eliminar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineKanban;
