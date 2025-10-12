# 📋 Sistema de Cotizaciones - CRM Inmobiliaria

## 🎯 Descripción General

Sistema completo de cotizaciones para leads y clientes de una inmobiliaria. Permite crear cotizaciones con diferentes tipos de cuota (Fija, Flexible, Flexible Especial) y hacer seguimiento desde que el contacto es LEAD hasta que se convierte en CLIENTE.

## 🔑 Características Principales

### **Tipos de Cuota**

#### 1. **Cuota Fija**
- Monto mensual constante durante todo el plazo
- Tasa de interés fija
- Mayor seguridad y previsibilidad

#### 2. **Cuota Flexible (Variable)**
- Tasa variable atada a índice de referencia
- Cuota puede variar periódicamente
- Opción de pago mínimo/máximo

#### 3. **Flexible Especial**
- Todos los beneficios de Flexible más:
  - **Postergar pagos**: Saltar 1-2 cuotas al año
  - **Cuotas dobles**: Pagar más hasta 2 veces al año
  - **Cambio de fecha de pago**: Ajustar fecha de corte

### **Estados de Cotización**
- `BORRADOR`: Cotización en proceso de creación (editable)
- `ENVIADA`: Cotización enviada al cliente
- `ACEPTADA`: Cliente aceptó la cotización
- `RECHAZADA`: Cliente rechazó la cotización
- `VENCIDA`: Cotización fuera de fecha de validez

### **Flujo Automático**
```
LEAD crea cotización → Estado BORRADOR
         ↓
LEAD se convierte a CLIENTE
         ↓
Cotización se mantiene vinculada al CLIENTE
         ↓
Seguimiento continuo de la cotización
```

## 📊 Modelo de Datos

```prisma
model Cotizacion {
  id                    String
  contactoId            String
  numeroReferencia      String            @unique // COT-2024-001
  nombreProyecto        String
  tipoInmueble          String?
  precioInmueble        Decimal
  cuotaInicial          Decimal
  montoFinanciar        Decimal
  plazoMeses            Int
  tipoCuota             TipoCuota
  tasaInteresAnual      Decimal
  permitePostergar      Boolean
  permiteDoble          Boolean
  permiteCambioFecha    Boolean
  cuotaMensualEstimada  Decimal
  totalIntereses        Decimal
  totalPagar            Decimal
  estado                EstadoCotizacion
  fechaValidez          DateTime?
  ...
}
```

## 🚀 API Endpoints

### **Crear Cotización**
```http
POST /api/cotizaciones
Authorization: Bearer {token}
Content-Type: application/json

{
  "contactoId": "uuid",
  "nombreProyecto": "Edificio Vista Mar",
  "tipoInmueble": "Departamento",
  "descripcion": "Dpto 301 - 3 dormitorios",
  "precioInmueble": 250000,
  "cuotaInicial": 50000,
  "plazoMeses": 240,
  "tipoCuota": "FLEXIBLE_ESPECIAL",
  "tasaInteresAnual": 8.5,
  "permitePostergar": true,
  "cuotasPostergables": 2,
  "permiteDoble": true,
  "cuotasDoblesAnuales": 2,
  "permiteCambioFecha": true,
  "fechaValidez": "2024-12-31"
}
```

**Respuesta:**
```json
{
  "id": "uuid",
  "numeroReferencia": "COT-202410-0001",
  "cuotaMensualEstimada": 1850.25,
  "totalIntereses": 244060,
  "totalPagar": 444060,
  "porcentajeCuotaInicial": 20,
  "montoFinanciar": 200000,
  "estado": "BORRADOR",
  ...
}
```

### **Obtener Cotizaciones**
```http
GET /api/cotizaciones?contactoId={id}&estado=BORRADOR&pagina=1&limite=10
```

### **Obtener Cotizaciones de un Contacto**
```http
GET /api/cotizaciones/contacto/{contactoId}
```

### **Actualizar Cotización**
```http
PUT /api/cotizaciones/{id}
```

### **Cambiar Estado**
```http
PATCH /api/cotizaciones/{id}/estado
{
  "estado": "ENVIADA"
}
```

### **Eliminar Cotización**
```http
DELETE /api/cotizaciones/{id}
```

## 💻 Uso en el Frontend

### **Crear Cotización para un Lead**
```typescript
import { cotizacionService } from '@/services/api/cotizacion.service';

const crearCotizacion = async (leadId: string) => {
  const datos = {
    contactoId: leadId,
    nombreProyecto: 'Edificio Sunset',
    precioInmueble: 180000,
    cuotaInicial: 36000,
    plazoMeses: 180,
    tipoCuota: 'FIJA',
    tasaInteresAnual: 7.5
  };
  
  const cotizacion = await cotizacionService.crear(datos);
  console.log('Cotización creada:', cotizacion.numeroReferencia);
};
```

### **Listar Cotizaciones de un Lead/Cliente**
```typescript
const cotizaciones = await cotizacionService.obtenerPorContacto(contactoId);
```

### **Conversión LEAD → CLIENTE**
```typescript
// Las cotizaciones se mantienen automáticamente
// al convertir el lead a cliente
await contactoService.convertirALead(contactoId);

// Las cotizaciones siguen disponibles
const cotizaciones = await cotizacionService.obtenerPorContacto(contactoId);
// Cotizaciones del LEAD ahora son del CLIENTE
```

## 📐 Cálculo de Cuotas

### **Fórmula de Amortización Francesa**
```
cuotaMensual = P × (r × (1 + r)^n) / ((1 + r)^n - 1)

Donde:
  P = Monto a financiar
  r = Tasa de interés mensual (tasaAnual / 12 / 100)
  n = Número de meses
```

### **Ejemplo:**
```
Precio inmueble: $250,000
Cuota inicial: $50,000 (20%)
Monto a financiar: $200,000
Plazo: 20 años (240 meses)
Tasa anual: 8.5%
Tasa mensual: 0.708%

Cuota mensual: $1,732.45
Total a pagar: $415,788
Total intereses: $215,788
```

## 🔄 Migración de Base de Datos

Para aplicar los cambios en la base de datos:

```bash
# Generar migración
cd server
npx prisma migrate dev --name agregar_cotizaciones

# Generar cliente de Prisma
npx prisma generate

# Reiniciar backend
docker compose -f docker-compose.dev.yml restart backend
```

## 🎨 Componentes UI (Próximamente)

- `FormularioCotizacion.tsx` - Formulario de creación/edición
- `TarjetaCotizacion.tsx` - Vista de tarjeta de cotización
- `ListaCotizaciones.tsx` - Lista de cotizaciones
- `DetalleCotizacion.tsx` - Vista detallada con plan de pagos
- `CalculadoraCuota.tsx` - Calculadora interactiva

## 📝 Notas Importantes

1. **Solo BORRADOR es editable**: Una vez enviada, la cotización no se puede editar (solo cambiar estado)
2. **Número de referencia único**: Se genera automáticamente (formato: COT-AAAAMM-####)
3. **Conversión automática**: Al convertir LEAD → CLIENTE, las cotizaciones se mantienen
4. **Validación de fechas**: Se puede establecer fecha de validez para la cotización
5. **Cálculo automático**: El sistema calcula automáticamente la cuota mensual y totales

## 🚧 Próximos Pasos

- [ ] Crear componentes UI en el frontend
- [ ] Agregar generación de PDF de cotización
- [ ] Implementar envío por email
- [ ] Agregar plan de pagos detallado
- [ ] Implementar simulador de cuotas
- [ ] Agregar gráficos de amortización

---

**Fecha de creación**: 11 de octubre de 2024
**Versión**: 1.0.0
