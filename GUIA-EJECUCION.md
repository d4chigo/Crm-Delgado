# 📖 Guía de Ejecución - CRM Inmobiliario

Esta guía te explica **paso a paso** cómo ejecutar el proyecto desde cero, incluyendo la configuración inicial de usuarios y etiquetas.

---

## 📋 Requisitos Previos

Antes de empezar, asegúrate de tener instalado:

- ✅ **Docker Desktop** - [Descargar aquí](https://www.docker.com/products/docker-desktop)
- ✅ **Git** - Para clonar el repositorio
- ✅ **4GB RAM** disponible mínimo
- ✅ **Puertos libres**: 3000, 5000, 3306, 80, 8080

### Verificar instalación:
```bash
docker --version
docker-compose --version
```

---

## 🚀 INICIO RÁPIDO - PRIMERA VEZ

Si es la primera vez que ejecutas el proyecto, sigue estos pasos:

### 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/Crm-Delgado.git
cd Crm-Delgado
```

### 2️⃣ Copiar variables de entorno

```bash
# Windows (PowerShell)
Copy-Item .env.docker .env

# Linux/Mac
cp .env.docker .env

# Windows (CMD)
copy .env.docker .env
```

### 3️⃣ Iniciar todos los servicios

```bash
docker-compose -f docker-compose.dev.yml up -d
```

**Esto iniciará:**
- 🗄️ MySQL en el puerto 3306
- 🔧 Backend en el puerto 5000
- 🎨 Frontend en el puerto 3000
- 📊 Adminer (gestor BD) en el puerto 8080

### 4️⃣ Esperar a que todo inicie (30-60 segundos)

```bash
# Ver logs en tiempo real
docker-compose -f docker-compose.dev.yml logs -f

# Espera a ver estos mensajes:
# ✅ MySQL: "ready for connections"
# ✅ Backend: "Server running on port 5000"
# ✅ Frontend: "Ready in X ms"
```

### 5️⃣ Ejecutar migraciones de base de datos

```bash
docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate deploy
```

### 6️⃣ Crear datos iniciales (usuarios y etiquetas)

```bash
docker-compose -f docker-compose.dev.yml exec backend npx prisma db seed
```

**Esto creará:**
- ✅ Usuario administrador por defecto
- ✅ Etiquetas predefinidas para el CRM
- ✅ Datos de ejemplo (opcional)

### 7️⃣ Acceder a la aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Adminer (BD)**: http://localhost:8080

### 8️⃣ Iniciar sesión

Usa las credenciales creadas en el seed (revisa `server/prisma/seed.ts` para ver los usuarios creados).

**Usuario por defecto:**
- Email: Ver en `server/prisma/seed.ts`
- Password: Ver en `server/prisma/seed.ts`

---

## 🔄 EJECUCIÓN NORMAL (después de la primera vez)

Una vez que ya configuraste todo, solo necesitas:

```bash
# Iniciar servicios
docker-compose -f docker-compose.dev.yml up -d

# Ver logs (opcional)
docker-compose -f docker-compose.dev.yml logs -f

# Detener cuando termines
docker-compose -f docker-compose.dev.yml down
```

---

## 👤 CREAR PRIMER USUARIO MANUALMENTE

Si el seed no funcionó o quieres crear un usuario manualmente:

### Opción 1: Desde Adminer (Visual)

1. Abre http://localhost:8080
2. Inicia sesión:
   - Servidor: `mysql`
   - Usuario: `crm_user`
   - Password: `crm_pass`
   - Base de datos: `crm_delgado`
3. Ve a la tabla `usuarios`
4. Click en "Nuevo registro"
5. Completa los campos:
   - `nombre`: Tu nombre
   - `email`: tu@email.com
   - `password`: (usa bcrypt hash - ver abajo)
   - `rol`: `ADMIN`
6. Guardar

**Generar hash de contraseña:**
```bash
docker-compose -f docker-compose.dev.yml exec backend node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('tuPassword123', 10))"
```

### Opción 2: Desde MySQL CLI

```bash
# Conectarse a MySQL
docker-compose -f docker-compose.dev.yml exec mysql mysql -u crm_user -pcrm_pass crm_delgado

# Dentro de MySQL, ejecutar:
INSERT INTO usuarios (id, nombre, email, password, rol, activo, creadoEn, actualizadoEn)
VALUES (
  UUID(),
  'Admin',
  'admin@crm.com',
  '$2a$10$hash_generado_arriba',
  'ADMIN',
  1,
  NOW(),
  NOW()
);
```

---

## 🏷️ CREAR ETIQUETAS INICIALES

Si necesitas crear etiquetas manualmente:

### Opción 1: Desde Adminer (Visual)

1. Abre http://localhost:8080
2. Ve a la tabla `etiquetas`
3. Click en "Nuevo registro"
4. Completa:
   - `nombre`: Nombre de la etiqueta (ej: "VIP")
   - `color`: Color en hex (ej: "#FF5733")
   - `icono`: Emoji opcional (ej: "⭐")
   - `descripcion`: Descripción opcional
5. Guardar

### Opción 2: Desde el Frontend

1. Inicia sesión en http://localhost:3000
2. Ve a la sección de configuración/etiquetas
3. Crea las etiquetas desde la interfaz

### Opción 3: Script SQL

```bash
# Conectarse a MySQL
docker-compose -f docker-compose.dev.yml exec mysql mysql -u crm_user -pcrm_pass crm_delgado

# Ejecutar:
INSERT INTO etiquetas (id, nombre, color, icono, descripcion, creadoEn, actualizadoEn) VALUES
(UUID(), 'VIP', '#FF5733', '⭐', 'Cliente VIP', NOW(), NOW()),
(UUID(), 'Urgente', '#FF0000', '🔥', 'Requiere atención urgente', NOW(), NOW()),
(UUID(), 'Interesado', '#00FF00', '✅', 'Cliente interesado', NOW(), NOW()),
(UUID(), 'Seguimiento', '#FFA500', '📞', 'Requiere seguimiento', NOW(), NOW());
```

---

## 🚀 MODO DESARROLLO (con hot reload)

Ideal para programar. Los cambios en el código se reflejan automáticamente.

### Iniciar servicios

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Ver logs en tiempo real

```bash
# Todos los servicios
docker-compose -f docker-compose.dev.yml logs -f

# Solo backend
docker-compose -f docker-compose.dev.yml logs -f backend

# Solo frontend
docker-compose -f docker-compose.dev.yml logs -f frontend
```

### Acceder a la aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Adminer (BD)**: http://localhost:8080
- **MySQL**: localhost:3306
  - Usuario: `crm_user`
  - Password: `crm_pass`
  - Base de datos: `crm_delgado`

### Detener los servicios

```bash
# Detener contenedores (mantiene datos)
docker-compose -f docker-compose.dev.yml down

# Detener y eliminar TODO (incluye base de datos) ⚠️
docker-compose -f docker-compose.dev.yml down -v
```

### Reiniciar un servicio específico

```bash
# Reiniciar solo el backend
docker-compose -f docker-compose.dev.yml restart backend

# Reiniciar solo el frontend
docker-compose -f docker-compose.dev.yml restart frontend

# Reiniciar todo
docker-compose -f docker-compose.dev.yml restart
```

### Ver estado de los servicios

```bash
docker-compose -f docker-compose.dev.yml ps
```

---

## 🔷 COMANDOS PRISMA (Base de Datos)

Prisma es el ORM que usamos para gestionar la base de datos. Aquí están todos los comandos importantes:

### 📊 Migraciones (Cambios en la estructura de BD)

```bash
# 1. Aplicar migraciones pendientes (SIEMPRE ejecutar después de iniciar por primera vez)
docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate deploy

# 2. Crear una nueva migración (cuando cambias el schema.prisma)
docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate dev --name nombre_descriptivo

# Ejemplo: agregar campo "telefono2" a contactos
docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate dev --name agregar_telefono2_contactos

# 3. Ver estado de migraciones
docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate status

# 4. Resetear base de datos completa (CUIDADO: borra todo)
docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate reset
```

### 🌱 Seed (Datos iniciales)

```bash
# Ejecutar seed (crear usuarios, etiquetas, datos de ejemplo)
docker-compose -f docker-compose.dev.yml exec backend npx prisma db seed

# El seed se ejecuta automáticamente:
# - La primera vez que inicias el proyecto
# - Después de un "prisma migrate reset"
```

### 🎨 Prisma Studio (Interfaz visual para ver/editar datos)

```bash
# Abrir Prisma Studio
docker-compose -f docker-compose.dev.yml exec backend npx prisma studio

# Luego abre en tu navegador: http://localhost:5555
```

### 🔄 Generar Cliente Prisma (después de cambiar schema.prisma)

```bash
# Regenerar el cliente de Prisma
docker-compose -f docker-compose.dev.yml exec backend npx prisma generate
```

### 📝 Formatear schema.prisma

```bash
# Formatear el archivo schema.prisma
docker-compose -f docker-compose.dev.yml exec backend npx prisma format
```

### 🔍 Validar schema.prisma

```bash
# Validar que el schema esté correcto
docker-compose -f docker-compose.dev.yml exec backend npx prisma validate
```

### 📋 Ver información de la BD

```bash
# Ver información de la conexión
docker-compose -f docker-compose.dev.yml exec backend npx prisma db pull
```

---

## 📝 FLUJO TÍPICO DE TRABAJO CON PRISMA

### Cuando modificas el modelo de datos:

1. **Editar** `server/prisma/schema.prisma`
   ```prisma
   model Contacto {
     id       String @id @default(uuid())
     nombre   String
     telefono String?
     telefono2 String? // ← Nuevo campo
     // ...
   }
   ```

2. **Crear migración**
   ```bash
   docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate dev --name agregar_telefono2
   ```

3. **Verificar** que se creó correctamente
   ```bash
   docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate status
   ```

4. **Listo!** El cambio ya está aplicado en la BD

### Cuando clonas el proyecto por primera vez:

1. **Iniciar servicios**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **Aplicar migraciones**
   ```bash
   docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate deploy
   ```

3. **Crear datos iniciales**
   ```bash
   docker-compose -f docker-compose.dev.yml exec backend npx prisma db seed
   ```

### Cuando quieres resetear todo (desarrollo):

```bash
# Opción 1: Resetear con Prisma (mantiene estructura, borra datos)
docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate reset

# Opción 2: Borrar todo y empezar de cero
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate deploy
docker-compose -f docker-compose.dev.yml exec backend npx prisma db seed
```

---

## 🏭 MODO PRODUCCIÓN (optimizado)

Para despliegues en servidores reales.

### Paso 1: Configurar variables de entorno

```bash
# Copiar template
cp .env.docker .env

# Editar el archivo .env
nano .env
# O usar tu editor preferido: code .env, vim .env, etc.
```

**⚠️ IMPORTANTE - Cambiar estas variables:**

```env
# Cambiar contraseñas por unas seguras
MYSQL_ROOT_PASSWORD=tu_password_root_super_seguro_2025
MYSQL_PASSWORD=tu_password_usuario_super_seguro_2025

# Generar un JWT secret único (mínimo 32 caracteres)
JWT_SECRET=genera_uno_unico_con_openssl_o_node_minimo_32_chars

# Cambiar a tu dominio en producción
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com
```

**Generar JWT Secret seguro:**

```bash
# Con Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Con OpenSSL
openssl rand -hex 32

# Resultado ejemplo: a3f8b2c1d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

### Paso 2: Build e iniciar servicios

```bash
# Primera vez o después de cambios en Dockerfiles
docker-compose up -d --build

# Si no hay cambios en código, solo:
docker-compose up -d
```

**Esto iniciará:**
- MySQL
- Backend con build optimizado
- Frontend con build optimizado
- Nginx como reverse proxy
- Adminer (gestor BD) en el puerto 8080

### Paso 3: Verificar que todo inició correctamente

```bash
# Ver logs
docker-compose logs -f

# Ver estado
docker-compose ps
```

Todos los servicios deben mostrar `Up` y `healthy`.

### Paso 4: Acceder a la aplicación

- **Aplicación completa**: http://localhost
- **Adminer (BD)**: http://localhost:8080
- O por dominio: http://tu-dominio.com

**Nginx enruta automáticamente:**
- `/` → Frontend
- `/api` → Backend

### Detener servicios de producción

```bash
# Detener (mantiene datos)
docker-compose down

# Detener y eliminar TODO ⚠️
docker-compose down -v
```

### Actualizar código en producción

```bash
# 1. Pull de cambios
git pull origin main

# 2. Rebuild y reiniciar
docker-compose up -d --build

# 3. Ver logs para verificar
docker-compose logs -f
```

---

## 🗄️ GESTIÓN DE BASE DE DATOS

### 🎨 Interfaz Visual con Adminer (Recomendado)

Adminer es una interfaz web ligera para gestionar MySQL (alternativa a phpMyAdmin, pero mucho más rápida y simple).

**Acceso:**
- URL: http://localhost:8080 (configurable con `ADMINER_PORT` en `.env`)
- **Servidor**: `mysql`
- **Usuario**: Usa `MYSQL_USER` del archivo `.env`
- **Contraseña**: Usa `MYSQL_PASSWORD` del archivo `.env`
- **Base de datos**: `crm_delgado`

**Configuración en `.env`:**
```env
ADMINER_PORT=8080              # Puerto de acceso web
ADMINER_DESIGN=pepa-linha-dark # Tema (pepa-linha-dark, nette, etc.)
```

**Características:**
- ✅ Explorar tablas y registros
- ✅ Ejecutar queries SQL directamente
- ✅ Importar/exportar datos
- ✅ Editar registros visualmente
- ✅ Crear/modificar estructura de tablas
- ✅ Ver relaciones entre tablas

**⚠️ IMPORTANTE - Seguridad:**
- En **producción pública**, desactiva Adminer agregando `--profile dev` al comando up:
  ```bash
  # Actualmente comentado - para activar perfiles, edita docker-compose.yml
  docker-compose --profile dev up -d
  ```
- Para **staging/dev interno**, puedes dejarlo activo
- En ambientes públicos, considera usar solo Prisma Studio o acceso SSH

---

### Conectarse a MySQL por CLI

```bash
# Desde tu máquina (si MySQL está expuesto en 3306)
mysql -h 127.0.0.1 -u crm_user -p
# Password: crm_pass (desarrollo) o el que pusiste en .env (producción)

# Desde dentro del contenedor
docker-compose exec mysql mysql -u crm_user -p
```

### Ejecutar migraciones de Prisma

```bash
# En desarrollo
docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate deploy

# En producción
docker-compose exec backend npx prisma migrate deploy
```

### Poblar base de datos (seed)

```bash
# En desarrollo
docker-compose -f docker-compose.dev.yml exec backend npx prisma db seed

# En producción
docker-compose exec backend npx prisma db seed
```

### Abrir Prisma Studio (interfaz visual)

```bash
# En desarrollo
docker-compose -f docker-compose.dev.yml exec backend npx prisma studio

# Abrir navegador en: http://localhost:5555
```

### Crear una nueva migración

```bash
# 1. Editar server/prisma/schema.prisma
# 2. Crear migración

docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate dev --name nombre_de_tu_migracion
```

### Backup de base de datos

```bash
# Crear backup
docker-compose exec mysql mysqldump -u crm_user -pcrm_pass crm_delgado > backup_$(date +%Y%m%d_%H%M%S).sql

# En Windows PowerShell
docker-compose exec mysql mysqldump -u crm_user -pcrm_pass crm_delgado > backup_$(Get-Date -Format "yyyyMMdd_HHmmss").sql
```

### Restaurar backup

```bash
# Restaurar desde un archivo .sql
docker-compose exec -T mysql mysql -u crm_user -pcrm_pass crm_delgado < backup_20250108_120000.sql
```

### Ver tablas y registros

```bash
# Conectarse a MySQL
docker-compose exec mysql mysql -u crm_user -pcrm_pass crm_delgado

# Dentro de MySQL:
SHOW TABLES;
SELECT * FROM usuarios;
SELECT * FROM contactos LIMIT 10;
SELECT COUNT(*) FROM contactos;
```

### Resetear base de datos completa ⚠️

```bash
# CUIDADO: Esto elimina TODOS los datos

# 1. Detener servicios y eliminar volúmenes
docker-compose down -v

# 2. Volver a iniciar (se creará BD nueva)
docker-compose up -d

# 3. Esperar a que inicie y ejecutar migraciones
docker-compose exec backend npx prisma migrate deploy

# 4. Poblar con datos iniciales
docker-compose exec backend npx prisma db seed
```

---

## 🔧 COMANDOS ÚTILES

### Ver logs en tiempo real

```bash
# Desarrollo - todos los servicios
docker-compose -f docker-compose.dev.yml logs -f

# Desarrollo - solo backend
docker-compose -f docker-compose.dev.yml logs -f backend

# Producción - todos los servicios
docker-compose logs -f

# Producción - últimas 100 líneas
docker-compose logs --tail=100
```

### Ver estado de contenedores

```bash
# Desarrollo
docker-compose -f docker-compose.dev.yml ps

# Producción
docker-compose ps

# Ver todos los contenedores Docker
docker ps -a
```

### Abrir shell en un contenedor

```bash
# Backend
docker-compose exec backend sh

# Frontend
docker-compose exec frontend sh

# MySQL
docker-compose exec mysql bash
```

### Ver consumo de recursos

```bash
docker stats
```

### Limpiar Docker (liberar espacio)

```bash
# Eliminar contenedores detenidos
docker container prune

# Eliminar imágenes sin usar
docker image prune -a

# Eliminar volúmenes sin usar
docker volume prune

# Limpiar TODO (cuidado)
docker system prune -a --volumes
```

### Reconstruir un servicio específico

```bash
# Desarrollo
docker-compose -f docker-compose.dev.yml up -d --build backend

# Producción
docker-compose up -d --build backend
```

---

## 🐛 TROUBLESHOOTING

### Error: "Port already in use"

```bash
# Ver qué proceso usa el puerto
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000

# Solución 1: Cerrar el proceso
# Solución 2: Cambiar puerto en docker-compose.yml
```

### Error: "Cannot connect to database"

```bash
# 1. Verificar que MySQL está corriendo
docker-compose ps mysql

# 2. Ver logs de MySQL
docker-compose logs mysql

# 3. Verificar conectividad desde backend
docker-compose exec backend ping mysql

# 4. Si no funciona, reiniciar servicios
docker-compose restart
```

### Frontend no se conecta al Backend

```bash
# Verificar variable de entorno
docker-compose exec frontend env | grep NEXT_PUBLIC_API_URL

# Debe ser:
# Desarrollo: http://localhost:5000
# Producción con Nginx: /api (rutas relativas)
```

### Error: "Permission denied" en volúmenes

```bash
# Detener todo y limpiar volúmenes
docker-compose down -v

# Volver a iniciar
docker-compose up -d --build
```

### Ver detalles de un contenedor

```bash
docker inspect <nombre_contenedor>
```

---

## 📊 CREDENCIALES POR DEFECTO

### Desarrollo

**MySQL:**
- Host: `localhost` (o `mysql` desde otros contenedores)
- Puerto: `3306`
- Usuario: `crm_user`
- Password: `crm_pass`
- Base de datos: `crm_delgado`

**Adminer:**
- URL: http://localhost:8080
- Servidor: `mysql`
- Usuario: `crm_user`
- Password: `crm_pass`
- Base de datos: `crm_delgado`

**Aplicación (después de seed):**
- Email: Ver `server/prisma/seed.ts` para usuarios creados
- Password: Ver seed para contraseñas

### Producción

**Las contraseñas DEBEN cambiarse en el archivo `.env`**

---

## 🎯 RESUMEN DE COMANDOS RÁPIDOS

| Acción | Desarrollo | Producción |
|--------|-----------|------------|
| **Iniciar** | `docker-compose -f docker-compose.dev.yml up -d` | `docker-compose up -d --build` |
| **Detener** | `docker-compose -f docker-compose.dev.yml down` | `docker-compose down` |
| **Logs** | `docker-compose -f docker-compose.dev.yml logs -f` | `docker-compose logs -f` |
| **Estado** | `docker-compose -f docker-compose.dev.yml ps` | `docker-compose ps` |
| **Reiniciar** | `docker-compose -f docker-compose.dev.yml restart` | `docker-compose restart` |
| **Migrar BD** | `docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate deploy` | `docker-compose exec backend npx prisma migrate deploy` |
| **Seed BD** | `docker-compose -f docker-compose.dev.yml exec backend npx prisma db seed` | `docker-compose exec backend npx prisma db seed` |
| **MySQL Shell** | `docker-compose -f docker-compose.dev.yml exec mysql mysql -u crm_user -p` | `docker-compose exec mysql mysql -u crm_user -p` |
| **Backup** | `docker-compose -f docker-compose.dev.yml exec mysql mysqldump -u crm_user -pcrm_pass crm_delgado > backup.sql` | `docker-compose exec mysql mysqldump -u crm_user -pcrm_pass crm_delgado > backup.sql` |

---

## 🔒 SEGURIDAD EN PRODUCCIÓN

Antes de desplegar en producción:

1. ✅ Cambiar todas las contraseñas en `.env`
2. ✅ Generar JWT_SECRET único con 32+ caracteres
3. ✅ Configurar HTTPS/SSL (ver DOCKER.md)
4. ✅ Cambiar `NEXT_PUBLIC_API_URL` a tu dominio
5. ✅ Configurar firewall del servidor
6. ✅ Habilitar backups automáticos de BD
7. ✅ **Desactivar Adminer** en producción pública (ver sección Gestión de Base de Datos)
8. ✅ Revisar logs periódicamente

---

## 📝 NOTAS FINALES

- Los datos de MySQL se guardan en **volúmenes Docker** y persisten entre reinicios
- El hot reload funciona solo en **modo desarrollo**
- Las migraciones de Prisma se ejecutan **automáticamente** al iniciar el backend
- El seed se ejecuta **solo la primera vez** que se inicia
- Nginx solo se usa en **modo producción**
- Los logs se pueden ver en tiempo real con `docker-compose logs -f`

---

**¿Problemas?** Revisa la sección de Troubleshooting o abre un issue en GitHub.

**¡Listo para programar! 🚀**
