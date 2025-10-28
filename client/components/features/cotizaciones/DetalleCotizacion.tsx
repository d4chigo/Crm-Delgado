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

  const buildCompanyLogoUrl = () => {
    // Public assets are served from root in Next.js
    return '/logodelgado.png';
  };

  const obtenerNombreUsuario = (): string => {
    try {
      if (typeof window === 'undefined') return '';
      const raw = localStorage.getItem('crm_user');
      if (!raw) return '';
      const obj = JSON.parse(raw);
      return obj?.nombre || '';
    } catch {
      return '';
    }
  };

  const exportarPDF = () => {
    const logoUrl = buildCompanyLogoUrl();
    const usuarioNombre = obtenerNombreUsuario();
    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Cotización ${cotizacion.numeroReferencia}</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: Arial, Helvetica, sans-serif; color: #333; margin: 0; padding: 24px; }
            .header { display:flex; align-items:center; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 12px; }
            .brand { display:flex; align-items:center; gap:12px; }
            .brand img { height: 48px; }
            .brand h1 { font-size: 20px; margin: 0; }
            .title { margin-top: 16px; }
            h2 { margin: 0 0 4px 0; }
            .meta { color:#666; }
            .section { margin-top: 18px; }
            .section h3 { margin: 0 0 8px 0; font-size: 16px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px 10px; border: 1px solid #e5e7eb; font-size: 13px; }
            th { background: #f9fafb; text-align: left; }
            .totals { margin-top: 12px; width: 50%; }
            .right { text-align: right; }
            .badge { display:inline-block; padding: 2px 8px; border-radius: 999px; border:1px solid #e5e7eb; font-size: 12px; }
            .footer { margin-top: 24px; font-size: 12px; color:#666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">
              <img src="${logoUrl}" alt="Logo" />
              <div>
                <h1>CRM Delgado</h1>
                <div class="meta">Cotización profesional</div>
              </div>
            </div>
            <div class="right">
              <div><strong>Ref:</strong> ${cotizacion.numeroReferencia}</div>
              <div class="meta">Creada: ${formatearFecha(cotizacion.creadoEn)}</div>
            </div>
          </div>

          <div class="title">
            <h2>${cotizacion.nombreProyecto}</h2>
            <div class="meta">Estado: <span class="badge">${ESTADOS_COTIZACION_LABELS[cotizacion.estado]}</span></div>
            <div class="meta">Asesor: ${usuarioNombre || '—'}</div>
          </div>

          <div class="section">
            <h3>Información del Inmueble</h3>
            <table>
              <tr><th>Tipo</th><td>${cotizacion.tipoInmueble || 'No especificado'}</td></tr>
              <tr><th>Descripción</th><td>${cotizacion.descripcion || 'No especificado'}</td></tr>
            </table>
          </div>

          <div class="section">
            <h3>Datos Financieros</h3>
            <table>
              <tr><th>Precio Inmueble</th><td class="right">${formatearMoneda(cotizacion.precioInmueble)}</td></tr>
              <tr><th>Cuota Inicial</th><td class="right">${formatearMoneda(cotizacion.cuotaInicial)} (${cotizacion.porcentajeCuotaInicial?.toFixed(2)}%)</td></tr>
              <tr><th>Monto a Financiar</th><td class="right">${formatearMoneda(cotizacion.montoFinanciar)}</td></tr>
              <tr><th>Tasa Interés Anual</th><td class="right">${cotizacion.tasaInteresAnual}%</td></tr>
              <tr><th>Plazo</th><td class="right">${cotizacion.plazoMeses} meses (${(cotizacion.plazoMeses / 12).toFixed(1)} años)</td></tr>
              <tr><th>Cuota Mensual</th><td class="right">${formatearMoneda(cotizacion.cuotaMensualEstimada)}</td></tr>
              <tr><th>Tipo de Cuota</th><td>${TIPOS_CUOTA_LABELS[cotizacion.tipoCuota]}</td></tr>
              <tr><th>Total Intereses</th><td class="right">${formatearMoneda(cotizacion.totalIntereses)}</td></tr>
              <tr><th>Total a Pagar</th><td class="right">${formatearMoneda(cotizacion.totalPagar)}</td></tr>
            </table>
          </div>

          <div class="section">
            <h3>Información Adicional</h3>
            <table>
              <tr><th>Válido Hasta</th><td>${cotizacion.fechaValidez ? formatearFecha(cotizacion.fechaValidez) : '—'}</td></tr>
              <tr><th>Notas</th><td>${cotizacion.notas || '—'}</td></tr>
            </table>
          </div>

          <div class="footer">Generado por CRM Delgado • ${new Date().toLocaleString('es-PE')} • ${usuarioNombre || ''}</div>
        </body>
      </html>`;
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(() => {
      try { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); } catch {}
      setTimeout(() => { try { document.body.removeChild(iframe); } catch {} }, 500);
    }, 300);
  };

  const exportarExcel = () => {
    // Generar Excel en formato XML Spreadsheet 2003 (compatible con .xls) sin librerías externas
    const esc = (v: any) => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const rows: string[] = [];
    const pushRow = (cells: (string|number)[]) => {
      rows.push('<Row>' + cells.map(c => `<Cell><Data ss:Type="String">${esc(c)}</Data></Cell>`).join('') + '</Row>');
    };
    const usuarioNombre = obtenerNombreUsuario();
    pushRow([`Cotización ${cotizacion.numeroReferencia}`]);
    pushRow([`Proyecto: ${cotizacion.nombreProyecto}`]);
    pushRow([`Estado: ${ESTADOS_COTIZACION_LABELS[cotizacion.estado]}`]);
    pushRow([`Asesor: ${usuarioNombre || '—'}`]);
    pushRow(['']);
    pushRow(['Información del Inmueble']);
    pushRow(['Tipo', cotizacion.tipoInmueble || 'No especificado']);
    pushRow(['Descripción', cotizacion.descripcion || 'No especificado']);
    pushRow(['']);
    pushRow(['Datos Financieros']);
    pushRow(['Precio Inmueble', formatearMoneda(cotizacion.precioInmueble)]);
    pushRow(['Cuota Inicial', `${formatearMoneda(cotizacion.cuotaInicial)} (${cotizacion.porcentajeCuotaInicial?.toFixed(2)}%)`]);
    pushRow(['Monto a Financiar', formatearMoneda(cotizacion.montoFinanciar)]);
    pushRow(['Tasa Interés Anual', `${cotizacion.tasaInteresAnual}%`]);
    pushRow(['Plazo', `${cotizacion.plazoMeses} meses (${(cotizacion.plazoMeses/12).toFixed(1)} años)`]);
    pushRow(['Cuota Mensual', formatearMoneda(cotizacion.cuotaMensualEstimada)]);
    pushRow(['Tipo de Cuota', TIPOS_CUOTA_LABELS[cotizacion.tipoCuota]]);
    pushRow(['Total Intereses', formatearMoneda(cotizacion.totalIntereses)]);
    pushRow(['Total a Pagar', formatearMoneda(cotizacion.totalPagar)]);
    pushRow(['']);
    pushRow(['Información Adicional']);
    pushRow(['Válido Hasta', cotizacion.fechaValidez ? formatearFecha(cotizacion.fechaValidez) : '—']);
    pushRow(['Notas', cotizacion.notas || '—']);

    const xml = `<?xml version="1.0"?>
      <?mso-application progid="Excel.Sheet"?>
      <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
        xmlns:o="urn:schemas-microsoft-com:office:office"
        xmlns:x="urn:schemas-microsoft-com:office:excel"
        xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
        <Worksheet ss:Name="Cotizacion">
          <Table>
            ${rows.join('')}
          </Table>
        </Worksheet>
      </Workbook>`;
    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cotizacion_${cotizacion.numeroReferencia}.xls`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
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

        {/* Exportaciones */}
        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            onClick={exportarPDF}
            disabled={!cotizacion?.id}
            title={!cotizacion?.id ? 'Crea y guarda la cotización para exportar' : ''}
          >
            Exportar PDF
          </Button>
          <Button
            variant="outline"
            onClick={exportarExcel}
            disabled={!cotizacion?.id}
            title={!cotizacion?.id ? 'Crea y guarda la cotización para exportar' : ''}
          >
            Exportar Excel
          </Button>
        </div>
      </div>
    </div>
  );
};
