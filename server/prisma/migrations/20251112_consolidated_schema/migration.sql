-- CreateTable usuarios
CREATE TABLE `usuarios` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `rol` ENUM('ADMIN', 'SUPERVISOR', 'AGENTE', 'ASISTENTE') NOT NULL DEFAULT 'AGENTE',
    `avatar` VARCHAR(191) NULL,
    `telefono` VARCHAR(191) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable contactos
CREATE TABLE `contactos` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `apellido` VARCHAR(191) NULL,
    `correo` VARCHAR(191) NULL,
    `telefono` VARCHAR(191) NULL,
    `direccion` VARCHAR(191) NULL,
    `ciudad` VARCHAR(191) NULL,
    `dni` VARCHAR(191) NULL,
    `sexo` ENUM('MASCULINO', 'FEMENINO') NULL,
    `fechaNacimiento` DATETIME(3) NULL,
    `tipo` ENUM('CONTACTO', 'LEAD', 'CLIENTE') NOT NULL DEFAULT 'CONTACTO',
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `cargo` VARCHAR(191) NULL,
    `departamento` VARCHAR(191) NULL,
    `distrito` VARCHAR(191) NULL,
    `empresa` VARCHAR(191) NULL,
    `estadoLead` ENUM('NUEVO', 'CONTACTADO', 'CALIFICADO', 'NEGOCIACION', 'PROPUESTA', 'GANADO', 'PERDIDO', 'EN_ESPERA') NULL,
    `fechaConversion` DATETIME(3) NULL,
    `fechaSeguimiento` DATETIME(3) NULL,
    `fuente` VARCHAR(191) NULL,
    `intereses` VARCHAR(191) NULL,
    `notas` LONGTEXT NULL,
    `presupuesto` DOUBLE NULL,
    `prioridad` ENUM('BAJA', 'MEDIA', 'ALTA', 'URGENTE') NOT NULL DEFAULT 'MEDIA',
    `probabilidad` INT NULL,
    `provincia` VARCHAR(191) NULL,

    INDEX `contactos_usuarioId_idx`(`usuarioId`),
    INDEX `contactos_tipo_idx`(`tipo`),
    INDEX `contactos_correo_idx`(`correo`),
    INDEX `contactos_creadoEn_idx`(`creadoEn`),
    INDEX `contactos_departamento_idx`(`departamento`),
    INDEX `contactos_estadoLead_idx`(`estadoLead`),
    INDEX `contactos_prioridad_idx`(`prioridad`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable etiquetas
CREATE TABLE `etiquetas` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `icono` VARCHAR(191) NULL,
    `activa` BOOLEAN NOT NULL DEFAULT true,
    `orden` INT NOT NULL DEFAULT 0,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `etiquetas_nombre_key`(`nombre`),
    INDEX `etiquetas_activa_idx`(`activa`),
    INDEX `etiquetas_activa_orden_idx`(`activa`, `orden`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable contacto_etiquetas
CREATE TABLE `contacto_etiquetas` (
    `contactoId` VARCHAR(191) NOT NULL,
    `etiquetaId` VARCHAR(191) NOT NULL,
    `asignadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `contacto_etiquetas_contactoId_idx`(`contactoId`),
    INDEX `contacto_etiquetas_etiquetaId_idx`(`etiquetaId`),
    PRIMARY KEY (`contactoId`, `etiquetaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable lead_clientes
CREATE TABLE `lead_clientes` (
    `leadId` VARCHAR(191) NOT NULL,
    `clienteId` VARCHAR(191) NOT NULL,
    `asociadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notas` VARCHAR(191) NULL,
    `estado` VARCHAR(191) NULL,

    INDEX `lead_clientes_leadId_idx`(`leadId`),
    INDEX `lead_clientes_clienteId_idx`(`clienteId`),
    PRIMARY KEY (`leadId`, `clienteId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable oportunidades_clientes
CREATE TABLE `oportunidades_clientes` (
    `id` VARCHAR(191) NOT NULL,
    `clienteId` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `proyecto` VARCHAR(191) NULL,
    `propiedad` VARCHAR(191) NULL,
    `etapa` ENUM('LEAD', 'CONTACTO', 'VISITA', 'NEGOCIACION', 'CIERRE', 'GANADO', 'PERDIDO') NOT NULL DEFAULT 'LEAD',
    `valor` DOUBLE NULL,
    `probabilidad` INT NULL DEFAULT 25,
    `proximaAccion` VARCHAR(191) NULL,
    `ultimaActividad` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notas` LONGTEXT NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,

    INDEX `oportunidades_clientes_clienteId_idx`(`clienteId`),
    INDEX `oportunidades_clientes_usuarioId_idx`(`usuarioId`),
    INDEX `oportunidades_clientes_etapa_idx`(`etapa`),
    INDEX `oportunidades_clientes_creadoEn_idx`(`creadoEn`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable proyecto_etiquetas
CREATE TABLE `proyecto_etiquetas` (
    `proyectoId` VARCHAR(191) NOT NULL,
    `etiquetaId` VARCHAR(191) NOT NULL,
    `asignadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `proyecto_etiquetas_proyectoId_idx`(`proyectoId`),
    INDEX `proyecto_etiquetas_etiquetaId_idx`(`etiquetaId`),
    PRIMARY KEY (`proyectoId`, `etiquetaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable proyecto_clientes
CREATE TABLE `proyecto_clientes` (
    `proyectoId` VARCHAR(191) NOT NULL,
    `clienteId` VARCHAR(191) NOT NULL,
    `asociadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notas` VARCHAR(191) NULL,

    INDEX `proyecto_clientes_proyectoId_idx`(`proyectoId`),
    INDEX `proyecto_clientes_clienteId_idx`(`clienteId`),
    PRIMARY KEY (`proyectoId`, `clienteId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable cotizaciones
CREATE TABLE `cotizaciones` (
    `id` VARCHAR(191) NOT NULL,
    `contactoId` VARCHAR(191) NOT NULL,
    `numeroReferencia` VARCHAR(191) NOT NULL,
    `nombreProyecto` VARCHAR(191) NOT NULL,
    `tipoInmueble` VARCHAR(191) NULL,
    `descripcion` LONGTEXT NULL,
    `precioInmueble` DOUBLE NOT NULL,
    `cuotaInicial` DOUBLE NOT NULL,
    `porcentajeCuotaInicial` DOUBLE NOT NULL,
    `montoFinanciar` DOUBLE NOT NULL,
    `plazoMeses` INT NOT NULL,
    `tipoCuota` ENUM('FIJA', 'FLEXIBLE', 'FLEXIBLE_ESPECIAL') NOT NULL DEFAULT 'FIJA',
    `tasaInteresAnual` DOUBLE NOT NULL,
    `permitePostergar` BOOLEAN NOT NULL DEFAULT false,
    `cuotasPostergables` INT NULL,
    `permiteDoble` BOOLEAN NOT NULL DEFAULT false,
    `cuotasDoblesAnuales` INT NULL,
    `permiteCambioFecha` BOOLEAN NOT NULL DEFAULT false,
    `montoCuotaManual` DOUBLE NULL,
    `cuotaMensualEstimada` DOUBLE NOT NULL,
    `totalIntereses` DOUBLE NOT NULL,
    `totalPagar` DOUBLE NOT NULL,
    `estado` ENUM('BORRADOR', 'ENVIADA', 'ACEPTADA', 'RECHAZADA', 'VENCIDA') NOT NULL DEFAULT 'BORRADOR',
    `notas` LONGTEXT NULL,
    `observaciones` LONGTEXT NULL,
    `fechaValidez` DATETIME(3) NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `cotizaciones_numeroReferencia_key`(`numeroReferencia`),
    INDEX `cotizaciones_contactoId_idx`(`contactoId`),
    INDEX `cotizaciones_estado_idx`(`estado`),
    INDEX `cotizaciones_tipoCuota_idx`(`tipoCuota`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable reportes
CREATE TABLE `reportes` (
    `id` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `parametros` JSON NULL,
    `resultadosResumen` JSON NULL,
    `generadoPor` VARCHAR(191) NULL,
    `generadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `reportes_generadoPor_idx`(`generadoPor`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable proyectos
CREATE TABLE `proyectos` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` LONGTEXT NULL,
    `imagen` VARCHAR(191) NULL,
    `precio` DOUBLE NULL,
    `ubicacion` VARCHAR(191) NULL,
    `estado` ENUM('DISPONIBLE', 'RESERVADO', 'VENDIDO', 'CONSTRUCCION', 'FINALIZADO') NOT NULL DEFAULT 'DISPONIBLE',
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `tipo_proyecto` ENUM('techo_propio', 'credito_mivivienda', 'habilitaciones', 'compra', 'venta', 'alquiler', 'departamento', 'casa', 'terreno', 'local_comercial') NULL,
    `categoria` VARCHAR(191) NULL,
    `galeria` JSON NULL,
    `caracteristicas` JSON NULL,
    `mostrar_en_web` BOOLEAN NOT NULL DEFAULT true,
    `orden_web` INT NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,

    INDEX `proyectos_activo_idx`(`activo`),
    INDEX `proyectos_estado_idx`(`estado`),
    INDEX `proyectos_usuarioId_idx`(`usuarioId`),
    INDEX `proyectos_tipo_proyecto_idx`(`tipo_proyecto`),
    INDEX `proyectos_mostrar_en_web_idx`(`mostrar_en_web`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable otros_servicios
CREATE TABLE `otros_servicios` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(191) NOT NULL,
    `descripcion` LONGTEXT NULL,
    `image_link` VARCHAR(191) NULL,
    `video_link` VARCHAR(191) NULL,
    `service_type` ENUM('general', 'topografia', 'dron') NOT NULL DEFAULT 'general',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable team_members
CREATE TABLE `team_members` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `cargo` VARCHAR(191) NOT NULL,
    `descripcion` LONGTEXT NOT NULL,
    `correo` VARCHAR(191) NOT NULL,
    `telefono` VARCHAR(191) NOT NULL,
    `foto` LONGTEXT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `display_order` INT NOT NULL,
    `facebook` VARCHAR(191) NULL,
    `instagram` VARCHAR(191) NULL,
    `tiktok` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    INDEX `team_members_activo_idx`(`activo`),
    INDEX `team_members_display_order_idx`(`display_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable testimonials
CREATE TABLE `testimonials` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `correo` VARCHAR(191) NOT NULL,
    `calificacion` INT NOT NULL,
    `testimonio` LONGTEXT NOT NULL,
    `foto` VARCHAR(191) NULL,
    `media` VARCHAR(191) NULL,
    `video_url` VARCHAR(191) NULL,
    `estado` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved',
    `created_at` DATETIME(3) NOT NULL,
    `approved_at` DATETIME(3) NULL,

    INDEX `testimonials_estado_idx`(`estado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable paginas_servicios
CREATE TABLE `paginas_servicios` (
    `id` VARCHAR(191) NOT NULL,
    `tipo_servicio` ENUM('techo_propio', 'credito_mivivienda', 'habilitaciones', 'compra', 'venta', 'alquiler', 'departamento', 'casa', 'terreno', 'local_comercial') NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `subtitulo` VARCHAR(191) NULL,
    `descripcion_corta` LONGTEXT NULL,
    `descripcion_larga` LONGTEXT NULL,
    `imagen_banner` VARCHAR(191) NULL,
    `video_banner` VARCHAR(191) NULL,
    `requisitos` JSON NULL,
    `beneficios` JSON NULL,
    `pasos` JSON NULL,
    `preguntas` JSON NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `orden_mostrar` INT NOT NULL DEFAULT 0,
    `meta_title` VARCHAR(191) NULL,
    `meta_description` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `paginas_servicios_tipo_servicio_key`(`tipo_servicio`),
    INDEX `paginas_servicios_activo_idx`(`activo`),
    INDEX `paginas_servicios_orden_mostrar_idx`(`orden_mostrar`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable cliente_passwords
CREATE TABLE `cliente_passwords` (
    `contacto_id` VARCHAR(191) NOT NULL,
    `password_web` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`contacto_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable cliente_documentos
CREATE TABLE `cliente_documentos` (
    `id` VARCHAR(191) NOT NULL,
    `contacto_id` VARCHAR(191) NOT NULL,
    `nombre_archivo` VARCHAR(191) NOT NULL,
    `nombre_original` VARCHAR(191) NOT NULL,
    `ruta_archivo` VARCHAR(191) NOT NULL,
    `tipo_documento` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `tamano_bytes` INT NOT NULL,
    `mime_type` VARCHAR(191) NOT NULL,
    `subido_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `estado` VARCHAR(191) NOT NULL DEFAULT 'PENDIENTE',
    `revisado_por` VARCHAR(191) NULL,
    `revisado_en` DATETIME(3) NULL,
    `notas` VARCHAR(191) NULL,

    INDEX `cliente_documentos_contacto_id_idx`(`contacto_id`),
    INDEX `cliente_documentos_estado_idx`(`estado`),
    INDEX `cliente_documentos_subido_en_idx`(`subido_en`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable cliente_accesos
CREATE TABLE `cliente_accesos` (
    `id` VARCHAR(191) NOT NULL,
    `contacto_id` VARCHAR(191) NOT NULL,
    `fecha_acceso` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ip_address` VARCHAR(191) NOT NULL,
    `user_agent` VARCHAR(191) NULL,

    INDEX `cliente_accesos_contacto_id_idx`(`contacto_id`),
    INDEX `cliente_accesos_fecha_acceso_idx`(`fecha_acceso`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable cliente_actividades
CREATE TABLE `cliente_actividades` (
    `id` VARCHAR(191) NOT NULL,
    `contacto_id` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `metadata` JSON NULL,

    INDEX `cliente_actividades_contacto_id_idx`(`contacto_id`),
    INDEX `cliente_actividades_fecha_idx`(`fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `contactos` ADD CONSTRAINT `contactos_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contacto_etiquetas` ADD CONSTRAINT `contacto_etiquetas_contactoId_fkey` FOREIGN KEY (`contactoId`) REFERENCES `contactos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contacto_etiquetas` ADD CONSTRAINT `contacto_etiquetas_etiquetaId_fkey` FOREIGN KEY (`etiquetaId`) REFERENCES `etiquetas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_clientes` ADD CONSTRAINT `lead_clientes_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `contactos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_clientes` ADD CONSTRAINT `lead_clientes_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `contactos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oportunidades_clientes` ADD CONSTRAINT `oportunidades_clientes_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `contactos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oportunidades_clientes` ADD CONSTRAINT `oportunidades_clientes_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `proyecto_etiquetas` ADD CONSTRAINT `proyecto_etiquetas_etiquetaId_fkey` FOREIGN KEY (`etiquetaId`) REFERENCES `etiquetas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `proyecto_etiquetas` ADD CONSTRAINT `proyecto_etiquetas_proyectoId_fkey` FOREIGN KEY (`proyectoId`) REFERENCES `proyectos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `proyecto_clientes` ADD CONSTRAINT `proyecto_clientes_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `contactos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `proyecto_clientes` ADD CONSTRAINT `proyecto_clientes_proyectoId_fkey` FOREIGN KEY (`proyectoId`) REFERENCES `proyectos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cotizaciones` ADD CONSTRAINT `cotizaciones_contactoId_fkey` FOREIGN KEY (`contactoId`) REFERENCES `contactos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reportes` ADD CONSTRAINT `reportes_generadoPor_fkey` FOREIGN KEY (`generadoPor`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `proyectos` ADD CONSTRAINT `proyectos_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
