# Pipeline Workflow - Implementación Completa

## 🎯 Objetivo
Mejorar el flujo de trabajo del pipeline con:
1. Modal para crear oportunidades con información detallada
2. Prevención de adiciones duplicadas (validación backend)
3. Botón para eliminar oportunidades del pipeline
4. Deshabilitar botón "Agregar al Pipeline" si el lead ya está en pipeline

## ✅ Estado: COMPLETO

### Cambios Realizados

#### 1. **Componente DialogoCrearOportunidad** (NUEVO)
- **Archivo:** `client/components/features/leads/DialogoCrearOportunidad.tsx`
- **Funcionalidad:**
  - Modal form para crear oportunidades con datos detallados
  - Campos: Título, Etapa, Valor (opcional), Probabilidad, Próxima Acción, Notas
  - Muestra info del lead (nombre, email, teléfono)
  - Incluye loading state y manejo de errores

#### 2. **Backend - ContactoService.agregarAlPipeline()**
- **Archivo:** `server/src/services/ContactoService.ts`
- **Cambios:**
  - Ahora acepta parámetro `datosOportunidad` con campos adicionales
  - Utiliza título, etapa, valor, probabilidad, proximaAccion, notas si se proporcionan
  - Valida que el lead no esté duplicado en pipeline
  - Crea OportunidadCliente con todos los campos
  - Usa `new Date()` para ultimaActividad (no `.toISOString()`)

#### 3. **Backend - ContactoController.agregarAlPipeline()**
- **Archivo:** `server/src/controllers/ContactoController.ts`
- **Cambios:**
  - Extrae `datosOportunidad` de `req.body`
  - Pasa todos los datos al servicio
  - Incluye logging para debugging

#### 4. **Frontend - leads/page.tsx**
- **Archivo:** `client/app/dashboard/leads/page.tsx`
- **Cambios:**
  - Importa hook `useOportunidades` para obtener lista de oportunidades
  - Crea useMemo `leadsEnPipeline` que mapea clienteIds en pipeline
  - Estado `dialogoOportunidadAbierto` y `leadParaOportunidad`
  - `handleAgregarAlPipeline`: Abre modal en lugar de API directa
  - `handleCrearOportunidad`: Envía form data a `/api/contactos/:id/agregar-pipeline`
  - Pasa `enPipeline` prop a cada LeadCard

#### 5. **Componente LeadCard.tsx**
- **Archivo:** `client/components/features/leads/LeadCard.tsx`
- **Cambios:**
  - Añade prop `enPipeline?: boolean` a la interfaz
  - Button deshabilitado visualmente cuando `enPipeline={true}`
  - Texto tooltip cambia: "Pipeline" → "En Pipeline" (condicional)
  - Estilos: cursor-not-allowed, border gris, texto gris

#### 6. **Frontend - pipeline/page.tsx**
- **Archivo:** `client/app/dashboard/pipeline/page.tsx`
- **Cambios:**
  - Función `handleEliminarOportunidad`:
    - Muestra diálogo de confirmación
    - DELETE request a `/api/oportunidades/{id}`
    - Cierra modal y recarga página on success
  - Botón "Eliminar" (destructive variant) en footer del DialogoDetallesOportunidad
  - Manejo de errores con toast notifications

#### 7. **Rutas Backend - contacto.routes.ts**
- **Archivo:** `server/src/routes/contacto.routes.ts`
- **Cambios:**
  - **CRÍTICO:** Reordenadas rutas específicas ANTES de rutas genéricas
  - Orden: GET /, GET /estadisticas, GET /recientes, POST /, POST /importar/google, POST /convertir-leads/masivo, **luego** POST /:id/agregar-pipeline, POST /:id/convertir-lead, etc., **luego** GET /:id, PUT /:id, DELETE /:id
  - Evita que `/:id` capture `/:id/agregar-pipeline`

## 📊 Flujo de Trabajo

### Flujo Crear Oportunidad
```
1. User hace click en "Pipeline" button en LeadCard
   ↓
2. handleAgregarAlPipeline() abre DialogoCrearOportunidad
   ↓
3. Modal muestra info del lead y form vacío
   ↓
4. User rellena: Título, Etapa, Valor, Probabilidad, Próxima Acción, Notas
   ↓
5. Click "Crear Oportunidad"
   ↓
6. handleCrearOportunidad() envia POST /api/contactos/:id/agregar-pipeline
   ↓
7. Backend valida y crea OportunidadCliente
   ↓
8. Toast success, modal cierra, leads recargados
   ↓
9. Lead card ahora muestra enPipeline=true, button deshabilitado
```

### Flujo Eliminar Oportunidad
```
1. User está en pipeline page, ve oportunidad
   ↓
2. Click en card para ver detalles
   ↓
3. Click "Eliminar" button (rojo)
   ↓
4. Confirmation dialog: "¿Estás seguro?"
   ↓
5. Si confirma: DELETE /api/oportunidades/:id
   ↓
6. Backend elimina OportunidadCliente
   ↓
7. Toast success, dialog cierra, page recargada
   ↓
8. Oportunidad desaparece del pipeline
   ↓
9. Lead vuelve a poder agregarse al pipeline
```

## 🔍 Validación Implementada

### En Backend
- ✅ Lead debe existir y pertenecer al usuario
- ✅ Lead no puede estar duplicado en pipeline (throws error)
- ✅ Autorización Bearer token requerida
- ✅ DateTime correcto (`new Date()` no string)

### En Frontend
- ✅ Button deshabilitado si lead ya en pipeline
- ✅ Modal requiere al menos Título
- ✅ Confirmación antes de eliminar
- ✅ Toast notifications para error/success

## 🐛 Bugs Corregidos Durante Implementación

1. **Route Ordering Issue**
   - Problema: `/:id` capturaba `/:id/agregar-pipeline`
   - Solución: Reordenar rutas (específicas primero)

2. **Wrong Model Name**
   - Problema: Usado `prisma.oportunidad` en lugar de `prisma.oportunidadCliente`
   - Solución: Corregir nombre en service

3. **DateTime Format**
   - Problema: `ultimaActividad.toISOString()` inválido
   - Solución: Usar `new Date()` directamente

4. **WhatsApp Modal Lag**
   - Problema: `whatsappMensaje` state en parent, re-renderizaba todo
   - Solución: Mover estado DENTRO del componente DialogoWhatsApp

## 📋 Checklist de Verificación

- [x] DialogoCrearOportunidad componente creado
- [x] Backend service actualizado con datosOportunidad
- [x] Backend controller extrae body data
- [x] Rutas reordenadas (específicas primero)
- [x] Frontend hooks importados (useOportunidades)
- [x] Estado modal en leads/page.tsx
- [x] Handlers crear oportunidad implementados
- [x] LeadCard recibe enPipeline prop
- [x] Button deshabilitado cuando enPipeline=true
- [x] Delete handler en pipeline/page.tsx
- [x] Delete button agregado al modal
- [x] Confirmación dialog para delete
- [x] Compilación sin errores
- [x] Leads en pipeline calculados con useMemo

## 🎮 Cómo Probar

### Test 1: Crear Oportunidad
1. Ir a Leads
2. Click "Pipeline" en un lead
3. Modal abre → Llenar form
4. Click "Crear Oportunidad"
5. ✅ Toast success, lead en pipeline, button deshabilitado

### Test 2: Prevenir Duplicados
1. Intentar agregar mismo lead al pipeline nuevamente
2. ✅ Error toast: "Este lead ya está en el pipeline"

### Test 3: Eliminar Oportunidad
1. Ir a Pipeline
2. Click en una oportunidad
3. Click "Eliminar" (rojo)
4. Confirmar
5. ✅ Oportunidad desaparece, toast success

### Test 4: Button Disable State
1. Después de Test 1, volver a Leads
2. ✅ Button gris, cursor-not-allowed, tooltip "En Pipeline"

## 🔧 Stack Técnico

**Frontend:**
- Next.js 15.2.4, React 18.2.0, TypeScript
- Shadcn/ui, TailwindCSS, Lucide Icons
- React hooks: useState, useMemo, useCallback, useEffect
- Custom hooks: useOportunidades

**Backend:**
- Express, Prisma ORM, PostgreSQL
- TypeScript, bcrypt, JWT auth
- Models: Contacto, OportunidadCliente, Usuario

**Database Models:**
- OportunidadCliente: { id, clienteId, titulo, etapa, valor, probabilidad, proximaAccion, notas, ultimaActividad, createdAt }
- Contacto: { id, nombre, apellido, correo, telefono, DNI, fechaNacimiento, ... }

---

**Fecha:** 2025
**Estado:** ✅ COMPLETADO Y LISTO PARA TESTING
