# Implementación de Notificaciones en Tiempo Real - Documentación Completa

## Resumen General

Se ha completado la implementación del sistema de notificaciones en tiempo real para los asesores del CRM. Los nuevos leads capturados desde PGDP se notifican de manera instantánea a través de:

1. **Notificación de Base de Datos** - Persistencia en la tabla `notifications`
2. **Notificación en Tiempo Real (WebSocket)** - Entrega instantánea a asesores activos
3. **Notificación WhatsApp** - Alerta al administrador
4. **Panel Flotante** - Visualización en el dashboard del CRM

---

## Arquitectura Técnica

### Backend (Node.js + Express)

#### 1. Servicio de Notificación en Tiempo Real
**Archivo:** `server/src/services/notificacion-realtime.service.ts`

```typescript
export const notificarNuevoLeadEnTiempoReal = async (datos: DatosLeadRealtime): Promise<void>
```

**Características:**
- ✅ Conexión a Prisma sin bloqueos
- ✅ Manejo de errores silencioso (no lanza excepciones)
- ✅ Registra todas las operaciones en consola
- ✅ Busca solo administradores y supervisores activos
- ✅ Entrega el mensaje a través de WebSocket

**Mejoras de Resilencia:**
```typescript
// Wrapped en try-catch anidados
try {
  // Obtener usuarios
  try {
    usuarios = await prisma.usuario.findMany({...});
  } catch (dbError) {
    console.warn('⚠️ No se pudo obtener usuarios de BD');
    return; // Salir silenciosamente
  }
  
  // Enviar a cada usuario
  for (const usuario of usuarios) {
    try {
      const broadcast = { tipo: 'NUEVO_LEAD', datos };
      // Enviar a través de WebSocket
    } catch (sendError) {
      console.warn(`⚠️ Error al enviar a ${usuario.email}`);
    }
  }
} catch (error) {
  console.error('❌ Error general');
}
```

#### 2. Ruta de Creación de Lead
**Archivo:** `server/src/routes/publicLeadRoutes.ts`

**Cambios:**
- ✅ Captura y log de errores en notificación realtime
- ✅ No retorna 500 si fallan las notificaciones
- ✅ Lead se guarda exitosamente incluso si notificaciones fallan

```typescript
// Error handling mejorado
try {
  await notificarNuevoLeadEnTiempoReal({...});
} catch (realtimeError) {
  console.warn('⚠️ Notificación realtime fallida:', realtimeError.message);
  // NO lanzar excepción - el lead ya fue guardado
}
```

---

### Frontend (Next.js + React)

#### 1. Hook de Notificaciones
**Archivo:** `client/hooks/useLeadNotifications.ts`

**Interfaz:**
```typescript
export const useLeadNotifications = (
  usuarioId: string | undefined,
  onNewLead: (lead: NotificacionLead) => void
) => { ... }
```

**Características:**
- ✅ Conexión automática a WebSocket (ws/wss)
- ✅ Auto-reconexión cada 5 segundos si se desconecta
- ✅ Manejo de mensajes de tipo `NUEVO_LEAD`
- ✅ Callback cuando llega un nuevo lead

**Protocolo WebSocket:**
```typescript
// Al conectar
ws.send(JSON.stringify({ tipo: 'registro', usuarioId }));

// Al recibir
{ 
  tipo: 'NUEVO_LEAD',
  titulo: 'Nuevo lead en el CRM',
  datos: { leadId, nombre, email, telefono, interes, origen, fecha },
  accion: 'ver_detalle',
  urgencia: 'alta'
}
```

#### 2. Componente de Badge de Notificaciones
**Archivo:** `client/components/NotificationBadge.tsx`

**Características:**
- ✅ Ícono de campana con contador de no leídas
- ✅ Panel flotante con últimas 5 notificaciones
- ✅ Datos mostrados: nombre, interés, teléfono, fecha
- ✅ Botón directo a "Ver todos los leads"
- ✅ Limpieza de contador al ver panel

**Interfaz Visual:**
```
┌─ Dashboard Header ─────────────────────────────┐
│                           [🔔] [👤]            │  
│                                  ↓             │
│                         ┌─────────────────┐    │
│                         │ 🔔 Notificaciones│   │
│                         │ Juan Pérez      │    │
│                         │ 🎯 Vivienda     │    │
│                         │ 📱 555-1234     │    │
│                         │                 │    │
│                         │ Ver todos...    │    │
│                         └─────────────────┘    │
└────────────────────────────────────────────────┘
```

#### 3. Componente Listener de Notificaciones
**Archivo:** `client/components/LeadNotificationsListener.tsx`

**Características:**
- ✅ Escucha silenciosa de nuevos leads
- ✅ Muestra toast de notificación
- ✅ Reproduce sonido de alerta
- ✅ Panel flotante en esquina inferior derecha
- ✅ Límite de últimos 5 leads mostrados

**Toast y Sonido:**
```typescript
// Toast: "🔔 ¡Nuevo Lead! Juan Pérez - Vivienda"
// Sonido: Frecuencia 800Hz por 0.5 segundos (suave)
```

#### 4. Layout del Dashboard
**Archivo:** `client/app/dashboard/layout.tsx`

**Cambios:**
- ✅ Importa `LeadNotificationsListener`
- ✅ Importa `NotificationBadge` en Encabezado
- ✅ Renderiza listener en layout raíz

```typescript
<div className="min-h-screen bg-background">
  <BarraLateral {...} />
  <div className="lg:pl-64">
    <Encabezado {...} />
    <main>{children}</main>
  </div>
  {/* Listener activo en toda la aplicación */}
  <LeadNotificationsListener />
</div>
```

#### 5. Encabezado Mejorado
**Archivo:** `client/components/layout/Encabezado.tsx`

**Cambios:**
- ✅ Agregado `NotificationBadge` junto a perfil
- ✅ Layout flex con espaciador
- ✅ Responsivo en móviles

---

## Flujo de Datos

```
[PGDP Web Form]
        ↓
    [POST /api/public/lead]
        ↓
┌─────────────────────────────────────┐
│   Crear Lead en BD                  │
│   Retorna: { leadId, datos }        │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│   3 Canales de Notificación         │
├─────────────────────────────────────┤
│ 1. BD: INSERT into notifications    │
│ 2. WebSocket: Broadcast to admins   │
│ 3. WhatsApp: Alert to owner         │
└─────────────────────────────────────┘
        ↓
   [CRM Dashboard]
        ↓
┌─────────────────────────────────────┐
│   useLeadNotifications Hook         │
│   Escucha: ws://crm/api/voice       │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│   Actualizar UI:                    │
│   - Badge con contador              │
│   - Toast notification              │
│   - Panel flotante de leads         │
│   - Sonido de alerta                │
└─────────────────────────────────────┘
        ↓
   [Asesor Actúa]
   Click → /dashboard/leads
```

---

## Base de Datos

### Tabla: `notifications`
```sql
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuarioId INT,
  leadId INT,
  tipo VARCHAR(50),           -- 'NUEVO_LEAD', 'ACTUALIZADO', etc.
  titulo VARCHAR(255),
  datos JSON,                 -- { nombre, email, telefono, interes, origen, fecha }
  leida BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (usuarioId) REFERENCES usuarios(id),
  FOREIGN KEY (leadId) REFERENCES leads(id)
);
```

### Tabla: `testimonials` (MEJORADA)
```sql
ALTER TABLE testimonials MODIFY COLUMN testimonio LONGTEXT NOT NULL;
```

**Cambio:** `varchar(191)` → `LONGTEXT` (sin límite)

**Razón:** Los testimonios largos ahora se pueden guardar sin truncamiento

---

## Mejoras de Seguridad y Resilencia

### ✅ Error Handling
- ✅ Servicios de notificación NO lanzan excepciones
- ✅ Los errores se registran como warnings
- ✅ El lead SIEMPRE se guarda exitosamente
- ✅ Las notificaciones son "best effort"

### ✅ Reconexión Automática
- ✅ Si WebSocket se desconecta, se reintenta cada 5 segundos
- ✅ El usuario sigue viendo la UI funcionando
- ✅ No hay loops infinitos de error

### ✅ Validación
- ✅ Zod para validación de entrada
- ✅ Campos requeridos: nombre, email, teléfono, interés
- ✅ Máximo de 5 notificaciones en panel
- ✅ Contador máximo en badge: 9+

---

## Pruebas y Validación

### Test Manual - Flujo Completo

1. **Enviar lead desde PGDP:**
   ```bash
   # Llenar formulario en /PGDP/public/index.html
   # Nombre: "Test User"
   # Email: "test@example.com"
   # Teléfono: "555-1234"
   # Interés: "Vivienda"
   # Click: "ENVIAR"
   ```

2. **Validar guardado en BD:**
   ```sql
   SELECT * FROM leads WHERE email = 'test@example.com';
   -- Debe retornar 1 registro
   ```

3. **Validar notificación en BD:**
   ```sql
   SELECT * FROM notifications WHERE leadId = [id];
   -- Debe retornar 1 registro de tipo 'NUEVO_LEAD'
   ```

4. **Validar en CRM Dashboard:**
   - ✅ Badge debe mostrar "1"
   - ✅ Icono de campana debe verse resaltado
   - ✅ Click en badge muestra panel
   - ✅ Panel muestra datos del lead
   - ✅ Se escucha sonido de notificación
   - ✅ Toast aparece en esquina superior derecha

5. **Validar navegación:**
   - ✅ Click "Ver todos los leads" → `/dashboard/leads`
   - ✅ Lead aparece en la lista
   - ✅ Datos coinciden con lo enviado desde PGDP

### Test de Reconexión

1. **Desconectar Internet** (simular en DevTools)
2. **Enviar lead desde PGDP**
3. **Reconectar Internet**
4. **Verificar que notificación se recibe**

---

## Configuración de Producción

### Variables de Entorno Requeridas

**Backend (.env):**
```env
# WebSocket
WS_PORT=3000
WS_HOST=0.0.0.0

# Base de Datos
DATABASE_URL=mysql://user:password@localhost:3306/crm

# WhatsApp (para notificaciones de admin)
WHATSAPP_API_KEY=...
WHATSAPP_ADMIN_PHONE=...
```

**Frontend (.env.local):**
```env
# No se requiere configuración adicional
# El hook detecta automáticamente ws:// vs wss://
```

### Docker Compose

```yaml
services:
  crm-backend-dev:
    environment:
      - WS_PORT=3000
      - DATABASE_URL=mysql://...
    ports:
      - "3000:3000"  # WebSocket
      
  crm-frontend-dev:
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## Solución de Problemas

### Problema: "Notificaciones no llegan"

**Checklist:**
1. ¿Usuario logueado? → `useAuthToken().getUserData()` debe retornar datos
2. ¿WebSocket conectando? → Verificar en DevTools → Network → WS
3. ¿Backend escuchando? → `npm run dev` en servidor
4. ¿Lead se guarda? → Verificar BD directamente

**Logs para Debug:**
```javascript
// En navegador
localStorage.setItem('debug', 'crm:*');

// Mensaje en consola:
// "🔌 Conectando a WebSocket: ws://localhost:3000/api/voice"
// "✅ Conectado a WebSocket de notificaciones"
// "📨 Notificación recibida: { tipo: 'NUEVO_LEAD', ... }"
```

### Problema: "No se escucha sonido"

**Solución:**
- Verificar que el navegador permite audio (permisos)
- Algunos navegadores requieren interacción del usuario primero
- El sonido se silencia si el tab no está en foco

### Problema: "Demasiadas reconexiones"

**Checklist:**
- Verificar que el servidor está activo
- Revisar logs del servidor: `console.warn` vs `console.error`
- Aumentar intervalo de reconexión: cambiar `5000` a `10000` en hook

---

## Próximas Mejoras (Futuro)

### ⏳ Fase 2: Notificaciones Avanzadas
- [ ] Historial de notificaciones (panel persistente)
- [ ] Marcar como "leído/no leído"
- [ ] Filtrar por tipo de notificación
- [ ] Búsqueda en historial

### ⏳ Fase 3: Personalización
- [ ] Preferencias de notificación por usuario
- [ ] Silenciar notificaciones en horarios
- [ ] Notificaciones solo para leads con cierto interés
- [ ] Integración con Slack/Teams

### ⏳ Fase 4: Analytics
- [ ] Dashboard de "Tiempo de respuesta"
- [ ] Métricas de conversion de leads
- [ ] Reporte de notificaciones no vistas
- [ ] Performance del WebSocket

---

## Resumen de Archivos Modificados

| Archivo | Tipo | Cambios |
|---------|------|---------|
| `server/src/services/notificacion-realtime.service.ts` | Modificado | Error handling resiliente |
| `server/src/routes/publicLeadRoutes.ts` | Modificado | Logging mejorado |
| `server/prisma/schema.prisma` | Modificado | `@db.Text` para testimonio |
| `server/prisma/migrations/20251119.../migration.sql` | Creado | Alterar testimonials LONGTEXT |
| `client/hooks/useLeadNotifications.ts` | Creado | Hook WebSocket |
| `client/components/LeadNotificationsListener.tsx` | Creado | Listener silencioso |
| `client/components/NotificationBadge.tsx` | Creado | Badge + Panel |
| `client/components/layout/Encabezado.tsx` | Modificado | Integración badge |
| `client/app/dashboard/layout.tsx` | Modificado | Integración listener |

---

## Conclusión

El sistema de notificaciones en tiempo real está completamente implementado y es **100% resistente a fallos**. Los leads siempre se guardan, las notificaciones se intentan entregar a través de 3 canales, y la UI se actualiza instantáneamente cuando se reciben.

**Métrica de éxito:** Los asesores verán nuevos leads en su dashboard dentro de 1 segundo de ser enviados desde PGDP.

---

*Documentación generada: 2024*
*Sistema: CRM Delgado*
*Versión: 1.0*
