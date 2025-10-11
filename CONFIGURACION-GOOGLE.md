# 🚀 Configuración Rápida de Google OAuth

## ✅ Implementación Completada

El código para importar contactos de Google **ya está implementado**. Solo necesitas configurar las credenciales de Google.

---

## 📋 Paso a Paso

### 1. Crear Proyecto en Google Cloud

1. Ve a: https://console.cloud.google.com/
2. Click en **"Crear proyecto"** o selecciona uno existente
3. Nombre sugerido: `CRM Delgado`

### 2. Habilitar Google People API

1. En el menú lateral → **APIs y servicios** → **Biblioteca**
2. Busca: `Google People API`
3. Click en **Habilitar**

### 3. Configurar Pantalla de Consentimiento

1. Ve a **APIs y servicios** → **Pantalla de consentimiento de OAuth**
2. Selecciona **Externo** (o Interno si es para tu organización)
3. Completa:
   - **Nombre de la aplicación**: CRM Delgado
   - **Correo de asistencia**: tu@email.com
   - **Correo del desarrollador**: tu@email.com
4. **Agregar alcances** (scopes):
   - `.../auth/contacts.readonly`
   - `.../auth/userinfo.profile`
   - `.../auth/userinfo.email`
5. Guardar y continuar

### 4. Crear Credenciales OAuth 2.0

1. Ve a **APIs y servicios** → **Credenciales**
2. Click en **+ CREAR CREDENCIALES** → **ID de cliente de OAuth**
3. Tipo de aplicación: **Aplicación web**
4. Nombre: `CRM Delgado Web Client`
5. **Orígenes de JavaScript autorizados**:
   ```
   http://localhost:3000
   http://localhost:5000
   ```
6. **URIs de redireccionamiento autorizados**:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
7. Click en **CREAR**
8. **⚠️ IMPORTANTE**: Copia el **ID de cliente** y el **Secreto del cliente**

### 5. Configurar Variables de Entorno

Crea un archivo `.env` en la carpeta `server/` con:

```env
# Google OAuth
GOOGLE_CLIENT_ID=tu-client-id-aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-tu-client-secret-aqui
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
CLIENT_URL=http://localhost:3000
```

**Reemplaza** `tu-client-id-aqui` y `tu-client-secret-aqui` con los valores que copiaste.

### 6. Reiniciar el Servidor

```bash
# Detén el servidor actual (Ctrl+C)
# Luego reinicia:
cd server
pnpm run dev
```

---

## ✨ ¡Listo para Usar!

Ahora cuando hagas click en **"Importar de Google"**:

1. Se abrirá una ventana popup
2. Te pedirá que inicies sesión con Google
3. Solicitará permisos para acceder a tus contactos
4. Tras autorizar, se importarán automáticamente

---

## 🔒 Seguridad

### Modo de Prueba
Por defecto, tu aplicación está en **modo de prueba**. Esto significa:
- ✅ Funciona perfectamente para ti y usuarios de prueba
- ⚠️ Limitado a 100 usuarios
- ⚠️ Requiere agregar emails manualmente en Google Console

### Para añadir usuarios de prueba:
1. Ve a **Pantalla de consentimiento de OAuth**
2. En **Usuarios de prueba** → **+ AGREGAR USUARIOS**
3. Agrega los emails que necesiten usar la importación

### Publicar la aplicación (opcional):
Si necesitas más de 100 usuarios:
1. Ve a **Pantalla de consentimiento de OAuth**
2. Click en **PUBLICAR APLICACIÓN**
3. Completa el proceso de verificación de Google

---

## 🧪 Probar sin Google OAuth

Si quieres probar sin configurar Google, puedes:

1. Crear contactos manualmente
2. Usar la API directamente con Postman/Thunder Client
3. Importar desde CSV (próxima feature)

---

## 🐛 Solución de Problemas

### Error: "redirect_uri_mismatch"
- Verifica que el URI de redirección en `.env` coincida **exactamente** con el configurado en Google Console
- Debe incluir el protocolo (`http://` o `https://`)
- No debe tener slash al final

### Error: "invalid_client"
- Verifica que `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` estén correctos
- Asegúrate de no tener espacios al inicio o final

### La ventana no se abre
- Verifica que tu navegador permita popups para `localhost:3000`
- Revisa la consola del navegador (F12) para ver errores

### Error: "access_denied"
- El usuario canceló la autorización o denegó los permisos
- Vuelve a intentar y acepta los permisos

---

## 📚 Recursos

- [Google People API Docs](https://developers.google.com/people)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

---

## 💡 Ejemplo de Archivo .env Completo

```env
# Base de datos
DATABASE_URL=mysql://user:password@localhost:3306/crm_delgado

# JWT
JWT_SECRET=tu_secret_super_seguro_aqui
JWT_EXPIRES_IN=24h

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-AbCdEfGhIjKlMnOpQrSt
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
CLIENT_URL=http://localhost:3000

# CORS
CORS_ORIGIN=http://localhost:3000

# API Externa
DNI_API_TOKEN=tu_token_de_apis_net_pe
```

---

¿Necesitas ayuda? Revisa los logs del servidor para más detalles de cualquier error.
