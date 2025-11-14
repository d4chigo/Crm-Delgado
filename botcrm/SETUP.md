# 🤖 Configuración del Bot CRM - Guía Rápida

## ⚡ Problema Resuelto

El error `503 Service Unavailable` que viste significa que el servidor de Gemini estaba sobrecargado. He implementado:

✅ **Reintentos automáticos** - El bot intenta 3 veces antes de fallar
✅ **Modelo más estable** - Cambié a `gemini-2.0-flash` 
✅ **Mejor manejo de errores** - Mensajes claros cuando hay problemas
✅ **Backoff exponencial** - Espera inteligente entre reintentos

## 🚀 Pasos para Configurar

### 1. Obtener tu API Key

Ve a: **https://aistudio.google.com/apikey**

1. Haz clic en **"Create API Key"**
2. Selecciona tu proyecto (o crea uno nuevo)
3. Copia la clave que aparece

### 2. Configurar el Bot

**Opción A: Archivo `.env.local` (Recomendado)**

Abre o crea el archivo `botcrm/.env.local`:

```env
VITE_GOOGLE_API_KEY=tu_clave_aqui
```

Luego:
```bash
cd botcrm
npm install
npm run dev
```

**Opción B: Consola del Navegador**

1. Abre el bot en `http://localhost:5173`
2. Abre DevTools (F12)
3. Ve a la pestaña **Console**
4. Copia y pega:

```javascript
localStorage.setItem('GOOGLE_API_KEY', 'tu_clave_aqui')
```

5. Recarga la página (F5)

## ✅ Verificar que Funciona

Prueba escribiendo en el chat:

```
"Dame un análisis de marketing"
```

El bot debería:
1. Conectarse a tu API del CRM
2. Obtener estadísticas
3. Generar recomendaciones

## 🔧 Solución de Problemas

### Error: "Configuración pendiente"
- Verifica que copiaste correctamente la API Key
- Recarga la página después de configurar
- Abre DevTools y revisa la consola

### Error: "El servicio está sobrecargado"
- Espera 1-2 minutos
- Intenta de nuevo
- Si persiste, prueba con `gemini-1.5-flash` en `config.ts`

### El bot no conecta con el CRM
- Asegúrate que tu backend esté corriendo en `http://localhost:3001`
- Verifica que tengas un token válido en localStorage
- Revisa la consola del navegador para más detalles

## 📝 Cambiar Modelo de IA

Si quieres usar otro modelo, edita `botcrm/config.ts`:

```typescript
// Opciones disponibles:
export const AI_MODEL = 'gemini-2.0-flash';    // Recomendado
// export const AI_MODEL = 'gemini-1.5-flash'; // Alternativa
// export const AI_MODEL = 'gemini-1.5-pro';   // Más potente
```

## 🎯 Funcionalidades Disponibles

El bot puede:

### 📊 Análisis
- "Dame un análisis de marketing"
- "¿Cuáles son mis estadísticas?"
- "¿Dónde debo enfocar mi marketing?"

### 👥 Gestión de Contactos
- "Crea un nuevo lead llamado Juan con correo juan@example.com"
- "Busca el contacto juan@example.com"
- "Muéstrame los leads calificados"

### 💡 Recomendaciones
- "¿Qué recomendaciones tienes para mi negocio?"
- "¿Cuántos leads tengo en cada estado?"

## 🆘 Necesitas Ayuda?

1. Revisa la consola del navegador (F12 → Console)
2. Busca mensajes de error específicos
3. Intenta recargar la página
4. Limpia localStorage: `localStorage.clear()`

## 📚 Recursos

- [Google AI Studio](https://aistudio.google.com)
- [Documentación de Gemini](https://ai.google.dev/docs)
- [README del Proyecto](./README.md)
