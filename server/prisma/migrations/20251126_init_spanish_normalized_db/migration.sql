-- CreateTable usuarios
CREATE TABLE `usuarios` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `correo` VARCHAR(191) NOT NULL,
    `contrasena` VARCHAR(191) NOT NULL,
    `rol` ENUM('ADMIN', 'SUPERVISOR', 'AGENTE', 'ASISTENTE') NOT NULL DEFAULT 'AGENTE',
    `avatar` VARCHAR(191),
    `telefono` VARCHAR(191),
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_correo_key`(`correo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable leads
CREATE TABLE `leads` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `apellido` VARCHAR(191),
    `correo` VARCHAR(191),
    `telefono` VARCHAR(191),
    `direccion` VARCHAR(191),
    `ciudad` VARCHAR(191),
    `dni` VARCHAR(191),
    `sexo` ENUM('MASCULINO', 'FEMENINO'),
    `fecha_nacimiento` DATETIME(3),
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,
    `id_usuario` VARCHAR(191) NOT NULL,
    `cargo` VARCHAR(191),
    `departamento` VARCHAR(191),
    `distrito` VARCHAR(191),
    `empresa` VARCHAR(191),
    `estado` ENUM('NUEVO', 'CONTACTADO', 'CALIFICADO', 'NEGOCIACION', 'PROPUESTA', 'GANADO', 'PERDIDO', 'EN_ESPERA') DEFAULT 'NUEVO',
    `fecha_seguimiento` DATETIME(3),
    `fuente` VARCHAR(191),
    `etiquetas` VARCHAR(191),
    `notas` VARCHAR(191),
    `presupuesto` DOUBLE,
    `prioridad` ENUM('BAJA', 'MEDIA', 'ALTA', 'URGENTE') NOT NULL DEFAULT 'MEDIA',
    `probabilidad` INT,
    `provincia` VARCHAR(191),

    INDEX `leads_id_usuario_idx`(`id_usuario`),
    INDEX `leads_correo_idx`(`correo`),
    INDEX `leads_creado_en_idx`(`creado_en`),
    INDEX `leads_departamento_idx`(`departamento`),
    INDEX `leads_estado_idx`(`estado`),
    INDEX `leads_prioridad_idx`(`prioridad`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable clientes
CREATE TABLE `clientes` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `apellido` VARCHAR(191),
    `correo` VARCHAR(191),
    `telefono` VARCHAR(191),
    `direccion` VARCHAR(191),
    `ciudad` VARCHAR(191),
    `dni` VARCHAR(191),
    `sexo` ENUM('MASCULINO', 'FEMENINO'),
    `fecha_nacimiento` DATETIME(3),
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,
    `id_usuario` VARCHAR(191) NOT NULL,
    `cargo` VARCHAR(191),
    `departamento` VARCHAR(191),
    `distrito` VARCHAR(191),
    `empresa` VARCHAR(191),
    `fecha_conversion` DATETIME(3),
    `fecha_seguimiento` DATETIME(3),
    `notas` VARCHAR(191),
    `presupuesto` DOUBLE,
    `prioridad` ENUM('BAJA', 'MEDIA', 'ALTA', 'URGENTE') NOT NULL DEFAULT 'MEDIA',
    `probabilidad` INT,
    `provincia` VARCHAR(191),

    INDEX `clientes_id_usuario_idx`(`id_usuario`),
    INDEX `clientes_correo_idx`(`correo`),
    INDEX `clientes_creado_en_idx`(`creado_en`),
    INDEX `clientes_departamento_idx`(`departamento`),
    INDEX `clientes_prioridad_idx`(`prioridad`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable etiquetas
CREATE TABLE `etiquetas` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191),
    `icono` VARCHAR(191),
    `activa` BOOLEAN NOT NULL DEFAULT true,
    `orden` INT NOT NULL DEFAULT 0,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    UNIQUE INDEX `etiquetas_nombre_key`(`nombre`),
    INDEX `etiquetas_activa_idx`(`activa`),
    INDEX `etiquetas_activa_orden_idx`(`activa`, `orden`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable lead_etiquetas
CREATE TABLE `lead_etiquetas` (
    `id_lead` VARCHAR(191) NOT NULL,
    `id_etiqueta` VARCHAR(191) NOT NULL,
    `asignado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `lead_etiquetas_id_lead_idx`(`id_lead`),
    INDEX `lead_etiquetas_id_etiqueta_idx`(`id_etiqueta`),
    PRIMARY KEY (`id_lead`, `id_etiqueta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable cliente_etiquetas
CREATE TABLE `cliente_etiquetas` (
    `id_cliente` VARCHAR(191) NOT NULL,
    `id_etiqueta` VARCHAR(191) NOT NULL,
    `asignado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `cliente_etiquetas_id_cliente_idx`(`id_cliente`),
    INDEX `cliente_etiquetas_id_etiqueta_idx`(`id_etiqueta`),
    PRIMARY KEY (`id_cliente`, `id_etiqueta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable lead_cliente_asociaciones
CREATE TABLE `lead_cliente_asociaciones` (
    `id_lead` VARCHAR(191) NOT NULL,
    `id_cliente` VARCHAR(191) NOT NULL,
    `asociado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notas` VARCHAR(191),
    `estado` VARCHAR(191),

    INDEX `lead_cliente_asociaciones_id_lead_idx`(`id_lead`),
    INDEX `lead_cliente_asociaciones_id_cliente_idx`(`id_cliente`),
    PRIMARY KEY (`id_lead`, `id_cliente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable oportunidades_clientes
CREATE TABLE `oportunidades_clientes` (
    `id` VARCHAR(191) NOT NULL,
    `id_lead` VARCHAR(191),
    `id_cliente` VARCHAR(191),
    `titulo` VARCHAR(191) NOT NULL,
    `proyecto` VARCHAR(191),
    `propiedad` VARCHAR(191),
    `etapa` VARCHAR(191) NOT NULL DEFAULT 'CONTACTO_INICIAL',
    `valor` DOUBLE,
    `probabilidad` INT DEFAULT 25,
    `proxima_accion` VARCHAR(191),
    `ultima_actividad` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notas` VARCHAR(191),
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,
    `id_usuario` VARCHAR(191) NOT NULL,

    INDEX `oportunidades_clientes_id_lead_idx`(`id_lead`),
    INDEX `oportunidades_clientes_id_cliente_idx`(`id_cliente`),
    INDEX `oportunidades_clientes_id_usuario_idx`(`id_usuario`),
    INDEX `oportunidades_clientes_etapa_idx`(`etapa`),
    INDEX `oportunidades_clientes_creado_en_idx`(`creado_en`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable historial_etapas_leads
CREATE TABLE `historial_etapas_leads` (
    `id` VARCHAR(191) NOT NULL,
    `id_oportunidad` VARCHAR(191) NOT NULL,
    `id_lead` VARCHAR(191) NOT NULL,
    `etapa_anterior` VARCHAR(191) NOT NULL,
    `etapa_nueva` VARCHAR(191) NOT NULL,
    `probabilidad_anterior` INT,
    `probabilidad_nueva` INT,
    `valor_anterior` DOUBLE,
    `valor_nuevo` DOUBLE,
    `cambiado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `cambiado_por` VARCHAR(191) NOT NULL,
    `notas` LONGTEXT,
    `razon` VARCHAR(191),

    INDEX `historial_etapas_leads_id_oportunidad_idx`(`id_oportunidad`),
    INDEX `historial_etapas_leads_id_lead_idx`(`id_lead`),
    INDEX `historial_etapas_leads_cambiado_por_idx`(`cambiado_por`),
    INDEX `historial_etapas_leads_cambiado_en_idx`(`cambiado_en`),
    INDEX `historial_etapas_leads_etapa_nueva_idx`(`etapa_nueva`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable etiquetas_proyectos
CREATE TABLE `etiquetas_proyectos` (
    `id_proyecto` VARCHAR(191) NOT NULL,
    `id_etiqueta` VARCHAR(191) NOT NULL,
    `asignado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `etiquetas_proyectos_id_proyecto_idx`(`id_proyecto`),
    INDEX `etiquetas_proyectos_id_etiqueta_idx`(`id_etiqueta`),
    PRIMARY KEY (`id_proyecto`, `id_etiqueta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable clientes_proyectos
CREATE TABLE `clientes_proyectos` (
    `id_proyecto` VARCHAR(191) NOT NULL,
    `id_cliente` VARCHAR(191) NOT NULL,
    `asociado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notas` VARCHAR(191),

    INDEX `clientes_proyectos_id_proyecto_idx`(`id_proyecto`),
    INDEX `clientes_proyectos_id_cliente_idx`(`id_cliente`),
    PRIMARY KEY (`id_proyecto`, `id_cliente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable contactos_proyectos
CREATE TABLE `contactos_proyectos` (
    `id_proyecto` VARCHAR(191) NOT NULL,
    `id_contacto` VARCHAR(191) NOT NULL,
    `tipo_contacto` VARCHAR(191) NOT NULL,
    `asociado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notas` VARCHAR(191),

    INDEX `contactos_proyectos_id_proyecto_idx`(`id_proyecto`),
    INDEX `contactos_proyectos_id_contacto_idx`(`id_contacto`),
    PRIMARY KEY (`id_proyecto`, `id_contacto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable cotizaciones
CREATE TABLE `cotizaciones` (
    `id` VARCHAR(191) NOT NULL,
    `id_lead` VARCHAR(191),
    `id_cliente` VARCHAR(191),
    `numero_referencia` VARCHAR(191) NOT NULL,
    `nombre_proyecto` VARCHAR(191) NOT NULL,
    `tipo_inmueble` VARCHAR(191),
    `descripcion` VARCHAR(191),
    `precio_inmueble` DOUBLE NOT NULL,
    `cuota_inicial` DOUBLE NOT NULL,
    `porcentaje_cuota_inicial` DOUBLE NOT NULL,
    `monto_financiar` DOUBLE NOT NULL,
    `plazo_meses` INT NOT NULL,
    `tipo_cuota` ENUM('FIJA', 'FLEXIBLE', 'FLEXIBLE_ESPECIAL') NOT NULL DEFAULT 'FIJA',
    `tasa_interes_anual` DOUBLE NOT NULL,
    `permite_postergar` BOOLEAN NOT NULL DEFAULT false,
    `cuotas_postergables` INT,
    `permite_doble` BOOLEAN NOT NULL DEFAULT false,
    `cuotas_dobles_anuales` INT,
    `permite_cambio_fecha` BOOLEAN NOT NULL DEFAULT false,
    `monto_cuota_manual` DOUBLE,
    `cuota_mensual_estimada` DOUBLE NOT NULL,
    `total_intereses` DOUBLE NOT NULL,
    `total_pagar` DOUBLE NOT NULL,
    `estado` ENUM('BORRADOR', 'ENVIADA', 'ACEPTADA', 'RECHAZADA', 'VENCIDA') NOT NULL DEFAULT 'BORRADOR',
    `notas` VARCHAR(191),
    `observaciones` VARCHAR(191),
    `fecha_validez` DATETIME(3),
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    UNIQUE INDEX `cotizaciones_numero_referencia_key`(`numero_referencia`),
    INDEX `cotizaciones_id_lead_idx`(`id_lead`),
    INDEX `cotizaciones_id_cliente_idx`(`id_cliente`),
    INDEX `cotizaciones_estado_idx`(`estado`),
    INDEX `cotizaciones_tipo_cuota_idx`(`tipo_cuota`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable reportes
CREATE TABLE `reportes` (
    `id` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `parametros` JSON,
    `resultados_resumen` JSON,
    `generado_por` VARCHAR(191),
    `generado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `reportes_generado_por_idx`(`generado_por`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable notificaciones
CREATE TABLE `notificaciones` (
    `id` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descripcion` LONGTEXT NOT NULL,
    `tipo` VARCHAR(191) NOT NULL DEFAULT 'INFO',
    `leida` BOOLEAN NOT NULL DEFAULT false,
    `id_usuario` VARCHAR(191),
    `id_contacto` VARCHAR(191),
    `referencia` VARCHAR(191),
    `tipo_referencia` VARCHAR(191),
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `leida_en` DATETIME(3),

    INDEX `notificaciones_id_usuario_idx`(`id_usuario`),
    INDEX `notificaciones_id_contacto_idx`(`id_contacto`),
    INDEX `notificaciones_leida_idx`(`leida`),
    INDEX `notificaciones_creado_en_idx`(`creado_en`),
    INDEX `notificaciones_tipo_referencia_idx`(`tipo_referencia`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable proyectos
CREATE TABLE `proyectos` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` LONGTEXT,
    `imagen` VARCHAR(191),
    `precio` DOUBLE,
    `ubicacion` VARCHAR(191),
    `latitud` DOUBLE,
    `longitud` DOUBLE,
    `estado` ENUM('DISPONIBLE', 'RESERVADO', 'VENDIDO', 'CONSTRUCCION', 'FINALIZADO') NOT NULL DEFAULT 'DISPONIBLE',
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `tipo_proyecto` ENUM('techo_propio', 'credito_mivivienda', 'habilitaciones', 'compra', 'venta', 'alquiler', 'departamento', 'casa', 'terreno', 'local_comercial'),
    `categoria` VARCHAR(191),
    `galeria` JSON,
    `caracteristicas` JSON,
    `mostrar_en_web` BOOLEAN NOT NULL DEFAULT true,
    `orden_web` INT,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,
    `id_usuario` VARCHAR(191) NOT NULL,

    INDEX `proyectos_activo_idx`(`activo`),
    INDEX `proyectos_estado_idx`(`estado`),
    INDEX `proyectos_id_usuario_idx`(`id_usuario`),
    INDEX `proyectos_tipo_proyecto_idx`(`tipo_proyecto`),
    INDEX `proyectos_mostrar_en_web_idx`(`mostrar_en_web`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable alertas_leads
CREATE TABLE `alertas_leads` (
    `id` VARCHAR(191) NOT NULL,
    `id_lead` VARCHAR(191),
    `id_usuario` VARCHAR(191) NOT NULL,
    `fecha_creada` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_limite` DATETIME(3) NOT NULL,
    `completada` BOOLEAN NOT NULL DEFAULT false,
    `completada_en` DATETIME(3),
    `notas` LONGTEXT,

    INDEX `alertas_leads_id_usuario_idx`(`id_usuario`),
    INDEX `alertas_leads_id_lead_idx`(`id_lead`),
    INDEX `alertas_leads_completada_idx`(`completada`),
    INDEX `alertas_leads_fecha_limite_idx`(`fecha_limite`),
    INDEX `alertas_leads_fecha_creada_idx`(`fecha_creada`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable servicios_adicionales
CREATE TABLE `servicios_adicionales` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191),
    `caracteristicas` LONGTEXT,
    `imagenes` LONGTEXT,
    `enlace_imagen` VARCHAR(191),
    `enlace_video` VARCHAR(191),
    `tipo_servicio` ENUM('general', 'topografia', 'dron') NOT NULL DEFAULT 'general',
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable miembros_equipo
CREATE TABLE `miembros_equipo` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `cargo` VARCHAR(191) NOT NULL,
    `descripcion` LONGTEXT NOT NULL,
    `correo` VARCHAR(191) NOT NULL,
    `telefono` VARCHAR(191) NOT NULL,
    `foto` LONGTEXT,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `orden_mostrar` INT NOT NULL,
    `facebook` VARCHAR(191),
    `instagram` VARCHAR(191),
    `tiktok` VARCHAR(191),
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3),

    INDEX `miembros_equipo_activo_idx`(`activo`),
    INDEX `miembros_equipo_orden_mostrar_idx`(`orden_mostrar`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable testimonios
CREATE TABLE `testimonios` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `correo` VARCHAR(191) NOT NULL,
    `calificacion` INT NOT NULL,
    `testimonio` LONGTEXT NOT NULL,
    `foto` VARCHAR(191),
    `media` VARCHAR(191),
    `video_url` VARCHAR(191),
    `estado` ENUM('pendiente', 'aprobado', 'rechazado') NOT NULL DEFAULT 'aprobado',
    `creado_en` DATETIME(3) NOT NULL,
    `aprobado_en` DATETIME(3),

    INDEX `testimonios_estado_idx`(`estado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable paginas_servicios
CREATE TABLE `paginas_servicios` (
    `id` VARCHAR(191) NOT NULL,
    `tipo_servicio` ENUM('techo_propio', 'credito_mivivienda', 'habilitaciones', 'compra', 'venta', 'alquiler', 'departamento', 'casa', 'terreno', 'local_comercial') NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `subtitulo` VARCHAR(191),
    `descripcion_corta` VARCHAR(191),
    `descripcion_larga` VARCHAR(191),
    `imagen_banner` VARCHAR(191),
    `video_banner` VARCHAR(191),
    `requisitos` JSON,
    `beneficios` JSON,
    `pasos` JSON,
    `preguntas` JSON,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `orden_mostrar` INT NOT NULL DEFAULT 0,
    `meta_title` VARCHAR(191),
    `meta_description` VARCHAR(191),
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    UNIQUE INDEX `paginas_servicios_tipo_servicio_key`(`tipo_servicio`),
    INDEX `paginas_servicios_activo_idx`(`activo`),
    INDEX `paginas_servicios_orden_mostrar_idx`(`orden_mostrar`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable contrasenas_clientes
CREATE TABLE `contrasenas_clientes` (
    `id_contacto` VARCHAR(191) NOT NULL,
    `contrasena_web` VARCHAR(191) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_contacto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable documentos_clientes
CREATE TABLE `documentos_clientes` (
    `id` VARCHAR(191) NOT NULL,
    `id_contacto` VARCHAR(191) NOT NULL,
    `nombre_archivo` VARCHAR(191) NOT NULL,
    `nombre_original` VARCHAR(191) NOT NULL,
    `ruta_archivo` VARCHAR(191) NOT NULL,
    `tipo_documento` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191),
    `tamano_bytes` INT NOT NULL,
    `mime_type` VARCHAR(191) NOT NULL,
    `subido_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `estado` VARCHAR(191) NOT NULL DEFAULT 'PENDIENTE',
    `revisado_por` VARCHAR(191),
    `revisado_en` DATETIME(3),
    `notas` VARCHAR(191),

    INDEX `documentos_clientes_id_contacto_idx`(`id_contacto`),
    INDEX `documentos_clientes_estado_idx`(`estado`),
    INDEX `documentos_clientes_subido_en_idx`(`subido_en`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable accesos_clientes
CREATE TABLE `accesos_clientes` (
    `id` VARCHAR(191) NOT NULL,
    `id_contacto` VARCHAR(191) NOT NULL,
    `fecha_acceso` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ip_address` VARCHAR(191) NOT NULL,
    `user_agent` VARCHAR(191),

    INDEX `accesos_clientes_id_contacto_idx`(`id_contacto`),
    INDEX `accesos_clientes_fecha_acceso_idx`(`fecha_acceso`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable actividades_clientes
CREATE TABLE `actividades_clientes` (
    `id` VARCHAR(191) NOT NULL,
    `id_contacto` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `metadata` JSON,

    INDEX `actividades_clientes_id_contacto_idx`(`id_contacto`),
    INDEX `actividades_clientes_fecha_idx`(`fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `leads` ADD CONSTRAINT `leads_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clientes` ADD CONSTRAINT `clientes_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_etiquetas` ADD CONSTRAINT `lead_etiquetas_id_lead_fkey` FOREIGN KEY (`id_lead`) REFERENCES `leads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_etiquetas` ADD CONSTRAINT `lead_etiquetas_id_etiqueta_fkey` FOREIGN KEY (`id_etiqueta`) REFERENCES `etiquetas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cliente_etiquetas` ADD CONSTRAINT `cliente_etiquetas_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `clientes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cliente_etiquetas` ADD CONSTRAINT `cliente_etiquetas_id_etiqueta_fkey` FOREIGN KEY (`id_etiqueta`) REFERENCES `etiquetas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_cliente_asociaciones` ADD CONSTRAINT `lead_cliente_asociaciones_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `clientes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_cliente_asociaciones` ADD CONSTRAINT `lead_cliente_asociaciones_id_lead_fkey` FOREIGN KEY (`id_lead`) REFERENCES `leads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oportunidades_clientes` ADD CONSTRAINT `oportunidades_clientes_id_lead_fkey` FOREIGN KEY (`id_lead`) REFERENCES `leads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oportunidades_clientes` ADD CONSTRAINT `oportunidades_clientes_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `clientes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oportunidades_clientes` ADD CONSTRAINT `oportunidades_clientes_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `etiquetas_proyectos` ADD CONSTRAINT `etiquetas_proyectos_id_etiqueta_fkey` FOREIGN KEY (`id_etiqueta`) REFERENCES `etiquetas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `etiquetas_proyectos` ADD CONSTRAINT `etiquetas_proyectos_id_proyecto_fkey` FOREIGN KEY (`id_proyecto`) REFERENCES `proyectos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clientes_proyectos` ADD CONSTRAINT `clientes_proyectos_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `clientes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clientes_proyectos` ADD CONSTRAINT `clientes_proyectos_id_proyecto_fkey` FOREIGN KEY (`id_proyecto`) REFERENCES `proyectos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contactos_proyectos` ADD CONSTRAINT `contactos_proyectos_id_proyecto_fkey` FOREIGN KEY (`id_proyecto`) REFERENCES `proyectos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cotizaciones` ADD CONSTRAINT `cotizaciones_id_lead_fkey` FOREIGN KEY (`id_lead`) REFERENCES `leads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cotizaciones` ADD CONSTRAINT `cotizaciones_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `clientes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reportes` ADD CONSTRAINT `reportes_generado_por_fkey` FOREIGN KEY (`generado_por`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `proyectos` ADD CONSTRAINT `proyectos_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alertas_leads` ADD CONSTRAINT `alertas_leads_id_lead_fkey` FOREIGN KEY (`id_lead`) REFERENCES `leads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alertas_leads` ADD CONSTRAINT `alertas_leads_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
