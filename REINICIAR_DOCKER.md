# Reiniciar Docker para Aplicar Cambios

## Problema Resuelto

Se han corregido dos problemas importantes:

1. **Loop infinito de consultas API** - El frontend estaba haciendo llamadas repetitivas a `/api/oportunidades/estadisticas` y `/api/oportunidades` debido a un useEffect mal configurado en `pipeline/page.tsx`

2. **Hot-reload no funciona en Docker** - La configuración de Next.js tenía `output: 'standalone'` habilitado en desarrollo, lo que impedía el hot-reload.

## Cambios Realizados

### Frontend (`client/`)
- ✅ `app/dashboard/pipeline/page.tsx` - Removido `refrescar` de las dependencias del useEffect para evitar loop infinito
- ✅ `app/dashboard/leads/page.tsx` - Removidas cantidades entre paréntesis de las pestañas Leads/Clientes
- ✅ `next.config.mjs` - Configurado `output: 'standalone'` solo para producción
- ✅ `next.config.mjs` - Mejorado polling para hot-reload en Docker/Windows

## Cómo Aplicar los Cambios

### Opción 1: Reinicio Completo (Recomendado)

```powershell
# Detener todos los contenedores
docker-compose -f docker-compose.dev.yml down

# Reconstruir solo el frontend (más rápido)
docker-compose -f docker-compose.dev.yml build frontend

# Iniciar de nuevo
docker-compose -f docker-compose.dev.yml up -d

# Ver los logs del frontend
docker-compose -f docker-compose.dev.yml logs -f frontend
```

### Opción 2: Solo Reiniciar Frontend

```powershell
# Reiniciar solo el contenedor del frontend
docker-compose -f docker-compose.dev.yml restart frontend

# Ver los logs
docker-compose -f docker-compose.dev.yml logs -f frontend
```

### Opción 3: Rebuild Completo (Si persisten problemas)

```powershell
# Detener y eliminar todo (incluye volúmenes)
docker-compose -f docker-compose.dev.yml down -v

# Reconstruir desde cero sin usar cache
docker-compose -f docker-compose.dev.yml build --no-cache

# Iniciar
docker-compose -f docker-compose.dev.yml up -d
```

## Verificar que Funciona

### 1. Hot-Reload
Después de reiniciar, intenta hacer un pequeño cambio en cualquier archivo del frontend (por ejemplo, cambiar un texto) y verifica que se recarga automáticamente en el navegador.

### 2. Sin Loop Infinito
Abre las Chrome DevTools → Network y verifica que las llamadas a `/api/oportunidades/estadisticas` solo se hagan:
- Al cargar la página
- Al hacer clic en "Actualizar"
- Al mover una oportunidad de etapa

**NO** deberían hacerse cada segundo automáticamente.

## Consejos Adicionales

### Limpiar Cache de Next.js (Si persisten problemas)

```powershell
# Entrar al contenedor
docker exec -it crm-frontend-dev sh

# Dentro del contenedor, eliminar .next
rm -rf .next

# Salir
exit

# Reiniciar contenedor
docker-compose -f docker-compose.dev.yml restart frontend
```

### Verificar Estado de Contenedores

```powershell
# Ver contenedores activos
docker-compose -f docker-compose.dev.yml ps

# Ver logs en tiempo real
docker-compose -f docker-compose.dev.yml logs -f

# Ver logs solo del frontend
docker-compose -f docker-compose.dev.yml logs -f frontend

# Ver logs solo del backend
docker-compose -f docker-compose.dev.yml logs -f backend
```

## Notas Importantes

- ⚠️ **Siempre usa `docker-compose.dev.yml`** para desarrollo
- ⚠️ **No uses `docker-compose.yml`** (es para producción)
- 💡 El hot-reload puede tardar ~2-3 segundos en reflejar cambios
- 💡 Si los cambios no se reflejan, verifica que los volúmenes estén correctamente montados en `docker-compose.dev.yml`
