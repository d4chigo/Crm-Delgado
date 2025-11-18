/**
 * Servicio para obtener datos del CRM y proporcionar análisis
 * Conecta con la API del backend para obtener estadísticas y datos de contactos
 */

import { API_BASE_URL } from '../config';

interface CRMStats {
    totalContactos: number;
    contactosPorEstado: Record<string, number>;
    contactosPorTipo: Record<string, number>;
    tasaConversion: number;
    ingresoPromedio: number;
    proyectosActivos: number;
    proyectosVendidos: number;
}

interface ContactoData {
    id: string;
    nombre: string;
    apellido: string;
    correo: string;
    telefono: string;
    tipo: string;
    estadoLead: string;
    creadoEn: string;
}

interface ProyectoData {
    id: string;
    nombre: string;
    precio: number;
    estado: string;
    ubicacion: string;
    creadoEn: string;
}

/**
 * Obtener estadísticas generales del CRM
 */
export async function getCRMStats(): Promise<CRMStats | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/crm-data/estadisticas/resumen`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
            }
        });

        if (!response.ok) {
            console.error('Error fetching CRM stats:', response.statusText);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error in getCRMStats:', error);
        return null;
    }
}

/**
 * Obtener contactos con filtros
 */
export async function getContactos(filtros?: {
    tipo?: string;
    estadoLead?: string;
    limite?: number;
}): Promise<ContactoData[]> {
    try {
        const params = new URLSearchParams();
        if (filtros?.tipo) params.append('tipo', filtros.tipo);
        if (filtros?.estadoLead) params.append('estadoLead', filtros.estadoLead);
        if (filtros?.limite) params.append('limite', filtros.limite.toString());

        const response = await fetch(`${API_BASE_URL}/contactos?${params}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
            }
        });

        if (!response.ok) {
            console.error('Error fetching contactos:', response.statusText);
            return [];
        }

        return await response.json();
    } catch (error) {
        console.error('Error in getContactos:', error);
        return [];
    }
}

/**
 * Obtener proyectos con filtros
 */
export async function getProyectos(filtros?: {
    estado?: string;
    limite?: number;
}): Promise<ProyectoData[]> {
    try {
        const params = new URLSearchParams();
        if (filtros?.estado) params.append('estado', filtros.estado);
        if (filtros?.limite) params.append('limite', filtros.limite.toString());

        const response = await fetch(`${API_BASE_URL}/proyectos?${params}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
            }
        });

        if (!response.ok) {
            console.error('Error fetching proyectos:', response.statusText);
            return [];
        }

        return await response.json();
    } catch (error) {
        console.error('Error in getProyectos:', error);
        return [];
    }
}

/**
 * Generar análisis de marketing basado en datos del CRM
 */
export async function generateMarketingAnalysis(): Promise<string> {
    try {
        const stats = await getCRMStats();
        const contactos = await getContactos({ limite: 100 });
        const proyectos = await getProyectos({ limite: 50 });

        if (!stats || contactos.length === 0) {
            return "No hay suficientes datos para generar análisis.";
        }

        // Calcular insights
        const insights: string[] = [];

        // Análisis de contactos
        insights.push(`📊 **Análisis de Contactos**`);
        insights.push(`- Total de contactos: ${stats.totalContactos}`);
        
        // Estados de leads
        const estadoEntries = Object.entries(stats.contactosPorEstado);
        if (estadoEntries.length > 0) {
            insights.push(`- Distribución por estado:`);
            estadoEntries.forEach(([estado, cantidad]) => {
                insights.push(`  • ${estado}: ${cantidad} (${((cantidad / stats.totalContactos) * 100).toFixed(1)}%)`);
            });
        }

        // Tipos de contactos
        const tipoEntries = Object.entries(stats.contactosPorTipo);
        if (tipoEntries.length > 0) {
            insights.push(`- Tipos de contactos:`);
            tipoEntries.forEach(([tipo, cantidad]) => {
                insights.push(`  • ${tipo}: ${cantidad}`);
            });
        }

        // Análisis de proyectos
        insights.push(`\n🏢 **Análisis de Proyectos**`);
        insights.push(`- Proyectos activos: ${stats.proyectosActivos}`);
        insights.push(`- Proyectos vendidos: ${stats.proyectosVendidos}`);
        insights.push(`- Tasa de conversión: ${stats.tasaConversion.toFixed(1)}%`);
        insights.push(`- Ingreso promedio: S/. ${stats.ingresoPromedio.toLocaleString('es-PE')}`);

        // Recomendaciones de marketing
        insights.push(`\n💡 **Recomendaciones de Marketing**`);
        
        if (stats.tasaConversion < 20) {
            insights.push(`- ⚠️ Tu tasa de conversión es baja. Considera mejorar el seguimiento de leads.`);
        }
        
        const clientesActivos = stats.contactosPorEstado['CLIENTE'] || 0;
        if (clientesActivos > 0) {
            insights.push(`- ✅ Tienes ${clientesActivos} clientes activos. Enfócate en retención y referencias.`);
        }

        const leadsCalificados = stats.contactosPorEstado['CALIFICADO'] || 0;
        if (leadsCalificados > 10) {
            insights.push(`- 🎯 Tienes ${leadsCalificados} leads calificados. Prioriza el seguimiento.`);
        }

        return insights.join('\n');
    } catch (error) {
        console.error('Error generating marketing analysis:', error);
        return "Error al generar el análisis de marketing.";
    }
}

/**
 * Obtener recomendaciones personalizadas
 */
export async function getPersonalizedRecommendations(): Promise<string> {
    try {
        const stats = await getCRMStats();
        
        if (!stats) {
            return "No hay datos disponibles para generar recomendaciones.";
        }

        const recommendations: string[] = [];
        recommendations.push(`📋 **Recomendaciones Personalizadas para tu Negocio**\n`);

        // Recomendación 1: Enfoque de marketing
        const clientesActivos = stats.contactosPorEstado['CLIENTE'] || 0;
        const leadsCalificados = stats.contactosPorEstado['CALIFICADO'] || 0;
        const leadsNuevos = stats.contactosPorEstado['NUEVO'] || 0;

        if (leadsNuevos > leadsCalificados) {
            recommendations.push(`1️⃣ **Enfoque en Calificación**: Tienes muchos leads nuevos. Dedica recursos a calificarlos.`);
        } else if (leadsCalificados > clientesActivos) {
            recommendations.push(`1️⃣ **Enfoque en Conversión**: Tienes leads calificados. Intensifica el seguimiento.`);
        } else {
            recommendations.push(`1️⃣ **Enfoque en Generación**: Necesitas más leads. Aumenta tus esfuerzos de marketing.`);
        }

        // Recomendación 2: Ubicaciones
        recommendations.push(`\n2️⃣ **Análisis de Ubicaciones**: Revisa dónde están concentrados tus clientes.`);

        // Recomendación 3: Proyectos
        if (stats.proyectosActivos > 5) {
            recommendations.push(`\n3️⃣ **Gestión de Proyectos**: Tienes muchos proyectos activos. Asegúrate de dar seguimiento a todos.`);
        }

        // Recomendación 4: Ingresos
        if (stats.ingresoPromedio > 0) {
            recommendations.push(`\n4️⃣ **Oportunidad de Ingresos**: Tu ingreso promedio es S/. ${stats.ingresoPromedio.toLocaleString('es-PE')}. Busca proyectos de mayor valor.`);
        }

        return recommendations.join('\n');
    } catch (error) {
        console.error('Error getting recommendations:', error);
        return "Error al obtener recomendaciones.";
    }
}
