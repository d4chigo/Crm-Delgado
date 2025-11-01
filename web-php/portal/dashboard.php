<?php
/**
 * API para obtener dashboard del cliente
 * Muestra resumen de sus proyectos, oportunidades y estado
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/cors.php';
require_once __DIR__ . '/../includes/auth.php';

try {
    $clienteId = verificarSesion();
    
    // Obtener datos del cliente
    $cliente = getClienteActual();
    
    // Obtener oportunidades del cliente
    $oportunidades = fetchAll(
        "SELECT 
            id, titulo, proyecto, propiedad, etapa, valor, 
            probabilidad, ultimaActividad, proximaAccion, notas
        FROM oportunidades_clientes 
        WHERE clienteId = :id 
        ORDER BY ultimaActividad DESC",
        ['id' => $clienteId]
    );
    
    // Obtener proyectos asociados
    $proyectos = fetchAll(
        "SELECT 
            p.id, p.nombre, p.descripcion, p.imagen, 
            p.precio, p.ubicacion, p.estado, pc.notas, pc.asociadoEn
        FROM proyectos p
        INNER JOIN proyecto_clientes pc ON p.id = pc.proyectoId
        WHERE pc.clienteId = :id 
        ORDER BY pc.asociadoEn DESC",
        ['id' => $clienteId]
    );
    
    // Obtener cotizaciones
    $cotizaciones = fetchAll(
        "SELECT 
            id, numeroReferencia, nombreProyecto, precioInmueble, 
            cuotaInicial, cuotaMensualEstimada, plazoMeses, 
            estado, creadoEn
        FROM cotizaciones 
        WHERE contactoId = :id 
        ORDER BY creadoEn DESC
        LIMIT 10",
        ['id' => $clienteId]
    );
    
    // Obtener documentos subidos
    $documentos = fetchAll(
        "SELECT 
            id, nombreArchivo, tipoDocumento, tamanoBytes, 
            subidoEn, estado
        FROM cliente_documentos 
        WHERE contactoId = :id 
        ORDER BY subidoEn DESC",
        ['id' => $clienteId]
    );
    
    // Obtener últimas actividades
    $actividades = fetchAll(
        "SELECT 
            id, tipo, descripcion, fecha
        FROM cliente_actividades 
        WHERE contactoId = :id 
        ORDER BY fecha DESC
        LIMIT 20",
        ['id' => $clienteId]
    );
    
    echo json_encode([
        'success' => true,
        'data' => [
            'cliente' => $cliente,
            'oportunidades' => $oportunidades,
            'proyectos' => $proyectos,
            'cotizaciones' => $cotizaciones,
            'documentos' => $documentos,
            'actividades' => $actividades,
            'estadisticas' => [
                'total_oportunidades' => count($oportunidades),
                'total_proyectos' => count($proyectos),
                'total_cotizaciones' => count($cotizaciones),
                'total_documentos' => count($documentos)
            ]
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Error en dashboard: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al obtener datos del dashboard'
    ]);
}
?>
