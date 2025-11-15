# 🚀 Guía para Ejecutar el CRM con BotCRM Integrado

## ✅ Cambios Realizados

### 1. **Corrección en BotCRM** (`botcrm/services/geminiService.ts`)
- ✅ Corregido error en línea 68 con `toolResponses`
- ✅ Actualizado formato de envío de respuestas de herramientas

### 2. **Configuración de Variables** (`botcrm/vite.config.ts`)
- ✅ Agregada variable `VITE_API_URL` 
- ✅ Fallback a `http://localhost:5000`

### 3. **Nuevo Widget de Chatbot** (`client/components/ChatbotWidget.tsx`)
- ✅ Componente reutilizable para integrar botcrm
- ✅ Carga lazy del iframe
- ✅ Interfaz moderna y responsive

### 4. **Integración en Dashboard** (`client/app/dashboard/page.tsx`)
- ✅ Agregado `ChatbotWidget` al final del dashboard
- ✅ Widget aparece debajo de leads recientes

---

## 📋 Requisitos Previos

- Docker y Docker Compose instalados
- Node.js 18+ (para compilar botcrm localmente)
- npm o pnpm

---

## 🎯 Pasos para Ejecutar

### Paso 1: Compilar BotCRM

**En Windows (PowerShell o CMD):**
```bash
# Opción 1: Usar script batch
setup-botcrm.bat

# Opción 2: Manual
cd botcrm
npm install
npm run build
xcopy /E /I /Y dist ..\client\public\botcrm
cd ..
```

**En Linux/Mac:**
```bash
# Opción 1: Usar script bash
bash setup-botcrm.sh

# Opción 2: Manual
cd botcrm
npm install
npm run build
cp -r dist/* ../client/public/botcrm/
cd ..
```

### Paso 2: Crear Red Docker (si no existe)

```bash
docker network create crm-shared-network
```

### Paso 3: Iniciar Servicios Docker

**Opción A: Usando Make (Recomendado)**
```bash
make dev
```

**Opción B: Usando Docker Compose**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Paso 4: Esperar a que los Servicios Estén Listos

```bash
# Ver logs
make logs

# O con Docker Compose
docker-compose -f docker-compose.dev.yml logs -f
```

Esperar hasta ver:
- ✅ Backend: "Server running on port 5000"
- ✅ Frontend: "ready - started server on 0.0.0.0:3000"
- ✅ MySQL: "ready for connections"

---

## 🌐 Acceder a la Aplicación

Una vez que todo esté listo:

| Servicio | URL | Usuario | Contraseña |
|----------|-----|---------|-----------|
| **CRM Frontend** | http://localhost:3000 | admin@delgado.com | admin123 |
| **Backend API** | http://localhost:5000 | - | - |
| **Adminer (BD)** | http://localhost:8080 | MySQL | - |

---

## 🤖 Probar el BotCRM

1. Acceder a http://localhost:3000
2. Iniciar sesión
3. Ir al **Dashboard**
4. Desplazarse hacia abajo
5. Hacer clic en **"Abrir Asistente de IA"**
6. El chatbot se abrirá en un panel
7. Probar escribir mensajes o usar micrófono

---

## 🛠️ Comandos Útiles

```bash
# Ver estado de contenedores
make ps

# Ver logs en tiempo real
make logs

# Detener servicios
make stop

# Reiniciar servicios
make restart

# Limpiar todo
make clean

# Conectar a MySQL
make db-shell

# Ejecutar migraciones
make db-migrate

# Seed de datos
make db-seed
```

---

## 📁 Estructura de Archivos Compilados

```
client/public/botcrm/
├── index.html          # Punto de entrada
├── index.css           # Estilos
└── assets/
    ├── index-*.js      # JavaScript compilado
    └── index-*.css     # CSS compilado
```

---

## 🔧 Variables de Entorno

### Para el Backend (`.env`)
```env
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:5000/api
SERVER_GEMINI_API_KEY=AIzaSyBxWeGfCmYlHKhAlqp10nqd3Eftj5p7UbI
```

### Para el BotCRM (`.env.local` - gitignored)
```env
VITE_API_URL=http://localhost:5000
GEMINI_API_KEY=tu_clave_aqui
```

---

## ⚠️ Troubleshooting

### El botcrm no aparece en el dashboard
- [ ] Verificar que `client/public/botcrm/index.html` existe
- [ ] Revisar logs del frontend: `make logs`
- [ ] Limpiar caché del navegador (Ctrl+Shift+Del)

### Error de CORS
- [ ] Verificar que backend está en puerto 5000
- [ ] Revisar CORS en `server/src/index.ts`
- [ ] Reiniciar backend: `make restart`

### El micrófono no funciona
- [ ] Permitir acceso al micrófono en el navegador
- [ ] Verificar que iframe tiene `allow="microphone"`
- [ ] Revisar permisos del sistema operativo

### Puerto ya en uso
```bash
# Cambiar puertos en .env
FRONTEND_PORT=3001
BACKEND_PORT=5001
MYSQL_PORT=3307
```

### Limpiar y reiniciar todo
```bash
make clean
make dev
```

---

## 📊 Monitoreo

### Ver logs de un servicio específico
```bash
# Backend
docker logs crm-backend-dev -f

# Frontend
docker logs crm-frontend-dev -f

# MySQL
docker logs crm-mysql-dev -f
```

### Ver uso de recursos
```bash
docker stats
```

---

## 🎉 ¡Listo!

El CRM con BotCRM integrado está listo para usar. El widget aparecerá en el dashboard y podrás:

✅ Chatear con el asistente de IA  
✅ Usar comandos de voz  
✅ Crear contactos  
✅ Consultar información  
✅ Navegar por el CRM  

---

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs: `make logs`
2. Verifica que Docker está corriendo
3. Asegúrate de que los puertos no están en uso
4. Limpia y reinicia: `make clean && make dev`

---

**Última actualización**: 2025-01-14  
**Versión**: 1.0
