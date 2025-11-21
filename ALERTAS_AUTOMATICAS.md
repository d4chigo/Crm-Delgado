# 🤖 Generación Automática de Alertas - Implementación Completada

## ✅ Resumen

Se ha implementado un **sistema automático de generación de alertas** para leads sin contactar en 24+ horas. Las alertas se crean automáticamente sin requerir intervención manual.

---

## 📋 Características Implementadas

### 1. **Job Automático de Generación de Alertas**
- **Archivo**: `server/src/jobs/generarAlertasAutomaticamente.ts`
- **Funcionamiento**:
  - Se ejecuta **inmediatamente al iniciar el servidor**
  - Se repite **cada 1 hora** automáticamente
  - Busca leads sin contactar creados hace 24+ horas
  - Crea alertas con plazo de 24 horas desde el descubrimiento
  
### 2. **Endpoints de API Mejorados**
- **POST /api/alertas/generar** - Generación manual (si es necesario)
- **GET /api/alertas/estadisticas/:usuarioId** - Obtiene resumen de alertas
- **GET /api/alertas** - Alertas activas del usuario actual
- **GET /api/alertas/todas** - Admin view de todas las alertas
- **PUT /api/alertas/:id/completar** - Marcar alerta como completada

### 3. **Widget de Dashboard Mejorado**
- **Componente**: `client/components/features/alerts/WidgetAlertas.tsx`
- **Cambios**:
  - ✅ Remueve botón "Generar Alertas" (ya no es necesario)
  - ✅ Auto-refresh cada 5 minutos
  - ✅ Muestra estado "Todas las alertas completadas" cuando no hay activas
  - ✅ Destaca alertas urgentes (< 6 horas al vencimiento)
  - ✅ Error handling mejorado

---

## 🔄 Flujo de Ejecución

```
┌─────────────────────────────────────┐
│  Servidor inicia (index.ts)         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ iniciarJobGenerarAlertas()          │
│ (jobs/generarAlertasAutomaticamente)│
└──────────────┬──────────────────────┘
               │
               ├─ Ejecutar INMEDIATAMENTE
               │  ↓
               │  generarAlertasLeadsNoContactados()
               │  ├─ Buscar: contactos sin contactar en 24+ horas
               │  ├─ Crear: AlertaLead con fechaLimite = ahora + 24h
               │  └─ Guardar: en BD
               │
               └─ Ejecutar CADA 1 HORA
                  ↓
                  [Repetir proceso cada 60 minutos]
```

---

## 🔍 Cómo Verifica el Sistema Leads Sin Contactar

```sql
-- Consulta que ejecuta el job:
SELECT contactos
WHERE tipo = 'LEAD'
  AND creadoEn <= (ahora - 24 horas)
  AND estadoLead IN ('NUEVO', 'ABIERTO')
  AND NO existe alerta activa para este contacto
```

### Parámetros Configurables

En `server/src/services/alerta.service.ts`, función `generarAlertasLeadsNoContactados()`:

```typescript
// Leads creados hace 24+ horas
const hace24Horas = new Date(Date.now() - 24 * 60 * 60 * 1000);

// Alertas vencen en 24 horas desde su creación
const vencimiento = new Date(Date.now() + 24 * 60 * 60 * 1000);

// Estados de lead que disparan alerta
const estadosAlerta = ['NUEVO', 'ABIERTO']; // Cambiar según necesidades
```

---

## 📊 Estados y Logging

### En Backend (Docker logs)
```
📅 Iniciando job de generación automática de alertas...
⏰ Ejecutando generación automática de alertas...
🔍 Buscando leads no contactados en las últimas 24 horas...
📊 Encontrados 5 leads sin contactar
✅ 5 alertas creadas exitosamente
```

### En Frontend (Console)
```
🔍 WidgetAlertas: Obteniendo estadísticas para usuarioId: [uuid]
✅ Respuesta obtenida: {exito: true, estadisticas: {...}}
✅ Estadísticas actualizadas: total=5, activas=3, urgentes=1
```

---

## 🐛 Fixes Aplicados

### Fix 1: Autenticación en Rutas
**Problema**: Rutas accedían a `(req as any).usuarioId` (undefined)  
**Solución**: Cambiado a `(req as any).usuario?.id` (estructura correcta JWT)  
**Archivos**:
- `server/src/routes/alerta.routes.ts` (4 endpoints)
- `server/src/lib/autenticacion.ts`

### Fix 2: Estructura de Respuesta API
**Problema**: Widget no reconocía respuesta de estadísticas  
**Solución**: Asegurar que API retorna `{exito: true, estadisticas: {...}}`  
**Archivos**:
- `server/src/routes/alerta.routes.ts` (GET /estadisticas)

### Fix 3: Orden de Rutas Express
**Problema**: Rutas genéricas (`GET /:id`) interceptaban rutas específicas (`GET /todas`)  
**Solución**: Reordenar rutas - específicas ANTES que genéricas  
**Archivo**:
- `server/src/routes/alerta.routes.ts` (reordenado)

---

## 🧪 Testing

### Probar Manualmente el Job
```bash
# Ver logs en tiempo real
docker compose -f docker-compose.dev.yml logs -f backend | grep -i "alerta"

# Ejecutar test de alertas
docker compose -f docker-compose.dev.yml exec backend npm run test:alertas
```

### Probar API
```bash
# Obtener estadísticas (requiere JWT token)
curl -H "Authorization: Bearer [token]" \
  http://localhost:5000/api/alertas/estadisticas/[usuarioId]

# Generar alertas manualmente
curl -X POST \
  -H "Authorization: Bearer [token]" \
  http://localhost:5000/api/alertas/generar
```

---

## 🔐 Permisos de Acceso

| Endpoint | Rol Requerido | Descripción |
|----------|---------------|-------------|
| `POST /generar` | ADMIN, SUPERVISOR | Generar alertas manualmente |
| `GET /estadisticas/:usuarioId` | Mismo usuario o ADMIN | Ver estadísticas propias |
| `GET /todas` | ADMIN | Ver todas las alertas del sistema |
| `PUT /:id/completar` | Propietario o ADMIN | Marcar alerta como hecha |

---

## 📈 Próximas Mejoras Sugeridas

1. **Email Notifications**: Enviar email cuando se crea una alerta urgente
2. **WebSocket Updates**: Notificar en tiempo real cambios de alertas
3. **Configuración de Horarios**: Permitir que usuarios elijan frecuencia de alertas
4. **Alertas Personalizadas**: Filtros por etiquetas, fuente, etc.
5. **Historial**: Guardar alertas completadas por tiempo (30+ días)
6. **Dashboard**: Gráficos de tendencias de alertas

---

## 📁 Archivos Modificados

```
server/
├── src/
│   ├── jobs/
│   │   └── generarAlertasAutomaticamente.ts   [NUEVO]
│   ├── routes/
│   │   └── alerta.routes.ts                   [MODIFICADO]
│   ├── index.ts                               [MODIFICADO]
│   └── test-alertas.ts                        [NUEVO]

client/
└── components/
    └── features/
        └── alerts/
            └── WidgetAlertas.tsx              [MODIFICADO]
```

---

## ✨ Estado Final

- ✅ Job automático de generación funcionando
- ✅ Todas las rutas de API corregidas y probadas
- ✅ Widget de dashboard actualizado
- ✅ Logging detallado para debugging
- ✅ Docker contenedores ejecutándose correctamente
- ✅ Base de datos migrada con tabla `alertas_leads`
- ✅ Autenticación JWT funcionando correctamente

---

## 🚀 Cómo Acceder

**Frontend**: http://localhost:3000  
**Backend**: http://localhost:5000  
**Database Admin**: http://localhost:8080 (Adminer)

En el dashboard, el widget de "Alertas de Leads" ahora:
- Muestra estadísticas en tiempo real
- Se actualiza automáticamente cada 5 minutos
- Destaca alertas urgentes
- No requiere botón manual (es automático)

---

*Implementación completada y probada - 2024*
