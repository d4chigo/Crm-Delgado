import prisma from '@/config/database';
import { CrearContactoDTO, ActualizarContactoDTO, FiltrosContacto, Contacto } from '@/types';
import { EstadoLead } from '@prisma/client';
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
      estado,
      pagina = 1,
      limite = 6
    } = filtros;

    const skip = (pagina - 1) * limite;

    // Construir condiciones de búsqueda base
    const whereBase: any = { usuarioId };

    if (estado) {
      whereBase.estado = estado;
      console.log(`🔍 Filtrando contactos por estado: ${estado}`);
    }

    if (ciudad) {
      whereBase.ciudad = { contains: ciudad };
    }

    if (busqueda) {
      // Convertir búsqueda a minúsculas para búsqueda case-insensitive
      const busquedaLower = busqueda.trim().toLowerCase();
      
      // Si contiene espacios, buscar por cualquiera de las palabras
      const palabras = busquedaLower.split(/\s+/).filter(p => p.length > 0);
      
      if (palabras.length > 0) {
        if (palabras.length === 1) {
          // Para una sola palabra, buscar en cualquier campo
          whereBase.OR = [
            { nombre: { contains: palabras[0] } },
            { apellido: { contains: palabras[0] } },
            { correo: { contains: palabras[0] } },
            { dni: { contains: palabras[0] } }
          ];
        } else {
          // Para múltiples palabras, buscar un contacto que contenga TODAS las palabras
          whereBase.AND = palabras.map(palabra => ({
            OR: [
              { nombre: { contains: palabra } },
              { apellido: { contains: palabra } },
              { correo: { contains: palabra } },
              { dni: { contains: palabra } }
            ]
          }));
        }
        
        console.log(`🔍 Buscando por palabras: ${palabras.join(', ')}`);
      }
    }

    // Obtener leads o clientes según el tipo solicitado
    let contactos: any[] = [];
    let total = 0;
    let leadsTotal = 0;
    let clientesTotal = 0;

    if (!tipo || tipo === 'LEAD') {
      const [leads, leadCount] = await Promise.all([
        prisma.lead.findMany({
          where: whereBase,
          skip,
          take: limite,
          orderBy: { creadoEn: 'desc' },
          include: {
            etiquetasRel: {
              include: {
                etiqueta: true
              }
            }
          }
        }),
        prisma.lead.count({ where: whereBase })
      ]);
      
      leadsTotal = leadCount;
      contactos = leads.map((lead: any) => ({
        ...lead,
        tipo: 'LEAD',
        etiquetas: lead.etiquetasRel
      }));
      total = leadsTotal;
      if (tipo) console.log(`🔍 Filtrando contactos por tipo: ${tipo}`);
    }

    // Solo si no hay tipo específico, agregar clientes también
    if (!tipo) {
      // Para búsqueda combinada, obtener más registros y paginarhac manualmente
      const clientesAdicionales = limite - contactos.length;
      
      if (clientesAdicionales > 0) {
        const [clientes, clientCount] = await Promise.all([
          prisma.cliente.findMany({
            where: whereBase,
            skip: 0,
            take: clientesAdicionales,
            orderBy: { creadoEn: 'desc' },
            include: {
              etiquetasRel: {
                include: {
                  etiqueta: true
                }
              }
            }
          }),
          prisma.cliente.count({ where: whereBase })
        ]);
        
        clientesTotal = clientCount;
        const clientesTransformados = clientes.map((cliente: any) => ({
          ...cliente,
          tipo: 'CLIENTE',
          etiquetas: cliente.etiquetasRel
        }));
        
        contactos = [...contactos, ...clientesTransformados];
        total = leadsTotal + clientesTotal;
      }
    } else if (tipo === 'CLIENTE') {
      // Solo clientes
      const [clientes, clientCount] = await Promise.all([
        prisma.cliente.findMany({
          where: whereBase,
          skip,
          take: limite,
          orderBy: { creadoEn: 'desc' },
          include: {
            etiquetasRel: {
              include: {
                etiqueta: true
              }
            }
          }
        }),
        prisma.cliente.count({ where: whereBase })
      ]);
      
      clientesTotal = clientCount;
      const clientesTransformados = clientes.map((cliente: any) => ({
        ...cliente,
        tipo: 'CLIENTE',
        etiquetas: cliente.etiquetasRel
      }));
      
      contactos = clientesTransformados;
      total = clientesTotal;
      console.log(`🔍 Filtrando contactos por tipo: ${tipo}`);
    }

    // Aplicar paginación a búsqueda combinada si es necesario
    if (!tipo && contactos.length > limite) {
      contactos = contactos.slice(0, limite);
    }


    // Agregar edad a cada contacto
    const contactosConEdad = contactos.map((c: any) => this.agregarEdad(c));

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
    // Buscar en leads primero, luego en clientes
    let contacto = await prisma.lead.findFirst({
      where: { id, usuarioId },
      include: {
        etiquetasRel: {
          include: {
            etiqueta: true
          }
        }
      }
    });

    if (!contacto) {
      contacto = await prisma.cliente.findFirst({
        where: { id, usuarioId },
        include: {
          etiquetasRel: {
            include: {
              etiqueta: true
            }
          }
        }
      });
    }

    if (!contacto) {
      throw new Error('Contacto no encontrado');
    }

    // Transformar para compatibilidad
    const contactoTransformado = {
      ...contacto,
      etiquetas: (contacto as any).etiquetasRel
    };

    return this.agregarEdad(contactoTransformado);
  }

  /**
   * Crear un nuevo contacto (como LEAD por defecto)
   */
  async crearContacto(datos: CrearContactoDTO, usuarioId: string) {
    const { fechaNacimiento, ...restoDatos } = datos;

    // Verificar si el correo ya existe (en leads o clientes)
    if (datos.correo) {
      const leadExistente = await prisma.lead.findFirst({
        where: { correo: datos.correo }
      });
      
      const clienteExistente = await prisma.cliente.findFirst({
        where: { correo: datos.correo }
      });

      if (leadExistente || clienteExistente) {
        throw new Error('Ya existe un contacto con este correo electrónico');
      }
    }

    // Verificar DNI si se proporciona
    if (datos.dni) {
      const leadDni = await prisma.lead.findFirst({
        where: { dni: datos.dni }
      });
      
      const clienteDni = await prisma.cliente.findFirst({
        where: { dni: datos.dni }
      });

      if (leadDni || clienteDni) {
        throw new Error('Ya existe un contacto con este DNI');
      }
    }

    // Crear como LEAD por defecto
    const lead = await prisma.lead.create({
      data: {
        ...restoDatos,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : undefined,
        usuarioId
      }
    });

    return { ...this.agregarEdad(lead), tipo: 'LEAD' };
  }

  /**
   * Actualizar un contacto
   */
  async actualizarContacto(id: string, datos: ActualizarContactoDTO, usuarioId: string) {
    // Verificar que el contacto existe (puede ser lead o cliente) y pertenece al usuario
    const lead = await prisma.lead.findFirst({
      where: { id, usuarioId }
    });

    const cliente = !lead ? await prisma.cliente.findFirst({
      where: { id, usuarioId }
    }) : null;

    const contactoExistente = lead || cliente;

    if (!contactoExistente) {
      throw new Error('Contacto no encontrado');
    }

    // Verificar correo único (solo si se proporciona y es diferente)
    if (datos.correo && datos.correo !== contactoExistente.correo) {
      const correoEnLead = await prisma.lead.findFirst({
        where: { correo: datos.correo }
      });

      const correoEnCliente = await prisma.cliente.findFirst({
        where: { correo: datos.correo }
      });

      if (correoEnLead || correoEnCliente) {
        throw new Error('Ya existe un contacto con este correo electrónico');
      }
    }

    // Verificar DNI único (solo si se proporciona y es diferente)
    if (datos.dni && datos.dni !== contactoExistente.dni) {
      const dniEnLead = await prisma.lead.findFirst({
        where: { dni: datos.dni }
      });

      const dniEnCliente = await prisma.cliente.findFirst({
        where: { dni: datos.dni }
      });

      if (dniEnLead || dniEnCliente) {
        throw new Error('Ya existe un contacto con este DNI');
      }
    }

    const { fechaNacimiento, ...restoDatos } = datos;

    // Actualizar en la tabla correspondiente
    let contactoActualizado;
    if (lead) {
      contactoActualizado = await prisma.lead.update({
        where: { id },
        data: {
          ...restoDatos,
          fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : undefined
        }
      });
    } else {
      contactoActualizado = await prisma.cliente.update({
        where: { id },
        data: {
          ...restoDatos,
          fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : undefined
        }
      });
    }

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

    console.log(`🗑️ Eliminando contacto: ${id}`);

    try {
      // El cascade delete debería manejar las relaciones
      // Pero primero eliminamos manualmente lo que sea necesario
      
      // Eliminar oportunidades asociadas
      await prisma.oportunidadCliente.deleteMany({
        where: { clienteId: id }
      });
      console.log(`✅ Oportunidades eliminadas`);

      // Eliminar proyectos asociados
      await prisma.proyectoCliente.deleteMany({
        where: { clienteId: id }
      });
      console.log(`✅ Asociaciones de proyectos eliminadas`);

      // Eliminar el contacto
      await prisma.contacto.delete({
        where: { id }
      });
      console.log(`✅ Contacto eliminado exitosamente`);

      return { mensaje: 'Contacto eliminado exitosamente' };
    } catch (error: any) {
      console.error(`❌ Error al eliminar contacto: ${error.message}`);
      throw new Error(`No se pudo eliminar el contacto: ${error.message}`);
    }
  }

  /**
   * Convertir un lead a cliente
   * Nota: Ya no existe conversión de CONTACTO a LEAD, todos son LEAD desde el inicio
   */
  async convertirALead(id: string, usuarioId: string) {
    const contacto = await prisma.contacto.findFirst({
      where: { id, usuarioId }
    });

    if (!contacto) {
      throw new Error('Contacto no encontrado');
    }

    console.log(`🔄 Verificando contacto ${id} - Tipo actual: ${contacto.tipo}`);

    if (contacto.tipo === 'LEAD') {
      console.log(`✅ Contacto ${id} ya es un LEAD`);
      return this.agregarEdad(contacto);
    }

    if (contacto.tipo === 'CLIENTE') {
      console.log(`❌ Error: Contacto ${id} ya es un CLIENTE`);
      throw new Error('Este contacto ya es un cliente y no puede convertirse a lead');
    }

    throw new Error('Tipo de contacto inválido');
  }

  /**
   * Convertir varios contactos a leads (bulk operation)
   */
  async convertirVariosALeads(ids: string[], usuarioId: string) {
    let convertidos = 0;
    let errores = 0;
    const resultados: Array<{ id: string; exito: boolean; error?: string }> = [];

    for (const id of ids) {
      try {
        await this.convertirALead(id, usuarioId);
        convertidos++;
        resultados.push({ id, exito: true });
      } catch (error: any) {
        errores++;
        resultados.push({ id, exito: false, error: error.message });
      }
    }

    return { convertidos, errores, resultados };
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
        tipo: 'LEAD'
      }
    });

    if (!contacto) {
      throw new Error('Lead no encontrado o no es un lead válido');
    }

    // Convertir a cliente y guardar fecha de conversión
    const contactoActualizado = await prisma.contacto.update({
      where: { id },
      data: {
        tipo: 'CLIENTE',
        fechaConversion: new Date()
      }
    });

    return this.agregarEdad(contactoActualizado);
  }

  /**
   * Obtener estadísticas de contactos
   */
  async obtenerEstadisticas(usuarioId: string) {
    const [totalLeads, totalClientes] = await Promise.all([
      prisma.contacto.count({
        where: { usuarioId, tipo: 'LEAD' }
      }),
      prisma.contacto.count({
        where: { usuarioId, tipo: 'CLIENTE' }
      })
    ]);

    return {
      totalLeads,
      totalClientes,
      total: totalLeads + totalClientes
    };
  }

  /**
   * Obtener contactos recientes
   */
  async obtenerContactosRecientes(usuarioId: string, limite: number = 10, tipo?: string) {
    if (tipo === 'LEAD') {
      // Buscar solo leads
      const leads = await prisma.lead.findMany({
        where: { usuarioId },
        orderBy: { creadoEn: 'desc' },
        take: limite,
        select: {
          id: true,
          nombre: true,
          apellido: true,
          correo: true,
          telefono: true,
          empresa: true,
          estado: true,
          creadoEn: true
        }
      });

      return leads.map((lead: any) => ({
        id: lead.id,
        nombre: `${lead.nombre} ${lead.apellido}`.trim(),
        email: lead.correo,
        telefono: lead.telefono,
        empresa: lead.empresa,
        tipo: 'LEAD',
        estado: lead.estado,
        fechaCreacion: lead.creadoEn
      }));
    }

    if (tipo === 'CLIENTE') {
      // Buscar solo clientes
      const clientes = await prisma.cliente.findMany({
        where: { usuarioId },
        orderBy: { creadoEn: 'desc' },
        take: limite,
        select: {
          id: true,
          nombre: true,
          apellido: true,
          correo: true,
          telefono: true,
          empresa: true,
          prioridad: true,
          creadoEn: true
        }
      });

      return clientes.map((cliente: any) => ({
        id: cliente.id,
        nombre: `${cliente.nombre} ${cliente.apellido}`.trim(),
        email: cliente.correo,
        telefono: cliente.telefono,
        empresa: cliente.empresa,
        tipo: 'CLIENTE',
        estado: cliente.prioridad,
        fechaCreacion: cliente.creadoEn
      }));
    }

    // Si no especifica tipo, obtener ambos
    const [leads, clientes] = await Promise.all([
      prisma.lead.findMany({
        where: { usuarioId },
        orderBy: { creadoEn: 'desc' },
        take: limite,
        select: {
          id: true,
          nombre: true,
          apellido: true,
          correo: true,
          telefono: true,
          empresa: true,
          estado: true,
          creadoEn: true
        }
      }),
      prisma.cliente.findMany({
        where: { usuarioId },
        orderBy: { creadoEn: 'desc' },
        take: limite,
        select: {
          id: true,
          nombre: true,
          apellido: true,
          correo: true,
          telefono: true,
          empresa: true,
          prioridad: true,
          creadoEn: true
        }
      })
    ]);

    const contactos = [
      ...leads.map((lead: any) => ({
        id: lead.id,
        nombre: `${lead.nombre} ${lead.apellido}`.trim(),
        email: lead.correo,
        telefono: lead.telefono,
        empresa: lead.empresa,
        tipo: 'LEAD',
        estado: lead.estado,
        fechaCreacion: lead.creadoEn
      })),
      ...clientes.map((cliente: any) => ({
        id: cliente.id,
        nombre: `${cliente.nombre} ${cliente.apellido}`.trim(),
        email: cliente.correo,
        telefono: cliente.telefono,
        empresa: cliente.empresa,
        tipo: 'CLIENTE',
        estado: cliente.prioridad,
        fechaCreacion: cliente.creadoEn
      }))
    ];

    // Ordenar por fecha de creación y tomar solo 'limite' elementos
    return contactos.sort((a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime()).slice(0, limite);
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
        tipo: 'LEAD'
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
        tipo: 'CLIENTE'
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
   * Obtener o crear la etiqueta "Fuente: Google Contacts"
   */
  private async obtenerOCrearEtiquetaGoogle() {
    let etiqueta = await prisma.etiqueta.findFirst({
      where: {
        nombre: 'Fuente: Google Contacts'
      }
    });

    if (!etiqueta) {
      console.log('📝 Creando etiqueta "Fuente: Google Contacts"...');
      etiqueta = await prisma.etiqueta.create({
        data: {
          nombre: 'Fuente: Google Contacts',
          descripcion: 'Contactos importados desde Google Contacts',
          color: '#4285F4', // Color azul de Google
          icono: 'Mail',
          activa: true,
          orden: 1
        }
      });
      console.log('✅ Etiqueta creada exitosamente');
    }

    return etiqueta;
  }

  /**
   * Importar contactos desde Google
   */
  async importarDesdeGoogle(usuarioId: string, accessToken: string): Promise<{
    importados: number;
    duplicados: number;
    errores: number;
  }> {
    console.log('[Contacto Service] Iniciando importación desde Google');
    console.log('[Contacto Service] Usuario ID:', usuarioId);
    console.log('[Contacto Service] Access token longitud:', accessToken?.length || 0);
    console.log('[Contacto Service] Access token primeros 30 chars:', accessToken?.substring(0, 30) || 'N/A');
    
    if (!accessToken || accessToken.trim() === '') {
      throw new Error('Token de acceso vacío o inválido. Por favor vuelve a autorizar con Google.');
    }
    
    let importados = 0;
    let duplicados = 0;
    let errores = 0;

    try {
      // Obtener o crear la etiqueta de Google
      const etiquetaGoogle = await this.obtenerOCrearEtiquetaGoogle();
      console.log('🏷️ Etiqueta Google obtenida/creada:', etiquetaGoogle.id);

      // Obtener contactos de Google usando el access token
      console.log('[Contacto Service] Llamando a googleAuthService.getContacts...');
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
            // Primero verificar si ya existe un lead con el mismo nombre y apellido
            const leadPorNombre = await prisma.lead.findFirst({
              where: {
                nombre: nombre.trim(),
                apellido: apellido.trim(),
                usuarioId
              }
            });

            if (leadPorNombre) {
              console.log(`🔄 Lead duplicado (por nombre): ${nombre} ${apellido}`);
              duplicados++;
              continue;
            }

            // También verificar en clientes
            const clientePorNombre = await prisma.cliente.findFirst({
              where: {
                nombre: nombre.trim(),
                apellido: apellido.trim(),
                usuarioId
              }
            });

            if (clientePorNombre) {
              console.log(`🔄 Cliente duplicado (por nombre): ${nombre} ${apellido}`);
              duplicados++;
              continue;
            }

            // Generar un identificador único basado en nombre y timestamp
            const identificador = `${nombre}${apellido}`.toLowerCase().replace(/\s+/g, '');
            correoFinal = `${identificador}_${Date.now()}@importado.local`;
            console.log(`📧 Contacto sin correo, usando temporal: ${correoFinal}`);
          }

          // Verificar si ya existe un lead con ese correo
          const leadExistente = await prisma.lead.findFirst({
            where: {
              correo: correoFinal!.toLowerCase().trim(),
              usuarioId
            }
          });

          if (leadExistente) {
            console.log(`🔄 Lead duplicado: ${nombre} ${apellido} (${correoFinal})`);
            duplicados++;
            continue;
          }

          // También verificar en clientes
          const clienteExistente = await prisma.cliente.findFirst({
            where: {
              correo: correoFinal!.toLowerCase().trim(),
              usuarioId
            }
          });

          if (clienteExistente) {
            console.log(`🔄 Cliente duplicado: ${nombre} ${apellido} (${correoFinal})`);
            duplicados++;
            continue;
          }

          // Crear el nuevo lead
          const nuevoLead = await prisma.lead.create({
            data: {
              nombre: nombre.trim() || 'Sin nombre',
              apellido: apellido?.trim() || '',
              correo: correoFinal!.toLowerCase().trim(),
              estado: 'NUEVO',
              fuente: 'Google Contacts',
              usuarioId,
              ...(telefono?.trim() ? { telefono: telefono.trim() } : {})
            }
          });

          // Asignar la etiqueta "Fuente: Google Contacts"
          await prisma.leadEtiqueta.create({
            data: {
              leadId: nuevoLead.id,
              etiquetaId: etiquetaGoogle.id
            }
          });

          console.log(`✅ Importado: ${nombre} ${apellido} (con etiqueta Google)`);
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

  /**
   * Agregar un lead al pipeline (crear una oportunidad)
   */
  async agregarAlPipeline(
    leadId: string,
    usuarioId: string,
    datosOportunidad?: {
      titulo?: string;
      etapa?: string;
      valor?: number;
      probabilidad?: number;
      proximaAccion?: string;
      notas?: string;
    }
  ) {
    console.log('[ContactoService] agregarAlPipeline called with:', { leadId, usuarioId, datosOportunidad });
    
    // Verificar que el contacto existe
    const contacto = await prisma.contacto.findUnique({
      where: { id: leadId }
    });

    console.log('[ContactoService] contacto encontrado:', contacto?.id);

    if (!contacto) {
      throw new Error('El lead no fue encontrado');
    }

    if (contacto.usuarioId !== usuarioId) {
      throw new Error('No tienes permiso para modificar este lead');
    }

    // Verificar si ya existe una oportunidad para este lead
    const oportunidadExistente = await prisma.oportunidadCliente.findFirst({
      where: { clienteId: leadId }
    });

    if (oportunidadExistente) {
      throw new Error('Este lead ya está en el pipeline');
    }

    // Crear la oportunidad
    const titulo = datosOportunidad?.titulo || `${contacto.nombre} ${contacto.apellido || ''}`.trim();
    const etapa = datosOportunidad?.etapa || 'CONTACTO_INICIAL';
    
    console.log('[ContactoService] creando oportunidad con datos:', {
      clienteId: leadId,
      titulo,
      etapa,
      usuarioId: usuarioId
    });

    const oportunidad = await prisma.oportunidadCliente.create({
      data: {
        clienteId: leadId,
        titulo,
        etapa,
        valor: datosOportunidad?.valor,
        probabilidad: datosOportunidad?.probabilidad || 25,
        proximaAccion: datosOportunidad?.proximaAccion,
        usuarioId: usuarioId,
        ultimaActividad: new Date(),
        notas: datosOportunidad?.notas
          ? `${datosOportunidad.notas}\n\nAgregado al pipeline desde lead el ${new Date().toLocaleDateString('es-PE')}`
          : `Agregado al pipeline desde lead el ${new Date().toLocaleDateString('es-PE')}`
      },
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            telefono: true,
            empresa: true
          }
        }
      }
    });

    console.log('[ContactoService] oportunidad creada:', oportunidad?.id);
    return oportunidad;
  }
}

export default new ContactoService();
