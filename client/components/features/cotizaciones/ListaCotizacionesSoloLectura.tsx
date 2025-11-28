'use client';

import { useMemo, useState } from 'react';
import type { Cotizacion, TipoCuota } from '@/types/cotizacion.types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, FileDown, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cotizacionService } from '@/services/api/cotizacion.service';

interface ListaCotizacionesSoloLecturaProps {
  cotizaciones: Cotizacion[];
  loading: boolean;
  onEliminar?: (cotizacion: Cotizacion) => void | Promise<void>;
}

export function ListaCotizacionesSoloLectura({ cotizaciones, loading, onEliminar }: ListaCotizacionesSoloLecturaProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [historyOpen, setHistoryOpen] = useState(false);

  const getEstadoColor = (estado?: string) => {
    switch (estado?.toLowerCase()) {
      case 'creado': return 'bg-blue-100 text-blue-800';
      case 'enviado': return 'bg-purple-100 text-purple-800';
      case 'aceptado': return 'bg-green-100 text-green-800';
      case 'rechazado': return 'bg-red-100 text-red-800';
      case 'vencido': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(valor);
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

  const logoAbsUrl = () => {
    if (typeof window === 'undefined') return '/logodelgado.png';
    const origin = window.location.origin || '';
    return `${origin}/logodelgado.png`;
  };

  const buildCronograma = (c: Cotizacion) => {
    const precio = Number(c.precioInmueble) || 0;
    const cuotaInicial = Number(c.cuotaInicial) || 0;
    const tasa = Number.isFinite(Number(c.tasaInteresAnual)) ? Number(c.tasaInteresAnual) : 0;
    const plazo = Number.isFinite(Number(c.plazoMeses)) ? Number(c.plazoMeses) : 0;
    const plazoSafe = Math.max(1, plazo);

    // Derivar totales con el servicio para evitar NaN por datos faltantes
    const tot = cotizacionService.calcularTotales(
      precio,
      cuotaInicial,
      tasa,
      plazoSafe,
      {}
    );

    const cronograma = cotizacionService.calcularCronogramaPagos(
      tot.montoFinanciar,
      tasa,
      plazoSafe,
      {}
    );
    return { cronograma, tot };
  };

  const buildPdfHtml = async (c: Cotizacion) => {
    const usuarioNombre = obtenerNombreUsuario();
    const { cronograma, tot } = buildCronograma(c);
    // Cargar logo a dataurl si está disponible
    const logoDataUrl = await (async () => {
      try {
        const tryUrls = [logoAbsUrl(), '/logodelgado.png', '/logo.png'];
        for (const u of tryUrls) {
          try { const res = await fetch(u); if (res.ok) return URL.createObjectURL(await res.blob()); } catch {}
        }
      } catch {}
      return '';
    })();

    const safeNum = (v: any) => Number.isFinite(Number(v)) ? Number(v) : 0;
    const renderRows = (arr: any[]) => arr.map(p => `
      <tr>
        <td>${p.mes}</td>
        <td class="num">${formatearMoneda(safeNum(p.cuota))}</td>
        <td class="num rojo">${formatearMoneda(safeNum(p.interes))}</td>
        <td class="num verde">${formatearMoneda(safeNum(p.capital))}</td>
        <td class="num negrita">${formatearMoneda(safeNum(p.saldo))}</td>
      </tr>
    `).join('');

    return `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Cotización - ${c.nombreProyecto}</title>
        <style>
          * { box-sizing: border-box; }
          @page { size: A4; margin: 10mm; }
          body { font-family: Arial, Helvetica, sans-serif; color: #333; margin: 0; padding: 0; font-size: 11px; }
          .header { display:flex; align-items:center; justify-content: space-between; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
          .header .left { display:flex; align-items:center; gap:10px; }
          .logo { height: 36px; }
          .title { margin: 12px 0 6px; }
          .title h2 { margin: 0; font-size: 16px; }
          .meta { color:#666; font-size: 11px; margin-top: 2px; }
          .section { margin-top: 12px; }
          h3 { margin: 0 0 6px; font-size: 12px; }
          table { width:100%; border-collapse: collapse; font-size: 10.5px; }
          th, td { text-align:left; padding:6px; border-bottom:1px solid #eee; }
          .right { text-align:right; font-size: 11px; }
          .footer { margin-top: 12px; font-size: 10px; color:#777; }
          .tabla-cronograma th { background:#f5f7ff; color:#1f3a8a; }
          .tabla-cronograma td { border-bottom:1px solid #f0f0f0; }
          .num { text-align:right; }
          .rojo { color:#dc2626; }
          .verde { color:#16a34a; }
          .negrita { font-weight: 700; }
          thead { display: table-header-group; }
          tr, td, th { page-break-inside: avoid; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="left">
            <img src="${logoDataUrl || logoAbsUrl()}" class="logo" />
            <div>
              <div><strong>CRM DELGADO</strong></div>
              <div class="meta">Cotización</div>
            </div>
          </div>
          <div class="right">
            <div><strong>Fecha:</strong> ${new Date(c.creadoEn || Date.now()).toLocaleString('es-PE')}</div>
          </div>
        </div>

        <div class="title">
          <h2>${c.nombreProyecto}</h2>
          <div class="meta">Asesor: ${usuarioNombre || '—'}</div>
        </div>

        <div class="section">
          <h3>Datos Financieros</h3>
          <table>
            <tr><th>Precio Inmueble</th><td>${formatearMoneda(c.precioInmueble)}</td></tr>
            <tr><th>Cuota Inicial</th><td>${formatearMoneda(c.cuotaInicial)}</td></tr>
            <tr><th>Monto a Financiar</th><td>${formatearMoneda(tot.montoFinanciar)}</td></tr>
          </table>
        </div>

        <div class="section">
          <h3>Cronograma de Pagos</h3>
          <table class="tabla-cronograma">
            <thead>
              <tr>
                <th>Mes</th><th>Cuota</th><th>Interés</th><th>Capital</th><th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              ${renderRows(cronograma)}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h3>Notas</h3>
          <div>${(c.notas || '—').replace(/</g,'&lt;')}</div>
        </div>

        <div class="footer">Generado por CRM Delgado • ${new Date().toLocaleString('es-PE')} • ${usuarioNombre || ''}</div>
      </body>
    </html>`;
  };

  const handlePreview = async (c: Cotizacion) => {
    const html = await buildPdfHtml(c);
    setPreviewHtml(html);
    setPreviewOpen(true);
  };

  const handleExportPdf = async (c: Cotizacion) => {
    const html = await buildPdfHtml(c);
    // Si hay integración Electron
    try {
      console.log('[ListaCotizaciones] Verificando si Electron está disponible...');
      if ((window as any).electron?.pdf?.generate) {
        console.log('[ListaCotizaciones] Generando PDF con Electron...');
        const base64 = await (window as any).electron.pdf.generate(html);
        console.log('[ListaCotizaciones] PDF generado, tamaño base64:', base64.length);
        const byteChars = atob(base64);
        const byteNumbers = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `Cotizacion_${(c.nombreProyecto || 'Proyecto').replace(/\s+/g,'_')}.pdf`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1500);
        console.log('[ListaCotizaciones] PDF descargado exitosamente');
        return;
      } else {
        console.log('[ListaCotizaciones] Electron no disponible, usando fallback del navegador');
      }
    } catch (error) {
      console.error('[ListaCotizaciones] Error al generar PDF con Electron:', error);
    }
    // Fallback navegador
    console.log('[ListaCotizaciones] Abriendo diálogo de impresión del navegador...');
    const w = window.open('about:blank');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
    setTimeout(() => { try { w.close(); } catch {} }, 500);
  };

  const handleExportExcel = (c: Cotizacion) => {
    const usuarioNombre = obtenerNombreUsuario();
    const { cronograma, tot } = buildCronograma(c);
    const esc = (v: any) => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const rows: string[] = [];
    const pushRow = (cells: Array<{v:string|number, style?:string}>) => {
      rows.push('<Row>' + cells.map(c => `<Cell${c.style?` ss:StyleID="${c.style}"`:''}><Data ss:Type="String">${esc(c.v)}</Data></Cell>`).join('') + '</Row>');
    };
    pushRow([{v:`Cotización - ${c.nombreProyecto}`, style:'Bold'}]);
    pushRow([{v:`Asesor: ${usuarioNombre || '—'}`}]);
    rows.push('<Row/>');
    pushRow([{v:'Datos Financieros', style:'Bold'}]);
    pushRow([{v:'Precio Inmueble'}, {v: formatearMoneda(c.precioInmueble)}]);
    pushRow([{v:'Cuota Inicial'}, {v: formatearMoneda(c.cuotaInicial)}]);
    pushRow([{v:'Monto a Financiar'}, {v: formatearMoneda(tot.montoFinanciar)}]);
    rows.push('<Row/>');
    rows.push('<Row><Cell ss:StyleID="Bold"><Data ss:Type="String">Cronograma de Pagos</Data></Cell></Row>');
    rows.push('<Row><Cell ss:StyleID="Header"><Data ss:Type="String">Mes</Data></Cell><Cell ss:StyleID="Header"><Data ss:Type="String">Cuota</Data></Cell><Cell ss:StyleID="Header"><Data ss:Type="String">Interés</Data></Cell><Cell ss:StyleID="Header"><Data ss:Type="String">Capital</Data></Cell><Cell ss:StyleID="Header"><Data ss:Type="String">Saldo</Data></Cell></Row>');
    cronograma.forEach(p => {
      rows.push('<Row>'
        + `<Cell><Data ss:Type="String">${esc(p.mes)}</Data></Cell>`
        + `<Cell ss:StyleID="Money"><Data ss:Type="String">${esc(formatearMoneda(p.cuota))}</Data></Cell>`
        + `<Cell ss:StyleID="Red"><Data ss:Type="String">${esc(formatearMoneda(p.interes))}</Data></Cell>`
        + `<Cell ss:StyleID="Green"><Data ss:Type="String">${esc(formatearMoneda(p.capital))}</Data></Cell>`
        + `<Cell ss:StyleID="Bold"><Data ss:Type="String">${esc(formatearMoneda(p.saldo))}</Data></Cell>`
        + '</Row>');
    });
    const styles = `
      <Styles>
        <Style ss:ID="Header"><Font ss:Bold="1"/><Interior ss:Color="#EEF2FF" ss:Pattern="Solid"/><Font ss:Color="#1F3A8A"/></Style>
        <Style ss:ID="Bold"><Font ss:Bold="1"/></Style>
        <Style ss:ID="Money"></Style>
        <Style ss:ID="Red"><Font ss:Color="#DC2626"/></Style>
        <Style ss:ID="Green"><Font ss:Color="#16A34A"/></Style>
      </Styles>`;
    const columns = '<Column ss:AutoFitWidth="1" ss:Width="60"/><Column ss:AutoFitWidth="1" ss:Width="120"/>';
    const xml = `<?xml version="1.0"?>\n<?mso-application progid="Excel.Sheet"?>\n<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">${styles}<Worksheet ss:Name="Cotizacion"><Table>${columns}${rows.join('')}</Table><WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel"><Print><ValidPrinterInfo/><FitToPage/></Print></WorksheetOptions></Worksheet></Workbook>`;
    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `Cotizacion_${(c.nombreProyecto || 'Proyecto').replace(/\s+/g,'_')}.xls`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  if (loading) {
    return <p>Cargando cotizaciones...</p>;
  }

  if (cotizaciones.length === 0) {
    return <p>No hay cotizaciones para este contacto.</p>;
  }

  return (
    <>
    <Card>
      <CardContent>
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={() => setHistoryOpen(true)}>Ver historial completo</Button>
        </div>
      </CardContent>
    </Card>
    
    <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 overflow-hidden">
        <DialogTitle className="sr-only">Vista previa de Cotización</DialogTitle>
        <iframe title="Vista previa de Cotización" style={{ width: '100%', height: '100%', border: '0', display: 'block' }} srcDoc={previewHtml} />
      </DialogContent>
    </Dialog>
    
    <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
      <DialogContent className="p-0 max-h-[80vh] overflow-y-auto" style={{ width: '70vw', maxWidth: '1000px' }}>
        <DialogHeader className="px-6 py-2 border-b">
          <DialogTitle>Historial de Cotizaciones</DialogTitle>
        </DialogHeader>
        <div className="px-6 py-3 overflow-x-hidden">
          <Table className="w-full table-fixed border border-gray-400 rounded-md">
            <TableHeader className="bg-gray-50 border-b border-gray-400">
              <TableRow>
                <TableHead className="w-[18%] border-r border-gray-300">Proyecto</TableHead>
                <TableHead className="w-[20%] border-r border-gray-300">Fecha</TableHead>
                <TableHead className="w-[18%] border-r border-gray-300">Monto</TableHead>
                <TableHead className="w-[20%] border-r border-gray-300">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cotizaciones.map((cotizacion) => (
                <TableRow key={cotizacion.id} className="border-b border-gray-300 last:border-b-0">
                  <TableCell className="whitespace-normal break-words border-r border-gray-300">{cotizacion.nombreProyecto}</TableCell>
                  <TableCell className="whitespace-nowrap border-r border-gray-300">{format(new Date(cotizacion.creadoEn), "dd/MM/yyyy", { locale: es })}</TableCell>
                  <TableCell className="whitespace-nowrap border-r border-gray-300">{formatearMoneda(cotizacion.precioInmueble)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end flex-nowrap">
                      <Button
                        aria-label="Vista previa"
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handlePreview(cotizacion)}
                        title="Vista previa"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        aria-label="Descargar PDF"
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleExportPdf(cotizacion)}
                        title="Descargar PDF"
                      >
                        <FileDown className="w-4 h-4 text-red-600" />
                      </Button>
                      <Button
                        aria-label="Descargar Excel"
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleExportExcel(cotizacion)}
                        title="Descargar Excel"
                      >
                        <FileDown className="w-4 h-4 text-green-600" />
                      </Button>
                      <Button
                        aria-label="Eliminar cotización"
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={async () => {
                          if (!confirm('¿Eliminar esta cotización?')) return;
                          try {
                            if (onEliminar) {
                              await onEliminar(cotizacion);
                            } else {
                              alert('Eliminación no configurada. Pasa la prop onEliminar desde el padre.');
                            }
                          } catch {}
                        }}
                        title="Eliminar cotización"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
