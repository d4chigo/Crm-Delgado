# Sistema de Redes Sociales para el Equipo

## 📋 Descripción General

Se ha implementado un sistema completo que permite agregar y mostrar los perfiles de redes sociales de los miembros del equipo tanto en el CRM administrativo como en la página web pública.

---

## 🎯 Características Principales

### En el CRM (Admin Dashboard)

**Ubicación:** `/dashboard/admin/team`

#### Campos de Redes Sociales Opcionales:
1. **WhatsApp** - Link directo (ej: `https://wa.me/51999999999`)
2. **Facebook** - Perfil o página (ej: `https://facebook.com/usuario`)
3. **Instagram** - Perfil (ej: `https://instagram.com/usuario`)
4. **TikTok** - Canal (ej: `https://tiktok.com/@usuario`)
5. **LinkedIn** - Perfil profesional (ej: `https://linkedin.com/in/usuario`)
6. **YouTube** - Canal (ej: `https://youtube.com/@usuario`)

**Características:**
- ✅ Todos los campos son **opcionales**
- ✅ Validación de URLs
- ✅ Interfaz visual clara con iconos de colores
- ✅ Sección separada "Redes Sociales" en el formulario
- ✅ Almacenamiento en base de datos

### En la Página Web Pública

**Ubicación:** `http://localhost:8081/PGDP/public/team.html`

#### Visualización:
- Tarjetas del equipo con foto circular
- Nombre, cargo y descripción
- Datos de contacto (teléfono y email)
- **Iconos de redes sociales** con colores específicos
- Hover effects animados
- Links directos a cada perfil

#### Iconos por Red Social:
```
Facebook      → Azul #1877F2
Instagram     → Gradiente Rosa-Morado
TikTok        → Negro/Cyan (efecto hover)
LinkedIn      → Azul Profesional #0A66C2
YouTube       → Rojo #FF0000
WhatsApp      → Verde #25D366
```

---

## 🔧 Implementación Técnica

### Backend (Node.js/Prisma)

**Archivo:** `server/prisma/schema.prisma`

```typescript
model TeamMember {
  // ... campos existentes
  whatsapp_url?: string
  facebook_url?: string
  instagram_url?: string
  tiktok_url?: string
  linkedin_url?: string
  youtube_url?: string
}
```

**API Endpoint:** `POST/PUT /api/admin/team`

```typescript
{
  name: "Nombre",
  position: "Cargo",
  phone: "+51999999999",
  email: "correo@ejemplo.com",
  whatsapp_url: "https://wa.me/51999999999",
  facebook_url: "https://facebook.com/usuario",
  instagram_url: "https://instagram.com/usuario",
  tiktok_url: "https://tiktok.com/@usuario",
  linkedin_url: "https://linkedin.com/in/usuario",
  youtube_url: "https://youtube.com/@usuario"
}
```

### Frontend (React/TypeScript)

**Archivo:** `client/app/dashboard/admin/team/page.tsx`

```typescript
interface MiembroEquipo {
  // ... campos existentes
  whatsapp?: string | null
  facebook?: string | null
  instagram?: string | null
  tiktok?: string | null
  linkedin?: string | null
  youtube?: string | null
}
```

**Sección de Redes Sociales en Formulario:**

```tsx
<div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
  <h3 className="text-sm font-semibold text-blue-900 mb-4">
    <i className="fas fa-share-alt"></i> Redes Sociales (Opcionales)
  </h3>
  
  {/* Campos para cada red social */}
  {/* Incluye validación y placeholders de ejemplo */}
</div>
```

### Página Web (PHP/JavaScript)

**Archivo:** `public/get_team.php`

```php
// Retorna datos en formato JSON
{
  "success": true,
  "team": [
    {
      "id": 1,
      "name": "Nombre",
      "phone": "+51999999999",
      "whatsapp": "https://wa.me/51999999999",
      "facebook": "https://facebook.com/...",
      "instagram": "https://instagram.com/...",
      "tiktok": "https://tiktok.com/...",
      "linkedin": "https://linkedin.com/...",
      "youtube": "https://youtube.com/..."
    }
  ]
}
```

**Archivo:** `public/js/team.js`

```javascript
// Genera HTML con iconos de redes sociales
<div class="social-links">
  ${member.whatsapp ? `<a href="${member.whatsapp}" class="social-link whatsapp"><i class="fab fa-whatsapp"></i></a>` : ''}
  ${member.facebook ? `<a href="${member.facebook}" class="social-link facebook"><i class="fab fa-facebook-f"></i></a>` : ''}
  ${member.instagram ? `<a href="${member.instagram}" class="social-link instagram"><i class="fab fa-instagram"></i></a>` : ''}
  ${member.tiktok ? `<a href="${member.tiktok}" class="social-link tiktok"><i class="fab fa-tiktok"></i></a>` : ''}
  ${member.linkedin ? `<a href="${member.linkedin}" class="social-link linkedin"><i class="fab fa-linkedin-in"></i></a>` : ''}
  ${member.youtube ? `<a href="${member.youtube}" class="social-link youtube"><i class="fab fa-youtube"></i></a>` : ''}
</div>
```

**Estilos CSS:** `public/css/team.css`

```css
.social-link {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--dark-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  text-decoration: none;
  font-size: 18px;
}

/* Colores específicos por red */
.social-link.facebook { background-color: #1877F2; }
.social-link.instagram { background: linear-gradient(...); }
.social-link.tiktok { background-color: #000; }
.social-link.linkedin { background-color: #0A66C2; }
.social-link.youtube { background-color: #FF0000; }
.social-link.whatsapp { background-color: #25D366; }
```

---

## 📝 Uso en el CRM

### Agregar un Miembro con Redes Sociales

1. **Ir a:** `/dashboard/admin/team`
2. **Click:** "Nuevo Miembro"
3. **Completar:**
   - Nombre (requerido)
   - Cargo (requerido)
   - Correo (opcional)
   - Teléfono (opcional)
   - Foto (opcional - URL)
   - Descripción (opcional)
   - **Redes Sociales** (todas opcionales):
     - WhatsApp: `https://wa.me/51999999999`
     - Facebook: `https://facebook.com/delgado.propiedades`
     - Instagram: `https://instagram.com/delgado.propiedades`
     - TikTok: `https://tiktok.com/@delgado_propiedades`
     - LinkedIn: `https://linkedin.com/in/nombre-apellido`
     - YouTube: `https://youtube.com/@delgado-propiedades`
4. **Guardar**

### Editar Redes Sociales

1. **Ir a:** `/dashboard/admin/team`
2. **Click:** Icono de editar (lápiz) en la fila del miembro
3. **Modificar:** Los campos de redes sociales
4. **Actualizar**

---

## 🌐 Visualización en Web

### Tarjeta del Miembro (Team Page)

```
┌─────────────────────────────┐
│       [Foto Circular]       │
│                             │
│    Nombre del Miembro       │
│    Cargo/Posición           │
│                             │
│    Descripción del asesor   │
│                             │
│    📞 Teléfono              │
│    ✉️  Email                │
│                             │
│  [🔵][📷][🎵][💼][🔴][💚]   │  ← Redes Sociales
│                             │
└─────────────────────────────┘
```

**Comportamiento:**
- Click en ícono → Abre el perfil en nueva ventana
- Hover → Anima hacia arriba y cambia color
- Responsive → Se adapta a móviles

---

## 🎨 Colores y Estilos

### Paleta de Colores por Red

| Red Social | Color | Código |
|------------|-------|--------|
| Facebook | Azul | `#1877F2` |
| Instagram | Gradiente | Rosa → Morado |
| TikTok | Negro → Cyan | `#000` → `#25F4EE` |
| LinkedIn | Azul Pro. | `#0A66C2` |
| YouTube | Rojo | `#FF0000` |
| WhatsApp | Verde | `#25D366` |

### Estados

- **Normal:** Color de la red social
- **Hover:** Más brillante + sombra + traducción hacia arriba
- **Activo:** En página web sin estado especial

---

## ✅ Validación

### En el Formulario

- **URLs válidas:** Deben ser URLs completas (incluir `http://` o `https://`)
- **Campos opcionales:** Todos excepto nombre y cargo
- **Sanitización:** Se validan en backend antes de guardar

### Ejemplos Válidos

```
✅ https://facebook.com/delgado.propiedades
✅ https://instagram.com/delgado_propiedades
✅ https://wa.me/51948734448
✅ https://tiktok.com/@delgado_propiedades
✅ https://linkedin.com/in/mario-delgado
✅ https://youtube.com/@delgado-propiedades
```

### Ejemplos Inválidos

```
❌ facebook.com/delgado.propiedades (falta https://)
❌ www.instagram.com/delgado_propiedades (debe ser https://)
❌ @usuario (no es URL)
```

---

## 🚀 Próximas Mejoras

### Fase 2
- [ ] QR code para WhatsApp directo
- [ ] Integración con Google Maps
- [ ] Certificaciones y logros
- [ ] Horario de atención

### Fase 3
- [ ] Portal personal para asesores
- [ ] Portafolio de propiedades vendidas
- [ ] Reviews y calificaciones
- [ ] Chat en vivo desde web

---

## 🔄 Flujo de Datos

```
┌─────────────────────────────────────────────────────┐
│         CRM Admin Dashboard                         │
│  /dashboard/admin/team (React + TypeScript)        │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ PUT/POST
                   │ {name, phone, facebook, instagram...}
                   ▼
┌─────────────────────────────────────────────────────┐
│         Backend API (Node.js + Express)             │
│  /api/admin/team (Prisma ORM)                      │
│  → Validar URLs                                    │
│  → Guardar en MySQL                                │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ Persistencia
                   ▼
┌─────────────────────────────────────────────────────┐
│      MySQL Database                                │
│  team_members (facebook_url, instagram_url, ...)  │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ GET /api/public/team
                   ▼
┌─────────────────────────────────────────────────────┐
│      PHP Proxy (get_team.php)                      │
│  Formato: {success, team: [{...social_urls}]}     │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ fetch() + JSON.parse
                   ▼
┌─────────────────────────────────────────────────────┐
│      Web Pública (team.html)                        │
│  JavaScript (team.js) + CSS (team.css)             │
│  → Renderiza tarjetas                              │
│  → Muestra iconos de redes                         │
│  → Links directos a perfiles                       │
└─────────────────────────────────────────────────────┘
```

---

## 📱 Responsividad

### Desktop (> 1024px)
- 3-4 tarjetas por fila
- Iconos de 40px
- Texto normal

### Tablet (768px - 1024px)
- 2 tarjetas por fila
- Iconos de 35px
- Texto adaptado

### Mobile (< 768px)
- 1 tarjeta por fila
- Iconos de 30px
- Stack vertical

---

## 🐛 Troubleshooting

### Problema: URLs no se guardan
**Solución:** Verificar que sean URLs válidas (incluir `https://`)

### Problema: Iconos no se muestran
**Solución:** Verificar que FontAwesome esté cargado en `head`

### Problema: Links no funcionan
**Solución:** Verificar la URL directamente en el navegador

### Problema: Estilos no aplican
**Solución:** Limpiar caché del navegador (`Ctrl+Shift+Delete`)

---

## 📦 Archivos Modificados

| Archivo | Tipo | Cambios |
|---------|------|---------|
| `client/app/dashboard/admin/team/page.tsx` | Modificado | +6 campos de redes sociales |
| `public/get_team.php` | Modificado | Retorna todas las redes |
| `public/js/team.js` | Modificado | Renderiza iconos de redes |
| `public/css/team.css` | Modificado | Estilos para cada red social |

---

## 🎓 Notas de Desarrollo

### Campos en Base de Datos

```sql
ALTER TABLE team_members ADD COLUMN whatsapp_url VARCHAR(255) NULL;
ALTER TABLE team_members ADD COLUMN facebook_url VARCHAR(255) NULL;
ALTER TABLE team_members ADD COLUMN instagram_url VARCHAR(255) NULL;
ALTER TABLE team_members ADD COLUMN tiktok_url VARCHAR(255) NULL;
ALTER TABLE team_members ADD COLUMN linkedin_url VARCHAR(255) NULL;
ALTER TABLE team_members ADD COLUMN youtube_url VARCHAR(255) NULL;
```

### Conversión de Datos Existentes

Si hay datos de redes sociales en otros campos, actualizar:

```sql
UPDATE team_members 
SET facebook_url = facebook 
WHERE facebook IS NOT NULL AND facebook_url IS NULL;

UPDATE team_members 
SET instagram_url = instagram 
WHERE instagram IS NOT NULL AND instagram_url IS NULL;

UPDATE team_members 
SET tiktok_url = tiktok 
WHERE tiktok IS NOT NULL AND tiktok_url IS NULL;
```

---

**Versión:** 1.0
**Fecha:** 19 de Noviembre, 2024
**Estado:** ✅ Completo y Funcional
