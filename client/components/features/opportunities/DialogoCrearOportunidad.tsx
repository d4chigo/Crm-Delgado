'use client'

import { useState, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import type { Contacto } from '@/types/contacto.types'

interface DialogoCrearOportunidadProps {
  abierto: boolean
  onCerrar: () => void
  lead: Contacto | null
  onCrear: (datos: DatosOportunidad) => Promise<void>
  cargando?: boolean
}

export interface DatosOportunidad {
  titulo: string
  etapa: string
  valor?: number
  probabilidad?: number
  proximaAccion?: string
  notas?: string
}

export function DialogoCrearOportunidad({
  abierto,
  onCerrar,
  lead,
  onCrear,
  cargando = false
}: DialogoCrearOportunidadProps) {
  const [titulo, setTitulo] = useState('')
  const [etapa, setEtapa] = useState('LEAD')
  const [valor, setValor] = useState('')
  const [probabilidad, setProbabilidad] = useState('25')
  const [proximaAccion, setProximaAccion] = useState('')
  const [notas, setNotas] = useState('')

  const handleCrear = useCallback(async () => {
    await onCrear({
      titulo: titulo || `${lead?.nombre} ${lead?.apellido}`.trim(),
      etapa,
      valor: valor ? parseFloat(valor) : undefined,
      probabilidad: probabilidad ? parseInt(probabilidad) : 25,
      proximaAccion: proximaAccion || undefined,
      notas: notas || undefined
    })
    
    // Limpiar formulario
    setTitulo('')
    setEtapa('LEAD')
    setValor('')
    setProbabilidad('25')
    setProximaAccion('')
    setNotas('')
  }, [titulo, etapa, valor, probabilidad, proximaAccion, notas, lead, onCrear])

  return (
    <Dialog open={abierto} onOpenChange={onCerrar}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crear Oportunidad en Pipeline</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información del lead */}
          {lead && (
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <p className="text-sm font-medium text-blue-900">
                Lead: <span className="font-bold">{lead.nombre} {lead.apellido}</span>
              </p>
              {lead.correo && (
                <p className="text-sm text-blue-700">Correo: {lead.correo}</p>
              )}
              {lead.telefono && (
                <p className="text-sm text-blue-700">Teléfono: {lead.telefono}</p>
              )}
            </div>
          )}

          {/* Título */}
          <div className="space-y-1">
            <Label htmlFor="titulo">Título de la Oportunidad</Label>
            <Input
              id="titulo"
              placeholder={`${lead?.nombre} ${lead?.apellido}`.trim()}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              disabled={cargando}
            />
          </div>

          {/* Etapa */}
          <div className="space-y-1">
            <Label htmlFor="etapa">Etapa</Label>
            <Select value={etapa} onValueChange={setEtapa} disabled={cargando}>
              <SelectTrigger id="etapa">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LEAD">Lead</SelectItem>
                <SelectItem value="CONTACTO">Contacto Inicial</SelectItem>
                <SelectItem value="VISITA">Visita Agendada</SelectItem>
                <SelectItem value="NEGOCIACION">Negociación</SelectItem>
                <SelectItem value="CIERRE">Cierre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Valor y Probabilidad en grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="valor">Valor (Opcional)</Label>
              <Input
                id="valor"
                type="number"
                placeholder="0.00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                disabled={cargando}
                step="0.01"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="probabilidad">Probabilidad (%)</Label>
              <Select value={probabilidad} onValueChange={setProbabilidad} disabled={cargando}>
                <SelectTrigger id="probabilidad">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0%</SelectItem>
                  <SelectItem value="25">25%</SelectItem>
                  <SelectItem value="50">50%</SelectItem>
                  <SelectItem value="75">75%</SelectItem>
                  <SelectItem value="100">100%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Próxima Acción */}
          <div className="space-y-1">
            <Label htmlFor="proximaAccion">Próxima Acción (Opcional)</Label>
            <Input
              id="proximaAccion"
              placeholder="ej: Enviar propuesta, Agendar reunión, etc."
              value={proximaAccion}
              onChange={(e) => setProximaAccion(e.target.value)}
              disabled={cargando}
            />
          </div>

          {/* Notas */}
          <div className="space-y-1">
            <Label htmlFor="notas">Notas (Opcional)</Label>
            <Textarea
              id="notas"
              placeholder="Información adicional sobre la oportunidad..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              disabled={cargando}
              rows={3}
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onCerrar}
              disabled={cargando}
            >
              Cancelar
            </Button>
            <Button
              className="bg-[#FCBA00] hover:bg-[#E0A800] text-[#303030]"
              onClick={handleCrear}
              disabled={cargando}
            >
              {cargando ? 'Creando...' : 'Crear Oportunidad'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
