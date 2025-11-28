# Crear Usuario de Prueba para Login

Si no puedes pasar del login, probablemente no hay usuarios en la base de datos. Sigue estos pasos:

## Opción 1: Usar el endpoint de seed (Recomendado)

### Paso 1: Habilitar el seed de desarrollo

Crea o edita el archivo `.env` en la carpeta `server/`:

```env
NODE_ENV=development
ALLOW_DEV_SEED=true
```

### Paso 2: Ejecutar el seed

Haz una solicitud POST a:

```
http://localhost:5000/api/dev/seed
```

**Respuesta esperada:**
```json
{
  "exito": true,
  "mensaje": "Seed ejecutado",
  "datos": {
    "admin": { "correo": "admin@crm-delgado.com" },
    "clienteDemo": { "id": "...", "correo": "cliente.demo@example.com", "contrasena": "demo1234" }
  }
}
```

### Paso 3: Usar las credenciales

**Para el CRM (Usuario Admin):**
- Email: `admin@crm-delgado.com`
- Contraseña: `admin123`

**Para el Portal de Clientes:**
- Email: `cliente.demo@example.com`
- Contraseña: `demo1234`

---

## Opción 2: Crear usuario manualmente con Prisma Studio

### Paso 1: Abrir Prisma Studio

En la carpeta `server/`, ejecuta:

```bash
npx prisma studio
```

### Paso 2: Crear usuario

1. Abre la tabla `Usuario`
2. Haz clic en "Add record"
3. Completa los campos:
   - **nombre**: Admin
   - **correo**: admin@crm-delgado.com
   - **contrasena**: (hashear `admin123` con bcrypt)
   - **rol**: ADMIN
   - **activo**: true

**Nota:** Para hashear la contraseña, puedes usar:

```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10).then(h => console.log(h));"
```

---

## Opción 3: Usar la consola del servidor

Si tienes acceso a la consola del servidor, ejecuta:

```bash
curl -X POST http://localhost:5000/api/dev/seed
```

---

## Verificar que el usuario se creó

1. Abre Prisma Studio: `npx prisma studio`
2. Ve a la tabla `Usuario`
3. Deberías ver el usuario `admin@crm-delgado.com`

---

## Troubleshooting

### "Credenciales inválidas" después del login

- Verifica que el usuario existe en la BD
- Verifica que la contraseña es correcta
- Verifica que `activo` es `true`

### "Seed deshabilitado"

- Asegúrate de que `ALLOW_DEV_SEED=true` en el `.env`
- Reinicia el servidor después de cambiar el `.env`

### No puedo acceder a Prisma Studio

- Verifica que MySQL está corriendo
- Verifica que la BD `crm_delgado` existe
- Verifica que las variables de conexión en `.env` son correctas

---

## Próximos pasos

Una vez que puedas hacer login:

1. Accede al dashboard
2. Ve a Pipeline de Oportunidades
3. Prueba los filtros avanzados
4. Crea contactos, oportunidades y cotizaciones

¡Listo! 🎉
