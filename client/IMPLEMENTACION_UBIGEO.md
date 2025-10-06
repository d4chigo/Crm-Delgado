# 📍 Implementación de Selector UBIGEO (Perú)

## API Gratuita: apis.net.pe

### Endpoints Disponibles:

```bash
# Base URL
https://api.apis.net.pe/v2/

# Departamentos
GET https://api.apis.net.pe/v2/ubigeo/departamentos

# Provincias de un departamento
GET https://api.apis.net.pe/v2/ubigeo/departamento/{id}/provincias

# Distritos de una provincia
GET https://api.apis.net.pe/v2/ubigeo/provincia/{id}/distritos
```

### Respuesta de Ejemplo:

```json
// Departamentos
[
  {
    "id": "01",
    "nombre": "Amazonas"
  },
  {
    "id": "15",
    "nombre": "Lima"
  }
]

// Provincias
[
  {
    "id": "1501",
    "nombre": "Lima",
    "departamento_id": "15"
  },
  {
    "id": "1502",
    "nombre": "Barranca",
    "departamento_id": "15"
  }
]

// Distritos
[
  {
    "id": "150101",
    "nombre": "Lima",
    "provincia_id": "1501"
  },
  {
    "id": "150102",
    "nombre": "Ancón",
    "provincia_id": "1501"
  }
]
```

---

## 🛠️ Implementación

### 1. Servicio API (client/services/api/ubigeo.service.ts)

```typescript
/**
 * Servicio para consultar UBIGEO de Perú
 * API: apis.net.pe (gratuita)
 */

interface Departamento {
  id: string
  nombre: string
}

interface Provincia {
  id: string
  nombre: string
  departamento_id: string
}

interface Distrito {
  id: string
  nombre: string
  provincia_id: string
}

const API_BASE_URL = 'https://api.apis.net.pe/v2/ubigeo'

class UbigeoService {
  /**
   * Obtener todos los departamentos de Perú
   */
  async obtenerDepartamentos(): Promise<Departamento[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/departamentos`)
      
      if (!response.ok) {
        throw new Error('Error al obtener departamentos')
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error en obtenerDepartamentos:', error)
      throw error
    }
  }

  /**
   * Obtener provincias de un departamento
   */
  async obtenerProvincias(departamentoId: string): Promise<Provincia[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/departamento/${departamentoId}/provincias`
      )
      
      if (!response.ok) {
        throw new Error('Error al obtener provincias')
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error en obtenerProvincias:', error)
      throw error
    }
  }

  /**
   * Obtener distritos de una provincia
   */
  async obtenerDistritos(provinciaId: string): Promise<Distrito[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/provincia/${provinciaId}/distritos`
      )
      
      if (!response.ok) {
        throw new Error('Error al obtener distritos')
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error en obtenerDistritos:', error)
      throw error
    }
  }
}

export const ubigeoService = new UbigeoService()
export type { Departamento, Provincia, Distrito }
```

---

### 2. Componente Selector (client/components/shared/SelectorUbigeo.tsx)

```typescript
"use client"

import { useState, useEffect } from "react"
import { ubigeoService, type Departamento, type Provincia, type Distrito } from "@/services/api/ubigeo.service"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface SelectorUbigeoProps {
  // Valores iniciales (para edición)
  departamentoInicial?: string
  provinciaInicial?: string
  distritoInicial?: string
  
  // Callbacks cuando cambian los valores
  onDepartamentoChange?: (nombre: string, id: string) => void
  onProvinciaChange?: (nombre: string, id: string) => void
  onDistritoChange?: (nombre: string, id: string) => void
  
  // Deshabilitar campos
  disabled?: boolean
}

export function SelectorUbigeo({
  departamentoInicial,
  provinciaInicial,
  distritoInicial,
  onDepartamentoChange,
  onProvinciaChange,
  onDistritoChange,
  disabled = false
}: SelectorUbigeoProps) {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [provincias, setProvincias] = useState<Provincia[]>([])
  const [distritos, setDistritos] = useState<Distrito[]>([])
  
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState<string>(departamentoInicial || "")
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState<string>(provinciaInicial || "")
  const [distritoSeleccionado, setDistritoSeleccionado] = useState<string>(distritoInicial || "")
  
  const [cargandoDepartamentos, setCargandoDepartamentos] = useState(false)
  const [cargandoProvincias, setCargandoProvincias] = useState(false)
  const [cargandoDistritos, setCargandoDistritos] = useState(false)

  // Cargar departamentos al montar
  useEffect(() => {
    cargarDepartamentos()
  }, [])

  // Cargar provincias cuando cambia el departamento
  useEffect(() => {
    if (departamentoSeleccionado) {
      cargarProvincias(departamentoSeleccionado)
    } else {
      setProvincias([])
      setDistritoSeleccionado("")
      setDistritos([])
    }
  }, [departamentoSeleccionado])

  // Cargar distritos cuando cambia la provincia
  useEffect(() => {
    if (provinciaSeleccionada) {
      cargarDistritos(provinciaSeleccionada)
    } else {
      setDistritos([])
    }
  }, [provinciaSeleccionada])

  const cargarDepartamentos = async () => {
    setCargandoDepartamentos(true)
    try {
      const data = await ubigeoService.obtenerDepartamentos()
      setDepartamentos(data)
    } catch (error) {
      console.error('Error al cargar departamentos:', error)
    } finally {
      setCargandoDepartamentos(false)
    }
  }

  const cargarProvincias = async (departamentoId: string) => {
    setCargandoProvincias(true)
    try {
      const data = await ubigeoService.obtenerProvincias(departamentoId)
      setProvincias(data)
    } catch (error) {
      console.error('Error al cargar provincias:', error)
    } finally {
      setCargandoProvincias(false)
    }
  }

  const cargarDistritos = async (provinciaId: string) => {
    setCargandoDistritos(true)
    try {
      const data = await ubigeoService.obtenerDistritos(provinciaId)
      setDistritos(data)
    } catch (error) {
      console.error('Error al cargar distritos:', error)
    } finally {
      setCargandoDistritos(false)
    }
  }

  const handleDepartamentoChange = (id: string) => {
    const depto = departamentos.find(d => d.id === id)
    if (depto) {
      setDepartamentoSeleccionado(id)
      setProvinciaSeleccionada("")
      setDistritoSeleccionado("")
      onDepartamentoChange?.(depto.nombre, id)
    }
  }

  const handleProvinciaChange = (id: string) => {
    const prov = provincias.find(p => p.id === id)
    if (prov) {
      setProvinciaSeleccionada(id)
      setDistritoSeleccionado("")
      onProvinciaChange?.(prov.nombre, id)
    }
  }

  const handleDistritoChange = (id: string) => {
    const dist = distritos.find(d => d.id === id)
    if (dist) {
      setDistritoSeleccionado(id)
      onDistritoChange?.(dist.nombre, id)
    }
  }

  return (
    <div className="space-y-4">
      {/* Departamento */}
      <div className="space-y-2">
        <Label>Departamento *</Label>
        <Select
          value={departamentoSeleccionado}
          onValueChange={handleDepartamentoChange}
          disabled={disabled || cargandoDepartamentos}
        >
          <SelectTrigger>
            <SelectValue placeholder={
              cargandoDepartamentos 
                ? "Cargando..." 
                : "Selecciona un departamento"
            } />
          </SelectTrigger>
          <SelectContent>
            {departamentos.map((depto) => (
              <SelectItem key={depto.id} value={depto.id}>
                {depto.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {cargandoDepartamentos && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Provincia */}
      <div className="space-y-2">
        <Label>Provincia *</Label>
        <Select
          value={provinciaSeleccionada}
          onValueChange={handleProvinciaChange}
          disabled={!departamentoSeleccionado || disabled || cargandoProvincias}
        >
          <SelectTrigger>
            <SelectValue placeholder={
              !departamentoSeleccionado 
                ? "Primero selecciona un departamento"
                : cargandoProvincias 
                ? "Cargando..." 
                : "Selecciona una provincia"
            } />
          </SelectTrigger>
          <SelectContent>
            {provincias.map((prov) => (
              <SelectItem key={prov.id} value={prov.id}>
                {prov.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {cargandoProvincias && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Distrito */}
      <div className="space-y-2">
        <Label>Distrito</Label>
        <Select
          value={distritoSeleccionado}
          onValueChange={handleDistritoChange}
          disabled={!provinciaSeleccionada || disabled || cargandoDistritos}
        >
          <SelectTrigger>
            <SelectValue placeholder={
              !provinciaSeleccionada 
                ? "Primero selecciona una provincia"
                : cargandoDistritos 
                ? "Cargando..." 
                : "Selecciona un distrito (opcional)"
            } />
          </SelectTrigger>
          <SelectContent>
            {distritos.map((dist) => (
              <SelectItem key={dist.id} value={dist.id}>
                {dist.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {cargandoDistritos && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>
    </div>
  )
}
```

---

### 3. Uso en Formulario de Contacto

```typescript
// En FormularioContacto.tsx

import { SelectorUbigeo } from "@/components/shared/SelectorUbigeo"
import { useState } from "react"

export function FormularioContacto({ onCrear }: FormularioContactoProps) {
  const [datosUbigeo, setDatosUbigeo] = useState({
    departamento: "",
    provincia: "",
    distrito: ""
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget)
    
    const datos: CrearContactoDTO = {
      // ... otros campos
      ciudad: datosUbigeo.provincia, // o puedes usar provincia + distrito
      // ... otros campos
    }
    
    await onCrear(datos)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* ... otros campos ... */}
      
      {/* Selector UBIGEO */}
      <SelectorUbigeo
        onDepartamentoChange={(nombre) => 
          setDatosUbigeo(prev => ({ ...prev, departamento: nombre }))
        }
        onProvinciaChange={(nombre) => 
          setDatosUbigeo(prev => ({ ...prev, provincia: nombre }))
        }
        onDistritoChange={(nombre) => 
          setDatosUbigeo(prev => ({ ...prev, distrito: nombre }))
        }
      />
      
      {/* Campo de dirección manual */}
      <div className="space-y-2">
        <Label>Dirección completa</Label>
        <Input
          name="direccion"
          placeholder="Av. ejemplo 123, Edificio X, Dpto. 456"
        />
      </div>
      
      {/* ... resto del formulario ... */}
    </form>
  )
}
```

---

### 4. Actualizar Base de Datos (opcional)

Si quieres guardar el UBIGEO completo:

```sql
-- En la tabla contactos, agregar campos
ALTER TABLE contactos 
  ADD COLUMN departamento VARCHAR(100) NULL,
  ADD COLUMN provincia VARCHAR(100) NULL,
  ADD COLUMN distrito VARCHAR(100) NULL;

-- O si prefieres, cambiar ciudad por departamento
ALTER TABLE contactos 
  CHANGE COLUMN ciudad departamento VARCHAR(100) NULL;
  
-- Y agregar provincia y distrito
ALTER TABLE contactos 
  ADD COLUMN provincia VARCHAR(100) NULL,
  ADD COLUMN distrito VARCHAR(100) NULL;
```

---

### 5. Actualizar Validador Backend (opcional)

```typescript
// server/src/validators/contacto.validator.ts

export const crearContactoSchema = z.object({
  // ... otros campos
  departamento: z.string().optional(),
  provincia: z.string().optional(),
  distrito: z.string().optional(),
  direccion: z.string().optional(),
  // ... resto
})
```

---

## 🎯 Alternativa Simple: Lista Estática

Si no quieres usar API, puedes crear un archivo con todos los departamentos:

```typescript
// client/lib/ubigeo-peru.ts

export const DEPARTAMENTOS_PERU = [
  "Amazonas",
  "Áncash",
  "Apurímac",
  "Arequipa",
  "Ayacucho",
  "Cajamarca",
  "Callao",
  "Cusco",
  "Huancavelica",
  "Huánuco",
  "Ica",
  "Junín",
  "La Libertad",
  "Lambayeque",
  "Lima",
  "Loreto",
  "Madre de Dios",
  "Moquegua",
  "Pasco",
  "Piura",
  "Puno",
  "San Martín",
  "Tacna",
  "Tumbes",
  "Ucayali"
]

// Y usar directamente en un Select simple
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Departamento" />
  </SelectTrigger>
  <SelectContent>
    {DEPARTAMENTOS_PERU.map(depto => (
      <SelectItem key={depto} value={depto}>
        {depto}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

---

## 💡 Recomendación Final

**Para producción profesional:** Usa la API de apis.net.pe

**Ventajas:**
- ✅ Datos oficiales y actualizados
- ✅ Jerarquía correcta (Departamento → Provincia → Distrito)
- ✅ Sin errores de tipeo por parte del usuario
- ✅ Profesional y preciso
- ✅ Gratuita y confiable

**Para MVP rápido:** Usa lista estática de departamentos

**Ventajas:**
- ✅ Más simple de implementar
- ✅ No depende de API externa
- ✅ Suficiente si solo necesitas departamento

---

¿Quieres que implemente el selector UBIGEO completo? 🚀
