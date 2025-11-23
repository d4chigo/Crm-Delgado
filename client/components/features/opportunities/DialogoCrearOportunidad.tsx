'use client'

import { useState, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { getStageProbability, STAGE_LABELS, STAGES_ORDER } from '@/lib/pipeline-stages'
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
  const [etapa, setEtapa] = useState('CONTACTO_INICIAL')
  const [valor, setValor] = useState('')
  const [proximaAccion, setProximaAccion] = useState('')
  const [notas, setNotas] = useState('')

  // Auto-calcular probabilidad basada en la etapa
  const probabilidadAuto = getStageProbability(etapa)

  const handleCrear = useCallback(async () => {
    await onCrear({
      titulo: titulo || `${lead?.nombre} ${lead?.apellido}`.trim(),
      etapa,
      valor: valor ? parseFloat(valor) : undefined,
      probabilidad: probabilidadAuto,
      proximaAccion: proximaAccion || undefined,
      notas: notas || undefined
    })
    
    // Limpiar formulario
    setTitulo('')
    setEtapa('CONTACTO_INICIAL')
    setValor('')
    setProximaAccion('')
    setNotas('')
  }, [titulo, etapa, valor, proximaAccion, notas, lead, onCrear, probabilidadAuto])

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
            <Label htmlFor="etapa">Etapa del Pipeline</Label>
            <Select value={etapa} onValueChange={setEtapa} disabled={cargando}>
              <SelectTrigger id="etapa">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAGES_ORDER.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {STAGE_LABELS[stage]} ({getStageProbability(stage)}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Valor y Probabilidad Automática en grid */}
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
              <Label htmlFor="probabilidad">Probabilidad (Automática)</Label>
              <div className="flex items-center justify-center h-10 bg-blue-50 border border-blue-200 rounded-md">
                <span className="text-lg font-bold text-blue-600">{probabilidadAuto}%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Se calcula automáticamente según la etapa
              </p>
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
