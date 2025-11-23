/**
 * Servicio de WhatsApp
 * Envía mensajes a través de la API de WhatsApp Business
 */

interface DatosLead {
  nombre: string;
  apellido?: string;
  email: string;
  telefono: string;
  interes?: string;
  origen?: string;
  mensaje?: string;
}

/**
 * Enviar notificación por WhatsApp cuando llega un nuevo lead desde PGDP
 */
export const enviarWhatsAppNuevoLead = async (lead: DatosLead): Promise<void> => {
  try {
    const whatsappUrl = process.env.WHATSAPP_API_URL || '';
    const whatsappToken = process.env.WHATSAPP_API_TOKEN || '';
    const whatsappPhoneId = process.env.WHATSAPP_PHONE_ID || '';
    const whatsappReceiverPhone = process.env.WHATSAPP_RECEIVER_PHONE || '';

    // Si no hay configuración de WhatsApp, solo loguear
    if (!whatsappUrl || !whatsappToken || !whatsappPhoneId || !whatsappReceiverPhone) {
      console.log('⚠️  WhatsApp no configurado. Saltando notificación de nuevo lead.');
      return;
    }

    const nombreCompleto = lead.apellido ? `${lead.nombre} ${lead.apellido}` : lead.nombre;
    
    const whatsappMessage = `🔔 *NUEVO LEAD DESDE PGDP*\n\n` +
      `👤 *Nombre:* ${nombreCompleto}\n` +
      `📧 *Email:* ${lead.email}\n` +
      `📱 *Teléfono:* ${lead.telefono}\n` +
      `🎯 *Interés:* ${lead.interes || 'No especificado'}\n` +
      `📍 *Origen:* ${lead.origen || 'Página Web'}\n` +
      (lead.mensaje ? `💬 *Mensaje:* ${lead.mensaje}\n` : '') +
      `\n⏰ *Hora:* ${new Date().toLocaleString('es-PE')}`;

    const whatsappPayload = {
      messaging_product: 'whatsapp',
      to: whatsappReceiverPhone,
      type: 'text',
      text: {
        body: whatsappMessage
      }
    };

    const response = await fetch(`${whatsappUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${whatsappToken}`
      },
      body: JSON.stringify(whatsappPayload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error al enviar WhatsApp:', errorData);
      return;
    }

    const result = await response.json();
    console.log('✅ Notificación WhatsApp enviada al nuevo lead:', result);
  } catch (error) {
    console.error('❌ Error en enviarWhatsAppNuevoLead:', error);
    // No lanzar error para no interrumpir el flujo principal
  }
};

/**
 * Enviar mensaje de confirmación por WhatsApp al lead
 */
export const enviarWhatsAppConfirmacionLead = async (telefono: string, nombre: string): Promise<void> => {
  try {
    const whatsappUrl = process.env.WHATSAPP_API_URL || '';
    const whatsappToken = process.env.WHATSAPP_API_TOKEN || '';
    const whatsappPhoneId = process.env.WHATSAPP_PHONE_ID || '';

    if (!whatsappUrl || !whatsappToken || !whatsappPhoneId) {
      console.log('⚠️  WhatsApp no configurado. Saltando confirmación.');
      return;
    }

    // Formatear teléfono
    let formattedPhone = telefono.replace(/\D/g, '');
    if (formattedPhone.length === 9) {
      formattedPhone = `51${formattedPhone}`;
    }

    const whatsappMessage = `¡Hola ${nombre}! 👋\n\n` +
      `Gracias por tu interés en Delgado Propiedades. 🏠\n\n` +
      `Hemos recibido tu consulta y nos pondremos en contacto contigo pronto.\n\n` +
      `Si tienes alguna pregunta, no dudes en escribirnos. 😊`;

    const whatsappPayload = {
      messaging_product: 'whatsapp',
      to: formattedPhone,
      type: 'text',
      text: {
        body: whatsappMessage
      }
    };

    const response = await fetch(`${whatsappUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${whatsappToken}`
      },
      body: JSON.stringify(whatsappPayload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error al enviar confirmación WhatsApp:', errorData);
      return;
    }

    console.log('✅ Confirmación WhatsApp enviada al lead');
  } catch (error) {
    console.error('❌ Error en enviarWhatsAppConfirmacionLead:', error);
  }
};
