import { Router } from 'express';
import prisma from '@/config/database';
import bcrypt from 'bcrypt';

const router = Router();

// Ruta de semilla de desarrollo. Protegida por variable de entorno ALLOW_DEV_SEED
// En desarrollo, también se permite sin la variable si NODE_ENV es development
router.post('/seed', async (req, res) => {
  try {
    const isDev = process.env.NODE_ENV === 'development';
    const isAllowed = process.env.ALLOW_DEV_SEED === 'true' || isDev;
    
    if (!isAllowed) {
      return res.status(403).json({ exito: false, mensaje: 'Semilla deshabilitada' });
    }

    // 1) Crear usuario admin si no existe
    const adminEmail = 'admin@crm-delgado.com';
    const adminPass = 'admin123';

    let admin = await prisma.usuario.findUnique({ where: { correo: adminEmail } });
    if (!admin) {
      const hash = await bcrypt.hash(adminPass, 10);
      admin = await prisma.usuario.create({
        data: { nombre: 'Admin', correo: adminEmail, contrasena: hash, rol: 'ADMIN', activo: true }
      });
    }

    // 2) Crear contacto cliente demo si no existe
    const clienteEmail = 'cliente.demo@example.com';
    let contacto = await prisma.contacto.findFirst({ where: { correo: clienteEmail } });

    if (!contacto) {
      // Asignar a cualquier usuario activo (admin)
      const usuarioAsignado = await prisma.usuario.findFirst({ where: { activo: true }, orderBy: { creadoEn: 'asc' } });
      contacto = await prisma.contacto.create({
        data: {
          nombre: 'Cliente',
          apellido: 'Demo',
          correo: clienteEmail,
          telefono: '+56911112222',
          tipo: 'CLIENTE',
          usuarioId: usuarioAsignado ? usuarioAsignado.id : admin!.id,
        }
      });
    }

    // 3) Crear acceso web con password conocida demo1234
    const acceso = await prisma.clientePassword.upsert({
      where: { contactoId: contacto.id },
      update: {},
      create: {
        contactoId: contacto.id,
        passwordWeb: await bcrypt.hash('demo1234', 10)
      }
    });

    return res.json({
      exito: true,
      mensaje: 'Seed ejecutado',
      datos: {
        admin: { correo: admin.correo },
        clienteDemo: { id: contacto.id, correo: contacto.correo, contrasena: 'demo1234' }
      }
    });
  } catch (error: any) {
    console.error('Error en seed:', error);
    return res.status(500).json({ exito: false, mensaje: 'Error en seed', error: error?.message || 'Error' });
  }
});

export default router;
