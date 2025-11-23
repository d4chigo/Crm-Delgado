-- CreateTable HistorialPipelineLead
CREATE TABLE `historial_pipeline_leads` (
    `id` VARCHAR(191) NOT NULL,
    `oportunidadId` VARCHAR(191) NOT NULL,
    `leadId` VARCHAR(191) NOT NULL,
    `etapaAnterior` VARCHAR(191) NOT NULL,
    `etapaNueva` VARCHAR(191) NOT NULL,
    `probabilidadAnterior` INT,
    `probabilidadNueva` INT,
    `valorAnterior` DOUBLE,
    `valorNuevo` DOUBLE,
    `cambiadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `cambiadoPor` VARCHAR(191) NOT NULL,
    `notas` LONGTEXT,
    `razon` VARCHAR(191),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `historial_pipeline_leads_oportunidadId_idx` ON `historial_pipeline_leads`(`oportunidadId`);

-- CreateIndex
CREATE INDEX `historial_pipeline_leads_leadId_idx` ON `historial_pipeline_leads`(`leadId`);

-- CreateIndex
CREATE INDEX `historial_pipeline_leads_cambiadoPor_idx` ON `historial_pipeline_leads`(`cambiadoPor`);

-- CreateIndex
CREATE INDEX `historial_pipeline_leads_cambiadoEn_idx` ON `historial_pipeline_leads`(`cambiadoEn`);

-- CreateIndex
CREATE INDEX `historial_pipeline_leads_etapaNueva_idx` ON `historial_pipeline_leads`(`etapaNueva`);
