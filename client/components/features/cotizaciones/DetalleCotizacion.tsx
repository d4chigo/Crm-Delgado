'use client';

import { 
  FileText, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Cotizacion } from '@/types/cotizacion.types';
import { 
  ESTADOS_COTIZACION_LABELS,
  ESTADOS_COTIZACION_STYLES,
  TIPOS_CUOTA_LABELS
} from '@/types/cotizacion.types';

interface DetalleCotizacionProps {
  cotizacion: Cotizacion;
  onCambiarEstado?: (estado: string) => void;
  onEditar?: () => void;
  onEliminar?: () => void;
}

export const DetalleCotizacion = ({
  cotizacion,
  onCambiarEstado,
  onEditar,
  onEliminar
}: DetalleCotizacionProps) => {
  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(valor);
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getIconoEstado = () => {
    switch (cotizacion.estado) {
      case 'BORRADOR':
        return <FileText className="h-5 w-5" />;
      case 'ENVIADA':
        return <Send className="h-5 w-5" />;
      case 'ACEPTADA':
        return <CheckCircle2 className="h-5 w-5" />;
      case 'RECHAZADA':
        return <XCircle className="h-5 w-5" />;
      case 'VENCIDA':
        return <Clock className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{cotizacion.numeroReferencia}</h2>
          <p className="text-gray-500">{cotizacion.nombreProyecto}</p>
        </div>
        <Badge 
          variant="outline"
          className={`${ESTADOS_COTIZACION_STYLES[cotizacion.estado].badge} text-sm`}
        >
          <span className="flex items-center gap-2">
            {getIconoEstado()}
            {ESTADOS_COTIZACION_LABELS[cotizacion.estado]}
          </span>
        </Badge>
      </div>

      {/* Información del Inmueble */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información del Inmueble</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Tipo de Inmueble</p>
              <p className="font-medium">{cotizacion.tipoInmueble || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Descripción</p>
              <p className="font-medium">{cotizacion.descripcion || 'No especificado'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Datos Financieros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Datos Financieros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Precio Inmueble</p>
              <p className="text-lg font-semibold">
                {formatearMoneda(cotizacion.precioInmueble)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cuota Inicial</p>
              <p className="text-lg font-semibold text-blue-600">
                {formatearMoneda(cotizacion.cuotaInicial)}
              </p>
              <p className="text-xs text-gray-500">
                {cotizacion.porcentajeCuotaInicial?.toFixed(2)}% del precio
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Monto a Financiar</p>
              <p className="text-lg font-semibold">
                {formatearMoneda(cotizacion.montoFinanciar)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tasa Interés Anual</p>
              <p className="text-lg font-semibold text-green-600">
                {cotizacion.tasaInteresAnual}%
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Plazo</p>
              <p className="text-lg font-semibold">
                {cotizacion.plazoMeses} meses
              </p>
              <p className="text-xs text-gray-500">
                {(cotizacion.plazoMeses / 12).toFixed(1)} años
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cuota Mensual</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatearMoneda(cotizacion.cuotaMensualEstimada)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tipo de Cuota</p>
              <p className="text-lg font-semibold">
                {TIPOS_CUOTA_LABELS[cotizacion.tipoCuota]}
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Intereses</p>
              <p className="text-lg font-semibold text-orange-600">
                {formatearMoneda(cotizacion.totalIntereses)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total a Pagar</p>
              <p className="text-lg font-semibold text-purple-600">
                {formatearMoneda(cotizacion.totalPagar)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opciones Especiales */}
      {(cotizacion.tipoCuota === 'FLEXIBLE' || cotizacion.tipoCuota === 'FLEXIBLE_ESPECIAL') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Opciones Flexibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                {cotizacion.permitePostergar ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-300" />
                )}
                <div>
                  <p className="font-medium">Postergar Pagos</p>
                  {cotizacion.permitePostergar && cotizacion.cuotasPostergables && (
                    <p className="text-sm text-gray-500">
                      Hasta {cotizacion.cuotasPostergables} cuotas/año
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {cotizacion.permiteDoble ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-300" />
                )}
                <div>
                  <p className="font-medium">Cuotas Dobles</p>
                  {cotizacion.permiteDoble && cotizacion.cuotasDoblesAnuales && (
                    <p className="text-sm text-gray-500">
                      Hasta {cotizacion.cuotasDoblesAnuales} veces/año
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {cotizacion.permiteCambioFecha ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-300" />
                )}
                <div>
                  <p className="font-medium">Cambio de Fecha</p>
                  <p className="text-sm text-gray-500">
                    {cotizacion.permiteCambioFecha ? 'Permitido' : 'No permitido'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información Adicional */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Información Adicional
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Fecha de Creación</p>
              <p className="font-medium">{formatearFecha(cotizacion.creadoEn)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Última Actualización</p>
              <p className="font-medium">{formatearFecha(cotizacion.actualizadoEn)}</p>
            </div>
          </div>

          {cotizacion.fechaValidez && (
            <div>
              <p className="text-sm text-gray-500">Válido Hasta</p>
              <p className="font-medium">{formatearFecha(cotizacion.fechaValidez)}</p>
            </div>
          )}

          {cotizacion.notas && (
            <div>
              <p className="text-sm text-gray-500">Notas</p>
              <p className="font-medium">{cotizacion.notas}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="flex gap-2 flex-wrap">
        {cotizacion.estado === 'BORRADOR' && onEditar && (
          <Button onClick={onEditar} variant="outline">
            Editar Cotización
          </Button>
        )}
        
        {cotizacion.estado === 'BORRADOR' && onCambiarEstado && (
          <Button onClick={() => onCambiarEstado('ENVIADA')}>
            <Send className="mr-2 h-4 w-4" />
            Enviar Cotización
          </Button>
        )}

        {cotizacion.estado === 'ENVIADA' && onCambiarEstado && (
          <>
            <Button onClick={() => onCambiarEstado('ACEPTADA')} variant="default">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Marcar como Aceptada
            </Button>
            <Button onClick={() => onCambiarEstado('RECHAZADA')} variant="destructive">
              <XCircle className="mr-2 h-4 w-4" />
              Marcar como Rechazada
            </Button>
          </>
        )}

        {onEliminar && (
          <Button onClick={onEliminar} variant="destructive" className="ml-auto">
            Eliminar Cotización
          </Button>
        )}
      </div>
    </div>
  );
};
