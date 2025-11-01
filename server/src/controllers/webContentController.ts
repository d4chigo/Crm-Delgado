import { Request, Response } from 'express';
import prisma from '@/config/database';

/**
 * Obtener todas las páginas de servicios
 * GET /api/web/servicios
 */
export const obtenerPaginasServicios = async (req: Request, res: Response) => {
  try {
    const { activo } = req.query;

    const paginas = await prisma.paginaServicio.findMany({
      where: activo !== undefined ? { activo: activo === 'true' } : undefined,
      orderBy: { ordenMostrar: 'asc' },
    });

    res.json({
      exito: true,
      datos: paginas,
    });
  } catch (error) {
    console.error('Error al obtener páginas de servicios:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener páginas de servicios',
    });
  }
};

/**
 * Obtener una página de servicio por tipo
 * GET /api/web/servicios/:tipo
 */
export const obtenerPaginaPorTipo = async (req: Request, res: Response) => {
  try {
    const { tipo } = req.params;

    const pagina = await prisma.paginaServicio.findUnique({
      where: { tipoServicio: tipo as any },
    });

    if (!pagina) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Página de servicio no encontrada',
      });
    }

    res.json({
      exito: true,
      datos: pagina,
    });
  } catch (error) {
    console.error('Error al obtener página de servicio:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener página de servicio',
    });
  }
};

/**
 * Crear o actualizar página de servicio
 * POST /api/web/servicios
 */
export const crearActualizarPagina = async (req: Request, res: Response) => {
  try {
    const {
      tipoServicio,
      titulo,
      subtitulo,
      descripcionCorta,
      descripcionLarga,
      imagenBanner,
      videoBanner,
      requisitos,
      beneficios,
      pasos,
      preguntas,
      activo,
      ordenMostrar,
      metaTitle,
      metaDescription,
    } = req.body;

    // Verificar si ya existe una página para este tipo de servicio
    const paginaExistente = await prisma.paginaServicio.findUnique({
      where: { tipoServicio },
    });

    let pagina;

    if (paginaExistente) {
      // Actualizar
      pagina = await prisma.paginaServicio.update({
        where: { tipoServicio },
        data: {
          titulo,
          subtitulo,
          descripcionCorta,
          descripcionLarga,
          imagenBanner,
          videoBanner,
          requisitos,
          beneficios,
          pasos,
          preguntas,
          activo,
          ordenMostrar,
          metaTitle,
          metaDescription,
        },
      });
    } else {
      // Crear
      pagina = await prisma.paginaServicio.create({
        data: {
          tipoServicio,
          titulo,
          subtitulo,
          descripcionCorta,
          descripcionLarga,
          imagenBanner,
          videoBanner,
          requisitos,
          beneficios,
          pasos,
          preguntas,
          activo: activo ?? true,
          ordenMostrar: ordenMostrar ?? 0,
          metaTitle,
          metaDescription,
        },
      });
    }

    res.json({
      exito: true,
      mensaje: paginaExistente
        ? 'Página actualizada exitosamente'
        : 'Página creada exitosamente',
      datos: pagina,
    });
  } catch (error) {
    console.error('Error al crear/actualizar página:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al crear/actualizar página',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

/**
 * Eliminar página de servicio
 * DELETE /api/web/servicios/:tipo
 */
export const eliminarPagina = async (req: Request, res: Response) => {
  try {
    const { tipo } = req.params;

    await prisma.paginaServicio.delete({
      where: { tipoServicio: tipo as any },
    });

    res.json({
      exito: true,
      mensaje: 'Página eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar página:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al eliminar página',
    });
  }
};

/**
 * Obtener proyectos por tipo de servicio
 * GET /api/web/proyectos-por-tipo/:tipo
 */
export const obtenerProyectosPorTipo = async (req: Request, res: Response) => {
  try {
    const { tipo } = req.params;
    const { limite, activo } = req.query;

    const proyectos = await prisma.proyecto.findMany({
      where: {
        tipoProyecto: tipo as any,
        activo: activo === 'false' ? false : true,
        mostrarEnWeb: true,
      },
      orderBy: [
        { ordenWeb: 'asc' },
        { creadoEn: 'desc' }
      ],
      take: limite ? parseInt(limite as string) : undefined,
      include: {
        etiquetas: {
          include: {
            etiqueta: true,
          },
        },
      },
    });

    res.json({
      exito: true,
      datos: proyectos,
    });
  } catch (error) {
    console.error('Error al obtener proyectos por tipo:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener proyectos',
    });
  }
};
