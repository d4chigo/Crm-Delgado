import { generarAlertasLeadsNoContactados } from '@/services/alerta.service';

/**
 * Job para generar alertas automáticamente cada cierto tiempo
 * Se ejecuta cada 1 hora para verificar leads sin contactar
 */
export async function iniciarJobGenerarAlertas() {
  console.log('📅 Iniciando job de generación automática de alertas...');
  
  // Ejecutar inmediatamente al iniciar
  await ejecutarGeneracionAlertas();
  
  // Luego ejecutar cada 1 hora
  setInterval(async () => {
    await ejecutarGeneracionAlertas();
  }, 60 * 60 * 1000); // 1 hora
}

async function ejecutarGeneracionAlertas() {
  try {
    console.log('⏰ Ejecutando generación automática de alertas...');
    const alertasCreadas = await generarAlertasLeadsNoContactados();
    
    if (alertasCreadas.length > 0) {
      console.log(`✅ Se crearon ${alertasCreadas.length} alertas automáticamente`);
    } else {
      console.log('ℹ️ No hay nuevos leads sin contactar');
    }
  } catch (error: any) {
    console.error('❌ Error en job de generación de alertas:', error.message);
  }
}
