import { 
  generarAlertasLeadsNoContactados,
  obtenerEstadisticasAlertas 
} from '@/services/alerta.service';

/**
 * Script de prueba para la generación automática de alertas
 * Ejecutar: npm run dev (el job se inicia automáticamente)
 * O: node -r ts-node/register src/test-alertas.ts
 */

async function pruebaGeneracionAlertas() {
  console.log('🧪 Iniciando prueba de generación de alertas...\n');

  try {
    // 1. Generar alertas
    console.log('1️⃣ Generando alertas para leads sin contactar...');
    const alertasCreadas = await generarAlertasLeadsNoContactados();
    
    console.log(`✅ Se crearon ${alertasCreadas.length} alertas`);
    
    if (alertasCreadas.length > 0) {
      console.log('\n📋 Alertas creadas:');
      alertasCreadas.slice(0, 3).forEach((alerta: any) => {
        console.log(`   - Contacto: ${alerta.contactoId}`);
        console.log(`   - Usuario: ${alerta.usuarioId}`);
        console.log(`   - Límite: ${alerta.fechaLimite}`);
      });
    }

    // 2. Obtener estadísticas de un usuario
    console.log('\n\n2️⃣ Obteniendo estadísticas...');
    
    // Usar el primer usuarioId encontrado
    if (alertasCreadas.length > 0) {
      const usuarioId = alertasCreadas[0].usuarioId;
      const estadisticas = await obtenerEstadisticasAlertas(usuarioId);
      
      console.log(`✅ Estadísticas para usuario ${usuarioId.substring(0, 8)}...:`);
      console.log(`   Total: ${estadisticas.total}`);
      console.log(`   Activas: ${estadisticas.activas}`);
      console.log(`   Urgentes: ${estadisticas.urgentes}`);
      console.log(`   Completadas: ${estadisticas.completadas}`);
    }

    console.log('\n\n✨ Prueba completada exitosamente');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error en prueba:', error.message);
    console.error(error);
    process.exit(1);
  }
}

pruebaGeneracionAlertas();
