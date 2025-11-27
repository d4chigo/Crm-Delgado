/**
 * Mapeo de emojis para etiquetas
 * Los emojis se agregan aqui en el frontend, NO en la base de datos
 */

export const ETIQUETA_EMOJIS: Record<string, string> = {
  'Techo Propio': '🏠',
  'Crédito Mi Vivienda': '🏡',
  'Compra': '🛒',
  'Venta': '💰',
  'Alquiler': '🔑',
  'Inversión': '📈',
  'Crédito Hipotecario': '🏦',
  'Primera Vivienda': '🎉',
  'Nuevo': '✨',
  'Usado': '🏘️',
  'Habilitaciones': '🏗️',
  'Construcción': '🏢',
  'Fuente: Google Contacts': '📧',
};

/**
 * Obtener emoji para una etiqueta por nombre
 */
export function obtenerEmojiEtiqueta(nombre: string): string {
  return ETIQUETA_EMOJIS[nombre] || '🏷️';
}

/**
 * Agregar emoji a una etiqueta si no tiene
 */
export function agregarEmojiEtiqueta(nombre: string, iconoExistente?: string): string {
  // Si ya tiene icono desde la BD, usarlo
  if (iconoExistente) {
    return iconoExistente;
  }
  // Si no, obtener del mapeo
  return obtenerEmojiEtiqueta(nombre);
}
