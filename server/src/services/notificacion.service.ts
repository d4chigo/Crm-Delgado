/**
 * Servicio de notificaciones por Email y WhatsApp
 * Permite notificar a clientes/leads cuando se agenda, actualiza o elimina una reunión
 */

interface DatosReunion {
  asunto: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  descripcion?: string;
  ubicacion?: string;
  enlaceCalendario?: string;
}

interface DatosContacto {
  nombre: string;
  correo?: string;
  telefono?: string;
}

/**
 * Enviar notificación de reunión agendada por email y WhatsApp
 */
export const notificarReunionAgendada = async (
  contacto: DatosContacto,
  reunion: DatosReunion
): Promise<void> => {
  console.log('📧 Notificando reunión agendada:');
  console.log('═══════════════════════════════════════');
  console.log(`Contacto: ${contacto.nombre}`);
  console.log(`Email: ${contacto.correo || 'No disponible'}`);
  console.log(`Teléfono: ${contacto.telefono || 'No disponible'}`);
  console.log('═══════════════════════════════════════');

  // Enviar email si hay correo
  if (contacto.correo) {
    await enviarEmailReunion(contacto, reunion, 'AGENDADA');
  }

  // Enviar WhatsApp si hay teléfono
  if (contacto.telefono) {
    await enviarWhatsAppReunion(contacto, reunion, 'AGENDADA');
  }

  // Si no hay contacto válido
  if (!contacto.correo && !contacto.telefono) {
    console.warn('⚠️  No hay correo ni teléfono disponible para notificar');
  }
};

/**
 * Enviar notificación de reunión actualizada por email y WhatsApp
 */
export const notificarReunionActualizada = async (
  contacto: DatosContacto,
  reunion: DatosReunion
): Promise<void> => {
  console.log('📧 Notificando reunión actualizada:');
  console.log('═══════════════════════════════════════');
  console.log(`Contacto: ${contacto.nombre}`);

  // Enviar email si hay correo
  if (contacto.correo) {
    await enviarEmailReunion(contacto, reunion, 'ACTUALIZADA');
  }

  // Enviar WhatsApp si hay teléfono
  if (contacto.telefono) {
    await enviarWhatsAppReunion(contacto, reunion, 'ACTUALIZADA');
  }
};

/**
 * Enviar notificación de reunión cancelada por email y WhatsApp
 */
export const notificarReunionCancelada = async (
  contacto: DatosContacto,
  reunion: DatosReunion
): Promise<void> => {
  console.log('📧 Notificando reunión cancelada:');
  console.log('═══════════════════════════════════════');
  console.log(`Contacto: ${contacto.nombre}`);

  // Enviar email si hay correo
  if (contacto.correo) {
    await enviarEmailReunion(contacto, reunion, 'CANCELADA');
  }

  // Enviar WhatsApp si hay teléfono
  if (contacto.telefono) {
    await enviarWhatsAppReunion(contacto, reunion, 'CANCELADA');
  }
};

/**
 * Enviar email de reunión
 * TODO: Integrar con SendGrid, AWS SES, Nodemailer, o similar
 */
async function enviarEmailReunion(
  contacto: DatosContacto,
  reunion: DatosReunion,
  estado: 'AGENDADA' | 'ACTUALIZADA' | 'CANCELADA'
): Promise<void> {
  const asunto = `Reunión ${estado.toLowerCase()}: ${reunion.asunto}`;
  
  let cuerpo = '';
  
  if (estado === 'AGENDADA') {
    cuerpo = `
Hola ${contacto.nombre},

¡Tu reunión ha sido agendada exitosamente!

📅 Detalles de la reunión:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Asunto: ${reunion.asunto}
Fecha: ${reunion.fecha}
Hora: ${reunion.horaInicio} - ${reunion.horaFin}
${reunion.ubicacion ? `Ubicación: ${reunion.ubicacion}` : ''}
${reunion.descripcion ? `Descripción: ${reunion.descripcion}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${reunion.enlaceCalendario ? `📱 Ver en Google Calendar: ${reunion.enlaceCalendario}\n` : ''}

Te pedimos que confirmes tu asistencia o comuniques si tienes alguna inconveniente.

Saludos cordiales,
Equipo Delgado Propiedades
`;
  } else if (estado === 'ACTUALIZADA') {
    cuerpo = `
Hola ${contacto.nombre},

Tu reunión ha sido actualizada con nueva información.

📅 Nuevos detalles:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Asunto: ${reunion.asunto}
Fecha: ${reunion.fecha}
Hora: ${reunion.horaInicio} - ${reunion.horaFin}
${reunion.ubicacion ? `Ubicación: ${reunion.ubicacion}` : ''}
${reunion.descripcion ? `Descripción: ${reunion.descripcion}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${reunion.enlaceCalendario ? `📱 Ver en Google Calendar: ${reunion.enlaceCalendario}\n` : ''}

Por favor, actualiza tu calendario con estos nuevos datos.

Saludos cordiales,
Equipo Delgado Propiedades
`;
  } else {
    cuerpo = `
Hola ${contacto.nombre},

Lamentamos informarte que la siguiente reunión ha sido cancelada:

📅 Reunión cancelada:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Asunto: ${reunion.asunto}
Fecha prevista: ${reunion.fecha}
Hora prevista: ${reunion.horaInicio} - ${reunion.horaFin}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Si tienes alguna duda o deseas reprogramar, por favor comunícate con nosotros.

Saludos cordiales,
Equipo Delgado Propiedades
`;
  }

  console.log('📧 Email simulado:');
  console.log(`Para: ${contacto.correo}`);
  console.log(`Asunto: ${asunto}`);
  console.log('─────────────────────────────────────────');
  console.log(cuerpo);
  console.log('─────────────────────────────────────────');

  // Intentar enviar con Gmail (GRATIS) si están configuradas las credenciales
  if (process.env.GMAIL_EMAIL && process.env.GMAIL_APP_PASSWORD) {
    try {
      const nodemailer = require('nodemailer');
      
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_EMAIL,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: process.env.GMAIL_EMAIL,
        to: contacto.correo,
        subject: asunto,
        text: cuerpo,
        html: `<pre style="font-family: Arial, sans-serif; font-size: 14px;">${cuerpo.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`,
      });

      console.log('✅ Email enviado por Gmail exitosamente');
    } catch (error: any) {
      console.warn('⚠️  Error enviando email por Gmail:', error.message);
    }
  } else {
    console.log('💡 Para enviar emails REALES, configura:');
    console.log('   1. GMAIL_EMAIL=tu@gmail.com');
    console.log('   2. GMAIL_APP_PASSWORD=contraseña_de_aplicacion');
    console.log('   Obtén la contraseña en: https://myaccount.google.com/apppasswords');
  }
  
  // Simular delay de envío
  await new Promise(resolve => setTimeout(resolve, 100));
}

/**
 * Enviar mensaje de WhatsApp
 * TODO: Integrar con Twilio, WhatsApp Business API, o similar
 */
async function enviarWhatsAppReunion(
  contacto: DatosContacto,
  reunion: DatosReunion,
  estado: 'AGENDADA' | 'ACTUALIZADA' | 'CANCELADA'
): Promise<void> {
  // Limpiar número de teléfono (remover espacios, guiones, etc.)
  const telefonoLimpio = (contacto.telefono || '').replace(/\D/g, '');
  
  if (telefonoLimpio.length < 7) {
    console.warn('⚠️  Número de teléfono inválido para WhatsApp:', contacto.telefono);
    return;
  }

  let mensaje = '';

  if (estado === 'AGENDADA') {
    mensaje = `¡Hola ${contacto.nombre}! 👋

Tu reunión ha sido agendada exitosamente en Delgado Propiedades.

📅 *Detalles:*
• Asunto: ${reunion.asunto}
• Fecha: ${reunion.fecha}
• Hora: ${reunion.horaInicio} - ${reunion.horaFin}
${reunion.ubicacion ? `• Ubicación: ${reunion.ubicacion}` : ''}

Por favor confirma tu asistencia.

¡Muchas gracias!`;
  } else if (estado === 'ACTUALIZADA') {
    mensaje = `¡Hola ${contacto.nombre}! 👋

Tu reunión ha sido *actualizada* con nueva información.

📅 *Nuevos detalles:*
• Asunto: ${reunion.asunto}
• Fecha: ${reunion.fecha}
• Hora: ${reunion.horaInicio} - ${reunion.horaFin}
${reunion.ubicacion ? `• Ubicación: ${reunion.ubicacion}` : ''}

Por favor actualiza tu calendario.`;
  } else {
    mensaje = `Hola ${contacto.nombre}, 

Lamentamos informarte que la reunión "${reunion.asunto}" programada para ${reunion.fecha} a las ${reunion.horaInicio} ha sido *cancelada*.

Si deseas reprogramar, por favor comunícate con nosotros.`;
  }

  console.log('💬 Mensaje de WhatsApp simulado:');
  console.log(`Para: +${telefonoLimpio}`);
  console.log('─────────────────────────────────────────');
  console.log(mensaje);
  console.log('─────────────────────────────────────────');

  // Opción 1: Enviar por Baileys (WhatsApp Web - GRATIS)
  // Requiere inicializar cliente Baileys al iniciar servidor
  const whatsappClient = (global as any).whatsappClient;
  if (whatsappClient && whatsappClient.isConnected) {
    try {
      const chatId = `${telefonoLimpio}@c.us`;
      await whatsappClient.sendMessage(chatId, mensaje);
      console.log('✅ Mensaje WhatsApp enviado por Baileys');
    } catch (error: any) {
      console.warn('⚠️  Error enviando WhatsApp por Baileys:', error.message);
      enviarPorIntegracionGratis(telefonoLimpio, mensaje);
    }
  } else {
    // Opción 2: Usar API HTTP gratuita (Twilio Free, etc.)
    enviarPorIntegracionGratis(telefonoLimpio, mensaje);
  }
  
  // Simular delay de envío
  await new Promise(resolve => setTimeout(resolve, 100));
}

/**
 * Enviar WhatsApp por integraciones gratuitas sin servidor local
 * Opciones:
 * 1. Usar texto que el usuario puede copiar/pegar
 * 2. Generar link wa.me para que el usuario envíe
 * 3. Usar webhook/API externa gratuita
 */
async function enviarPorIntegracionGratis(telefono: string, mensaje: string) {
  console.log('💡 Opciones para enviar WhatsApp GRATIS:');
  console.log('\n1️⃣  Link wa.me (Usuario copia y envía):');
  const urlWame = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
  console.log(`   ${urlWame}`);
  
  console.log('\n2️⃣  Para enviar automático (GRATIS):');
  console.log('   a) Instala Baileys: npm install whatsapp-web.js');
  console.log('   b) Configura cliente WebSocket');
  console.log('   c) El bot usará WhatsApp Web automáticamente');
  
  console.log('\n3️⃣  Texto para copiar/pegar al contacto:');
  console.log('─────────────────────────────────────────');
  console.log(mensaje);
  console.log('─────────────────────────────────────────');
}
