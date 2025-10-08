# 🐳 CRM Inmobiliario - Docker Setup

Sistema CRM dockerizado con MySQL, Node.js/Express y Next.js, listo para desarrollo y producción.

## 📋 Requisitos Previos

- Docker Desktop instalado
- Docker Compose instalado
- 4GB RAM disponible mínimo
- Puertos disponibles: 3000, 5000, 3306, 80, 443

## 🚀 Inicio Rápido

### Desarrollo (con hot reload)

```bash
# 1. Copiar variables de entorno
cp .env.docker .env

# 2. Iniciar servicios de desarrollo
docker-compose -f docker-compose.dev.yml up -d

# 3. Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# 4. Acceder a la aplicación
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# MySQL: localhost:3306
```

### Producción

```bash
# 1. Configurar variables de entorno
cp .env.docker .env
# Edita .env y cambia:
# - NODE_ENV=production
# - Contraseñas seguras
# - JWT_SECRET único
# - NEXT_PUBLIC_API_URL con tu dominio

# 2. Build y iniciar servicios
docker-compose up -d --build

# 3. Ver logs
docker-compose logs -f

# 4. Acceder a través de Nginx
# HTTP: http://localhost
# HTTPS: https://tu-dominio.com (requiere SSL)
```

## 🔧 Comandos Útiles

### Gestión de Contenedores

```bash
# Ver estado de servicios
docker-compose ps

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ elimina la BD)
docker-compose down -v

# Reconstruir servicios
docker-compose up -d --build

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql

# Ejecutar comandos en un contenedor
docker-compose exec backend sh
docker-compose exec mysql mysql -u root -p
```

### Base de Datos

```bash
# Ejecutar migraciones de Prisma
docker-compose exec backend npx prisma migrate deploy

# Seed de datos iniciales
docker-compose exec backend npx prisma db seed

# Abrir Prisma Studio
docker-compose exec backend npx prisma studio

# Backup de base de datos
docker-compose exec mysql mysqldump -u root -p crm_delgado > backup.sql

# Restaurar backup
docker-compose exec -T mysql mysql -u root -p crm_delgado < backup.sql
```

### Desarrollo

```bash
# Reiniciar solo el backend
docker-compose -f docker-compose.dev.yml restart backend

# Ver logs en tiempo real
docker-compose -f docker-compose.dev.yml logs -f backend frontend

# Limpiar caché de Docker
docker system prune -a
```

## 📁 Estructura de Archivos Docker

```
.
├── docker-compose.yml          # Producción
├── docker-compose.dev.yml      # Desarrollo
├── .env.docker                 # Template de variables
├── .env                        # Variables de entorno (crear)
├── client/
│   ├── Dockerfile              # Build de producción
│   ├── Dockerfile.dev          # Build de desarrollo
│   └── .dockerignore
├── server/
│   ├── Dockerfile              # Build de producción
│   ├── Dockerfile.dev          # Build de desarrollo
│   └── .dockerignore
└── nginx/
    ├── nginx.conf              # Configuración Nginx
    └── ssl/                    # Certificados SSL (crear)
```

## 🔐 Seguridad

### Variables de Entorno Obligatorias

Antes de producción, **CAMBIAR** estas variables en `.env`:

```env
# ⚠️ CRÍTICO: Cambiar en producción
MYSQL_ROOT_PASSWORD=tu_password_mysql_super_seguro
MYSQL_PASSWORD=tu_password_usuario_super_seguro
JWT_SECRET=genera_un_jwt_secret_unico_y_seguro_minimo_32_caracteres
```

### Generar JWT Secret Seguro

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32
```

### Configurar SSL (HTTPS)

1. Obtener certificados SSL (Let's Encrypt recomendado):

```bash
# Usando Certbot
certbot certonly --standalone -d tu-dominio.com
```

2. Copiar certificados:

```bash
mkdir -p nginx/ssl
cp /etc/letsencrypt/live/tu-dominio.com/fullchain.pem nginx/ssl/cert.pem
cp /etc/letsencrypt/live/tu-dominio.com/privkey.pem nginx/ssl/key.pem
```

3. Descomentar configuración HTTPS en `nginx/nginx.conf`

4. Reiniciar Nginx:

```bash
docker-compose restart nginx
```

## 🌐 Despliegue en Producción

### Opción 1: VPS (DigitalOcean, Linode, etc.)

```bash
# 1. Conectar al servidor
ssh usuario@tu-servidor.com

# 2. Instalar Docker y Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 3. Clonar repositorio
git clone <tu-repo>
cd Crm-Delgado

# 4. Configurar .env
cp .env.docker .env
nano .env  # Editar variables

# 5. Iniciar servicios
docker-compose up -d --build

# 6. Configurar firewall
ufw allow 80
ufw allow 443
ufw enable
```

### Opción 2: AWS ECS / Azure Container Instances

1. Push de imágenes a registro:

```bash
# Etiquetar imágenes
docker tag crm-frontend:latest tu-registry/crm-frontend:latest
docker tag crm-backend:latest tu-registry/crm-backend:latest

# Push
docker push tu-registry/crm-frontend:latest
docker push tu-registry/crm-backend:latest
```

2. Configurar servicio cloud con las imágenes

### Opción 3: Kubernetes

Ver `k8s/` para manifiestos de Kubernetes (próximamente)

## 🔍 Troubleshooting

### Backend no se conecta a MySQL

```bash
# Verificar que MySQL está corriendo
docker-compose ps mysql

# Ver logs de MySQL
docker-compose logs mysql

# Verificar conectividad
docker-compose exec backend ping mysql
```

### Frontend no se conecta al Backend

```bash
# Verificar variable NEXT_PUBLIC_API_URL
docker-compose exec frontend env | grep API

# En desarrollo debe ser: http://localhost:5000
# En producción: https://api.tu-dominio.com
```

### Error de permisos en node_modules

```bash
# Limpiar volúmenes
docker-compose down -v
docker-compose up -d --build
```

### Puerto ocupado

```bash
# Ver qué proceso usa el puerto
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000

# Cambiar puerto en docker-compose.yml
ports:
  - "3001:3000"  # Cambiar 3000 por otro puerto
```

## 📊 Monitoreo

### Health Checks

Todos los servicios tienen health checks configurados:

```bash
# Ver estado de salud
docker-compose ps

# Servicios healthy: estado "healthy"
# Servicios con problemas: estado "unhealthy"
```

### Logs

```bash
# Todos los servicios
docker-compose logs -f

# Solo errores
docker-compose logs -f | grep ERROR

# Últimas 100 líneas
docker-compose logs --tail=100
```

## 🎯 Optimizaciones de Producción

### Habilitar en nginx.conf:
- ✅ Gzip compression
- ✅ Rate limiting
- ✅ Security headers
- ✅ HTTPS redirect
- ✅ SSL configuration

### Multi-stage builds:
- ✅ Reduce tamaño de imágenes
- ✅ Separa dependencies de runtime
- ✅ Optimiza caché de layers

### Usuarios no-root:
- ✅ Mayor seguridad
- ✅ Previene escalación de privilegios

## 📝 Notas Adicionales

- Los datos de MySQL se persisten en volúmenes Docker
- Hot reload funciona en modo desarrollo
- Prisma migraciones se ejecutan automáticamente al iniciar
- Seed de datos se ejecuta en el primer inicio

## 🆘 Soporte

Si encuentras problemas:
1. Revisa los logs: `docker-compose logs -f`
2. Verifica `.env` tiene las variables correctas
3. Asegúrate que los puertos estén disponibles
4. Prueba reconstruir: `docker-compose up -d --build`

---

**Desarrollado con ❤️ usando Docker + Next.js + Express + MySQL**
