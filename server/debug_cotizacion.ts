
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function generarNumeroReferencia() {
    const año = new Date().getFullYear();
    const mes = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const prefijo = `COT-${año}${mes}-`;

    console.log(`Buscando cotizaciones con prefijo: ${prefijo}`);

    const ultimaCotizacion = await prisma.cotizacion.findFirst({
        where: {
            numeroReferencia: {
                startsWith: prefijo
            }
        },
        orderBy: {
            numeroReferencia: 'desc'
        }
    });

    console.log('Última cotización encontrada:', ultimaCotizacion?.numeroReferencia);

    let numero = 1;

    if (ultimaCotizacion) {
        const partes = ultimaCotizacion.numeroReferencia.split('-');
        if (partes.length === 3) {
            const ultimoNumero = parseInt(partes[2]);
            if (!isNaN(ultimoNumero)) {
                numero = ultimoNumero + 1;
            }
        }
    }

    const nuevoNumero = `${prefijo}${numero.toString().padStart(4, '0')}`;
    console.log(`Nuevo número generado: ${nuevoNumero}`);
    return nuevoNumero;
}

async function main() {
    try {
        console.log('Iniciando debug de creación de cotización...');

        // 1. Buscar el lead específico del error
        const targetLeadId = "6f2cc1a0-ab67-459b-bd53-84e30c962db7";
        const lead = await prisma.lead.findUnique({ where: { id: targetLeadId } });

        if (!lead) {
            console.error(`❌ CRÍTICO: El lead ${targetLeadId} NO EXISTE en la base de datos.`);

            // Listar algunos leads que SÍ existen
            const leads = await prisma.lead.findMany({ take: 3 });
            console.log('Leads disponibles:', leads.map(l => ({ id: l.id, nombre: l.nombre })));
            return;
        }
        console.log(`✅ Lead encontrado: ${lead.nombre} ${lead.apellido}`);

        // 2. Generar número
        const numeroReferencia = await generarNumeroReferencia();

        // 3. Intentar crear cotización
        const datos = {
            numeroReferencia,
            leadId: lead.id,
            nombreProyecto: "Proyecto Debug",
            precioInmueble: 50000,
            cuotaInicial: 5000,
            porcentajeCuotaInicial: 10,
            montoFinanciar: 45000,
            plazoMeses: 36,
            tipoCuota: "FIJA", // Enum value as string
            tasaInteresAnual: 10,
            permitePostergar: false,
            permiteDoble: false,
            permiteCambioFecha: false,
            cuotaMensualEstimada: 1500,
            totalIntereses: 5000,
            totalPagar: 50000,
            estado: "BORRADOR", // Enum value as string
            fechaValidez: new Date()
        };

        console.log('Intentando crear cotización con datos:', JSON.stringify(datos, null, 2));

        const cotizacion = await prisma.cotizacion.create({
            data: datos as any // Cast to any to avoid strict type checking issues in script
        });

        console.log('✅ Cotización creada exitosamente:', cotizacion.id);

        // Limpiar
        await prisma.cotizacion.delete({ where: { id: cotizacion.id } });
        console.log('🗑️ Cotización de prueba eliminada.');

    } catch (error) {
        console.error('❌ Error al crear cotización:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
