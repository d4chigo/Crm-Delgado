# 🔍 Diagnóstico de Importación de Google

## Paso 1: Verificar que el Backend Responde

Abre en tu navegador:
```
http://localhost:5000/api/auth/google
```

**Resultado esperado**: Error de autenticación (porque no tienes token en la URL)
**Si ves**: "Cannot GET /api/auth/google" → El backend NO tiene la ruta registrada

---

## Paso 2: Prueba Manual del Flujo Completo

1. Ve a: http://localhost:3000/dashboard/contacts
2. Abre la consola del navegador (F12 → Console)
3. Ejecuta este código en la consola:

```javascript
// Copiar y pegar esto en la consola del navegador
fetch('http://localhost:5000/api/auth/google', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => {
  console.log('✅ Respuesta del backend:', data);
  if (data.authUrl) {
    console.log('🔗 URL de Google:', data.authUrl);
    window.open(data.authUrl, '_blank');
  }
})
.catch(err => console.error('❌ Error:', err));
```

**¿Qué ves en la consola?**

---

## Paso 3: Verificar Logs de la Consola del Navegador

Cuando hagas click en "Importar de Google", deberías ver:

```
🔍 Verificando URL params: { hasToken: false, error: null, ... }
🔍 Verificando URL params: { hasToken: false, error: null, ... }
🔍 Verificando URL params: { hasToken: true, error: null, ... }
✅ Token recibido, longitud: XXX
```

**Si NO ves estos mensajes**: El archivo no se actualizó en el navegador

**Si ves solo el primero repetido**: El token nunca llega a la URL

---

## Paso 4: Verificar la Redirección Manual

1. Autoriza en Google
2. Cuando te redirija de vuelta, ANTES de que desaparezca, **copia la URL completa**
3. La URL debería verse así:
```
http://localhost:3000/dashboard/contacts?google_token=ya29.a0...
```

**¿La URL tiene `google_token`?**
- ✅ **SÍ** → El backend funciona, el problema es en el frontend
- ❌ **NO** → El backend no está redirigiendo correctamente

---

## Paso 5: Si la URL SÍ tiene el token pero no funciona

Significa que el intervalo de verificación no lo está capturando. Prueba esto en la consola:

```javascript
// Mientras estés en /dashboard/contacts con el token en la URL
const params = new URLSearchParams(window.location.search);
console.log('Token en URL:', params.get('google_token'));
```

---

## Soluciones Rápidas

### Solución A: Hard Refresh del Navegador
```
Windows: Ctrl + Shift + R o Ctrl + F5
Mac: Cmd + Shift + R
```

### Solución B: Limpiar Cache y Recargar
1. F12 → Network
2. Click derecho en "Reload" → "Empty Cache and Hard Reload"

### Solución C: Verificar que el contenedor tiene los cambios
```bash
cd /d/Projects/App/Crm-Delgado
docker compose -f docker-compose.dev.yml exec backend cat /app/src/routes/google-auth.routes.ts | head -20
```

Deberías ver los emojis (🔗, 📥, etc.) en el código.

---

## 🐛 Problemas Comunes

### "Autenticación cancelada por el usuario"
**Causa**: La ventana se detecta como cerrada antes de capturar el token
**Solución**: El código ya tiene un delay de 2 segundos, pero si persiste, aumenta el delay

### "No se pudo abrir la ventana"
**Causa**: Bloqueador de popups
**Solución**: Permitir popups para localhost:3000

### "Error de autenticación"  
**Causa**: El backend no pudo intercambiar el código por tokens
**Verifica**:
- GOOGLE_CLIENT_ID correcto en .env
- GOOGLE_CLIENT_SECRET correcto en .env
- URI de redirección coincide en Google Console

---

## 📊 Comparte Estos Datos

Para ayudarte mejor, comparte:

1. **Logs de la consola del navegador** (todo lo que aparezca al intentar importar)
2. **La URL completa** después de autorizar en Google (censura el token si quieres)
3. **Resultado del Paso 2** (la prueba manual con fetch)

---

¿Qué encuentras al seguir estos pasos?
