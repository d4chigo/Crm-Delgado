# 🚀 Sistema CRM + Página Web PHP - Integración Completa

> **Solución completa para integrar tu CRM local con tu página web PHP usando una base de datos MySQL compartida**

---

## 📖 Tabla de Contenidos

- [Visión General](#-visión-general)
- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Inicio Rápido](#-inicio-rápido)
- [Documentación](#-documentación)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [FAQ](#-faq)

---

## 🎯 Visión General

Este proyecto permite que tu **CRM local (Next.js + Electron)** y tu **página web PHP (Hostinger)** trabajen juntos usando una **única base de datos MySQL**.

### ¿Qué significa esto?

```
┌─────────────────────────────────────────────────────────────┐
│                    UNA SOLA BASE DE DATOS                    │
│                         (MySQL)                              │
└──────────────┬──────────────────────────┬───────────────────┘
               │                          │
      ┌────────▼─────────┐       ┌───────▼────────┐
      │   CRM LOCAL      │       │  WEB PHP       │
      │   (Electron)     │       │  (Hostinger)   │
      │                  │       │                │
      │ ✓ Administración │       │ ✓ Mostrar      │
      │ ✓ Crear/Editar   │       │ ✓ Portal       │
      │ ✓ Gestión        │       │ ✓ Cliente      │
      └──────────────────┘       └────────────────┘
```

---

## ✨ Características

### Para Administradores (CRM)
- ✅ Gestionar proyectos/propiedades desde el CRM
- ✅ Administrar testimonios y servicios
- ✅ Gestionar equipo y contactos
- ✅ Asignar accesos a clientes para el portal web
- ✅ Ver documentos subidos por clientes

### Para Clientes (Portal Web)
- ✅ Login seguro con email y contraseña
- ✅ Ver sus oportunidades y proyectos
- ✅ Ver sus cotizaciones
- ✅ Subir documentos (DNI, contratos, etc.)
- ✅ Ver historial de actividades

### Para Visitantes (Página Web)
- ✅ Ver proyectos/propiedades en tiempo real
- ✅ Ver testimonios de clientes
- ✅ Ver servicios ofrecidos
- ✅ Ver equipo de trabajo
- ✅ Todo actualizado automáticamente desde el CRM

---

## 🏗️ Arquitectura

```
╔═══════════════════════════════════════════════════════════════╗
║                      FLUJO DE DATOS                           ║
╚═══════════════════════════════════════════════════════════════╝

1️⃣ ADMINISTRADOR USA EL CRM
   │
   ├─→ Agrega nuevo proyecto
   ├─→ Aprueba un testimonio
   └─→ Actualiza información
   
2️⃣ DATOS SE GUARDAN EN MYSQL
   │
   └─→ Base de datos en Hostinger
   
3️⃣ PÁGINA WEB CONSUME LOS DATOS
   │
   ├─→ APIs PHP leen de MySQL
   └─→ Se muestran en tiempo real
   
4️⃣ CLIENTES ACCEDEN AL PORTAL
   │
   ├─→ Login seguro
   ├─→ Ven su información
   └─→ Suben documentos
```

---

## 🚀 Inicio Rápido

### Requisitos Previos

- CRM ya instalado y funcionando
- Hosting con PHP 7.4+ y MySQL 5.7+
- Acceso FTP o File Manager
- Dominio con SSL (HTTPS)

### Instalación en 5 Pasos

#### 1. Configurar Base de Datos Remota

En Hostinger:
- Crear base de datos MySQL
- Habilitar acceso remoto
- Anotar credenciales

#### 2. Conectar CRM a BD Remota

```bash
# Actualizar .env
DATABASE_URL="mysql://usuario:password@host:3306/base_datos"

# Migrar esquema
cd server
npx prisma migrate deploy
npx prisma generate
```

#### 3. Configurar APIs PHP

```bash
# Editar config/database.php
define('DB_HOST', 'localhost');
define('DB_NAME', 'tu_base_datos');
define('DB_USER', 'tu_usuario');
define('DB_PASS', 'tu_password');
```

#### 4. Subir Archivos a Hostinger

Subir vía FTP:
```
/public_html/
├── api/
├── portal/
├── config/
├── includes/
└── .htaccess
```

#### 5. Probar

Visitar: `https://tudominio.com/test-apis.html`

✅ **¡Listo!** Tu sistema está integrado.

---

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| **[WEB_PHP_INTEGRATION.md](./WEB_PHP_INTEGRATION.md)** | 📘 Guía completa de integración paso a paso |
| **[CHECKLIST_IMPLEMENTACION.md](./CHECKLIST_IMPLEMENTACION.md)** | ✅ Checklist detallado de implementación |
| **[IMPLEMENTACION_RESUMEN.md](./IMPLEMENTACION_RESUMEN.md)** | 📄 Resumen ejecutivo del proyecto |
| **[web-php/README.md](./web-php/README.md)** | 🔌 Documentación de las APIs PHP |
| **[web-php/SETUP_PASSWORDS.md](./web-php/SETUP_PASSWORDS.md)** | 🔐 Cómo asignar contraseñas a clientes |
| **[web-php/INTEGRATION_EXAMPLES.md](./web-php/INTEGRATION_EXAMPLES.md)** | 💻 Ejemplos de código de integración |

---

## 📁 Estructura del Proyecto

```
Crm-Delgado/
│
├── 📄 WEB_PHP_INTEGRATION.md          # Guía principal
├── 📄 CHECKLIST_IMPLEMENTACION.md     # Checklist paso a paso
├── 📄 IMPLEMENTACION_RESUMEN.md       # Resumen ejecutivo
│
├── web-php/                           # 🌐 Archivos para Hostinger
│   │
│   ├── api/                          # APIs públicas
│   │   ├── proyectos.php            # Listar proyectos
│   │   ├── testimonios.php          # Listar testimonios
│   │   ├── servicios.php            # Listar servicios
│   │   └── equipo.php               # Listar equipo
│   │
│   ├── portal/                       # Portal del cliente
│   │   ├── login.php                # Autenticación
│   │   ├── dashboard.php            # Dashboard
│   │   ├── upload.php               # Subir documentos
│   │   └── logout.php               # Cerrar sesión
│   │
│   ├── config/                       # Configuración
│   │   └── database.php             # Conexión MySQL
│   │
│   ├── includes/                     # Utilidades
│   │   ├── cors.php                 # Headers CORS
│   │   └── auth.php                 # Autenticación
│   │
│   ├── .htaccess                     # Configuración Apache
│   ├── test-apis.html                # Página de testing
│   │
│   ├── README.md                     # Docs de APIs
│   ├── SETUP_PASSWORDS.md            # Setup de passwords
│   └── INTEGRATION_EXAMPLES.md       # Ejemplos de código
│
├── server/                           # Backend del CRM
│   └── prisma/
│       └── schema.prisma            # ✨ Schema actualizado
│
└── client/                          # Frontend del CRM
```

---

## 🔗 APIs Disponibles

### Públicas (sin autenticación)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/proyectos.php` | GET | Lista proyectos/propiedades |
| `/api/testimonios.php` | GET | Lista testimonios aprobados |
| `/api/servicios.php` | GET | Lista servicios |
| `/api/equipo.php` | GET | Lista miembros del equipo |

### Portal del Cliente (requiere autenticación)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/portal/login.php` | POST | Autenticación de cliente |
| `/portal/dashboard.php` | GET | Dashboard del cliente |
| `/portal/upload.php` | POST | Subir documentos |
| `/portal/logout.php` | POST | Cerrar sesión |

---

## 💡 Ejemplos de Uso

### Mostrar Proyectos en tu Web

```php
<?php
require_once 'config/database.php';

$proyectos = fetchAll("SELECT * FROM proyectos WHERE activo = 1");

foreach ($proyectos as $proyecto) {
    echo "<div class='proyecto'>";
    echo "  <h3>{$proyecto['nombre']}</h3>";
    echo "  <p>S/ " . number_format($proyecto['precio'], 2) . "</p>";
    echo "</div>";
}
?>
```

### Cargar con JavaScript

```javascript
fetch('https://tudominio.com/api/proyectos.php')
  .then(res => res.json())
  .then(data => {
    data.data.forEach(proyecto => {
      console.log(proyecto.nombre, proyecto.precio);
    });
  });
```

---

## 🎨 Personalización

### Estilos del Portal

Los archivos PHP incluyen estilos básicos. Puedes personalizarlos editando:

- `portal/login.php` - Página de login
- `portal/dashboard.php` - Dashboard del cliente

### URLs Amigables

El archivo `.htaccess` incluye configuración para URLs amigables:

```
# Antes
/proyecto/detalle.php?id=123

# Después
/proyecto/123
```

---

## 🔐 Seguridad

### Características de Seguridad

✅ **Prepared Statements** - Previene SQL Injection  
✅ **Password Hashing** - Bcrypt con salt  
✅ **HTTPS Forzado** - Vía .htaccess  
✅ **Sessions Seguras** - HttpOnly, Secure, SameSite  
✅ **Validación de Inputs** - En todos los endpoints  
✅ **File Upload Seguro** - Validación de tipos/tamaños  

---

## 🧪 Testing

### Página de Testing

Visita: `https://tudominio.com/test-apis.html`

Esta página interactiva te permite:
- ✓ Verificar conexión a BD
- ✓ Probar todas las APIs
- ✓ Ver respuestas en tiempo real
- ✓ Detectar errores fácilmente

### Testing Manual

```bash
# Test API de proyectos
curl https://tudominio.com/api/proyectos.php

# Test login
curl -X POST https://tudominio.com/portal/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

---

## ❓ FAQ

### ¿Funciona con mi plan compartido de Hostinger?

✅ **Sí**, solo necesitas:
- PHP 7.4 o superior
- MySQL 5.7 o superior
- Acceso remoto a MySQL habilitado

### ¿Los cambios se ven al instante?

✅ **Sí**, ambos sistemas usan la misma BD. Un cambio en el CRM se refleja inmediatamente en la web.

### ¿Es seguro?

✅ **Sí**, usa:
- Conexiones encriptadas (HTTPS)
- Passwords hasheados
- Prepared statements
- Sessions seguras

### ¿Puedo personalizar el portal?

✅ **Sí**, todos los archivos PHP son completamente editables y personalizables.

### ¿Qué pasa si mi IP cambia?

Si usas acceso remoto MySQL con IP específica, tendrás que actualizar la IP permitida en el panel de Hostinger. Alternativa: Usar VPN o IP estática.

### ¿Necesito modificar mi página web actual?

No necesariamente. Puedes mantener tu código actual y simplemente:
1. Agregar las nuevas APIs
2. Incluir enlace al portal del cliente
3. Opcionalmente, migrar contenido dinámico a las APIs

---

## 📊 Diagrama de Flujo Completo

```
┌─────────────────────────────────────────────────────────────┐
│                     ADMINISTRADOR                            │
│                                                              │
│  1. Abre CRM local (Electron)                               │
│  2. Gestiona: Proyectos, Clientes, Testimonios             │
│  3. Asigna acceso a clientes                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              BASE DE DATOS MYSQL (Hostinger)                │
│                                                              │
│  ┌──────────────┐  ┌─────────────┐  ┌────────────────┐    │
│  │  proyectos   │  │ testimonios │  │   contactos    │    │
│  │  contactos   │  │   equipo    │  │  cotizaciones  │    │
│  │  oportunid.  │  │  servicios  │  │   documentos   │    │
│  └──────────────┘  └─────────────┘  └────────────────┘    │
└──────────┬────────────────────────────────┬─────────────────┘
           │                                │
           ▼                                ▼
┌────────────────────┐          ┌────────────────────────┐
│   PÁGINA WEB PHP   │          │   PORTAL DEL CLIENTE   │
│   (Visitantes)     │          │   (Clientes)           │
│                    │          │                        │
│ • Ver proyectos    │          │ • Login seguro         │
│ • Ver testimonios  │          │ • Ver oportunidades    │
│ • Ver servicios    │          │ • Ver cotizaciones     │
│ • Ver equipo       │          │ • Subir documentos     │
│                    │          │ • Ver historial        │
└────────────────────┘          └────────────────────────┘
```

---

## 🎉 Beneficios del Sistema

| Beneficio | Descripción |
|-----------|-------------|
| 🔄 **Sincronización Automática** | Los cambios en el CRM se ven al instante en la web |
| 💰 **Ahorro de Costos** | Una sola BD, no necesitas otro hosting |
| 🔐 **Seguro** | Implementa las mejores prácticas de seguridad |
| 📱 **Portal para Clientes** | Los clientes pueden ver su información 24/7 |
| ⚡ **Rápido** | Sin sincronizaciones lentas ni APIs externas |
| 🛠️ **Fácil de Mantener** | Todo se gestiona desde el CRM |

---

## 📞 Soporte

Si tienes problemas:

1. ✅ Revisa la **[Guía de Implementación](./WEB_PHP_INTEGRATION.md)**
2. ✅ Consulta el **[Checklist](./CHECKLIST_IMPLEMENTACION.md)**
3. ✅ Usa la **[Página de Testing](./web-php/test-apis.html)** para diagnosticar
4. ✅ Revisa los **[Ejemplos de Código](./web-php/INTEGRATION_EXAMPLES.md)**

---

## 📝 Changelog

**v1.0.0** (31 de Octubre, 2025)
- ✅ APIs de proyectos, testimonios, servicios, equipo
- ✅ Portal del cliente con login/dashboard
- ✅ Sistema de subida de documentos
- ✅ Integración completa CRM ↔ Web
- ✅ Documentación completa
- ✅ Página de testing interactiva

---

## 📄 Licencia

Este código es parte del sistema CRM Delgado y es de uso privado.

---

## 🙏 Créditos

Desarrollado para: **CRM Delgado**  
Fecha: **Octubre 2025**  
Objetivo: **Integración CRM Local con Página Web PHP**

---

<div align="center">

**¿Listo para implementar?**

[📘 Ver Guía Completa](./WEB_PHP_INTEGRATION.md) | [✅ Ver Checklist](./CHECKLIST_IMPLEMENTACION.md) | [🧪 Ir a Testing](./web-php/test-apis.html)

---

**Made with ❤️ for CRM Delgado**

</div>
