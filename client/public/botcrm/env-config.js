// Script para inyectar variables de entorno en tiempo de ejecución
(function() {
  // Obtener clave desde el .env (inyectada por el servidor)
  // O desde localStorage si el usuario la configuró manualmente
  const apiKey = window.__ENV__?.VITE_GOOGLE_API_KEY || 
                 localStorage.getItem('GOOGLE_API_KEY') || 
                 'AIzaSyCCGIfq3uEYZh5kXY5g7LPTIRw5y_DI5yc'; // Fallback a la clave del .env
  
  const apiUrl = window.__ENV__?.VITE_API_URL || 
                 localStorage.getItem('VITE_API_URL') || 
                 'http://localhost:5000/api';
  
  // Configurar variables globales
  window.__CHATBOT_CONFIG__ = {
    apiKey: apiKey,
    apiUrl: apiUrl
  };
  
  console.log('✅ Configuración inyectada:', {
    apiKey: apiKey ? '✓ Configurada' : '✗ No configurada',
    apiUrl: apiUrl
  });
})();
