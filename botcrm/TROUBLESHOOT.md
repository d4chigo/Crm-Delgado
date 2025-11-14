# 🔧 Solución de Problemas - Bot CRM

## Error: "The model is overloaded" (503)

Si ves este error, significa que el bot aún está usando `gemini-2.5-flash`.

### ✅ Solución Rápida

1. **Limpia el caché del navegador:**
   - Abre DevTools (F12)
   - Haz clic derecho en el botón "Recargar"
   - Selecciona "Vaciar caché y recargar"

2. **O usa Ctrl+Shift+R** para forzar recarga sin caché

3. **Verifica que tu `.env.local` tenga:**
   ```env
   VITE_GOOGLE_API_KEY=tu_clave_aqui
   ```

4. **Reconstruye el bot:**
   ```bash
   cd botcrm
   npm run build
   npm run dev
   ```

## Verificar que la Configuración es Correcta

### En el Navegador (DevTools)

1. Abre DevTools (F12)
2. Ve a Console
3. Ejecuta:
   ```javascript
   console.log(import.meta.env.VITE_GOOGLE_API_KEY)
   ```
4. Debería mostrar tu clave API (no undefined)

### Alternativa: localStorage

Si no quieres usar `.env.local`:

1. Abre DevTools (F12)
2. Ve a Console
3. Ejecuta:
   ```javascript
   localStorage.setItem('GOOGLE_API_KEY', 'tu_clave_aqui')
   ```
4. Recarga la página

## Cambiar el Modelo

Si `gemini-2.0-flash` sigue sobrecargado, prueba con otro modelo.

Edita `botcrm/config.ts`:

```typescript
// Opción 1: Más estable
export const AI_MODEL = 'gemini-1.5-flash';

// Opción 2: Más potente pero lento
export const AI_MODEL = 'gemini-1.5-pro';

// Opción 3: Versión anterior
export const AI_MODEL = 'gemini-1.0-pro';
```

Luego reconstruye:
```bash
npm run build
npm run dev
```

## Verificar que el Backend Está Corriendo

El bot necesita que tu CRM esté corriendo en `http://localhost:3001`.

Verifica:
```bash
# En otra terminal
curl http://localhost:3001/api/admin/contactos
```

Debería devolver datos (no error 404 o 503).

## Logs Útiles

Abre DevTools (F12) y busca en Console:

- ✅ `Executing tool: getCRMStats` - El bot está llamando herramientas
- ✅ `Intento 1/3` - El bot está reintentando
- ❌ `Error fetching Gemini response` - Hay un error con la API

## Limpiar Todo y Empezar de Cero

```bash
# 1. Detener el bot
# (Ctrl+C en la terminal donde corre npm run dev)

# 2. Limpiar caché y dependencias
cd botcrm
rm -rf node_modules dist
npm install

# 3. Reconstruir
npm run build

# 4. Ejecutar
npm run dev
```

## Si Nada Funciona

1. **Verifica tu API Key:**
   - Ve a https://aistudio.google.com/apikey
   - Copia la clave nuevamente
   - Pégala en `.env.local`

2. **Verifica que sea la clave correcta:**
   - No debe tener espacios
   - No debe tener comillas
   - Debe ser exactamente como aparece en Google AI Studio

3. **Recarga la página:**
   - Ctrl+Shift+R (fuerza recarga sin caché)

4. **Revisa la consola:**
   - Abre DevTools (F12)
   - Ve a Console
   - Busca mensajes de error específicos

## Contacto

Si el problema persiste, revisa:
- El archivo `README.md` para más detalles
- El archivo `SETUP.md` para configuración inicial
- Los logs en la consola del navegador
