import prisma from '@/config/database';
import { CrearContactoDTO, ActualizarContactoDTO, FiltrosContacto, Contacto } from '@/types';
import { TipoContacto } from '@prisma/client';

export class ContactoService {
  /**
   * Calcular edad a partir de fecha de nacimiento
   */
  private calcularEdad(fechaNacimiento: Date): number {
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  }

  /**
   * Agregar campo edad calculado al contacto
   */
  private agregarEdad(contacto: any): any {
    if (contacto.fechaNacimiento) {
      return {
        ...contacto,
        edad: this.calcularEdad(new Date(contacto.fechaNacimiento))
      };
    }
    return contacto;
  }

  /**
   * Obtener todos los contactos con filtros
   */
  async obtenerContactos(usuarioId: string, filtros: FiltrosContacto = {}) {
    const {
      tipo,
      ciudad,
      busqueda,
      pagina = 1,
      limite = 10
    } = filtros;

    const skip = (pagina - 1) * limite;

    // Construir condiciones de búsqueda
    const where: any = { usuarioId };

    if (tipo) {
      where.tipo = tipo;
    }

    if (ciudad) {
      where.ciudad = { contains: ciudad, mode: 'insensitive' };
    }

    if (busqueda) {
      where.OR = [
        { nombre: { contains: busqueda, mode: 'insensitive' } },
        { apellido: { contains: busqueda, mode: 'insensitive' } },
        { correo: { contains: busqueda, mode: 'insensitive' } }
      ];
    }

    // Obtener contactos y total
    const [contactos, total] = await Promise.all([
      prisma.contacto.findMany({
        where,
        skip,
        take: limite,
        orderBy: { creadoEn: 'desc' }
      }),
      prisma.contacto.count({ where })
    ]);

    // Agregar edad a cada contacto
    const contactosConEdad = contactos.map(c => this.agregarEdad(c));

    return {
      contactos: contactosConEdad,
      paginacion: {
        pagina,
        limite,
        total,
        totalPaginas: Math.ceil(total / limite)
      }
    };
  }

  /**
   * Obtener un contacto por ID
   */
  async obtenerContactoPorId(id: string, usuarioId: string) {
    const contacto = await prisma.contacto.findFirst({
      where: { id, usuarioId }
    });

    if (!contacto) {
      throw new Error('Contacto no encontrado');
    }

    return this.agregarEdad(contacto);
  }

  /**
   * Crear un nuevo contacto
   */
  async crearContacto(datos: CrearContactoDTO, usuarioId: string) {
    const { fechaNacimiento, ...restoDatos } = datos;

    // Verificar si el correo ya existe
    const contactoExistente = await prisma.contacto.findUnique({
      where: { correo: datos.correo }
    });

    if (contactoExistente) {
      throw new Error('Ya existe un contacto con este correo electrónico');
    }

    // Verificar DNI si se proporciona
    if (datos.dni) {
      const dniExistente = await prisma.contacto.findUnique({
        where: { dni: datos.dni }
      });

      if (dniExistente) {
        throw new Error('Ya existe un contacto con este DNI');
      }
    }

    const contacto = await prisma.contacto.create({
      data: {
        ...restoDatos,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : undefined,
        usuarioId
      }
    });

    return this.agregarEdad(contacto);
  }

  /**
   * Actualizar un contacto
   */
  async actualizarContacto(id: string, datos: ActualizarContactoDTO, usuarioId: string) {
    // Verificar que el contacto existe y pertenece al usuario
    const contactoExistente = await prisma.contacto.findFirst({
      where: { id, usuarioId }
    });

    if (!contactoExistente) {
      throw new Error('Contacto no encontrado');
    }

    // Verificar correo único
    if (datos.correo && datos.correo !== contactoExistente.correo) {
      const correoExistente = await prisma.contacto.findUnique({
        where: { correo: datos.correo }
      });

      if (correoExistente) {
        throw new Error('Ya existe un contacto con este correo electrónico');
      }
    }

    // Verificar DNI único
    if (datos.dni && datos.dni !== contactoExistente.dni) {
      const dniExistente = await prisma.contacto.findUnique({
        where: { dni: datos.dni }
      });

      if (dniExistente) {
        throw new Error('Ya existe un contacto con este DNI');
      }
    }

    const { fechaNacimiento, ...restoDatos } = datos;

    const contactoActualizado = await prisma.contacto.update({
      where: { id },
      data: {
        ...restoDatos,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : undefined
      }
    });

    return this.agregarEdad(contactoActualizado);
  }

  /**
   * Eliminar un contacto
   */
  async eliminarContacto(id: string, usuarioId: string) {
    // Verificar que el contacto existe y pertenece al usuario
    const contacto = await prisma.contacto.findFirst({
      where: { id, usuarioId }
    });

    if (!contacto) {
      throw new Error('Contacto no encontrado');
    }

    await prisma.contacto.delete({
      where: { id }
    });

    return { mensaje: 'Contacto eliminado exitosamente' };
  }

  /**
   * Convertir contacto a lead
   */
  async convertirALead(id: string, usuarioId: string) {
    const contacto = await prisma.contacto.findFirst({
      where: { id, usuarioId }
    });

    if (!contacto) {
      throw new Error('Contacto no encontrado');
    }

    if (contacto.tipo === TipoContacto.LEAD || contacto.tipo === TipoContacto.CLIENTE) {
      throw new Error('Este contacto ya es un lead o cliente');
    }

    const contactoActualizado = await prisma.contacto.update({
      where: { id },
      data: { tipo: TipoContacto.LEAD }
    });

    return this.agregarEdad(contactoActualizado);
  }

  /**
   * Obtener estadísticas de contactos
   */
  async obtenerEstadisticas(usuarioId: string) {
    const [totalContactos, totalLeads, totalClientes] = await Promise.all([
      prisma.contacto.count({
        where: { usuarioId, tipo: TipoContacto.CONTACTO }
      }),
      prisma.contacto.count({
        where: { usuarioId, tipo: TipoContacto.LEAD }
      }),
      prisma.contacto.count({
        where: { usuarioId, tipo: TipoContacto.CLIENTE }
      })
    ]);

    return {
      totalContactos,
      totalLeads,
      totalClientes,
      total: totalContactos + totalLeads + totalClientes
    };
  }
}

export default new ContactoService();
