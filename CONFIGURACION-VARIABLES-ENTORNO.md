# 🔧 Configuración Detallada de Variables de Entorno

## Índice Rápido
1. [Base de Datos MySQL](#1-base-de-datos-mysql)
2. [JWT y Seguridad](#2-jwt-y-seguridad)
3. [API DNI (Perú)](#3-api-dni-perú)
4. [Google OAuth](#4-google-oauth)
5. [Gmail para Emails](#5-gmail-para-emails)
6. [Gemini API](#6-gemini-api)

---

## 1. Base de Datos MySQL

### Opción A: Desarrollo Local (SIN Docker)

```bash
# Instala MySQL en tu computadora
# Windows: https://dev.mysql.com/downloads/mysql/
# Mac: brew install mysql
# Linux: sudo apt install mysql-server

# En .env:
DATABASE_URL=mysql://crm_user:crm_pass_dev_2025@localhost:3306/crm_delgado
MYSQL_PORT=3306
```

### Opción B: Docker (RECOMENDADO)

```bash
# Los valores en .env se usan automáticamente
# Solo edita si necesitas cambiar puerto o contraseña

MYSQL_ROOT_PASSWORD=root_password_dev_2025
MYSQL_DATABASE=crm_delgado
MYSQL_USER=crm_user
MYSQL_PASSWORD=crm_pass_dev_2025
DATABASE_URL=mysql://crm_user:crm_pass_dev_2025@mysql:3306/crm_delgado

# Luego ejecuta:
docker-compose up
```

### Verificar Conexión

```bash
# Vía Adminer (más fácil)
# Abre: http://localhost:8080
# Servidor: mysql
# Usuario: crm_user
# Contraseña: crm_pass_dev_2025
# BD: crm_delgado

# O vía terminal:
mysql -h localhost -u crm_user -p crm_delgado
# Ingresa contraseña: crm_pass_dev_2025
```

---

## 2. JWT y Seguridad

### Generar JWT_SECRET

```bash
# En Windows (PowerShell):
[Convert]::ToHexString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# En Mac/Linux:
openssl rand -hex 32

# Resultado será algo como:
# a3f7b9c2e1d4f5a8b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3

# Cópialo y pégalo en .env:
JWT_SECRET=a3f7b9c2e1d4f5a8b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3
```

### Valores de JWT_EXPIRES_IN

```env
# Duración de los tokens de sesión

# 1 hora:
JWT_EXPIRES_IN=1h

# 24 horas (recomendado):
JWT_EXPIRES_IN=24h

# 7 días:
JWT_EXPIRES_IN=7d

# 30 días:
JWT_EXPIRES_IN=30d
```

---

## 3. API DNI (Perú)

### Paso 1: Registrarse

1. Ve a: **https://apis.net.pe/**
2. Click en "Registrarse"
3. Completa el formulario
4. Confirma email
5. Inicia sesión

### Paso 2: Crear Aplicación

1. Ve a "Mis Aplicaciones"
2. Click en "Crear Nueva Aplicación"
3. Nombre: "CRM Delgado"
4. Descripción: "Consulta de DNI para CRM"
5. Click en "Crear"

### Paso 3: Obtener Token

1. En la aplicación creada, ve a "Configuración"
2. Busca "API Token" o "API Key"
3. Cópialo
4. Pégalo en .env:

```env
DNI_API_TOKEN=sk_10762.TrvGAsEZggD8fm9RdpKUtq17KyerYY6k
```

### Verificar Funcionamiento

```bash
# En tu terminal:
curl -X GET "https://apis.net.pe/api/v1/consultar-dni?dni=12345678" \
  -H "Authorization: Bearer sk_10762.TrvGAsEZggD8fm9RdpKUtq17KyerYY6k"

# Deberías recibir datos del DNI si existe
```

### Límites Gratuitos

- **1,000 consultas/mes** (gratis)
- Después: $0.01 por consulta
- Muy económico para uso normal

---

## 4. Google OAuth (Calendario)

### Paso 1: Crear Proyecto en Google Cloud

1. Ve a: **https://console.cloud.google.com/**
2. Click en "Seleccionar un proyecto" (arriba)
3. Click en "Nuevo proyecto"
4. Nombre: "CRM Delgado"
5. Espera a que se cree (2-3 minutos)
6. Haz click en el proyecto nuevo

### Paso 2: Habilitar APIs

1. En el buscador, busca: "Google Calendar API"
2. Click en el resultado
3. Click en "HABILITAR"
4. Vuelve atrás y busca: "Google Contacts API"
5. Click en "HABILITAR"

### Paso 3: Crear Credenciales OAuth

1. Ve a "Credenciales" (en el menú izquierdo)
2. Click en "Crear Credenciales"
3. Selecciona "OAuth 2.0 - Aplicación web"
4. En "URIs autorizados":
   - Agregar: `http://localhost:5000/api/calendar/callback`
   - Agregar: `http://localhost:5000/api/auth/google/callback`
5. Click en "Crear"

### Paso 4: Copiar Credenciales

1. Se abrirá un popup con tu CLIENT_ID y CLIENT_SECRET
2. Cópialo o descargar JSON
3. Pégalos en .env:

```env
GOOGLE_CLIENT_ID=199058992191-0sqmua3i2742qvovg22lp2rnpp7gpmgh.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:5000/api/calendar/callback
```

### En Producción

Cambiar URLs por dominio real:

```env
GOOGLE_CALENDAR_REDIRECT_URI=https://api.tu-dominio.com/api/calendar/callback
```

### Verificar Funcionamiento

1. Abre el CRM
2. Ve a "Calendario"
3. Click en "Conectar Google Calendar"
4. Google te pedirá que autorices
5. ¡Listo! El calendario funciona

---

## 5. Gmail para Emails (NOTIFICACIONES)

### Requisito: Activar 2FA

1. Ve a: **https://myaccount.google.com/**
2. Click en "Seguridad" (izquierda)
3. Busca "Verificación en dos pasos"
4. Click en "Activar"
5. Sigue los pasos (SMS o Authenticator)

### Obtener Contraseña de App

1. Ve a: **https://myaccount.google.com/apppasswords**
2. En "Seleccionar aplicación" → "Mail"
3. En "Seleccionar dispositivo" → "Windows Computer" (o tu OS)
4. Click en "Generar"
5. Google muestra 16 caracteres sin espacios
6. **Cópialos exactamente** (sin espacios)

### Pegar en .env

```env
GMAIL_EMAIL=tu@gmail.com
GMAIL_APP_PASSWORD=aompamfuiglgdsyz
```

⚠️ **IMPORTANTE:**
- NO es tu contraseña normal de Gmail
- Es específica para aplicaciones
- Si la pierdes, vuelve a generar
- Nunca uses tu contraseña normal aquí

### Verificar Funcionamiento

1. Abre el CRM
2. Agenda una reunión en un lead/cliente
3. Mira los logs del servidor
4. Deberías ver: `✅ Email enviado por Gmail exitosamente`
5. Revisa tu bandeja de entrada

### Solucionar Problemas

**Error: "contraseña incorrecta"**
- Verifica que la contraseña tiene 16 caracteres
- Sin espacios intermedios
- Copia de nuevo desde Google

**Error: "2FA no está activado"**
- Ve a: https://myaccount.google.com/security
- Activa verificación en dos pasos
- Luego genera contraseña de app

**No recibo emails**
- Revisa carpeta de SPAM
- Verifica que el contacto tiene email
- Mira los logs para errores

---

## 6. Gemini API (Asistente IA)

### Paso 1: Crear API Key

1. Ve a: **https://ai.google.dev/**
2. Click en "Get started" o "API Key"
3. Click en "Create API key in Google Cloud Console"
4. Selecciona tu proyecto "CRM Delgado"
5. Click en "Create API key"
6. Cópialo

### Paso 2: Pegar en .env

```env
SERVER_GEMINI_API_KEY=AIzaSyBxWeGfCmYlHKhAlqp10nqd3Eftj5p7UbI
```

### Límites Gratuitos

- **60 solicitudes/minuto** (gratis)
- Sin tarjeta de crédito
- Perfecto para desarrollo y uso normal

### Verificar Funcionamiento

1. Abre el CRM
2. Ve a "Asistente" (icono de chat)
3. Escribe un mensaje
4. Deberías recibir respuesta del bot

---

## Checklist de Configuración

### Básico (Requerido)

- [ ] Base de datos MySQL configurada
- [ ] JWT_SECRET generado
- [ ] CORS_ORIGIN correcto
- [ ] .env creado (no .env.example)
- [ ] Servidor iniciado: `npm run dev`

### Intermedio (Recomendado)

- [ ] DNI API token obtenido
- [ ] Gmail configurado para emails
- [ ] 2FA activado en Google

### Avanzado (Opcional)

- [ ] Google OAuth configurado
- [ ] Gemini API configurado
- [ ] Pruebas completadas

---

## Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| `Error: connect ECONNREFUSED` | MySQL no corre | `docker-compose up` |
| `JWT malformed` | JWT_SECRET no existe | Generar con openssl |
| `CORS error` | CORS_ORIGIN incorrecto | Verificar CORS_ORIGIN |
| `DNI no encontrado` | DNI_API_TOKEN expirado | Renovar en apis.net.pe |
| `Email no enviado` | Gmail no configurado | Activar 2FA y app password |
| `Google auth failed` | Credenciales erróneas | Verificar CLIENT_ID/SECRET |

---

## Seguridad en Producción

Cuando despliegues a producción:

1. **Generar nuevos secretos:**
   ```bash
   openssl rand -hex 32  # JWT_SECRET
   openssl rand -hex 16  # Otros secretos
   ```

2. **Cambiar URLs:**
   ```env
   CORS_ORIGIN=https://tu-dominio.com
   NEXT_PUBLIC_API_URL=https://api.tu-dominio.com
   CLIENT_URL=https://tu-dominio.com
   GOOGLE_CALENDAR_REDIRECT_URI=https://api.tu-dominio.com/api/calendar/callback
   ```

3. **Usar variables de entorno del servidor:**
   - NO hardcodear secretos
   - Usar administrador de secretos (AWS Secrets Manager, etc.)

4. **No compartir .env:**
   - Solo para desarrollo local
   - En producción: usar variables del servidor

---

## Contacto y Soporte

Si algo no funciona:
1. Revisa los logs del servidor: `npm run dev`
2. Verifica que el .env tiene los valores correctos
3. Busca el error específico arriba
4. Reinicia el servidor después de cambiar .env

