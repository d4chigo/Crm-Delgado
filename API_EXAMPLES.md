# Ejemplos de API - Pipeline de Etapas

## Cambiar Etapa de Oportunidad

### 1. Cambiar a AGENDAMIENTO (40%)

```bash
curl -X POST http://localhost:5000/api/oportunidades/opp_123/cambiar-etapa \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "etapa": "AGENDAMIENTO",
    "notas": "Reunión agendada para el viernes a las 10am"
  }'
```

**Respuesta esperada:**
```json
{
  "id": "opp_123",
  "clienteId": "cli_456",
  "titulo": "Oportunidad - Juan Pérez",
  "etapa": "AGENDAMIENTO",
  "probabilidad": 40,
  "valor": 250000,
  "ultimaActividad": "2024-12-20T14:30:00Z",
  "cliente": {
    "id": "cli_456",
    "nombre": "Juan",
    "apellido": "Pérez",
    "tipo": "LEAD",
    "correo": "juan@example.com"
  }
}
```

### 2. Cambiar a SEPARACION (60%)

```bash
curl -X POST http://localhost:5000/api/oportunidades/opp_123/cambiar-etapa \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "etapa": "SEPARACION",
    "notas": "Cliente separó la propiedad en Barrio Nueva Vegas"
  }'
```

**Respuesta:** El cliente mantiene tipo = "LEAD" (aún no es cliente)

### 3. Cambiar a FIDELIZACION (100%) - Auto-convierte a Cliente

```bash
curl -X POST http://localhost:5000/api/oportunidades/opp_123/cambiar-etapa \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "etapa": "FIDELIZACION",
    "notas": "Contrato firmado, cliente en etapa de post-venta"
  }'
```

**Respuesta:** ¡IMPORTANTE! El cliente ahora es tipo = "CLIENTE"
```json
{
  "id": "opp_123",
  "clienteId": "cli_456",
  "titulo": "Oportunidad - Juan Pérez",
  "etapa": "FIDELIZACION",
  "probabilidad": 100,
  "cliente": {
    "id": "cli_456",
    "nombre": "Juan",
    "apellido": "Pérez",
    "tipo": "CLIENTE",  // ✅ Automáticamente convertido
    "correo": "juan@example.com"
  }
}
```

### 4. Cerrar Ganado (100%)

```bash
curl -X POST http://localhost:5000/api/oportunidades/opp_123/cambiar-etapa \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "etapa": "CIERRE_GANADO",
    "notas": "Contrato firmado el 20/12/2024"
  }'
```

### 5. Cerrar Perdido (0%)

```bash
curl -X POST http://localhost:5000/api/oportunidades/opp_123/cambiar-etapa \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "etapa": "CIERRE_PERDIDO",
    "notas": "Cliente compró con otra inmobiliaria"
  }'
```

## Crear Oportunidad (Auto-Probabilidad)

### Crear en CONTACTO_INICIAL

```bash
curl -X POST http://localhost:5000/api/oportunidades \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "clienteId": "cli_456",
    "titulo": "Propiedad en Barrio Americano",
    "etapa": "CONTACTO_INICIAL",
    "valor": 350000,
    "proyecto": "Residencial Nueva Esperanza"
  }'
```

**Respuesta:** Se asigna automáticamente probabilidad = 25%
```json
{
  "id": "opp_789",
  "clienteId": "cli_456",
  "titulo": "Propiedad en Barrio Americano",
  "etapa": "CONTACTO_INICIAL",
  "probabilidad": 25,
  "valor": 350000,
  "proyecto": "Residencial Nueva Esperanza"
}
```

### Crear en etapa específica

```bash
curl -X POST http://localhost:5000/api/oportunidades \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "clienteId": "cli_456",
    "titulo": "Casa en Zona Rosa",
    "etapa": "AGENDAMIENTO",
    "valor": 450000
  }'
```

**Respuesta:** Se asigna automáticamente probabilidad = 40%
```json
{
  "probabilidad": 40
}
```

## Historial de Cambios

### Obtener historial de una oportunidad

```bash
curl -X GET http://localhost:5000/api/leads/oportunidades/opp_123/historial \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Respuesta:**
```json
{
  "historial": [
    {
      "id": "hist_1",
      "oportunidadId": "opp_123",
      "clienteId": "cli_456",
      "etapaAnterior": "CONTACTO_INICIAL",
      "etapaNueva": "AGENDAMIENTO",
      "probabilidadAnterior": 25,
      "probabilidadNueva": 40,
      "cambiadoEn": "2024-12-19T10:30:00Z",
      "cambiadoPor": "user_789"
    },
    {
      "id": "hist_2",
      "oportunidadId": "opp_123",
      "clienteId": "cli_456",
      "etapaAnterior": "AGENDAMIENTO",
      "etapaNueva": "SEPARACION",
      "probabilidadAnterior": 40,
      "probabilidadNueva": 60,
      "cambiadoEn": "2024-12-20T14:15:00Z",
      "cambiadoPor": "user_789"
    }
  ]
}
```

## Estadísticas del Pipeline

### Obtener estadísticas de conversión

```bash
curl -X GET http://localhost:5000/api/leads/estadisticas/conversion \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Respuesta:**
```json
{
  "estadisticas": {
    "totalLeads": 45,
    "leadsConOportunidad": 38,
    "leadsSinOportunidad": 7,
    "oportunidadesGanadasDesdeLead": 12,
    "valorGanado": 3500000,
    "tazaConversion": 26.67
  }
}
```

## Reportes por Etapa

### Obtener valor total por etapa

```bash
curl -X GET http://localhost:5000/api/oportunidades/reportes/etapas \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Respuesta esperada:**
```json
{
  "total": 38,
  "totalValor": 8500000,
  "valorGanado": 3500000,
  "valorPipeline": 5000000,
  "porEtapa": [
    {
      "etapa": "CONTACTO_INICIAL",
      "cantidad": 10,
      "valor": 1000000,
      "probabilidadPromedio": 25
    },
    {
      "etapa": "AGENDAMIENTO",
      "cantidad": 12,
      "valor": 2000000,
      "probabilidadPromedio": 40
    },
    {
      "etapa": "SEPARACION",
      "cantidad": 8,
      "valor": 2000000,
      "probabilidadPromedio": 60
    },
    {
      "etapa": "CIERRE_GANADO",
      "cantidad": 8,
      "valor": 3500000,
      "probabilidadPromedio": 100
    }
  ]
}
```

## Conversión Lead → Cliente

### Flujo completo de conversión

```bash
# 1. Lead llega al sistema (tipo = LEAD)
curl -X POST http://localhost:5000/api/contacts \
  -d '{
    "nombre": "Carlos",
    "apellido": "García",
    "correo": "carlos@example.com",
    "tipo": "LEAD"
  }'

# Respuesta: "id": "cli_999"

# 2. Convertir a oportunidad (CONTACTO_INICIAL)
curl -X POST http://localhost:5000/api/leads/cli_999/convertir-a-oportunidad \
  -d '{
    "titulo": "Compra Departamento"
  }'

# Respuesta: { "etapa": "CONTACTO_INICIAL", "probabilidad": 25 }

# 3. Progresar por pipeline...
# CONTACTO_INICIAL → AGENDAMIENTO → SEPARACION → ...

# 4. Finalmente a FIDELIZACION
curl -X POST http://localhost:5000/api/oportunidades/opp_999/cambiar-etapa \
  -d '{
    "etapa": "FIDELIZACION"
  }'

# Respuesta incluye: "tipo": "CLIENTE" ✅

# 5. Verificar que ahora es CLIENTE
curl -X GET http://localhost:5000/api/contacts/cli_999 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Respuesta: { "tipo": "CLIENTE" } ✅
```

## Errores Comunes

### Error: Etapa inválida
```json
{
  "error": "Etapa inválida. Debe ser una de las etapas del pipeline"
}
```

**Solución:** Usar una de estas etapas:
- CONTACTO_INICIAL
- AGENDAMIENTO
- SEPARACION
- CIERRE_GANADO
- CIERRE_PERDIDO
- FIDELIZACION

### Error: Oportunidad no encontrada
```json
{
  "error": "Oportunidad no encontrada"
}
```

**Solución:** Verificar que el ID de oportunidad sea correcto

### Error: Cliente no es CLIENTE
```json
{
  "error": "Cliente no encontrado o no es un cliente válido"
}
```

**Solución:** El cliente debe existir en la base de datos

## Notas Importantes

1. **La probabilidad SIEMPRE se calcula automáticamente según la etapa**
   - NO envíes un campo `probabilidad` en el request
   - Será calculado por el backend

2. **La conversión a CLIENTE es automática en FIDELIZACION**
   - No necesitas hacer nada extra
   - El backend la maneja automáticamente

3. **El historial se registra automáticamente**
   - Cada cambio de etapa se guarda en `historial_pipeline_leads`
   - Incluye usuario, fecha, y detalles del cambio

4. **Los valores son inmutables en etapas finales**
   - CIERRE_GANADO: 100% (no se puede cambiar)
   - CIERRE_PERDIDO: 0% (no se puede cambiar)
   - FIDELIZACION: 100% (no se puede cambiar)
