# Integración del Asistente con Base de Datos del CRM

## Qué se implementó

El asistente (tanto en **Chat** como en **Voz**) ahora tiene acceso completo a los datos reales de la base de datos del CRM.

### Servicio de Contexto CRM

**Archivo:** `server/src/services/crm-context.service.ts`

Este servicio recopila métricas completas del CRM en tiempo real:

#### Resumen General
- **Total de contactos** (todos los tipos)
- **Total de leads** y leads creados este mes
- **Oportunidades activas** (todas las etapas)
- **Oportunidades ganadas** (etapa GANADO)
- **Valor total de oportunidades** y valor ganado
- **Total de cotizaciones**
- **Proyectos activos**
- **Usuarios activos**
- **Tasa de conversión** (leads → oportunidades)

#### Detalles por Categoría
- **Contactos por estado de lead** (NUEVO, CONTACTADO, CALIFICADO, etc.)
- **Oportunidades por etapa** (PROSPECTO, NEGOCIACION, GANADO, PERDIDO)
- **Cotizaciones por estado** (BORRADOR, ENVIADA, APROBADA, etc.)
- **Proyectos por estado** (PLANIFICACION, CONSTRUCCION, FINALIZADO, etc.)
- **Ventas mensuales** (cantidad y valor por mes del año actual)
- **Top 5 proyectos** con más oportunidades ganadas

### Integración en Chat

**Archivo:** `server/src/controllers/assistant.controller.ts`

- El endpoint `/api/assistant/ask` ahora consulta el contexto completo antes de responder
- El asistente recibe todos los datos en formato JSON estructurado
- Puede responder preguntas específicas con números exactos

**Ejemplos de preguntas que ahora funcionan:**
- "¿Cuántos leads tenemos?"
- "¿Cuántos contactos nuevos este mes?"
- "¿Cuál es el valor total ganado?"
- "¿Cuántas oportunidades en negociación?"
- "¿Qué proyectos tienen más ventas?"
- "¿Cuál es nuestra tasa de conversión?"

### Integración en Voz

**Archivo:** `server/src/controllers/voice.controller.ts`

- Al iniciar una sesión de voz, el sistema carga el contexto del CRM
- El `systemInstruction` incluye un resumen formateado de las métricas principales
- El asistente de voz responde de manera ultra-concisa (2-3 oraciones)

**Ejemplos de preguntas por voz:**
- "Cuántos leads tenemos"
- "Valor ganado"
- "Proyectos activos"
- "Oportunidades en negociación"

## Ventajas de esta Implementación

### 1. Datos en Tiempo Real
Cada consulta obtiene los datos más recientes de la base de datos, sin necesidad de cachés.

### 2. Contexto Completo
El asistente tiene visibilidad de:
- Todas las métricas principales
- Distribuciones por estado/etapa
- Tendencias mensuales
- Comparativas entre proyectos

### 3. Respuestas Precisas
Ya no responde "No tengo acceso a datos". Ahora proporciona:
- Números exactos
- Comparaciones
- Cálculos (tasas de conversión, porcentajes)
- Tendencias

### 4. Escalable
Puedes agregar más consultas al servicio `getCRMContext()` según necesites:
- Mejor vendedor del mes
- Leads por fuente
- Tiempo promedio de conversión
- Etc.

## Configuración del System Instruction

### Para Chat
- Respuestas concisas (3-4 líneas)
- Incluye números concretos
- Formato profesional
- Montos en soles (S/)

### Para Voz
- **MUY BREVE** (2-3 oraciones máximo)
- Solo datos clave
- Evita tecnicismos
- Optimizado para audio

## Ejemplos de Uso

### Chat
**Usuario:** "¿Cuántos leads tenemos actualmente?"
**Asistente:** "Actualmente tienes 42 leads en total. Este mes se crearon 15 leads nuevos. La distribución por estado es: 8 NUEVO, 12 CONTACTADO, 10 CALIFICADO, 7 CONVERTIDO y 5 DESCARTADO."

**Usuario:** "¿Cuál es el valor ganado este año?"
**Asistente:** "El valor total ganado este año es S/ 1,245,000 con 28 oportunidades cerradas. Esto representa una tasa de conversión del 35% respecto a los leads del año."

### Voz
**Usuario:** "Leads nuevos este mes"
**Asistente:** "Este mes tenemos 15 leads nuevos de un total de 42 leads activos."

**Usuario:** "Proyectos con más ventas"
**Asistente:** "El proyecto Torre Azul lidera con 12 oportunidades ganadas por S/ 450,000."

## Cómo Probar

1. **Reinicia el backend:**
   ```bash
   cd server
   pnpm dev
   ```

2. **Abre el asistente en Electron o Web:**
   - Navega a Dashboard → Reportes
   - Haz clic en el botón del asistente (abajo a la derecha)

3. **Prueba el Chat:**
   - Pestaña "Chat" (ícono de mensaje)
   - Pregunta: "¿Cuántos leads tenemos?"
   - Pregunta: "¿Valor ganado este año?"
   - Pregunta: "¿Qué proyecto tiene más oportunidades?"

4. **Prueba la Voz:**
   - Pestaña "Voz" (ícono de teléfono)
   - Haz clic en el botón del micrófono
   - Di: "Cuántos contactos tenemos"
   - Di: "Valor ganado"

## Próximas Mejoras Opcionales

- [ ] Caché inteligente del contexto (refrescar cada X minutos)
- [ ] Filtros por fecha/rango en las consultas del usuario
- [ ] Gráficos inline en las respuestas del chat
- [ ] Comparación mes a mes o año a año
- [ ] Predicciones basadas en tendencias
- [ ] Exportar respuestas del asistente como PDF/Excel
- [ ] Historial de conversaciones guardado en BD

## Troubleshooting

### "No tengo acceso a datos de..."
- Verifica que el backend esté corriendo
- Revisa que `SERVER_GEMINI_API_KEY` esté configurada en `.env`
- Comprueba que hay datos en la BD (al menos algunos leads/oportunidades)

### Respuestas lentas
- El servicio `getCRMContext()` hace ~15 consultas a la BD
- Si la BD está lenta, considera agregar índices en:
  - `contacto.tipo`
  - `contacto.estadoLead`
  - `oportunidadCliente.etapa`
  - `cotizacion.estado`

### El asistente no usa los datos
- Verifica en logs del servidor que aparece `[Assistant]` sin errores
- El contexto se envía en cada request, revisa el payload en DevTools

## Arquitectura

```
┌──────────────┐         HTTP/WS          ┌───────────────────┐
│   Cliente    │ ◄────────────────────────►│     Backend       │
│  (Chat/Voz)  │   /api/assistant/ask     │ assistant.ctrl.ts │
└──────────────┘   ws://.../api/voice     │ voice.ctrl.ts     │
                                           └─────────┬─────────┘
                                                     │
                                                     │ usa
                                                     ▼
                                           ┌─────────────────┐
                                           │ crm-context     │
                                           │  .service.ts    │
                                           └────────┬────────┘
                                                    │
                                                    │ consulta
                                                    ▼
                                           ┌─────────────────┐
                                           │ Prisma Client   │
                                           │ (PostgreSQL)    │
                                           └─────────────────┘
```

---

**Resultado:** El asistente ahora es una herramienta analítica real y útil que consulta datos actuales del CRM en tiempo real. 🚀
