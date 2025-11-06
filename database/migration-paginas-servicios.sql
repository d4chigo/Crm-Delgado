-- Migración para tabla paginas_servicios
-- Ejecutar en la base de datos crm_delgado

CREATE TABLE IF NOT EXISTS `paginas_servicios` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `tipo_servicio` VARCHAR(50) NOT NULL,
  `titulo` VARCHAR(200) NOT NULL,
  `subtitulo` VARCHAR(300) NULL,
  `descripcion_corta` TEXT NULL,
  `descripcion_larga` TEXT NULL,
  `imagen_banner` VARCHAR(500) NULL,
  `video_banner` VARCHAR(500) NULL,
  `requisitos` JSON NULL,
  `beneficios` JSON NULL,
  `pasos` JSON NULL,
  `preguntas` JSON NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `orden_mostrar` INT NULL DEFAULT 0,
  `meta_title` VARCHAR(200) NULL,
  `meta_description` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `tipo_servicio_UNIQUE` (`tipo_servicio` ASC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Agregar columnas a la tabla proyectos
ALTER TABLE `proyectos`
  ADD COLUMN `tipo_proyecto` VARCHAR(50) NULL AFTER `estado`,
  ADD COLUMN `categoria` VARCHAR(100) NULL AFTER `tipo_proyecto`,
  ADD COLUMN `galeria` JSON NULL AFTER `categoria`,
  ADD COLUMN `caracteristicas` JSON NULL AFTER `galeria`,
  ADD COLUMN `mostrar_en_web` TINYINT(1) NOT NULL DEFAULT 1 AFTER `caracteristicas`,
  ADD COLUMN `orden_web` INT NULL DEFAULT 0 AFTER `mostrar_en_web`;

-- Insertar datos de ejemplo para las páginas de servicios
INSERT INTO `paginas_servicios` 
  (`tipo_servicio`, `titulo`, `subtitulo`, `descripcion_corta`, `descripcion_larga`, `requisitos`, `beneficios`, `pasos`, `preguntas`, `meta_title`, `meta_description`)
VALUES
  (
    'techo_propio',
    'Techo Propio',
    'Tu primera vivienda con el apoyo del Estado',
    'El programa Techo Propio te ayuda a adquirir tu primera vivienda con un bono del Estado.',
    '<p>El programa Techo Propio es una iniciativa del gobierno peruano que facilita el acceso a la vivienda propia para familias de bajos recursos. Con este programa, puedes obtener un bono del Estado que te ayudará a financiar la compra o construcción de tu primera vivienda.</p><p>Nuestro equipo está especializado en asesorarte durante todo el proceso para que puedas acceder a tu vivienda de manera rápida y segura.</p>',
    JSON_ARRAY(
      'Ser mayor de 18 años',
      'Ser peruano o extranjero con residencia',
      'No tener propiedad a tu nombre',
      'Ingreso familiar mensual entre S/. 0 y S/. 2,994',
      'Tener ahorro previo (desde S/. 3,600)',
      'Contar con DNI vigente'
    ),
    JSON_ARRAY(
      'Bono del Estado de hasta S/. 37,125',
      'Financiamiento para viviendas nuevas',
      'Facilidades de pago',
      'Asesoría gratuita',
      'Proceso rápido y seguro',
      'Ubicaciones estratégicas'
    ),
    JSON_ARRAY(
      JSON_OBJECT('titulo', 'Evaluación', 'descripcion', 'Revisamos tu perfil y documentación'),
      JSON_OBJECT('titulo', 'Inscripción', 'descripcion', 'Te inscribimos en el programa Techo Propio'),
      JSON_OBJECT('titulo', 'Aprobación', 'descripcion', 'El Ministerio evalúa y aprueba tu solicitud'),
      JSON_OBJECT('titulo', 'Desembolso', 'descripcion', 'Recibes el bono y adquieres tu vivienda')
    ),
    JSON_ARRAY(
      JSON_OBJECT('pregunta', '¿Qué es el programa Techo Propio?', 'respuesta', 'Es un programa del Estado que otorga un bono económico a familias de bajos recursos para facilitar la compra o construcción de su primera vivienda.'),
      JSON_OBJECT('pregunta', '¿Cuánto es el monto del bono?', 'respuesta', 'El bono puede ser de hasta S/. 37,125, dependiendo del tipo de vivienda y tu ahorro previo.'),
      JSON_OBJECT('pregunta', '¿Cuánto tiempo demora el proceso?', 'respuesta', 'El proceso completo puede tomar entre 3 a 6 meses, dependiendo de la velocidad de aprobación del Ministerio de Vivienda.')
    ),
    'Techo Propio - Programa de Vivienda | DelgadoPropiedades',
    'Accede a tu primera vivienda con el programa Techo Propio. Obtén un bono del Estado de hasta S/. 37,125. Asesoría gratuita y proceso rápido.'
  ),
  (
    'credito_mivivienda',
    'Crédito MiVivienda',
    'Financia tu vivienda con las mejores tasas',
    'Accede a créditos hipotecarios con tasas preferenciales y beneficios del Fondo MiVivienda.',
    '<p>El Crédito MiVivienda es un programa del Estado peruano que te permite acceder a financiamiento para comprar, construir o mejorar tu vivienda con tasas de interés más bajas que el mercado.</p><p>Te ayudamos a gestionar tu crédito con las mejores condiciones y te acompañamos en cada paso del proceso.</p>',
    JSON_ARRAY(
      'Ser mayor de 18 años',
      'Tener ingresos demostrables',
      'Buen historial crediticio',
      'Cuota inicial desde 10%',
      'DNI vigente',
      'Documento de sustento de ingresos'
    ),
    JSON_ARRAY(
      'Tasas de interés preferenciales',
      'Bono del Buen Pagador',
      'Financiamiento hasta 90% del valor',
      'Plazo hasta 20 años',
      'Descuento en seguros',
      'Asesoría especializada'
    ),
    JSON_ARRAY(
      JSON_OBJECT('titulo', 'Precalificación', 'descripcion', 'Evaluamos tu capacidad de pago'),
      JSON_OBJECT('titulo', 'Evaluación', 'descripcion', 'El banco analiza tu solicitud'),
      JSON_OBJECT('titulo', 'Aprobación', 'descripcion', 'Obtienes la aprobación del crédito'),
      JSON_OBJECT('titulo', 'Desembolso', 'descripcion', 'Firma del contrato y desembolso')
    ),
    JSON_ARRAY(
      JSON_OBJECT('pregunta', '¿Qué es el Crédito MiVivienda?', 'respuesta', 'Es un programa que ofrece créditos hipotecarios con tasas de interés más bajas y beneficios adicionales para facilitar el acceso a vivienda.'),
      JSON_OBJECT('pregunta', '¿Cuál es la tasa de interés?', 'respuesta', 'Las tasas varían según el banco, pero son significativamente menores que los créditos convencionales, generalmente entre 5% y 7% anual.'),
      JSON_OBJECT('pregunta', '¿Puedo usar el crédito para construcción?', 'respuesta', 'Sí, el Crédito MiVivienda puede utilizarse para compra, construcción o mejoramiento de vivienda.')
    ),
    'Crédito MiVivienda - Financiamiento | DelgadoPropiedades',
    'Financia tu vivienda con Crédito MiVivienda. Tasas preferenciales, financiamiento hasta 90% y Bono del Buen Pagador. Asesoría gratuita.'
  ),
  (
    'habilitaciones',
    'Habilitaciones Urbanas',
    'Lotes con todos los servicios básicos',
    'Adquiere tu terreno habilitado con luz, agua y desagüe, listo para construir.',
    '<p>Las habilitaciones urbanas son terrenos que cuentan con todos los servicios básicos necesarios para la construcción de viviendas: luz eléctrica, agua potable, desagüe y pistas.</p><p>Te ofrecemos lotes en las mejores ubicaciones, completamente habilitados y con facilidades de pago.</p>',
    JSON_ARRAY(
      'Ser mayor de 18 años',
      'DNI vigente',
      'Capacidad de pago demostrable',
      'Pago de cuota inicial',
      'Referencias personales'
    ),
    JSON_ARRAY(
      'Lotes con todos los servicios',
      'Facilidades de pago',
      'Sin sorteos',
      'Entrega inmediata',
      'Ubicaciones estratégicas',
      'Documentación en regla'
    ),
    JSON_ARRAY(
      JSON_OBJECT('titulo', 'Visita', 'descripcion', 'Conoce el terreno y la zona'),
      JSON_OBJECT('titulo', 'Separación', 'descripcion', 'Separa tu lote con una cuota inicial'),
      JSON_OBJECT('titulo', 'Evaluación', 'descripcion', 'Revisamos tu perfil crediticio'),
      JSON_OBJECT('titulo', 'Escrituración', 'descripcion', 'Firma de contrato y entrega de lote')
    ),
    JSON_ARRAY(
      JSON_OBJECT('pregunta', '¿Qué es una habilitación urbana?', 'respuesta', 'Es un terreno que ha sido dotado de servicios básicos como luz, agua, desagüe y pistas, listo para construir.'),
      JSON_OBJECT('pregunta', '¿Cuánto es la cuota inicial?', 'respuesta', 'La cuota inicial varía según el lote, generalmente desde el 10% del valor total.'),
      JSON_OBJECT('pregunta', '¿Puedo construir inmediatamente?', 'respuesta', 'Sí, una vez completado el proceso de compra, puedes iniciar la construcción de tu vivienda.')
    ),
    'Habilitaciones Urbanas - Lotes con Servicios | DelgadoPropiedades',
    'Lotes habilitados con luz, agua y desagüe. Ubicaciones estratégicas, facilidades de pago y entrega inmediata. Sin sorteos.'
  );

SELECT 'Tablas creadas e inicializadas correctamente' as mensaje;
