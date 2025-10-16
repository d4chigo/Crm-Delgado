'use client';

import { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Separator } from '@/components/ui/separator';
import type { 
  CrearCotizacionDTO, 
  Cotizacion,
  TipoCuota 
} from '@/types/cotizacion.types';
import { TIPOS_CUOTA_LABELS } from '@/types/cotizacion.types';
import { cotizacionService } from '@/services/api/cotizacion.service';

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
    plazoMeses: 120,
    tipoCuota: 'FIJA',
    tasaInteresAnual: 0,
    permitePostergar: false,
    cuotasPostergables: 0,
    permiteDoble: false,
    cuotasDoblesAnuales: 0,
    permiteCambioFecha: false,
    // opciones para cuota especial (solo si tipoCuota === 'FLEXIBLE_ESPECIAL')
    frecuenciaCuotaEspecial: undefined,
    cuotaEspecialTipo: undefined,
    cuotaEspecialValor: undefined,
    notas: '',
    fechaValidez: ''
  });

  useEffect(() => {
    if (cotizacion) {
      setDatos({
        contactoId: cotizacion.contactoId,
        nombreProyecto: cotizacion.nombreProyecto,
        tipoInmueble: cotizacion.tipoInmueble || '',
        descripcion: cotizacion.descripcion || '',
        precioInmueble: cotizacion.precioInmueble,
        cuotaInicial: cotizacion.cuotaInicial,
        plazoMeses: cotizacion.plazoMeses,
        tipoCuota: cotizacion.tipoCuota,
        tasaInteresAnual: cotizacion.tasaInteresAnual,
        permitePostergar: cotizacion.permitePostergar,
        cuotasPostergables: cotizacion.cuotasPostergables || 0,
        permiteDoble: cotizacion.permiteDoble,
        cuotasDoblesAnuales: cotizacion.cuotasDoblesAnuales || 0,
        permiteCambioFecha: cotizacion.permiteCambioFecha,
        notas: cotizacion.notas || '',
        fechaValidez: cotizacion.fechaValidez || ''
      });
    } else {
      setDatos(prev => ({ ...prev, contactoId }));
    }
  }, [cotizacion, contactoId]);

  // Calcular valores en tiempo real
  const calculosEnVivo = useMemo(() => {
    return cotizacionService.calcularTotales(
      datos.precioInmueble,
      datos.cuotaInicial,
      datos.tasaInteresAnual,
      datos.plazoMeses,
      {
        modalidadPago: datos.modalidadPago as any,
        flexibleOverridesText: (datos as any).flexibleOverridesText,
        escalonadoIncrementoMensual: (datos as any).escalonadoIncrementoMensual,
        escalonadoPorcentaje: (datos as any).escalonadoPorcentaje,
        escalonadoCadaMeses: (datos as any).escalonadoCadaMeses,
        periodoGraciaTipo: (datos as any).periodoGraciaTipo,
        periodoGraciaMeses: (datos as any).periodoGraciaMeses,
        frecuenciaCuotaEspecial: datos.frecuenciaCuotaEspecial as any,
        cuotaEspecialTipo: datos.cuotaEspecialTipo as any,
        cuotaEspecialValor: datos.cuotaEspecialValor as any
      }
    );
  }, [datos.precioInmueble, datos.cuotaInicial, datos.tasaInteresAnual, datos.plazoMeses]);

    // Cronograma de pagos
    const cronogramaPagos = useMemo(() => {
      return cotizacionService.calcularCronogramaPagos(
        calculosEnVivo.montoFinanciar,
        datos.tasaInteresAnual,
        datos.plazoMeses,
        {
          frecuenciaCuotaEspecial: datos.frecuenciaCuotaEspecial as any,
          cuotaEspecialTipo: datos.cuotaEspecialTipo as any,
          cuotaEspecialValor: datos.cuotaEspecialValor as any
        }
      );
    }, [calculosEnVivo.montoFinanciar, datos.tasaInteresAnual, datos.plazoMeses, datos.frecuenciaCuotaEspecial, datos.cuotaEspecialTipo, datos.cuotaEspecialValor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await onGuardar(datos);
      onOpenChange(false);
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setGuardando(false);
    }
  };

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(valor);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full max-h-[98vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {cotizacion ? 'Editar Cotización' : 'Nueva Cotización'}
          </DialogTitle>
          <DialogDescription>
            {nombreContacto && `Para: ${nombreContacto}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos del Proyecto */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Datos del Inmueble</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="nombreProyecto">Nombre del Proyecto *</Label>
                <Input
                  id="nombreProyecto"
                  value={datos.nombreProyecto}
                  onChange={(e) => setDatos({ ...datos, nombreProyecto: e.target.value })}
                  placeholder="Ej: Edificio Vista Mar"
                  required
                />
              </div>

              <div>
                <Label htmlFor="tipoInmueble">Tipo de Inmueble</Label>
                <Input
                  id="tipoInmueble"
                  value={datos.tipoInmueble}
                  onChange={(e) => setDatos({ ...datos, tipoInmueble: e.target.value })}
                  placeholder="Ej: Departamento, Casa, Lote"
                />
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  value={datos.descripcion}
                  onChange={(e) => setDatos({ ...datos, descripcion: e.target.value })}
                  placeholder="Ej: Dpto 301 - 3 dorm"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Datos Financieros */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Datos Financieros</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="precioInmueble">Precio del Inmueble *</Label>
                <Input
                  id="precioInmueble"
                  type="number"
                  step="0.01"
                  value={datos.precioInmueble}
                  onChange={(e) => setDatos({ ...datos, precioInmueble: parseFloat(e.target.value) || 0 })}
                  placeholder="250000"
                  required
                />
              </div>

              <div>
                <Label htmlFor="cuotaInicial">Cuota Inicial *</Label>
                <Input
                  id="cuotaInicial"
                  type="number"
                  step="0.01"
                  value={datos.cuotaInicial}
                  onChange={(e) => setDatos({ ...datos, cuotaInicial: parseFloat(e.target.value) || 0 })}
                  placeholder="50000"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {calculosEnVivo.porcentajeCuotaInicial.toFixed(2)}% del precio
                </p>
              </div>

              <div>
                <Label htmlFor="plazoMeses">Plazo en Meses *</Label>
                <Input
                  id="plazoMeses"
                  type="number"
                  value={datos.plazoMeses}
                  onChange={(e) => setDatos({ ...datos, plazoMeses: parseInt(e.target.value) || 0 })}
                  placeholder="120"
                  min="12"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {(datos.plazoMeses / 12).toFixed(1)} años
                </p>
              </div>

              <div>
                <Label htmlFor="tasaInteresAnual">TEA - Tasa Efectiva Anual (%) *</Label>
                <Input
                  id="tasaInteresAnual"
                  type="number"
                  step="0.1"
                  min="0"
                  value={datos.tasaInteresAnual}
                  onChange={(e) => setDatos({ ...datos, tasaInteresAnual: parseFloat(e.target.value) || 0 })}
                  placeholder="0 (sin interés) o ej: 8.5"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ingresa 0 para cotizaciones sin interés
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Tipo de Cuota */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Tipo de Cuota</h3>
            
            <div>
              <Label htmlFor="tipoCuota">Tipo de Cuota *</Label>
              <Select
                value={datos.tipoCuota}
                onValueChange={(value: TipoCuota) => setDatos({ ...datos, tipoCuota: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TIPOS_CUOTA_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Opciones Especiales */}
            {(datos.tipoCuota === 'FLEXIBLE' || datos.tipoCuota === 'FLEXIBLE_ESPECIAL') && (
              <div className="space-y-3">
                <div className="p-4 border rounded-lg bg-gray-50">
                  <p className="text-sm font-medium">Opciones Flexibles</p>

                  <div className="flex items-center space-x-2 mt-3">
                    <Checkbox
                      id="permitePostergar"
                      checked={datos.permitePostergar}
                      onCheckedChange={(checked) => 
                        setDatos({ ...datos, permitePostergar: checked as boolean })
                      }
                    />
                    <Label htmlFor="permitePostergar" className="text-sm font-normal">
                      Permitir postergar pagos
                    </Label>
                  </div>
                  {datos.permitePostergar && (
                    <div className="ml-6 mt-2">
                      <Label htmlFor="cuotasPostergables">Cuotas postergables por año</Label>
                      <Input
                        id="cuotasPostergables"
                        type="number"
                        min="0"
                        max="12"
                        value={datos.cuotasPostergables}
                        onChange={(e) => setDatos({ ...datos, cuotasPostergables: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      id="permiteDoble"
                      checked={datos.permiteDoble}
                      onCheckedChange={(checked) => 
                        setDatos({ ...datos, permiteDoble: checked as boolean })
                      }
                    />
                    <Label htmlFor="permiteDoble" className="text-sm font-normal">
                      Permitir cuotas dobles
                    </Label>
                  </div>
                  {datos.permiteDoble && (
                    <div className="ml-6 mt-2">
                      <Label htmlFor="cuotasDoblesAnuales">Cuotas dobles permitidas por año</Label>
                      <Input
                        id="cuotasDoblesAnuales"
                        type="number"
                        min="0"
                        max="12"
                        value={datos.cuotasDoblesAnuales}
                        onChange={(e) => setDatos({ ...datos, cuotasDoblesAnuales: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      id="permiteCambioFecha"
                      checked={datos.permiteCambioFecha}
                      onCheckedChange={(checked) => 
                        setDatos({ ...datos, permiteCambioFecha: checked as boolean })
                      }
                    />
                    <Label htmlFor="permiteCambioFecha" className="text-sm font-normal">
                      Permitir cambio de fecha de pago
                    </Label>
                  </div>
                </div>

                {datos.tipoCuota === 'FLEXIBLE_ESPECIAL' && (
                  <div className="p-4 border rounded-lg bg-white">
                    <h4 className="text-sm font-medium">Cuota Flexible Especial</h4>
                    <div className="grid grid-cols-1 gap-3 mt-3">
                      <div>
                        <Label htmlFor="frecuenciaCuotaEspecial">Frecuencia</Label>
                        <Select
                          value={datos.frecuenciaCuotaEspecial as any || ''}
                          onValueChange={(value) => setDatos({ ...datos, frecuenciaCuotaEspecial: value as any })}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TRIMESTRAL">Trimestral (cada 3 meses)</SelectItem>
                            <SelectItem value="SEMESTRAL">Semestral (cada 6 meses)</SelectItem>
                            <SelectItem value="ANUAL">Anual (cada 12 meses)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="cuotaEspecialTipo">Tipo de monto</Label>
                        <Select
                          value={datos.cuotaEspecialTipo as any || ''}
                          onValueChange={(value) => setDatos({ ...datos, cuotaEspecialTipo: value as any })}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FIJO">Fijo (+ monto)</SelectItem>
                            <SelectItem value="PORCENTAJE">Porcentaje (sobre cuota)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="cuotaEspecialValor">Valor</Label>
                        <Input
                          id="cuotaEspecialValor"
                          type="number"
                          step="0.01"
                          className="w-full"
                          value={(datos.cuotaEspecialValor as any) ?? ''}
                          onChange={(e) => setDatos({ ...datos, cuotaEspecialValor: parseFloat(e.target.value) || 0 })}
                          placeholder="Ej: 500 o 150"
                        />
                        <p className="text-xs text-muted-foreground">Si eliges % escribe 150 para 150% (cuota x1.5)</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Cálculos en Vivo */}
          <div className="p-4 bg-blue-50 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm text-blue-900">Resumen Financiero</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Monto a Financiar:</span>
                <p className="font-semibold">{formatearMoneda(calculosEnVivo.montoFinanciar)}</p>
              </div>
              <div>
                <span className="text-gray-600">Cuota Mensual:</span>
                <p className="font-semibold text-lg text-blue-600">
                  {formatearMoneda(calculosEnVivo.cuotaMensual)}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Total Intereses:</span>
                <p className="font-semibold">{formatearMoneda(calculosEnVivo.totalIntereses)}</p>
              </div>
              <div>
                <span className="text-gray-600">Total a Pagar:</span>
                <p className="font-semibold">{formatearMoneda(calculosEnVivo.totalPagar)}</p>
              </div>
            </div>
            {/* Tabla de pagos mensuales */}
            <div className="mt-6">
              <h4 className="font-semibold text-sm text-blue-900 mb-2">Cronograma de Pagos</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs border rounded">
                  <thead className="bg-blue-100">
                    <tr>
                      <th className="px-2 py-1 border">Mes</th>
                      <th className="px-2 py-1 border">Cuota</th>
                      <th className="px-2 py-1 border">Especial</th>
                      <th className="px-2 py-1 border">Interés</th>
                      <th className="px-2 py-1 border">Capital</th>
                      <th className="px-2 py-1 border">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cronogramaPagos.map((pago) => (
                      <tr key={pago.mes} className={`odd:bg-white even:bg-blue-50 ${pago.esCuotaEspecial ? 'bg-yellow-50 font-medium' : ''}`}>
                        <td className="px-2 py-1 border text-center">{pago.mes}</td>
                        <td className="px-2 py-1 border text-right">{formatearMoneda(pago.cuota)}</td>
                        <td className="px-2 py-1 border text-right">
                          {pago.esCuotaEspecial ? (
                            <div className="text-right">
                              {(() => {
                                const cuotaBase = pago.cuotaBase ?? 0;
                                const inferredApplied = Math.max(0, Math.round((pago.cuota - cuotaBase) * 100) / 100);
                                const applied = (pago.pagoEspecialAplicado ?? pago.pagoEspecial ?? 0) || inferredApplied;
                                return <div>Aplicado: {formatearMoneda(applied)}</div>;
                              })()}
                              {pago.pagoEspecialNoUtilizado ? <div className="text-xs text-muted-foreground">No usado: {formatearMoneda(pago.pagoEspecialNoUtilizado)}</div> : null}
                            </div>
                          ) : '-'}
                        </td>
                        <td className="px-2 py-1 border text-right">{formatearMoneda(pago.interes)}</td>
                        <td className="px-2 py-1 border text-right">{formatearMoneda(pago.capital)}</td>
                        <td className="px-2 py-1 border text-right">{formatearMoneda(pago.saldo)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Totales por tipo de cuota */}
            {cronogramaPagos.length > 0 && (
              <div className="mt-4 p-3 bg-white border rounded text-sm">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-gray-600">Total en cuotas normales:</span>
                    <p className="font-semibold">{formatearMoneda(cronogramaPagos.reduce((s, p) => s + (p.esCuotaEspecial ? 0 : p.cuota), 0))}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total en cuotas especiales (aplicado):</span>
                    <p className="font-semibold">{formatearMoneda(cronogramaPagos.reduce((s, p) => s + (p.esCuotaEspecial ? (p.pagoEspecialAplicado ?? p.pagoEspecial ?? 0) : 0), 0))}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Ahorro / Reducción plazo:</span>
                    <p className="font-semibold">{cronogramaPagos[cronogramaPagos.length -1].mes < datos.plazoMeses ? `${datos.plazoMeses - cronogramaPagos[cronogramaPagos.length -1].mes} meses` : '-'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notas y Validez */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="notas">Notas Adicionales</Label>
              <Textarea
                id="notas"
                value={datos.notas}
                onChange={(e) => setDatos({ ...datos, notas: e.target.value })}
                placeholder="Notas internas sobre la cotización..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="fechaValidez">Válido Hasta</Label>
              <Input
                id="fechaValidez"
                type="date"
                value={datos.fechaValidez}
                onChange={(e) => setDatos({ ...datos, fechaValidez: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={guardando}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando}>
              {guardando ? 'Guardando...' : cotizacion ? 'Actualizar' : 'Crear Cotización'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
