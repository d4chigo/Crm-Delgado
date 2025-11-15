# Guía Rápida: Activar Notificaciones GRATIS (5 minutos)

## 🚀 Opción Más Rápida: Gmail + wa.me

### Paso 1: Configurar Gmail (3 minutos)

#### 1.1 Obtener contraseña de app:
1. Abre: https://myaccount.google.com/apppasswords
2. Asegúrate que tienes 2FA activado (si no, actívalo primero)
3. Selecciona "Mail" en el dropdown
4. Selecciona "Windows Computer"
5. Google te mostrará una contraseña de 16 caracteres
6. **Cópiala** (sin espacios)

#### 1.2 Agregar a .env:
Abre el archivo `.env` en la raíz del proyecto y agrega:

```env
GMAIL_EMAIL=tu_correo@gmail.com
GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx
```

**Importante:** Reemplaza:
- `tu_correo@gmail.com` → Tu correo de Gmail
- `xxxxxxxxxxxxxxxx` → La contraseña de 16 caracteres que copiaste

#### 1.3 Instalar dependencia:
```bash
cd server
npm install nodemailer
```

**Listo!** Los emails ahora se enviarán automáticamente.

---

### Paso 2: WhatsApp (2 minutos)

**Opción A: Link wa.me (SIN hacer nada)**
- Ya está funcionando
- En los logs verás links como: `https://wa.me/51912345678?text=...`
- El usuario hace click y WhatsApp se abre automáticamente

**Opción B: Automático con Baileys (Opcional - 15 min)**

Si quieres que los mensajes se envíen automáticamente sin intervención del usuario:

```bash
cd server
npm install whatsapp-web.js qrcode
```

Luego crea archivo `server/src/whatsapp-bot.ts`:
```typescript
import { Client } from 'whatsapp-web.js';

const client = new Client();

client.on('qr', (qr: string) => {
  console.log('\n📱 Escanea este código QR con tu teléfono:');
  console.log(qr);
});

client.on('ready', () => {
  console.log('✅ Bot de WhatsApp conectado!');
  (global as any).whatsappClient = client;
});

client.initialize();
export default client;
```

Y en `server/src/index.ts` agrega al inicio:
```typescript
import './whatsapp-bot';
```

Luego reinicia el servidor y escanea el código QR con tu teléfono.

---

## ✅ Verificar que Funciona

### 1. Reinicia el servidor:
```bash
npm run dev
```

### 2. Agenda una reunión desde un lead/cliente:
- Abre el CRM
- Ve a un lead o cliente
- Abre el diálogo de agendar
- Completa los datos
- Haz click en "Agendar"

### 3. Mira los logs:
Deberías ver algo como:

**Para Email:**
```
📧 Email enviado por Gmail exitosamente
Para: cliente@example.com
Asunto: Reunión agendada: Visita a propiedad
```

**Para WhatsApp:**
```
💬 Mensaje de WhatsApp simulado:
Para: +51912345678
💡 Opciones para enviar WhatsApp GRATIS:
1️⃣ Link wa.me (Usuario copia y envía):
https://wa.me/51912345678?text=...
```

---

## 🔧 Solucionar Problemas

### El email NO se envía
**Problema:** Error de autenticación
**Solución:** 
- Revisa que copiaste la contraseña completa (16 caracteres)
- Asegúrate que tienes 2FA activado en Google
- Reinicia el servidor

### El email dice "contraseña incorrecta"
**Solución:**
- La contraseña de app debe tener exactamente 16 caracteres
- No pueden haber espacios
- Debe ser de un email con Google Authenticator o SMS 2FA

### WhatsApp no envía nada
**Solución:**
- Si usas wa.me: Solo verás el link, es normal
- Si instalaste Baileys: Escanea el código QR
- Si sigue sin funcionar, revisa los logs para errores

---

## 📊 Comparativa de Opciones

| Feature | Gmail | wa.me | Baileys |
|---------|-------|-------|---------|
| **Precio** | Gratis | Gratis | Gratis |
| **Configuración** | 3 min | 0 min | 15 min |
| **Envío automático** | ✅ Sí | ❌ No | ✅ Sí |
| **Mensajes/mes** | Ilimitados | N/A | Ilimitados |
| **Confiabilidad** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Recomendado** | ✅ **SÍ** | ✅ **SÍ** | 🟡 Opcional |

---

## 💡 Recomendación

**Para empezar ahora:**
1. Configura Gmail (5 minutos)
2. Usa wa.me links (automático)
3. Si después quieres, instala Baileys (15 minutos)

**Costo total: $0 ✅**

---

## 📝 Checklist

- [ ] Obtuve contraseña de app de Google
- [ ] Agregué GMAIL_EMAIL a .env
- [ ] Agregué GMAIL_APP_PASSWORD a .env
- [ ] Instalé nodemailer (`npm install nodemailer`)
- [ ] Reinicié el servidor
- [ ] Probé agendando una reunión
- [ ] Ví el email en los logs
- [ ] ✅ ¡Listo! Los emails funcionan

---

## 🆘 ¿Problemas?

Si algo no funciona, revisa:
1. Los logs del servidor (busca "Email enviado" o "Error")
2. Que el .env tenga las variables correctas
3. Que reiniciaste el servidor después de cambiar .env
4. Que la contraseña de app tiene 16 caracteres sin espacios

---

## 🎉 Siguientes Pasos

Una vez que Gmail funciona:
- [ ] Personaliza las plantillas de email
- [ ] Agrega logo de empresa
- [ ] Instala Baileys para WhatsApp automático
- [ ] Considera migrar a SendGrid en el futuro (si quieres estadísticas)

**¡Listo! Tu sistema de notificaciones está funcionando GRATIS!** 🚀
