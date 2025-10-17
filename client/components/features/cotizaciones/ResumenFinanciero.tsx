'use client';

interface ResumenFinancieroProps {
  montoFinanciar: number;
  totalIntereses: number;
  cuotaMensual: number;
  formatearMoneda: (valor: number) => string;
}

export const ResumenFinanciero = ({ montoFinanciar, totalIntereses, cuotaMensual, formatearMoneda }: ResumenFinancieroProps) => {
  return (
    <div className="p-6 space-y-4 flex-shrink-0">
      <h3 className="text-xl font-bold text-slate-800">Resumen Financiero</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-white p-3 rounded-lg border">
          <p className="text-muted-foreground">Monto a Financiar</p>
          <p className="font-bold text-lg">{formatearMoneda(montoFinanciar)}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border">
          <p className="text-muted-foreground">Total Intereses</p>
          <p className="font-bold text-lg">{formatearMoneda(totalIntereses)}</p>
        </div>
        <div className="col-span-2 bg-blue-100 p-4 rounded-lg border border-blue-200 text-center">
          <p className="text-blue-800 font-semibold">Cuota Mensual (Aprox.)</p>
          <p className="font-bold text-3xl text-blue-600">{formatearMoneda(cuotaMensual)}</p>
        </div>
      </div>
    </div>
  );
};