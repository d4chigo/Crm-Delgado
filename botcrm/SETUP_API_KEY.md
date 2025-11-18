# Configuración de Clave de API - BotCRM

## ⚠️ Problema
El bot muestra: "Configuración pendiente: agrega tu clave de Google AI Studio..."

## ✅ Solución

### Opción 1: Archivo `.env.local` (Recomendado)

1. Crea un archivo `.env.local` en la carpeta `botcrm/`:
```bash
cd botcrm
```

2. Agrega tu clave de API:
```env
VITE_GOOGLE_API_KEY=tu_clave_aqui
VITE_API_URL=http://localhost:5000
```

3. Obtén tu clave en: https://aistudio.google.com/app/apikeys

4. Reconstruye el proyecto:
```bash
npm run build
```

5. Reinicia el contenedor:
```bash
docker-compose -f docker-compose.dev.yml restart frontend
```

### Opción 2: Consola del Navegador (Temporal)

1. Abre http://localhost:3000
2. Abre la consola (F12)
3. Ejecuta:
```javascript
localStorage.setItem('GOOGLE_API_KEY', 'tu_clave_aqui')
```
4. Recarga la página

## 🔑 Dónde obtener la clave

1. Ve a https://aistudio.google.com/app/apikeys
2. Crea una nueva clave de API
3. Cópiala y pégala en `.env.local`

## 📝 Archivo `.env.local` Completo

```env
# Google Gemini API
VITE_GOOGLE_API_KEY=tu_clave_de_gemini_aqui

# Backend URL
VITE_API_URL=http://localhost:5000
```

## ✨ Después de configurar

1. Reconstruye: `npm run build`
2. Reinicia: `docker-compose -f docker-compose.dev.yml restart frontend`
3. Accede a http://localhost:3000
4. El bot debería funcionar correctamente
