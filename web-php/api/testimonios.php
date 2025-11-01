<?php
/**
 * API para listar testimonios aprobados
 * Consumida por la página web pública
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/cors.php';

try {
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    
    // Solo mostrar testimonios aprobados
    $sql = "SELECT 
                id,
                nombre,
                calificacion,
                testimonio,
                foto,
                media,
                videoUrl,
                creadoEn,
                aprobadoEn
            FROM testimonials
            WHERE estado = 'approved'
            ORDER BY aprobadoEn DESC
            LIMIT :limit OFFSET :offset";
    
    $pdo = getDBConnection();
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $testimonios = $stmt->fetchAll();
    
    // Contar total
    $total = fetchOne("SELECT COUNT(*) as total FROM testimonials WHERE estado = 'approved'")['total'];
    
    echo json_encode([
        'success' => true,
        'data' => $testimonios,
        'meta' => [
            'total' => (int)$total,
            'limit' => $limit,
            'offset' => $offset,
            'count' => count($testimonios)
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Error en API testimonios: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al obtener testimonios'
    ]);
}
?>
