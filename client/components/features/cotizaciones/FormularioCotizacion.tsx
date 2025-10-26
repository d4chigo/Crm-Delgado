'use client';

import { useState, useEffect, useMemo } from 'react';
import { DollarSign, Calendar, Percent, Building, Info, FileText, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { 
  CrearCotizacionDTO, 
  Cotizacion,
  TipoCuota 
} from '@/types/cotizacion.types';
import { TIPOS_CUOTA_LABELS } from '@/types/cotizacion.types';
import { cotizacionService } from '@/services/api/cotizacion.service';

// Enhanced UI components for this specific form
const FormSection = ({ title, children }) => (
  <section>
    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{title}</h3>
    <div className="p-4 border rounded-lg bg-white space-y-4">
      {children}
    </div>
  </section>
);

const IconInput = ({ icon: Icon, ...props }) => (
  <div className="relative flex items-center">
    <Icon className="absolute left-3 h-4 w-4 text-gray-400" />
    <Input {...props} className="pl-9 text-sm h-9" />
  </div>
);

interface FormularioCotizacionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGuardar: (datos: CrearCotizacionDTO) => Promise<void>;
  cotizacion?: Cotizacion | null;
  contactoId: string;
  nombreContacto?: string;
}

export const FormularioCotizacion = ({
  open,
  onOpenChange,
  onGuardar,
  cotizacion,
  contactoId,
  nombreContacto
}: FormularioCotizacionProps) => {
  const [guardando, setGuardando] = useState(false);
  const [datos, setDatos] = useState<CrearCotizacionDTO>({
    contactoId,
    nombreProyecto: '',
    tipoInmueble: '',
    descripcion: '',
    precioInmueble: 0,
    cuotaInicial: 0,
    plazoMeses: 1,
    tipoCuota: 'FIJA',
    tasaInteresAnual: 0,
    permitePostergar: false,
    cuotasPostergables: 0,
    permiteDoble: false,
    cuotasDoblesAnuales: 0,
    permiteCambioFecha: false,
    frecuenciaCuotaEspecial: undefined,
    cuotaEspecialTipo: undefined,
    cuotaEspecialValor: undefined,
    montoCuotaManual: undefined,
    notas: '',
    fechaValidez: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
  });

  useEffect(() => {
    if (cotizacion) setDatos(prev => ({ ...prev, ...cotizacion }));
    else setDatos(prev => ({ ...prev, contactoId }));
  }, [cotizacion, contactoId]);

  const calculosEnVivo = useMemo(() => cotizacionService.calcularTotales(datos.precioInmueble, datos.cuotaInicial, datos.tasaInteresAnual, datos.plazoMeses, { 
    modalidadPago: datos.tipoCuota as any,
    frecuenciaCuotaEspecial: datos.frecuenciaCuotaEspecial as any,
    cuotaEspecialTipo: datos.cuotaEspecialTipo as any,
    cuotaEspecialValor: datos.cuotaEspecialValor as any,
    montoCuotaManual: datos.montoCuotaManual
  }), [datos.precioInmueble, datos.cuotaInicial, datos.tasaInteresAnual, datos.plazoMeses, datos.tipoCuota, datos.frecuenciaCuotaEspecial, datos.cuotaEspecialTipo, datos.cuotaEspecialValor, datos.montoCuotaManual]);
  
  const cronogramaPagos = useMemo(() => cotizacionService.calcularCronogramaPagos(calculosEnVivo.montoFinanciar, datos.tasaInteresAnual, datos.plazoMeses, { 
    frecuenciaCuotaEspecial: datos.frecuenciaCuotaEspecial as any,
    cuotaEspecialTipo: datos.cuotaEspecialTipo as any,
    cuotaEspecialValor: datos.cuotaEspecialValor as any,
    montoCuotaManual: datos.montoCuotaManual
  }), [calculosEnVivo.montoFinanciar, datos.tasaInteresAnual, datos.plazoMeses, datos.tipoCuota, datos.frecuenciaCuotaEspecial, datos.cuotaEspecialTipo, datos.cuotaEspecialValor, datos.montoCuotaManual]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await onGuardar(datos);
      onOpenChange(false);
    } catch (error) { console.error('Error al guardar:', error); } 
    finally { setGuardando(false); }
  };

  const formatearMoneda = (valor: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(valor);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ width: '85%', maxWidth: '1000px', height: '700px', display: 'flex', padding: 0, borderRadius: '0.75rem' }}>
        
        {/* === COLUMNA IZQUIERDA: FORMULARIO (60%) === */}
        <div style={{ width: '60%', display: 'flex', flexDirection: 'column', background: '#f9fafb' }}>
          <DialogHeader className="p-5 border-b">
            <DialogTitle className="text-lg font-bold text-gray-800">
              {cotizacion ? 'Editar Cotización' : 'Generar Nueva Cotización'}
              {nombreContacto && <span className="text-sm font-normal text-gray-500 ml-2">/ {nombreContacto}</span>}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 p-6 space-y-4 overflow-y-auto">
            <form id="quote-form" onSubmit={handleSubmit} className="space-y-4">
              
              <FormSection title="Datos del Inmueble">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div className="col-span-2">
                        <Label htmlFor="nombreProyecto" className="text-xs font-medium">Nombre del Proyecto *</Label>
                        <IconInput id="nombreProyecto" icon={Building} value={datos.nombreProyecto} onChange={(e) => setDatos({ ...datos, nombreProyecto: e.target.value })} required />
                    </div>
                    <div>
                        <Label htmlFor="tipoInmueble" className="text-xs font-medium">Tipo de Inmueble</Label>
                        <IconInput id="tipoInmueble" icon={Info} value={datos.tipoInmueble} onChange={(e) => setDatos({ ...datos, tipoInmueble: e.target.value })} />
                    </div>
                    <div>
                        <Label htmlFor="descripcion" className="text-xs font-medium">Descripción (Ej: N° 301)</Label>
                        <IconInput id="descripcion" icon={FileText} value={datos.descripcion} onChange={(e) => setDatos({ ...datos, descripcion: e.target.value })} />
                    </div>
                </div>
              </FormSection>

              <FormSection title="Condiciones Financieras">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                        <Label htmlFor="precioInmueble" className="text-xs font-medium">Precio Inmueble *</Label>
                        <IconInput id="precioInmueble" icon={DollarSign} type="text" inputMode="decimal" value={datos.precioInmueble} onChange={(e) => setDatos({ ...datos, precioInmueble: parseFloat(e.target.value) || 0 })} required />
                    </div>
                    <div>
                        <Label htmlFor="cuotaInicial" className="text-xs font-medium">Cuota Inicial *</Label>
                        <IconInput id="cuotaInicial" icon={DollarSign} type="text" inputMode="decimal" value={datos.cuotaInicial} onChange={(e) => setDatos({ ...datos, cuotaInicial: parseFloat(e.target.value) || 0 })} required />
                        <p className="text-xs text-gray-500 mt-1">{calculosEnVivo.porcentajeCuotaInicial.toFixed(2)}% del total</p>
                    </div>
                    <div>
                        <Label htmlFor="plazoMeses" className="text-xs font-medium">Plazo (Meses) *</Label>
                        <IconInput id="plazoMeses" icon={Calendar} type="text" inputMode="decimal" value={datos.plazoMeses} onChange={(e) => setDatos({ ...datos, plazoMeses: parseInt(e.target.value) || 0 })} required />
                        <p className="text-xs text-gray-500 mt-1">{(datos.plazoMeses / 12).toFixed(1)} años</p>
                    </div>
                    <div>
                        <Label htmlFor="tasaInteresAnual" className="text-xs font-medium">Tasa de Interés (TEA) *</Label>
                        <IconInput id="tasaInteresAnual" icon={Percent} type="text" inputMode="decimal" step="0.1" value={datos.tasaInteresAnual} onChange={(e) => setDatos({ ...datos, tasaInteresAnual: parseFloat(e.target.value) || 0 })} required />
                    </div>
                </div>
              </FormSection>

              <FormSection title="Modalidad y Beneficios">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                        <Label htmlFor="tipoCuota" className="text-xs font-medium">Modalidad de Pago</Label>
                        <Select value={datos.tipoCuota} onValueChange={(value: TipoCuota) => setDatos({ ...datos, tipoCuota: value })}><SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(TIPOS_CUOTA_LABELS).map(([v, l]) => <SelectItem key={v} value={v} className="text-sm">{l}</SelectItem>)}</SelectContent></Select>
                    </div>
                    <div>
                        <Label htmlFor="fechaValidez" className="text-xs font-medium">Válido Hasta</Label>
                        <Input id="fechaValidez" type="date" value={datos.fechaValidez} onChange={(e) => setDatos({ ...datos, fechaValidez: e.target.value })} className="text-sm h-9" />
                    </div>
                </div>
                
                {(datos.tipoCuota === 'FLEXIBLE' || datos.tipoCuota === 'FLEXIBLE_ESPECIAL') && (
                    <div className="pt-4 mt-4 border-t">
                        <h4 className="text-xs font-semibold text-gray-600 mb-3">Configuración de Cuota Flexible</h4>
                        <div>
                            <Label htmlFor="montoCuotaManual" className="text-xs font-medium">Monto de Cuota Manual</Label>
                            <IconInput 
                                id="montoCuotaManual" 
                                icon={DollarSign} 
                                type="number" 
                                value={datos.montoCuotaManual || ''} 
                                onChange={(e) => setDatos({ ...datos, montoCuotaManual: parseFloat(e.target.value) || undefined })}
                                placeholder="Ej: 1000"
                            />
                            <p className="text-xs text-gray-500 mt-1">Dejar en blanco para cuota calculada automáticamente.</p>
                        </div>
                        <h4 className="text-xs font-semibold text-gray-600 my-3">Beneficios Flexibles</h4>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="permitePostergar" checked={datos.permitePostergar} onCheckedChange={(c) => setDatos({...datos, permitePostergar: c as boolean})} /><Label htmlFor="permitePostergar" className="text-sm font-normal">Permitir postergar pagos</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="permiteDoble" checked={datos.permiteDoble} onCheckedChange={(c) => setDatos({...datos, permiteDoble: c as boolean})} /><Label htmlFor="permiteDoble" className="text-sm font-normal">Permitir cuotas dobles</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="permiteCambioFecha" checked={datos.permiteCambioFecha} onCheckedChange={(c) => setDatos({...datos, permiteCambioFecha: c as boolean})} /><Label htmlFor="permiteCambioFecha" className="text-sm font-normal">Permitir cambio de fecha de pago</Label>
                            </div>
                        </div>
                    </div>
                )}

                {datos.tipoCuota === 'FLEXIBLE_ESPECIAL' && (
                    <div className="pt-4 mt-4 border-t">
                        <h4 className="text-xs font-semibold text-gray-600 mb-3">Configuración de Cuota Especial</h4>
                        <div className="grid grid-cols-3 gap-x-4">
                            <div>
                                <Label className="text-xs">Frecuencia</Label>
                                <Select value={datos.frecuenciaCuotaEspecial as any || ''} onValueChange={(v) => setDatos({ ...datos, frecuenciaCuotaEspecial: v as any})}><SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="TRIMESTRAL">Trimestral</SelectItem><SelectItem value="SEMESTRAL">Semestral</SelectItem><SelectItem value="ANUAL">Anual</SelectItem></SelectContent></Select>
                            </div>
                            <div>
                                <Label className="text-xs">Tipo</Label>
                                <Select value={datos.cuotaEspecialTipo as any || ''} onValueChange={(v) => setDatos({ ...datos, cuotaEspecialTipo: v as any})}><SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="FIJO">Monto Fijo</SelectItem><SelectItem value="PORCENTAJE">Porcentaje</SelectItem></SelectContent></Select>
                            </div>
                            <div>
                                <Label className="text-xs">Valor</Label>
                                <Input type="number" className="h-9 text-sm" value={(datos.cuotaEspecialValor as any) ?? ''} onChange={(e) => setDatos({ ...datos, cuotaEspecialValor: parseFloat(e.target.value) || 0 })} />
                            </div>
                        </div>
                    </div>
                )}

                 <div className="pt-4 mt-4 border-t">
                    <Label htmlFor="notas" className="text-xs font-medium">Notas Adicionales</Label>
                    <Textarea id="notas" value={datos.notas} onChange={(e) => setDatos({ ...datos, notas: e.target.value })} placeholder="Condiciones especiales, acuerdos, etc." rows={2} className="text-sm" />
                </div>
              </FormSection>

            </form>
          </div>

          <div className="p-4 border-t mt-auto flex justify-between items-center">
            <div>
              <Button variant="outline" size="sm" className="text-xs mr-2"><FileDown className="h-3.5 w-3.5 mr-1.5" />Exportar PDF</Button>
              <Button variant="outline" size="sm" className="text-xs"><FileDown className="h-3.5 w-3.5 mr-1.5" />Exportar Excel</Button>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={guardando}>Cancelar</Button>
              <Button type="submit" form="quote-form" disabled={guardando} className="font-semibold">{guardando ? 'Guardando...' : 'Crear Cotización'}</Button>
            </div>
          </div>
        </div>

        {/* === COLUMNA DERECHA: RESUMEN Y CRONOGRAMA (40%) === */}
        <div style={{ width: '40%', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
          <div className="p-6 border-b">
            <h3 className="text-base font-bold text-gray-900">Resumen de la Propuesta</h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-lg border">
                <p className="text-xs font-medium text-gray-500">Monto a Financiar</p>
                <p className="font-bold text-lg text-gray-800">{formatearMoneda(calculosEnVivo.montoFinanciar)}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border">
                <p className="text-xs font-medium text-gray-500">Total de Intereses</p>
                <p className="font-bold text-lg text-red-600">{formatearMoneda(calculosEnVivo.totalIntereses)}</p>
              </div>
              <div className="col-span-2 bg-blue-600 text-white p-4 rounded-lg text-center">
                <p className="text-sm font-semibold uppercase tracking-wider">Cuota Mensual</p>
                <p className="font-bold text-3xl">{formatearMoneda(calculosEnVivo.cuotaMensual)}</p>
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col min-h-0">
            <h3 className="px-6 pt-4 pb-2 text-base font-bold text-gray-900">Cronograma de Pagos</h3>
            <div className="overflow-y-auto px-6 pb-6 flex-1">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="border-b">
                    <th className="py-2 font-semibold text-left text-gray-500">Mes</th>
                    <th className="py-2 font-semibold text-right text-gray-500">Cuota</th>
                    <th className="py-2 font-semibold text-right text-gray-500">Interés</th>
                    <th className="py-2 font-semibold text-right text-gray-500">Capital</th>
                    <th className="py-2 font-semibold text-right text-gray-500">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {cronogramaPagos.map((pago) => (
                    <tr key={pago.mes} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="py-2 text-left text-gray-600">{pago.mes}</td>
                      <td className="py-2 text-right font-semibold text-gray-800">{formatearMoneda(pago.cuota)}</td>
                      <td className="py-2 text-right text-red-500">{formatearMoneda(pago.interes)}</td>
                      <td className="py-2 text-right text-green-600">{formatearMoneda(pago.capital)}</td>
                      <td className="py-2 text-right font-bold text-gray-900">{formatearMoneda(pago.saldo)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
