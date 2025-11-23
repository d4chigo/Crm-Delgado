-- Adminer 5.4.1 MySQL 8.0.44 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

USE `crm_delgado`;

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `_prisma_migrations`;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `alertas_leads`;
CREATE TABLE `alertas_leads` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `leadId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `usuarioId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fechaCreada` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `fechaLimite` datetime(3) NOT NULL,
  `completada` tinyint(1) NOT NULL DEFAULT '0',
  `completadaEn` datetime(3) DEFAULT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `alertas_leads_usuarioId_idx` (`usuarioId`),
  KEY `alertas_leads_leadId_idx` (`leadId`),
  KEY `alertas_leads_completada_idx` (`completada`),
  KEY `alertas_leads_fechaLimite_idx` (`fechaLimite`),
  KEY `alertas_leads_fechaCreada_idx` (`fechaCreada`),
  CONSTRAINT `alertas_leads_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `leads` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `alertas_leads_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `cliente_accesos`;
CREATE TABLE `cliente_accesos` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contacto_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_acceso` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `ip_address` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_agent` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cliente_accesos_contacto_id_idx` (`contacto_id`),
  KEY `cliente_accesos_fecha_acceso_idx` (`fecha_acceso`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `cliente_actividades`;
CREATE TABLE `cliente_actividades` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contacto_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `metadata` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cliente_actividades_contacto_id_idx` (`contacto_id`),
  KEY `cliente_actividades_fecha_idx` (`fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `cliente_documentos`;
CREATE TABLE `cliente_documentos` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contacto_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_archivo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_original` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ruta_archivo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_documento` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tamano_bytes` int NOT NULL,
  `mime_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subido_en` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `estado` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDIENTE',
  `revisado_por` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `revisado_en` datetime(3) DEFAULT NULL,
  `notas` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cliente_documentos_contacto_id_idx` (`contacto_id`),
  KEY `cliente_documentos_estado_idx` (`estado`),
  KEY `cliente_documentos_subido_en_idx` (`subido_en`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `cliente_etiquetas`;
CREATE TABLE `cliente_etiquetas` (
  `clienteId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `etiquetaId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `asignadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`clienteId`,`etiquetaId`),
  KEY `cliente_etiquetas_clienteId_idx` (`clienteId`),
  KEY `cliente_etiquetas_etiquetaId_idx` (`etiquetaId`),
  CONSTRAINT `cliente_etiquetas_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `clientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cliente_etiquetas_etiquetaId_fkey` FOREIGN KEY (`etiquetaId`) REFERENCES `etiquetas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `cliente_passwords`;
CREATE TABLE `cliente_passwords` (
  `contacto_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_web` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`contacto_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `clientes`;
CREATE TABLE `clientes` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ciudad` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dni` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sexo` enum('MASCULINO','FEMENINO') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fechaNacimiento` datetime(3) DEFAULT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizadoEn` datetime(3) NOT NULL,
  `usuarioId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cargo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `departamento` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `distrito` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `empresa` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fechaConversion` datetime(3) DEFAULT NULL,
  `fechaSeguimiento` datetime(3) DEFAULT NULL,
  `notas` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `presupuesto` double DEFAULT NULL,
  `prioridad` enum('BAJA','MEDIA','ALTA','URGENTE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEDIA',
  `probabilidad` int DEFAULT NULL,
  `provincia` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `clientes_usuarioId_idx` (`usuarioId`),
  KEY `clientes_correo_idx` (`correo`),
  KEY `clientes_creadoEn_idx` (`creadoEn`),
  KEY `clientes_departamento_idx` (`departamento`),
  KEY `clientes_prioridad_idx` (`prioridad`),
  CONSTRAINT `clientes_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `cotizaciones`;
CREATE TABLE `cotizaciones` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `leadId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numeroReferencia` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombreProyecto` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipoInmueble` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `precioInmueble` double NOT NULL,
  `cuotaInicial` double NOT NULL,
  `porcentajeCuotaInicial` double NOT NULL,
  `montoFinanciar` double NOT NULL,
  `plazoMeses` int NOT NULL,
  `tipoCuota` enum('FIJA','FLEXIBLE','FLEXIBLE_ESPECIAL') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'FIJA',
  `tasaInteresAnual` double NOT NULL,
  `permitePostergar` tinyint(1) NOT NULL DEFAULT '0',
  `cuotasPostergables` int DEFAULT NULL,
  `permiteDoble` tinyint(1) NOT NULL DEFAULT '0',
  `cuotasDoblesAnuales` int DEFAULT NULL,
  `permiteCambioFecha` tinyint(1) NOT NULL DEFAULT '0',
  `montoCuotaManual` double DEFAULT NULL,
  `cuotaMensualEstimada` double NOT NULL,
  `totalIntereses` double NOT NULL,
  `totalPagar` double NOT NULL,
  `estado` enum('BORRADOR','ENVIADA','ACEPTADA','RECHAZADA','VENCIDA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BORRADOR',
  `notas` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observaciones` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fechaValidez` datetime(3) DEFAULT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizadoEn` datetime(3) NOT NULL,
  `clienteId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cotizaciones_numeroReferencia_key` (`numeroReferencia`),
  KEY `cotizaciones_leadId_idx` (`leadId`),
  KEY `cotizaciones_estado_idx` (`estado`),
  KEY `cotizaciones_tipoCuota_idx` (`tipoCuota`),
  KEY `cotizaciones_clienteId_idx` (`clienteId`),
  CONSTRAINT `cotizaciones_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `clientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cotizaciones_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `leads` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `etiquetas`;
CREATE TABLE `etiquetas` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `color` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icono` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT '1',
  `orden` int NOT NULL DEFAULT '0',
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizadoEn` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `etiquetas_nombre_key` (`nombre`),
  KEY `etiquetas_activa_idx` (`activa`),
  KEY `etiquetas_activa_orden_idx` (`activa`,`orden`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `historial_pipeline_leads`;
CREATE TABLE `historial_pipeline_leads` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `oportunidadId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `leadId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `probabilidadAnterior` int DEFAULT NULL,
  `probabilidadNueva` int DEFAULT NULL,
  `valorAnterior` double DEFAULT NULL,
  `valorNuevo` double DEFAULT NULL,
  `cambiadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `cambiadoPor` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  `razon` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `etapaAnterior` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `etapaNueva` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `historial_pipeline_leads_oportunidadId_idx` (`oportunidadId`),
  KEY `historial_pipeline_leads_leadId_idx` (`leadId`),
  KEY `historial_pipeline_leads_cambiadoPor_idx` (`cambiadoPor`),
  KEY `historial_pipeline_leads_cambiadoEn_idx` (`cambiadoEn`),
  KEY `historial_pipeline_leads_etapaNueva_idx` (`etapaNueva`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `lead_cliente_asociaciones`;
CREATE TABLE `lead_cliente_asociaciones` (
  `leadId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `clienteId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `asociadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `notas` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`leadId`,`clienteId`),
  KEY `lead_cliente_asociaciones_leadId_idx` (`leadId`),
  KEY `lead_cliente_asociaciones_clienteId_idx` (`clienteId`),
  CONSTRAINT `lead_cliente_asociaciones_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `clientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `lead_cliente_asociaciones_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `leads` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `lead_etiquetas`;
CREATE TABLE `lead_etiquetas` (
  `leadId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `etiquetaId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `asignadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`leadId`,`etiquetaId`),
  KEY `lead_etiquetas_leadId_idx` (`leadId`),
  KEY `lead_etiquetas_etiquetaId_idx` (`etiquetaId`),
  CONSTRAINT `lead_etiquetas_etiquetaId_fkey` FOREIGN KEY (`etiquetaId`) REFERENCES `etiquetas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `lead_etiquetas_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `leads` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `leads`;
CREATE TABLE `leads` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ciudad` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dni` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sexo` enum('MASCULINO','FEMENINO') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fechaNacimiento` datetime(3) DEFAULT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizadoEn` datetime(3) NOT NULL,
  `usuarioId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cargo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `departamento` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `distrito` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `empresa` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('NUEVO','CONTACTADO','CALIFICADO','NEGOCIACION','PROPUESTA','GANADO','PERDIDO','EN_ESPERA') COLLATE utf8mb4_unicode_ci DEFAULT 'NUEVO',
  `fechaSeguimiento` datetime(3) DEFAULT NULL,
  `fuente` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `etiquetas` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notas` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `presupuesto` double DEFAULT NULL,
  `prioridad` enum('BAJA','MEDIA','ALTA','URGENTE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEDIA',
  `probabilidad` int DEFAULT NULL,
  `provincia` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `leads_usuarioId_idx` (`usuarioId`),
  KEY `leads_correo_idx` (`correo`),
  KEY `leads_creadoEn_idx` (`creadoEn`),
  KEY `leads_departamento_idx` (`departamento`),
  KEY `leads_estado_idx` (`estado`),
  KEY `leads_prioridad_idx` (`prioridad`),
  CONSTRAINT `leads_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `notificaciones`;
CREATE TABLE `notificaciones` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `titulo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INFO',
  `leida` tinyint(1) NOT NULL DEFAULT '0',
  `usuarioId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contactoId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referencia` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipoReferencia` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `leidaEn` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notificaciones_usuarioId_idx` (`usuarioId`),
  KEY `notificaciones_contactoId_idx` (`contactoId`),
  KEY `notificaciones_leida_idx` (`leida`),
  KEY `notificaciones_creadoEn_idx` (`creadoEn`),
  KEY `notificaciones_tipoReferencia_idx` (`tipoReferencia`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `oportunidades_clientes`;
CREATE TABLE `oportunidades_clientes` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `clienteId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `titulo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `proyecto` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `propiedad` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `valor` double DEFAULT NULL,
  `probabilidad` int DEFAULT '25',
  `proximaAccion` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ultimaActividad` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `notas` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizadoEn` datetime(3) NOT NULL,
  `usuarioId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `etapa` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CONTACTO_INICIAL',
  `leadId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `oportunidades_clientes_clienteId_idx` (`clienteId`),
  KEY `oportunidades_clientes_usuarioId_idx` (`usuarioId`),
  KEY `oportunidades_clientes_creadoEn_idx` (`creadoEn`),
  KEY `oportunidades_clientes_leadId_idx` (`leadId`),
  KEY `oportunidades_clientes_etapa_idx` (`etapa`),
  CONSTRAINT `oportunidades_clientes_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `clientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `oportunidades_clientes_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `leads` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `oportunidades_clientes_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `otros_servicios`;
CREATE TABLE `otros_servicios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_link` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `video_link` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `service_type` enum('general','topografia','dron') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `caracteristicas` longtext COLLATE utf8mb4_unicode_ci,
  `imagenes` longtext COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `paginas_servicios`;
CREATE TABLE `paginas_servicios` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_servicio` enum('techo_propio','credito_mivivienda','habilitaciones','compra','venta','alquiler','departamento','casa','terreno','local_comercial') COLLATE utf8mb4_unicode_ci NOT NULL,
  `titulo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtitulo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion_corta` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion_larga` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `imagen_banner` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `video_banner` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `requisitos` json DEFAULT NULL,
  `beneficios` json DEFAULT NULL,
  `pasos` json DEFAULT NULL,
  `preguntas` json DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `orden_mostrar` int NOT NULL DEFAULT '0',
  `meta_title` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `paginas_servicios_tipo_servicio_key` (`tipo_servicio`),
  KEY `paginas_servicios_activo_idx` (`activo`),
  KEY `paginas_servicios_orden_mostrar_idx` (`orden_mostrar`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `proyecto_clientes`;
CREATE TABLE `proyecto_clientes` (
  `proyectoId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `clienteId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `asociadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `notas` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`proyectoId`,`clienteId`),
  KEY `proyecto_clientes_proyectoId_idx` (`proyectoId`),
  KEY `proyecto_clientes_clienteId_idx` (`clienteId`),
  CONSTRAINT `proyecto_clientes_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `clientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `proyecto_clientes_proyectoId_fkey` FOREIGN KEY (`proyectoId`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `proyecto_etiquetas`;
CREATE TABLE `proyecto_etiquetas` (
  `proyectoId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `etiquetaId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `asignadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`proyectoId`,`etiquetaId`),
  KEY `proyecto_etiquetas_proyectoId_idx` (`proyectoId`),
  KEY `proyecto_etiquetas_etiquetaId_idx` (`etiquetaId`),
  CONSTRAINT `proyecto_etiquetas_etiquetaId_fkey` FOREIGN KEY (`etiquetaId`) REFERENCES `etiquetas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `proyecto_etiquetas_proyectoId_fkey` FOREIGN KEY (`proyectoId`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `proyectos`;
CREATE TABLE `proyectos` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `imagen` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `precio` double DEFAULT NULL,
  `ubicacion` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('DISPONIBLE','RESERVADO','VENDIDO','CONSTRUCCION','FINALIZADO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DISPONIBLE',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `tipo_proyecto` enum('techo_propio','credito_mivivienda','habilitaciones','compra','venta','alquiler','departamento','casa','terreno','local_comercial') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `categoria` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `galeria` json DEFAULT NULL,
  `caracteristicas` json DEFAULT NULL,
  `mostrar_en_web` tinyint(1) NOT NULL DEFAULT '1',
  `orden_web` int DEFAULT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizadoEn` datetime(3) NOT NULL,
  `usuarioId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `latitud` double DEFAULT NULL,
  `longitud` double DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `proyectos_activo_idx` (`activo`),
  KEY `proyectos_estado_idx` (`estado`),
  KEY `proyectos_usuarioId_idx` (`usuarioId`),
  KEY `proyectos_tipo_proyecto_idx` (`tipo_proyecto`),
  KEY `proyectos_mostrar_en_web_idx` (`mostrar_en_web`),
  CONSTRAINT `proyectos_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `reportes`;
CREATE TABLE `reportes` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parametros` json DEFAULT NULL,
  `resultadosResumen` json DEFAULT NULL,
  `generadoPor` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `generadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `reportes_generadoPor_idx` (`generadoPor`),
  CONSTRAINT `reportes_generadoPor_fkey` FOREIGN KEY (`generadoPor`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `team_members`;
CREATE TABLE `team_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cargo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `correo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `foto` longtext COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `display_order` int NOT NULL,
  `facebook` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `instagram` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tiktok` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `team_members_activo_idx` (`activo`),
  KEY `team_members_display_order_idx` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `testimonials`;
CREATE TABLE `testimonials` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `correo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `calificacion` int NOT NULL,
  `testimonio` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `foto` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `media` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `video_url` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'approved',
  `created_at` datetime(3) NOT NULL,
  `approved_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `testimonials_estado_idx` (`estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol` enum('ADMIN','SUPERVISOR','AGENTE','ASISTENTE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AGENTE',
  `avatar` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizadoEn` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuarios_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 2025-11-22 22:03:28 UTC