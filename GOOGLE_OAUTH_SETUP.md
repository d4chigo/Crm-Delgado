# 🔧 Configuración de Google OAuth para Calendar

## ❌ Error Actual
```
Error 400: redirect_uri_mismatch
No puedes acceder a esta app porque no cumple con la política OAuth 2.0 de Google.
```

## ✅ Solución Paso a Paso

### 1. Ve a Google Cloud Console
- Abre [Google Cloud Console](https://console.cloud.google.com/)
- Selecciona tu proyecto (o crea uno nuevo)

### 2. Configura las Credenciales OAuth 2.0
1. Ve a **"APIs y servicios"** → **"Credenciales"**
2. Busca tu credencial OAuth 2.0 (la que tiene el Client ID: `838585889230-rnm5poadts6ed6oodgvlmvqa1h6dc4eq.apps.googleusercontent.com`)
3. Haz clic en el **ícono de editar** (lápiz) de esa credencial

### 3. Configura el URI de Redirección
En la sección **"URIs de redirección autorizados"**, agrega exactamente esta URL:
```
http://localhost:5000/api/calendar/callback
```

**⚠️ IMPORTANTE:**
- La URL debe ser EXACTAMENTE esta, sin espacios extra
- No agregues `/` al final
- Asegúrate de que sea `http://` (no `https://`)
- El puerto debe ser `5000`

### 4. Configura la Pantalla de Consentimiento
1. Ve a **"APIs y servicios"** → **"Pantalla de consentimiento de OAuth"**
2. Asegúrate de que esté en modo **"Prueba"** (no "Producción")
3. En **"Usuarios de prueba"**, agrega tu email
4. Guarda los cambios

### 5. Verifica las APIs Habilitadas
1. Ve a **"APIs y servicios"** → **"Biblioteca"**
2. Busca y habilita **"Google Calendar API"**
3. Asegúrate de que esté habilitada

### 6. Reinicia el Servidor
Después de hacer los cambios en Google Console:
1. Detén el servidor (Ctrl+C)
2. Reinicia: `npm run dev`

### 7. Prueba la Conexión
1. Ve a `http://localhost:3000/dashboard/actividades`
2. Haz clic en "Conectar con Google Calendar"
3. Deberías ser redirigido a Google para autenticarte
4. Después de autenticarte, deberías volver a tu aplicación

## 🔍 Verificación
Si sigues teniendo problemas, verifica que:
- ✅ La URL de redirección sea exactamente: `http://localhost:5000/api/calendar/callback`
- ✅ El proyecto esté en modo "Prueba"
- ✅ Tu email esté en "Usuarios de prueba"
- ✅ Google Calendar API esté habilitada
- ✅ El servidor esté corriendo en puerto 5000

## 📞 Si Necesitas Ayuda
Si el problema persiste, comparte:
1. Una captura de pantalla de la configuración de credenciales OAuth
2. Los logs del servidor cuando intentas conectar
3. El mensaje de error exacto que aparece
