import { automatizacionService } from '@/services/automatizacion.service';

/**
 * Job para automatizar cambios de estado
 * Se ejecuta cada noche a las 2 AM
 */
export async function iniciarJobAutomatizarEstados() {
  console.log('📅 Iniciando job de automatización de estados...');

  // Ejecutar inmediatamente al iniciar (opcional)
  // await ejecutarAutomatizaciones();

  // Ejecutar cada 24 horas (cada noche)
  setInterval(async () => {
    await ejecutarAutomatizaciones();
  }, 24 * 60 * 60 * 1000); // 24 horas

  // Alternativamente, ejecutar a una hora específica (2 AM)
  programarPorHora(2);
}

/**
 * Ejecutar las automatizaciones
 */
async function ejecutarAutomatizaciones() {
  try {
    const timestamp = new Date().toLocaleString('es-PE');
    console.log(`\n⏰ [${timestamp}] Ejecutando automatizaciones de estado...`);

    const resultados = await automatizacionService.ejecutarTodasLasAutomatizaciones();

    console.log(`\n📊 Resumen de cambios:`);
    console.log(`   • Leads en espera (sin contacto): ${resultados.leadsEnEspera}`);
    console.log(`   • Leads calificados: ${resultados.leadsCalificados}`);
    console.log(`   • Oportunidades inactivadas: ${resultados.oportunidadesInactivadas}`);
    console.log(`   • Leads ganados: ${resultados.leadsGanados}`);
    console.log(`   • Total de cambios: ${Object.values(resultados).reduce((a, b) => a + b, 0)}\n`);
  } catch (error: any) {
    console.error('❌ Error en job de automatización:', error.message);
  }
}

/**
 * Programar ejecución a una hora específica cada día
 */
function programarPorHora(hora: number) {
  const ahora = new Date();
  const proximaEjecucion = new Date();

  proximaEjecucion.setHours(hora, 0, 0, 0);

  // Si la hora ya pasó hoy, programar para mañana
  if (proximaEjecucion <= ahora) {
    proximaEjecucion.setDate(proximaEjecucion.getDate() + 1);
  }

  const tiempoHastaEjecucion = proximaEjecucion.getTime() - ahora.getTime();

  console.log(
    `⏱️  Próxima ejecución programada para: ${proximaEjecucion.toLocaleString('es-PE')}`
  );

  // Ejecutar a la hora programada
  setTimeout(() => {
    ejecutarAutomatizaciones();
    // Luego ejecutar cada 24 horas
    setInterval(ejecutarAutomatizaciones, 24 * 60 * 60 * 1000);
  }, tiempoHastaEjecucion);
}
