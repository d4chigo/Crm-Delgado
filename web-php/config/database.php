<?php
/**
 * Configuración de conexión a MySQL
 * Esta misma BD la usa el CRM localmente
 */

// Configuración para Hostinger (cambiar con tus credenciales)
define('DB_HOST', 'localhost'); // En Hostinger usualmente es 'localhost'
define('DB_NAME', 'u123456789_crm_delgado'); // Tu nombre de BD en Hostinger
define('DB_USER', 'u123456789_crm'); // Tu usuario de BD
define('DB_PASS', 'TU_PASSWORD_SEGURO'); // Tu password
define('DB_CHARSET', 'utf8mb4');

// Crear conexión PDO
function getDBConnection() {
    static $pdo = null;
    
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log("Error de conexión a BD: " . $e->getMessage());
            http_response_code(500);
            die(json_encode(['error' => 'Error de conexión a la base de datos']));
        }
    }
    
    return $pdo;
}

// Función helper para ejecutar consultas preparadas
function executeQuery($sql, $params = []) {
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    } catch (PDOException $e) {
        error_log("Error en consulta: " . $e->getMessage());
        throw $e;
    }
}

// Función para obtener un registro
function fetchOne($sql, $params = []) {
    $stmt = executeQuery($sql, $params);
    return $stmt->fetch();
}

// Función para obtener múltiples registros
function fetchAll($sql, $params = []) {
    $stmt = executeQuery($sql, $params);
    return $stmt->fetchAll();
}
?>
