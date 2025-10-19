'use client';

import { Building, Info, FileText, DollarSign, Calendar, Percent } from 'lucide-react';
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
import type { CrearCotizacionDTO, TipoCuota } from '@/types/cotizacion.types';
import { TIPOS_CUOTA_LABELS } from '@/types/cotizacion.types';

const IconInput = ({ icon: Icon, ...props }) => (
  <div className="relative">
    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input {...props} className="pl-9" />
  </div>
);

interface FormularioDatosProps {
  datos: CrearCotizacionDTO;
  setDatos: (datos: CrearCotizacionDTO) => void;
  porcentajeCuotaInicial: number;
}

export const FormularioDatos = ({ datos, setDatos, porcentajeCuotaInicial }: FormularioDatosProps) => {
  return (
    <div className="p-6 space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-4">Datos del Inmueble</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label htmlFor="nombreProyecto">Nombre del Proyecto *</Label>
            <IconInput
              id="nombreProyecto"
              icon={Building}
              value={datos.nombreProyecto}
              onChange={(e) => setDatos({ ...datos, nombreProyecto: e.target.value })}
              placeholder="Ej: Edificio Vista Mar"
              required
            />
          </div>
          <div>
            <Label htmlFor="tipoInmueble">Tipo de Inmueble</Label>
            <IconInput
              id="tipoInmueble"
              icon={Info}
              value={datos.tipoInmueble}
              onChange={(e) => setDatos({ ...datos, tipoInmueble: e.target.value })}
              placeholder="Ej: Departamento"
            />
          </div>
          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <IconInput
              id="descripcion"
              icon={FileText}
              value={datos.descripcion}
              onChange={(e) => setDatos({ ...datos, descripcion: e.target.value })}
              placeholder="Ej: Dpto 301"
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Datos Financieros</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="precioInmueble">Precio del Inmueble *</Label>
            <IconInput
              id="precioInmueble"
              icon={DollarSign}
              type="number"
              step="100"
              value={datos.precioInmueble}
              onChange={(e) => setDatos({ ...datos, precioInmueble: parseFloat(e.target.value) || 0 })}
              placeholder="250000"
              required
            />
          </div>
          <div>
            <Label htmlFor="cuotaInicial">Cuota Inicial *</Label>
            <IconInput
              id="cuotaInicial"
              icon={DollarSign}
              type="number"
              step="100"
              value={datos.cuotaInicial}
              onChange={(e) => setDatos({ ...datos, cuotaInicial: parseFloat(e.target.value) || 0 })}
              placeholder="50000"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              {porcentajeCuotaInicial.toFixed(2)}% del precio
            </p>
          </div>
          <div>
            <Label htmlFor="plazoMeses">Plazo (Meses) *</Label>
            <IconInput
              id="plazoMeses"
              icon={Calendar}
              type="number"
              value={datos.plazoMeses}
              onChange={(e) => setDatos({ ...datos, plazoMeses: parseInt(e.target.value) || 0 })}
              placeholder="120"
              min="1"
              required
            />
             <p className="text-xs text-muted-foreground mt-1">
              Equivale a {(datos.plazoMeses / 12).toFixed(1)} años
            </p>
          </div>
          <div>
            <Label htmlFor="tasaInteresAnual">TEA (%) *</Label>
            <IconInput
              id="tasaInteresAnual"
              icon={Percent}
              type="number"
              step="0.1"
              min="0"
              value={datos.tasaInteresAnual}
              onChange={(e) => setDatos({ ...datos, tasaInteresAnual: parseFloat(e.target.value) || 0 })}
              placeholder="8.5"
              required
            />
             <p className="text-xs text-muted-foreground mt-1">
              Ingresa 0 para sin interés
            </p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Tipo de Cuota</h3>
        <div>
          <Label htmlFor="tipoCuota">Modalidad de Pago *</Label>
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
      </section>

      {(datos.tipoCuota === 'FLEXIBLE' || datos.tipoCuota === 'FLEXIBLE_ESPECIAL') && (
        <section className="p-4 border rounded-lg bg-slate-50">
          <h4 className="font-semibold mb-3">Opciones de Flexibilidad</h4>
          <div className="space-y-3">
             <div className="flex items-center space-x-2">
                <Checkbox id="permitePostergar" checked={datos.permitePostergar} onCheckedChange={(c) => setDatos({...datos, permitePostergar: c as boolean})} />
                <Label htmlFor="permitePostergar">Permitir postergar pagos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="permiteDoble" checked={datos.permiteDoble} onCheckedChange={(c) => setDatos({...datos, permiteDoble: c as boolean})} />
                <Label htmlFor="permiteDoble">Permitir cuotas dobles</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="permiteCambioFecha" checked={datos.permiteCambioFecha} onCheckedChange={(c) => setDatos({...datos, permiteCambioFecha: c as boolean})} />
                <Label htmlFor="permiteCambioFecha">Permitir cambio de fecha</Label>
              </div>
          </div>
        </section>
      )}

      {datos.tipoCuota === 'FLEXIBLE_ESPECIAL' && (
        <section className="p-4 border rounded-lg">
          <h4 className="font-semibold mb-3">Configuración Cuota Especial</h4>
           <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Frecuencia</Label>
                <Select value={datos.frecuenciaCuotaEspecial as any || ''} onValueChange={(v) => setDatos({ ...datos, frecuenciaCuotaEspecial: v as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRIMESTRAL">Trimestral</SelectItem>
                    <SelectItem value="SEMESTRAL">Semestral</SelectItem>
                    <SelectItem value="ANUAL">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={datos.cuotaEspecialTipo as any || ''} onValueChange={(v) => setDatos({ ...datos, cuotaEspecialTipo: v as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIJO">Monto Fijo</SelectItem>
                    <SelectItem value="PORCENTAJE">Porcentaje</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <div>
                <Label>Valor</Label>
                <Input type="number" value={(datos.cuotaEspecialValor as any) ?? ''} onChange={(e) => setDatos({ ...datos, cuotaEspecialValor: parseFloat(e.target.value) || 0 })} />
              </div>
           </div>
        </section>
      )}

      <section>
         <h3 className="text-lg font-semibold mb-4">Notas y Validez</h3>
         <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="notas">Notas Adicionales</Label>
              <Textarea id="notas" value={datos.notas} onChange={(e) => setDatos({ ...datos, notas: e.target.value })} placeholder="Anotaciones internas..." />
            </div>
            <div>
              <Label htmlFor="fechaValidez">Válido Hasta</Label>
              <Input id="fechaValidez" type="date" value={datos.fechaValidez} onChange={(e) => setDatos({ ...datos, fechaValidez: e.target.value })} />
            </div>
         </div>
      </section>
    </div>
  );
};