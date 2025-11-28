'use client';

import { useState, useEffect, useMemo } from 'react';
import type { ReactNode, ComponentType, InputHTMLAttributes } from 'react';

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
interface FormSectionProps { title: string; children: ReactNode; }
const FormSection = ({ title, children }: FormSectionProps) => (
  <section>
    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{title}</h3>
    <div className="p-4 border rounded-lg bg-white space-y-4">
      {children}
    </div>
  </section>
);

type IconInputProps = { icon: ComponentType<{ className?: string }> } & InputHTMLAttributes<HTMLInputElement>;
const IconInput = ({ icon: Icon, ...props }: IconInputProps) => (
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
  leadId?: string;
  clienteId?: string;
  nombreContacto?: string;
}

export const FormularioCotizacion = ({
  open,
  onOpenChange,
  onGuardar,
  cotizacion,
  leadId,
  clienteId,
  nombreContacto
}: FormularioCotizacionProps) => {
  const [guardando, setGuardando] = useState(false);

  const estadoInicial = (): CrearCotizacionDTO => ({
    ...(leadId && { leadId }),
    ...(clienteId && { clienteId }),
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

  const [datos, setDatos] = useState<CrearCotizacionDTO>(estadoInicial());

  // Clave de borrador por contacto (lead o cliente)
  const contactoId = leadId || clienteId || '';
  const DRAFT_KEY = useMemo(() => `cotizacion_draft_${contactoId}`, [contactoId]);

  // Resetear formulario cuando se cierra el diálogo (si no es edición)
  useEffect(() => {
    if (!open && !cotizacion) {
      // Limpiar el formulario y el borrador cuando se cierra sin estar editando
      try { localStorage.removeItem(DRAFT_KEY); } catch { }
      setDatos(estadoInicial());
    }
  }, [open, cotizacion, DRAFT_KEY]);

  useEffect(() => {
    if (!open) return; // Solo actuar cuando el diálogo está abierto
    
    if (cotizacion) {
      setDatos(prev => ({ ...prev, ...cotizacion }));
    } else {
      // Para nueva cotización, intentar cargar borrador
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (raw) {
          const draft = JSON.parse(raw);
          setDatos({ ...draft, ...(leadId && { leadId }), ...(clienteId && { clienteId }) });
          return;
        }
      } catch {}
      // Si no hay borrador, resetear al estado inicial
      setDatos(estadoInicial());
    }
  }, [cotizacion, leadId, clienteId, DRAFT_KEY, open]);  // Auto-guardar borrador en localStorage (debounce simple)
  useEffect(() => {
    if (cotizacion) return; // si ya existe, no guardar borrador
    const t = setTimeout(() => {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(datos)); } catch { }
    }, 300);
    return () => clearTimeout(t);
  }, [datos, cotizacion, DRAFT_KEY]);

  const calculosEnVivo = useMemo(() => cotizacionService.calcularTotales(datos.precioInmueble, datos.cuotaInicial, datos.tasaInteresAnual, datos.plazoMeses, {
    modalidadPago: datos.tipoCuota as any,
    frecuenciaCuotaEspecial: datos.frecuenciaCuotaEspecial as any,
    cuotaEspecialTipo: datos.cuotaEspecialTipo as any,
    cuotaEspecialValor: datos.cuotaEspecialValor as any,
    montoCuotaManual: datos.montoCuotaManual
  }), [datos.precioInmueble, datos.cuotaInicial, datos.tasaInteresAnual, datos.plazoMeses, datos.tipoCuota, datos.frecuenciaCuotaEspecial, datos.cuotaEspecialTipo, datos.cuotaEspecialValor, datos.montoCuotaManual]);

  const cronogramaPagos = useMemo(() => cotizacionService.calcularCronogramaPagos(calculosEnVivo.montoFinanciar, datos.tasaInteresAnual, datos.plazoMeses, {
    modalidadPago: datos.tipoCuota as any,
    frecuenciaCuotaEspecial: datos.frecuenciaCuotaEspecial as any,
    cuotaEspecialTipo: datos.cuotaEspecialTipo as any,
    cuotaEspecialValor: datos.cuotaEspecialValor as any,
    montoCuotaManual: datos.montoCuotaManual as any
  }), [calculosEnVivo.montoFinanciar, datos.tasaInteresAnual, datos.plazoMeses, datos.tipoCuota, datos.frecuenciaCuotaEspecial, datos.cuotaEspecialTipo, datos.cuotaEspecialValor, datos.montoCuotaManual]);

  // Si el cronograma generado tiene un número diferente de meses, actualizar plazoMeses automáticamente
  useEffect(() => {
    if (cronogramaPagos.length > 0 && cronogramaPagos.length !== datos.plazoMeses) {
      const mesesReales = cronogramaPagos.length;
      setDatos(prev => ({
        ...prev,
        plazoMeses: mesesReales
      }));
    }
  }, [cronogramaPagos.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📋 FormularioCotizacion.handleSubmit - datos a enviar:', JSON.stringify(datos, null, 2));
    console.log('📋 leadId prop:', leadId, 'clienteId prop:', clienteId);
    setGuardando(true);
    try {
      // Crear una copia limpia de los datos para enviar
      // Excluir contactoId que es solo para uso interno del componente
      const { ...datosLimpios } = datos;

      // Asegurar que leadId o clienteId estén presentes según las props
      if (leadId) datosLimpios.leadId = leadId;
      if (clienteId) datosLimpios.clienteId = clienteId;

      await onGuardar(datosLimpios);
      // Limpiar borrador al guardar con éxito
      try { localStorage.removeItem(DRAFT_KEY); } catch { }
      onOpenChange(false);
    } catch (error) { console.error('Error al guardar:', error); }
    finally { setGuardando(false); }
  };

  const formatearMoneda = (valor: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(valor);

  const puedeExportar = useMemo(() => {
    return (
      (datos?.nombreProyecto || '').trim().length > 0 &&
      Number(datos.precioInmueble) > 0 &&
      Number(datos.plazoMeses) > 0 &&
      Number(datos.tasaInteresAnual) >= 0 &&
      Number(datos.cuotaInicial) >= 0
    );
  }, [datos]);

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

  const exportarPDF = async () => {
    if (!puedeExportar) return;
    const usuarioNombre = obtenerNombreUsuario();
    const cronograma = cronogramaPagos;
    // Preparar logo en base64 para que funcione dentro de data:url del printToPDF
    const logoDataUrl = await (async () => {
      try {
        const tryUrls = [logoAbsUrl(), '/logodelgado.png', '/logo.png'];
        let blob: Blob | null = null;
        for (const u of tryUrls) {
          try {
            const res = await fetch(u);
            if (res.ok) { blob = await res.blob(); break; }
          } catch { }
        }
        if (!blob) return '';
        return await new Promise<string>((resolve) => {
          const fr = new FileReader();
          fr.onload = () => resolve(String(fr.result));
          fr.readAsDataURL(blob);
        });
      } catch { return ''; }
    })();

    // Renderizar todo el cronograma en una sola tabla para no perder meses en el PDF
    const renderRows = (arr: any[]) => arr.map(p => `
      <tr>
        <td>${p.mes}</td>
        <td class="num">${formatearMoneda(p.cuota)}</td>
        <td class="num rojo">${formatearMoneda(p.interes)}</td>
        <td class="num verde">${formatearMoneda(p.capital)}</td>
        <td class="num negrita">${formatearMoneda(p.saldo)}</td>
      </tr>
    `).join('');
    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Cotización - ${datos.nombreProyecto}</title>
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
              <div><strong>Fecha:</strong> ${new Date().toLocaleString('es-PE')}</div>
            </div>
          </div>

          <div class="title">
            <h2>${datos.nombreProyecto}</h2>
            <div class="meta">Asesor: ${usuarioNombre || '—'}</div>
          </div>

          <div class="section">
            <h3>Datos Financieros</h3>
            <table>
              <tr><th>Precio Inmueble</th><td>${formatearMoneda(datos.precioInmueble)}</td></tr>
              <tr><th>Cuota Inicial</th><td>${formatearMoneda(datos.cuotaInicial)}</td></tr>
              <tr><th>Monto a Financiar</th><td>${formatearMoneda(calculosEnVivo.montoFinanciar)}</td></tr>
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
            <div>${(datos.notas || '—').replace(/</g, '&lt;')}</div>
          </div>

          <div class="footer">Generado por CRM Delgado • ${new Date().toLocaleString('es-PE')} • ${usuarioNombre || ''}</div>
        </body>
      </html>`;
    try {
      console.log('[Cotizacion] Verificando si Electron está disponible...');
      if ((window as any).electron?.pdf?.generate) {
        console.log('[Cotizacion] Generando PDF con Electron...');
        const base64 = await (window as any).electron.pdf.generate(html);
        console.log('[Cotizacion] PDF generado, tamaño base64:', base64.length);
        const byteChars = atob(base64);
        const byteNumbers = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `Cotizacion_${(datos.nombreProyecto || 'Proyecto').replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1500);
        console.log('[Cotizacion] PDF descargado exitosamente');
        return;
      } else {
        console.log('[Cotizacion] Electron no disponible, usando fallback del navegador');
      }
    } catch (error) {
      console.error('[Cotizacion] Error al generar PDF con Electron:', error);
    }
    // Fallback: abrir diálogo de impresión si no hay Electron
    console.log('[Cotizacion] Abriendo diálogo de impresión del navegador...');
    const w = window.open('about:blank');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
    setTimeout(() => { try { w.close(); } catch { } }, 500);
  };

  const exportarExcel = () => {
    if (!puedeExportar) return;
    const usuarioNombre = obtenerNombreUsuario();
    const esc = (v: any) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const rows: string[] = [];
    const pushRow = (cells: Array<{ v: string | number, style?: string }>) => {
      rows.push('<Row>' + cells.map(c => `<Cell${c.style ? ` ss:StyleID=\"${c.style}\"` : ''}><Data ss:Type=\"String\">${esc(c.v)}</Data></Cell>`).join('') + '</Row>');
    };
    // Encabezado
    pushRow([{ v: `Cotización - ${datos.nombreProyecto}`, style: 'Bold' }]);
    pushRow([{ v: `Asesor: ${usuarioNombre || '—'}` }]);
    rows.push('<Row/>');
    // Información del inmueble
    pushRow([{ v: 'Información del Inmueble', style: 'Bold' }]);
    pushRow([{ v: 'Tipo' }, { v: datos.tipoInmueble || 'No especificado' }]);
    pushRow([{ v: 'Descripción' }, { v: datos.descripcion || 'No especificado' }]);
    rows.push('<Row/>');
    // Datos financieros
    pushRow([{ v: 'Datos Financieros', style: 'Bold' }]);
    pushRow([{ v: 'Precio Inmueble' }, { v: formatearMoneda(datos.precioInmueble) }]);
    pushRow([{ v: 'Cuota Inicial' }, { v: formatearMoneda(datos.cuotaInicial) }]);
    pushRow([{ v: 'Monto a Financiar' }, { v: formatearMoneda(calculosEnVivo.montoFinanciar) }]);
    pushRow([{ v: 'Plazo (meses)' }, { v: String(datos.plazoMeses) }]);
    pushRow([{ v: 'Tasa Interés Anual' }, { v: `${datos.tasaInteresAnual}%` }]);
    pushRow([{ v: 'Cuota Mensual Estimada' }, { v: formatearMoneda(calculosEnVivo.cuotaMensual) }]);
    pushRow([{ v: 'Total Intereses Estimado' }, { v: formatearMoneda(calculosEnVivo.totalIntereses) }]);
    pushRow([{ v: 'Total a Pagar Estimado' }, { v: formatearMoneda(calculosEnVivo.totalPagar) }]);
    pushRow([{ v: 'Válido Hasta' }, { v: datos.fechaValidez || '—' }]);
    rows.push('<Row/>');
    // Cronograma de pagos
    rows.push('<Row><Cell ss:StyleID="Bold"><Data ss:Type="String">Cronograma de Pagos</Data></Cell></Row>');
    rows.push('<Row><Cell ss:StyleID="Header"><Data ss:Type="String">Mes</Data></Cell><Cell ss:StyleID="Header"><Data ss:Type="String">Cuota</Data></Cell><Cell ss:StyleID="Header"><Data ss:Type="String">Interés</Data></Cell><Cell ss:StyleID="Header"><Data ss:Type="String">Capital</Data></Cell><Cell ss:StyleID="Header"><Data ss:Type="String">Saldo</Data></Cell></Row>');
    cronogramaPagos.forEach(p => {
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
    const columnsCron = '<Column ss:Width="30"/><Column ss:Width="80"/><Column ss:Width="80"/><Column ss:Width="80"/><Column ss:Width="90"/>';
    const xml = `<?xml version="1.0"?>\n<?mso-application progid="Excel.Sheet"?>\n<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">${styles}<Worksheet ss:Name="Cotizacion"><Table>${columns}${rows.join('')}</Table><WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel"><Print><ValidPrinterInfo/><FitToPage/></Print></WorksheetOptions></Worksheet></Workbook>`;
    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `Cotizacion_${(datos.nombreProyecto || 'Proyecto').replace(/\s+/g, '_')}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

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
                  </div>
                )}

                {datos.tipoCuota === 'FLEXIBLE_ESPECIAL' && (
                  <div className="pt-4 mt-4 border-t">
                    <h4 className="text-xs font-semibold text-gray-600 mb-3">Configuración de Cuota Especial</h4>
                    <div className="grid grid-cols-3 gap-x-4">
                      <div>
                        <Label className="text-xs">Frecuencia</Label>
                        <Select value={datos.frecuenciaCuotaEspecial as any || ''} onValueChange={(v) => setDatos({ ...datos, frecuenciaCuotaEspecial: v as any })}><SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="TRIMESTRAL">Trimestral</SelectItem><SelectItem value="SEMESTRAL">Semestral</SelectItem><SelectItem value="ANUAL">Anual</SelectItem></SelectContent></Select>
                      </div>
                      <div>
                        <Label className="text-xs">Tipo</Label>
                        <Select value={datos.cuotaEspecialTipo as any || ''} onValueChange={(v) => setDatos({ ...datos, cuotaEspecialTipo: v as any })}><SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="FIJO">Monto Fijo</SelectItem></SelectContent></Select>
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
              <Button
                variant="outline" size="sm" className="text-xs mr-2"
                onClick={exportarPDF}
                disabled={!puedeExportar}
                title={!puedeExportar ? 'Completa los campos requeridos para exportar' : ''}
              >
                <FileDown className="h-3.5 w-3.5 mr-1.5" />Exportar PDF
              </Button>
              <Button
                variant="outline" size="sm" className="text-xs"
                onClick={exportarExcel}
                disabled={!puedeExportar}
                title={!puedeExportar ? 'Completa los campos requeridos para exportar' : ''}
              >
                <FileDown className="h-3.5 w-3.5 mr-1.5" />Exportar Excel
              </Button>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={guardando}>Cancelar</Button>
              <Button
                type="submit"
                form="quote-form"
                disabled={guardando}
                className="font-semibold"
              >
                {guardando ? 'Guardando...' : 'Crear Cotización'}
              </Button>
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
