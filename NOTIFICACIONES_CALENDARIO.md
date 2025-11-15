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

### Para Email

Actualmente, las notificaciones están **simuladas** en la consola. Para integrar con un servicio real, reemplaza la función `enviarEmailReunion()` en `notificacion.service.ts`:

#### Opción 1: SendGrid (Recomendado)
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

async function enviarEmailReunion(contacto, reunion, estado) {
  const msg = {
    to: contacto.correo,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject: `Reunión ${estado.toLowerCase()}: ${reunion.asunto}`,
    html: generarHTMLEmail(contacto, reunion, estado), // Crear función auxiliar
  };
  await sgMail.send(msg);
}
```

#### Opción 2: AWS SES
```typescript
import AWS from 'aws-sdk';

const ses = new AWS.SES({ region: 'us-east-1' });

async function enviarEmailReunion(contacto, reunion, estado) {
  const params = {
    Source: process.env.AWS_SES_FROM_EMAIL!,
    Destination: { ToAddresses: [contacto.correo] },
    Message: {
      Subject: { Data: `Reunión ${estado.toLowerCase()}: ${reunion.asunto}` },
      Body: { Html: { Data: generarHTMLEmail(contacto, reunion, estado) } },
    },
  };
  await ses.sendEmail(params).promise();
}
```

#### Opción 3: Nodemailer (Para SMTP genérico)
```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT!),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function enviarEmailReunion(contacto, reunion, estado) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM_EMAIL,
    to: contacto.correo,
    subject: `Reunión ${estado.toLowerCase()}: ${reunion.asunto}`,
    html: generarHTMLEmail(contacto, reunion, estado),
  });
}
```

### Para WhatsApp

Actualmente, las notificaciones están **simuladas** en la consola. Para integrar con un servicio real:

#### Opción 1: Twilio (Recomendado)
```typescript
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function enviarWhatsAppReunion(contacto, reunion, estado) {
  const mensaje = generarMensajeWhatsApp(contacto, reunion, estado);
  
  await client.messages.create({
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    to: `whatsapp:+${telefonoLimpio}`,
    body: mensaje,
  });
}
```

#### Opción 2: WhatsApp Business API (Official)
```typescript
async function enviarWhatsAppReunion(contacto, reunion, estado) {
  const mensaje = generarMensajeWhatsApp(contacto, reunion, estado);
  
  const response = await fetch('https://graph.instagram.com/v18.0/YOUR_PHONE_NUMBER_ID/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: telefonoLimpio,
      type: 'text',
      text: { body: mensaje },
    }),
  });
  
  return response.json();
}
```

#### Opción 3: Baileys (WhatsApp Web - No oficial)
```typescript
import { Client } from 'whatsapp-web.js';

const client = new Client();

async function enviarWhatsAppReunion(contacto, reunion, estado) {
  const mensaje = generarMensajeWhatsApp(contacto, reunion, estado);
  const chatId = `${telefonoLimpio}@c.us`;
  
  await client.sendMessage(chatId, mensaje);
}
```

## Variables de Entorno Requeridas

Agrega estas variables a tu `.env`:

```env
# SendGrid
SENDGRID_API_KEY=sk_test_xxxxx
SENDGRID_FROM_EMAIL=noreply@delgadopropiedades.com

# AWS SES
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_SES_FROM_EMAIL=noreply@delgadopropiedades.com

# SMTP genérico
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@delgadopropiedades.com

# Twilio
TWILIO_ACCOUNT_SID=ACxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_WHATSAPP_NUMBER=+1234567890

# WhatsApp Business API
WHATSAPP_API_TOKEN=EAAxxxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=1234567890
```

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
