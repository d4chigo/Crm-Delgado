'use client'

import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Search, User, Mail, Phone, MapPin, Calendar, Building, Users } from 'lucide-react'
import { Sexo, type CrearContactoDTO } from '@/types/contacto.types'
import { dniService } from '@/services/api/dni.service'
import { validarTexto, validarDNI, validarTelefono, calcularEdad, obtenerFechaMaxima, esMayorDeEdad } from '@/lib/validaciones'
import { SelectorEtiquetasCreacion } from '../contacts/SelectorEtiquetasCreacion'
import { etiquetaService } from '@/services/api/etiqueta.service'
import { toast } from '@/hooks/use-toast'
import contactoService from '@/services/api/contacto.service'

interface DialogoCrearLeadProps {
  abierto: boolean
  onCerrar: () => void
  onCreado: () => void
  tipo?: 'lead' | 'cliente'
}

export function DialogoCrearLead({ abierto, onCerrar, onCreado, tipo = 'lead' }: DialogoCrearLeadProps) {
  const [cargando, setCargando] = useState(false)
  const [buscandoDNI, setBuscandoDNI] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [edad, setEdad] = useState<number | null>(null)
  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState<string[]>([])

  const [formulario, setFormulario] = useState<CrearContactoDTO>({
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    dni: '',
    sexo: undefined,
    fechaNacimiento: '',
    departamento: '',
  })

  const handleChange = useCallback((campo: keyof CrearContactoDTO, valor: any) => {
    setFormulario(prev => ({ ...prev, [campo]: valor }))
    
    // Calcular edad cuando cambia la fecha de nacimiento
    if (campo === 'fechaNacimiento') {
      setEdad(calcularEdad(valor))
    }
  }, [])

  const handleBuscarDNI = async () => {
    if (!formulario.dni || !dniService.validarFormato(formulario.dni)) {
      setError('El DNI debe tener 8 dígitos')
      return
    }

    setBuscandoDNI(true)
    setError(null)

    try {
      const datos = await dniService.consultarDNI(formulario.dni)
      
      // Auto-completar nombre y apellido
      setFormulario(prev => ({
        ...prev,
        nombre: datos.nombre,
        apellido: datos.apellido,
      }))

      setError(null)
    } catch (err: any) {
      setError(err.message || 'Error al consultar DNI')
    } finally {
      setBuscandoDNI(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar edad mínima
    if (formulario.fechaNacimiento && !esMayorDeEdad(formulario.fechaNacimiento)) {
      setError('El contacto debe ser mayor de 18 años')
      return
    }
    
    setCargando(true)
    setError(null)

    try {
      // Preparar datos para enviar
      const datos: CrearContactoDTO = {
        nombre: formulario.nombre.trim(),
      }

      // Agregar campos opcionales solo si tienen valor
      if (formulario.apellido?.trim()) datos.apellido = formulario.apellido.trim()
      if (formulario.correo?.trim()) datos.correo = formulario.correo.trim()
      if (formulario.telefono?.trim()) datos.telefono = formulario.telefono.trim()
      if (formulario.direccion?.trim()) datos.direccion = formulario.direccion.trim()
      if (formulario.ciudad?.trim()) datos.ciudad = formulario.ciudad.trim()
      if (formulario.departamento?.trim()) datos.departamento = formulario.departamento.trim()
      if (formulario.dni?.trim()) datos.dni = formulario.dni.trim()
      if (formulario.sexo) datos.sexo = formulario.sexo
      if (formulario.fechaNacimiento?.trim()) {
        // Convertir fecha a formato ISO
        const fecha = new Date(formulario.fechaNacimiento)
        datos.fechaNacimiento = fecha.toISOString()
      }

      // Crear el contacto
      const contactoCreado = await contactoService.crearContacto(datos)

      // Si hay etiquetas seleccionadas, asignarlas al contacto recién creado
      if (etiquetasSeleccionadas.length > 0 && contactoCreado?.id) {
        try {
          await etiquetaService.asignarAContacto(contactoCreado.id, etiquetasSeleccionadas)
        } catch (errorEtiquetas) {
          console.error('Error al asignar etiquetas:', errorEtiquetas)
          // No bloquear la creación si falla la asignación de etiquetas
        }
      }

      toast({ 
        title: 'Éxito', 
        description: `${tipo === 'cliente' ? 'Cliente' : 'Lead'} creado correctamente` 
      })

      // Limpiar formulario y cerrar
      setFormulario({
        nombre: '',
        apellido: '',
        correo: '',
        telefono: '',
        direccion: '',
        ciudad: '',
        dni: '',
        sexo: undefined,
        fechaNacimiento: '',
        departamento: '',
      })
      setEtiquetasSeleccionadas([])
      setEdad(null)
      
      onCreado()
      onCerrar()
    } catch (err: any) {
      setError(err.message || 'Error al crear contacto')
      toast({ 
        title: 'Error', 
        description: err.message || 'Error al crear contacto', 
        variant: 'destructive' 
      })
    } finally {
      setCargando(false)
    }
  }

  const esValido = formulario.nombre.trim().length > 0

  return (
    <Dialog open={abierto} onOpenChange={onCerrar}>
      <DialogContent size="lg" className="max-h-[90vh] overflow-y-auto border-[#FCBA00]/30">
        <DialogHeader className="border-b border-[#FCBA00]/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FCBA00] rounded-lg flex items-center justify-center shadow-lg">
              {tipo === 'cliente' ? (
                <Users className="w-5 h-5 text-[#303030]" />
              ) : (
                <User className="w-5 h-5 text-[#303030]" />
              )}
            </div>
            <div>
              <DialogTitle className="text-xl">
                Agregar Nuevo {tipo === 'cliente' ? 'Cliente' : 'Lead'}
              </DialogTitle>
              <DialogDescription className="text-sm mt-1">
                Solo el <strong>nombre</strong> es obligatorio. Los demás campos son opcionales.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* DNI con botón de búsqueda - PRIMERO */}
          <div className="space-y-2">
            <Label htmlFor="dni" className="flex items-center gap-2 text-sm font-semibold text-[#303030]">
              <Building className="w-4 h-4 text-[#FCBA00]" />
              DNI (Perú)
            </Label>
            <div className="flex gap-2">
              <Input
                id="dni"
                value={formulario.dni}
                onChange={(e) => handleChange('dni', validarDNI(e.target.value))}
                placeholder="12345678"
                maxLength={8}
                className="flex-1 border-[#FCBA00]/20 focus:border-[#FCBA00] focus:ring-[#FCBA00]"
              />
              <Button
                type="button"
                onClick={handleBuscarDNI}
                disabled={buscandoDNI || !formulario.dni || formulario.dni.length !== 8}
                className="flex-shrink-0 bg-[#FCBA00] hover:bg-[#E5A200] text-[#303030] font-semibold px-4"
              >
                {buscandoDNI ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                {buscandoDNI ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              💡 Si tienes el DNI, ingrésalo y haz clic en buscar para auto-completar
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre" className="flex items-center gap-2 text-sm font-semibold text-[#303030]">
                <User className="w-4 h-4 text-[#FCBA00]" />
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nombre"
                value={formulario.nombre}
                onChange={(e) => handleChange('nombre', validarTexto(e.target.value))}
                placeholder="Juan"
                required
                className="border-[#FCBA00]/20 focus:border-[#FCBA00] focus:ring-[#FCBA00]"
              />
            </div>

            {/* Apellido */}
            <div className="space-y-2">
              <Label htmlFor="apellido" className="flex items-center gap-2 text-sm font-semibold text-[#303030]">
                <User className="w-4 h-4 text-[#FCBA00]" />
                Apellido
              </Label>
              <Input
                id="apellido"
                value={formulario.apellido}
                onChange={(e) => handleChange('apellido', validarTexto(e.target.value))}
                placeholder="Pérez"
                className="border-[#FCBA00]/20 focus:border-[#FCBA00] focus:ring-[#FCBA00]"
              />
            </div>
          </div>

          {/* Correo */}
          <div className="space-y-2">
            <Label htmlFor="correo" className="flex items-center gap-2 text-sm font-semibold text-[#303030]">
              <Mail className="w-4 h-4 text-[#FCBA00]" />
              Correo Electrónico
            </Label>
            <Input
              id="correo"
              type="email"
              value={formulario.correo}
              onChange={(e) => handleChange('correo', e.target.value.trim())}
              placeholder="juan@example.com"
              className="border-[#FCBA00]/20 focus:border-[#FCBA00] focus:ring-[#FCBA00]"
            />
            {formulario.correo && !formulario.correo.includes('@') && (
              <p className="text-xs text-amber-600">⚠️ El email debe contener @</p>
            )}
          </div>

          {/* Selector de Etiquetas */}
          <div className="space-y-3 bg-gradient-to-br from-[#FCBA00]/5 to-[#FCBA00]/0 border border-[#FCBA00]/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-4 bg-[#FCBA00] rounded-full"></div>
              <Label className="text-sm font-bold text-[#303030]">Etiquetas y programas</Label>
            </div>
            <SelectorEtiquetasCreacion
              etiquetasSeleccionadas={etiquetasSeleccionadas}
              onCambio={setEtiquetasSeleccionadas}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="telefono" className="flex items-center gap-2 text-sm font-semibold text-[#303030]">
                <Phone className="w-4 h-4 text-[#FCBA00]" />
                Teléfono
              </Label>
              <Input
                id="telefono"
                type="tel"
                value={formulario.telefono}
                onChange={(e) => handleChange('telefono', validarTelefono(e.target.value))}
                placeholder="+51 987 654 321"
                className="border-[#FCBA00]/20 focus:border-[#FCBA00] focus:ring-[#FCBA00]"
              />
            </div>

            {/* Sexo */}
            <div className="space-y-2">
              <Label htmlFor="sexo" className="flex items-center gap-2 text-sm font-semibold text-[#303030]">
                <User className="w-4 h-4 text-[#FCBA00]" />
                Sexo
              </Label>
              <Select
                value={formulario.sexo || ''}
                onValueChange={(value) => handleChange('sexo', value as Sexo)}
              >
                <SelectTrigger className="border-[#FCBA00]/20 focus:border-[#FCBA00] focus:ring-[#FCBA00]">
                  <SelectValue placeholder="Selecciona..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Sexo.MASCULINO}>Masculino</SelectItem>
                  <SelectItem value={Sexo.FEMENINO}>Femenino</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Fecha de Nacimiento */}
            <div className="space-y-2">
              <Label htmlFor="fechaNacimiento" className="flex items-center gap-2 text-sm font-semibold text-[#303030]">
                <Calendar className="w-4 h-4 text-[#FCBA00]" />
                Fecha de Nacimiento
                {edad !== null && <span className="text-xs text-muted-foreground ml-1">({edad} años)</span>}
              </Label>
              <Input
                id="fechaNacimiento"
                type="date"
                max={obtenerFechaMaxima()}
                value={formulario.fechaNacimiento}
                onChange={(e) => handleChange('fechaNacimiento', e.target.value)}
                className="border-[#FCBA00]/20 focus:border-[#FCBA00] focus:ring-[#FCBA00]"
              />
              {edad !== null && edad < 18 && (
                <p className="text-xs text-destructive font-semibold">⚠️ Debe ser mayor de 18 años</p>
              )}
            </div>
            {/* Departamento */}
            <div className="space-y-2">
              <Label htmlFor="departamento" className="flex items-center gap-2 text-sm font-semibold text-[#303030]">
                <MapPin className="w-4 h-4 text-[#FCBA00]" />
                Departamento
              </Label>
              <Select value={formulario.departamento} onValueChange={(v) => handleChange('departamento', v)}>
                <SelectTrigger id="departamento" className="border-[#FCBA00]/20 focus:border-[#FCBA00] focus:ring-[#FCBA00]">
                  <SelectValue placeholder="Selecciona..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Amazonas">Amazonas</SelectItem>
                  <SelectItem value="Áncash">Áncash</SelectItem>
                  <SelectItem value="Apurímac">Apurímac</SelectItem>
                  <SelectItem value="Arequipa">Arequipa</SelectItem>
                  <SelectItem value="Ayacucho">Ayacucho</SelectItem>
                  <SelectItem value="Cajamarca">Cajamarca</SelectItem>
                  <SelectItem value="Callao">Callao</SelectItem>
                  <SelectItem value="Cusco">Cusco</SelectItem>
                  <SelectItem value="Huancavelica">Huancavelica</SelectItem>
                  <SelectItem value="Huánuco">Huánuco</SelectItem>
                  <SelectItem value="Ica">Ica</SelectItem>
                  <SelectItem value="Junín">Junín</SelectItem>
                  <SelectItem value="La Libertad">La Libertad</SelectItem>
                  <SelectItem value="Lambayeque">Lambayeque</SelectItem>
                  <SelectItem value="Lima">Lima</SelectItem>
                  <SelectItem value="Loreto">Loreto</SelectItem>
                  <SelectItem value="Madre de Dios">Madre de Dios</SelectItem>
                  <SelectItem value="Moquegua">Moquegua</SelectItem>
                  <SelectItem value="Pasco">Pasco</SelectItem>
                  <SelectItem value="Piura">Piura</SelectItem>
                  <SelectItem value="Puno">Puno</SelectItem>
                  <SelectItem value="San Martín">San Martín</SelectItem>
                  <SelectItem value="Tacna">Tacna</SelectItem>
                  <SelectItem value="Tumbes">Tumbes</SelectItem>
                  <SelectItem value="Ucayali">Ucayali</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dirección */}
          <div className="space-y-2">
            <Label htmlFor="direccion" className="flex items-center gap-2 text-sm font-semibold text-[#303030]">
              <MapPin className="w-4 h-4 text-[#FCBA00]" />
              Dirección
            </Label>
            <Input
              id="direccion"
              value={formulario.direccion}
              onChange={(e) => handleChange('direccion', e.target.value)}
              placeholder="Av. Principal 123"
              className="border-[#FCBA00]/20 focus:border-[#FCBA00] focus:ring-[#FCBA00]"
            />
          </div>

          {/* Ciudad */}
          <div className="space-y-2">
            <Label htmlFor="ciudad" className="flex items-center gap-2 text-sm font-semibold text-[#303030]">
              <MapPin className="w-4 h-4 text-[#FCBA00]" />
              Ciudad
            </Label>
            <Input
              id="ciudad"
              value={formulario.ciudad}
              onChange={(e) => handleChange('ciudad', e.target.value)}
              placeholder="Lima"
              className="border-[#FCBA00]/20 focus:border-[#FCBA00] focus:ring-[#FCBA00]"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <div>{error}</div>
            </div>
          )}

          <DialogFooter className="border-t border-[#FCBA00]/20 pt-4 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCerrar}
              disabled={cargando}
              className="border-[#FCBA00]/30 hover:bg-[#FCBA00]/5"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={cargando || !esValido}
              className="bg-[#FCBA00] hover:bg-[#E5A200] text-[#303030] font-bold shadow-lg shadow-[#FCBA00]/20"
            >
              {cargando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  Crear {tipo === 'cliente' ? 'Cliente' : 'Lead'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
