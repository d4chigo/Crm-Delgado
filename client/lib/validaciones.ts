/**
 * Utilidades de validación para formularios de contactos/leads
 */

/**
 * Valida que el texto solo contenga letras, espacios y acentos
 * Elimina números y caracteres especiales
 */
export const validarTexto = (texto: string): string => {
  return texto.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
};

/**
 * Valida DNI (solo números, máximo 8 dígitos)
 */
export const validarDNI = (dni: string): string => {
  return dni.replace(/[^0-9]/g, '').slice(0, 8);
};

/**
 * Valida teléfono (números, espacios, + y guiones)
 */
export const validarTelefono = (telefono: string): string => {
  return telefono.replace(/[^0-9\s\+\-]/g, '');
};

/**
 * Calcula la edad a partir de una fecha de nacimiento
 * @param fechaNacimiento - Fecha en formato ISO o YYYY-MM-DD
 * @returns Edad en años o null si no hay fecha
 */
export const calcularEdad = (fechaNacimiento: string): number | null => {
  if (!fechaNacimiento) return null;
  
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  
  return edad;
};

/**
 * Obtiene la fecha máxima permitida para fecha de nacimiento (hoy)
 * @returns Fecha en formato YYYY-MM-DD
 */
export const obtenerFechaMaxima = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Valida que la edad sea mayor o igual a 18 años
 * @param fechaNacimiento - Fecha en formato ISO o YYYY-MM-DD
 * @returns true si es mayor de 18, false si no
 */
export const esMayorDeEdad = (fechaNacimiento: string): boolean => {
  const edad = calcularEdad(fechaNacimiento);
  return edad !== null && edad >= 18;
};
