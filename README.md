# 🏢 CRM Delgado - Sistema de Gestión Inmobiliaria

[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)](https://www.mysql.com/)
[![PHP](https://img.shields.io/badge/PHP-8.2-purple)](https://www.php.net/)

Sistema completo de gestión inmobiliaria con CRM administrativo (Next.js + Node.js) y sitio web público (PHP) integrados mediante una base de datos MySQL compartida.

---

## 🚀 Inicio Rápido

### Requisitos
- Docker Desktop con WSL2 (Windows)
- Git

### Comandos de Inicio
```bash
# 1. Clonar repositorio
git clone https://github.com/d4chigo/Crm-Delgado.git
cd Crm-Delgado

# 2. Crear red Docker compartida
docker network create crm-shared-network

# 3. Levantar servicios
docker compose -f docker-compose.dev.yml up -d --build

# 4. Abrir en navegador
# CRM: http://localhost:3000
# API: http://localhost:5000/api
# Adminer: http://localhost:8080
```

**🎉 ¡Listo! El sistema está corriendo.**

---

## 📖 Documentación

### 📚 Guías Disponibles

| Documento | Descripción |
|-----------|-------------|
| **[GUIA-DESARROLLO.md](./GUIA-DESARROLLO.md)** | 📘 **Guía completa de desarrollo** (comandos Docker, Prisma, troubleshooting) |
| [GUIA-EJECUCION.md](./GUIA-EJECUCION.md) | Pasos de ejecución paso a paso |
| [DOCKER.md](./DOCKER.md) | Detalles de la arquitectura Docker |
| [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) | Configuración de Google OAuth |
| [GOOGLE_CALENDAR_SETUP.md](./GOOGLE_CALENDAR_SETUP.md) | Integración con Google Calendar |
| [VOICE_SETUP.md](./VOICE_SETUP.md) | Configuración de llamadas por voz |

> **👉 Para desarrollo, lee primero: [GUIA-DESARROLLO.md](./GUIA-DESARROLLO.md)**

---

## 🏗️ Arquitectura

### Componentes Principales

```
┌─────────────────────────────────────────────────────────┐
│               CRM Delgado (Puerto 3000)                 │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Frontend   │  │   Backend    │  │    MySQL      │  │
│  │  Next.js    │←→│  Express     │←→│   8.0         │  │
│  │  TypeScript │  │  Prisma ORM  │  │   crm_delgado │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↕
              ┌────────────────────────┐
              │  crm-shared-network    │ (Red Docker)
              └────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│          Web Pública PGDP (Puerto 8081)                 │
│  ┌──────────────────────────────────────────────────┐   │
│  │  PHP 8.2 + Apache                                │   │
│  │  APIs REST (proyectos, servicios, testimonios)  │   │
│  │  Portal del Cliente                              │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Stack Tecnológico

#### Frontend (CRM Admin)
- **Framework**: Next.js 14 (App Router)
- **UI**: React, TailwindCSS, shadcn/ui
- **Estado**: React Context + Hooks
- **Comunicación**: Fetch API

#### Backend (API)
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **ORM**: Prisma
- **Validación**: Joi / Zod
- **Autenticación**: JWT

#### Base de Datos
- **Motor**: MySQL 8.0
- **ORM**: Prisma
- **Migraciones**: Prisma Migrate
- **GUI**: Adminer (puerto 8080)

#### Web Pública
- **Lenguaje**: PHP 8.2
- **Servidor**: Apache 2.4
- **Extensiones**: PDO, MySQLi
- **APIs**: REST JSON

---

## 📂 Estructura del Proyecto

```
Crm-Delgado/
├── client/                    # Frontend Next.js
│   ├── app/                   # Pages (App Router)
│   ├── components/            # Componentes React
│   ├── hooks/                 # Custom Hooks
│   ├── lib/                   # Utilidades
│   ├── services/              # API clients
│   ├── types/                 # TypeScript types
│   └── public/                # Assets estáticos
│
├── server/                    # Backend Node.js
│   ├── src/
│   │   ├── controllers/       # Lógica de negocio
│   │   ├── routes/            # Endpoints API
│   │   ├── middlewares/       # Auth, validación, etc.
│   │   ├── services/          # Servicios externos
│   │   └── utils/             # Helpers
│   └── prisma/
│       ├── schema.prisma      # Esquema de BD
│       ├── migrations/        # Migraciones SQL
│       └── seed.ts            # Datos iniciales
│
├── database/                  # Scripts SQL
│   └── main.sql              # Schema inicial
│
├── docker-compose.dev.yml     # Orquestación Docker
├── .env                       # Variables de entorno
├── GUIA-DESARROLLO.md         # 📘 Guía completa
└── README.md                  # Este archivo
```

---

## 🎯 Características Principales

### CRM Administrativo
- ✅ **Gestión de Contactos** (Leads, Clientes, Prospectos)
- ✅ **Proyectos Inmobiliarios** (Departamentos, casas, terrenos)
- ✅ **Oportunidades de Venta** (Pipeline, seguimiento)
- ✅ **Cotizaciones** (Generación automática, PDFs)
- ✅ **Dashboard Analytics** (Métricas en tiempo real)
- ✅ **Calendario de Actividades** (Integración Google Calendar)
- ✅ **Autenticación JWT** (Login seguro)
- ✅ **Asistente Virtual** (Gemini AI)
- ✅ **Llamadas por Voz** (WebRTC)

### Web Pública (PGDP)
- ✅ **Catálogo de Propiedades** (Consume API del CRM)
- ✅ **Búsqueda y Filtros** (Por tipo, precio, ubicación)
- ✅ **Portal del Cliente** (Login, documentos, pagos)
- ✅ **APIs REST** (JSON para frontend)
- ✅ **Responsive Design** (Mobile-first)

---

## 🔧 Comandos Principales

### Docker

```bash
# Iniciar todo
docker compose -f docker-compose.dev.yml up -d

# Ver logs
docker compose -f docker-compose.dev.yml logs -f

# Detener todo
docker compose -f docker-compose.dev.yml down

# Reiniciar servicio específico
docker compose -f docker-compose.dev.yml restart backend

# Limpiar y empezar de cero
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d --build
```

### Prisma (Base de Datos)

```bash
# Crear migración
docker exec crm-backend-dev npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones
docker exec crm-backend-dev npx prisma migrate deploy

# Abrir Prisma Studio
docker exec crm-backend-dev npx prisma studio

# Generar cliente
docker exec crm-backend-dev npx prisma generate

# Resetear BD (¡cuidado!)
docker exec crm-backend-dev npx prisma migrate reset
```

### Desarrollo

```bash
# Ver logs del backend
docker logs crm-backend-dev -f

# Ver logs del frontend
docker logs crm-frontend-dev -f

# Entrar al contenedor
docker exec -it crm-backend-dev bash

# Acceder a MySQL
docker exec -it crm-mysql-dev mysql -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"
```

---

## 🌐 URLs de Acceso

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| **CRM Frontend** | http://localhost:3000 | Usuario del sistema |
| **API Backend** | http://localhost:5000/api | - |
| **Adminer (BD)** | http://localhost:8080 | Configurar credenciales mediante `.env` |
| **Web PHP** | http://localhost:8081 | - |

---

## 🛠️ Troubleshooting Rápido

### Backend no conecta a MySQL
```bash
# Verificar DATABASE_URL en .env (debe ser @mysql:3306, no @localhost)
cat .env | grep DATABASE_URL

# Corregir si es necesario
sed -i 's/@localhost:3306/@mysql:3306/' .env
docker compose -f docker-compose.dev.yml restart backend
```

### Puerto en uso
```bash
# Cambiar puertos en .env
FRONTEND_PORT=3001
BACKEND_PORT=5001

# Reiniciar
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up -d
```

### Cambios no se reflejan
```bash
# Frontend: limpiar caché
docker exec crm-frontend-dev rm -rf .next
docker compose -f docker-compose.dev.yml restart frontend

# Backend: forzar reload
docker compose -f docker-compose.dev.yml restart backend
```

**📖 Para más problemas, consulta [GUIA-DESARROLLO.md](./GUIA-DESARROLLO.md#troubleshooting)**

---

## 📊 Variables de Entorno

Archivo `.env` principal:

```env
# Base de datos
MYSQL_DATABASE=crm_delgado
MYSQL_USER=crm_user
MYSQL_PASSWORD=
DATABASE_URL=

# JWT
JWT_SECRET=
JWT_EXPIRES_IN=24h

# APIs
DNI_API_TOKEN=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SERVER_GEMINI_API_KEY=

# URLs
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto es privado y propiedad de Delgado Propiedades.

---

## 👨‍💻 Autor

**Jhonatan Chigcay** (@d4chigo)
- GitHub: [@d4chigo](https://github.com/d4chigo)
- Proyecto: CRM Delgado

---

## 🔗 Enlaces Útiles

- [Documentación Prisma](https://www.prisma.io/docs)
- [Documentación Next.js](https://nextjs.org/docs)
- [Documentación Docker](https://docs.docker.com/)
- [Guía de Desarrollo](./GUIA-DESARROLLO.md) ⭐

---

**Última actualización**: 1 de noviembre de 2025
