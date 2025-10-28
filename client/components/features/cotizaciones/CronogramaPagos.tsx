'use client';

import { ScrollArea } from '@/components/ui/scroll-area';

interface Pago {
  mes: number;
  cuota: number;
  interes: number;
  capital: number;
  saldo: number;
  esCuotaEspecial?: boolean;
}

interface CronogramaPagosProps {
  cronograma: Pago[];
  formatearMoneda: (valor: number) => string;
}

export const CronogramaPagos = ({ cronograma, formatearMoneda }: CronogramaPagosProps) => {
  return (
    <>
      <div className="px-6 pb-2 flex-shrink-0">
        <h4 className="font-semibold text-slate-800">Cronograma de Pagos</h4>
      </div>
      <ScrollArea className="flex-grow px-6">
        <table className="w-full text-xs text-left">
          <thead className="sticky top-0 bg-slate-100">
            <tr>
              <th className="py-2">Mes</th>
              <th className="py-2 text-right">Cuota</th>
              <th className="py-2 text-right">Interés</th>
              <th className="py-2 text-right">Capital</th>
              <th className="py-2 text-right">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {cronograma.map((pago) => (
              <tr key={pago.mes} className={`border-b ${pago.esCuotaEspecial ? 'bg-yellow-100 font-medium' : ''}`}>
                <td className="py-2">{pago.mes}</td>
                <td className="py-2 text-right">{formatearMoneda(pago.cuota)}</td>
                <td className="py-2 text-right text-red-600">{formatearMoneda(pago.interes)}</td>
                <td className="py-2 text-right text-green-600">{formatearMoneda(pago.capital)}</td>
                <td className="py-2 text-right font-medium">{formatearMoneda(pago.saldo)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
    </>
  );
};