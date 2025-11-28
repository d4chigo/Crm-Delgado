'use client';

import { useEffect, useState } from 'react';

/**
 * Componente para mostrar errores de API en pantalla
 * Captura errores de la consola y los muestra visualmente
 */
export function ErrorDisplay() {
  const [errores, setErrores] = useState<string[]>([]);
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    // Capturar errores de consola
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args: any[]) => {
      const mensaje = args.map(arg => 
        typeof arg === 'string' ? arg : JSON.stringify(arg)
      ).join(' ');
      
      if (mensaje.includes('[API]')) {
        setErrores(prev => [...prev, mensaje]);
        setMostrar(true);
      }
      
      originalError.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      const mensaje = args.map(arg => 
        typeof arg === 'string' ? arg : JSON.stringify(arg)
      ).join(' ');
      
      if (mensaje.includes('[API]')) {
        setErrores(prev => [...prev, mensaje]);
        setMostrar(true);
      }
      
      originalWarn.apply(console, args);
    };

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  if (!mostrar || errores.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-red-900 text-white p-4 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Errores detectados:</h3>
        <button
          onClick={() => setMostrar(false)}
          className="text-sm bg-red-700 hover:bg-red-600 px-2 py-1 rounded"
        >
          Cerrar
        </button>
      </div>
      <div className="space-y-2 text-sm">
        {errores.slice(-5).map((error, idx) => (
          <div key={idx} className="bg-red-800 p-2 rounded text-xs font-mono">
            {error}
          </div>
        ))}
      </div>
      <button
        onClick={() => setErrores([])}
        className="mt-2 w-full text-xs bg-red-700 hover:bg-red-600 px-2 py-1 rounded"
      >
        Limpiar errores
      </button>
    </div>
  );
}
