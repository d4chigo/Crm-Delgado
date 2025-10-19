# 🚀 API Backend - CRM Delgado

Sistema de autenticación seguro con JWT para el CRM Inmobiliario Delgado.

## 📋 Tecnologías

- **Node.js** con TypeScript
- **Express** - Framework web
- **Prisma ORM** - Base de datos
- **MySQL** - Base de datos relacional
- **JWT** - Autenticación (tokens expiran en 24h)
- **bcrypt** - Hash de contraseñas
- **Zod** - Validación de datos
- **Helmet, CORS, Rate-Limit** - Seguridad

## 🗂️ Estructura del Proyecto

```
server/
├── prisma/
│   ├── schema.prisma          # Modelos de base de datos
│   ├── seed.ts                # Script para datos iniciales
│   └── migrations/            # Migraciones de BD
├── src/
│   ├── config/
│   │   └── database.ts        # Cliente Prisma
│   ├── controllers/
│   │   └── auth.controller.ts # Controladores HTTP
│   ├── middlewares/
│   │   ├── autenticacion.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validacion.middleware.ts
│   ├── routes/
│   │   └── auth.routes.ts     # Rutas de API
│   ├── services/
│   │   └── auth.service.ts    # Lógica de negocio
│   ├── types/
│   │   └── index.ts           # Tipos TypeScript
│   ├── utils/
│   │   ├── jwt.util.ts        # Utilidades JWT
│   │   ├── password.util.ts   # Hash de contraseñas
│   │   └── respuesta.util.ts  # Respuestas API
│   ├── validators/
│   │   └── auth.validator.ts  # Esquemas Zod
│   └── index.ts               # Servidor principal
├── .env                        # Variables de entorno
├── package.json
├── tsconfig.json
└── nodemon.json
```

## 🔧 Configuración

### 1. Variables de Entorno (.env)

```env
# Base de datos
DATABASE_URL="mysql://root@127.0.0.1:3306/crm_delgado"

# JWT
JWT_SECRET="tu-secret-super-secreto-cambiar-en-produccion"
JWT_EXPIRES_IN="24h"

# Servidor
PORT=5000
NODE_ENV=development

# Seguridad
CORS_ORIGIN="http://localhost:3000"
BCRYPT_ROUNDS=10

# API DNI Perú (decolecta.com)
DNI_API_TOKEN=""  # Obtén tu token gratis en https://decolecta.com/
```

> **🔑 Obtener Token de API DNI:**
> 1. Visita https://decolecta.com/
> 2. Regístrate gratis
> 3. En tu panel genera un token de API
> 4. Copia el token en `DNI_API_TOKEN` en el archivo `.env`
> 5. **Plan Gratuito**: Hasta 100 consultas por día

### 2. Instalar Dependencias

```bash
pnpm install
```

### 3. Configurar Base de Datos

```bash
# Ejecutar migraciones
pnpm prisma:migrate

# Crear usuario admin inicial
pnpm prisma:seed
```

## 🚦 Scripts Disponibles

```bash
# Desarrollo (con auto-reload)
pnpm dev

# Compilar TypeScript
pnpm build

# Producción
pnpm start

# Prisma
pnpm prisma:generate    # Generar cliente Prisma
pnpm prisma:migrate     # Ejecutar migraciones
pnpm prisma:studio      # Abrir interfaz visual de BD
pnpm prisma:seed        # Ejecutar seed (crear admin)
```

## 🔐 Endpoints de API

### Base URL
```
http://localhost:5000/api
```

### Health Check
```http
GET /api/health
```

### Autenticación

#### Registro de Usuario
```http
POST /api/auth/registro
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "telefono": "1234567890" // opcional
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@crm-delgado.com",
  "password": "admin123"
}
```

**Respuesta exitosa:**
```json
{
  "exito": true,
  "datos": {
    "usuario": {
      "id": "uuid",
      "nombre": "Administrador",
      "email": "admin@crm-delgado.com",
      "rol": "ADMIN",
      "activo": true,
      "creadoEn": "2024-01-01T00:00:00.000Z",
      "actualizadoEn": "2024-01-01T00:00:00.000Z"
    },
    "token": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiraEn": "24h"
    }
  },
  "mensaje": "Login exitoso"
}
```

#### Obtener Perfil (requiere autenticación)
```http
GET /api/auth/perfil
Authorization: Bearer <token>
```

### Consulta de DNI (RENIEC - Perú)

#### Consultar DNI
```http
GET /api/dni/:numero
Authorization: Bearer <token>

# Ejemplo:
GET /api/dni/12345678
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta exitosa:**
```json
{
  "exito": true,
  "mensaje": "DNI encontrado exitosamente",
  "datos": {
    "dni": "12345678",
    "nombre": "JUAN CARLOS",
    "apellido": "PÉREZ GARCÍA",
    "apellidoPaterno": "PÉREZ",
    "apellidoMaterno": "GARCÍA"
  }
}
```

**Respuestas de error:**
```json
// DNI no encontrado
{
  "exito": false,
  "mensaje": "DNI no encontrado en RENIEC"
}

// DNI inválido
{
  "exito": false,
  "mensaje": "El DNI debe tener exactamente 8 dígitos"
}

// Token no configurado
{
  "exito": false,
  "mensaje": "API Token no configurado. Configure DNI_API_TOKEN en .env"
}
```

> **📌 Notas sobre API DNI:**
> - Requiere `DNI_API_TOKEN` configurado en `.env`
> - Usa la API de **APIs.net.pe** - https://apis.net.pe/
> - Plan gratuito: 100 consultas/día
> - Responde con datos oficiales de RENIEC
> - El DNI debe tener exactamente 8 dígitos numéricos
> - Útil para auto-completar formularios de contactos

### Contactos

#### Obtener Perfil (requiere autenticación)
```http
GET /api/auth/perfil
Authorization: Bearer <token>
```

## 🔒 Seguridad

- **Helmet**: Protección de headers HTTP
- **CORS**: Control de origen cruzado
- **Rate Limiting**: 100 requests por 15 minutos por IP
- **bcrypt**: Contraseñas hasheadas con 10 rounds
- **JWT**: Tokens seguros que expiran en 24 horas
- **Zod**: Validación estricta de datos de entrada

## 👥 Roles de Usuario

- **ADMIN**: Administrador del sistema
- **SUPERVISOR**: Supervisor de equipo
- **AGENTE**: Agente de ventas
- **ASISTENTE**: Asistente administrativo

## 🛠️ Usuario Admin Inicial

Después de ejecutar `pnpm prisma:seed`:

- **Email**: `admin@crm-delgado.com`
- **Contraseña**: `admin123`
- **Rol**: ADMIN

⚠️ **IMPORTANTE**: Cambia la contraseña después del primer login.

## 📝 Respuestas de API

### Respuesta Exitosa
```json
{
  "exito": true,
  "datos": { ... },
  "mensaje": "Operación exitosa"
}
```

### Respuesta de Error
```json
{
  "exito": false,
  "error": "Mensaje de error",
  "detalles": { ... },
  "codigo": "CODIGO_ERROR"
}
```

## 🐛 Manejo de Errores

El sistema incluye manejo centralizado de errores con códigos específicos:

- `TOKEN_NO_ENCONTRADO`: No se proporcionó token
- `TOKEN_EXPIRADO`: Token ha expirado (después de 24h)
- `TOKEN_INVALIDO`: Token corrupto o inválido
- `CREDENCIALES_INVALIDAS`: Email o password incorrectos
- `EMAIL_DUPLICADO`: Email ya registrado
- `VALIDACION_ERROR`: Error en validación de datos
- `ACCESO_DENEGADO`: Sin permisos suficientes

## 📊 Base de Datos

### Modelo Usuario

```prisma
model Usuario {
  id             String   @id @default(uuid())
  nombre         String
  email          String   @unique
  password       String
  rol            Rol      @default(AGENTE)
  avatar         String?
  telefono       String?
  activo         Boolean  @default(true)
  creadoEn       DateTime @default(now())
  actualizadoEn  DateTime @updatedAt

  @@map("usuarios")
}

enum Rol {
  ADMIN
  SUPERVISOR
  AGENTE
  ASISTENTE
}
```

## 🔄 Flujo de Autenticación

1. Usuario se registra o hace login
2. Servidor valida credenciales
3. Servidor genera JWT (válido 24h)
4. Cliente guarda token
5. Cliente incluye token en header `Authorization: Bearer <token>`
6. Middleware verifica token en cada request protegido
7. Después de 24h, usuario debe volver a hacer login

## 🚀 Despliegue

1. Configura variables de entorno en producción
2. Cambia `NODE_ENV=production`
3. Usa un JWT_SECRET seguro y único
4. Ejecuta `pnpm build`
5. Ejecuta `pnpm start`

---

**Desarrollado con ❤️ en español para facilitar el mantenimiento**
