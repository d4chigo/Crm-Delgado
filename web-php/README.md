# 📱 Página Web PHP - Ejemplos Completos

Esta carpeta contiene las APIs PHP y ejemplos de páginas para tu sitio web en Hostinger.

## 📁 Estructura

```
web-php/
├── config/
│   └── database.php              # Configuración MySQL
├── includes/
│   ├── cors.php                  # Headers CORS
│   └── auth.php                  # Autenticación clientes
├── api/                          # APIs públicas
│   ├── proyectos.php             # Listar proyectos
│   ├── testimonios.php           # Listar testimonios
│   ├── servicios.php             # Listar servicios
│   └── equipo.php                # Listar equipo
├── portal/                       # Portal del cliente
│   ├── login.php                 # Login
│   ├── dashboard.php             # Dashboard
│   ├── upload.php                # Subir documentos
│   └── logout.php                # Cerrar sesión
├── SETUP_PASSWORDS.md            # Cómo asignar passwords
├── INTEGRATION_EXAMPLES.md       # Ejemplos de integración
└── README.md                     # Este archivo
```

## 🚀 Instalación en Hostinger

### 1. Subir Archivos

Vía FTP o File Manager:

```
public_html/
├── api/
│   ├── proyectos.php
│   ├── testimonios.php
│   ├── servicios.php
│   └── equipo.php
├── portal/
│   ├── login.php
│   ├── dashboard.php
│   ├── upload.php
│   └── logout.php
├── config/
│   └── database.php
├── includes/
│   ├── cors.php
│   └── auth.php
└── uploads/
    └── clientes/  (permisos 755)
```

### 2. Configurar Base de Datos

Edita `config/database.php`:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'u123456789_crm_delgado');
define('DB_USER', 'u123456789_crm');
define('DB_PASS', 'TU_PASSWORD_AQUI');
```

### 3. Crear Directorio de Uploads

```bash
mkdir -p public_html/uploads/clientes
chmod 755 public_html/uploads/clientes
```

## 🔗 URLs de las APIs

Una vez subido, tendrás:

- `https://tudominio.com/api/proyectos.php` - Listar proyectos
- `https://tudominio.com/api/testimonios.php` - Listar testimonios
- `https://tudominio.com/api/servicios.php` - Listar servicios
- `https://tudominio.com/api/equipo.php` - Listar equipo
- `https://tudominio.com/portal/login.php` - Login de clientes
- `https://tudominio.com/portal/dashboard.php` - Dashboard del cliente

## 📖 Uso de las APIs

### Proyectos

```bash
# Todos los proyectos disponibles
GET /api/proyectos.php?estado=DISPONIBLE

# Con paginación
GET /api/proyectos.php?limit=10&offset=0

# Con búsqueda
GET /api/proyectos.php?search=casa

# Respuesta
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nombre": "Casa Playa",
      "descripcion": "...",
      "imagen": "url",
      "precio": "250000.00",
      "ubicacion": "Lima",
      "estado": "DISPONIBLE",
      "etiquetas": ["Nuevo", "Playa"]
    }
  ],
  "meta": {
    "total": 15,
    "limit": 10,
    "offset": 0
  }
}
```

### Testimonios

```bash
# Testimonios aprobados
GET /api/testimonios.php?limit=6

# Respuesta
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Juan Pérez",
      "calificacion": 5,
      "testimonio": "Excelente servicio...",
      "foto": "url",
      "videoUrl": "youtube.com/..."
    }
  ]
}
```

### Portal del Cliente

```javascript
// Login
POST /portal/login.php
{
  "email": "cliente@ejemplo.com",
  "password": "password123"
}

// Dashboard
GET /portal/dashboard.php
// Retorna: cliente, oportunidades, proyectos, documentos

// Subir documento
POST /portal/upload.php
FormData:
  - documento: File
  - tipo: "DNI" | "RECIBO" | "CONTRATO" | "GENERAL"
  - descripcion: string (opcional)
```

## 🔧 Integración con tu Página Actual

Ver `INTEGRATION_EXAMPLES.md` para ejemplos completos.

### Ejemplo rápido:

```php
<?php
require_once 'config/database.php';

// Obtener proyectos
$proyectos = fetchAll("SELECT * FROM proyectos WHERE activo = 1");

// Mostrar
foreach ($proyectos as $p) {
    echo "<h3>{$p['nombre']}</h3>";
    echo "<p>S/ " . number_format($p['precio'], 2) . "</p>";
}
?>
```

## 🔐 Seguridad

✅ **Prepared Statements**: Todas las consultas usan PDO preparado  
✅ **Password Hashing**: bcrypt con salt  
✅ **Sessions Seguras**: HttpOnly, Secure, SameSite  
✅ **HTTPS**: Obligatorio en producción  
✅ **Validación de Inputs**: En todos los endpoints  

## 📊 Flujo Completo

```
1. Administrador agrega proyecto desde CRM
   ↓
2. Se guarda en MySQL (tabla proyectos)
   ↓
3. API /api/proyectos.php lee de la BD
   ↓
4. Página web muestra el proyecto
   ↓
5. Cliente ve el proyecto en tiempo real
```

## 🧪 Testing

### Probar API de Proyectos

```bash
curl https://tudominio.com/api/proyectos.php
```

### Probar Login

```bash
curl -X POST https://tudominio.com/portal/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@ejemplo.com","password":"test123"}'
```

## ❓ Troubleshooting

### Error: "Error de conexión a la base de datos"

- Verifica credenciales en `config/database.php`
- Asegúrate que el usuario tiene permisos
- Verifica que MySQL está activo en Hostinger

### Error: "No autorizado" en portal

- Verifica que el cliente tiene contraseña asignada en `cliente_passwords`
- Usa el script en `SETUP_PASSWORDS.md`

### Error: "Error al subir archivo"

- Verifica permisos del directorio `uploads/clientes/` (755)
- Verifica que PHP tiene permisos de escritura
- Revisa límite de upload en `php.ini`

## 📞 Soporte

Para más información, revisa:

- `WEB_PHP_INTEGRATION.md` - Guía completa
- `SETUP_PASSWORDS.md` - Configurar acceso de clientes
- `INTEGRATION_EXAMPLES.md` - Ejemplos de código

## 📝 Changelog

**v1.0.0** (2025-10-31)
- APIs de proyectos, testimonios, servicios, equipo
- Portal del cliente con login/dashboard
- Sistema de subida de documentos
- Integración con CRM via MySQL compartido
