# Configuración de Google OAuth para Importación de Contactos

## Problema Actual
La importación de contactos desde Google no funciona porque faltan las credenciales de OAuth.

## Solución

### 1. Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. En el menú, ve a **APIs y servicios** > **Credenciales**

### 2. Crear Credenciales OAuth 2.0

1. Haz clic en **+ Crear credenciales** > **ID de cliente OAuth**
2. Si te pide, primero configura la **pantalla de consentimiento OAuth**:
   - Tipo de usuario: **Externo**
   - Nombre de la aplicación: **CRM Delgado**
   - Correo de soporte: Tu correo
   - Permisos requeridos: Agregar `https://www.googleapis.com/auth/contacts.readonly`

3. Luego crea el **ID de cliente OAuth**:
   - Tipo de aplicación: **Aplicación web**
   - Nombre: **CRM Delgado**
   - URIs autorizados de JavaScript: 
     - `http://localhost:3000`
     - `http://localhost:5000`
   - URI de redirección autorizados:
     - `http://localhost:5000/api/auth/google/callback`

### 3. Obtener las Credenciales

1. Copia el **ID de cliente** y la **Contraseña de cliente**
2. Guarda estos valores

### 4. Configurar Variables de Entorno

En el servidor (`server/`), crea un archivo `.env` (o actualiza el existente) con:

```env
# Google OAuth
GOOGLE_CLIENT_ID=tu_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# URLs
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000

# Base de datos
DATABASE_URL=mysql://usuario:contraseña@localhost:3306/crm_delgado

# JWT
JWT_SECRET=tu_secret_jwt_aqui
JWT_EXPIRES_IN=7d

# Otros
NODE_ENV=development
```

### 5. Habilitar APIs Necesarias

En Google Cloud Console, ve a **APIs y servicios** > **Biblioteca** y habilita:
- **Google People API**
- **Google Contacts API**

### 6. Reiniciar el Servidor

```bash
# En la carpeta server/
npm run dev
```

## Prueba de Funcionamiento

1. Ve a la página de Leads: `http://localhost:3000/dashboard/leads`
2. Haz clic en el botón **Importar de Google**
3. Autoriza el acceso a tus contactos
4. Los contactos deberían importarse como leads

## Troubleshooting

### Error: "Google OAuth no está configurado"
- Verifica que `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` estén en el `.env`
- Reinicia el servidor después de cambiar `.env`

### Error: "Permiso denegado"
- Asegúrate de habilitar **Google People API** en Google Cloud Console
- Verifica que el scope `contacts.readonly` esté en la pantalla de consentimiento

### Error: "Token inválido o expirado"
- El token de Google tiene una duración limitada
- Intenta autorizar nuevamente

### No se importan contactos
- Abre la consola del navegador (F12) y busca logs con `[ContactoService]`
- Abre la consola del servidor y busca logs con `[Google Auth]`
- Verifica que tengas contactos en tu cuenta de Google

## Logs para Debug

El sistema incluye logging detallado:

**Cliente** (consola del navegador):
```
🔍 Google token recibido en callback: ...
📤 Enviando token de Google al servidor...
✅ Resultado de importación: {importados: X, duplicados: Y, errores: Z}
```

**Servidor** (consola del servidor):
```
[Google Auth] Obteniendo contactos...
[Contacto Service] Importación completada: {importados: X, duplicados: Y, errores: Z}
```

## Notas de Seguridad

- ⚠️ **NUNCA** commits el archivo `.env` a Git (está en `.gitignore`)
- Mantén `GOOGLE_CLIENT_SECRET` seguro
- En producción, usa variables de entorno del servidor (Heroku, AWS, etc.)

## Próximos Pasos

Una vez configurado, los usuarios podrán:
1. Hacer clic en "Importar de Google"
2. Autorizar el acceso a sus contactos
3. Los contactos se importarán automáticamente como leads con:
   - Nombre y apellido
   - Correo
   - Teléfono
   - Etiqueta "Fuente: Google Contacts"
