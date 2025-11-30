import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { Readable } from 'stream';

/**
 * Genera un PDF con los datos del reporte
 */
export async function generarPDFReporte(
  nombreReporte: string,
  datos: any,
  fechaGeneracion: Date = new Date()
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      }) as any;

      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Encabezado
      doc.fontSize(20).font('Helvetica-Bold').text('REPORTE CRM', { align: 'center' });
      doc.fontSize(14).font('Helvetica').text(nombreReporte, { align: 'center' });
      doc.fontSize(10).text(`Generado: ${fechaGeneracion.toLocaleString('es-PE')}`, { align: 'center' });
      doc.moveDown();

      // Línea separadora
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown();

      // Contenido según tipo de reporte
      switch (nombreReporte) {
        case 'Reporte de Leads':
          generarContenidoReporteLead(doc, datos);
          break;
        case 'Reporte de Conversión':
          generarContenidoReporteConversion(doc, datos);
          break;
        case 'Reporte de Actividad':
          generarContenidoReporteActividad(doc, datos);
          break;
        case 'Reporte de Ventas Cerradas':
          generarContenidoReporteVentasCerradas(doc, datos);
          break;
        case 'Reporte de Clientes Activos':
          generarContenidoReporteClientesActivos(doc, datos);
          break;
        case 'Análisis de Tiempo y Eficiencia':
          generarContenidoAnalisisTiempoEficiencia(doc, datos);
          break;
        case 'Reporte de Fuente de Leads':
          generarContenidoReporteFuenteLeads(doc, datos);
          break;
        default:
          doc.fontSize(12).text('Datos del reporte:');
          doc.fontSize(10).text(JSON.stringify(datos, null, 2));
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Genera un Excel con los datos del reporte
 */
export async function generarExcelReporte(
  nombreReporte: string,
  datos: any,
  fechaGeneracion: Date = new Date()
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Reporte');

  // Estilos
  const estiloEncabezado = {
    font: { bold: true, size: 12, color: { argb: 'FFFFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF366092' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    },
  };

  const estiloTitulo = {
    font: { bold: true, size: 14 },
    alignment: { horizontal: 'center' },
  };

  const estiloDatos = {
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    },
  };

  // Título
  worksheet.merge('A1:D1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `REPORTE CRM - ${nombreReporte}`;
  titleCell.style = estiloTitulo;

  // Fecha de generación
  worksheet.merge('A2:D2');
  const dateCell = worksheet.getCell('A2');
  dateCell.value = `Generado: ${fechaGeneracion.toLocaleString('es-PE')}`;
  dateCell.style = { font: { size: 10, italic: true } };

  worksheet.addRow([]);

  // Contenido según tipo de reporte
  let startRow = 4;
  switch (nombreReporte) {
    case 'Reporte de Leads':
      startRow = generarContenidoExcelReporteLead(worksheet, datos, startRow, estiloEncabezado, estiloDatos);
      break;
    case 'Reporte de Conversión':
      startRow = generarContenidoExcelReporteConversion(worksheet, datos, startRow, estiloEncabezado, estiloDatos);
      break;
    case 'Reporte de Actividad':
      startRow = generarContenidoExcelReporteActividad(worksheet, datos, startRow, estiloEncabezado, estiloDatos);
      break;
    case 'Reporte de Ventas Cerradas':
      startRow = generarContenidoExcelReporteVentasCerradas(worksheet, datos, startRow, estiloEncabezado, estiloDatos);
      break;
    case 'Reporte de Clientes Activos':
      startRow = generarContenidoExcelReporteClientesActivos(worksheet, datos, startRow, estiloEncabezado, estiloDatos);
      break;
    case 'Análisis de Tiempo y Eficiencia':
      startRow = generarContenidoExcelAnalisisTiempoEficiencia(worksheet, datos, startRow, estiloEncabezado, estiloDatos);
      break;
    case 'Reporte de Fuente de Leads':
      startRow = generarContenidoExcelReporteFuenteLeads(worksheet, datos, startRow, estiloEncabezado, estiloDatos);
      break;
  }

  // Ajustar ancho de columnas
  worksheet.columns.forEach((column: any) => {
    let maxLength = 0;
    column.eachCell?.({ includeEmpty: true }, (cell: any) => {
      const cellLength = cell.value ? String(cell.value).length : 0;
      if (cellLength > maxLength) maxLength = cellLength;
    });
    column.width = Math.min(maxLength + 2, 50);
  });

  return workbook.xlsx.writeBuffer() as Promise<Buffer>;
}

// ==================== FUNCIONES PARA PDF ====================

function generarContenidoReporteLead(doc: any, datos: any) {
  doc.fontSize(12).font('Helvetica-Bold').text('Resumen General');
  doc.fontSize(10).font('Helvetica');
  doc.text(`Total de Leads: ${datos.totalLeads}`);
  doc.moveDown();

  if (datos.leadsPorFuente && datos.leadsPorFuente.length > 0) {
    doc.fontSize(12).font('Helvetica-Bold').text('Leads por Fuente');
    doc.fontSize(10).font('Helvetica');
    datos.leadsPorFuente.forEach((item: any) => {
      doc.text(`${item.fuente}: ${item.cantidad}`);
    });
    doc.moveDown();
  }

  if (datos.oportunidadesPorEtapa && datos.oportunidadesPorEtapa.length > 0) {
    doc.fontSize(12).font('Helvetica-Bold').text('Oportunidades por Etapa');
    doc.fontSize(10).font('Helvetica');
    datos.oportunidadesPorEtapa.forEach((item: any) => {
      doc.text(`${item.etapa}: ${item.cantidad}`);
    });
    doc.moveDown();
  }

  if (datos.tiempoPromedioPorEtapa && datos.tiempoPromedioPorEtapa.length > 0) {
    doc.fontSize(12).font('Helvetica-Bold').text('Tiempo Promedio por Etapa');
    doc.fontSize(10).font('Helvetica');
    datos.tiempoPromedioPorEtapa.forEach((item: any) => {
      doc.text(`${item.etapa}: ${item.diasPromedio} días (${item.cantidad} oportunidades)`);
    });
  }
}

function generarContenidoReporteConversion(doc: any, datos: any) {
  doc.fontSize(12).font('Helvetica-Bold').text('Métricas de Conversión');
  doc.fontSize(10).font('Helvetica');
  doc.text(`Total de Leads: ${datos.totalLeads}`);
  doc.text(`Leads con Oportunidades: ${datos.leadsConOportunidades}`);
  doc.text(`Oportunidades Ganadas: ${datos.oportunidadesGanadas}`);
  doc.text(`Valor Total Ganado: $${datos.valorGanado.toLocaleString('es-PE')}`);
  doc.text(`Tasa de Conversión: ${datos.tasaConversionLeads}%`);
  doc.moveDown();

  if (datos.conversionPorEtapa && datos.conversionPorEtapa.length > 0) {
    doc.fontSize(12).font('Helvetica-Bold').text('Conversión por Etapa');
    doc.fontSize(10).font('Helvetica');
    datos.conversionPorEtapa.forEach((item: any) => {
      doc.text(`${item.de} → ${item.a}: ${item.porcentaje}% (${item.cantidad} oportunidades)`);
    });
  }
}

function generarContenidoReporteActividad(doc: any, datos: any) {
  if (datos.oportunidadesPorAgente && datos.oportunidadesPorAgente.length > 0) {
    doc.fontSize(12).font('Helvetica-Bold').text('Oportunidades por Agente');
    doc.fontSize(10).font('Helvetica');
    datos.oportunidadesPorAgente.forEach((item: any) => {
      doc.text(`${item.usuario}: ${item.oportunidadesTotal} oportunidades`);
    });
    doc.moveDown();
  }

  if (datos.oportunidadesPorEtapa && datos.oportunidadesPorEtapa.length > 0) {
    doc.fontSize(12).font('Helvetica-Bold').text('Oportunidades por Etapa');
    doc.fontSize(10).font('Helvetica');
    datos.oportunidadesPorEtapa.forEach((item: any) => {
      doc.text(`${item.etapa}: ${item.cantidad}`);
    });
  }
}

function generarContenidoReporteVentasCerradas(doc: any, datos: any) {
  doc.fontSize(12).font('Helvetica-Bold').text('Resumen de Ventas');
  doc.fontSize(10).font('Helvetica');
  doc.text(`Total de Ventas: ${datos.totalVentas}`);
  doc.text(`Monto Total: $${datos.montoTotal.toLocaleString('es-PE')}`);
  doc.text(`Días Promedio de Cierre: ${datos.diasPromedioCierre}`);
  doc.moveDown();

  if (datos.ventasDetalladas && datos.ventasDetalladas.length > 0) {
    doc.fontSize(12).font('Helvetica-Bold').text('Ventas Detalladas (Primeras 10)');
    doc.fontSize(9).font('Helvetica');
    datos.ventasDetalladas.slice(0, 10).forEach((venta: any) => {
      doc.text(`${venta.titulo} - $${venta.valor?.toLocaleString('es-PE') || 'N/A'} - ${venta.diasParaCierre} días`);
    });
  }
}

function generarContenidoReporteClientesActivos(doc: any, datos: any) {
  doc.fontSize(12).font('Helvetica-Bold').text('Clientes Activos');
  doc.fontSize(10).font('Helvetica');
  doc.text(`Total de Clientes Activos: ${datos.totalClientesActivos}`);
  doc.moveDown();

  if (datos.clientes && datos.clientes.length > 0) {
    doc.fontSize(11).font('Helvetica-Bold').text('Detalle de Clientes (Primeros 10)');
    doc.fontSize(9).font('Helvetica');
    datos.clientes.slice(0, 10).forEach((cliente: any) => {
      doc.text(`${cliente.nombre} - ${cliente.oportunidadesActivas} oportunidades - $${cliente.montoEnJuego.toLocaleString('es-PE')}`);
    });
  }
}

function generarContenidoAnalisisTiempoEficiencia(doc: any, datos: any) {
  doc.fontSize(12).font('Helvetica-Bold').text('Análisis de Tiempo y Eficiencia');
  doc.fontSize(10).font('Helvetica');
  doc.text(`Total de Leads: ${datos.totalLeads}`);
  doc.moveDown();

  if (datos.estadisticas && datos.estadisticas.length > 0) {
    doc.fontSize(11).font('Helvetica-Bold').text('Estadísticas por Etapa');
    doc.fontSize(9).font('Helvetica');
    datos.estadisticas.forEach((item: any) => {
      doc.text(`${item.etapa}:`);
      doc.text(`  Promedio: ${item.diasPromedio} días | Máximo: ${item.diasMaximo} | Mínimo: ${item.diasMinimo} | Tiempo Muerto: ${item.tiempoMuerto}`);
    });
  }
}

function generarContenidoReporteFuenteLeads(doc: any, datos: any) {
  if (datos.mejorFuente) {
    doc.fontSize(12).font('Helvetica-Bold').text('Mejor Fuente de Leads');
    doc.fontSize(10).font('Helvetica');
    doc.text(`Fuente: ${datos.mejorFuente.fuente}`);
    doc.text(`Tasa de Conversión: ${datos.mejorFuente.tasaConversion}%`);
    doc.text(`Eficiencia: ${datos.mejorFuente.eficiencia}`);
    doc.moveDown();
  }

  if (datos.reportePorFuente && datos.reportePorFuente.length > 0) {
    doc.fontSize(12).font('Helvetica-Bold').text('Análisis por Fuente');
    doc.fontSize(9).font('Helvetica');
    datos.reportePorFuente.forEach((item: any) => {
      doc.text(`${item.fuente}:`);
      doc.text(`  Total Leads: ${item.totalLeads} | Conversión: ${item.tasaConversion}% | Ganadas: ${item.oportunidadesGanadas} | Valor: $${item.valorGanado.toLocaleString('es-PE')}`);
    });
  }
}

// ==================== FUNCIONES PARA EXCEL ====================

function generarContenidoExcelReporteLead(
  worksheet: ExcelJS.Worksheet,
  datos: any,
  startRow: number,
  estiloEncabezado: any,
  estiloDatos: any
): number {
  let row = startRow;

  // Resumen General
  worksheet.getCell(`A${row}`).value = 'Resumen General';
  worksheet.getCell(`A${row}`).style = { font: { bold: true, size: 11 } };
  row++;

  worksheet.getCell(`A${row}`).value = 'Total de Leads';
  worksheet.getCell(`B${row}`).value = datos.totalLeads;
  row += 2;

  // Leads por Fuente
  if (datos.leadsPorFuente && datos.leadsPorFuente.length > 0) {
    worksheet.getCell(`A${row}`).value = 'Leads por Fuente';
    worksheet.getCell(`A${row}`).style = { font: { bold: true, size: 11 } };
    row++;

    worksheet.getCell(`A${row}`).value = 'Fuente';
    worksheet.getCell(`B${row}`).value = 'Cantidad';
    [worksheet.getCell(`A${row}`), worksheet.getCell(`B${row}`)].forEach((cell) => {
      cell.style = estiloEncabezado;
    });
    row++;

    datos.leadsPorFuente.forEach((item: any) => {
      worksheet.getCell(`A${row}`).value = item.fuente;
      worksheet.getCell(`B${row}`).value = item.cantidad;
      [worksheet.getCell(`A${row}`), worksheet.getCell(`B${row}`)].forEach((cell) => {
        cell.style = estiloDatos;
      });
      row++;
    });
    row++;
  }

  // Oportunidades por Etapa
  if (datos.oportunidadesPorEtapa && datos.oportunidadesPorEtapa.length > 0) {
    worksheet.getCell(`A${row}`).value = 'Oportunidades por Etapa';
    worksheet.getCell(`A${row}`).style = { font: { bold: true, size: 11 } };
    row++;

    worksheet.getCell(`A${row}`).value = 'Etapa';
    worksheet.getCell(`B${row}`).value = 'Cantidad';
    [worksheet.getCell(`A${row}`), worksheet.getCell(`B${row}`)].forEach((cell) => {
      cell.style = estiloEncabezado;
    });
    row++;

    datos.oportunidadesPorEtapa.forEach((item: any) => {
      worksheet.getCell(`A${row}`).value = item.etapa;
      worksheet.getCell(`B${row}`).value = item.cantidad;
      [worksheet.getCell(`A${row}`), worksheet.getCell(`B${row}`)].forEach((cell) => {
        cell.style = estiloDatos;
      });
      row++;
    });
    row++;
  }

  // Tiempo Promedio por Etapa
  if (datos.tiempoPromedioPorEtapa && datos.tiempoPromedioPorEtapa.length > 0) {
    worksheet.getCell(`A${row}`).value = 'Tiempo Promedio por Etapa';
    worksheet.getCell(`A${row}`).style = { font: { bold: true, size: 11 } };
    row++;

    worksheet.getCell(`A${row}`).value = 'Etapa';
    worksheet.getCell(`B${row}`).value = 'Días Promedio';
    worksheet.getCell(`C${row}`).value = 'Cantidad';
    [worksheet.getCell(`A${row}`), worksheet.getCell(`B${row}`), worksheet.getCell(`C${row}`)].forEach((cell) => {
      cell.style = estiloEncabezado;
    });
    row++;

    datos.tiempoPromedioPorEtapa.forEach((item: any) => {
      worksheet.getCell(`A${row}`).value = item.etapa;
      worksheet.getCell(`B${row}`).value = item.diasPromedio;
      worksheet.getCell(`C${row}`).value = item.cantidad;
      [worksheet.getCell(`A${row}`), worksheet.getCell(`B${row}`), worksheet.getCell(`C${row}`)].forEach((cell) => {
        cell.style = estiloDatos;
      });
      row++;
    });
  }

  return row;
}

function generarContenidoExcelReporteConversion(
  worksheet: ExcelJS.Worksheet,
  datos: any,
  startRow: number,
  estiloEncabezado: any,
  estiloDatos: any
): number {
  let row = startRow;

  worksheet.getCell(`A${row}`).value = 'Métricas de Conversión';
  worksheet.getCell(`A${row}`).style = { font: { bold: true, size: 11 } };
  row++;

  const metricas = [
    ['Total de Leads', datos.totalLeads],
    ['Leads con Oportunidades', datos.leadsConOportunidades],
    ['Oportunidades Ganadas', datos.oportunidadesGanadas],
    ['Valor Total Ganado', `$${datos.valorGanado.toLocaleString('es-PE')}`],
    ['Tasa de Conversión', `${datos.tasaConversionLeads}%`],
  ];

  metricas.forEach(([label, value]) => {
    worksheet.getCell(`A${row}`).value = label;
    worksheet.getCell(`B${row}`).value = value;
    [worksheet.getCell(`A${row}`), worksheet.getCell(`B${row}`)].forEach((cell) => {
      cell.style = estiloDatos;
    });
    row++;
  });

  row++;

  if (datos.conversionPorEtapa && datos.conversionPorEtapa.length > 0) {
    worksheet.getCell(`A${row}`).value = 'Conversión por Etapa';
    worksheet.getCell(`A${row}`).style = { font: { bold: true, size: 11 } };
    row++;

    worksheet.getCell(`A${row}`).value = 'De';
    worksheet.getCell(`B${row}`).value = 'A';
    worksheet.getCell(`C${row}`).value = 'Cantidad';
    worksheet.getCell(`D${row}`).value = 'Porcentaje';
    [worksheet.getCell(`A${row}`), worksheet.getCell(`B${row}`), worksheet.getCell(`C${row}`), worksheet.getCell(`D${row}`)].forEach((cell) => {
      cell.style = estiloEncabezado;
    });
    row++;

    datos.conversionPorEtapa.forEach((item: any) => {
      worksheet.getCell(`A${row}`).value = item.de;
      worksheet.getCell(`B${row}`).value = item.a;
      worksheet.getCell(`C${row}`).value = item.cantidad;
      worksheet.getCell(`D${row}`).value = `${item.porcentaje}%`;
      [worksheet.getCell(`A${row}`), worksheet.getCell(`B${row}`), worksheet.getCell(`C${row}`), worksheet.getCell(`D${row}`)].forEach((cell) => {
        cell.style = estiloDatos;
      });
      row++;
    });
  }

  return row;
}

function generarContenidoExcelReporteActividad(
  worksheet: ExcelJS.Worksheet,
  datos: any,
  startRow: number,
  estiloEncabezado: any,
  estiloDatos: any
): number {
  let row = startRow;

  if (datos.oportunidadesPorAgente && datos.oportunidadesPorAgente.length > 0) {
    worksheet.getCell(`A${row}`).value = 'Oportunidades por Agente';
    worksheet.getCell(`A${row}`).style = { font: { bold: true, size: 11 } };
    row++;

    worksheet.getCell(`A${row}`).value = 'Agente';
    worksheet.getCell(`B${row}`).value = 'Total Oportunidades';
    [worksheet.getCell(`A${row}`), worksheet.getCell(`B${row}`)].forEach((cell) => {
      cell.style = estiloEncabezado;
    });
    row++;

    datos.oportunidadesPorAgente.forEach((item: any) => {
      worksheet.getCell(`A${row}`).value = item.usuario;
      worksheet.getCell(`B${row}`).value = item.oportunidadesTotal;
      [worksheet.getCell(`A${row}`), worksheet.getCell(`B${row}`)].forEach((cell) => {
        cell.style = estiloDatos;
      });
      row++;
    });
    row++;
  }

  if (datos.oportunidadesPorEtapa && datos.oportunidadesPorEtapa.length > 0) {
    worksheet.getCell(`A${row}`).value = 'Oportunidades por Etapa';
    worksheet.getCell(`A${row}`).style = { font: { bold: true, size: 11 } };
    row++;

    worksheet.getCell(`A${row}`).value = 'Etapa';
    worksheet.getCell(`B${row}`).value = 'Cantidad';
    [worksheet.getCell(`A${row}`), worksheet.getCell(`B${row}`)].forEach((cell) => {
      cell.style = estiloEncabezado;
    });
    row++;

    datos.oportunidadesPorEtapa.forEach((item: any) => {
      worksheet.getCell(`A${row}`).value = item.etapa;
      worksheet.getCell(`B${row}`).value = item.cantidad;
      [worksheet.getCell(`A${row}`), worksheet.getCell(`B${row}`)].forEach((cell) => {
        cell.style = estiloDatos;
      });
      row++;
    });
  }

  return row;
}

function generarContenidoExcelReporteVentasCerradas(
  worksheet: ExcelJS.Worksheet,
  datos: any,
  startRow: number,
  estiloEncabezado: any,
  estiloDatos: any
): number {
  let row = startRow;

  worksheet.getCell(`A${row}`).value = 'Resumen de Ventas';
  worksheet.getCell(`A${row}`).style = { font: { bold: true, size: 11 } };
  row++;

  const metricas = [
    ['Total de Ventas', datos.totalVentas],
    ['Monto Total', `$${datos.montoTotal.toLocaleString('es-PE')}`],
    ['Días Promedio de Cierre', datos.diasPromedioCierre],
  ];

  metricas.forEach(([label, value]) => {
    worksheet.getCell(`A${row}`).value = label;
    worksheet.getCell(`B${row}`).value = value;
    [worksheet.getCell(`A${row}`), worksheet.getCell(`B${row}`)].forEach((cell) => {
      cell.style = estiloDatos;
    });
    row++;
  });

  row++;

  if (datos.ventasDetalladas && datos.ventasDetalladas.length > 0) {
    worksheet.getCell(`A${row}`).value = 'Ventas Detalladas';
    worksheet.getCell(`A${row}`).style = { font: { bold: true, size: 11 } };
    row++;

    worksheet.getCell(`A${row}`).value = 'Título';
    worksheet.getCell(`B${row}`).value = 'Cliente';
    worksheet.getCell(`C${row}`).value = 'Valor';
    worksheet.getCell(`D${row}`).value = 'Días para Cierre';
    [worksheet.getCell(`A${row}`), worksheet.getCell(`B${row}`), worksheet.getCell(`C${row}`), worksheet.getCell(`D${row}`)].forEach((cell) => {
      cell.style = estiloEncabezado;
    });
    row++;

    datos.ventasDetalladas.forEach((venta: any) => {
      worksheet.getCell(`A${row}`).value = venta.titulo;
      worksheet.getCell(`B${row}`).value = venta.cliente ? `${venta.cliente.nombre} ${venta.cliente.apellido}` : 'N/A';
      worksheet.getCell(`C${row}`).value = venta.valor || 0;
      worksheet.getCell(`D${row}`).value = venta.diasParaCierre;
      [worksheet.getCell(`A${row}`), worksheet.getCell(`B${row}`), worksheet.getCell(`C${row}`), worksheet.getCell(`D${row}`)].forEach((cell) => {
        cell.style = estiloDatos;
      });
      row++;
    });
  }

  return row;
}

function generarContenidoExcelReporteClientesActivos(
  worksheet: ExcelJS.Worksheet,
  datos: any,
  startRow: number,
  estiloEncabezado: any,
  estiloDatos: any
): number {
  let row = startRow;

  worksheet.getCell(`A${row}`).value = 'Clientes Activos';
  worksheet.getCell(`A${row}`).style = { font: { bold: true, size: 11 } };
  row++;

  worksheet.getCell(`A${row}`).value = 'Total de Clientes Activos';
  worksheet.getCell(`B${row}`).value = datos.totalClientesActivos;
  [worksheet.getCell(`A${row}`), worksheet.getCell(`B${row}`)].forEach((cell) => {
    cell.style = estiloDatos;
  });
  row += 2;

  if (datos.clientes && datos.clientes.length > 0) {
    worksheet.getCell(`A${row}`).value = 'Detalle de Clientes';
    worksheet.getCell(`A${row}`).style = { font: { bold: true, size: 11 } };
    row++;

    worksheet.getCell(`A${row}`).value = 'Nombre';
    worksheet.getCell(`B${row}`).value = 'Correo';
    worksheet.getCell(`C${row}`).value = 'Teléfono';
    worksheet.getCell(`D${row}`).value = 'Oportunidades Activas';
    worksheet.getCell(`E${row}`).value = 'Monto en Juego';
    [worksheet.getCell(`A${row}`), worksheet.getCell(`B${row}`), worksheet.getCell(`C${row}`), worksheet.getCell(`D${row}`), worksheet.getCell(`E${row}`)].forEach((cell) => {
      cell.style = estiloEncabezado;
    });
    row++;

    datos.clientes.forEach((cliente: any) => {
      worksheet.getCell(`A${row}`).value = cliente.nombre;
      worksheet.getCell(`B${row}`).value = cliente.correo;
      worksheet.getCell(`C${row}`).value = cliente.telefono;
      worksheet.getCell(`D${row}`).value = cliente.oportunidadesActivas;
      worksheet.getCell(`E${row}`).value = cliente.montoEnJuego;
      [worksheet.getCell(`A${row}`), worksheet.getCell(`B${row}`), worksheet.getCell(`C${row}`), worksheet.getCell(`D${row}`), worksheet.getCell(`E${row}`)].forEach((cell) => {
        cell.style = estiloDatos;
      });
      row++;
    });
  }

  return row;
}

function generarContenidoExcelAnalisisTiempoEficiencia(
  worksheet: ExcelJS.Worksheet,
  datos: any,
  startRow: number,
  estiloEncabezado: any,
  estiloDatos: any
): number {
  let row = startRow;

  worksheet.getCell(`A${row}`).value = 'Análisis de Tiempo y Eficiencia';
  worksheet.getCell(`A${row}`).style = { font: { bold: true, size: 11 } };
  row++;

  worksheet.getCell(`A${row}`).value = 'Total de Leads';
  worksheet.getCell(`B${row}`).value = datos.totalLeads;
  [worksheet.getCell(`A${row}`), worksheet.getCell(`B${row}`)].forEach((cell) => {
    cell.style = estiloDatos;
  });
  row += 2;

  if (datos.estadisticas && datos.estadisticas.length > 0) {
    worksheet.getCell(`A${row}`).value = 'Estadísticas por Etapa';
    worksheet.getCell(`A${row}`).style = { font: { bold: true, size: 11 } };
    row++;

    worksheet.getCell(`A${row}`).value = 'Etapa';
    worksheet.getCell(`B${row}`).value = 'Días Promedio';
    worksheet.getCell(`C${row}`).value = 'Máximo';
    worksheet.getCell(`D${row}`).value = 'Mínimo';
    worksheet.getCell(`E${row}`).value = 'Cantidad';
    worksheet.getCell(`F${row}`).value = 'Tiempo Muerto';
    [worksheet.getCell(`A${row}`), worksheet.getCell(`B${row}`), worksheet.getCell(`C${row}`), worksheet.getCell(`D${row}`), worksheet.getCell(`E${row}`), worksheet.getCell(`F${row}`)].forEach((cell) => {
      cell.style = estiloEncabezado;
    });
    row++;

    datos.estadisticas.forEach((item: any) => {
      worksheet.getCell(`A${row}`).value = item.etapa;
      worksheet.getCell(`B${row}`).value = item.diasPromedio;
      worksheet.getCell(`C${row}`).value = item.diasMaximo;
      worksheet.getCell(`D${row}`).value = item.diasMinimo;
      worksheet.getCell(`E${row}`).value = item.cantidad;
      worksheet.getCell(`F${row}`).value = item.tiempoMuerto;
      [worksheet.getCell(`A${row}`), worksheet.getCell(`B${row}`), worksheet.getCell(`C${row}`), worksheet.getCell(`D${row}`), worksheet.getCell(`E${row}`), worksheet.getCell(`F${row}`)].forEach((cell) => {
        cell.style = estiloDatos;
      });
      row++;
    });
  }

  return row;
}

function generarContenidoExcelReporteFuenteLeads(
  worksheet: ExcelJS.Worksheet,
  datos: any,
  startRow: number,
  estiloEncabezado: any,
  estiloDatos: any
): number {
  let row = startRow;

  worksheet.getCell(`A${row}`).value = 'Análisis de Fuente de Leads';
  worksheet.getCell(`A${row}`).style = { font: { bold: true, size: 11 } };
  row++;

  if (datos.reportePorFuente && datos.reportePorFuente.length > 0) {
    worksheet.getCell(`A${row}`).value = 'Fuente';
    worksheet.getCell(`B${row}`).value = 'Total Leads';
    worksheet.getCell(`C${row}`).value = 'Con Oportunidades';
    worksheet.getCell(`D${row}`).value = 'Ganadas';
    worksheet.getCell(`E${row}`).value = 'Valor Ganado';
    worksheet.getCell(`F${row}`).value = 'Tasa Conversión';
    worksheet.getCell(`G${row}`).value = 'Eficiencia';
    [worksheet.getCell(`A${row}`), worksheet.getCell(`B${row}`), worksheet.getCell(`C${row}`), worksheet.getCell(`D${row}`), worksheet.getCell(`E${row}`), worksheet.getCell(`F${row}`), worksheet.getCell(`G${row}`)].forEach((cell) => {
      cell.style = estiloEncabezado;
    });
    row++;

    datos.reportePorFuente.forEach((item: any) => {
      worksheet.getCell(`A${row}`).value = item.fuente;
      worksheet.getCell(`B${row}`).value = item.totalLeads;
      worksheet.getCell(`C${row}`).value = item.leadsConOportunidades;
      worksheet.getCell(`D${row}`).value = item.oportunidadesGanadas;
      worksheet.getCell(`E${row}`).value = item.valorGanado;
      worksheet.getCell(`F${row}`).value = `${item.tasaConversion}%`;
      worksheet.getCell(`G${row}`).value = item.eficiencia;
      [worksheet.getCell(`A${row}`), worksheet.getCell(`B${row}`), worksheet.getCell(`C${row}`), worksheet.getCell(`D${row}`), worksheet.getCell(`E${row}`), worksheet.getCell(`F${row}`), worksheet.getCell(`G${row}`)].forEach((cell) => {
        cell.style = estiloDatos;
      });
      row++;
    });
  }

  return row;
}
