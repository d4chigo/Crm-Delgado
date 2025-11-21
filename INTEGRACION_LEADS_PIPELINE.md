# 🔗 INTEGRACIÓN LEADS ↔ PIPELINE

## Resumen

Se ha implementado una integración completa entre el sistema de **LEADS** y el **PIPELINE DE OPORTUNIDADES**. Esto permite que:

1. **Leads** son contactos potenciales sin oportunidad activa
2. Cuando un **lead se contacta**, se **convierte automáticamente a una oportunidad**
3. La **oportunidad sigue el pipeline** (CONTACTO → VISITA → NEGOCIACIÓN → CIERRE → GANADO/PERDIDO)
4. El **estado del lead se sincroniza** con la etapa de la oportunidad
5. Se muestran **estadísticas de conversión** en el dashboard

---

## 🏗️ ARQUITECTURA

### Estado del Lead (Contacto con tipo='LEAD')
```
NUEVO
  ↓ (Cuando se contacta)
CONTACTADO
  ↓ (Si se gana)
CONVERTIDO

DESCALIFICADO (Si se pierde la oportunidad)
```

### Etapa de Oportunidad (OportunidadCliente)
```
LEAD
  ↓
CONTACTO
  ↓
VISITA
  ↓
NEGOCIACIÓN
  ↓
CIERRE
  ↓
GANADO ✅ / PERDIDO ❌
```

### Mapeo Automático
```
Lead.estadoLead  ←→  Oportunidad.etapa

NUEVO              ←→  LEAD
CONTACTADO         ←→  CONTACTO / VISITA / NEGOCIACIÓN / CIERRE
CONVERTIDO         ←→  GANADO
DESCALIFICADO      ←→  PERDIDO
```

---

## 📋 FLUJO PRINCIPAL

### 1. Crear Lead (Contacto tipo LEAD)
```
POST /api/contactos
{
  "nombre": "Juan",
  "tipo": "LEAD",
  "correo": "juan@example.com"
}
```
→ Lead creado con `estadoLead: NUEVO`

### 2. Generar Alerta (Automática cada 1 hora)
```
Job: generarAlertasLeadsNoContactados()
→ Busca leads creados hace 24+ horas
→ Crea AlertaLead con fechaLimite = ahora + 24h
```

### 3. Completar Alerta → Contactar Lead
```
Opción A: Manual en UI
PUT /api/alertas/:id/completar
{
  "notas": "Se contactó al cliente"
}
→ Lead pasa a estadoLead: CONTACTADO

Opción B: Automático (Un solo endpoint)
POST /api/leads/:id/completar-alerta-y-convertir
{
  "alertaId": "...",
  "notas": "Se contactó"
}
→ Completa alerta
→ Marca lead como CONTACTADO
→ Crea oportunidad en etapa CONTACTO (automático)
```

### 4. Convertir Lead a Oportunidad
```
Automático: Cuando lead → CONTACTADO
POST /api/leads/:id/convertir-a-oportunidad
{
  "titulo": "Oportunidad - Juan",
  "proyecto": "Proyecto A",
  "valor": 50000,
  "probabilidad": 25
}

→ OportunidadCliente creada:
{
  "clienteId": "[leadId]",
  "etapa": "CONTACTO",
  "estadoLead": "CONTACTADO"
}
```

### 5. Mover Oportunidad en Pipeline
```
PATCH /api/oportunidades/:id/etapa
{
  "etapa": "VISITA"
}

→ OportunidadCliente actualizado
→ Lead.estadoLead automáticamente → CONTACTADO
→ Si etapa es GANADO → Lead.estadoLead → CONVERTIDO
→ Si etapa es PERDIDO → Lead.estadoLead → DESCALIFICADO
```

---

## 🔄 SINCRONIZACIÓN AUTOMÁTICA

### ¿Cuándo se sincroniza el estado?

1. **Cuando se completa una alerta**
   - Lead pasa a CONTACTADO
   - Se crea automáticamente oportunidad

2. **Cuando se mueve una oportunidad**
   - Se actualiza el estado del lead según la etapa
   
3. **Cuando se gana una oportunidad**
   - Lead pasa a CONVERTIDO
   - Se actualiza fechaConversion

4. **Cuando se pierde una oportunidad**
   - Lead pasa a DESCALIFICADO

---

## 📊 ESTADÍSTICAS DE CONVERSIÓN

### Endpoint: GET /api/leads/estadisticas/conversion

```json
{
  "exito": true,
  "estadisticas": {
    "totalLeads": 50,
    "leadsConOportunidad": 30,
    "leadsSinOportunidad": 20,
    "oportunidadesGanadasDesdeLead": 8,
    "valorGanado": 150000,
    "tazaConversion": 60.0
  }
}
```

**Interpretación:**
- 60% de los leads han sido convertidos a oportunidades
- 8 oportunidades fueron ganadas
- Valor total ganado: S/ 150,000

---

## 🎯 ENDPOINTS NUEVOS

### 1. Convertir Lead a Oportunidad (Manual)
```
POST /api/leads/:leadId/convertir-a-oportunidad

Body:
{
  "titulo": "string (opcional)",
  "proyecto": "string (opcional)",
  "propiedad": "string (opcional)",
  "valor": number (opcional),
  "probabilidad": number (opcional)
}

Response:
{
  "exito": true,
  "mensaje": "Lead convertido a oportunidad exitosamente",
  "oportunidad": { ... }
}
```

### 2. Obtener Leads No Convertidos
```
GET /api/leads/no-convertidos/lista?limite=10

Response:
{
  "exito": true,
  "total": 5,
  "leads": [
    {
      "id": "...",
      "nombre": "Juan",
      "correo": "juan@example.com",
      "estadoLead": "NUEVO",
      "creadoEn": "2024-01-20",
      "alertas": [...]
    }
  ]
}
```

### 3. Obtener Oportunidades de un Lead
```
GET /api/leads/:leadId/oportunidades

Response:
{
  "exito": true,
  "total": 2,
  "oportunidades": [ ... ]
}
```

### 4. Obtener Estadísticas de Conversión
```
GET /api/leads/estadisticas/conversion

Response:
{
  "exito": true,
  "estadisticas": { ... }
}
```

### 5. Completar Alerta y Convertir (Todo-en-Uno)
```
POST /api/leads/:leadId/completar-alerta-y-convertir

Body:
{
  "alertaId": "...",
  "notas": "Se contactó al cliente"
}

Response:
{
  "exito": true,
  "mensaje": "Alerta completada y lead convertido a oportunidad"
}
```

---

## 🎨 FRONTEND - COMPONENTES NUEVOS

### 1. WidgetConversionLead
Muestra estadísticas de conversión en el dashboard.

```tsx
import { WidgetConversionLead } from '@/components/features/leads/WidgetConversionLead';

<WidgetConversionLead usuarioId={usuarioId} />
```

**Muestra:**
- Total de leads
- Leads convertidos
- Leads sin convertir
- Tasa de conversión (%)
- Oportunidades ganadas
- Valor total ganado

### 2. Hook: useLeadPipeline
Maneja todas las operaciones de lead-pipeline.

```tsx
import { useLeadPipeline } from '@/hooks/useLeadPipeline';

const {
  cargando,
  error,
  leadsNoConvertidos,
  estadisticasConversion,
  obtenerLeadsNoConvertidos,
  convertirLeadAOportunidad,
  obtenerEstadisticasConversion,
  obtenerOportunidadesDeLead,
  completarAlertaYConvertir
} = useLeadPipeline();
```

---

## 🔌 INTEGRACIÓN CON SERVICIOS EXISTENTES

### 1. LeadPipelineService (Backend)
```typescript
import leadPipelineService from '@/services/lead-pipeline.service';

// Convertir lead a oportunidad
await leadPipelineService.convertirLeadAOportunidad(leadId, usuarioId);

// Sincronizar estado del lead
await leadPipelineService.sincronizarEstadoLead(leadId);

// Obtener estadísticas
await leadPipelineService.obtenerEstadisticasConversion(usuarioId);

// Obtener leads no convertidos
await leadPipelineService.obtenerLeadsNoConvertidos(usuarioId);
```

### 2. OportunidadService (Backend)
```typescript
// Cambiar etapa AHORA sincroniza automáticamente el estado del lead
async cambiarEtapa(oportunidadId, nuevaEtapa) {
  // 1. Actualiza oportunidad
  // 2. Sincroniza estado del lead (nuevo)
}
```

### 3. AlertaService (Backend)
```typescript
// Completar alerta ahora puede convertir automáticamente
await leadPipelineService.completarAlertaYConverrir(alertaId, leadId, usuarioId);
```

---

## 📱 CASOS DE USO

### Caso 1: Lead llega sin hacer nada
```
1. Lead creado (NUEVO) → Alerta automática después de 24h
2. Usuario ve alerta en dashboard
3. Usuario contacta al lead
4. Usuario completa alerta
5. Lead automáticamente → CONTACTADO
6. Oportunidad automáticamente creada → CONTACTO
7. Usuario mueve oportunidad en pipeline
```

### Caso 2: Lead a cliente ganado
```
1. Lead (NUEVO)
   ↓ [Completar alerta]
2. Lead (CONTACTADO) + Oportunidad (CONTACTO)
   ↓ [Visita]
3. Oportunidad (VISITA) + Lead (CONTACTADO)
   ↓ [Negociación]
4. Oportunidad (NEGOCIACIÓN) + Lead (CONTACTADO)
   ↓ [Cierre]
5. Oportunidad (CIERRE) + Lead (CONTACTADO)
   ↓ [Marcar ganada]
6. Oportunidad (GANADO) + Lead (CONVERTIDO) ✅
```

### Caso 3: Lead descalificado
```
1. Oportunidad (CONTACTO)
   ↓ [No interesado]
2. Oportunidad (PERDIDO) + Lead (DESCALIFICADO) ❌
```

---

## 🧪 TESTING

### Test 1: Crear lead y generar alerta
```bash
# Crear lead
POST /api/contactos
{
  "nombre": "Test Lead",
  "tipo": "LEAD"
}

# Esperar 24+ horas O forzar generación
POST /api/alertas/generar

# Verificar alerta creada
GET /api/alertas
```

### Test 2: Convertir lead a oportunidad
```bash
# Completar alerta y convertir
POST /api/leads/:id/completar-alerta-y-convertir
{
  "alertaId": "...",
  "notas": "Contactado"
}

# Verificar lead está CONTACTADO
GET /api/contactos/:id

# Verificar oportunidad creada
GET /api/leads/:id/oportunidades
```

### Test 3: Verificar sincronización
```bash
# Mover oportunidad a VISITA
PATCH /api/oportunidades/:id/etapa
{
  "etapa": "VISITA"
}

# Verificar lead sigue como CONTACTADO
GET /api/contactos/:id
# estadoLead debe ser "CONTACTADO"

# Mover a GANADO
PATCH /api/oportunidades/:id/etapa
{
  "etapa": "GANADO"
}

# Verificar lead es CONVERTIDO
GET /api/contactos/:id
# estadoLead debe ser "CONVERTIDO"
```

---

## 🐛 LOGGING Y DEBUGGING

### Logs del Backend
```
🔄 Convirtiendo lead [id] a oportunidad...
✅ Oportunidad creada: [id]
✅ Estado del lead actualizado a: CONTACTADO
✅ Alerta completada y lead convertido a oportunidad
```

### Verificar Estado
```bash
# Ver todas las alertas activas
GET /api/alertas

# Ver estadísticas de conversión
GET /api/leads/estadisticas/conversion

# Ver leads sin convertir
GET /api/leads/no-convertidos/lista

# Ver oportunidades de un lead
GET /api/leads/:id/oportunidades
```

---

## ✅ CARACTERÍSTICAS IMPLEMENTADAS

✅ Creación automática de oportunidades cuando lead→CONTACTADO
✅ Sincronización bidirecional lead ↔ oportunidad
✅ Estadísticas de conversión lead→oportunidad
✅ Endpoint para obtener leads no convertidos
✅ Flujo completar alerta + convertir en un solo paso
✅ Endpoint para ver oportunidades de un lead
✅ Widget de conversión para dashboard
✅ Hook useLeadPipeline para frontend
✅ Logging detallado para debugging

---

## 🚀 PRÓXIMOS PASOS SUGERIDOS

1. **Email automático cuando se convierte lead**
   - Notificar al usuario cuando lead→oportunidad

2. **Recordatorio de leads sin convertir**
   - Alerta diaria de leads pendientes de conversión

3. **Análisis de tiempo de conversión**
   - Cuánto tarda un lead en convertirse a oportunidad

4. **Exportar reporte de conversión**
   - CSV/PDF de estadísticas de conversión

5. **Predicción de conversión**
   - ML para predecir qué leads tienen mayor probabilidad

---

## 📚 ARCHIVOS MODIFICADOS/CREADOS

```
✨ NUEVOS:
  server/src/services/lead-pipeline.service.ts
  server/src/routes/lead-pipeline.routes.ts
  client/hooks/useLeadPipeline.ts
  client/components/features/leads/WidgetConversionLead.tsx

🔧 MODIFICADOS:
  server/src/index.ts (agregar rutas)
  server/src/services/oportunidad.service.ts (integrar sincronización)
```

---

*Integración Completa Lead ↔ Pipeline - Listo para Producción ✨*
