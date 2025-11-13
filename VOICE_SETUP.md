# Configuración del Asistente de Voz en Electron

## Cambios Realizados

### Backend (servidor)
1. **WebSocket Server**: Se agregó un servidor WebSocket en `/api/voice` que actúa como proxy entre el frontend y Google Gemini Live API.
2. **Controlador de Voz**: `server/src/controllers/voice.controller.ts` maneja las sesiones de voz.
3. **Dependencias**: Se instaló `ws` para WebSockets.

### Frontend (cliente)
1. **Hook Refactorizado**: `client/hooks/useVoiceCall.ts` ahora se conecta al WebSocket del backend en lugar de cargar el SDK directamente.
2. **Sin Conflictos de Módulos**: Esto resuelve todos los problemas de resolución de módulos en Electron.

### Electron
1. **Permisos de Micrófono**: `app/main.js` configura automáticamente los permisos de micrófono y autoplay.

## Configuración Requerida

### 1. Variables de Entorno del Servidor

Crea `server/.env` con:

```env
# Puerto del servidor
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Clave API de Google Gemini (REQUERIDA para voz y chat)
SERVER_GEMINI_API_KEY=tu_clave_de_gemini_aqui

# Base de datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/crm_delgado"
```

### 2. Variables de Entorno del Cliente

Verifica que `client/.env.local` tenga:

```env
# URL del backend (para que WebSocket funcione)
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Pasos para Probar

### 1. Iniciar el Backend
```bash
cd server
pnpm dev
```

Deberías ver:
```
🚀 Servidor corriendo en http://localhost:5000
🎙️  WebSocket voice en ws://localhost:5000/api/voice
```

### 2. Iniciar el Frontend
```bash
cd client
pnpm dev
```

### 3. Iniciar Electron
```bash
cd app
npm start
```

### 4. Configurar Permisos en Windows

1. Abre **Configuración de Windows** → **Privacidad y seguridad** → **Micrófono**
2. Activa: "Permitir que las aplicaciones de escritorio accedan al micrófono"
3. Verifica que tu micrófono funciona en otra app (ej: Grabadora de voz)

### 5. Probar el Asistente de Voz

1. Navega a **Dashboard → Reportes**
2. Haz clic en el botón flotante del asistente (esquina inferior derecha)
3. Ve a la pestaña **"Llamada"**
4. Haz clic en el botón del micrófono
5. Deberías ver: "Estado: ESCUCHANDO"
6. Habla y observa la transcripción en tiempo real

## Troubleshooting

### Error: "WebSocket connection failed"
- Verifica que el servidor esté corriendo en el puerto 5000
- Revisa que `NEXT_PUBLIC_API_URL` apunte a `http://localhost:5000`

### Error: "Se necesita permiso para acceder al micrófono"
- Verifica los permisos de Windows (paso 4 arriba)
- Prueba en DevTools de Electron:
  ```js
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(() => console.log('OK mic'))
    .catch(e => console.error('FAIL', e.name, e.message))
  ```

### No se escucha el audio de respuesta
- Verifica que el volumen del sistema no esté silenciado
- El flag de autoplay ya está configurado en `app/main.js`

### Error: "AI not configured"
- Verifica que `SERVER_GEMINI_API_KEY` esté configurada en `server/.env`
- Reinicia el servidor backend

## Arquitectura

```
┌─────────────┐         WebSocket          ┌─────────────┐         SDK         ┌──────────────┐
│   Electron  │ ◄──────────────────────────► │   Backend   │ ◄──────────────────► │ Google Gemini│
│  (Cliente)  │   ws://localhost:5000/api/  │   (Node.js) │   @google/genai     │  Live API    │
│             │         voice                │             │                     │              │
└─────────────┘                              └─────────────┘                     └──────────────┘
      │                                             │
      │ getUserMedia()                              │ Prisma ORM
      │ Web Audio API                               │
      ▼                                             ▼
  ┌──────────┐                               ┌──────────┐
  │Micrófono │                               │PostgreSQL│
  │ Windows  │                               │    DB    │
  └──────────┘                               └──────────┘
```

## Ventajas de esta Arquitectura

1. **Sin Conflictos de Módulos**: El SDK solo se carga en Node.js, nunca en el navegador/Electron
2. **Seguridad**: La API key nunca se expone al cliente
3. **Compatible con Electron**: No hay problemas de CORS, resolución de módulos o permisos
4. **Escalable**: Puedes agregar autenticación, logging o rate limiting en el proxy
5. **Menos Dependencias en Cliente**: El frontend solo necesita WebSockets nativos

## Próximos Pasos Opcionales

- [ ] Agregar autenticación JWT al WebSocket
- [ ] Implementar reconexión automática si se cae el WebSocket
- [ ] Agregar indicador visual de calidad de conexión
- [ ] Cachear respuestas comunes para reducir latencia
- [ ] Implementar grabación de llamadas para auditoría
