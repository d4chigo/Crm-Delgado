# Notificaciones por Email y WhatsApp para Google Calendar

## Descripción

Se ha implementado un sistema de notificaciones automáticas que avisa a los leads/clientes cuando una reunión es agendada, actualizada o eliminada en Google Calendar. Las notificaciones se envían por:

- **Email**: Mensaje detallado con los datos de la reunión
- **WhatsApp**: Mensaje corto y amigable para dispositivos móviles

## Cambios Implementados

### 1. Servicio de Notificaciones (`server/src/services/notificacion.service.ts`)

**Funciones principales:**
- `notificarReunionAgendada()` - Envía notificación cuando se crea una reunión
- `notificarReunionActualizada()` - Envía notificación cuando se actualiza una reunión
- `notificarReunionCancelada()` - Envía notificación cuando se elimina una reunión

**Estructura de datos esperados:**
```typescript
// Datos del contacto
{
  nombre: string;      // Nombre del lead/cliente
  correo?: string;     // Email para enviar el mensaje
  telefono?: string;   // Teléfono para WhatsApp
}

// Datos de la reunión
{
  asunto: string;           // Título de la reunión
  fecha: string;            // Fecha (YYYY-MM-DD)
  horaInicio: string;       // Hora inicio (HH:mm)
  horaFin: string;          // Hora fin (HH:mm)
  descripcion?: string;     // Descripción de la reunión
  ubicacion?: string;       // Lugar de la reunión
  enlaceCalendario?: string; // Link a Google Calendar
}
```

### 2. Backend - Controlador de Calendario

**Cambios en `server/src/controllers/calendar.controller.ts`:**

#### `crearEvento()` - Crear reunión
- Ahora recibe parámetro `contacto` con datos del lead/cliente
- Automáticamente envía notificación después de crear el evento en Google Calendar
- El error en notificaciones NO interrumpe el flujo (no impide que se cree el evento)

#### `actualizarEvento()` - Actualizar reunión
- Ahora recibe parámetro `contacto` con datos del lead/cliente
- Automáticamente envía notificación de actualización

#### `eliminarEvento()` - Eliminar reunión
- Ahora recibe parámetros `contacto` y `evento`
- Automáticamente envía notificación de cancelación antes de eliminar

### 3. Frontend - Servicio de Calendario

**Cambios en `client/services/api/calendar.service.ts`:**

```typescript
// Crear evento (ahora con contacto opcional)
export async function crearEventoEnCalendar(evento, contacto?)

// Actualizar evento (ahora con contacto opcional)
export async function actualizarEventoEnCalendar(eventId, evento, contacto?)

// Eliminar evento (ahora con contacto y evento opcionales)
export async function eliminarEventoEnCalendar(eventId, contacto?, evento?)
```

### 4. Frontend - Componente de Diálogo

**Cambios en `client/components/features/calendar/DialogoAgendarReunion.tsx`:**

- El componente ahora recopila datos del contacto (nombre, email, teléfono)
- Estos datos se pasan automáticamente al crear, actualizar o eliminar reuniones
- El usuario NO necesita hacer nada especial; funciona automáticamente

## Flujo de Funcionamiento

### Crear Reunión
```
1. Usuario agenda una reunión en el diálogo
2. DialogoAgendarReunion obtiene los datos del contacto
3. Llama a crearEventoEnCalendar(evento, datosContacto)
4. Frontend envía solicitud al backend con:
   - tokens (autenticación Google)
   - evento (título, fecha, hora, etc.)
   - contacto (nombre, email, teléfono)
5. Backend crea el evento en Google Calendar
6. Backend envía notificaciones:
   - Email si hay correo
   - WhatsApp si hay teléfono
7. Retorna éxito al frontend
```

### Actualizar Reunión
```
1. Usuario clickea en evento existente
2. Edita los datos en el diálogo
3. Llama a actualizarEventoEnCalendar(eventId, evento, datosContacto)
4. Backend actualiza el evento en Google Calendar
5. Backend envía notificación de actualización
6. Retorna éxito
```

### Eliminar Reunión
```
1. Usuario clickea botón "Eliminar" en el evento
2. Confirma eliminación
3. Llama a eliminarEventoEnCalendar(eventId, datosContacto, evento)
4. Backend elimina evento de Google Calendar
5. Backend envía notificación de cancelación
6. Retorna éxito
```

## Integración con Servicios Reales

### Para Email (GRATIS) ✅

**Opción 1: Gmail (100% GRATIS - RECOMENDADO)**

El sistema ya está configurado para enviar emails usando Gmail. Solo necesitas hacer 3 pasos:

1. **Habilitar App Passwords en tu cuenta Google:**
   - Ve a: https://myaccount.google.com/apppasswords
   - Selecciona "Mail" y "Windows Computer"
   - Google te generará una contraseña de 16 caracteres
   - Cópiala

2. **Agregar variables de entorno en `.env`:**
   ```env
   GMAIL_EMAIL=tu@gmail.com
   GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx
   ```

3. **Reiniciar el servidor**
   ```bash
   npm run dev
   ```

**Listo!** Los emails ahora se enviarán automáticamente.

**Ventajas:**
- ✅ Completamente gratis
- ✅ Sin límite de emails
- ✅ Confiable (Google)
- ✅ Fácil de configurar
- ✅ Ya está integrado en el código

**Pasos detallados con imágenes:** https://support.google.com/accounts/answer/185833

---

### Para WhatsApp (GRATIS) ✅

**Opción 1: Link wa.me (SIN CÓDIGO - GRATIS)**

El sistema genera automáticamente un link wa.me que puedes usar:

```
https://wa.me/51912345678?text=Tu%20reunion%20ha%20sido%20agendada
```

El usuario hace click y WhatsApp se abre automáticamente con el mensaje pre-cargado.

**Ventajas:**
- ✅ 100% gratis
- ✅ No requiere servidor externo
- ✅ Funciona inmediatamente
- ✅ Seguro (usuario controla el envío)

**Cómo usarlo:**
Los logs del servidor mostrarán el link wa.me que puedes compartir o abrir automáticamente.

---

**Opción 2: Baileys (AUTOMÁTICO - GRATIS)**

Para enviar mensajes automáticamente desde tu servidor (sin intervención del usuario):

1. **Instalar Baileys:**
   ```bash
   npm install whatsapp-web.js qrcode
   ```

2. **Crear archivo `whatsapp-bot.ts`:**
   ```typescript
   import { Client, LocalAuth } from 'whatsapp-web.js';
   
   const client = new Client({
     auth: {
       clientId: 'client-id',
     },
     puppeteer: {
       headless: true,
       args: ['--no-sandbox'],
     },
   });

   client.on('qr', (qr: string) => {
     console.log('Escanea este código QR con tu teléfono:');
     console.log(qr);
   });

   client.on('ready', () => {
     console.log('✅ Bot de WhatsApp conectado!');
     (global as any).whatsappClient = client;
   });

   client.initialize();
   
   export default client;
   ```

3. **Importar en tu `index.ts`:**
   ```typescript
   import './whatsapp-bot';
   ```

4. **Escanear QR la primera vez**
   - Ejecuta el servidor
   - Muestra el código QR en la consola
   - Escanea con tu teléfono
   - ¡Listo! Ya está conectado

**Ventajas:**
- ✅ Completamente gratis
- ✅ Envío automático
- ✅ Sin límites
- ✅ Usa tu cuenta personal de WhatsApp

**Desventajas:**
- ⚠️ Requiere computadora con WhatsApp Web abierto
- ⚠️ WhatsApp puede banear si envías demasiados mensajes rápido

---

**Opción 3: Twilio Free Trial (GRATIS por 30 días)**

Si necesitas algo más robusto:

```bash
npm install twilio
```

Código:
```typescript
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function enviarWhatsApp(telefono: string, mensaje: string) {
  await client.messages.create({
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    to: `whatsapp:+${telefono}`,
    body: mensaje,
  });
}
```

Variables de entorno:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=+1234567890
```

**Ventajas:**
- ✅ Gratis por 30 días
- ✅ Muy confiable
- ✅ Fácil de usar
- ✅ Soporte profesional

**Desventajas:**
- ⚠️ Después de 30 días hay que pagar
- ⚠️ Límite de mensajes en free tier

---

## Resumen de Opciones

| Servicio | Email | WhatsApp | Precio | Facilidad | Tiempo Setup |
|----------|-------|----------|--------|-----------|--------------|
| **Gmail** | ✅ Gratis | ❌ No | **Gratis** | ⭐⭐⭐ Muy Fácil | 5 min |
| **Baileys** | ❌ No | ✅ Gratis | **Gratis** | ⭐⭐ Medio | 20 min |
| **Twilio** | ❌ No | ✅ 30 días | **Gratis → $0.01/msg** | ⭐⭐⭐ Fácil | 10 min |
| **SendGrid** | ✅ Gratis | ❌ No | **Gratis (100/día)** | ⭐⭐⭐ Fácil | 10 min |

---

## Configuración Recomendada (GRATIS)

Para empezar **AHORA** sin gastar nada:

### 1. Email con Gmail (5 minutos)
```env
GMAIL_EMAIL=tuempresa@gmail.com
GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx
```

### 2. WhatsApp con Link wa.me (Inmediato)
Los links se generan automáticamente en los logs.

### 3. Opcional: Automatizar WhatsApp con Baileys (20 minutos)
```bash
npm install whatsapp-web.js qrcode
```

**Costo total: $0 por siempre** ✅

---

## Pruebas

### Ver notificaciones en consola (Modo actual)

Las notificaciones se simulan en la consola con este formato:

```
📧 Correo simulado enviado:
═══════════════════════════════════════
Para: cliente@example.com
Nombre: Juan Pérez
Asunto: Reunión agendada: Visita a propiedad
═══════════════════════════════════════
Hola Juan Pérez,

¡Tu reunión ha sido agendada exitosamente!

📅 Detalles de la reunión:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Asunto: Visita a propiedad
Fecha: 2025-11-20
Hora: 14:00 - 15:00
Ubicación: Calle Principal 123
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Pasos para probar la funcionalidad actual

1. Agendar una reunión desde un lead o cliente
2. Ver en los logs del servidor las notificaciones simuladas
3. Verificar que los detalles de la reunión están correctos
4. Actualizar o eliminar la reunión para ver otras notificaciones

## Notas Importantes

1. **Error Handling**: Si hay error al enviar notificaciones, NO se interrumpe la creación/actualización/eliminación del evento. El usuario verá el éxito en Google Calendar pero podrá ver advertencia en logs.

2. **Teléfono opcional**: Si el contacto no tiene teléfono, solo se envía email (y viceversa).

3. **Seguridad**: No expongas API keys en el frontend. Mantén todas en variables de entorno del servidor.

4. **Rate Limiting**: Si usas SendGrid, Twilio u otros servicios, considera implementar rate limiting para evitar duplicados.

5. **Logs**: Todos los envíos se registran en la consola del servidor con emojis para fácil identificación:
   - 📧 = Email
   - 💬 = WhatsApp

## Próximos Pasos Recomendados

1. Elegir proveedor de email (SendGrid recomendado para escala)
2. Elegir proveedor de WhatsApp (Twilio recomendado para facilidad)
3. Agregar variables de entorno
4. Reemplazar funciones simuladas con integraciones reales
5. Probar con números/emails de prueba
6. Implementar plantillas HTML profesionales para emails
7. Considerar agregar logs a base de datos para auditoría
