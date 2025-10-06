/**
 * Controlador para consultas de DNI
 */

import { Request, Response } from 'express'
import { dniService } from '../services/dni.service'

export class DNIController {
  /**
   * Consultar DNI en RENIEC
   * GET /api/dni/:numero
   */
  async consultarDNI(req: Request, res: Response): Promise<void> {
    try {
      const { numero } = req.params

      // Validar que el DNI tenga 8 dígitos
      if (!numero || !/^\d{8}$/.test(numero)) {
        res.status(400).json({
          exito: false,
          mensaje: 'El DNI debe tener exactamente 8 dígitos',
        })
        return
      }

      // Consultar DNI
      const datos = await dniService.consultarDNI(numero)

      if (!datos) {
        res.status(404).json({
          exito: false,
          mensaje: 'DNI no encontrado en RENIEC',
        })
        return
      }

      // Formatear y retornar datos
      const datosFormateados = dniService.formatearDatos(datos)

      res.json({
        exito: true,
        mensaje: 'DNI encontrado exitosamente',
        datos: datosFormateados,
      })
    } catch (error) {
      console.error('Error al consultar DNI:', error)

      if (error instanceof Error) {
        res.status(500).json({
          exito: false,
          mensaje: error.message || 'Error al consultar DNI',
        })
      } else {
        res.status(500).json({
          exito: false,
          mensaje: 'Error interno del servidor',
        })
      }
    }
  }
}

export const dniController = new DNIController()
