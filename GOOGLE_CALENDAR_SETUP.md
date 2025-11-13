# Configuración de Google Calendar en CRM Delgado

## Integración Completada

Se ha integrado Google Calendar API en el CRM para sincronizar y visualizar tus reuniones y eventos.

## Configuración Backend

### 1. Credenciales de Google Cloud

Las siguientes credenciales ya están configuradas en el servidor:

```
GOOGLE_CLIENT_ID=838585889230-rnm5poadts6ed6oodgvlmvqa1h6dc4eq.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:5000/api/calendar/callback
```

### 2. Agregar al `.env` del servidor

Copia las credenciales al archivo `server/.env`:

```env
# Google Calendar OAuth2
GOOGLE_CLIENT_ID=838585889230-rnm5poadts6ed6oodgvlmvqa1h6dc4eq.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:5000/api/calendar/callback
```

### 3. Dependencias instaladas

- ✅ `googleapis` - Cliente oficial de Google APIs para Node.js

## Arquitectura

### Backend (servidor)

**Controlador:** `server/src/controllers/calendar.controller.ts`
- `getAuthUrl` - Genera URL de autenticación OAuth2
- `handleCallback` - Procesa callback de Google y guarda tokens
- `getEvents` - Obtiene eventos del calendario del mes actual
- `getAuthStatus` - Verifica si el usuario está autenticado
- `logout` - Cierra sesión y elimina tokens

**Rutas:** `server/src/routes/calendar.routes.ts`
- `GET /api/calendar/auth-url` - Obtener URL de autorización
- `GET /api/calendar/callback` - Callback de OAuth2
- `GET /api/calendar/events` - Listar eventos
- `GET /api/calendar/auth-status` - Estado de autenticación
- `POST /api/calendar/logout` - Cerrar sesión

### Frontend (cliente)

**Servicio API:** `client/services/api/calendar.service.ts`
- Funciones tipo-seguras para comunicarse con el backend
- Interfaces de TypeScript para eventos y respuestas

**Página:** `client/app/dashboard/actividades/page.tsx`
- Vista de calendario con tarjetas de eventos
- Agrupación de eventos por día
- Botones de autenticación y sincronización
- Estados de carga y error

**Sidebar:** `client/app/dashboard/layout.tsx`
- Ruta "Actividades" agregada entre Reportes y Ayuda
- Ícono de Calendar (lucide-react)

## Flujo de Autenticación OAuth2

1. **Usuario hace clic en "Conectar con Google Calendar"**
   - Frontend solicita URL de autenticación al backend
   - Backend genera URL con scopes de solo lectura

2. **Usuario autoriza en Google**
   - Google redirige a `/api/calendar/callback?code=...`
   - Backend intercambia código por tokens de acceso

3. **Tokens almacenados**
   - Tokens guardados temporalmente en memoria del servidor
   - **Nota:** En producción, guardar en base de datos

4. **Frontend redirigido**
   - Usuario regresa a `/dashboard/actividades?auth=success`
   - Se cargan automáticamente los eventos

## Características Implementadas

### ✅ Visualización de Eventos

- **Agrupación por día** con badges de fecha
- **Tarjetas de evento** con:
  - Título y descripción
  - Hora de inicio y fin
  - Ubicación (si existe)
  - Número de participantes
  - Estado (Confirmado, Tentativo, etc.)
  - Link directo a Google Calendar

### ✅ Sincronización

- **Botón "Actualizar"** para recargar eventos
- **Carga automática** al autenticarse
- **Manejo de sesión expirada** con reautenticación

### ✅ Seguridad

- **OAuth2** con flujo estándar de Google
- **Scopes mínimos:** solo lectura de calendario
- **Tokens seguros:** no expuestos al cliente

### ✅ UX/UI

- **Estados visuales:** cargando, vacío, error
- **Diseño responsivo:** mobile, tablet, desktop
- **Colores de marca:** #FCBA00 y #303030
- **Iconografía:** lucide-react

## Configuración en Google Cloud Console

### Requisitos previos (ya configurados)

1. **Proyecto en Google Cloud Console**
   - Nombre: (tu proyecto)
   - ID del proyecto: (asociado a tu Client ID)

2. **APIs habilitadas**
   - ✅ Google Calendar API

3. **Pantalla de consentimiento OAuth**
   - Tipo: Externo o Interno
   - Scopes: `https://www.googleapis.com/auth/calendar.readonly`

4. **Credenciales OAuth 2.0**
   - ID de cliente: `838585889230-rnm5poadts6ed6oodgvlmvqa1h6dc4eq.apps.googleusercontent.com`
   - URI de redirección autorizada: `http://localhost:5000/api/calendar/callback`

### ⚠️ Para producción

Actualiza el URI de redirección en Google Cloud Console:
```
https://tu-dominio.com/api/calendar/callback
```

Y en el `.env`:
```env
GOOGLE_REDIRECT_URI=https://tu-dominio.com/api/calendar/callback
```

## Cómo Usar

### 1. Iniciar el backend

```bash
cd server
pnpm dev
```

Verifica que aparezca:
```
✅ Rutas registradas: .../api/calendar
```

### 2. Iniciar el frontend

```bash
cd client
pnpm dev
```

### 3. Navegar a Actividades

- Ir a Dashboard → Actividades (en el sidebar)
- O directamente: `http://localhost:3000/dashboard/actividades`

### 4. Conectar Google Calendar

- Clic en "Conectar con Google Calendar"
- Selecciona tu cuenta de Google
- Autoriza el acceso de solo lectura
- Serás redirigido de vuelta al CRM

### 5. Ver tus eventos

- Los eventos del mes actual se cargan automáticamente
- Agrupados por día con tarjetas visuales
- Actualiza con el botón "Actualizar"

## Próximas Mejoras Sugeridas

### Almacenamiento Persistente de Tokens
- [ ] Guardar tokens en base de datos (tabla `google_tokens`)
- [ ] Asociar tokens a usuarios específicos
- [ ] Refresh automático de tokens expirados

### Vista de Calendario Completa
- [ ] Selector de mes/año
- [ ] Vista tipo grid (7 días × semanas)
- [ ] Navegación mensual (anterior/siguiente)

### Filtros y Búsqueda
- [ ] Filtrar por estado (confirmado, tentativo)
- [ ] Buscar eventos por título
- [ ] Filtrar por proyecto/contacto

### Creación de Eventos
- [ ] Crear nuevos eventos desde el CRM
- [ ] Vincular eventos a leads/oportunidades
- [ ] Sincronización bidireccional

### Notificaciones
- [ ] Recordatorios de reuniones próximas
- [ ] Badge en sidebar con eventos de hoy
- [ ] Webhooks para actualizaciones en tiempo real

## Troubleshooting

### Error: "No autenticado"
- Haz clic en "Conectar con Google Calendar"
- Verifica que el backend esté corriendo
- Comprueba que las credenciales en `.env` sean correctas

### Error: "Token expirado"
- Haz clic en "Desconectar" y vuelve a conectar
- Los tokens de Google expiran después de 1 hora (sin refresh)

### Error: "Error obteniendo eventos"
- Verifica que Google Calendar API esté habilitada en Google Cloud Console
- Comprueba los logs del servidor para más detalles

### Redirect URI mismatch
- Asegúrate de que el URI de redirección en Google Cloud Console coincida exactamente con `GOOGLE_REDIRECT_URI` en `.env`
- Formato: `http://localhost:5000/api/calendar/callback` (sin trailing slash)

## Arquitectura de Datos

### Eventos de Google Calendar

```typescript
interface CalendarEvent {
  id: string;              // ID único del evento
  title: string;           // Título/resumen
  description: string;     // Descripción completa
  start: string;           // ISO 8601 fecha/hora inicio
  end: string;             // ISO 8601 fecha/hora fin
  location: string;        // Ubicación física o virtual
  attendees: string[];     // Array de emails de participantes
  htmlLink: string;        // Link directo a Google Calendar
  status: string;          // confirmed, tentative, cancelled
  colorId?: string;        // ID de color personalizado
}
```

### Respuestas del Backend

```typescript
// GET /api/calendar/events
{
  exito: true,
  datos: {
    events: CalendarEvent[]
  }
}

// GET /api/calendar/auth-status
{
  exito: true,
  datos: {
    authenticated: boolean
  }
}

// GET /api/calendar/auth-url
{
  exito: true,
  datos: {
    authUrl: string
  }
}
```

## Seguridad y Privacidad

- ✅ **Solo lectura:** El CRM no puede modificar ni eliminar eventos
- ✅ **Scopes mínimos:** Solo acceso a calendario, nada más
- ✅ **Tokens en servidor:** No expuestos al frontend
- ✅ **HTTPS en producción:** Obligatorio para OAuth2
- ⚠️ **Almacenamiento temporal:** Tokens en memoria (mejorar en producción)

## Stack Tecnológico

- **Backend:** Node.js + Express + TypeScript
- **Google API:** `googleapis` (cliente oficial)
- **Frontend:** Next.js 14 + React + TypeScript
- **UI:** Tailwind CSS + shadcn/ui + lucide-react
- **Autenticación:** OAuth 2.0 (Authorization Code Flow)

---

**Estado:** ✅ Integración completa y funcional
**Última actualización:** 24 de octubre, 2025
