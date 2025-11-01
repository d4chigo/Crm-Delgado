# 🔗 Integración CRM - Página Web PHP

## 📋 Resumen

Este documento describe cómo integrar el CRM local (Next.js + Electron) con la página web PHP alojada en Hostinger usando una base de datos MySQL compartida.

## 🎯 Objetivos

1. **Base de Datos Única**: CRM y Web usan la misma BD MySQL
2. **Gestión desde CRM**: Administrar proyectos, testimonios, servicios desde el CRM
3. **Sincronización Automática**: Los cambios del CRM se reflejan automáticamente en la web
4. **Portal del Cliente**: Los clientes pueden ver su información y subir documentos

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                      MYSQL EN HOSTINGER                         │
│                  (Base de Datos Compartida)                     │
└────────────┬───────────────────────────────────┬────────────────┘
             │                                   │
             │                                   │
   ┌─────────▼──────────┐            ┌──────────▼─────────┐
   │   CRM (Electron)   │            │   Página Web PHP   │
   │   Next.js Local    │            │   (Hostinger)      │
   │                    │            │                    │
   │ - Gestión CRM      │            │ - Mostrar datos    │
   │ - CRUD Proyectos   │            │ - Portal clientes  │
   │ - CRUD Testimonios │            │ - APIs PHP         │
   │ - CRUD Servicios   │            │                    │
   └────────────────────┘            └────────────────────┘
```

---

## 📦 Estructura de Archivos PHP

La carpeta `web-php/` contiene todo el código PHP que debes subir a Hostinger:

```
web-php/
├── config/
│   └── database.php           # Configuración de conexión MySQL
├── includes/
│   ├── cors.php               # Headers CORS
│   └── auth.php               # Autenticación de clientes
├── api/                       # APIs públicas para la web
│   ├── proyectos.php          # Listar proyectos/propiedades
│   ├── testimonios.php        # Listar testimonios aprobados
│   ├── servicios.php          # Listar servicios
│   └── equipo.php             # Listar equipo
└── portal/                    # Portal del cliente
    ├── login.php              # Login de clientes
    ├── dashboard.php          # Dashboard del cliente
    ├── upload.php             # Subir documentos
    └── logout.php             # Cerrar sesión
```

---

## 🚀 Pasos de Implementación

### **Paso 1: Configurar MySQL en Hostinger**

#### 1.1 Permitir Conexiones Remotas

En el panel de Hostinger:

1. Ve a **Bases de Datos** → **Acceso Remoto MySQL**
2. Agrega tu IP pública (para conectar desde tu PC local)
3. Obtén las credenciales:
   - Host: `servidor.mysql.database.azure.com` o similar
   - Usuario: `u123456789_crm`
   - Base de datos: `u123456789_crm_delgado`
   - Puerto: `3306`

#### 1.2 Actualizar .env Local

En tu archivo `.env` local (para el CRM):

```env
# Base de datos remota en Hostinger
DATABASE_URL="mysql://u123456789_crm:TU_PASSWORD@servidor.mysql.database.azure.com:3306/u123456789_crm_delgado"
SHADOW_DATABASE_URL="mysql://u123456789_crm:TU_PASSWORD@servidor.mysql.database.azure.com:3306/u123456789_crm_shadow"
```

---

### **Paso 2: Migrar la Base de Datos**

#### 2.1 Aplicar Migraciones de Prisma

Desde tu CRM local, ejecuta:

```bash
cd server
npx prisma migrate deploy
npx prisma generate
```

Esto creará todas las tablas necesarias en el MySQL de Hostinger.

#### 2.2 Verificar Tablas Creadas

Deberías tener estas tablas nuevas:

- `cliente_passwords` - Contraseñas para portal web
- `cliente_documentos` - Documentos subidos
- `cliente_accesos` - Registro de logins
- `cliente_actividades` - Actividades del cliente

---

### **Paso 3: Subir APIs PHP a Hostinger**

#### 3.1 Configurar database.php

Edita `web-php/config/database.php`:

```php
define('DB_HOST', 'localhost'); // En Hostinger suele ser localhost
define('DB_NAME', 'u123456789_crm_delgado');
define('DB_USER', 'u123456789_crm');
define('DB_PASS', 'TU_PASSWORD_REAL');
```

#### 3.2 Subir Archivos

Vía FTP o File Manager de Hostinger:

```
public_html/
├── api/                    # APIs públicas
│   ├── proyectos.php
│   ├── testimonios.php
│   ├── servicios.php
│   └── equipo.php
├── portal/                 # Portal del cliente
│   ├── login.php
│   ├── dashboard.php
│   ├── upload.php
│   └── logout.php
├── config/
│   └── database.php
└── includes/
    ├── cors.php
    └── auth.php
```

#### 3.3 Crear directorio de uploads

```bash
mkdir -p public_html/uploads/clientes
chmod 755 public_html/uploads/clientes
```

---

### **Paso 4: Integrar en tu Página Web PHP**

#### 4.1 Mostrar Proyectos Dinámicos

En tu página actual (probablemente `propiedades.php`):

```php
<?php
// Obtener proyectos desde la API local
$url = 'https://tudominio.com/api/proyectos.php?estado=DISPONIBLE';
$response = file_get_contents($url);
$data = json_decode($response, true);
$proyectos = $data['data'];

// Mostrar proyectos
foreach ($proyectos as $proyecto) {
    echo '<div class="propiedad">';
    echo '  <img src="' . htmlspecialchars($proyecto['imagen']) . '">';
    echo '  <h3>' . htmlspecialchars($proyecto['nombre']) . '</h3>';
    echo '  <p>' . htmlspecialchars($proyecto['descripcion']) . '</p>';
    echo '  <span class="precio">S/ ' . number_format($proyecto['precio'], 2) . '</span>';
    echo '</div>';
}
?>
```

#### 4.2 Mostrar Testimonios

En tu sección de testimonios:

```php
<?php
$url = 'https://tudominio.com/api/testimonios.php?limit=6';
$response = file_get_contents($url);
$data = json_decode($response, true);
$testimonios = $data['data'];

foreach ($testimonios as $testimonio) {
    echo '<div class="testimonio">';
    if ($testimonio['foto']) {
        echo '  <img src="' . htmlspecialchars($testimonio['foto']) . '">';
    }
    echo '  <h4>' . htmlspecialchars($testimonio['nombre']) . '</h4>';
    echo '  <div class="rating">' . str_repeat('⭐', $testimonio['calificacion']) . '</div>';
    echo '  <p>' . htmlspecialchars($testimonio['testimonio']) . '</p>';
    echo '</div>';
}
?>
```

---

### **Paso 5: Crear Portal del Cliente**

#### 5.1 Página de Login (`cliente-login.php`)

```php
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Portal del Cliente - Login</title>
    <style>
        .login-form {
            max-width: 400px;
            margin: 100px auto;
            padding: 30px;
            border: 1px solid #ddd;
            border-radius: 8px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        button {
            width: 100%;
            padding: 12px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="login-form">
        <h2>Portal del Cliente</h2>
        <form id="loginForm">
            <div class="form-group">
                <label>Email:</label>
                <input type="email" name="email" required>
            </div>
            <div class="form-group">
                <label>Contraseña:</label>
                <input type="password" name="password" required>
            </div>
            <button type="submit">Iniciar Sesión</button>
        </form>
        <div id="error" style="color: red; margin-top: 10px;"></div>
    </div>

    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = {
                email: formData.get('email'),
                password: formData.get('password')
            };
            
            try {
                const response = await fetch('/portal/login.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    window.location.href = '/cliente-dashboard.php';
                } else {
                    document.getElementById('error').textContent = result.error;
                }
            } catch (error) {
                document.getElementById('error').textContent = 'Error de conexión';
            }
        });
    </script>
</body>
</html>
```

#### 5.2 Dashboard del Cliente (`cliente-dashboard.php`)

```php
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Mi Dashboard - Portal del Cliente</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .dashboard { max-width: 1200px; margin: 0 auto; }
        .section { margin-bottom: 30px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
        .stat-card { padding: 20px; background: #f8f9fa; border-radius: 8px; text-align: center; }
        .upload-form { margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    </style>
</head>
<body>
    <div class="dashboard">
        <h1>Bienvenido, <span id="nombreCliente"></span></h1>
        
        <div class="section">
            <h2>Resumen</h2>
            <div class="stats">
                <div class="stat-card">
                    <h3 id="totalOportunidades">0</h3>
                    <p>Oportunidades</p>
                </div>
                <div class="stat-card">
                    <h3 id="totalProyectos">0</h3>
                    <p>Proyectos</p>
                </div>
                <div class="stat-card">
                    <h3 id="totalCotizaciones">0</h3>
                    <p>Cotizaciones</p>
                </div>
                <div class="stat-card">
                    <h3 id="totalDocumentos">0</h3>
                    <p>Documentos</p>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>Mis Oportunidades</h2>
            <table id="oportunidadesTable">
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Proyecto</th>
                        <th>Etapa</th>
                        <th>Valor</th>
                        <th>Probabilidad</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>

        <div class="section">
            <h2>Subir Documentos</h2>
            <form id="uploadForm" class="upload-form">
                <select name="tipo" required>
                    <option value="DNI">DNI</option>
                    <option value="RECIBO">Recibo</option>
                    <option value="CONTRATO">Contrato</option>
                    <option value="GENERAL">General</option>
                </select>
                <input type="file" name="documento" required>
                <button type="submit">Subir Documento</button>
            </form>
        </div>

        <div class="section">
            <h2>Mis Documentos</h2>
            <table id="documentosTable">
                <thead>
                    <tr>
                        <th>Archivo</th>
                        <th>Tipo</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
    </div>

    <script>
        async function cargarDashboard() {
            try {
                const response = await fetch('/portal/dashboard.php');
                const result = await response.json();
                
                if (!result.success) {
                    window.location.href = '/cliente-login.php';
                    return;
                }
                
                const { data } = result;
                
                // Actualizar nombre
                document.getElementById('nombreCliente').textContent = 
                    data.cliente.nombre + ' ' + (data.cliente.apellido || '');
                
                // Actualizar estadísticas
                document.getElementById('totalOportunidades').textContent = data.estadisticas.total_oportunidades;
                document.getElementById('totalProyectos').textContent = data.estadisticas.total_proyectos;
                document.getElementById('totalCotizaciones').textContent = data.estadisticas.total_cotizaciones;
                document.getElementById('totalDocumentos').textContent = data.estadisticas.total_documentos;
                
                // Cargar oportunidades
                const oportunidadesTbody = document.querySelector('#oportunidadesTable tbody');
                data.oportunidades.forEach(op => {
                    const row = `<tr>
                        <td>${op.titulo}</td>
                        <td>${op.proyecto || '-'}</td>
                        <td>${op.etapa}</td>
                        <td>S/ ${parseFloat(op.valor || 0).toLocaleString()}</td>
                        <td>${op.probabilidad}%</td>
                    </tr>`;
                    oportunidadesTbody.innerHTML += row;
                });
                
                // Cargar documentos
                const documentosTbody = document.querySelector('#documentosTable tbody');
                data.documentos.forEach(doc => {
                    const row = `<tr>
                        <td>${doc.nombreOriginal}</td>
                        <td>${doc.tipoDocumento}</td>
                        <td>${new Date(doc.subidoEn).toLocaleDateString()}</td>
                        <td>${doc.estado}</td>
                    </tr>`;
                    documentosTbody.innerHTML += row;
                });
                
            } catch (error) {
                console.error('Error:', error);
            }
        }
        
        // Cargar dashboard al iniciar
        cargarDashboard();
        
        // Manejo de upload
        document.getElementById('uploadForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            
            try {
                const response = await fetch('/portal/upload.php', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('Documento subido correctamente');
                    cargarDashboard(); // Recargar
                } else {
                    alert('Error: ' + result.error);
                }
            } catch (error) {
                alert('Error de conexión');
            }
        });
    </script>
</body>
</html>
```

---

### **Paso 6: Configurar CRM para Gestionar Contraseñas**

En el CRM, necesitas crear una funcionalidad para asignar contraseñas a los clientes que quieran acceder al portal.

Puedes agregar esto en tu panel de administración de contactos.

---

## 🔐 Seguridad

### Configuraciones Importantes:

1. **HTTPS Obligatorio**: Asegúrate que tu hosting use SSL
2. **Validar Inputs**: Todas las APIs usan prepared statements
3. **Sessions Seguras**: Configurar en `php.ini`:
   ```ini
   session.cookie_secure = 1
   session.cookie_httponly = 1
   session.cookie_samesite = Strict
   ```

4. **Limitar Acceso Remoto**: Solo permite IPs específicas

---

## 📊 Flujo de Trabajo

### Agregar Nuevo Proyecto desde CRM:

1. Abres tu CRM local (Electron)
2. Vas a "Proyectos" → "Nuevo Proyecto"
3. Llenas nombre, descripción, precio, imagen, etc.
4. Guardas → Se inserta en MySQL remoto
5. **Automáticamente** aparece en tu página web PHP al llamar `/api/proyectos.php`

### Cliente Sube Documento:

1. Cliente hace login en `/cliente-login.php`
2. Sube documento en dashboard
3. Se guarda en `/uploads/clientes/{id}/`
4. Se registra en tabla `cliente_documentos`
5. Admin del CRM lo ve y puede revisar/aprobar

---

## 🎉 Resultado Final

✅ **Un solo sistema**: CRM + Web comparten BD  
✅ **Gestión centralizada**: Todo se administra desde el CRM  
✅ **Sincronización automática**: Los cambios se reflejan al instante  
✅ **Portal del cliente**: Clientes ven su información y suben docs  
✅ **Ahorro de hosting**: Un solo MySQL, APIs PHP livianas  

---

## 📞 Preguntas Frecuentes

**¿Funcionará con mi plan compartido de Hostinger?**  
Sí, solo necesitas acceso MySQL remoto (usualmente disponible).

**¿Necesito cambiar mi código PHP actual?**  
No, solo agregas las nuevas APIs. Tu código actual sigue funcionando.

**¿Y si mi IP cambia?**  
Usa un servicio como DynDNS o configura acceso desde cualquier IP (menos seguro).

**¿Puedo tener backup?**  
Sí, Hostinger tiene backups automáticos. También puedes hacer `mysqldump` periódico.

---

## 📝 Checklist de Implementación

- [ ] Configurar acceso remoto MySQL en Hostinger
- [ ] Actualizar `.env` con credenciales remotas
- [ ] Ejecutar migraciones de Prisma
- [ ] Configurar `database.php` con credenciales
- [ ] Subir archivos PHP vía FTP
- [ ] Crear directorio `uploads/clientes` con permisos 755
- [ ] Probar API `/api/proyectos.php` en navegador
- [ ] Crear página de login de clientes
- [ ] Crear dashboard de clientes
- [ ] Integrar APIs en página web existente
- [ ] Probar flujo completo CRM → Web
- [ ] Configurar SSL/HTTPS
- [ ] Hacer backup de BD

---

**¡Listo!** Ahora tienes un sistema CRM integrado con tu página web PHP usando una sola base de datos. 🚀
