-- Script de datos de prueba para el CRM Delgado

-- 1. Insertar usuarios (asesores)
INSERT IGNORE INTO usuarios (id, nombre, email, password, rol, activo, creadoEn, actualizadoEn) VALUES
('user-1', 'Juan Pérez', 'juan@delgado.com', '$2b$10$test', 'AGENTE', true, NOW(), NOW()),
('user-2', 'María García', 'maria@delgado.com', '$2b$10$test', 'AGENTE', true, NOW(), NOW()),
('user-3', 'Carlos López', 'carlos@delgado.com', '$2b$10$test', 'AGENTE', true, NOW(), NOW());

-- 2. Insertar leads
INSERT IGNORE INTO leads (id, nombre, apellido, correo, telefono, direccion, ciudad, estado, fuente, usuarioId, creadoEn, actualizadoEn) VALUES
('lead-1', 'Ana', 'Martínez', 'ana@email.com', '555-0001', 'Calle 1', 'Lima', 'NUEVO', 'Google Ads', 'user-1', NOW(), NOW()),
('lead-2', 'Roberto', 'Silva', 'roberto@email.com', '555-0002', 'Calle 2', 'Lima', 'NUEVO', 'Facebook', 'user-1', NOW(), NOW()),
('lead-3', 'Laura', 'Fernández', 'laura@email.com', '555-0003', 'Calle 3', 'Arequipa', 'NUEVO', 'Referencia', 'user-2', NOW(), NOW()),
('lead-4', 'Diego', 'Morales', 'diego@email.com', '555-0004', 'Calle 4', 'Lima', 'NUEVO', 'Google Ads', 'user-2', NOW(), NOW()),
('lead-5', 'Sofía', 'Rodríguez', 'sofia@email.com', '555-0005', 'Calle 5', 'Lima', 'NUEVO', 'LinkedIn', 'user-3', NOW(), NOW()),
('lead-6', 'Miguel', 'Ángel', 'miguel@email.com', '555-0006', 'Calle 6', 'Lima', 'NUEVO', 'Llamada Fría', 'user-3', NOW(), NOW()),
('lead-7', 'Claudia', 'Ruiz', 'claudia@email.com', '555-0007', 'Calle 7', 'Lima', 'NUEVO', 'Facebook', 'user-1', NOW(), NOW()),
('lead-8', 'Fernando', 'Gómez', 'fernando@email.com', '555-0008', 'Calle 8', 'Lima', 'NUEVO', 'Google Ads', 'user-2', NOW(), NOW());

-- 3. Insertar clientes (algunos leads convertidos)
INSERT IGNORE INTO clientes (id, nombre, apellido, correo, telefono, direccion, ciudad, departamento, usuarioId, creadoEn, actualizadoEn) VALUES
('client-1', 'Ana', 'Martínez', 'ana@email.com', '555-0001', 'Calle 1 #100', 'Lima', 'Lima', 'user-1', NOW(), NOW()),
('client-2', 'Roberto', 'Silva', 'roberto@email.com', '555-0002', 'Calle 2 #200', 'Lima', 'Lima', 'user-1', NOW(), NOW()),
('client-3', 'Laura', 'Fernández', 'laura@email.com', '555-0003', 'Calle 3 #300', 'Arequipa', 'Arequipa', 'user-2', NOW(), NOW()),
('client-4', 'Diego', 'Morales', 'diego@email.com', '555-0004', 'Calle 4 #400', 'Lima', 'Lima', 'user-2', NOW(), NOW());

-- 4. Insertar oportunidades
INSERT IGNORE INTO oportunidades_clientes (id, titulo, etapa, probabilidad, valor, clienteId, leadId, usuarioId, creadoEn, actualizadoEn) VALUES
-- Oportunidades de Ana Martínez (lead-1, client-1)
('opp-1', 'Proyecto Residencial A', 'CONTACTO_INICIAL', 30, 150000, 'client-1', 'lead-1', 'user-1', DATE_SUB(NOW(), INTERVAL 20 DAY), NOW()),
('opp-2', 'Proyecto Residencial B', 'AGENDAMIENTO', 60, 250000, 'client-1', 'lead-1', 'user-1', DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),

-- Oportunidades de Roberto Silva (lead-2, client-2)
('opp-3', 'Proyecto Comercial A', 'SEPARACION', 80, 180000, 'client-2', 'lead-2', 'user-1', DATE_SUB(NOW(), INTERVAL 15 DAY), NOW()),
('opp-4', 'Proyecto Comercial B', 'CIERRE_GANADO', 100, 120000, 'client-2', 'lead-2', 'user-1', DATE_SUB(NOW(), INTERVAL 25 DAY), NOW()),

-- Oportunidades de Laura Fernández (lead-3, client-3)
('opp-5', 'Proyecto Industrial A', 'CONTACTO_INICIAL', 20, 500000, 'client-3', 'lead-3', 'user-2', DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
('opp-6', 'Proyecto Industrial B', 'AGENDAMIENTO', 50, 800000, 'client-3', 'lead-3', 'user-2', DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),

-- Oportunidades de Diego Morales (lead-4, client-4)
('opp-7', 'Proyecto Residencial C', 'SEPARACION', 75, 350000, 'client-4', 'lead-4', 'user-2', DATE_SUB(NOW(), INTERVAL 12 DAY), NOW()),
('opp-8', 'Proyecto Residencial D', 'CIERRE_GANADO', 100, 280000, 'client-4', 'lead-4', 'user-2', DATE_SUB(NOW(), INTERVAL 20 DAY), NOW()),

-- Oportunidades sin cliente (leads sin convertir)
('opp-9', 'Proyecto Residencial E', 'CONTACTO_INICIAL', 15, 100000, NULL, 'lead-5', 'user-3', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
('opp-10', 'Proyecto Residencial F', 'CONTACTO_INICIAL', 25, 150000, NULL, 'lead-6', 'user-3', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
('opp-11', 'Proyecto Comercial C', 'AGENDAMIENTO', 45, 200000, NULL, 'lead-7', 'user-1', DATE_SUB(NOW(), INTERVAL 8 DAY), NOW()),
('opp-12', 'Proyecto Comercial D', 'SEPARACION', 70, 175000, NULL, 'lead-8', 'user-2', DATE_SUB(NOW(), INTERVAL 6 DAY), NOW());
