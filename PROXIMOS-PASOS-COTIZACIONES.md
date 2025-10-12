# 🚀 Próximos Pasos - Sistema de Cotizaciones

## ✅ Completado (Backend)

- ✅ Schema Prisma con modelo `Cotizacion` y enums `TipoCuota` y `EstadoCotizacion`
- ✅ Base de datos sincronizada con `prisma db push`
- ✅ Tipos TypeScript backend (`cotizacion.types.ts`)
- ✅ Servicio completo con cálculos financieros (`cotizacion.service.ts`)
- ✅ Controlador con 7 endpoints (`cotizacion.controller.ts`)
- ✅ Rutas registradas y protegidas (`cotizacion.routes.ts`)
- ✅ Documentación completa (`COTIZACIONES.md`)

## 📋 Pendiente (Frontend)

### 1. Tipos TypeScript Frontend
**Archivo:** `client/types/cotizacion.types.ts`

```typescript
export type TipoCuota = 'FIJA' | 'FLEXIBLE' | 'FLEXIBLE_ESPECIAL';
export type EstadoCotizacion = 'BORRADOR' | 'ENVIADA' | 'ACEPTADA' | 'RECHAZADA' | 'VENCIDA';

export interface CrearCotizacionDTO {
  contactoId: string;
  nombreProyecto: string;
  tipoInmueble?: string;
  descripcion?: string;
  precioInmueble: number;
  cuotaInicial: number;
  plazoMeses: number;
  tipoCuota: TipoCuota;
  tasaInteresAnual: number;
  permitePostergar?: boolean;
  cuotasPostergables?: number;
  permiteDoble?: boolean;
  cuotasDoblesAnuales?: number;
  permiteCambioFecha?: boolean;
  notas?: string;
  fechaValidez?: string;
}

export interface Cotizacion {
  id: string;
  contactoId: string;
  numeroReferencia: string;
  nombreProyecto: string;
  tipoInmueble?: string;
  descripcion?: string;
  precioInmueble: number;
  cuotaInicial: number;
  montoFinanciar: number;
  plazoMeses: number;
  tipoCuota: TipoCuota;
  tasaInteresAnual: number;
  permitePostergar: boolean;
  cuotasPostergables?: number;
  permiteDoble: boolean;
  cuotasDoblesAnuales?: number;
  permiteCambioFecha: boolean;
  cuotaMensualEstimada: number;
  totalIntereses: number;
  totalPagar: number;
  estado: EstadoCotizacion;
  notas?: string;
  fechaValidez?: string;
  creadoEn: string;
  actualizadoEn: string;
  porcentajeCuotaInicial?: number;
}

export interface FiltrosCotizacion {
  contactoId?: string;
  estado?: EstadoCotizacion;
  tipoCuota?: TipoCuota;
  fechaDesde?: string;
  fechaHasta?: string;
  busqueda?: string;
  pagina?: number;
  limite?: number;
}
```

### 2. Servicio API Frontend
**Archivo:** `client/services/api/cotizacion.service.ts`

```typescript
import axios from 'axios';
import type { 
  CrearCotizacionDTO, 
  Cotizacion, 
  FiltrosCotizacion 
} from '@/types/cotizacion.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const cotizacionService = {
  async crear(datos: CrearCotizacionDTO): Promise<Cotizacion> {
    const response = await axios.post(`${API_URL}/api/cotizaciones`, datos);
    return response.data;
  },

  async obtener(filtros: FiltrosCotizacion = {}) {
    const response = await axios.get(`${API_URL}/api/cotizaciones`, {
      params: filtros
    });
    return response.data;
  },

  async obtenerPorId(id: string): Promise<Cotizacion> {
    const response = await axios.get(`${API_URL}/api/cotizaciones/${id}`);
    return response.data;
  },

  async obtenerPorContacto(contactoId: string): Promise<Cotizacion[]> {
    const response = await axios.get(
      `${API_URL}/api/cotizaciones/contacto/${contactoId}`
    );
    return response.data;
  },

  async actualizar(id: string, datos: Partial<CrearCotizacionDTO>): Promise<Cotizacion> {
    const response = await axios.put(`${API_URL}/api/cotizaciones/${id}`, datos);
    return response.data;
  },

  async cambiarEstado(id: string, estado: EstadoCotizacion): Promise<Cotizacion> {
    const response = await axios.patch(
      `${API_URL}/api/cotizaciones/${id}/estado`,
      { estado }
    );
    return response.data;
  },

  async eliminar(id: string): Promise<void> {
    await axios.delete(`${API_URL}/api/cotizaciones/${id}`);
  }
};
```

### 3. Hook Custom
**Archivo:** `client/hooks/useCotizaciones.ts`

```typescript
import { useState, useCallback } from 'react';
import { cotizacionService } from '@/services/api/cotizacion.service';
import type { 
  Cotizacion, 
  CrearCotizacionDTO, 
  FiltrosCotizacion,
  EstadoCotizacion 
} from '@/types/cotizacion.types';

export const useCotizaciones = () => {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [cotizacionActual, setCotizacionActual] = useState<Cotizacion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginacion, setPaginacion] = useState({
    pagina: 1,
    limite: 10,
    total: 0,
    totalPaginas: 0
  });

  const cargar = useCallback(async (filtros: FiltrosCotizacion = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await cotizacionService.obtener(filtros);
      setCotizaciones(data.cotizaciones);
      setPaginacion(data.paginacion);
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al cargar cotizaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarPorContacto = useCallback(async (contactoId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await cotizacionService.obtenerPorContacto(contactoId);
      setCotizaciones(data);
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al cargar cotizaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  const crear = useCallback(async (datos: CrearCotizacionDTO) => {
    setLoading(true);
    setError(null);
    try {
      const nueva = await cotizacionService.crear(datos);
      setCotizaciones(prev => [nueva, ...prev]);
      return nueva;
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al crear cotización');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const actualizar = useCallback(async (
    id: string, 
    datos: Partial<CrearCotizacionDTO>
  ) => {
    setLoading(true);
    setError(null);
    try {
      const actualizada = await cotizacionService.actualizar(id, datos);
      setCotizaciones(prev => 
        prev.map(c => c.id === id ? actualizada : c)
      );
      return actualizada;
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al actualizar cotización');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cambiarEstado = useCallback(async (
    id: string, 
    estado: EstadoCotizacion
  ) => {
    setLoading(true);
    setError(null);
    try {
      const actualizada = await cotizacionService.cambiarEstado(id, estado);
      setCotizaciones(prev => 
        prev.map(c => c.id === id ? actualizada : c)
      );
      return actualizada;
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al cambiar estado');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const eliminar = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await cotizacionService.eliminar(id);
      setCotizaciones(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al eliminar cotización');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    cotizaciones,
    cotizacionActual,
    loading,
    error,
    paginacion,
    cargar,
    cargarPorContacto,
    crear,
    actualizar,
    cambiarEstado,
    eliminar,
    setCotizacionActual
  };
};
```

### 4. Componentes UI (Sugeridos)

#### a) Formulario de Cotización
**Archivo:** `client/components/features/cotizaciones/FormularioCotizacion.tsx`
- Paso 1: Datos del inmueble (nombre, tipo, precio)
- Paso 2: Financiamiento (cuota inicial, plazo, tasa)
- Paso 3: Tipo de cuota y opciones especiales
- Cálculo automático en tiempo real
- Vista previa de cuota mensual

#### b) Lista de Cotizaciones
**Archivo:** `client/components/features/cotizaciones/ListaCotizaciones.tsx`
- Tabla con columnas: Número, Proyecto, Monto, Cuota, Estado
- Filtros: Estado, Tipo de cuota, Fechas
- Acciones: Ver detalle, Editar (solo BORRADOR), Cambiar estado, Eliminar
- Badges de colores por estado

#### c) Detalle de Cotización
**Archivo:** `client/components/features/cotizaciones/DetalleCotizacion.tsx`
- Información completa de la cotización
- Plan de pagos (tabla con amortización)
- Gráfico de evolución del saldo
- Opciones: Enviar, Descargar PDF, Editar, Cambiar estado

#### d) Tarjeta de Cotización
**Archivo:** `client/components/features/cotizaciones/TarjetaCotizacion.tsx`
- Vista resumida para listas
- Info clave: Proyecto, Monto, Cuota, Estado
- Acciones rápidas: Ver, Editar, Eliminar

### 5. Integración en Leads/Clientes

**En la vista de detalle de Lead/Cliente:**
```typescript
// client/app/dashboard/leads/[id]/page.tsx
import { useCotizaciones } from '@/hooks/useCotizaciones';
import ListaCotizaciones from '@/components/features/cotizaciones/ListaCotizaciones';

const { cotizaciones, cargarPorContacto } = useCotizaciones();

useEffect(() => {
  if (leadId) {
    cargarPorContacto(leadId);
  }
}, [leadId]);

// Agregar sección de cotizaciones
<div className="mt-6">
  <h3>Cotizaciones</h3>
  <Button onClick={() => setModalCotizacion(true)}>
    Nueva Cotización
  </Button>
  <ListaCotizaciones cotizaciones={cotizaciones} />
</div>
```

## 🎨 Paleta de Colores por Estado

```typescript
const estadoStyles = {
  BORRADOR: {
    badge: 'bg-gray-100 text-gray-800',
    icon: 'text-gray-500'
  },
  ENVIADA: {
    badge: 'bg-blue-100 text-blue-800',
    icon: 'text-blue-500'
  },
  ACEPTADA: {
    badge: 'bg-green-100 text-green-800',
    icon: 'text-green-500'
  },
  RECHAZADA: {
    badge: 'bg-red-100 text-red-800',
    icon: 'text-red-500'
  },
  VENCIDA: {
    badge: 'bg-orange-100 text-orange-800',
    icon: 'text-orange-500'
  }
};
```

## 🧪 Testing

### Pruebas de Backend
```bash
# Probar creación de cotización
POST http://localhost:5000/api/cotizaciones
{
  "contactoId": "uuid-del-lead",
  "nombreProyecto": "Edificio Sunset",
  "precioInmueble": 180000,
  "cuotaInicial": 36000,
  "plazoMeses": 180,
  "tipoCuota": "FIJA",
  "tasaInteresAnual": 7.5
}

# Listar cotizaciones
GET http://localhost:5000/api/cotizaciones?estado=BORRADOR

# Cambiar estado
PATCH http://localhost:5000/api/cotizaciones/{id}/estado
{
  "estado": "ENVIADA"
}
```

## 📝 Notas Importantes

1. **Orden de implementación sugerido:**
   - Tipos → Servicio API → Hook → Componentes básicos → Integración
   
2. **Validaciones importantes:**
   - Solo BORRADOR es editable
   - Validar transiciones de estado
   - Cuota inicial no puede ser mayor al precio
   - Plazo mínimo: 12 meses
   
3. **Cálculos en tiempo real:**
   - Usar `useMemo` para recalcular cuota al cambiar valores
   - Mostrar advertencias si cuota > 40% del ingreso estimado
   
4. **Persistencia:**
   - Al convertir LEAD → CLIENTE, las cotizaciones se mantienen automáticamente

## 🚀 Comandos Útiles

```bash
# Reiniciar backend después de cambios
docker compose -f docker-compose.dev.yml restart backend

# Ver logs del backend
docker compose -f docker-compose.dev.yml logs -f backend

# Verificar que la tabla existe
docker compose -f docker-compose.dev.yml exec mysql mysql -u crm_user -pcrm_pass_dev_2025 -D crm_delgado -e "SHOW TABLES LIKE 'Cotizacion';"
```

---

**¿Listo para empezar con el frontend?** 🎨
