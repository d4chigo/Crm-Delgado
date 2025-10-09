# 🔧 Configuración de Variables de Entorno

Este proyecto utiliza un **único archivo `.env`** en la raíz para toda la configuración.

## 📁 Estructura de archivos .env

```
Crm-Delgado/
├── .env                  ← ARCHIVO PRINCIPAL (usar este)
├── .env.docker           ← Plantilla para producción (NO usar directamente)
├── client/.env           ← IGNORAR (no se usa con Docker)
└── server/.env           ← IGNORAR (no se usa con Docker)
```

## 🚀 Configuración Inicial

### Para Desarrollo:

1. El archivo `.env` en la raíz ya está configurado para desarrollo
2. Solo ejecuta:
   ```bash
   docker compose -f docker-compose.dev.yml up -d
   ```

### Para Producción:

1. Copia la plantilla:
   ```bash
   cp .env.docker .env
   ```

2. Edita `.env` y cambia TODOS los valores que digan `CAMBIAR_`:
   - `MYSQL_ROOT_PASSWORD`
   - `MYSQL_PASSWORD`
   - `JWT_SECRET` (genera uno con: `openssl rand -hex 32`)
   - `DNI_API_TOKEN` (obtén uno en https://apis.net.pe/)
   - `CORS_ORIGIN` (tu dominio)
   - `NEXT_PUBLIC_API_URL` (tu dominio/api)

3. Ejecuta:
   ```bash
   docker compose up -d --build
   ```

## 📝 Variables Importantes

### Base de Datos
```env
MYSQL_ROOT_PASSWORD=root_password_dev_2025
MYSQL_USER=crm_user
MYSQL_PASSWORD=crm_pass_dev_2025
MYSQL_DATABASE=crm_delgado
```

### Seguridad
```env
JWT_SECRET=tu_jwt_secret_super_seguro_cambiar_en_produccion_123456
BCRYPT_ROUNDS=10
```

### APIs Externas
```env
# Obtén tu token en: https://apis.net.pe/
DNI_API_TOKEN=sk_10762.V1Kv1GVDbnrxZmwYFk7NGvHLSkWMnR0F
```

### URLs
```env
CORS_ORIGIN=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Puertos
```env
MYSQL_PORT=3306
BACKEND_PORT=5000
FRONTEND_PORT=3000
ADMINER_PORT=8080
```

## 🔒 Seguridad

- ✅ El archivo `.env` está en `.gitignore` y NO se sube a Git
- ✅ Usa `.env.docker` como plantilla para nuevos ambientes
- ⚠️ NUNCA subas el archivo `.env` con datos reales al repositorio
- ⚠️ Cambia TODAS las contraseñas en producción

## 🎯 ¿Por qué un solo .env?

- ✅ Configuración centralizada
- ✅ No duplicar variables
- ✅ Fácil de mantener
- ✅ Docker Compose lee automáticamente `.env` de la raíz
- ✅ Todas las variables disponibles para todos los servicios

## 🧪 Verificar Variables

Para verificar que las variables están cargadas correctamente:

```bash
# Ver variables del backend
docker compose -f docker-compose.dev.yml exec backend printenv

# Ver una variable específica
docker compose -f docker-compose.dev.yml exec backend printenv DNI_API_TOKEN
```

## ❓ Problemas Comunes

### "API Token no configurado"
- Verifica que `DNI_API_TOKEN` esté en `.env`
- Reinicia los contenedores: `docker compose -f docker-compose.dev.yml restart`

### "Cannot connect to database"
- Verifica `MYSQL_PASSWORD` en `.env`
- Asegúrate que coincida en `DATABASE_URL`

### Variables no se actualizan
- Detén y levanta de nuevo (restart no recarga variables):
  ```bash
  docker compose -f docker-compose.dev.yml down
  docker compose -f docker-compose.dev.yml up -d
  ```
