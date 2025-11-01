<?php
/**
 * API para listar otros servicios
 * Consumida por la página web pública
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/cors.php';

try {
    $tipo = $_GET['tipo'] ?? null;
    
    $sql = "SELECT 
                id,
                titulo,
                descripcion,
                enlaceImagen,
                enlaceVideo,
                tipoServicio,
                creadoEn
            FROM otros_servicios
            ORDER BY creadoEn DESC";
    
    $params = [];
    if ($tipo) {
        $sql = str_replace('ORDER BY', 'WHERE tipoServicio = :tipo ORDER BY', $sql);
        $params['tipo'] = $tipo;
    }
    
    $servicios = fetchAll($sql, $params);
    
    echo json_encode([
        'success' => true,
        'data' => $servicios,
        'count' => count($servicios)
    ]);
    
} catch (Exception $e) {
    error_log("Error en API servicios: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al obtener servicios'
    ]);
}
?>
