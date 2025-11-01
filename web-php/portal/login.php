<?php
/**
 * API de Login para portal de clientes
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/cors.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit();
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $email = $input['email'] ?? null;
    $password = $input['password'] ?? null;
    
    if (!$email || !$password) {
        http_response_code(400);
        echo json_encode(['error' => 'Email y contraseña requeridos']);
        exit();
    }
    
    // Buscar cliente
    $sql = "SELECT c.id, c.nombre, c.apellido, c.correo, c.telefono, c.tipo,
                   cp.password_web
            FROM contactos c
            LEFT JOIN cliente_passwords cp ON c.id = cp.contactoId
            WHERE c.correo = :email 
            AND c.tipo = 'CLIENTE'
            LIMIT 1";
    
    $cliente = fetchOne($sql, ['email' => $email]);
    
    if (!$cliente) {
        http_response_code(401);
        echo json_encode(['error' => 'Credenciales inválidas']);
        exit();
    }
    
    // Verificar password
    if (!password_verify($password, $cliente['password_web'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Credenciales inválidas']);
        exit();
    }
    
    // Iniciar sesión
    session_start();
    $_SESSION['cliente_id'] = $cliente['id'];
    $_SESSION['cliente_nombre'] = $cliente['nombre'] . ' ' . ($cliente['apellido'] ?? '');
    $_SESSION['cliente_email'] = $cliente['correo'];
    
    // Registrar último acceso
    executeQuery(
        "INSERT INTO cliente_accesos (contactoId, fechaAcceso, ipAddress) VALUES (:id, NOW(), :ip)",
        [
            'id' => $cliente['id'],
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
        ]
    );
    
    echo json_encode([
        'success' => true,
        'cliente' => [
            'id' => $cliente['id'],
            'nombre' => $cliente['nombre'],
            'apellido' => $cliente['apellido'],
            'email' => $cliente['correo'],
            'telefono' => $cliente['telefono']
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Error en login: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error en el servidor']);
}
?>
