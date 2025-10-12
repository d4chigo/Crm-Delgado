# 🚀 Comandos Rápidos - Sistema de Cotizaciones

## 🔥 Para Empezar Rápido

### 1. Verificar que todo está funcionando

```bash
# Verificar que el backend está corriendo
docker compose -f docker-compose.dev.yml ps

# Ver logs del backend
docker compose -f docker-compose.dev.yml logs -f backend

# Verificar que la tabla existe
docker compose -f docker-compose.dev.yml exec mysql \
  mysql -u crm_user -pcrm_pass_dev_2025 -D crm_delgado \
  -e "DESCRIBE Cotizacion;"
```

### 2. Reiniciar servicios (si es necesario)

```bash
# Reiniciar solo el backend
docker compose -f docker-compose.dev.yml restart backend

# Reiniciar todo
docker compose -f docker-compose.dev.yml restart

# Rebuild si cambiaste dependencias
docker compose -f docker-compose.dev.yml up -d --build
```

### 3. Abrir la aplicación

```bash
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# MySQL: localhost:3306
```

---

## 🧪 Testing con cURL

### Crear Cotización

```bash
# Obtener token primero (login)
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"admin@crm.com","password":"admin123"}' \
  | jq -r '.token')

# Crear cotización
curl -X POST http://localhost:5000/api/cotizaciones \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contactoId": "TU_LEAD_ID_AQUI",
    "nombreProyecto": "Edificio Vista Mar",
    "tipoInmueble": "Departamento",
    "descripcion": "Dpto 301 - 3 dorm",
    "precioInmueble": 250000,
    "cuotaInicial": 50000,
    "plazoMeses": 240,
    "tipoCuota": "FIJA",
    "tasaInteresAnual": 8.5
  }'
```

### Listar Cotizaciones

```bash
# Todas las cotizaciones
curl -X GET http://localhost:5000/api/cotizaciones \
  -H "Authorization: Bearer $TOKEN"

# Por contacto
curl -X GET "http://localhost:5000/api/cotizaciones/contacto/TU_LEAD_ID_AQUI" \
  -H "Authorization: Bearer $TOKEN"

# Con filtros
curl -X GET "http://localhost:5000/api/cotizaciones?estado=BORRADOR&pagina=1&limite=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Cambiar Estado

```bash
curl -X PATCH "http://localhost:5000/api/cotizaciones/COTIZACION_ID/estado" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"estado": "ENVIADA"}'
```

---

## 📊 Queries SQL Útiles

```bash
# Conectarse a MySQL
docker compose -f docker-compose.dev.yml exec mysql \
  mysql -u crm_user -pcrm_pass_dev_2025 -D crm_delgado
```

### Ver todas las cotizaciones

```sql
SELECT 
  numeroReferencia,
  nombreProyecto,
  precioInmueble,
  cuotaMensualEstimada,
  estado,
  creadoEn
FROM Cotizacion
ORDER BY creadoEn DESC;
```

### Cotizaciones por estado

```sql
SELECT 
  estado,
  COUNT(*) as total,
  AVG(precioInmueble) as precio_promedio,
  AVG(cuotaMensualEstimada) as cuota_promedio
FROM Cotizacion
GROUP BY estado;
```

### Cotizaciones de un lead específico

```sql
SELECT 
  c.numeroReferencia,
  c.nombreProyecto,
  c.precioInmueble,
  c.cuotaMensualEstimada,
  c.estado,
  co.nombre,
  co.apellido,
  co.tipo
FROM Cotizacion c
JOIN Contacto co ON c.contactoId = co.id
WHERE c.contactoId = 'TU_LEAD_ID_AQUI';
```

### Verificar persistencia LEAD → CLIENTE

```sql
-- Antes de convertir (tipo LEAD)
SELECT id, nombre, apellido, tipo FROM Contacto WHERE id = 'TU_ID';
SELECT COUNT(*) as cotizaciones FROM Cotizacion WHERE contactoId = 'TU_ID';

-- Después de convertir (tipo CLIENTE, mismo ID)
SELECT id, nombre, apellido, tipo FROM Contacto WHERE id = 'TU_ID';
SELECT COUNT(*) as cotizaciones FROM Cotizacion WHERE contactoId = 'TU_ID';
```

### Limpiar datos de prueba

```sql
-- ⚠️ CUIDADO: Esto elimina TODAS las cotizaciones
DELETE FROM Cotizacion;

-- Eliminar cotizaciones de un contacto específico
DELETE FROM Cotizacion WHERE contactoId = 'TU_ID';

-- Eliminar solo borradores
DELETE FROM Cotizacion WHERE estado = 'BORRADOR';
```

---

## 🐛 Troubleshooting Rápido

### Error: "Cannot find module 'axios'"

```bash
# Instalar axios
cd client
npm install axios
# o
pnpm install axios
```

### Error: "prisma.cotizacion is not a function"

```bash
# Regenerar Prisma Client
cd server
npx prisma generate

# O desde Docker
docker compose -f docker-compose.dev.yml exec backend npx prisma generate

# Reiniciar backend
docker compose -f docker-compose.dev.yml restart backend
```

### Error: "Table 'Cotizacion' doesn't exist"

```bash
# Aplicar schema a la base de datos
docker compose -f docker-compose.dev.yml exec backend npx prisma db push

# Verificar
docker compose -f docker-compose.dev.yml exec mysql \
  mysql -u crm_user -pcrm_pass_dev_2025 -D crm_delgado \
  -e "SHOW TABLES;"
```

### Frontend no muestra cotizaciones

```javascript
// 1. Abrir DevTools (F12)
// 2. Ir a Console
// 3. Verificar errores

// 4. Ir a Network
// 5. Filtrar por "cotizaciones"
// 6. Ver las peticiones HTTP

// 7. Verificar token en localStorage
localStorage.getItem('token')

// 8. Verificar que el backend responde
fetch('http://localhost:5000/api/cotizaciones', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
}).then(r => r.json()).then(console.log)
```

### Error: "User was denied access on database"

```bash
# Dar permisos al usuario
docker compose -f docker-compose.dev.yml exec mysql bash -c \
  'mysql -u root -p${MYSQL_ROOT_PASSWORD} -e "GRANT ALL PRIVILEGES ON *.* TO \"crm_user\"@\"%\"; FLUSH PRIVILEGES;"'
```

---

## 🎯 Flujo de Prueba Completo

### Paso 1: Crear un Lead

```bash
# Ir a: http://localhost:3000/dashboard/leads
# Click: "Nuevo Contacto"
# Llenar: Nombre, Apellido, Email, Teléfono
# Tipo: LEAD
# Guardar
```

### Paso 2: Abrir Detalle del Lead

```bash
# Click en el ícono de "ojo" del lead creado
# Se abre el modal de detalles
```

### Paso 3: Ir al Tab de Cotizaciones

```bash
# Click en el tab "Cotizaciones"
# Deberías ver una pantalla vacía con "No hay cotizaciones"
```

### Paso 4: Crear Cotización

```bash
# Click: "Nueva Cotización"
# Llenar datos:
#   - Nombre Proyecto: "Edificio Sunset"
#   - Tipo Inmueble: "Departamento"
#   - Precio: 180000
#   - Cuota Inicial: 36000
#   - Plazo: 180 meses
#   - Tipo Cuota: "FIJA"
#   - Tasa: 7.5%
#
# Ver que la cuota mensual se calcula automáticamente
# Click: "Crear Cotización"
```

### Paso 5: Ver Lista de Cotizaciones

```bash
# Deberías ver la cotización creada
# Número: COT-202410-0001
# Estado: BORRADOR (badge gris)
```

### Paso 6: Editar Cotización

```bash
# Click en el ícono de lápiz
# Cambiar el plazo a 240 meses
# Ver cómo se recalcula la cuota
# Click: "Actualizar"
```

### Paso 7: Cambiar Estado

```bash
# Click en el ícono de "enviar" (avión de papel)
# El estado cambia a ENVIADA (badge azul)
# Nota: Ya no se puede editar
```

### Paso 8: Ver Detalle

```bash
# Click en la fila de la cotización
# Se abre modal con toda la información
# Ver: Datos financieros, resumen, fechas
# Cerrar
```

### Paso 9: Convertir LEAD → CLIENTE

```bash
# Cerrar el modal de detalles
# En la lista de leads, click en "Convertir a Cliente"
# Confirmar
# El lead desaparece de la lista de leads
```

### Paso 10: Verificar Persistencia

```bash
# Ir al tab "Clientes" (arriba de la página)
# Buscar el cliente recién convertido
# Click en "ver detalle" (ojo)
# Ir al tab "Cotizaciones"
# ✅ La cotización COT-202410-0001 sigue ahí!
```

---

## 📋 Checklist de Verificación

```
Testing Frontend:
□ El tab "Cotizaciones" aparece en detalle de lead
□ El tab "Cotizaciones" aparece en detalle de cliente
□ Click "Nueva Cotización" abre el formulario
□ Los cálculos se actualizan en tiempo real
□ Se puede crear una cotización
□ La cotización aparece en la lista
□ Se puede editar una cotización en BORRADOR
□ No se puede editar una cotización ENVIADA
□ Se puede cambiar el estado
□ Se puede ver el detalle
□ Se puede eliminar (con confirmación)
□ Las cotizaciones persisten al convertir LEAD → CLIENTE

Testing Backend:
□ POST /api/cotizaciones crea cotización
□ GET /api/cotizaciones lista cotizaciones
□ GET /api/cotizaciones/:id retorna detalle
□ GET /api/cotizaciones/contacto/:id retorna por contacto
□ PUT /api/cotizaciones/:id actualiza (solo BORRADOR)
□ PATCH /api/cotizaciones/:id/estado cambia estado
□ DELETE /api/cotizaciones/:id elimina
□ Número de referencia es único
□ Cálculos son correctos
```

---

## 🔍 Ver Logs en Tiempo Real

### Backend

```bash
# Ver todos los logs
docker compose -f docker-compose.dev.yml logs -f backend

# Filtrar solo cotizaciones
docker compose -f docker-compose.dev.yml logs -f backend | grep -i cotizacion

# Ver últimas 50 líneas
docker compose -f docker-compose.dev.yml logs --tail=50 backend
```

### Frontend

```javascript
// En DevTools Console (F12)

// Ver todas las peticiones a cotizaciones
// Network → Filter: "cotizacion"

// Habilitar logs detallados
localStorage.setItem('debug', '*')

// Ver estado del hook
// React DevTools → Components → CotizacionesContacto
```

---

## 💡 Tips Útiles

### Generar Datos de Prueba Rápidos

```javascript
// En la consola del navegador (después de hacer login)

const crearCotizacionPrueba = async (contactoId) => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/cotizaciones', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contactoId: contactoId,
      nombreProyecto: `Proyecto Test ${Date.now()}`,
      tipoInmueble: 'Departamento',
      precioInmueble: 200000,
      cuotaInicial: 40000,
      plazoMeses: 180,
      tipoCuota: 'FIJA',
      tasaInteresAnual: 8.0
    })
  });
  return response.json();
};

// Uso: crearCotizacionPrueba('ID_DEL_LEAD')
```

### Reset Completo

```bash
# Eliminar todas las cotizaciones
docker compose -f docker-compose.dev.yml exec mysql \
  mysql -u crm_user -pcrm_pass_dev_2025 -D crm_delgado \
  -e "DELETE FROM Cotizacion;"

# Reiniciar contador de referencias (opcional)
# El contador se maneja por mes, así que no es necesario
```

---

## 📞 Contacto y Soporte

Si algo no funciona:

1. **Revisa los logs** del backend y frontend
2. **Verifica la base de datos** con las queries SQL
3. **Prueba los endpoints** con cURL
4. **Revisa la consola** del navegador (F12)
5. **Lee la documentación** en GUIA-USO-COTIZACIONES.md

---

**¡Listo para usar! 🚀**

Estos comandos te ayudarán a verificar que todo funciona correctamente y a resolver cualquier problema rápidamente.
