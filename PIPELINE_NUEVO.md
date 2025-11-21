# Pipeline de Etapas - Documentación de Actualización

## Resumen de Cambios

Se ha implementado un nuevo pipeline de 6 etapas con cálculo automático de probabilidades. Todas las oportunidades ahora progresarán a través de un flujo de ventas estructurado con probabilidades predeterminadas.

## Nuevas Etapas

| Etapa | Probabilidad | Descripción |
|-------|-------------|-------------|
| **CONTACTO_INICIAL** | 25% | Primer contacto con el lead |
| **AGENDAMIENTO** | 40% | Se ha agendado una reunión o visita |
| **SEPARACION** | 60% | Lead ha mostrado interés serio y separó/reservó propiedad |
| **CIERRE_GANADO** | 100% | Contrato firmado, venta completada |
| **CIERRE_PERDIDO** | 0% | Lead perdido o compró con otra empresa |
| **FIDELIZACION** | 100% | Post-venta: servicio al cliente, referencias, nuevas oportunidades |

## Características Principales

### 1. Cálculo Automático de Probabilidades
- La probabilidad se calcula automáticamente cuando se crea una oportunidad
- Cuando cambias de etapa, la probabilidad se actualiza automáticamente
- **NO necesitas ingresar probabilidades manualmente**

```typescript
// Ejemplo en el servicio
const probabilidad = this.getProcentajePorEtapa(etapa);
// Retorna: 25, 40, 60, 100, 0, ó 100 según la etapa
```

### 2. Conversión Automática a Cliente
- Cuando una oportunidad llega a la etapa **FIDELIZACION**, el lead se convierte automáticamente a CLIENTE
- Esto permite un seguimiento post-venta efectivo

```typescript
// En oportunidad.service.ts
if (etapa === 'FIDELIZACION' && oportunidadExistente.cliente.tipo === 'LEAD') {
  // Se actualiza el tipo de contacto a CLIENTE automáticamente
}
```

### 3. Componentes de UI Actualizados

#### DialogoCrearOportunidad
- Muestra todas las etapas disponibles
- Displays la probabilidad de cada etapa
- No permite editar probabilidad manualmente (se calcula automáticamente)

```tsx
{STAGES_ORDER.map((stage) => (
  <SelectItem key={stage} value={stage}>
    {STAGE_LABELS[stage]} ({getStageProbability(stage)}%)
  </SelectItem>
))}
```

#### PipelineProgress
Componente visual para mostrar todo el pipeline:
- Visualiza todas las etapas en orden
- Muestra círculos de color por etapa
- Barra de progreso dinámica
- Click en etapas para acciones adicionales

```tsx
<PipelineProgress 
  currentStage="AGENDAMIENTO"
  onStageClick={(stage) => console.log(stage)}
/>
```

### 4. Mapeo de Etapas
Archivo: `client/lib/pipeline-stages.ts`

```typescript
// Obtener label amigable
getStageLabelMx('CONTACTO_INICIAL') // → 'Contacto Inicial'

// Obtener probabilidad
getStageProbability('AGENDAMIENTO') // → 40

// Obtener color
getStageColor('CIERRE_GANADO') // → '#10b981' (Green)
```

## Cambios en Base de Datos

### Migración Aplicada
- Archivo: `server/prisma/migrations/20251120_update_pipeline_stages/migration.sql`
- Actualiza todas las oportunidades existentes a nuevas etapas
- Mapeo automático de valores antiguos:
  - LEAD, CONTACTO → CONTACTO_INICIAL
  - VISITA → AGENDAMIENTO
  - NEGOCIACION → SEPARACION
  - GANADO, CIERRE → CIERRE_GANADO
  - PERDIDO → CIERRE_PERDIDO

### Tablas Afectadas
- `oportunidades_clientes` - Etapas principales
- `historial_pipeline_leads` - Historial de cambios

## API Endpoints

### Cambiar Etapa de Oportunidad
```
POST /api/oportunidades/:id/cambiar-etapa
Body: {
  etapa: "AGENDAMIENTO",
  notas?: "Reunión agendada para el viernes"
}
```

**Respuesta:**
```json
{
  "id": "opp_123",
  "etapa": "AGENDAMIENTO",
  "probabilidad": 40,
  "cliente": {
    "tipo": "LEAD"
  }
}
```

Si etapa = FIDELIZACION:
```json
{
  "id": "opp_123",
  "etapa": "FIDELIZACION",
  "probabilidad": 100,
  "cliente": {
    "tipo": "CLIENTE"  // Automáticamente convertido
  }
}
```

## Flujo de Trabajo Ejemplo

### 1. Lead Llega al Sistema
```
Contacto creado con tipo = LEAD
```

### 2. Convertir Lead a Oportunidad
```typescript
await convertirLeadAOportunidad(leadId);
// Crea oportunidad en CONTACTO_INICIAL (25%)
```

### 3. Progresión por Pipeline
```
CONTACTO_INICIAL (25%)
    ↓
AGENDAMIENTO (40%)
    ↓
SEPARACION (60%)
    ↓
CIERRE_GANADO (100%) ✓
```

### 4. Post-Venta
```
CIERRE_GANADO
    ↓
FIDELIZACION → Convertir a CLIENTE automáticamente
```

## Servicios Actualizados

### LeadPipelineService
- `getProcentajePorEtapa(etapa)` - Calcula probabilidad por etapa
- `convertirLeadAOportunidad()` - Usa CONTACTO_INICIAL y probabilidad automática

### OportunidadService
- `getProcentajePorEtapa(etapa)` - Calcula probabilidad por etapa
- `cambiarEtapa()` - Auto-calcula probabilidad y convierte a cliente si es necesario
- `crearOportunidad()` - Usa nuevas etapas automáticamente

## Testing

### Verificar Auto-Probabilidad
```bash
# 1. Crear oportunidad
POST /api/oportunidades
Body: {
  clienteId: "...",
  titulo: "Test",
  etapa: "AGENDAMIENTO"
}

# Verificar que probabilidad = 40
```

### Verificar Conversión a Cliente
```bash
# 1. Obtener lead actual (tipo = LEAD)
GET /api/contacts/[id]

# 2. Cambiar a FIDELIZACION
POST /api/oportunidades/[opp_id]/cambiar-etapa
Body: { etapa: "FIDELIZACION" }

# 3. Verificar que el contacto ahora es CLIENTE
GET /api/contacts/[id]
# Response: { tipo: "CLIENTE" }
```

## Notas Importantes

1. **Backward Compatibility**: Todas las oportunidades antiguas han sido migradas automáticamente
2. **No Editable**: La probabilidad no se puede editar manualmente, siempre se calcula por etapa
3. **Histórico Preservado**: Tabla `historial_pipeline_leads` mantiene registro de todos los cambios
4. **Colores Visuales**: Cada etapa tiene un color único para fácil identificación

## Próximos Pasos

1. Integrar PipelineProgress en dashboard principal
2. Agregar reportes por etapa del pipeline
3. Configurar alertas para oportunidades sin progreso
4. Implementar pronóstico de ingresos por etapa

## Archivos Clave

```
server/
  src/
    services/
      ├── lead-pipeline.service.ts (con getProcentajePorEtapa)
      └── oportunidad.service.ts (con auto-cálculo)
  prisma/
    ├── schema.prisma (enum actualizado)
    └── migrations/
        └── 20251120_update_pipeline_stages/migration.sql

client/
  lib/
    └── pipeline-stages.ts (constantes y utilidades)
  components/
    └── features/
        └── opportunities/
            ├── DialogoCrearOportunidad.tsx (sin selector manual)
            ├── PipelineProgress.tsx (nueva visualización)
            └── index.ts
```

## Queries SQL de Referencia

Todas las etapas antiguas han sido migradas con estos mapeos:

```sql
-- LEAD, CONTACTO → CONTACTO_INICIAL
UPDATE oportunidades_clientes 
SET etapa = 'CONTACTO_INICIAL'
WHERE etapa IN ('LEAD', 'CONTACTO');

-- VISITA → AGENDAMIENTO
UPDATE oportunidades_clientes 
SET etapa = 'AGENDAMIENTO'
WHERE etapa = 'VISITA';

-- Y así sucesivamente...
```
