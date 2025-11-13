/**
 * Servicio de envío de correos (simulado)
 * En producción, integrar con SendGrid, AWS SES, o similar
 */

interface CorreoCredenciales {
  nombreCompleto: string;
  correo: string;
  password: string;
  urlPortal: string;
  esReseteo?: boolean;
}

export const enviarCorreoCredenciales = async (datos: CorreoCredenciales): Promise<void> => {
  const { nombreCompleto, correo, password, urlPortal, esReseteo = false } = datos;

  // TODO: En producción, integrar con servicio de correo real
  // Ejemplo con SendGrid:
  // await sgMail.send({ ... })

  console.log('📧 Correo simulado enviado:');
  console.log('═══════════════════════════════════════');
  console.log(`Para: ${correo}`);
  console.log(`Nombre: ${nombreCompleto}`);
  console.log(`Asunto: ${esReseteo ? 'Reseteo de contraseña' : 'Bienvenido al Portal'}`);
  console.log('═══════════════════════════════════════');
  console.log(`
Hola ${nombreCompleto},

${esReseteo 
  ? 'Tu contraseña ha sido reseteada.' 
  : '¡Bienvenido al portal de clientes de Delgado Propiedades!'
}

Tus credenciales de acceso son:

🔑 Usuario: ${correo}
🔐 Contraseña: ${password}

🌐 Ingresa aquí: ${urlPortal}

Por seguridad, te recomendamos cambiar tu contraseña después del primer ingreso.

---
Equipo Delgado Propiedades
  `);
  console.log('═══════════════════════════════════════');

  // Simular delay de envío
  await new Promise(resolve => setTimeout(resolve, 100));
};

/**
 * Enviar correo de bienvenida al portal
 */
export const enviarCorreoBienvenida = async (correo: string, nombre: string): Promise<void> => {
  console.log(`📧 Correo de bienvenida enviado a: ${correo} (${nombre})`);
  // TODO: Implementar plantilla de bienvenida
};

/**
 * Enviar notificación de nuevo documento
 */
export const enviarNotificacionDocumento = async (
  correo: string,
  nombreDocumento: string
): Promise<void> => {
  console.log(`📧 Notificación de documento "${nombreDocumento}" enviada a: ${correo}`);
  // TODO: Implementar
};
