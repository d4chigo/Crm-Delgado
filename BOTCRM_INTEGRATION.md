# Integración del Chatbot (BotCRM) en el CRM

## Cambios Realizados

### 1. ✅ Corrección en `botcrm/services/geminiService.ts` (Línea 68)
- **Problema**: Error en la estructura de `toolResponses` 
- **Solución**: Actualizado el formato de envío de respuestas de herramientas a la API de Google Genai
- **Archivo**: `botcrm/services/geminiService.ts`

### 2. ✅ Configuración de Variables de Entorno
- **Archivo**: `botcrm/vite.config.ts`
- **Cambio**: Agregada variable `VITE_API_URL` con fallback a `http://localhost:5000`
- **Uso**: Para conectar el botcrm con el backend del CRM

### 3. ✅ Nuevo Componente Widget
- **Archivo**: `client/components/ChatbotWidget.tsx`
- **Descripción**: Componente reutilizable para integrar el botcrm en cualquier página
- **Características**:
  - Botón para abrir/cerrar el asistente
  - Carga lazy del iframe (solo cuando se abre)
  - Interfaz moderna con Tailwind CSS
  - Soporte para micrófono y clipboard

### 4. ✅ Integración en Dashboard
- **Archivo**: `client/app/dashboard/page.tsx`
- **Cambio**: Agregado `ChatbotWidget` al final del dashboard
- **Ubicación**: Debajo de los leads recientes y link delgado

## Estructura del Botcrm

```
botcrm/
├── .env.local              # Variables de entorno (gitignored)
├── vite.config.ts          # Configuración de Vite
├── services/
│   └── geminiService.ts    # ✅ Corregido - Servicio de Gemini
├── components/
│   ├── ChatPanel.tsx       # Panel de chat
│   ├── CallPanel.tsx       # Panel de llamadas
│   └── ...
├── index.html              # Punto de entrada
└── App.tsx                 # Componente principal
```

## Cómo Ejecutar

### Opción 1: Usando Make (Recomendado)

```bash
# Iniciar entorno de desarrollo
make dev

# Ver logs
make logs

# Detener servicios
make stop
```

### Opción 2: Usando Docker Compose directamente

```bash
# Iniciar desarrollo
docker-compose -f docker-compose.dev.yml up -d

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# Detener
docker-compose -f docker-compose.dev.yml down
```

## URLs de Acceso

- **Frontend (CRM)**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Adminer (BD)**: http://localhost:8080
- **Botcrm (iframe)**: http://localhost:3000/botcrm/index.html

## Configuración del .env.local del Botcrm

Crear archivo `botcrm/.env.local` con:

```env
VITE_API_URL=http://localhost:5000
GEMINI_API_KEY=tu_clave_gemini_aqui
```

**Nota**: El archivo `.env.local` está en `.gitignore` por seguridad.

## Características del Widget

### Botón Cerrado
- Muestra botón "Abrir Asistente de IA"
- Diseño limpio con ícono de chat
- Colores del branding (amarillo #FCBA00)

### Panel Abierto
- Iframe con el botcrm completo
- Altura: 600px (responsive)
- Botón de cierre en la esquina superior derecha
- Soporte para micrófono y autoplay

## Integración con Backend

El botcrm puede hacer llamadas al backend en `http://localhost:5000/api`:

```javascript
// Ejemplo en geminiService.ts
const apiUrl = process.env.VITE_API_URL || 'http://localhost:5000';
const response = await fetch(`${apiUrl}/api/endpoint`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

## Troubleshooting

### El botcrm no carga
1. Verificar que el frontend esté corriendo en puerto 3000
2. Revisar logs: `make logs`
3. Verificar CORS en backend

### Error de micrófono
1. Verificar permisos del navegador
2. Revisar que el iframe tenga atributo `allow="microphone"`
3. Ver logs en consola del navegador

### Error de API Key
1. Verificar que `GEMINI_API_KEY` esté en `.env.local`
2. Verificar que la clave sea válida
3. Revisar logs del backend

## Próximos Pasos

1. ✅ Compilar botcrm: `npm run build` en carpeta `botcrm/`
2. ✅ Copiar dist a `client/public/botcrm/`
3. ✅ Ejecutar Docker: `make dev`
4. ✅ Acceder a http://localhost:3000
5. ✅ Probar widget en dashboard

## Notas Importantes

- El botcrm se carga lazy (solo cuando se abre el panel)
- El iframe tiene acceso a micrófono y clipboard
- Las variables de entorno se cargan en build time (Vite)
- El widget es totalmente responsive
