-- CreateIndex
CREATE INDEX `contactos_creadoEn_idx` ON `contactos`(`creadoEn`);

-- CreateIndex
CREATE INDEX `contactos_departamento_idx` ON `contactos`(`departamento`);

-- CreateIndex
CREATE INDEX `etiquetas_activa_orden_idx` ON `etiquetas`(`activa`, `orden`);

-- CreateIndex
CREATE INDEX `oportunidades_clientes_creadoEn_idx` ON `oportunidades_clientes`(`creadoEn`);
