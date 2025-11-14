# 🎤 Guía de Depuración - Llamadas de Voz

## Problema: Bot se queda en "Escuchando"

### Síntomas
- El bot dice "Escuchando..." pero no procesa el audio
- La sesión se cierra inmediatamente
- Error: `[Deprecation] The ScriptProcessorNode is deprecated`

### Diagnóstico

#### 1. Verificar Permisos del Micrófono
```javascript
// En DevTools Console:
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('✅ Micrófono accesible');
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(err => console.error('❌ Error:', err));
```

#### 2. Verificar API Key de Gemini
```javascript
// En DevTools Console:
console.log('API Key:', import.meta.env.VITE_GOOGLE_API_KEY);
console.log('Disponible:', !!import.meta.env.VITE_GOOGLE_API_KEY);
```

#### 3. Verificar Conexión a Gemini Live API
```javascript
// En DevTools Console:
const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=' + apiKey, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ contents: [{ parts: [{ text: 'test' }] }] })
})
.then(r => r.json())
.then(d => console.log('✅ Gemini API funciona:', d))
.catch(e => console.error('❌ Error Gemini:', e));
```

### Soluciones Comunes

#### Problema 1: Micrófono No Funciona
**Síntoma:** Error al solicitar micrófono
**Solución:**
1. Verifica que el navegador tenga permiso para acceder al micrófono
2. Recarga la página
3. Intenta en otro navegador (Chrome, Firefox, Edge)

#### Problema 2: API Key Inválida
**Síntoma:** Error 401 o "Unauthorized"
**Solución:**
1. Ve a https://aistudio.google.com/apikey
2. Copia la clave nuevamente
3. Actualiza `.env.local`
4. Reconstruye: `npm run build`
5. Limpia caché: Ctrl+Shift+R

#### Problema 3: Sesión se Cierra Inmediatamente
**Síntoma:** "Live session closed" sin procesar audio
**Solución:**
1. El modelo `gemini-2.0-flash-exp` podría no estar disponible
2. Intenta cambiar a otro modelo en `hooks/useVoiceCall.ts` línea 168:

```typescript
// Opción 1: Intenta este primero
const liveModel = 'gemini-1.5-flash-exp';

// Opción 2: Si no funciona, intenta este
const liveModel = 'gemini-1.5-pro-exp';

// Opción 3: Último recurso
const liveModel = 'gemini-2.0-flash';
```

Luego reconstruye:
```bash
npm run build
npm run dev
```

#### Problema 4: Audio Distorsionado o No Se Escucha
**Síntoma:** El bot no entiende lo que dices
**Solución:**
1. Verifica que tu micrófono funcione (prueba en otra app)
2. Habla más cerca del micrófono
3. Reduce ruido de fondo
4. Intenta en un navegador diferente

### Logs Útiles

Abre DevTools (F12) y busca estos mensajes:

✅ **Esperados:**
- `Live session opened` - Conexión exitosa
- `Escuchando...` - Listo para recibir audio
- `Procesando...` - Procesando tu voz

❌ **Problemas:**
- `Live session error` - Error en la conexión
- `Error sending audio` - Problema al enviar audio
- `Error processing audio` - Problema al procesar audio

### Script de Prueba Rápida

Copia esto en DevTools Console para probar:

```javascript
async function testVoiceCall() {
  console.log('🔍 Iniciando prueba de llamada de voz...');
  
  // 1. Verificar micrófono
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log('✅ Micrófono: OK');
    stream.getTracks().forEach(t => t.stop());
  } catch (e) {
    console.error('❌ Micrófono:', e);
    return;
  }
  
  // 2. Verificar API Key
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  if (!apiKey) {
    console.error('❌ API Key no configurada');
    return;
  }
  console.log('✅ API Key: Configurada');
  
  // 3. Verificar AudioContext
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  console.log('✅ AudioContext: OK (sampleRate:', ctx.sampleRate, ')');
  ctx.close();
  
  console.log('✅ Todas las pruebas pasaron. El problema podría ser con Gemini Live API.');
}

testVoiceCall();
```

### Contacto y Soporte

Si después de todo esto sigue sin funcionar:

1. Revisa la consola del navegador para mensajes de error específicos
2. Intenta con un modelo diferente
3. Verifica que tu API Key sea válida
4. Prueba en otro navegador
5. Limpia localStorage: `localStorage.clear()`

### Modelos Disponibles para Live API

Estos son los modelos que soportan audio en vivo:
- `gemini-2.0-flash-exp` (recomendado)
- `gemini-1.5-flash-exp`
- `gemini-1.5-pro-exp`
- `gemini-2.0-flash`

Si uno no funciona, intenta con otro.
