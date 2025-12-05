-- CRM Delgado Database Setup
-- Creación de base de datos y tablas iniciales

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS `crm_delgado` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `crm_delgado`;

-- Tabla de usuarios
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `correo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
  `contrasena` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol` enum('ADMIN','SUPERVISOR','AGENTE','ASISTENTE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AGENTE',
  `avatar` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuarios_correo_key` (`correo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de etiquetas
DROP TABLE IF EXISTS `etiquetas`;
CREATE TABLE `etiquetas` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
  `color` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icono` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT 1,
  `orden` int NOT NULL DEFAULT 0,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `etiquetas_nombre_key` (`nombre`),
  KEY `etiquetas_activa_idx` (`activa`),
  KEY `etiquetas_activa_orden_idx` (`activa`,`orden`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de leads
DROP TABLE IF EXISTS `leads`;
CREATE TABLE `leads` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ciudad` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dni` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sexo` enum('MASCULINO','FEMENINO') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_nacimiento` datetime(3) DEFAULT NULL,
  `creado_en` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizado_en` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `id_usuario` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cargo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `departamento` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `distrito` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `empresa` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('NUEVO','CONTACTADO','CALIFICADO','NEGOCIACION','PROPUESTA','GANADO','PERDIDO','EN_ESPERA') COLLATE utf8mb4_unicode_ci DEFAULT 'NUEVO',
  `fecha_seguimiento` datetime(3) DEFAULT NULL,
  `fuente` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `etiquetas` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `presupuesto` double DEFAULT NULL,
  `prioridad` enum('BAJA','MEDIA','ALTA','URGENTE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEDIA',
  `probabilidad` int DEFAULT NULL,
  `provincia` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `leads_id_usuario_idx` (`id_usuario`),
  KEY `leads_correo_idx` (`correo`),
  KEY `leads_creado_en_idx` (`creado_en`),
  KEY `leads_departamento_idx` (`departamento`),
  KEY `leads_estado_idx` (`estado`),
  KEY `leads_prioridad_idx` (`prioridad`),
  CONSTRAINT `leads_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de lead_etiquetas
DROP TABLE IF EXISTS `lead_etiquetas`;
CREATE TABLE `lead_etiquetas` (
  `id_lead` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_etiqueta` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `asignado_en` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id_lead`,`id_etiqueta`),
  KEY `lead_etiquetas_id_lead_idx` (`id_lead`),
  KEY `lead_etiquetas_id_etiqueta_idx` (`id_etiqueta`),
  CONSTRAINT `lead_etiquetas_id_etiqueta_fkey` FOREIGN KEY (`id_etiqueta`) REFERENCES `etiquetas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `lead_etiquetas_id_lead_fkey` FOREIGN KEY (`id_lead`) REFERENCES `leads` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de clientes
DROP TABLE IF EXISTS `clientes`;
CREATE TABLE `clientes` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ciudad` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dni` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sexo` enum('MASCULINO','FEMENINO') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_nacimiento` datetime(3) DEFAULT NULL,
  `creado_en` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizado_en` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `id_usuario` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cargo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `departamento` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `distrito` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `empresa` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_conversion` datetime(3) DEFAULT NULL,
  `fecha_seguimiento` datetime(3) DEFAULT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `presupuesto` double DEFAULT NULL,
  `prioridad` enum('BAJA','MEDIA','ALTA','URGENTE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEDIA',
  `probabilidad` int DEFAULT NULL,
  `provincia` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `clientes_id_usuario_idx` (`id_usuario`),
  KEY `clientes_correo_idx` (`correo`),
  KEY `clientes_creado_en_idx` (`creado_en`),
  KEY `clientes_departamento_idx` (`departamento`),
  KEY `clientes_prioridad_idx` (`prioridad`),
  CONSTRAINT `clientes_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de cliente_etiquetas
DROP TABLE IF EXISTS `cliente_etiquetas`;
CREATE TABLE `cliente_etiquetas` (
  `id_cliente` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_etiqueta` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `asignado_en` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id_cliente`,`id_etiqueta`),
  KEY `cliente_etiquetas_id_cliente_idx` (`id_cliente`),
  KEY `cliente_etiquetas_id_etiqueta_idx` (`id_etiqueta`),
  CONSTRAINT `cliente_etiquetas_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cliente_etiquetas_id_etiqueta_fkey` FOREIGN KEY (`id_etiqueta`) REFERENCES `etiquetas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de lead_cliente_asociaciones
DROP TABLE IF EXISTS `lead_cliente_asociaciones`;
CREATE TABLE `lead_cliente_asociaciones` (
  `id_lead` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_cliente` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `asociado_en` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `notas` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_lead`,`id_cliente`),
  KEY `lead_cliente_asociaciones_id_lead_idx` (`id_lead`),
  KEY `lead_cliente_asociaciones_id_cliente_idx` (`id_cliente`),
  CONSTRAINT `lead_cliente_asociaciones_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `lead_cliente_asociaciones_id_lead_fkey` FOREIGN KEY (`id_lead`) REFERENCES `leads` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de oportunidades_clientes
DROP TABLE IF EXISTS `oportunidades_clientes`;
CREATE TABLE `oportunidades_clientes` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_lead` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_cliente` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `titulo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `proyecto` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `propiedad` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `etapa` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CONTACTO_INICIAL',
  `valor` double DEFAULT NULL,
  `probabilidad` int DEFAULT 25,
  `proxima_accion` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ultima_actividad` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `notas` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_en` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizado_en` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `id_usuario` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `oportunidades_clientes_id_lead_idx` (`id_lead`),
  KEY `oportunidades_clientes_id_cliente_idx` (`id_cliente`),
  KEY `oportunidades_clientes_id_usuario_idx` (`id_usuario`),
  KEY `oportunidades_clientes_etapa_idx` (`etapa`),
  KEY `oportunidades_clientes_creado_en_idx` (`creado_en`),
  CONSTRAINT `oportunidades_clientes_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `oportunidades_clientes_id_lead_fkey` FOREIGN KEY (`id_lead`) REFERENCES `leads` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `oportunidades_clientes_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de proyectos
DROP TABLE IF EXISTS `proyectos`;
CREATE TABLE `proyectos` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `imagen` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `precio` double DEFAULT NULL,
  `ubicacion` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitud` double DEFAULT NULL,
  `longitud` double DEFAULT NULL,
  `estado` enum('DISPONIBLE','RESERVADO','VENDIDO','CONSTRUCCION','FINALIZADO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DISPONIBLE',
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `tipo_proyecto` enum('techo_propio','credito_mivivienda','habilitaciones','compra','venta','alquiler','departamento','casa','terreno','local_comercial') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `categoria` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `galeria` json DEFAULT NULL,
  `caracteristicas` json DEFAULT NULL,
  `mostrar_en_web` tinyint(1) NOT NULL DEFAULT 1,
  `orden_web` int DEFAULT NULL,
  `creado_en` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizado_en` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `id_usuario` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `proyectos_activo_idx` (`activo`),
  KEY `proyectos_estado_idx` (`estado`),
  KEY `proyectos_id_usuario_idx` (`id_usuario`),
  KEY `proyectos_tipo_proyecto_idx` (`tipo_proyecto`),
  KEY `proyectos_mostrar_en_web_idx` (`mostrar_en_web`),
  CONSTRAINT `proyectos_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de etiquetas_proyectos
DROP TABLE IF EXISTS `etiquetas_proyectos`;
CREATE TABLE `etiquetas_proyectos` (
  `id_proyecto` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_etiqueta` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `asignado_en` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id_proyecto`,`id_etiqueta`),
  KEY `etiquetas_proyectos_id_proyecto_idx` (`id_proyecto`),
  KEY `etiquetas_proyectos_id_etiqueta_idx` (`id_etiqueta`),
  CONSTRAINT `etiquetas_proyectos_id_etiqueta_fkey` FOREIGN KEY (`id_etiqueta`) REFERENCES `etiquetas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `etiquetas_proyectos_id_proyecto_fkey` FOREIGN KEY (`id_proyecto`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de clientes_proyectos
DROP TABLE IF EXISTS `clientes_proyectos`;
CREATE TABLE `clientes_proyectos` (
  `id_proyecto` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_cliente` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `asociado_en` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `notas` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_proyecto`,`id_cliente`),
  KEY `clientes_proyectos_id_proyecto_idx` (`id_proyecto`),
  KEY `clientes_proyectos_id_cliente_idx` (`id_cliente`),
  CONSTRAINT `clientes_proyectos_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `clientes_proyectos_id_proyecto_fkey` FOREIGN KEY (`id_proyecto`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de cotizaciones
DROP TABLE IF EXISTS `cotizaciones`;
CREATE TABLE `cotizaciones` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_lead` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_cliente` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_referencia` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
  `nombre_proyecto` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_inmueble` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `precio_inmueble` double NOT NULL,
  `cuota_inicial` double NOT NULL,
  `porcentaje_cuota_inicial` double NOT NULL,
  `monto_financiar` double NOT NULL,
  `plazo_meses` int NOT NULL,
  `tipo_cuota` enum('FIJA','FLEXIBLE','FLEXIBLE_ESPECIAL') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'FIJA',
  `tasa_interes_anual` double NOT NULL,
  `permite_postergar` tinyint(1) NOT NULL DEFAULT 0,
  `cuotas_postergables` int DEFAULT NULL,
  `permite_doble` tinyint(1) NOT NULL DEFAULT 0,
  `cuotas_dobles_anuales` int DEFAULT NULL,
  `permite_cambio_fecha` tinyint(1) NOT NULL DEFAULT 0,
  `monto_cuota_manual` double DEFAULT NULL,
  `cuota_mensual_estimada` double NOT NULL,
  `total_intereses` double NOT NULL,
  `total_pagar` double NOT NULL,
  `estado` enum('BORRADOR','ENVIADA','ACEPTADA','RECHAZADA','VENCIDA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BORRADOR',
  `notas` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_validez` datetime(3) DEFAULT NULL,
  `creado_en` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizado_en` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `cotizaciones_numero_referencia_key` (`numero_referencia`),
  KEY `cotizaciones_id_lead_idx` (`id_lead`),
  KEY `cotizaciones_id_cliente_idx` (`id_cliente`),
  KEY `cotizaciones_estado_idx` (`estado`),
  KEY `cotizaciones_tipo_cuota_idx` (`tipo_cuota`),
  CONSTRAINT `cotizaciones_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cotizaciones_id_lead_fkey` FOREIGN KEY (`id_lead`) REFERENCES `leads` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de reportes
DROP TABLE IF EXISTS `reportes`;
CREATE TABLE `reportes` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parametros` json DEFAULT NULL,
  `resultados_resumen` json DEFAULT NULL,
  `generado_por` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `generado_en` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `reportes_generado_por_idx` (`generado_por`),
  CONSTRAINT `reportes_generado_por_fkey` FOREIGN KEY (`generado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de alertas_leads
DROP TABLE IF EXISTS `alertas_leads`;
CREATE TABLE `alertas_leads` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_lead` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_usuario` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_creada` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `fecha_limite` datetime(3) NOT NULL,
  `completada` tinyint(1) NOT NULL DEFAULT 0,
  `completada_en` datetime(3) DEFAULT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `alertas_leads_id_usuario_idx` (`id_usuario`),
  KEY `alertas_leads_id_lead_idx` (`id_lead`),
  KEY `alertas_leads_completada_idx` (`completada`),
  KEY `alertas_leads_fecha_limite_idx` (`fecha_limite`),
  KEY `alertas_leads_fecha_creada_idx` (`fecha_creada`),
  CONSTRAINT `alertas_leads_id_lead_fkey` FOREIGN KEY (`id_lead`) REFERENCES `leads` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `alertas_leads_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de otros_servicios
DROP TABLE IF EXISTS `otros_servicios`;
CREATE TABLE `otros_servicios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `imagen` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de testimonios
DROP TABLE IF EXISTS `testimonios`;
CREATE TABLE `testimonios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `correo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cargo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `calificacion` int NOT NULL DEFAULT 5,
  `testimonio` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `foto` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDIENTE',
  `creado_en` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizado_en` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de miembros_equipo
DROP TABLE IF EXISTS `miembros_equipo`;
CREATE TABLE `miembros_equipo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cargo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `foto` longtext COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `orden_mostrar` int NOT NULL DEFAULT 0,
  `facebook` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `instagram` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tiktok` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `miembros_equipo_activo_idx` (`activo`),
  KEY `miembros_equipo_orden_mostrar_idx` (`orden_mostrar`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de migraciones (para Prisma)
DROP TABLE IF EXISTS `_prisma_migrations`;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- Datos de ejemplo: Usuario admin por defecto
INSERT INTO `usuarios` (`id`, `nombre`, `correo`, `contrasena`, `rol`, `avatar`, `telefono`, `activo`, `creadoEn`, `actualizadoEn`) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Administrador', 'admin@crmdelgado.com', '\$2b\$10\$YixZu5L9K.YQrU3v6qCZme.Z3NKWqaUuDQvFEn9VLhLqTbx1C0gI.', 'ADMIN', NULL, NULL, 1, NOW(3), NOW(3));

-- Etiquetas por defecto
INSERT INTO `etiquetas` (`id`, `nombre`, `color`, `descripcion`, `icono`, `activa`, `orden`, `creadoEn`, `actualizadoEn`) VALUES
('e1-techo-propio', 'Techo Propio', '#FF6B6B', 'Leads interesados en Techo Propio', 'home', 1, 1, NOW(3), NOW(3)),
('e2-credito-mivivienda', 'Crédito Mi Vivienda', '#4ECDC4', 'Leads interesados en Crédito Mi Vivienda', 'credit-card', 1, 2, NOW(3), NOW(3)),
('e3-habilitaciones', 'Habilitaciones', '#45B7D1', 'Leads interesados en Habilitaciones', 'building', 1, 3, NOW(3), NOW(3)),
('e4-compra-venta', 'Compra/Venta', '#FFA07A', 'Leads interesados en Compra o Venta', 'swap', 1, 4, NOW(3), NOW(3)),
('e5-alquiler', 'Alquiler', '#98D8C8', 'Leads interesados en Alquiler', 'key', 1, 5, NOW(3), NOW(3)),
('e6-departamento', 'Departamento', '#F7DC6F', 'Tipo de inmueble: Departamento', 'door', 1, 6, NOW(3), NOW(3)),
('e7-casa', 'Casa', '#BB8FCE', 'Tipo de inmueble: Casa', 'home', 1, 7, NOW(3), NOW(3)),
('e8-terreno', 'Terreno', '#85C1E2', 'Tipo de inmueble: Terreno', 'map', 1, 8, NOW(3), NOW(3)),
('e9-caliente', 'Caliente', '#E74C3C', 'Lead caliente - Alto interés', 'fire', 1, 9, NOW(3), NOW(3)),
('e10-tibia', 'Tibia', '#F39C12', 'Lead tibia - Interés moderado', 'thermometer-half', 1, 10, NOW(3), NOW(3)),
('e11-fria', 'Fría', '#3498DB', 'Lead fría - Bajo interés', 'snowflake', 1, 11, NOW(3), NOW(3)),
('e12-seguimiento', 'Seguimiento', '#9B59B6', 'Requiere seguimiento próximo', 'clock', 1, 12, NOW(3), NOW(3)),
('e13-propuesta-enviada', 'Propuesta Enviada', '#2ECC71', 'Propuesta enviada al cliente', 'send', 1, 13, NOW(3), NOW(3)),
('e14-negociacion', 'Negociación', '#E67E22', 'En etapa de negociación', 'handshake', 1, 14, NOW(3), NOW(3)),
('e15-vip', 'VIP', '#C0392B', 'Cliente o Lead VIP', 'crown', 1, 15, NOW(3), NOW(3));

-- 2025-12-03 Setup inicial completado con etiquetas
