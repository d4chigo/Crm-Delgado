-- ============================================
-- TABLAS ADICIONALES PARA PORTAL WEB
-- ============================================
-- Ejecutar SOLO si no usas Prisma migrate
-- Estas tablas se crean automáticamente con: npx prisma migrate deploy

-- Tabla de contraseñas para clientes (portal web)
CREATE TABLE IF NOT EXISTS `cliente_passwords` (
  `contactoId` VARCHAR(191) NOT NULL PRIMARY KEY,
  `password_web` VARCHAR(255) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL ON UPDATE CURRENT_TIMESTAMP(3),
  
  FOREIGN KEY (`contactoId`) REFERENCES `contactos`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de documentos subidos por clientes
CREATE TABLE IF NOT EXISTS `cliente_documentos` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `contactoId` VARCHAR(191) NOT NULL,
  `nombre_archivo` VARCHAR(255) NOT NULL,
  `nombre_original` VARCHAR(255) NOT NULL,
  `ruta_archivo` VARCHAR(512) NOT NULL,
  `tipo_documento` VARCHAR(50) NOT NULL,
  `descripcion` TEXT NULL,
  `tamano_bytes` INT NOT NULL,
  `mime_type` VARCHAR(100) NOT NULL,
  `subido_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `estado` VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
  `revisado_por` VARCHAR(191) NULL,
  `revisado_en` DATETIME(3) NULL,
  `notas` TEXT NULL,
  
  INDEX `cliente_documentos_contactoId_idx` (`contactoId`),
  INDEX `cliente_documentos_estado_idx` (`estado`),
  INDEX `cliente_documentos_subido_en_idx` (`subido_en`),
  
  FOREIGN KEY (`contactoId`) REFERENCES `contactos`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de registro de accesos al portal
CREATE TABLE IF NOT EXISTS `cliente_accesos` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `contactoId` VARCHAR(191) NOT NULL,
  `fecha_acceso` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `ip_address` VARCHAR(45) NOT NULL,
  `user_agent` TEXT NULL,
  
  INDEX `cliente_accesos_contactoId_idx` (`contactoId`),
  INDEX `cliente_accesos_fecha_acceso_idx` (`fecha_acceso`),
  
  FOREIGN KEY (`contactoId`) REFERENCES `contactos`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de actividades del cliente en el portal
CREATE TABLE IF NOT EXISTS `cliente_actividades` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `contactoId` VARCHAR(191) NOT NULL,
  `tipo` VARCHAR(50) NOT NULL,
  `descripcion` TEXT NOT NULL,
  `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `metadata` JSON NULL,
  
  INDEX `cliente_actividades_contactoId_idx` (`contactoId`),
  INDEX `cliente_actividades_fecha_idx` (`fecha`),
  
  FOREIGN KEY (`contactoId`) REFERENCES `contactos`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- VERIFICACIÓN DE TABLAS WEB EXISTENTES
-- ============================================
-- Estas tablas ya deberían existir si migraste el schema.prisma
-- Este script solo las verifica/crea si no existen

-- Tabla de otros servicios
CREATE TABLE IF NOT EXISTS `otros_servicios` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `titulo` VARCHAR(255) NOT NULL,
  `descripcion` TEXT NULL,
  `image_link` VARCHAR(512) NULL,
  `video_link` VARCHAR(512) NULL,
  `service_type` ENUM('general', 'topografia', 'dron') NOT NULL DEFAULT 'general',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de miembros del equipo
CREATE TABLE IF NOT EXISTS `team_members` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `cargo` VARCHAR(100) NOT NULL,
  `descripcion` TEXT NOT NULL,
  `correo` VARCHAR(100) NOT NULL,
  `telefono` VARCHAR(20) NOT NULL,
  `foto` VARCHAR(255) NULL,
  `activo` BOOLEAN NOT NULL DEFAULT TRUE,
  `display_order` INT NOT NULL,
  `facebook` VARCHAR(255) NULL,
  `instagram` VARCHAR(255) NULL,
  `tiktok` VARCHAR(255) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NULL ON UPDATE CURRENT_TIMESTAMP(3),
  
  INDEX `team_members_activo_idx` (`activo`),
  INDEX `team_members_display_order_idx` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de testimonios
CREATE TABLE IF NOT EXISTS `testimonials` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `correo` VARCHAR(100) NOT NULL,
  `calificacion` INT NOT NULL,
  `testimonio` TEXT NOT NULL,
  `foto` VARCHAR(255) NULL,
  `media` VARCHAR(255) NULL,
  `video_url` VARCHAR(255) NULL,
  `estado` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved',
  `created_at` DATETIME(3) NOT NULL,
  `approved_at` DATETIME(3) NULL,
  
  INDEX `testimonials_estado_idx` (`estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- ============================================

-- Insertar servicio de ejemplo
INSERT INTO `otros_servicios` (`titulo`, `descripcion`, `service_type`, `created_at`, `updated_at`)
VALUES 
  ('Topografía Profesional', 'Servicios de topografía con equipos de última generación', 'topografia', NOW(), NOW()),
  ('Servicios con Dron', 'Levantamiento topográfico y fotografía aérea', 'dron', NOW(), NOW())
ON DUPLICATE KEY UPDATE id=id;

-- Insertar miembro de equipo de ejemplo
INSERT INTO `team_members` (`nombre`, `cargo`, `descripcion`, `correo`, `telefono`, `activo`, `display_order`, `created_at`)
VALUES 
  ('Juan Pérez', 'Director Comercial', 'Más de 10 años de experiencia en el sector inmobiliario', 'juan@ejemplo.com', '987654321', TRUE, 1, NOW())
ON DUPLICATE KEY UPDATE id=id;

-- Insertar testimonio de ejemplo
INSERT INTO `testimonials` (`nombre`, `correo`, `calificacion`, `testimonio`, `estado`, `created_at`, `approved_at`)
VALUES 
  ('María García', 'maria@ejemplo.com', 5, 'Excelente servicio, muy profesionales y atentos en todo momento.', 'approved', NOW(), NOW())
ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- FUNCIONES ÚTILES
-- ============================================

-- Función para generar UUID (si tu MySQL no lo soporta nativamente)
DELIMITER $$
CREATE FUNCTION IF NOT EXISTS generate_uuid()
RETURNS CHAR(36)
DETERMINISTIC
BEGIN
  RETURN UUID();
END$$
DELIMITER ;

-- ============================================
-- PROCEDIMIENTOS ALMACENADOS (OPCIONAL)
-- ============================================

-- Procedimiento para asignar password a cliente
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS asignar_password_cliente(
  IN p_contacto_id VARCHAR(191),
  IN p_password_hash VARCHAR(255)
)
BEGIN
  INSERT INTO cliente_passwords (contactoId, password_web, created_at, updated_at)
  VALUES (p_contacto_id, p_password_hash, NOW(), NOW())
  ON DUPLICATE KEY UPDATE 
    password_web = p_password_hash,
    updated_at = NOW();
END$$
DELIMITER ;

-- Procedimiento para registrar actividad del cliente
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS registrar_actividad_cliente(
  IN p_contacto_id VARCHAR(191),
  IN p_tipo VARCHAR(50),
  IN p_descripcion TEXT
)
BEGIN
  INSERT INTO cliente_actividades (id, contactoId, tipo, descripcion, fecha)
  VALUES (UUID(), p_contacto_id, p_tipo, p_descripcion, NOW());
END$$
DELIMITER ;

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista de proyectos con toda la información
CREATE OR REPLACE VIEW vista_proyectos_completos AS
SELECT 
  p.id,
  p.nombre,
  p.descripcion,
  p.imagen,
  p.precio,
  p.ubicacion,
  p.estado,
  p.activo,
  p.creadoEn,
  u.nombre as usuario_nombre,
  GROUP_CONCAT(DISTINCT e.nombre) as etiquetas
FROM proyectos p
LEFT JOIN usuarios u ON p.usuarioId = u.id
LEFT JOIN proyecto_etiquetas pe ON p.id = pe.proyectoId
LEFT JOIN etiquetas e ON pe.etiquetaId = e.id
WHERE p.activo = 1
GROUP BY p.id;

-- Vista de clientes con acceso al portal
CREATE OR REPLACE VIEW vista_clientes_portal AS
SELECT 
  c.id,
  c.nombre,
  c.apellido,
  c.correo,
  c.telefono,
  CASE WHEN cp.contactoId IS NOT NULL THEN 'SI' ELSE 'NO' END as tiene_acceso_portal,
  (SELECT MAX(fecha_acceso) FROM cliente_accesos WHERE contactoId = c.id) as ultimo_acceso
FROM contactos c
LEFT JOIN cliente_passwords cp ON c.id = cp.contactoId
WHERE c.tipo = 'CLIENTE';

-- ============================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- ============================================

-- Índices para mejorar rendimiento de consultas frecuentes
CREATE INDEX idx_proyectos_activo_estado ON proyectos(activo, estado);
CREATE INDEX idx_contactos_tipo_correo ON contactos(tipo, correo);
CREATE INDEX idx_oportunidades_cliente_etapa ON oportunidades_clientes(clienteId, etapa);

-- ============================================
-- TRIGGERS (OPCIONAL)
-- ============================================

-- Trigger para registrar actividad cuando se sube un documento
DELIMITER $$
CREATE TRIGGER IF NOT EXISTS after_documento_insert
AFTER INSERT ON cliente_documentos
FOR EACH ROW
BEGIN
  INSERT INTO cliente_actividades (id, contactoId, tipo, descripcion, fecha)
  VALUES (
    UUID(),
    NEW.contactoId,
    'DOCUMENTO_SUBIDO',
    CONCAT('Documento subido: ', NEW.nombre_original),
    NOW()
  );
END$$
DELIMITER ;

-- Trigger para registrar actividad cuando cliente hace login
DELIMITER $$
CREATE TRIGGER IF NOT EXISTS after_acceso_insert
AFTER INSERT ON cliente_accesos
FOR EACH ROW
BEGIN
  INSERT INTO cliente_actividades (id, contactoId, tipo, descripcion, fecha)
  VALUES (
    UUID(),
    NEW.contactoId,
    'LOGIN',
    CONCAT('Acceso desde IP: ', NEW.ip_address),
    NEW.fecha_acceso
  );
END$$
DELIMITER ;

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

-- Verificar que todas las tablas se crearon correctamente
SELECT 
  TABLE_NAME,
  TABLE_ROWS,
  CREATE_TIME
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN (
    'cliente_passwords',
    'cliente_documentos',
    'cliente_accesos',
    'cliente_actividades',
    'otros_servicios',
    'team_members',
    'testimonials'
  )
ORDER BY TABLE_NAME;

-- Mostrar estadísticas
SELECT 'Tablas creadas correctamente' as status;
SELECT COUNT(*) as total_tablas 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE();

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
/*
1. Estas tablas se crean AUTOMÁTICAMENTE si usas Prisma migrate
2. Solo ejecuta este script si prefieres SQL manual
3. Asegúrate de tener permisos CREATE TABLE, CREATE VIEW, CREATE TRIGGER
4. Los UUIDs se generan automáticamente
5. Los timestamps usan DATETIME(3) para milisegundos
6. Las foreign keys mantienen integridad referencial
7. Los índices mejoran el rendimiento de consultas
*/
