<?php
/**
 * API para listar proyectos/propiedades
 * Consumida por la página web pública
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/cors.php';

try {
    // Obtener parámetros de query
    $estado = $_GET['estado'] ?? null;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    $search = $_GET['search'] ?? null;
    
    // Construir query
    $sql = "SELECT 
                p.id,
                p.nombre,
                p.descripcion,
                p.imagen,
                p.precio,
                p.ubicacion,
                p.estado,
                p.creadoEn,
                GROUP_CONCAT(DISTINCT e.nombre) as etiquetas,
                GROUP_CONCAT(DISTINCT e.color) as colores_etiquetas
            FROM proyectos p
            LEFT JOIN proyecto_etiquetas pe ON p.id = pe.proyectoId
            LEFT JOIN etiquetas e ON pe.etiquetaId = e.id
            WHERE p.activo = 1";
    
    $params = [];
    
    // Filtrar por estado
    if ($estado) {
        $sql .= " AND p.estado = :estado";
        $params['estado'] = $estado;
    }
    
    // Búsqueda
    if ($search) {
        $sql .= " AND (p.nombre LIKE :search OR p.descripcion LIKE :search OR p.ubicacion LIKE :search)";
        $params['search'] = "%$search%";
    }
    
    $sql .= " GROUP BY p.id";
    $sql .= " ORDER BY p.creadoEn DESC";
    $sql .= " LIMIT :limit OFFSET :offset";
    
    $pdo = getDBConnection();
    $stmt = $pdo->prepare($sql);
    
    // Bind de parámetros
    foreach ($params as $key => $value) {
        $stmt->bindValue(":$key", $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    
    $stmt->execute();
    $proyectos = $stmt->fetchAll();
    
    // Formatear etiquetas
    foreach ($proyectos as &$proyecto) {
        $proyecto['etiquetas'] = $proyecto['etiquetas'] ? explode(',', $proyecto['etiquetas']) : [];
        $proyecto['colores_etiquetas'] = $proyecto['colores_etiquetas'] ? explode(',', $proyecto['colores_etiquetas']) : [];
    }
    
    // Contar total
    $sqlCount = "SELECT COUNT(*) as total FROM proyectos WHERE activo = 1";
    $countParams = [];
    if ($estado) {
        $sqlCount .= " AND estado = :estado";
        $countParams['estado'] = $estado;
    }
    if ($search) {
        $sqlCount .= " AND (nombre LIKE :search OR descripcion LIKE :search OR ubicacion LIKE :search)";
        $countParams['search'] = "%$search%";
    }
    
    $total = fetchOne($sqlCount, $countParams)['total'];
    
    echo json_encode([
        'success' => true,
        'data' => $proyectos,
        'meta' => [
            'total' => (int)$total,
            'limit' => $limit,
            'offset' => $offset,
            'count' => count($proyectos)
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Error en API proyectos: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al obtener proyectos'
    ]);
}
?>
