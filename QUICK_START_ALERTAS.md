# 🚀 QUICK START - Sistema de Alertas Automáticas

## ⚡ En 30 Segundos

El sistema de alertas **ya está funcionando**. No requiere configuración adicional.

### Lo que hace:
- ✅ **Cada 1 hora**: Busca leads sin contactar (>24 horas)
- ✅ **Automáticamente**: Crea alertas con plazo de 24 horas
- ✅ **En el dashboard**: Widget muestra estadísticas en tiempo real
- ✅ **Sin intervención**: Todo funciona sin botones o acciones manuales

---

## 🏃 Verificar que Todo Funciona

### Opción 1: Quick Test
```bash
# En la raíz del proyecto:
bash test-alertas.sh
```

### Opción 2: Ver Logs
```bash
# Terminal 1: Ver backend en tiempo real
docker compose -f docker-compose.dev.yml logs -f backend

# Deberías ver cada hora:
# 📅 Iniciando job de generación automática de alertas...
# ⏰ Ejecutando generación automática de alertas...
# 🔍 Buscando leads no contactados en las últimas 24 horas...
# ✅ 0 alertas creadas exitosamente (o el número encontrado)
```

### Opción 3: Test el Widget
```
1. Abre http://localhost:3000
2. Login
3. Ve a /dashboard
4. Busca widget "Alertas de Leads"
5. Debe mostrar estadísticas (Total, Pendientes, Urgentes, etc.)
```

---

## 📋 Estructura de Carpetas

```
Crm-Delgado/
├── server/
│   └── src/
│       ├── jobs/
│       │   └── generarAlertasAutomaticamente.ts  ← El job automático
│       ├── routes/
│       │   └── alerta.routes.ts                  ← APIs
│       ├── services/
│       │   └── alerta.service.ts                 ← Lógica
│       └── index.ts                              ← Inicia el job
│
└── client/
    └── components/
        └── features/
            └── alerts/
                └── WidgetAlertas.tsx              ← Widget dashboard
```

---

## 🔍 Ver Qué Está Pasando

### Ver Logs en Vivo
```bash
# Todos los logs del backend
docker compose -f docker-compose.dev.yml logs -f backend

# Solo logs de alertas
docker compose -f docker-compose.dev.yml logs backend | grep -i alerta

# Formato bonito con colores
docker compose -f docker-compose.dev.yml logs -f backend 2>&1 | grep --color=always -E "(alerta|error|✅|❌|📅|⏰|🔍)"
```

### Ver Estado de Bases de Datos
```bash
# Acceso directo a MySQL
docker exec -it crm-mysql-dev mysql -u crm_user -pcrm_pass crm_delgado

# Una vez adentro:
mysql> SELECT COUNT(*) FROM alertas_leads;
mysql> SELECT * FROM alertas_leads LIMIT 5;
mysql> exit
```

### Ver Estadísticas desde API
```bash
# Necesitas un JWT token (puedes sacarlo de las cookies del navegador)
curl -H "Authorization: Bearer [YOUR_TOKEN]" \
  http://localhost:5000/api/alertas/estadisticas/[USER_ID]

# Respuesta:
# {
#   "exito": true,
#   "estadisticas": {
#     "total": 5,
#     "activas": 3,
#     "urgentes": 1,
#     "completadas": 2
#   }
# }
```

---

## 📊 Flujo de Datos

```
Usuario crea Lead (sin contactar)
    ↓
    ↓ [Después de 24 horas]
    ↓
Job automático busca leads sin contactar
    ↓
Crea AlertaLead en BD (fechaLimite = ahora + 24h)
    ↓
Widget obtiene estadísticas (GET /alertas/estadisticas)
    ↓
Dashboard muestra alertas al usuario
    ↓
Usuario completa alerta (marca lead como CONTACTADO)
    ↓
Alerta se marca como completada en BD
```

---

## ⚙️ Configuración (Opcional)

### Cambiar Frecuencia (Cada 30 minutos en lugar de 1 hora)
```typescript
// server/src/jobs/generarAlertasAutomaticamente.ts

// Cambiar:
}, 60 * 60 * 1000);  // 1 hora

// A:
}, 30 * 60 * 1000);  // 30 minutos

// Luego:
docker compose -f docker-compose.dev.yml up -d --build
```

### Cambiar Período de Búsqueda (12 horas en lugar de 24)
```typescript
// server/src/services/alerta.service.ts

// Encontrar línea:
const hace24Horas = new Date(Date.now() - 24 * 60 * 60 * 1000);

// Cambiar a:
const hace24Horas = new Date(Date.now() - 12 * 60 * 60 * 1000);

// Luego:
docker compose -f docker-compose.dev.yml up -d --build
```

### Auto-Refresh Widget (2 minutos en lugar de 5)
```typescript
// client/components/features/alerts/WidgetAlertas.tsx

// Encontrar línea:
const intervalo = setInterval(obtenerEstadisticas, 5 * 60 * 1000);

// Cambiar a:
const intervalo = setInterval(obtenerEstadisticas, 2 * 60 * 1000);

// Luego hacer rebuild
docker compose -f docker-compose.dev.yml up -d --build
```

---

## 🐛 Troubleshooting

### "No veo alertas en el widget"
1. ✅ Verifica que hay leads creados hace 24+ horas
2. ✅ Check logs: `docker compose logs backend | grep alerta`
3. ✅ Verifica autenticación: ¿Está el usuario logueado?
4. ✅ Recarga la página (F5)

### "Error 403 Forbidden en API"
1. ✅ Asegúrate de tener JWT token válido
2. ✅ Verifica que usuario existe en BD
3. ✅ Check role: algunos endpoints requieren ADMIN/SUPERVISOR

### "Job no se está ejecutando"
1. ✅ Ver logs: `docker compose logs backend`
2. ✅ Buscar: "Iniciando job de generación automática"
3. ✅ Si no aparece: rebuild con `docker compose up -d --build`

### "Base de datos desconectada"
1. ✅ Verifica MySQL está corriendo: `docker compose ps`
2. ✅ Reinicia todo: 
   ```bash
   docker compose down
   docker compose up -d --build
   sleep 10
   docker compose logs backend
   ```

---

## 🔗 URLs Útiles

| URL | Propósito |
|-----|-----------|
| http://localhost:3000 | Frontend CRM |
| http://localhost:5000/api/health | Health check backend |
| http://localhost:8080 | Adminer (DB admin) |
| http://localhost:5000/api/alertas/estadisticas/[id] | API estadísticas |

---

## 📚 Documentación Completa

- **Técnica detallada**: `ALERTAS_AUTOMATICAS.md`
- **Estado final**: `ESTADO_FINAL_ALERTAS.md`
- **Código fuente**: `server/src/jobs/generarAlertasAutomaticamente.ts`

---

## ✨ Lo Que Está Automático

No necesitas hacer NADA. El sistema:

- ✅ Inicia automáticamente con el servidor
- ✅ Se ejecuta cada 1 hora
- ✅ Busca leads automáticamente
- ✅ Crea alertas automáticamente
- ✅ Widget se actualiza automáticamente cada 5 minutos
- ✅ Logging automático para debugging

Solo **observa y usa**. Las alertas estarán allí cuando las necesites.

---

## 🎯 Checklist de Verificación

```
□ Docker compose levantado (docker compose ps)
□ Backend responde (http://localhost:5000/api/health)
□ Frontend accesible (http://localhost:3000)
□ Widget visible en dashboard
□ Logs muestran "Iniciando job de generación"
□ Tabla alertas_leads existe en BD
□ Usuario logueado correctamente
```

---

## 💬 Resumen

**El sistema está 100% automático y funcional.**

No hay botones para presionar, no hay configuración necesaria, no hay acciones manuales.

Solo **inicia Docker, abre el dashboard, y verás las alertas aparecer automáticamente cuando haya leads sin contactar por más de 24 horas**.

---

*¡Listo para usar! 🚀*
