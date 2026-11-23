# 🚀 Guía Completa de Desarrollo - CRM Delgado

## 📋 Tabla de Contenidos
1. [Requisitos Previos](#requisitos-previos)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Configuración Inicial](#configuración-inicial)
4. [Comandos Docker](#comandos-docker)
5. [Base de Datos (Prisma)](#base-de-datos-prisma)
6. [Integración Web PHP (PGDP)](#integración-web-php-pgdp)
7. [Desarrollo Local](#desarrollo-local)
8. [Troubleshooting](#troubleshooting)

---

## 📦 Requisitos Previos

### Software Necesario
- **Docker Desktop** (Windows con WSL2 habilitado)
- **Node.js** 20+ (para desarrollo local sin Docker)
- **Git** (para control de versiones)
- **WSL2** con Debian/Ubuntu (recomendado para comandos Docker)

### Verificar Instalación
```bash
# Verificar Docker
docker --version
docker compose version

# Verificar Node.js
node --version
npm --version

# Verificar WSL
wsl --list --verbose
```

---

## 🏗️ Arquitectura del Sistema

### Servicios en Docker

```
┌─────────────────────────────────────────────────────────┐
│                  CRM Delgado (Puerto 3000)              │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Frontend   │  │   Backend    │  │    MySQL      │  │
│  │  Next.js    │←→│  Express     │←→│   8.0         │  │
│  │  :3000      │  │  :5000       │  │   :3306       │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
│                           ↓                             │
│                  ┌──────────────┐                       │
│                  │   Adminer    │                       │
│                  │   :8080      │                       │
│                  └──────────────┘                       │
└─────────────────────────────────────────────────────────┘
                           ↓
              ┌────────────────────────┐
              │  crm-shared-network    │ (Red Docker compartida)
              └────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│             Web Pública PGDP (Puerto 8081)              │
│  ┌─────────────────────────────────────────────────┐    │
│  │  PHP 8.2 + Apache                               │    │
│  │  Consume datos del MySQL del CRM               │    │
│  │  APIs: /api/proyectos.php, /api/servicios.php  │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Puertos Utilizados
| Servicio | Puerto | URL |
|----------|--------|-----|
| Frontend (Next.js) | 3000 | http://localhost:3000 |
| Backend (Express) | 5000 | http://localhost:5000/api |
| MySQL | 3306 | localhost:3306 |
| Adminer | 8080 | http://localhost:8080 |
| Web PHP (PGDP) | 8081 | http://localhost:8081 |

---

## ⚙️ Configuración Inicial

### 1. Clonar el Repositorio
```bash
git clone https://github.com/d4chigo/Crm-Delgado.git
cd Crm-Delgado
```

### 2. Verificar Archivo `.env`
El archivo `.env` en la raíz del proyecto ya existe. Verifica que contenga:

```env
# Base de datos
MYSQL_ROOT_PASSWORD=
MYSQL_DATABASE=crm_delgado
MYSQL_USER=crm_user
MYSQL_PASSWORD=

# Backend (IMPORTANTE: usar "mysql" como host en Docker)
DATABASE_URL=

# JWT
JWT_SECRET=
JWT_EXPIRES_IN=24h

# APIs externas
DNI_API_TOKEN=

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Gemini API
SERVER_GEMINI_API_KEY=
```

⚠️ **IMPORTANTE**: En el `.env`, el `DATABASE_URL` **DEBE usar `@mysql:3306`** (no `@localhost:3306`).

---

## 🐳 Comandos Docker

### Iniciar Todo el Sistema (Primera Vez)

#### Opción A: Desde WSL (Recomendado)
```bash
# Entrar a WSL
wsl

# Navegar al proyecto
cd /mnt/d/Projects/App/Crm-Delgado

# Crear la red compartida (solo la primera vez)
docker network create crm-shared-network

# Levantar el CRM
docker compose -f docker-compose.dev.yml up -d --build

# Levantar Web PHP (si aplica)
cd /mnt/d/Projects/Web/PGDP
docker compose up -d --build
```

#### Opción B: Desde PowerShell
```powershell
cd D:\Projects\App\Crm-Delgado

# Crear red compartida
docker network create crm-shared-network

# Levantar servicios
docker compose -f docker-compose.dev.yml up -d --build
```

### Comandos Útiles

#### Ver Logs en Tiempo Real
```bash
# Todos los servicios
docker compose -f docker-compose.dev.yml logs -f

# Solo backend
docker compose -f docker-compose.dev.yml logs -f backend

# Solo frontend
docker compose -f docker-compose.dev.yml logs -f frontend

# Solo MySQL
docker compose -f docker-compose.dev.yml logs -f mysql
```

#### Detener y Reiniciar
```bash
# Detener todo
docker compose -f docker-compose.dev.yml down

# Reiniciar un servicio específico
docker compose -f docker-compose.dev.yml restart backend

# Reiniciar todo desde cero (borra volúmenes)
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d --build
```

#### Ver Estado de Contenedores
```bash
# Ver contenedores corriendo
docker ps

# Ver todos los contenedores
docker ps -a

# Ver uso de recursos
docker stats
```

#### Acceder a un Contenedor
```bash
# Entrar al backend
docker exec -it crm-backend-dev bash

# Entrar a MySQL
docker exec -it crm-mysql-dev mysql -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"

# Entrar al frontend
docker exec -it crm-frontend-dev sh
```

---

## 🗄️ Base de Datos (Prisma)

### Estructura de Archivos
```
server/
├── prisma/
│   ├── schema.prisma          # Definición del esquema
│   ├── seed.ts                # Datos iniciales
│   └── migrations/            # Historial de migraciones
```

### Comandos Prisma (Dentro del Backend)

#### Ejecutar desde el Host (sin entrar al contenedor)
```bash
# Generar cliente Prisma
docker exec crm-backend-dev npx prisma generate

# Ver estado de migraciones
docker exec crm-backend-dev npx prisma migrate status

# Crear nueva migración
docker exec crm-backend-dev npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones en producción
docker exec crm-backend-dev npx prisma migrate deploy

# Resetear BD (CUIDADO: borra todo)
docker exec crm-backend-dev npx prisma migrate reset

# Ver datos en Prisma Studio
docker exec crm-backend-dev npx prisma studio
```

#### Ejecutar desde Dentro del Contenedor
```bash
# Entrar al contenedor
docker exec -it crm-backend-dev bash

# Dentro del contenedor:
npx prisma migrate dev --name nueva_migracion
npx prisma generate
npx prisma db push  # Aplicar cambios sin migración
npx prisma db seed  # Ejecutar seed.ts
```

### Workflow Típico para Cambios en BD

1. **Modificar `schema.prisma`**
```bash
# Ejemplo: agregar campo a tabla
model Contacto {
  id        String   @id @default(uuid())
  nombre    String
  nuevocamp String?  // ← Campo nuevo
}
```

2. **Crear y aplicar migración**
```bash
docker exec crm-backend-dev npx prisma migrate dev --name agregar_nuevocamp
```

3. **Generar cliente Prisma actualizado**
```bash
docker exec crm-backend-dev npx prisma generate
```

4. **Reiniciar backend para aplicar cambios**
```bash
docker compose -f docker-compose.dev.yml restart backend
```

### Acceso Directo a MySQL

#### Usando Adminer (GUI)
1. Abrir: http://localhost:8080
2. Credenciales:
   - **Sistema**: MySQL
   - **Servidor**: mysql
   - **Usuario**: crm_user
   - **Contraseña**: Valor configurado en `MYSQL_PASSWORD`
   - **Base de datos**: crm_delgado

#### Usando CLI
```bash
# Desde el host
docker exec -it crm-mysql-dev mysql -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"

# Dentro de MySQL:
SHOW TABLES;
DESCRIBE contactos;
SELECT * FROM contactos LIMIT 10;
```

---

## 🌐 Integración Web PHP (PGDP)

El proyecto web PHP (DelgadoPropiedades) está en un repositorio separado pero comparte la misma base de datos MySQL del CRM.

### Ubicación del Proyecto
```
D:\Projects\Web\PGDP\
```

### Estructura de Archivos de Integración
```
PGDP/
├── docker-compose.yml         # Compose independiente del CRM
├── Dockerfile.dev             # Imagen PHP 8.2 + Apache
├── config/
│   └── database.php           # Conexión a MySQL del CRM
├── api/                       # Endpoints JSON
│   ├── proyectos.php
│   ├── servicios.php
│   ├── testimonios.php
│   └── equipo.php
├── portal/                    # Portal del cliente
│   ├── login.php
│   ├── dashboard.php
│   └── upload.php
├── includes/
│   ├── cors.php
│   └── auth.php
└── public/
    └── index.html             # Página principal
```

### Configuración de Red Compartida

Ambos proyectos usan la red Docker `crm-shared-network`:

```yaml
# CRM: docker-compose.dev.yml
networks:
  crm-network:
    external: true
    name: crm-shared-network

# PGDP: docker-compose.yml
networks:
  crm-shared-network:
    external: true
```

### Comandos para PGDP

#### Levantar Web PHP
```bash
cd /mnt/d/Projects/Web/PGDP  # WSL
# o
cd D:\Projects\Web\PGDP       # PowerShell

docker compose up -d --build
```

#### Ver Logs
```bash
docker logs pgdp-web-php -f
```

#### Probar Conectividad a MySQL
```bash
# Desde el host
docker exec pgdp-web-php ping -c 3 crm-mysql-dev

# Probar PHP
docker exec pgdp-web-php php -r "new PDO('mysql:host=crm-mysql-dev;dbname=crm_delgado', getenv('MYSQL_USER'), getenv('MYSQL_PASSWORD')); echo 'OK';"
```

### URLs de Acceso
- **Página principal**: http://localhost:8081/public/index.html
- **API Proyectos**: http://localhost:8081/api/proyectos.php
- **Portal Cliente**: http://localhost:8081/portal/login.php
- **Test APIs**: http://localhost:8081/test-apis.html

⚠️ **Nota HTTPS**: Si el navegador muestra error `ERR_SSL_PROTOCOL_ERROR`, usa:
- **http://** explícito (no https://)
- Modo incógnito
- Limpia HSTS en `chrome://net-internals/#hsts` → Delete domain: `localhost`

---

## 💻 Desarrollo Local

### Hot Reload Activo

El sistema está configurado con hot reload (los cambios se reflejan automáticamente):

#### Frontend (Next.js)
- **Carpetas monitoreadas**: `client/app/`, `client/components/`, `client/lib/`, etc.
- **Cambios detectados**: Archivos `.tsx`, `.ts`, `.css`
- **Tiempo de reload**: ~2-5 segundos

#### Backend (Express)
- **Carpetas monitoreadas**: `server/src/`
- **Tool**: Nodemon + ts-node
- **Cambios detectados**: Archivos `.ts`
- **Tiempo de reload**: ~3-7 segundos

#### Web PHP
- **Carpetas monitoreadas**: Todo `/var/www/html/`
- **Cambios**: Instantáneos (Apache sirve directamente)

### Workflow de Desarrollo Típico

1. **Levantar servicios**
```bash
docker compose -f docker-compose.dev.yml up -d
```

2. **Editar código** (en tu editor favorito)
```bash
# Frontend: client/app/page.tsx
# Backend: server/src/controllers/contactosController.ts
# Web PHP: D:\Projects\Web\PGDP\public\index.html
```

3. **Ver cambios en el navegador**
- Frontend: http://localhost:3000 (auto-reload)
- Backend: revisar logs `docker logs crm-backend-dev -f`
- Web PHP: http://localhost:8081 (refresh manual)

4. **Commit cambios**
```bash
git add .
git commit -m "descripción del cambio"
git push
```

### Debugging

#### Backend (Node.js)
```bash
# Ver logs detallados
docker logs crm-backend-dev -f --tail 100

# Agregar console.log en el código
console.log('🐛 Debug:', variable);

# Inspeccionar variable de entorno
docker exec crm-backend-dev printenv | grep DATABASE
```

#### Frontend (Next.js)
- Abre DevTools del navegador (F12)
- Console para ver errores y logs
- Network para ver peticiones API

#### Web PHP
```bash
# Ver logs de Apache
docker logs pgdp-web-php -f

# Agregar debug en PHP
error_log("DEBUG: " . print_r($variable, true));

# Ver errores PHP
docker exec pgdp-web-php tail -f /var/log/apache2/error.log
```

---

## 🐛 Troubleshooting

### Problema: Backend no conecta a MySQL

**Error**: `Can't reach database server at localhost:3306`

**Solución**:
```bash
# 1. Verificar DATABASE_URL en .env
cat .env | grep DATABASE_URL
# Debe usar MYSQL_USER, MYSQL_PASSWORD y @mysql:3306
#                                            ^^^^^ NO "localhost"

# 2. Si está mal, corregir:
sed -i 's/@localhost:3306/@mysql:3306/' .env

# 3. Reiniciar backend
docker compose -f docker-compose.dev.yml restart backend
```

### Problema: Puerto en uso

**Error**: `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solución**:
```bash
# Ver qué proceso usa el puerto
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Linux/Mac

# Detener contenedores
docker compose -f docker-compose.dev.yml down

# Cambiar puerto en .env
FRONTEND_PORT=3001  # Usar otro puerto

# Reiniciar
docker compose -f docker-compose.dev.yml up -d
```

### Problema: Contenedor no inicia

**Solución**:
```bash
# Ver logs completos
docker logs crm-backend-dev --tail 200

# Verificar que el contenedor existe
docker ps -a | grep crm

# Eliminar y recrear
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up -d --build --force-recreate
```

### Problema: Cambios no se reflejan

**Solución**:
```bash
# Frontend: limpiar caché Next.js
docker exec crm-frontend-dev rm -rf .next
docker compose -f docker-compose.dev.yml restart frontend

# Backend: forzar reload
docker compose -f docker-compose.dev.yml restart backend

# Verificar volúmenes montados
docker inspect crm-frontend-dev | grep Mounts -A 20
```

### Problema: Web PHP no carga (ERR_CONNECTION_REFUSED)

**Solución**:
```bash
# 1. Verificar que contenedor está corriendo
docker ps | grep pgdp

# 2. Si no está, levantarlo
cd /mnt/d/Projects/Web/PGDP
docker compose up -d

# 3. Ver logs
docker logs pgdp-web-php

# 4. Probar conectividad
curl http://localhost:8081
```

### Problema: Web PHP error SSL (ERR_SSL_PROTOCOL_ERROR)

**Solución**:
1. Usar **http://** explícitamente (no https://)
2. Abrir en modo incógnito
3. Limpiar HSTS:
   - Chrome: `chrome://net-internals/#hsts`
   - Buscar: `localhost`
   - Click: "Delete"
4. Usar IP: http://127.0.0.1:8081

### Problema: Prisma migrations fallan

**Error**: `Database schema is not in sync`

**Solución**:
```bash
# Ver estado
docker exec crm-backend-dev npx prisma migrate status

# Aplicar migraciones pendientes
docker exec crm-backend-dev npx prisma migrate deploy

# Si falla, resetear (CUIDADO: borra datos)
docker exec crm-backend-dev npx prisma migrate reset

# Regenerar cliente
docker exec crm-backend-dev npx prisma generate
docker compose -f docker-compose.dev.yml restart backend
```

### Problema: Red compartida no funciona

**Error**: `network crm-shared-network declared as external, but could not be found`

**Solución**:
```bash
# Crear la red manualmente
docker network create crm-shared-network

# Verificar que existe
docker network ls | grep crm-shared

# Conectar contenedores manualmente si es necesario
docker network connect crm-shared-network crm-mysql-dev
docker network connect crm-shared-network pgdp-web-php

# Ver qué contenedores están conectados
docker network inspect crm-shared-network
```

---

## 📚 Recursos Adicionales

### Documentación
- **Prisma**: https://www.prisma.io/docs
- **Next.js**: https://nextjs.org/docs
- **Docker Compose**: https://docs.docker.com/compose/

### Archivos de Documentación en el Proyecto
- `GOOGLE_OAUTH_SETUP.md` - Configurar Google OAuth
- `GOOGLE_CALENDAR_SETUP.md` - Integración Google Calendar
- `VOICE_SETUP.md` - Configuración de llamadas por voz
- `DOCKER.md` - Detalles de Docker
- `GUIA-EJECUCION.md` - Guía de ejecución paso a paso

### Comandos Rápidos de Referencia

```bash
# Iniciar todo
docker compose -f docker-compose.dev.yml up -d

# Ver logs
docker compose -f docker-compose.dev.yml logs -f

# Detener todo
docker compose -f docker-compose.dev.yml down

# Reiniciar servicio
docker compose -f docker-compose.dev.yml restart backend

# Entrar a contenedor
docker exec -it crm-backend-dev bash

# Ver base de datos
docker exec -it crm-mysql-dev mysql -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"

# Prisma migrations
docker exec crm-backend-dev npx prisma migrate dev

# Limpiar todo y empezar de cero
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d --build
```

---

## 🎯 Siguiente Nivel

### Para Producción
1. Cambiar credenciales en `.env` (JWT_SECRET, MYSQL_PASSWORD, etc.)
2. Configurar `docker-compose.yml` (producción)
3. Usar Nginx como reverse proxy
4. Configurar SSL/TLS con Let's Encrypt
5. Configurar backups automáticos de MySQL

### Mejoras Opcionales
- [ ] Configurar CI/CD (GitHub Actions)
- [ ] Agregar tests (Jest, Cypress)
- [ ] Configurar monitoreo (Prometheus + Grafana)
- [ ] Implementar Redis para caché
- [ ] Configurar logs centralizados (ELK Stack)

---

**Última actualización**: 1 de noviembre de 2025
**Mantenedor**: @d4chigo
**Repositorio**: https://github.com/d4chigo/Crm-Delgado
