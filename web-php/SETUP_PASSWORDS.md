# 🔧 Script de Configuración de Contraseñas para Portal Web

## Descripción

Este script permite desde el CRM asignar contraseñas a los clientes para que puedan acceder al portal web.

## Uso desde el CRM

### Opción 1: Agregar a la interfaz del CRM

Puedes agregar un botón en la página de edición de contactos/clientes.

### Opción 2: Script de consola

```typescript
// server/src/scripts/asignar-password-cliente.ts

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function asignarPasswordCliente(email: string, password: string) {
  try {
    // Buscar cliente
    const cliente = await prisma.contacto.findFirst({
      where: {
        correo: email,
        tipo: 'CLIENTE'
      }
    })

    if (!cliente) {
      console.error('Cliente no encontrado')
      return
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insertar o actualizar password
    await prisma.$executeRaw`
      INSERT INTO cliente_passwords (contactoId, password_web, created_at, updated_at)
      VALUES (${cliente.id}, ${hashedPassword}, NOW(), NOW())
      ON DUPLICATE KEY UPDATE 
        password_web = ${hashedPassword},
        updated_at = NOW()
    `

    console.log(`✅ Password asignado correctamente para ${email}`)
    console.log(`Cliente puede acceder al portal con:`)
    console.log(`  Email: ${email}`)
    console.log(`  Password: ${password}`)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Uso
const args = process.argv.slice(2)
if (args.length < 2) {
  console.log('Uso: npm run asignar-password <email> <password>')
  process.exit(1)
}

asignarPasswordCliente(args[0], args[1])
```

Para ejecutar:
```bash
cd server
npm run asignar-password cliente@ejemplo.com MiPassword123
```

### Opción 3: API desde el CRM

Agregar esta ruta en el backend:

```typescript
// server/src/routes/clientes.routes.ts

import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { autenticar, esAdmin } from '../middlewares/autenticacion'

const router = Router()

// POST /api/clientes/:id/asignar-password
router.post('/:id/asignar-password', autenticar, esAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { password } = req.body

    if (!password || password.length < 6) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres' 
      })
    }

    // Verificar que sea cliente
    const cliente = await prisma.contacto.findFirst({
      where: {
        id,
        tipo: 'CLIENTE'
      }
    })

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' })
    }

    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insertar o actualizar
    await prisma.$executeRaw`
      INSERT INTO cliente_passwords (contactoId, password_web, created_at, updated_at)
      VALUES (${id}, ${hashedPassword}, NOW(), NOW())
      ON DUPLICATE KEY UPDATE 
        password_web = ${hashedPassword},
        updated_at = NOW()
    `

    res.json({ 
      success: true, 
      message: 'Contraseña asignada correctamente' 
    })

  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Error al asignar contraseña' })
  }
})

export default router
```

Luego en el frontend (componente de cliente):

```tsx
// client/components/clientes/AsignarPasswordModal.tsx

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'

export function AsignarPasswordModal({ clienteId, clienteEmail, onSuccess }) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAsignar = async () => {
    if (password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)
    try {
      await api.post(`/clientes/${clienteId}/asignar-password`, { password })
      alert(`Contraseña asignada correctamente.\n\nEl cliente puede acceder con:\nEmail: ${clienteEmail}\nPassword: ${password}`)
      onSuccess()
    } catch (error) {
      alert('Error al asignar contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Asignar Acceso al Portal Web</h3>
      <div>
        <label>Email del Cliente</label>
        <Input value={clienteEmail} disabled />
      </div>
      <div>
        <label>Nueva Contraseña</label>
        <Input 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
        />
      </div>
      <Button onClick={handleAsignar} disabled={loading}>
        {loading ? 'Asignando...' : 'Asignar Contraseña'}
      </Button>
    </div>
  )
}
```

---

## Notificación por Email (Opcional)

Si quieres enviar la contraseña por email al cliente:

```typescript
import nodemailer from 'nodemailer'

async function enviarCredencialesEmail(email: string, password: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })

  const mailOptions = {
    from: '"CRM Delgado" <noreply@tudominio.com>',
    to: email,
    subject: 'Acceso al Portal del Cliente',
    html: `
      <h2>Bienvenido al Portal del Cliente</h2>
      <p>Se ha creado tu acceso al portal web donde podrás:</p>
      <ul>
        <li>Ver el estado de tus proyectos</li>
        <li>Revisar tus cotizaciones</li>
        <li>Subir documentos</li>
        <li>Contactar con tu asesor</li>
      </ul>
      <h3>Tus credenciales:</h3>
      <p><strong>URL:</strong> https://tudominio.com/cliente-login.php</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Contraseña:</strong> ${password}</p>
      <p><em>Por seguridad, te recomendamos cambiar tu contraseña después del primer acceso.</em></p>
    `
  }

  await transporter.sendMail(mailOptions)
}
```

---

## Testing

Para probar que funciona:

1. Asigna contraseña a un cliente de prueba
2. Ve a `https://tudominio.com/cliente-login.php`
3. Ingresa email y password
4. Deberías ver el dashboard con los datos del cliente

---

## Seguridad

✅ Passwords hasheados con bcrypt  
✅ Mínimo 6 caracteres  
✅ Sesiones seguras con HttpOnly cookies  
✅ HTTPS obligatorio  
✅ Solo admins pueden asignar passwords  
