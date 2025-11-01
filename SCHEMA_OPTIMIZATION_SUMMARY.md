# Resumen de Optimización del Schema de Base de Datos

## Cambios Realizados

### 1. **Modelo `Proyecto` Optimizado**
- ✅ Renombrado de `proyectos` a `Proyecto` (PascalCase) con `@@map("proyectos")`
- ✅ Enum renombrado de `proyectos_estado` a `EstadoProyecto`
- ✅ Relación corregida: `usuario` en lugar de `usuarios`
- ✅ `@default(uuid())` en `id`
- ✅ `@updatedAt` en `actualizadoEn`

### 2. **Modelos Legacy Eliminados**
Se eliminaron los siguientes modelos innecesarios que no se usan en el CRM:
- ❌ `Propiedad` (properties)
- ❌ `ImagenPropiedad` (property_images)
- ❌ `Consulta` (inquiries)
- ❌ `ChequeoElegibilidad` (eligibility_checks)
- ❌ `UsuarioWeb` (users - legacy)
- ❌ `EvaluacionCredito` (credit_evaluations)

### 3. **Modelos del Panel Admin Web Optimizados**
Estos modelos se mantienen porque se usan para el sitio PHP:
- ✅ `OtrosServicios` - Traducido completamente al español
- ✅ `MiembroEquipo` - Traducido completamente al español
- ✅ `Testimonio` - Traducido completamente al español (eliminado campo `cargo`)

### 4. **Modelos del CRM (Mantenidos)**
- ✅ `Usuario`
- ✅ `Contacto`
- ✅ `Etiqueta`
- ✅ `ContactoEtiqueta`
- ✅ `LeadCliente`
- ✅ `OportunidadCliente`
- ✅ `ProyectoEtiqueta`
- ✅ `ProyectoCliente`
- ✅ `Cotizacion`
- ✅ `Reporte`
- ✅ `Proyecto` (optimizado)

### 5. **Enums Optimizados**
Enums del CRM:
- `Rol`
- `Sexo`
- `TipoContacto`
- `EstadoLead`
- `Prioridad`
- `EtapaPipeline`
- `TipoCuota`
- `EstadoCotizacion`
- `EstadoProyecto` (renombrado)

Enums del Panel Admin Web:
- `TipoServicio`
- `EstadoTestimonio`

## Comandos a Ejecutar

### 1. Regenerar el Cliente de Prisma
```bash
cd server
npx prisma generate
```

### 2. Crear y Aplicar Migración
```bash
cd server
npx prisma migrate dev --name optimizar_schema_espanol
```

### 3. (Opcional) Si hay problemas, resetear y aplicar:
```bash
cd server
npx prisma migrate reset
npx prisma migrate dev
npx prisma db seed
```

## Beneficios de la Optimización

1. **Nomenclatura Consistente**: Todo en español, PascalCase para modelos
2. **Schema Más Limpio**: Eliminados ~200 líneas de modelos innecesarios
3. **Mejor Mantenibilidad**: Nombres claros y consistentes
4. **Relaciones Correctas**: `usuario` en lugar de `usuarios` para relación 1:N
5. **Defaults Correctos**: `@default(uuid())` y `@updatedAt` donde corresponde

## Archivos Modificados

- ✅ `server/prisma/schema.prisma` - Schema optimizado
- ✅ `server/src/services/proyecto.service.ts` - Actualizado para usar `prisma.proyectos` y `EstadoProyecto`

## Próximos Pasos

1. Ejecutar `npx prisma generate` en la carpeta `server`
2. Ejecutar `npx prisma migrate dev --name optimizar_schema_espanol`
3. Verificar que el servidor arranque sin errores
4. Probar la página de Proyectos en el frontend
5. Si todo funciona, hacer commit de los cambios

## Notas Importantes

- El cliente de Prisma usa el nombre mapeado en minúscula: `prisma.proyectos` (no `prisma.proyecto`)
- El enum se importa como: `import { EstadoProyecto } from '@prisma/client'`
- La relación en `Proyecto` es `usuario` (singular) porque es 1:N
