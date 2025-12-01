import { Request, Response } from 'express'
import { proyectoService } from '../services/proyecto.service'
import { z } from 'zod'

// Validación para crear proyecto
const crearProyectoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(255),
  descripcion: z.string().optional(),
  imagen: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  precio: z.number().positive('El precio debe ser positivo').optional(),
  ubicacion: z.string().max(255).optional(),
  latitud: z.number().optional(),
  longitud: z.number().optional(),
  estado: z.enum(['DISPONIBLE', 'RESERVADO', 'VENDIDO', 'CONSTRUCCION', 'FINALIZADO']).optional(),
  tipoProyecto: z.enum([
    'TECHO_PROPIO', 
    'CREDITO_MIVIVIENDA', 
    'HABILITACIONES', 
    'COMPRA',
    'VENTA',
    'ALQUILER',
    'DEPARTAMENTO', 
    'CASA', 
    'TERRENO',
    'LOCAL_COMERCIAL'
  ]).optional(),
  categoria: z.string().max(100).optional(),
  galeria: z.array(z.string().url()).optional(),
  caracteristicas: z.record(z.string(), z.any()).optional(),
  mostrarEnWeb: z.boolean().optional().default(true),
  ordenWeb: z.number().int().optional(),
  etiquetaIds: z.array(z.string().uuid()).optional()
})

// Validación para actualizar proyecto
const actualizarProyectoSchema = z.object({
  nombre: z.string().min(1).max(255).optional(),
  descripcion: z.string().optional(),
  imagen: z.string().url().optional().or(z.literal('')),
  precio: z.number().positive().optional(),
  ubicacion: z.string().max(255).optional(),
  latitud: z.number().optional(),
  longitud: z.number().optional(),
  estado: z.enum(['DISPONIBLE', 'RESERVADO', 'VENDIDO', 'CONSTRUCCION', 'FINALIZADO']).optional(),
  tipoProyecto: z.enum([
    'TECHO_PROPIO', 
    'CREDITO_MIVIVIENDA', 
    'HABILITACIONES', 
    'COMPRA',
    'VENTA',
    'ALQUILER',
    'DEPARTAMENTO', 
    'CASA', 
    'TERRENO',
    'LOCAL_COMERCIAL'
  ]).optional(),
  categoria: z.string().max(100).optional(),
  galeria: z.array(z.string().url()).optional(),
  caracteristicas: z.record(z.string(), z.any()).optional(),
  mostrarEnWeb: z.boolean().optional(),
  ordenWeb: z.number().int().optional(),
  activo: z.boolean().optional(),
  etiquetaIds: z.array(z.string().uuid()).optional()
})

// Validación para asociar cliente
const asociarClienteSchema = z.object({
  clienteId: z.string().uuid('ID de cliente inválido'),
  notas: z.string().optional()
})

// Validación para actualizar notas
const actualizarNotasSchema = z.object({
  notas: z.string()
})

export const proyectoController = {
  /**
   * GET /api/proyectos
   * Obtener todos los proyectos con filtros opcionales
   */
  async obtenerTodos(req: Request, res: Response) {
    try {
      const { etiquetaId, estado, activo } = req.query

      const filtros = {
        etiquetaId: etiquetaId as string | undefined,
        estado: estado as any,
        activo: activo === 'true' ? true : activo === 'false' ? false : undefined
      }

      const proyectos = await proyectoService.obtenerProyectos(filtros)

      return res.json({
        exito: true,
        datos: proyectos
      })
    } catch (error: any) {
      console.error('Error al obtener proyectos:', error)
      return res.status(500).json({
        exito: false,
        mensaje: 'Error al obtener proyectos',
        error: error.message
      })
    }
  },

  /**
   * GET /api/proyectos/:id
   * Obtener un proyecto por ID
   */
  async obtenerPorId(req: Request, res: Response) {
    try {
      const { id } = req.params

      const proyecto = await proyectoService.obtenerPorId(id)

      if (!proyecto) {
        return res.status(404).json({
          exito: false,
          mensaje: 'Proyecto no encontrado'
        })
      }

      return res.json({
        exito: true,
        datos: proyecto
      })
    } catch (error: any) {
      console.error('Error al obtener proyecto:', error)
      return res.status(500).json({
        exito: false,
        mensaje: 'Error al obtener proyecto',
        error: error.message
      })
    }
  },

  /**
   * POST /api/proyectos
   * Crear un nuevo proyecto
   */
  async crear(req: Request, res: Response) {
    try {
      console.log('[Proyecto] Crear - Body recibido:', req.body)
      console.log('[Proyecto] Crear - Usuario autenticado:', req.usuario)
      
      // Validar datos
      const validacion = crearProyectoSchema.safeParse(req.body)
      
      if (!validacion.success) {
        console.error('[Proyecto] Validación fallida:', validacion.error.issues)
        return res.status(400).json({
          exito: false,
          mensaje: 'Datos inválidos',
          errores: validacion.error.issues
        })
      }

      const usuarioId = req.usuario?.usuarioId

      if (!usuarioId) {
        console.error('[Proyecto] Usuario no autenticado')
        return res.status(401).json({
          exito: false,
          mensaje: 'Usuario no autenticado'
        })
      }

      console.log('[Proyecto] Creando proyecto con datos:', { ...validacion.data, usuarioId })

      const proyecto = await proyectoService.crear({
        ...validacion.data,
        usuarioId
      })

      console.log('[Proyecto] Proyecto creado exitosamente:', proyecto.id)

      return res.status(201).json({
        exito: true,
        mensaje: 'Proyecto creado exitosamente',
        datos: proyecto
      })
    } catch (error: any) {
      console.error('[Proyecto] Error al crear proyecto:', {
        mensaje: error.message,
        stack: error.stack,
        codigo: error.code,
        detalles: error
      })
      return res.status(500).json({
        exito: false,
        mensaje: 'Error al crear proyecto',
        error: error.message,
        codigo: error.code
      })
    }
  },

  /**
   * PUT /api/proyectos/:id
   * Actualizar un proyecto existente
   */
  async actualizar(req: Request, res: Response) {
    try {
      const { id } = req.params

      console.log('[Proyecto] Actualizar - ID:', id)
      console.log('[Proyecto] Actualizar - Body recibido:', req.body)

      // Validar datos
      const validacion = actualizarProyectoSchema.safeParse(req.body)
      
      if (!validacion.success) {
        console.error('[Proyecto] Validación fallida:', validacion.error.issues)
        return res.status(400).json({
          exito: false,
          mensaje: 'Datos inválidos',
          errores: validacion.error.issues
        })
      }

      // Verificar que el proyecto existe
      const proyectoExistente = await proyectoService.obtenerPorId(id)
      if (!proyectoExistente) {
        console.error('[Proyecto] Proyecto no encontrado:', id)
        return res.status(404).json({
          exito: false,
          mensaje: 'Proyecto no encontrado'
        })
      }

      // Separar etiquetaIds del resto de datos
      const { etiquetaIds, ...datosProyecto } = validacion.data

      console.log('[Proyecto] Datos a actualizar:', datosProyecto)
      console.log('[Proyecto] Etiquetas a asignar:', etiquetaIds)

      const proyecto = await proyectoService.actualizar(id, datosProyecto)

      // Actualizar etiquetas si se proporcionan
      if (etiquetaIds && etiquetaIds.length > 0) {
        console.log('[Proyecto] Asignando etiquetas:', etiquetaIds)
        await proyectoService.asignarEtiquetas(id, etiquetaIds)
      } else if (etiquetaIds && etiquetaIds.length === 0) {
        // Si se envía un array vacío, eliminar todas las etiquetas
        console.log('[Proyecto] Eliminando todas las etiquetas')
        await proyectoService.asignarEtiquetas(id, [])
      }

      // Obtener el proyecto actualizado con sus relaciones
      const proyectoActualizado = await proyectoService.obtenerPorId(id)

      console.log('[Proyecto] Proyecto actualizado exitosamente:', proyectoActualizado.id)

      return res.json({
        exito: true,
        mensaje: 'Proyecto actualizado exitosamente',
        datos: proyectoActualizado
      })
    } catch (error: any) {
      console.error('[Proyecto] Error al actualizar proyecto:', {
        mensaje: error.message,
        stack: error.stack,
        codigo: error.code,
        detalles: error
      })
      return res.status(500).json({
        exito: false,
        mensaje: 'Error al actualizar proyecto',
        error: error.message,
        codigo: error.code
      })
    }
  },

  /**
   * DELETE /api/proyectos/:id
   * Eliminar un proyecto (soft delete)
   */
  async eliminar(req: Request, res: Response) {
    try {
      const { id } = req.params

      // Verificar que el proyecto existe
      const proyectoExistente = await proyectoService.obtenerPorId(id)
      if (!proyectoExistente) {
        return res.status(404).json({
          exito: false,
          mensaje: 'Proyecto no encontrado'
        })
      }

      await proyectoService.eliminar(id)

      return res.json({
        exito: true,
        mensaje: 'Proyecto eliminado exitosamente'
      })
    } catch (error: any) {
      console.error('Error al eliminar proyecto:', error)
      return res.status(500).json({
        exito: false,
        mensaje: 'Error al eliminar proyecto',
        error: error.message
      })
    }
  },

  /**
   * PUT /api/proyectos/:id/etiquetas
   * Asignar etiquetas a un proyecto
   */
  async asignarEtiquetas(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { etiquetaIds } = req.body

      if (!Array.isArray(etiquetaIds)) {
        return res.status(400).json({
          exito: false,
          mensaje: 'etiquetaIds debe ser un array'
        })
      }

      const proyecto = await proyectoService.asignarEtiquetas(id, etiquetaIds)

      return res.json({
        exito: true,
        mensaje: 'Etiquetas asignadas exitosamente',
        datos: proyecto
      })
    } catch (error: any) {
      console.error('Error al asignar etiquetas:', error)
      return res.status(500).json({
        exito: false,
        mensaje: 'Error al asignar etiquetas',
        error: error.message
      })
    }
  },

  /**
   * POST /api/proyectos/:id/clientes
   * Asociar un cliente a un proyecto
   */
  async asociarCliente(req: Request, res: Response) {
    try {
      const { id } = req.params

      // Validar datos
      const validacion = asociarClienteSchema.safeParse(req.body)
      
      if (!validacion.success) {
        return res.status(400).json({
          exito: false,
          mensaje: 'Datos inválidos',
          errores: validacion.error.issues
        })
      }

      const proyecto = await proyectoService.asociarCliente(id, validacion.data)

      return res.json({
        exito: true,
        mensaje: 'Cliente asociado exitosamente',
        datos: proyecto
      })
    } catch (error: any) {
      console.error('Error al asociar cliente:', error)
      
      if (error.message.includes('tipo CLIENTE')) {
        return res.status(400).json({
          exito: false,
          mensaje: error.message
        })
      }

      if (error.message.includes('ya está asociado')) {
        return res.status(409).json({
          exito: false,
          mensaje: error.message
        })
      }

      return res.status(500).json({
        exito: false,
        mensaje: 'Error al asociar cliente',
        error: error.message
      })
    }
  },

  /**
   * PUT /api/proyectos/:id/clientes/:clienteId
   * Actualizar notas de un cliente asociado
   */
  async actualizarNotasCliente(req: Request, res: Response) {
    try {
      const { id, clienteId } = req.params

      // Validar datos
      const validacion = actualizarNotasSchema.safeParse(req.body)
      
      if (!validacion.success) {
        return res.status(400).json({
          exito: false,
          mensaje: 'Datos inválidos',
          errores: validacion.error.issues
        })
      }

      const proyecto = await proyectoService.actualizarNotasCliente(
        id,
        clienteId,
        validacion.data.notas
      )

      return res.json({
        exito: true,
        mensaje: 'Notas actualizadas exitosamente',
        datos: proyecto
      })
    } catch (error: any) {
      console.error('Error al actualizar notas:', error)
      return res.status(500).json({
        exito: false,
        mensaje: 'Error al actualizar notas',
        error: error.message
      })
    }
  },

  /**
   * DELETE /api/proyectos/:id/clientes/:clienteId
   * Desasociar un cliente de un proyecto
   */
  async desasociarCliente(req: Request, res: Response) {
    try {
      const { id, clienteId } = req.params

      const proyecto = await proyectoService.desasociarCliente(id, clienteId)

      return res.json({
        exito: true,
        mensaje: 'Cliente desasociado exitosamente',
        datos: proyecto
      })
    } catch (error: any) {
      console.error('Error al desasociar cliente:', error)
      return res.status(500).json({
        exito: false,
        mensaje: 'Error al desasociar cliente',
        error: error.message
      })
    }
  },

  /**
   * GET /api/proyectos/cliente/:clienteId
   * Obtener proyectos de un cliente específico
   */
  async obtenerPorCliente(req: Request, res: Response) {
    try {
      const { clienteId } = req.params

      const proyectos = await proyectoService.obtenerPorCliente(clienteId)

      return res.json({
        exito: true,
        datos: proyectos
      })
    } catch (error: any) {
      console.error('Error al obtener proyectos del cliente:', error)
      return res.status(500).json({
        exito: false,
        mensaje: 'Error al obtener proyectos del cliente',
        error: error.message
      })
    }
  },

  /**
   * GET /api/proyectos/contacto/:contactoId
   * Obtener proyectos de un contacto (lead o cliente)
   */
  async obtenerPorContacto(req: Request, res: Response) {
    try {
      const { contactoId } = req.params
      console.log('[ProyectoController] obtenerPorContacto - contactoId:', contactoId)

      const proyectos = await proyectoService.obtenerPorContacto(contactoId)
      console.log('[ProyectoController] obtenerPorContacto - proyectos encontrados:', proyectos.length)

      return res.json({
        exito: true,
        datos: proyectos
      })
    } catch (error: any) {
      console.error('[ProyectoController] Error al obtener proyectos del contacto:', {
        mensaje: error.message,
        stack: error.stack,
        codigo: error.code
      })
      return res.status(500).json({
        exito: false,
        mensaje: 'Error al obtener proyectos del contacto',
        error: error.message
      })
    }
  }
}
