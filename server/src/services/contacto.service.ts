import prisma from '@/config/database';
import { CrearContactoDTO, ActualizarContactoDTO, FiltrosContacto, Contacto } from '@/types';
import { TipoContacto, EstadoLead } from '@prisma/client';
import googleAuthService from './google-auth.service';

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
      limite = 6
    } = filtros;

    const skip = (pagina - 1) * limite;

    // Construir condiciones de búsqueda
    const where: any = { usuarioId };

    if (tipo) {
      where.tipo = tipo;
      console.log(`🔍 Filtrando contactos por tipo: ${tipo}`);
    }

    if (ciudad) {
      where.ciudad = { contains: ciudad };
    }

    if (busqueda) {
      where.OR = [
        { nombre: { contains: busqueda } },
        { apellido: { contains: busqueda } },
        { correo: { contains: busqueda } }
      ];
    }

    // Obtener contactos y total
    const [contactos, total] = await Promise.all([
      prisma.contacto.findMany({
        where,
        skip,
        take: limite,
        orderBy: { creadoEn: 'desc' },
        include: {
          etiquetas: {
            include: {
              etiqueta: true
            }
          }
        }
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
      where: { id, usuarioId },
      include: {
        etiquetas: {
          include: {
            etiqueta: true
          }
        }
      }
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

    // Verificar si el correo ya existe (solo si se proporciona)
    if (datos.correo) {
      const contactoExistente = await prisma.contacto.findFirst({
        where: { correo: datos.correo }
      });

      if (contactoExistente) {
        throw new Error('Ya existe un contacto con este correo electrónico');
      }
    }

    // Verificar DNI si se proporciona
    if (datos.dni) {
      const dniExistente = await prisma.contacto.findFirst({
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

    // Verificar correo único (solo si se proporciona y es diferente)
    if (datos.correo && datos.correo !== contactoExistente.correo) {
      const correoExistente = await prisma.contacto.findFirst({
        where: { correo: datos.correo }
      });

      if (correoExistente) {
        throw new Error('Ya existe un contacto con este correo electrónico');
      }
    }

    // Verificar DNI único (solo si se proporciona y es diferente)
    if (datos.dni && datos.dni !== contactoExistente.dni) {
      const dniExistente = await prisma.contacto.findFirst({
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

    console.log(`🔄 Intentando convertir contacto ${id} - Tipo actual: ${contacto.tipo}`);

    if (contacto.tipo === TipoContacto.LEAD) {
      console.log(`⚠️ Contacto ${id} ya es un LEAD, retornando sin cambios`);
      return this.agregarEdad(contacto);
    }

    if (contacto.tipo === TipoContacto.CLIENTE) {
      console.log(`❌ Error: Contacto ${id} ya es un CLIENTE`);
      throw new Error('Este contacto ya es un cliente y no puede convertirse a lead');
    }

    const contactoActualizado = await prisma.contacto.update({
      where: { id },
      data: { 
        tipo: TipoContacto.LEAD,
        estadoLead: contacto.estadoLead || EstadoLead.NUEVO
      }
    });

    console.log(`✅ Contacto ${id} convertido de ${contacto.tipo} a ${contactoActualizado.tipo}`);

    return this.agregarEdad(contactoActualizado);
  }

  /**
   * Convertir múltiples contactos a leads
   */
  async convertirVariosALeads(ids: string[], usuarioId: string) {
    console.log(`🔄 Intentando convertir ${ids.length} contactos a leads...`);
    
    // Verificar que todos los contactos existen y pertenecen al usuario
    const contactos = await prisma.contacto.findMany({
      where: {
        id: { in: ids },
        usuarioId,
        tipo: TipoContacto.CONTACTO // Solo contactos que no sean ya leads o clientes
      }
    });

    console.log(`✅ Encontrados ${contactos.length} contactos válidos para convertir`);

    if (contactos.length === 0) {
      throw new Error('No se encontraron contactos válidos para convertir. Verifica que los contactos seleccionados no sean ya leads o clientes.');
    }

    // Convertir todos a leads
    const resultado = await prisma.contacto.updateMany({
      where: {
        id: { in: contactos.map(c => c.id) }
      },
      data: {
        tipo: TipoContacto.LEAD,
        estadoLead: EstadoLead.NUEVO
      }
    });

    console.log(`✅ ${resultado.count} contactos convertidos a leads exitosamente`);

    return {
      convertidos: resultado.count,
      total: ids.length,
      noConvertidos: ids.length - resultado.count
    };
  }

  /**
   * Convertir un lead a cliente
   */
  async convertirLeadACliente(id: string, usuarioId: string) {
    // Verificar que el lead existe y pertenece al usuario
    const contacto = await prisma.contacto.findFirst({
      where: {
        id,
        usuarioId,
        tipo: TipoContacto.LEAD
      }
    });

    if (!contacto) {
      throw new Error('Lead no encontrado o no es un lead válido');
    }

    // Convertir a cliente y guardar fecha de conversión
    const contactoActualizado = await prisma.contacto.update({
      where: { id },
      data: {
        tipo: TipoContacto.CLIENTE,
        fechaConversion: new Date()
      }
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

  /**
   * Asociar un cliente a un lead
   * NOTA: Requiere tabla leadCliente en el schema de Prisma
   */
  async asociarCliente(
    leadId: string,
    clienteId: string,
    usuarioId: string,
    datos?: { notas?: string; estado?: string }
  ) {
    // Verificar que el lead existe y es un lead
    const lead = await prisma.contacto.findFirst({
      where: { 
        id: leadId, 
        usuarioId,
        tipo: TipoContacto.LEAD 
      }
    });

    if (!lead) {
      throw new Error('Lead no encontrado o no es un lead válido');
    }

    // Verificar que el cliente existe y es un cliente
    const cliente = await prisma.contacto.findFirst({
      where: { 
        id: clienteId, 
        usuarioId,
        tipo: TipoContacto.CLIENTE 
      }
    });

    if (!cliente) {
      throw new Error('Cliente no encontrado o no es un cliente válido');
    }

    // TODO: Descomentar cuando exista la tabla leadCliente en Prisma
    /*
    // Verificar que no estén ya asociados
    const asociacionExistente = await prisma.leadCliente.findUnique({
      where: {
        leadId_clienteId: {
          leadId,
          clienteId
        }
      }
    });

    if (asociacionExistente) {
      throw new Error('El cliente ya está asociado a este lead');
    }

    // Crear la asociación
    const asociacion = await prisma.leadCliente.create({
      data: {
        leadId,
        clienteId,
        notas: datos?.notas,
        estado: datos?.estado || 'En proceso'
      },
      include: {
        cliente: {
          include: {
            etiquetas: {
              include: {
                etiqueta: true
              }
            }
          }
        }
      }
    });

    return {
      ...asociacion,
      cliente: this.agregarEdad(asociacion.cliente)
    };
    */
    
    throw new Error('Funcionalidad no disponible: tabla leadCliente no configurada en Prisma');
  }

  /**
   * Desasociar un cliente de un lead
   * NOTA: Requiere tabla leadCliente en el schema de Prisma
   */
  async desasociarCliente(leadId: string, clienteId: string, usuarioId: string) {
    // Verificar que el lead pertenece al usuario
    const lead = await prisma.contacto.findFirst({
      where: { id: leadId, usuarioId }
    });

    if (!lead) {
      throw new Error('Lead no encontrado');
    }

    // TODO: Descomentar cuando exista la tabla leadCliente en Prisma
    /*
    // Eliminar la asociación
    await prisma.leadCliente.delete({
      where: {
        leadId_clienteId: {
          leadId,
          clienteId
        }
      }
    });

    return { success: true };
    */
    
    throw new Error('Funcionalidad no disponible: tabla leadCliente no configurada en Prisma');
  }

  /**
   * Actualizar notas o estado de la asociación lead-cliente
   */
  // TODO: Descomentar cuando exista la tabla leadCliente en Prisma
  /*
  async actualizarAsociacion(
    leadId: string,
    clienteId: string,
    usuarioId: string,
    datos: { notas?: string; estado?: string }
  ) {
    // Verificar que el lead pertenece al usuario
    const lead = await prisma.contacto.findFirst({
      where: { id: leadId, usuarioId }
    });

    if (!lead) {
      throw new Error('Lead no encontrado');
    }

    // Actualizar la asociación
    const asociacion = await prisma.leadCliente.update({
      where: {
        leadId_clienteId: {
          leadId,
          clienteId
        }
      },
      data: {
        notas: datos.notas,
        estado: datos.estado
      },
      include: {
        cliente: {
          include: {
            etiquetas: {
              include: {
                etiqueta: true
              }
            }
          }
        }
      }
    });

    return {
      ...asociacion,
      cliente: this.agregarEdad(asociacion.cliente)
    };
  }
  */
  async actualizarAsociacion(
    leadId: string,
    clienteId: string,
    usuarioId: string,
    datos: { notas?: string; estado?: string }
  ) {
    throw new Error('Funcionalidad no disponible: tabla leadCliente no configurada en Prisma');
  }

  /**
   * Obtener clientes asociados a un lead
   */
  // TODO: Descomentar cuando exista la tabla leadCliente en Prisma
  /*
  async obtenerClientesDeLeads(leadId: string, usuarioId: string) {
    // Verificar que el lead pertenece al usuario
    const lead = await prisma.contacto.findFirst({
      where: { id: leadId, usuarioId }
    });

    if (!lead) {
      throw new Error('Lead no encontrado');
    }

    // Obtener asociaciones con clientes
    const asociaciones = await prisma.leadCliente.findMany({
      where: { leadId },
      include: {
        cliente: {
          include: {
            etiquetas: {
              include: {
                etiqueta: true
              }
            }
          }
        }
      },
      orderBy: { asociadoEn: 'desc' }
    });

    // Agregar edad a cada cliente
    return asociaciones.map(asoc => ({
      ...asoc,
      cliente: this.agregarEdad(asoc.cliente)
    }));
  }
  */
  async obtenerClientesDeLeads(leadId: string, usuarioId: string) {
    throw new Error('Funcionalidad no disponible: tabla leadCliente no configurada en Prisma');
  }

  /**
   * Importar contactos desde Google
   */
  async importarDesdeGoogle(usuarioId: string, accessToken: string): Promise<{
    importados: number;
    duplicados: number;
    errores: number;
  }> {
    let importados = 0;
    let duplicados = 0;
    let errores = 0;

    try {
      // Obtener contactos de Google usando el access token
      const contactosGoogle = await googleAuthService.getContacts(accessToken);
      
      console.log(`📊 Total de contactos recibidos de Google: ${contactosGoogle.length}`);

      for (const person of contactosGoogle) {
        try {
          const nombre = person.names?.[0]?.givenName || '';
          const apellido = person.names?.[0]?.familyName || '';
          const correo = person.emailAddresses?.[0]?.value;
          const telefono = person.phoneNumbers?.[0]?.value;
          
          // Saltar si no tiene nombre ni apellido
          if (!nombre && !apellido) {
            console.log('⚠️ Contacto sin nombre ni apellido, saltando...');
            errores++;
            continue;
          }

          // Si no tiene correo, usar un correo temporal basado en el nombre
          let correoFinal = correo;
          if (!correo) {
            // Primero verificar si ya existe un contacto con el mismo nombre y apellido
            const contactoPorNombre = await prisma.contacto.findFirst({
              where: {
                nombre: nombre.trim(),
                apellido: apellido.trim(),
                usuarioId
              }
            });

            if (contactoPorNombre) {
              console.log(`🔄 Contacto duplicado (por nombre): ${nombre} ${apellido}`);
              duplicados++;
              continue;
            }

            // Generar un identificador único basado en nombre y timestamp
            const identificador = `${nombre}${apellido}`.toLowerCase().replace(/\s+/g, '');
            correoFinal = `${identificador}_${Date.now()}@importado.local`;
            console.log(`📧 Contacto sin correo, usando temporal: ${correoFinal}`);
          }

          // Verificar si ya existe un contacto con ese correo (independiente del tipo)
          const contactoExistente = await prisma.contacto.findFirst({
            where: {
              correo: correoFinal!.toLowerCase().trim(),
              usuarioId
            }
          });

          if (contactoExistente) {
            console.log(`🔄 Contacto duplicado: ${nombre} ${apellido} (${correoFinal}) - Tipo: ${contactoExistente.tipo}`);
            duplicados++;
            continue;
          }

          // Crear el nuevo contacto
          await this.crearContacto({
            nombre: nombre.trim() || 'Sin nombre',
            apellido: apellido.trim() || '',
            correo: correoFinal!.toLowerCase().trim(),
            telefono: telefono?.trim()
          }, usuarioId);

          console.log(`✅ Importado: ${nombre} ${apellido}`);
          importados++;
        } catch (error: any) {
          console.error('❌ Error al importar contacto individual:', {
            nombre: person.names?.[0]?.givenName,
            apellido: person.names?.[0]?.familyName,
            error: error.message
          });
          errores++;
        }
      }

      console.log(`\n📈 Resultado de importación:`);
      console.log(`   ✅ Importados: ${importados}`);
      console.log(`   🔄 Duplicados: ${duplicados}`);
      console.log(`   ❌ Errores: ${errores}`);

      return { importados, duplicados, errores };
    } catch (error: any) {
      console.error('Error al importar contactos desde Google:', error);
      throw new Error(`No se pudieron importar los contactos: ${error.message}`);
    }
  }
}

export default new ContactoService();
