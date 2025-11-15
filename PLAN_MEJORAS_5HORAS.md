# 📋 PLAN DE MEJORAS - 5 HORAS

## ✅ VERIFICACIÓN DE ERRORES - COMPLETADO

### Estado Actual del Código
- ✅ **Controladores**: Sin errores (contacto, oportunidad, auth, analytics)
- ✅ **Servicios**: Bien estructurados (contacto, oportunidad, auth)
- ✅ **Tipos**: Interfaces correctas y completas
- ✅ **Rutas**: Ordenadas correctamente (específicas antes de genéricas)
- ✅ **CORS**: Configurado para desarrollo
- ✅ **Respuestas**: Utilidades de respuesta funcionando

### Funcionalidades Verificadas
- ✅ Gestión de Contactos (CRUD completo)
- ✅ Gestión de Oportunidades (CRUD completo)
- ✅ Autenticación (Login, Registro, JWT)
- ✅ Importación desde Google
- ✅ Reportes y Analíticas
- ✅ Asistente IA con datos reales
- ✅ Cotizaciones
- ✅ Proyectos

---

## 🚀 PLAN DE MEJORAS EN 5 HORAS

### HORA 1: Notificaciones en Tiempo Real (Infraestructura)
**Tiempo: 60 minutos**

#### 1.1 Crear tabla de Notificaciones en Prisma
```prisma
model Notificacion {
  id            String   @id @default(uuid())
  usuarioId     String
  tipo          String   // 'NUEVO_LEAD', 'OPORTUNIDAD_GANADA', 'SEGUIMIENTO_VENCIDO'
  titulo        String
  mensaje       String
  leida         Boolean  @default(false)
  referencia    String?  // ID del contacto/oportunidad
  creadoEn      DateTime @default(now())
  usuario       Usuario  @relation(fields: [usuarioId], references: [id])
  @@map("notificaciones")
}
```

#### 1.2 Crear Servicio de Notificaciones
- Archivo: `server/src/services/notificacion.service.ts`
- Métodos:
  - `crearNotificacion(usuarioId, tipo, titulo, mensaje, referencia)`
  - `obtenerNotificaciones(usuarioId, leidas?)`
  - `marcarComoLeida(notificacionId)`
  - `obtenerNoLeidas(usuarioId)`

#### 1.3 Crear Rutas de Notificaciones
- Archivo: `server/src/routes/notificacion.routes.ts`
- Endpoints:
  - `GET /api/notificaciones` - Obtener todas
  - `GET /api/notificaciones/no-leidas` - Contar no leídas
  - `PATCH /api/notificaciones/:id/leer` - Marcar como leída

---

### HORA 2: WebSocket para Tiempo Real
**Tiempo: 60 minutos**

#### 2.1 Instalar Socket.IO
```bash
npm install socket.io socket.io-client
```

#### 2.2 Configurar Socket.IO en Backend
- Archivo: `server/src/config/socket.ts`
- Eventos:
  - `connection` - Usuario conecta
  - `disconnect` - Usuario desconecta
  - `notificacion:nueva` - Emitir notificación
  - `notificacion:leer` - Marcar como leída

#### 2.3 Integrar Socket.IO en Express
- Modificar `server/src/index.ts`
- Crear servidor HTTP con Socket.IO
- Autenticación con JWT en Socket.IO

#### 2.4 Crear Hook en Frontend
- Archivo: `client/hooks/useNotificaciones.ts`
- Funcionalidades:
  - Conectar a Socket.IO
  - Escuchar eventos de notificaciones
  - Guardar en estado local
  - Desconectar al desmontar

---

### HORA 3: Eventos que Disparan Notificaciones
**Tiempo: 60 minutos**

#### 3.1 Notificación: Nuevo Lead Creado
- Modificar: `server/src/services/contacto.service.ts`
- Cuando se crea un contacto tipo LEAD:
  - Crear notificación
  - Emitir por Socket.IO a todos los agentes

#### 3.2 Notificación: Oportunidad Ganada
- Modificar: `server/src/services/oportunidad.service.ts`
- Cuando etapa cambia a GANADO:
  - Crear notificación
  - Emitir por Socket.IO

#### 3.3 Notificación: Seguimiento Vencido
- Crear: `server/src/jobs/seguimientos.job.ts`
- Cron job cada 1 hora:
  - Buscar oportunidades con `proximaAccion` vencida
  - Crear notificaciones
  - Emitir por Socket.IO

#### 3.4 Notificación: Cambio de Etapa
- Modificar: `server/src/services/oportunidad.service.ts`
- Cuando cambia etapa:
  - Crear notificación
  - Emitir por Socket.IO

---

### HORA 4: UI de Notificaciones en Frontend
**Tiempo: 60 minutos**

#### 4.1 Componente de Campana de Notificaciones
- Archivo: `client/components/NotificationBell.tsx`
- Características:
  - Icono de campana con badge de contador
  - Dropdown con últimas 5 notificaciones
  - Botón "Ver todas"
  - Marcar como leída al hacer click

#### 4.2 Página de Notificaciones
- Archivo: `client/app/dashboard/notificaciones/page.tsx`
- Características:
  - Lista completa de notificaciones
  - Filtrar por tipo (leídas/no leídas)
  - Marcar como leída/no leída
  - Eliminar notificación
  - Ir al recurso (contacto/oportunidad)

#### 4.3 Toast de Notificaciones
- Usar `sonner` (ya instalado)
- Mostrar toast cuando llega notificación nueva
- Sonido opcional
- Auto-dismiss en 5 segundos

#### 4.4 Integrar en Layout
- Modificar: `client/app/dashboard/layout.tsx`
- Agregar `NotificationBell` en header
- Agregar `useNotificaciones` hook

---

### HORA 5: Soporte en Electron + Testing
**Tiempo: 60 minutos**

#### 5.1 Configurar Socket.IO para Electron
- Socket.IO ya funciona en Electron (es WebSocket)
- Verificar que CORS esté configurado
- Probar conexión en Electron

#### 5.2 Agregar Notificaciones del Sistema (Electron)
- Usar `electron.Notification` para notificaciones del SO
- Mostrar cuando llega notificación nueva
- Sonido de notificación

#### 5.3 Testing
- Crear 2 usuarios
- Usuario 1 crea un lead
- Usuario 2 debe recibir notificación en tiempo real
- Verificar en Electron
- Verificar en navegador

#### 5.4 Documentación
- Crear: `NOTIFICACIONES_REALTIME.md`
- Explicar cómo funciona
- Ejemplos de uso
- Troubleshooting

---

## 📊 DESGLOSE DE TIEMPO

| Tarea | Tiempo | Estado |
|-------|--------|--------|
| 1. Infraestructura (BD + Servicio) | 60 min | ⏳ |
| 2. WebSocket (Socket.IO) | 60 min | ⏳ |
| 3. Eventos que disparan notificaciones | 60 min | ⏳ |
| 4. UI en Frontend | 60 min | ⏳ |
| 5. Electron + Testing | 60 min | ⏳ |
| **TOTAL** | **300 min (5h)** | ⏳ |

---

## 🎯 OTRAS MEJORAS (Después de Notificaciones)

### Si queda tiempo en las 5 horas:

#### Historial de Comunicación (30-45 min)
- Crear tabla: `Comunicacion { tipo, fecha, duracion, notas, contactoId }`
- Endpoint: `POST /api/comunicaciones`
- Mostrar timeline en perfil del contacto

#### Permisos y Roles (45-60 min)
- Crear tabla: `Permiso { nombre, descripcion }`
- Crear tabla: `RolPermiso { rolId, permisoId }`
- Middleware de autorización
- Verificar permisos en endpoints

#### Ranking de Agentes (20-30 min)
- Endpoint: `GET /api/ranking/agentes`
- Mostrar en dashboard
- Ordenar por ventas, leads convertidos, etc.

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Backend
- [ ] Crear migración de BD (tabla Notificacion)
- [ ] Crear servicio de notificaciones
- [ ] Crear rutas de notificaciones
- [ ] Configurar Socket.IO
- [ ] Integrar Socket.IO en Express
- [ ] Agregar eventos en servicios (contacto, oportunidad)
- [ ] Crear cron job de seguimientos

### Fase 2: Frontend
- [ ] Crear hook `useNotificaciones`
- [ ] Crear componente `NotificationBell`
- [ ] Crear página de notificaciones
- [ ] Integrar en layout
- [ ] Agregar toast de notificaciones
- [ ] Estilos y responsividad

### Fase 3: Electron
- [ ] Verificar Socket.IO en Electron
- [ ] Agregar notificaciones del SO
- [ ] Agregar sonido
- [ ] Testing en Electron

### Fase 4: Testing
- [ ] Crear 2 usuarios
- [ ] Probar creación de lead
- [ ] Probar cambio de etapa
- [ ] Probar en navegador
- [ ] Probar en Electron
- [ ] Verificar persistencia en BD

---

## 🚀 COMANDOS PARA EMPEZAR

```bash
# 1. Crear migración
npx prisma migrate dev --name add_notificaciones

# 2. Instalar Socket.IO
npm install socket.io socket.io-client

# 3. Reiniciar servicios
docker-compose -f docker-compose.dev.yml restart backend frontend

# 4. Ver logs
docker-compose -f docker-compose.dev.yml logs -f backend
```

---

## 💡 NOTAS IMPORTANTES

1. **Socket.IO funciona en Electron**: No necesita cambios especiales
2. **CORS ya está configurado**: Permite localhost
3. **Autenticación**: Usar JWT en Socket.IO handshake
4. **Persistencia**: Guardar notificaciones en BD para recuperarlas al reconectar
5. **Escalabilidad**: Socket.IO con Redis para múltiples servidores (futuro)

---

## 📈 IMPACTO DE LAS MEJORAS

### Antes
- ❌ No hay notificaciones
- ❌ Usuario debe refrescar para ver cambios
- ❌ No sabe si hay nuevos leads
- ❌ Experiencia lenta

### Después
- ✅ Notificaciones en tiempo real
- ✅ Cambios instantáneos
- ✅ Alertas de nuevos leads
- ✅ Experiencia moderna y rápida
- ✅ Funciona en Electron
- ✅ Competitivo con CRMs profesionales

---

**¿Listo para empezar? Comienza con la Hora 1: Infraestructura de Notificaciones**
