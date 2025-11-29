# Configuración del MCP (Model Context Protocol) para Gemini

## ¿Qué es el MCP?

El MCP es un protocolo que permite que Gemini (o cualquier IA) acceda a datos reales de tu CRM para:
- Analizar el estado del negocio
- Generar insights de marketing
- Hacer recomendaciones basadas en datos
- Evaluar el desempeño de ventas

## Endpoints Disponibles

### 1. Análisis General del CRM
```
GET /api/mcp/analysis
```
Retorna:
- Total de leads y clientes
- Leads por estado
- Tasa de conversión
- Ingreso promedio
- Proyectos activos/vendidos
- Leads por departamento y fuente
- Cotizaciones pendientes/aceptadas

**Ejemplo:**
```bash
curl http://localhost:5000/api/mcp/analysis
```

### 2. Insights de Marketing
```
GET /api/mcp/marketing-insights
```
Retorna recomendaciones basadas en:
- Tasa de conversión
- Leads sin calificar
- Cotizaciones pendientes
- Concentración geográfica
- Fuentes principales
- Ingresos promedio

**Ejemplo:**
```bash
curl http://localhost:5000/api/mcp/marketing-insights
```

### 3. Leads con Filtros
```
GET /api/mcp/leads?estado=NUEVO&prioridad=ALTA&limite=20
```

**Parámetros:**
- `estado` - NUEVO, CONTACTADO, CONVERTIDO, DESCALIFICADO
- `prioridad` - ALTA, MEDIA, BAJA
- `departamento` - Nombre del departamento
- `fuente` - Fuente del lead
- `limite` - Número máximo de resultados (default: 10)

**Ejemplo:**
```bash
curl "http://localhost:5000/api/mcp/leads?estado=NUEVO&limite=10"
```

### 4. Clientes con Proyectos
```
GET /api/mcp/clientes?limite=10
```

**Parámetros:**
- `limite` - Número máximo de resultados (default: 10)

**Ejemplo:**
```bash
curl "http://localhost:5000/api/mcp/clientes?limite=5"
```

### 5. Oportunidades Activas
```
GET /api/mcp/oportunidades?limite=10
```

**Parámetros:**
- `limite` - Número máximo de resultados (default: 10)

**Ejemplo:**
```bash
curl "http://localhost:5000/api/mcp/oportunidades?limite=15"
```

### 6. Actividad Reciente
```
GET /api/mcp/actividad?dias=7
```

**Parámetros:**
- `dias` - Número de días a consultar (default: 7)

**Ejemplo:**
```bash
curl "http://localhost:5000/api/mcp/actividad?dias=30"
```

### 7. Buscar Contacto
```
GET /api/mcp/contacto/:correo
```

**Ejemplo:**
```bash
curl "http://localhost:5000/api/mcp/contacto/usuario@email.com"
```

### 8. Estadísticas por Agente
```
GET /api/mcp/estadisticas-agentes
```

Retorna para cada agente:
- Total de leads
- Total de clientes
- Total de oportunidades

**Ejemplo:**
```bash
curl http://localhost:5000/api/mcp/estadisticas-agentes
```

### 9. Health Check
```
GET /api/mcp/health
```

Verifica que el MCP está funcionando correctamente.

**Ejemplo:**
```bash
curl http://localhost:5000/api/mcp/health
```

### 10. Configuración
```
GET /api/mcp/config
```

Retorna:
- API Key de Gemini
- URL de la API
- Lista de endpoints disponibles

**Ejemplo:**
```bash
curl http://localhost:5000/api/mcp/config
```

## Integración con Gemini

### Paso 1: Obtener API Key
1. Ve a [Google AI Studio](https://aistudio.google.com)
2. Crea una nueva API Key
3. Copia la clave

### Paso 2: Configurar Variables de Entorno
En `.env` del servidor:
```env
VITE_GOOGLE_API_KEY=tu_api_key_aqui
VITE_API_URL=http://localhost:5000/api
```

### Paso 3: Usar en Gemini
En tu prompt a Gemini, puedes hacer referencia a los endpoints:

```
Analiza el estado de mi CRM usando estos datos:
- Análisis general: http://localhost:5000/api/mcp/analysis
- Insights de marketing: http://localhost:5000/api/mcp/marketing-insights
- Leads recientes: http://localhost:5000/api/mcp/leads?limite=20
- Oportunidades activas: http://localhost:5000/api/mcp/oportunidades?limite=10

Proporciona recomendaciones específicas para mejorar las ventas.
```

## Troubleshooting

### Error: "No se puede conectar a la API"
- Verifica que el servidor está corriendo: `pnpm dev` en `/server`
- Verifica que el puerto 5000 está disponible
- Comprueba la URL: debe ser `http://localhost:5000/api`

### Error: "Base de datos no encontrada"
- Verifica que MySQL está corriendo
- Verifica que la BD `crm_delgado` existe
- Ejecuta migraciones: `pnpm prisma migrate dev`

### Error: "Datos vacíos"
- Verifica que tienes datos en tu CRM
- Crea algunos leads/clientes de prueba
- Comprueba que los datos están en la BD correcta

### El MCP no devuelve datos correctos
- Revisa los logs del servidor: `pnpm dev` mostrará `[MCP]` en los logs
- Verifica que los nombres de campos coinciden con el schema
- Comprueba que Prisma está sincronizado: `pnpm prisma generate`

## Ejemplos de Uso

### Análisis Completo
```bash
# Obtener análisis
curl http://localhost:5000/api/mcp/analysis

# Obtener insights
curl http://localhost:5000/api/mcp/marketing-insights

# Obtener actividad reciente
curl http://localhost:5000/api/mcp/actividad?dias=30
```

### Búsqueda de Leads
```bash
# Leads nuevos
curl "http://localhost:5000/api/mcp/leads?estado=NUEVO"

# Leads de alta prioridad
curl "http://localhost:5000/api/mcp/leads?prioridad=ALTA"

# Leads de un departamento específico
curl "http://localhost:5000/api/mcp/leads?departamento=Lima"
```

### Análisis de Ventas
```bash
# Oportunidades activas
curl http://localhost:5000/api/mcp/oportunidades?limite=20

# Clientes recientes
curl "http://localhost:5000/api/mcp/clientes?limite=10"

# Estadísticas por agente
curl http://localhost:5000/api/mcp/estadisticas-agentes
```

## Seguridad

⚠️ **IMPORTANTE**: Los endpoints del MCP son públicos (sin autenticación) para que Gemini pueda acceder.

En producción, considera:
1. Agregar autenticación con API Key
2. Limitar acceso por IP
3. Usar HTTPS
4. Implementar rate limiting
5. Auditar accesos

## Próximas Mejoras

- [ ] Agregar más métricas de análisis
- [ ] Implementar predicciones con IA
- [ ] Agregar alertas automáticas
- [ ] Crear reportes personalizados
- [ ] Integración con más herramientas de IA

## Soporte

Si tienes problemas:
1. Revisa los logs del servidor
2. Verifica la conectividad de la BD
3. Comprueba que los datos existen
4. Consulta la documentación de Prisma
