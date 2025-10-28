# 📁 Estructura del Proyecto Cliente - CRM Inmobiliario

## 🎯 Resumen de la Reestructuración

Este documento detalla la nueva estructura del frontend del CRM Inmobiliario, ahora organizado de manera limpia, escalable y siguiendo las mejores prácticas de Next.js 15 y TypeScript.

---

## 📂 Nueva Estructura de Carpetas

```
client/
├── app/                          # Rutas de Next.js (App Router)
│   ├── dashboard/               # Páginas del dashboard
│   ├── login/                   # Página de login
│   ├── globals.css              # Estilos globales
│   ├── layout.tsx               # Layout raíz
│   └── page.tsx                 # Página principal (redirección)
│
├── components/                   # Componentes React
│   ├── ui/                      # Componentes base de UI (shadcn/ui)
│   ├── features/                # Componentes específicos por funcionalidad
│   │   ├── contacts/           # Componentes de contactos
│   │   ├── leads/              # Componentes de leads
│   │   ├── projects/           # Componentes de proyectos
│   │   └── quotes/             # Componentes de cotizaciones
│   ├── layout/                  # Componentes de layout
│   │   ├── Sidebar.tsx         # Barra lateral
│   │   ├── Header.tsx          # Encabezado
│   │   ├── UserProfile.tsx     # Perfil de usuario
│   │   └── index.ts            # Exportaciones
│   └── shared/                  # Componentes compartidos
│
├── features/                     # Lógica de negocio por módulo (Feature-First)
│   ├── auth/                    # Lógica de autenticación
│   ├── contacts/                # Lógica de contactos
│   ├── leads/                   # Lógica de leads
│   ├── projects/                # Lógica de proyectos
│   └── dashboard/               # Lógica del dashboard
│
├── hooks/                        # Custom React Hooks
│   ├── useContacts.ts           # Hook para gestión de contactos
│   ├── use-mobile.ts            # Hook para detección móvil
│   └── use-toast.ts             # Hook para notificaciones
│
├── services/                     # Servicios de API y lógica externa
│   ├── api/                     # Cliente HTTP y configuración
│   │   └── client.ts           # Cliente Axios/Fetch configurado
│   ├── auth.service.ts          # Servicio de autenticación
│   ├── contacts.service.ts      # Servicio de contactos
│   └── leads.service.ts         # Servicio de leads
│
├── types/                        # Tipos TypeScript centralizados
│   ├── common.types.ts          # Tipos comunes
│   ├── auth.types.ts            # Tipos de autenticación
│   ├── contact.types.ts         # Tipos de contactos
│   ├── lead.types.ts            # Tipos de leads
│   ├── project.types.ts         # Tipos de proyectos
│   ├── quote.types.ts           # Tipos de cotizaciones
│   ├── dashboard.types.ts       # Tipos del dashboard
│   └── index.ts                 # Exportaciones centralizadas
│
├── lib/                          # Utilidades y configuración
│   ├── utils.ts                 # Funciones utilitarias
│   ├── auth.ts                  # Utilidades de autenticación
│   ├── constants.ts             # Constantes del sistema
│   └── config.ts                # Configuración general
│
├── context/                      # Contextos de React
│   ├── AuthContext.tsx          # Contexto de autenticación
│   └── ThemeContext.tsx         # Contexto de tema
│
├── schemas/                      # Esquemas de validación (Zod)
│   ├── contact.schema.ts        # Schema de contactos
│   ├── lead.schema.ts           # Schema de leads
│   └── auth.schema.ts           # Schema de autenticación
│
├── mocks/                        # Datos de prueba
│   ├── contacts.mock.ts         # Datos mock de contactos
│   ├── leads.mock.ts            # Datos mock de leads
│   └── projects.mock.ts         # Datos mock de proyectos
│
└── public/                       # Assets estáticos
    ├── placeholder-logo.svg
    └── placeholder-user.jpg
```

---

## 🔧 Mejoras Implementadas

### 1. **Tipos TypeScript Centralizados**
✅ Todos los tipos están en `/types` con interfaces bien definidas
✅ Eliminación de tipos `any` y duplicados
✅ Enums para valores constantes (Status, Sources, etc.)
✅ Exportaciones centralizadas en `types/index.ts`

**Ejemplo de uso:**
```typescript
import type { Contact, ContactFormData, ContactSource } from '@/types'
```

### 2. **Componentes Modulares y Reutilizables**
✅ Dashboard Layout dividido en: `Sidebar`, `Header`, `UserProfile`
✅ Página de Contactos dividida en: `ContactCard`, `ContactForm`, `ContactStats`, etc.
✅ Cada componente tiene una única responsabilidad
✅ Reducción de líneas de código por archivo (< 150 líneas)

**Antes:**
- `dashboard/layout.tsx`: 146 líneas (todo en un archivo)
- `contacts/page.tsx`: 424 líneas (todo en un archivo)

**Después:**
- `dashboard/layout.tsx`: 54 líneas (usa componentes)
- `contacts/page.tsx`: 82 líneas (usa componentes)
- Componentes individuales: ~50-100 líneas cada uno

### 3. **Custom Hooks para Lógica de Negocio**
✅ Lógica separada de la presentación
✅ Reutilización de lógica entre componentes
✅ Mejor testeo

**Ejemplo:**
```typescript
// hooks/useContacts.ts
export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const createContact = (data: ContactFormData) => { /* ... */ }
  const importFromGoogle = () => { /* ... */ }
  return { contacts, createContact, importFromGoogle }
}

// En el componente
const { contacts, createContact } = useContacts()
```

### 4. **Arquitectura Feature-First**
✅ Carpeta `/features` para lógica de negocio compleja
✅ Cada feature es independiente y escalable
✅ Facilita el trabajo en equipo

```
features/
├── auth/
│   ├── hooks/
│   ├── components/
│   ├── services/
│   └── types/
└── contacts/
    ├── hooks/
    ├── components/
    └── services/
```

---

## 📋 Convenciones de Código

### Nomenclatura de Archivos
- **Componentes**: PascalCase → `ContactCard.tsx`
- **Hooks**: camelCase con prefijo `use` → `useContacts.ts`
- **Tipos**: camelCase con sufijo `.types` → `contact.types.ts`
- **Servicios**: camelCase con sufijo `.service` → `contacts.service.ts`
- **Utilidades**: camelCase → `utils.ts`

### Estructura de Componentes
```typescript
/**
 * Descripción del componente
 */

"use client" // Si usa hooks de React

import { ... } from '...'
import type { ... } from '@/types'

interface ComponentProps {
  // Props con documentación
}

export function Component({ ...props }: ComponentProps) {
  // Lógica del componente
  
  return (
    // JSX
  )
}
```

### Importaciones
```typescript
// 1. Librerías externas
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// 2. Componentes UI
import { Button } from '@/components/ui/button'

// 3. Componentes propios
import { ContactCard } from '@/components/features/contacts'

// 4. Hooks
import { useContacts } from '@/hooks/useContacts'

// 5. Tipos
import type { Contact } from '@/types'

// 6. Utilidades
import { cn } from '@/lib/utils'
```

---

## 🎨 Guía de Colores del Sistema

```typescript
// Colores primarios
PRIMARY: '#FCBA00'      // Amarillo/Dorado
SECONDARY: '#303030'    // Gris oscuro
ACCENT: '#E0A800'       // Amarillo oscuro (hover)

// Colores de estado
SUCCESS: '#22C55E'      // Verde
WARNING: '#EAB308'      // Amarillo
ERROR: '#EF4444'        // Rojo
INFO: '#3B82F6'         // Azul
```

---

## 🚀 Próximos Pasos

### Prioridad Alta
- [ ] Implementar servicios API (`/services`)
- [ ] Crear variables de entorno (`.env.local`)
- [ ] Agregar constantes centralizadas (`lib/constants.ts`)

### Prioridad Media
- [ ] Implementar Context API para estado global
- [ ] Crear schemas de validación con Zod
- [ ] Refactorizar páginas de Leads, Projects, Quotes

### Prioridad Baja
- [ ] Agregar tests unitarios
- [ ] Implementar i18n (internacionalización)
- [ ] Optimizar performance con React.memo
- [ ] Agregar documentación de componentes con Storybook

---

## 📚 Recursos y Referencias

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [React Hooks](https://react.dev/reference/react)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

## 👥 Contribución

Al agregar nuevos features:
1. Crear tipos en `/types`
2. Crear componentes en `/components/features/[feature]`
3. Crear hooks si hay lógica compleja
4. Crear servicios para llamadas API
5. Actualizar este README

---

**Última actualización:** Octubre 6, 2025
**Versión:** 2.0.0 (Reestructuración completa)
