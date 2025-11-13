/**
 * Generar contraseña temporal segura
 * Formato: 2 palabras + 4 números (Ej: "Casa2024", "Luna9876")
 */
export const generarPasswordTemporal = (): string => {
  const palabras = [
    'Casa', 'Luna', 'Sol', 'Mar', 'Rio', 'Cielo', 'Luz', 'Nube',
    'Viento', 'Flor', 'Roca', 'Lago', 'Monte', 'Valle', 'Pino',
  ];
  
  const palabra = palabras[Math.floor(Math.random() * palabras.length)];
  const numeros = Math.floor(1000 + Math.random() * 9000); // 4 dígitos
  
  return `${palabra}${numeros}`;
};

/**
 * Validar formato de contraseña
 * Mínimo 8 caracteres, al menos 1 letra y 1 número
 */
export const validarPassword = (password: string): boolean => {
  if (password.length < 8) return false;
  
  const tieneLetras = /[a-zA-Z]/.test(password);
  const tieneNumeros = /[0-9]/.test(password);
  
  return tieneLetras && tieneNumeros;
};

/**
 * Generar código de verificación (6 dígitos)
 */
export const generarCodigoVerificacion = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
