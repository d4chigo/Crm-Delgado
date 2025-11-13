# Bot CRM - Delgado Propiedades

Asistente inteligente con IA para tu CRM inmobiliario. Analiza datos, proporciona recomendaciones de marketing y gestiona contactos automáticamente.

## Características

✅ **Análisis de Datos**: Estadísticas en tiempo real de tu CRM
✅ **Recomendaciones de Marketing**: Identifica dónde enfocar tus esfuerzos
✅ **Gestión de Contactos**: CRUD completo de leads y clientes
✅ **Análisis por Estado**: Filtra contactos por etapa del pipeline
✅ **Interfaz Conversacional**: Interactúa de forma natural con tu CRM

## Configuración Inicial

### Paso 1: Obtener API Key de Google AI Studio

1. Ve a [Google AI Studio](https://aistudio.google.com/apikey)
2. Haz clic en "Create API Key"
3. Copia tu clave API

### Paso 2: Configurar Variables de Entorno

Crea un archivo `.env.local` en la carpeta `botcrm`:

```env
VITE_GOOGLE_API_KEY=tu_clave_api_aqui
```

### Paso 3: Instalar Dependencias

```bash
npm install
```

### Paso 4: Ejecutar en Desarrollo

```bash
npm run dev
```

El bot estará disponible en `http://localhost:5173`

## Alternativa: Configurar desde la Consola del Navegador

Si no quieres usar `.env.local`, puedes configurar la API Key directamente:

1. Abre el navegador (F12 para abrir DevTools)
2. Ve a la pestaña "Console"
3. Ejecuta:
```javascript
localStorage.setItem('GOOGLE_API_KEY', 'tu_clave_api_aqui')
```
4. Recarga la página

## Funcionalidades del Bot

### 📊 Análisis de CRM
- **getCRMStats**: Obtén estadísticas generales (contactos, proyectos, tasa de conversión)
- **getMarketingAnalysis**: Análisis completo con recomendaciones de marketing
- **getRecommendations**: Recomendaciones personalizadas para tu negocio

### 👥 Gestión de Contactos
- **createContact**: Crear nuevos leads/contactos
- **getContact**: Buscar contactos por correo
- **updateContact**: Actualizar información de contactos
- **deleteContact**: Eliminar contactos
- **getContactosByState**: Filtrar por estado de lead

## Ejemplos de Uso

### Obtener Análisis de Marketing
```
Usuario: "Dame un análisis de marketing"
Bot: [Ejecuta getMarketingAnalysis y proporciona recomendaciones]
```

### Crear un Nuevo Lead
```
Usuario: "Crea un nuevo lead llamado Juan Pérez con correo juan@example.com"
Bot: [Ejecuta createContact y confirma la creación]
```

### Obtener Estadísticas
```
Usuario: "¿Cuáles son mis estadísticas actuales?"
Bot: [Ejecuta getCRMStats y muestra métricas]
```

## Solución de Problemas

### Error: "Configuración pendiente"
- Asegúrate de haber configurado `VITE_GOOGLE_API_KEY` en `.env.local`
- O ejecuta `localStorage.setItem('GOOGLE_API_KEY','tu_clave')` en la consola
- Recarga la página

### Error: "No se pudieron obtener datos"
- Verifica que tu API del CRM esté corriendo en `http://localhost:3001`
- Comprueba que tienes un token de autenticación válido
- Revisa la consola del navegador para más detalles

### El bot no responde
- Abre DevTools (F12) y revisa la consola
- Verifica que la API Key sea válida
- Intenta limpiar localStorage: `localStorage.clear()`

## Estructura del Proyecto

```
botcrm/
├── components/          # Componentes React
│   ├── ChatPanel.tsx    # Panel principal del chat
│   ├── MessageList.tsx  # Lista de mensajes
│   ├── ChatInput.tsx    # Input del chat
│   └── Header.tsx       # Header con tabs
├── services/            # Servicios
│   ├── geminiService.ts # Integración con Gemini
│   ├── tools.ts         # Definición de herramientas
│   └── crmDataService.ts # Conexión con API del CRM
├── constants.ts         # Instrucciones del sistema
├── types.ts             # Tipos TypeScript
└── App.tsx              # Componente principal
```

## Desarrollo

### Build para Producción
```bash
npm run build
```

### Preview de Build
```bash
npm run preview
```

## Notas Importantes

- El bot se conecta a tu API del CRM en `http://localhost:3001/api`
- Asegúrate de que tu backend esté corriendo antes de usar el bot
- El token de autenticación se obtiene de `localStorage.getItem('auth_token')`
- Todas las respuestas se generan con Gemini 2.5 Flash

## Soporte

Para reportar problemas o sugerencias, contacta al equipo de desarrollo.
