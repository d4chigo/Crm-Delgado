# CRM Delgado - Guía de Producción

## 🚀 Despliegue en Producción

### Requisitos
- Docker y Docker Compose
- Node.js 18+ (para desarrollo local)
- MySQL 8.0+
- Gemini API Key (para asistente IA)

### Variables de Entorno

#### `.env` (raíz del proyecto)
```env
# Base de datos
DATABASE_URL="mysql://usuario:contraseña@host:3306/crm_delgado"

# Backend
NODE_ENV=production
SERVER_PORT=5000
JWT_SECRET=tu_jwt_secret_aqui
CORS_ORIGIN=https://tudominio.com

# Frontend
NEXT_PUBLIC_API_URL=https://api.tudominio.com

# Gemini API
GEMINI_API_KEY=tu_gemini_api_key_aqui
SERVER_GEMINI_API_KEY=tu_gemini_api_key_aqui

# Socket.IO
SOCKET_IO_PORT=5001
```

### Estructura del Proyecto

```
CRM-Delgado/
├── server/              # Backend (Node.js + Express)
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── config/
│   └── dist/           # Compilado
├── client/             # Frontend (Next.js)
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── .next/          # Compilado
├── botcrm/             # Asistente IA (Vite)
│   ├── src/
│   └── dist/           # Compilado
└── docker-compose.yml  # Orquestación
```

### Pasos de Despliegue

#### 1. Preparar el Servidor
```bash
# Clonar repositorio
git clone <repo-url>
cd Crm-Delgado

# Crear variables de entorno
cp .env.example .env
# Editar .env con valores de producción
```

#### 2. Compilar Aplicaciones
```bash
# Backend
cd server
npm install
npm run build
cd ..

# Frontend
cd client
npm install
npm run build
cd ..

# BotCRM
cd botcrm
npm install
npm run build
cd ..
```

#### 3. Iniciar con Docker Compose
```bash
# Producción
docker-compose -f docker-compose.yml up -d

# Verificar servicios
docker-compose ps
```

#### 4. Verificar Salud
```bash
# Backend
curl http://localhost:5000/health

# Frontend
curl http://localhost:3000

# Base de datos
docker-compose exec mysql mysql -u root -p -e "SELECT 1"
```

### Servicios Disponibles

| Servicio | Puerto | URL |
|----------|--------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend | 5000 | http://localhost:5000 |
| MySQL | 3306 | localhost:3306 |
| Adminer | 8080 | http://localhost:8080 |

### Monitoreo

#### Logs
```bash
# Todos los servicios
docker-compose logs -f

# Servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

#### Métricas
- Backend: `/api/analytics/metrics`
- Estadísticas: `/api/analytics/estadisticas`
- Reportes: `/api/analytics/reports/*`

### Backups

#### Base de Datos
```bash
# Crear backup
docker-compose exec mysql mysqldump -u root -p crm_delgado > backup.sql

# Restaurar backup
docker-compose exec -T mysql mysql -u root -p crm_delgado < backup.sql
```

### Seguridad

- ✅ JWT para autenticación
- ✅ CORS configurado
- ✅ Variables de entorno protegidas
- ✅ Contraseñas hasheadas (bcrypt)
- ✅ HTTPS recomendado en producción

### Troubleshooting

#### Puerto en uso
```bash
# Cambiar puerto en docker-compose.yml
# O liberar puerto:
lsof -i :5000
kill -9 <PID>
```

#### Base de datos no conecta
```bash
# Verificar conexión
docker-compose exec mysql mysql -u root -p -e "SELECT 1"

# Reiniciar MySQL
docker-compose restart mysql
```

#### Frontend no carga
```bash
# Limpiar caché
rm -rf client/.next
npm run build
docker-compose restart frontend
```

### Performance

- Frontend: Next.js con SSR/SSG
- Backend: Express con conexión pool
- Base de datos: Índices optimizados
- Caché: Redis (opcional)

### Mantenimiento

#### Actualizar dependencias
```bash
cd server && npm update && cd ..
cd client && npm update && cd ..
cd botcrm && npm update && cd ..
```

#### Limpiar contenedores
```bash
docker-compose down
docker system prune -a
```

### Contacto y Soporte

Para soporte técnico, contactar al equipo de desarrollo.
