# ✅ CHECKLIST DE IMPLEMENTACIÓN

## Pre-requisitos

- [ ] Tienes un plan de hosting en Hostinger (o similar)
- [ ] Tienes acceso al panel de control del hosting
- [ ] Tienes acceso FTP o File Manager
- [ ] Tu hosting soporta PHP 7.4+ y MySQL 5.7+
- [ ] Tienes un dominio configurado con SSL (HTTPS)

---

## Fase 1: Configuración de Base de Datos 🗄️

### En Hostinger (Panel de Control)

- [ ] Crear base de datos MySQL
  - Nombre sugerido: `u123456_crm_delgado`
  - Usuario: `u123456_crm`
  - Contraseña: (genera una segura)

- [ ] Configurar acceso remoto MySQL
  - Ve a: Bases de Datos → Acceso Remoto
  - Agrega tu IP pública (obtén de whatismyip.com)
  - O agrega `%` para permitir todas (menos seguro)

- [ ] Anotar credenciales:
  ```
  Host: _____________________
  Puerto: 3306 (usualmente)
  Base de Datos: _____________________
  Usuario: _____________________
  Contraseña: _____________________
  ```

---

## Fase 2: Configuración del CRM Local 💻

### Actualizar Variables de Entorno

- [ ] Abrir `.env` en la raíz del proyecto
- [ ] Actualizar `DATABASE_URL`:
  ```env
  DATABASE_URL="mysql://USUARIO:PASSWORD@HOST:3306/BASE_DATOS"
  SHADOW_DATABASE_URL="mysql://USUARIO:PASSWORD@HOST:3306/BASE_DATOS_shadow"
  ```

### Ejecutar Migraciones

- [ ] Abrir terminal en carpeta `server/`
- [ ] Ejecutar:
  ```bash
  npx prisma migrate deploy
  npx prisma generate
  ```
- [ ] Verificar que no haya errores

### Verificar Conexión

- [ ] Iniciar el CRM: `npm run dev`
- [ ] Verificar que conecta a la BD remota
- [ ] Crear un proyecto de prueba
- [ ] Verificar que se guarda correctamente

---

## Fase 3: Preparar Archivos PHP 📁

### Configurar Credenciales

- [ ] Abrir `web-php/config/database.php`
- [ ] Actualizar constantes:
  ```php
  define('DB_HOST', 'localhost'); // En Hostinger
  define('DB_NAME', 'u123456_crm_delgado');
  define('DB_USER', 'u123456_crm');
  define('DB_PASS', 'TU_PASSWORD');
  ```

### Revisar Archivos

- [ ] Verificar que todos estos archivos existen:
  - `config/database.php` ✓
  - `includes/cors.php` ✓
  - `includes/auth.php` ✓
  - `api/proyectos.php` ✓
  - `api/testimonios.php` ✓
  - `api/servicios.php` ✓
  - `api/equipo.php` ✓
  - `portal/login.php` ✓
  - `portal/dashboard.php` ✓
  - `portal/upload.php` ✓
  - `portal/logout.php` ✓
  - `.htaccess` ✓
  - `test-apis.html` ✓

---

## Fase 4: Subir a Hostinger ⬆️

### Opción A: Via FTP (Recomendado)

- [ ] Descargar FileZilla o usar FTP client preferido
- [ ] Conectar con credenciales FTP de Hostinger
- [ ] Navegar a `/public_html/`
- [ ] Subir todos los archivos de `web-php/`:
  - Carpeta `api/` → `/public_html/api/`
  - Carpeta `portal/` → `/public_html/portal/`
  - Carpeta `config/` → `/public_html/config/`
  - Carpeta `includes/` → `/public_html/includes/`
  - Archivo `.htaccess` → `/public_html/.htaccess`
  - Archivo `test-apis.html` → `/public_html/test-apis.html`

### Opción B: Via File Manager

- [ ] Acceder a File Manager en panel de Hostinger
- [ ] Navegar a `/public_html/`
- [ ] Crear carpetas necesarias
- [ ] Subir archivos uno por uno
- [ ] Verificar permisos (644 para archivos, 755 para carpetas)

---

## Fase 5: Configurar Directorios 📂

### Crear Directorio de Uploads

Via File Manager o SSH:

- [ ] Crear: `/public_html/uploads/`
- [ ] Crear: `/public_html/uploads/clientes/`
- [ ] Establecer permisos 755:
  ```bash
  chmod 755 /public_html/uploads
  chmod 755 /public_html/uploads/clientes
  ```

### Verificar Permisos

- [ ] `config/database.php` → 644 (lectura)
- [ ] `api/*.php` → 644
- [ ] `portal/*.php` → 644
- [ ] `uploads/` → 755 (escritura)
- [ ] `.htaccess` → 644

---

## Fase 6: Testing 🧪

### Test 1: Verificar APIs

- [ ] Abrir navegador
- [ ] Ir a: `https://tudominio.com/test-apis.html`
- [ ] Verificar que el estado del sistema es: ✅ Funcionando
- [ ] Hacer clic en "Obtener Proyectos"
- [ ] Verificar que se muestran proyectos (si hay en BD)
- [ ] Probar los demás botones

### Test 2: API Directa

- [ ] Abrir: `https://tudominio.com/api/proyectos.php`
- [ ] Debe mostrar JSON con proyectos
- [ ] Abrir: `https://tudominio.com/api/testimonios.php`
- [ ] Debe mostrar JSON con testimonios

### Test 3: Portal del Cliente (si tienes cliente configurado)

- [ ] Abrir: `https://tudominio.com/portal`
- [ ] Ingresar email y contraseña de prueba
- [ ] Verificar que carga el dashboard
- [ ] Intentar subir un documento de prueba

---

## Fase 7: Integración con Página Existente 🌐

### Opción A: PHP Backend

- [ ] Copiar `config/database.php` a tu código existente
- [ ] Incluir en tus páginas: `require_once 'config/database.php';`
- [ ] Reemplazar consultas por funciones `fetchAll()` y `fetchOne()`
- [ ] Ejemplo en `propiedades.php`:
  ```php
  $proyectos = fetchAll("SELECT * FROM proyectos WHERE activo = 1");
  ```

### Opción B: JavaScript Frontend

- [ ] Usar fetch/axios para llamar a las APIs:
  ```javascript
  fetch('https://tudominio.com/api/proyectos.php')
    .then(res => res.json())
    .then(data => console.log(data.data))
  ```

---

## Fase 8: Asignar Accesos a Clientes 👤

### Desde el CRM

- [ ] Abrir el CRM local
- [ ] Ir a sección de Clientes
- [ ] Seleccionar un cliente tipo 'CLIENTE'
- [ ] Usar una de estas opciones:
  
  **Opción A: Crear endpoint en el backend** (ver `SETUP_PASSWORDS.md`)
  
  **Opción B: Script de consola:**
  ```bash
  cd server
  npm run asignar-password cliente@ejemplo.com Password123
  ```
  
  **Opción C: Directamente en MySQL:**
  ```sql
  INSERT INTO cliente_passwords (contactoId, password_web, created_at, updated_at)
  VALUES ('uuid-del-cliente', '$2y$10$...', NOW(), NOW());
  ```
  
- [ ] Enviar credenciales al cliente por email

---

## Fase 9: Seguridad 🔐

### Configuraciones de Seguridad

- [ ] Verificar que el sitio usa HTTPS (candado verde)
- [ ] Verificar que `.htaccess` fuerza HTTPS
- [ ] Verificar que archivo `config/database.php` no es accesible vía web
- [ ] Cambiar contraseñas por defecto
- [ ] Configurar sesiones seguras en `php.ini`:
  ```ini
  session.cookie_secure = 1
  session.cookie_httponly = 1
  session.cookie_samesite = Strict
  ```

### Backups

- [ ] Configurar backup automático de BD en Hostinger
- [ ] Hacer backup manual inicial
- [ ] Probar restaurar un backup

---

## Fase 10: Monitoreo y Optimización 📊

### Verificación Final

- [ ] Agregar un proyecto desde el CRM → Verificar que aparece en web
- [ ] Agregar un testimonio → Verificar que aparece en web
- [ ] Cliente hace login → Verificar que ve su información
- [ ] Cliente sube documento → Verificar que se guarda

### Optimización (Opcional)

- [ ] Implementar caché de consultas (ver docs)
- [ ] Configurar CDN para imágenes
- [ ] Minificar CSS/JS
- [ ] Optimizar imágenes (WebP)

---

## ⚠️ Troubleshooting

### Error: "Error de conexión a la base de datos"

✓ Verificar credenciales en `database.php`  
✓ Verificar que MySQL está activo  
✓ Verificar permisos del usuario de BD  
✓ Probar conexión con herramientas como MySQL Workbench  

### Error: "No autorizado" en portal

✓ Verificar que existe registro en `cliente_passwords`  
✓ Verificar que el password está hasheado con bcrypt  
✓ Limpiar cookies del navegador  

### Error: "Cannot upload file"

✓ Verificar permisos del directorio `uploads/` (755)  
✓ Verificar límites en `php.ini`: `upload_max_filesize`, `post_max_size`  
✓ Verificar espacio disponible en el hosting  

### API retorna JSON vacío

✓ Verificar que hay datos en las tablas  
✓ Revisar logs de PHP: `/logs/error_log`  
✓ Habilitar `error_reporting` temporalmente  

---

## 📞 Contacto y Soporte

- **Documentación completa**: Ver `WEB_PHP_INTEGRATION.md`
- **Ejemplos de código**: Ver `INTEGRATION_EXAMPLES.md`
- **Setup de passwords**: Ver `SETUP_PASSWORDS.md`
- **Testing**: Usar `test-apis.html`

---

## 🎉 ¡Implementación Completa!

Si todas las casillas están marcadas, ¡felicidades! Tu sistema está funcionando correctamente.

**Siguiente paso:** Personalizar el diseño del portal del cliente y agregar más funcionalidades según tus necesidades.

---

**Fecha de implementación:** _______________  
**Implementado por:** _______________  
**Notas adicionales:**

```
_____________________________________________________________

_____________________________________________________________

_____________________________________________________________
```
