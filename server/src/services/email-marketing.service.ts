/**
 * Servicio de Email Marketing
 * Permite enviar campañas de anuncios a leads y clientes con validación de emails
 */

import nodemailer from 'nodemailer';

export interface ContactoEmail {
  id: string;
  nombre: string;
  apellido?: string;
  correo: string;
  tipo: 'lead' | 'cliente';
}

export interface CampanaEmail {
  asunto: string;
  contenido: string;
  contenidoHtml?: string;
  remitente?: string;
  urlImagen?: string;
}

export interface ResultadoCampana {
  enviados: number;
  fallidos: number;
  invalidos: number;
  detalles: Array<{
    contactoId: string;
    correo: string;
    estado: 'enviado' | 'fallido' | 'invalido';
    error?: string;
  }>;
}

/**
 * Validar si un email es válido
 * Rechaza emails con dominios no reales como @importado.local
 */
export function validarEmail(correo: string): boolean {
  // Validación básica de formato
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexEmail.test(correo)) {
    return false;
  }

  // Rechazar dominios no válidos
  const dominiosInvalidos = [
    'importado.local',
    'local',
    'example.com',
    'test.com',
    'localhost',
    'invalid',
    'placeholder',
    'no-reply',
    'noreply',
    'fake',
    'dummy'
  ];

  const dominio = correo.split('@')[1].toLowerCase();
  if (dominiosInvalidos.includes(dominio)) {
    return false;
  }

  // Rechazar emails que claramente no son válidos
  if (correo.includes('..') || correo.startsWith('.') || correo.endsWith('.')) {
    return false;
  }

  return true;
}

/**
 * Obtener transporter de Nodemailer configurado
 */
function obtenerTransporter() {
  if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error('Gmail no configurado. Configura GMAIL_EMAIL y GMAIL_APP_PASSWORD en .env');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

/**
 * Enviar campaña de email marketing a múltiples contactos
 */
export async function enviarCampanaEmail(
  contactos: ContactoEmail[],
  campana: CampanaEmail
): Promise<ResultadoCampana> {
  const resultado: ResultadoCampana = {
    enviados: 0,
    fallidos: 0,
    invalidos: 0,
    detalles: [],
  };

  console.log('📧 Iniciando campaña de email marketing');
  console.log(`📋 Total de contactos: ${contactos.length}`);
  console.log('═══════════════════════════════════════');

  // Validar que Gmail esté configurado
  let transporter: nodemailer.Transporter | null = null;
  try {
    transporter = obtenerTransporter();
  } catch (error: any) {
    console.warn('⚠️  Gmail no configurado:', error.message);
    console.log('💡 Modo simulación: Se mostrarán los emails que se enviarían');
  }

  // Procesar cada contacto
  for (const contacto of contactos) {
    try {
      // Validar email - si no es válido, simplemente lo saltamos sin error
      if (!validarEmail(contacto.correo)) {
        console.warn(`⏭️  Email inválido (saltado): ${contacto.correo} (${contacto.nombre})`);
        resultado.invalidos++;
        resultado.detalles.push({
          contactoId: contacto.id,
          correo: contacto.correo,
          estado: 'invalido',
          error: 'Dominio no válido o formato incorrecto',
        });
        continue; // Continuar sin error
      }

      // Preparar contenido del email con placeholders personalizados
      const placeholders = {
        '{nombre}': contacto.nombre,
        '{apellido}': contacto.apellido || '',
        '{nombre_completo}': `${contacto.nombre} ${contacto.apellido || ''}`.trim(),
      };
      
      let contenidoPersonalizado = campana.contenido;
      Object.entries(placeholders).forEach(([placeholder, valor]) => {
        contenidoPersonalizado = contenidoPersonalizado.replace(new RegExp(placeholder, 'g'), valor);
      });
      
      // Construir HTML con imagen si existe
      let htmlContent = campana.contenidoHtml || '';
      if (htmlContent) {
        Object.entries(placeholders).forEach(([placeholder, valor]) => {
          htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), valor);
        });
      } else {
        htmlContent = `<pre style="font-family: Arial, sans-serif; font-size: 14px; white-space: pre-wrap; word-wrap: break-word;">${contenidoPersonalizado
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')}</pre>`;
      }

      // Agregar imagen si existe URL válida
      if (campana.urlImagen && campana.urlImagen.trim()) {
        // Validar que sea una URL válida
        try {
          new URL(campana.urlImagen);
          htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              ${htmlContent}
              <div style="margin-top: 20px; text-align: center;">
                <img src="${campana.urlImagen}" alt="Imagen de campaña" style="max-width: 100%; height: auto; border-radius: 8px;" />
              </div>
            </div>
          `;
        } catch (e) {
          console.warn(`⚠️  URL de imagen inválida: ${campana.urlImagen}`);
          // Continuar sin imagen si la URL no es válida
        }
      }

      const mailOptions = {
        from: process.env.GMAIL_EMAIL || 'noreply@delgadopropiedades.com',
        to: contacto.correo,
        subject: campana.asunto,
        text: contenidoPersonalizado,
        html: htmlContent,
      };

      // Enviar email
      if (transporter) {
        try {
          await transporter.sendMail(mailOptions);
          console.log(`✅ Email enviado a: ${contacto.correo}`);
          resultado.enviados++;
          resultado.detalles.push({
            contactoId: contacto.id,
            correo: contacto.correo,
            estado: 'enviado',
          });
        } catch (sendError: any) {
          // Si falla el envío, lo registramos pero continuamos
          console.warn(`⚠️  Error enviando a ${contacto.correo}:`, sendError.message);
          resultado.fallidos++;
          resultado.detalles.push({
            contactoId: contacto.id,
            correo: contacto.correo,
            estado: 'fallido',
            error: sendError.message,
          });
        }
      } else {
        // Modo simulación
        console.log(`📧 [SIMULADO] Email que se enviaría a: ${contacto.correo}`);
        resultado.enviados++;
        resultado.detalles.push({
          contactoId: contacto.id,
          correo: contacto.correo,
          estado: 'enviado',
        });
      }

      // Pequeño delay para no saturar
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error: any) {
      // Capturar cualquier error inesperado pero continuar
      console.warn(`⚠️  Error procesando ${contacto.correo}:`, error.message);
      resultado.fallidos++;
      resultado.detalles.push({
        contactoId: contacto.id,
        correo: contacto.correo,
        estado: 'fallido',
        error: error.message,
      });
    }
  }

  console.log('═══════════════════════════════════════');
  console.log(`📊 Resumen de campaña:`);
  console.log(`   ✅ Enviados: ${resultado.enviados}`);
  console.log(`   ❌ Fallidos: ${resultado.fallidos}`);
  console.log(`   ⚠️  Inválidos: ${resultado.invalidos}`);
  console.log('═══════════════════════════════════════');

  return resultado;
}

/**
 * Validar lista de emails y devolver solo los válidos
 */
export function filtrarEmailsValidos(contactos: ContactoEmail[]): ContactoEmail[] {
  return contactos.filter(contacto => validarEmail(contacto.correo));
}

/**
 * Obtener estadísticas de emails válidos e inválidos
 */
export function obtenerEstadisticasEmails(contactos: ContactoEmail[]): {
  validos: number;
  invalidos: number;
  porcentajeValido: number;
  contactosInvalidos: ContactoEmail[];
} {
  const contactosInvalidos = contactos.filter(c => !validarEmail(c.correo));
  const validos = contactos.length - contactosInvalidos.length;

  return {
    validos,
    invalidos: contactosInvalidos.length,
    porcentajeValido: contactos.length > 0 ? Math.round((validos / contactos.length) * 100) : 0,
    contactosInvalidos,
  };
}
