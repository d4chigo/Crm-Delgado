# 🚀 Comandos Rápidos Docker

## ⚠️ IMPORTANTE: Ejecutar desde WSL/Debian
Todos estos comandos deben ejecutarse desde tu terminal WSL en Debian, NO desde bash de Windows.

```bash
# Navegar al proyecto
cd /mnt/d/Projects/App/Crm-Delgado
```

---

## 🗄️ Poblar Base de Datos (Seed)

```bash
# Crear usuario admin y etiquetas iniciales
docker compose -f docker-compose.dev.yml exec backend npx prisma db seed
```

**Credenciales creadas:**
- Email: `admin@crm-delgado.com`
- Password: `admin123`
- Rol: ADMIN

---

## 🔄 Comandos Útiles

### Ver logs
```bash
# Todos los servicios
docker compose -f docker-compose.dev.yml logs -f

# Solo frontend
docker compose -f docker-compose.dev.yml logs -f frontend

# Solo backend
docker compose -f docker-compose.dev.yml logs -f backend
```

### Reiniciar servicios
```bash
# Reiniciar frontend
docker compose -f docker-compose.dev.yml restart frontend

# Reiniciar backend
docker compose -f docker-compose.dev.yml restart backend

# Reiniciar todo
docker compose -f docker-compose.dev.yml restart
```

### Detener y volver a levantar (necesario para cambios en volúmenes)
```bash
# Detener frontend
docker compose -f docker-compose.dev.yml stop frontend

# Levantar frontend
docker compose -f docker-compose.dev.yml up -d frontend

# O hacer ambos a la vez:
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up -d
```

### Ver estado de contenedores
```bash
docker compose -f docker-compose.dev.yml ps
```

### Entrar a un contenedor
```bash
# Backend
docker compose -f docker-compose.dev.yml exec backend sh

# Frontend
docker compose -f docker-compose.dev.yml exec frontend sh

# MySQL
docker compose -f docker-compose.dev.yml exec mysql bash
```

---

## 🗄️ Gestión de Base de Datos

### Migraciones
```bash
# Aplicar migraciones pendientes
docker compose -f docker-compose.dev.yml exec backend npx prisma migrate deploy

# Crear nueva migración (después de editar schema.prisma)
docker compose -f docker-compose.dev.yml exec backend npx prisma migrate dev --name nombre_migracion
```

### Prisma Studio (Interfaz visual)
```bash
docker compose -f docker-compose.dev.yml exec backend npx prisma studio
# Abre http://localhost:5555
```

### MySQL CLI
```bash
# Conectarse a MySQL
docker compose -f docker-compose.dev.yml exec mysql mysql -u crm_user -pcrm_pass crm_delgado

# Comandos útiles dentro de MySQL:
SHOW TABLES;
SELECT * FROM usuarios;
SELECT * FROM contactos LIMIT 10;
```

### Adminer (Recomendado)
```
URL: http://localhost:8080
Servidor: mysql
Usuario: crm_user
Password: crm_pass
Base de datos: crm_delgado
```

---

## 🔧 Solución de Problemas

### Error "Module not found"
```bash
# Detener y volver a levantar (recarga volúmenes)
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up -d
```

### Limpiar y empezar de cero
```bash
# ⚠️ CUIDADO: Elimina TODOS los datos
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d

# Esperar a que inicie y ejecutar seed
docker compose -f docker-compose.dev.yml exec backend npx prisma db seed
```

### Ver errores del backend
```bash
docker compose -f docker-compose.dev.yml logs backend --tail=50
```

### Ver errores del frontend
```bash
docker compose -f docker-compose.dev.yml logs frontend --tail=50
```

---

## 📦 Instalación de paquetes

### Backend (Node.js)
```bash
# Entrar al contenedor
docker compose -f docker-compose.dev.yml exec backend sh

# Instalar paquete
pnpm add nombre-paquete

# Salir
exit

# Reiniciar backend
docker compose -f docker-compose.dev.yml restart backend
```

### Frontend (Next.js)
```bash
# Entrar al contenedor
docker compose -f docker-compose.dev.yml exec frontend sh

# Instalar paquete
pnpm add nombre-paquete

# Salir
exit

# Reiniciar frontend
docker compose -f docker-compose.dev.yml restart frontend
```

---

## 🚀 URLs de Acceso

- **Frontend (Next.js)**: http://localhost:3000
- **Backend (API)**: http://localhost:5000
- **Adminer (BD)**: http://localhost:8080
- **Prisma Studio**: http://localhost:5555 (después de ejecutar `npx prisma studio`)
- **MySQL directo**: localhost:3306

---

## 💡 Tips

1. **Siempre usa WSL/Debian** para ejecutar comandos docker
2. **Hot reload está activado**: Los cambios en código se reflejan automáticamente
3. **Los volúmenes persisten**: Los datos de MySQL no se pierden al reiniciar
4. **Para cambios en Dockerfile**: Necesitas hacer `--build`
5. **Para cambios en volúmenes**: Necesitas `down` y `up`

---

## 🆘 Ayuda Rápida

```bash
# ¿Docker está corriendo?
docker ps

# ¿Qué contenedores del proyecto están activos?
docker compose -f docker-compose.dev.yml ps

# ¿Hay errores?
docker compose -f docker-compose.dev.yml logs --tail=100

# Reiniciar todo
docker compose -f docker-compose.dev.yml restart

# Empezar de cero (mantiene datos BD)
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up -d
```
