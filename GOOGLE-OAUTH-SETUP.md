# Configuración de Google OAuth para Importar Contactos

## Estado Actual

✅ **Frontend implementado**: El botón "Importar de Google" está disponible en la página de contactos  
⏸️ **Backend pendiente**: La funcionalidad requiere configuración de Google OAuth

---

## Pasos para Implementar Google OAuth

### 1. Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - **Google People API**
   - **Google+ API** (si es necesario)

### 2. Configurar OAuth Consent Screen

1. En el menú lateral, ve a **APIs & Services** → **OAuth consent screen**
2. Selecciona **External** (o Internal si es para organización)
3. Completa la información:
   - **App name**: CRM Delgado
   - **User support email**: Tu email
   - **Developer contact**: Tu email
4. Agrega los scopes necesarios:
   - `https://www.googleapis.com/auth/contacts.readonly`
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `https://www.googleapis.com/auth/userinfo.email`

### 3. Crear Credenciales OAuth 2.0

1. Ve a **APIs & Services** → **Credentials**
2. Click en **Create Credentials** → **OAuth client ID**
3. Tipo: **Web application**
4. Configuración:
    - **Name**: CRM Delgado Client
    - **Authorized JavaScript origins**:
      - `http://localhost:3000` (para desarrollo)
      - `https://tu-dominio.com` (para producción)
    - **Authorized redirect URIs**:
      - `http://localhost:5000/api/auth/google/callback` (para desarrollo)
      - `https://tu-dominio.com/api/auth/google/callback` (para producción)
5. Click **Create**
6. Guarda el **Client ID** y **Client Secret** que se muestran

### 4. Instalar Dependencias en el Servidor

```bash
cd server
pnpm install googleapis
```

### 5. Configurar Variables de Entorno

Agrega al archivo `.env` del servidor:

```env
# Google OAuth
GOOGLE_CLIENT_ID=tu_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

### 6. Implementar OAuth en el Backend

#### 6.1 Crear Servicio de Google Auth

Crear archivo `server/src/services/google-auth.service.ts`:

```typescript
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export class GoogleAuthService {
  /**
   * Generar URL de autorización
   */
  getAuthUrl(): string {
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/contacts.readonly',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ]
    });
  }

  /**
   * Obtener tokens con el código de autorización
   */
  async getTokens(code: string) {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    return tokens;
  }

  /**
   * Obtener contactos de Google
   */
  async getContacts(accessToken: string) {
    oauth2Client.setCredentials({ access_token: accessToken });
    
    const people = google.people({ version: 'v1', auth: oauth2Client });
    const response = await people.people.connections.list({
      resourceName: 'people/me',
      pageSize: 1000,
      personFields: 'names,emailAddresses,phoneNumbers,addresses'
    });

    return response.data.connections || [];
  }
}

export default new GoogleAuthService();
```

#### 6.2 Crear Rutas de Autenticación

Crear archivo `server/src/routes/google-auth.routes.ts`:

```typescript
import { Router } from 'express';
import { autenticar } from '@/middlewares/autenticacion.middleware';
import googleAuthService from '@/services/google-auth.service';
import { respuestaExito, respuestaError } from '@/utils/respuesta.util';

const router = Router();

// GET /api/auth/google - Iniciar OAuth
router.get('/google', autenticar, (req, res) => {
  try {
    const authUrl = googleAuthService.getAuthUrl();
    respuestaExito(res, { authUrl });
  } catch (error: any) {
    respuestaError(res, error.message, 500);
  }
});

// GET /api/auth/google/callback - Callback de Google
router.get('/google/callback', async (req, res) => {
  try {
    const code = req.query.code as string;
    
    if (!code) {
      return res.redirect('/dashboard/contacts?error=no_code');
    }

    const tokens = await googleAuthService.getTokens(code);
    
    // Guardar tokens en sesión o base de datos
    // Por simplicidad, redirigir con el token en la URL (no recomendado en producción)
    res.redirect(`/dashboard/contacts?google_token=${tokens.access_token}`);
  } catch (error: any) {
    res.redirect('/dashboard/contacts?error=auth_failed');
  }
});

export default router;
```

#### 6.3 Actualizar el Servicio de Contactos

Reemplazar el método `importarDesdeGoogle` en `contacto.service.ts`:

```typescript
async importarDesdeGoogle(usuarioId: string, accessToken: string): Promise<{
  importados: number;
  duplicados: number;
  errores: number;
}> {
  let importados = 0;
  let duplicados = 0;
  let errores = 0;

  try {
    const contactosGoogle = await googleAuthService.getContacts(accessToken);

    for (const person of contactosGoogle) {
      try {
        const nombre = person.names?.[0]?.givenName || '';
        const apellido = person.names?.[0]?.familyName || '';
        const correo = person.emailAddresses?.[0]?.value;
        const telefono = person.phoneNumbers?.[0]?.value;
        
        if (!correo) continue;

        // Verificar si ya existe
        const existe = await prisma.contacto.findFirst({
          where: { correo, usuarioId }
        });

        if (existe) {
          duplicados++;
          continue;
        }

        // Crear contacto
        await this.crearContacto({
          nombre,
          apellido,
          correo,
          telefono: telefono || undefined,
        }, usuarioId);

        importados++;
      } catch (error) {
        console.error('Error al importar contacto:', error);
        errores++;
      }
    }

    return { importados, duplicados, errores };
  } catch (error: any) {
    throw new Error(`Error al obtener contactos de Google: ${error.message}`);
  }
}
```

#### 6.4 Registrar Rutas

En `server/src/index.ts`, agregar:

```typescript
import googleAuthRoutes from './routes/google-auth.routes';

app.use('/api/auth', googleAuthRoutes);
```

### 7. Actualizar el Frontend

#### 7.1 Modificar el Hook

Actualizar `client/hooks/useContactos.ts`:

```typescript
const importarDesdeGoogle = async () => {
  setEstaCargando(true)
  setError(null)
  
  try {
    // Paso 1: Obtener URL de autorización
    const authResponse = await fetch('/api/auth/google', {
      headers: {
        Authorization: `Bearer ${authService.obtenerToken()}`
      }
    });
    const { authUrl } = await authResponse.json();
    
    // Paso 2: Abrir ventana de autorización
    const authWindow = window.open(authUrl, 'Google Auth', 'width=500,height=600');
    
    // Paso 3: Esperar el token (esto es simplificado, usar un mejor método en producción)
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(async () => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('google_token');
        
        if (token) {
          clearInterval(checkInterval);
          
          // Paso 4: Importar contactos con el token
          const resultado = await contactoService.importarDesdeGoogle(token);
          
          // Recargar
          await cargarContactos();
          await cargarEstadisticas();
          
          resolve(resultado);
        }
      }, 1000);
      
      // Timeout después de 2 minutos
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('Timeout en autorización'));
      }, 120000);
    });
  } catch (err: any) {
    setError(err.message || 'Error al importar contactos desde Google')
    throw err
  } finally {
    setEstaCargando(false)
  }
}
```

---

## Alternativas Más Simples

### Opción 1: Importar desde CSV

Si Google OAuth es muy complejo, puedes implementar importación desde CSV:

1. Usuario exporta contactos de Google como CSV
2. Usuario sube el CSV al CRM
3. El sistema procesa y importa los contactos

### Opción 2: Usar Google Apps Script

Crear un script de Google que envíe los contactos directamente a tu API:

```javascript
function exportContactsToCRM() {
  var contacts = ContactsApp.getContacts();
  var apiUrl = 'https://tu-api.com/api/contactos/importar/batch';
  var apiKey = 'tu_api_key';
  
  var contactsData = contacts.map(function(contact) {
    return {
      nombre: contact.getGivenName(),
      apellido: contact.getFamilyName(),
      correo: contact.getPrimaryEmail(),
      telefono: contact.getPrimaryPhone()
    };
  });
  
  UrlFetchApp.fetch(apiUrl, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + apiKey },
    payload: JSON.stringify(contactsData)
  });
}
```

---

## Seguridad

⚠️ **Importante**:

1. **Nunca** expongas tokens de acceso en URLs en producción
2. Usa **HTTPS** en producción
3. Almacena tokens de forma segura (encriptados en BD)
4. Implementa **rate limiting** en endpoints de importación
5. Valida y sanitiza todos los datos importados
6. Considera usar **refresh tokens** para sesiones largas

---

## Testing

Para probar sin implementar OAuth completo, puedes:

1. Crear contactos de prueba manualmente
2. Simular la respuesta de Google en desarrollo
3. Usar datos mockeados en el frontend

---

## Recursos

- [Google People API Documentation](https://developers.google.com/people)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [googleapis npm package](https://www.npmjs.com/package/googleapis)
