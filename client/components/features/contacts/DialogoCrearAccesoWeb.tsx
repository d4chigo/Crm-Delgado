'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Globe, Copy, CheckCircle2, AlertCircle, Trash2, Eye, EyeOff, Lock, Unlock } from "lucide-react"
import type { Contacto } from "@/types/contacto.types"
import { useToast } from "@/hooks/use-toast"

interface DialogoCrearAccesoWebProps {
  contacto: Contacto | null
  abierto: boolean
  onCancelar: () => void
  onCreado?: () => void
}

interface AccesoWebResponse {
  exito: boolean
  mensaje: string
  datos?: {
    correo: string
    passwordTemporal: string
    urlPortal: string
  }
}

interface InfoAccesoResponse {
  exito: boolean
  datos?: {
    activo: boolean
    creadoEn: string
    actualizadoEn: string
  }
}

export function DialogoCrearAccesoWeb({
  contacto,
  abierto,
  onCancelar,
  onCreado
}: DialogoCrearAccesoWebProps) {
  const [estaCargando, setEstaCargando] = useState(false)
  const [verificandoAcceso, setVerificandoAcceso] = useState(false)
  const [tieneAcceso, setTieneAcceso] = useState(false)
  const [accesoActivo, setAccesoActivo] = useState(true)
  const [mostraContraseña, setMostraContraseña] = useState(false)
  const [acceso, setAcceso] = useState<AccesoWebResponse['datos'] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (abierto && contacto) {
      verificarAccesoExistente()
    } else {
      setTieneAcceso(false)
      setAcceso(null)
      setError(null)
      setMostraContraseña(false)
    }
  }, [abierto, contacto?.id])

  const verificarAccesoExistente = async () => {
    if (!contacto) return

    setVerificandoAcceso(true)
    setError(null)
    console.log(`🔍 Verificando acceso para contacto: ${contacto.id}`)
    
    try {
      const token = localStorage.getItem('crm_token') || localStorage.getItem('token')
      
      if (!token) {
        console.log('❌ No hay token disponible')
        setVerificandoAcceso(false)
        return
      }

      // Llamar al endpoint que devuelve tieneAcceso
      const response = await fetch(`http://localhost:5000/api/contactos/${contacto.id}/acceso-web`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log(`📡 Response status: ${response.status}`)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Datos de acceso:', data)
        
        // Este endpoint devuelve { exito, tieneAcceso, datos }
        if (data.tieneAcceso) {
          setTieneAcceso(true)
          if (data.datos?.activo !== undefined) {
            setAccesoActivo(data.datos.activo)
          }
        } else {
          setTieneAcceso(false)
        }
      } else {
        console.log('❌ Response no OK, status:', response.status)
        setTieneAcceso(false)
      }
    } catch (err) {
      console.error('❌ Error al verificar acceso:', err)
      setTieneAcceso(false)
    } finally {
      setVerificandoAcceso(false)
    }
  }

  const handleEliminarAcceso = async () => {
    if (!contacto) return

    setEstaCargando(true)
    setError(null)

    try {
      const token = localStorage.getItem('crm_token') || localStorage.getItem('token')
      
      if (!token) {
        throw new Error('No hay sesión activa.')
      }

      const response = await fetch(`http://localhost:5000/api/contactos/${contacto.id}/acceso-web`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al eliminar el acceso web')
      }

      toast({
        title: "✅ Acceso eliminado",
        description: "El acceso web ha sido eliminado correctamente",
      })

      setTieneAcceso(false)
      onCreado?.()
      onCancelar()
    } catch (err: any) {
      console.error('Error al eliminar acceso:', err)
      setError(err.message || 'Error desconocido')
      toast({
        title: "❌ Error",
        description: err.message || "No se pudo eliminar el acceso web",
        variant: "destructive",
      })
    } finally {
      setEstaCargando(false)
    }
  }

  const handleToggleAcceso = async () => {
    if (!contacto) return

    setEstaCargando(true)
    setError(null)
    setAcceso(null)

    try {
      const token = localStorage.getItem('crm_token') || localStorage.getItem('token')
      
      if (!token) {
        throw new Error('No hay sesión activa.')
      }

      const response = await fetch(`http://localhost:5000/api/contactos/${contacto.id}/acceso-web/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ activo: !accesoActivo })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.mensaje || 'Error al cambiar estado')
      }

      setAccesoActivo(data.datos.activo)
      toast({
        title: "✅ Estado actualizado",
        description: `Acceso web ${data.datos.activo ? 'activado' : 'desactivado'} correctamente`,
      })
    } catch (err: any) {
      console.error('Error al toggle acceso:', err)
      setError(err.message || 'Error desconocido')
      toast({
        title: "❌ Error",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setEstaCargando(false)
    }
  }

  const handleCrearAcceso = async () => {
    if (!contacto) return

    setEstaCargando(true)
    setError(null)
    setAcceso(null)

    try {
      const token = localStorage.getItem('crm_token') || localStorage.getItem('token')
      
      if (!token) {
        throw new Error('No hay sesión activa. Por favor, inicie sesión nuevamente.')
      }

      const response = await fetch(`http://localhost:5000/api/contactos/${contacto.id}/crear-acceso-web`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const data: AccesoWebResponse = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.')
        }
        if (response.status === 400) {
          // El cliente ya tiene acceso
          await verificarAccesoExistente()
          return
        }
        throw new Error(data.mensaje || 'Error al crear acceso web')
      }

      // Mostrar credenciales generadas
      setAcceso(data.datos || null)
      setTieneAcceso(true)
      setAccesoActivo(true)
      toast({
        title: "✅ Acceso web creado",
        description: "Se han generado las credenciales del cliente",
      })

      onCreado?.()
    } catch (err: any) {
      console.error('Error al crear acceso web:', err)
      setError(err.message || 'Error desconocido')
      toast({
        title: "❌ Error",
        description: err.message || "No se pudo crear el acceso web",
        variant: "destructive",
      })
    } finally {
      setEstaCargando(false)
    }
  }

  const handleResetearContraseña = async () => {
    if (!contacto) return

    setEstaCargando(true)
    setError(null)

    try {
      const token = localStorage.getItem('crm_token') || localStorage.getItem('token')
      
      if (!token) {
        throw new Error('No hay sesión activa.')
      }

      const response = await fetch(`http://localhost:5000/api/contactos/${contacto.id}/resetear-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const data: AccesoWebResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.mensaje || 'Error al resetear contraseña')
      }

      // Mostrar las nuevas credenciales
      setAcceso(data.datos || null)
      setMostraContraseña(true)
      toast({
        title: "✅ Contraseña reseteada",
        description: "Se ha generado una nueva contraseña temporal",
      })
    } catch (err: any) {
      console.error('Error al resetear password:', err)
      setError(err.message || 'Error desconocido')
      toast({
        title: "❌ Error",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setEstaCargando(false)
    }
  }

  const handleCopiarCredenciales = () => {
    if (!acceso) return

    const texto = `Portal Web - Credenciales de Acceso\n\nCliente: ${contacto?.nombre} ${contacto?.apellido}\nURL: ${acceso.urlPortal}\nCorreo: ${acceso.correo}\nContraseña: ${acceso.passwordTemporal}\n\nPor favor, cambie su contraseña después del primer inicio de sesión.`

    navigator.clipboard.writeText(texto)
    setCopiado(true)
    toast({
      title: "✅ Copiado",
      description: "Las credenciales se copiaron al portapapeles",
    })

    setTimeout(() => setCopiado(false), 2000)
  }

  const handleCerrar = () => {
    setAcceso(null)
    setError(null)
    setCopiado(false)
    setMostraContraseña(false)
    // Solo cierra el modal si no tiene acceso. Si tiene acceso, vuelve a la vista de gestión
    if (!tieneAcceso) {
      onCancelar()
    }
  }

  if (!contacto) return null

  return (
    <Dialog open={abierto} onOpenChange={handleCerrar}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Globe className="h-6 w-6 text-[#FCBA00]" />
            {tieneAcceso ? 'Gestionar Acceso Web' : 'Crear Acceso Web'}
          </DialogTitle>
        </DialogHeader>

        {verificandoAcceso && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#FCBA00] mb-3" />
            <p className="text-sm text-muted-foreground">Verificando acceso...</p>
          </div>
        )}

        {!verificandoAcceso && (
          <div className={`space-y-4 ${tieneAcceso && !acceso ? 'max-h-none' : 'max-h-[400px] overflow-y-auto'}`}>
            {/* Info del contacto - más compacta cuando se gestiona acceso */}
            <div className={`${tieneAcceso && !acceso ? 'bg-slate-50 rounded-lg p-3 space-y-1' : 'bg-slate-100 rounded-lg p-4 space-y-2'}`}>
              <div className="flex justify-between">
                <span className={`font-semibold text-slate-600 ${tieneAcceso && !acceso ? 'text-xs' : 'text-sm'}`}>Nombre:</span>
                <span className={`text-slate-900 ${tieneAcceso && !acceso ? 'text-xs' : 'text-sm'}`}>{contacto.nombre} {contacto.apellido}</span>
              </div>
              <div className="flex justify-between">
                <span className={`font-semibold text-slate-600 ${tieneAcceso && !acceso ? 'text-xs' : 'text-sm'}`}>Correo:</span>
                <span className={`text-[#FCBA00] font-mono ${tieneAcceso && !acceso ? 'text-xs' : 'text-sm'}`}>{contacto.correo}</span>
              </div>
              {contacto.telefono && (
                <div className="flex justify-between">
                  <span className={`font-semibold text-slate-600 ${tieneAcceso && !acceso ? 'text-xs' : 'text-sm'}`}>Teléfono:</span>
                  <span className={`text-slate-900 ${tieneAcceso && !acceso ? 'text-xs' : 'text-sm'}`}>{contacto.telefono}</span>
                </div>
              )}
            </div>

            {/* Si tiene acceso, mostrar estado - solo si NO está mostrando credenciales */}
            {tieneAcceso && !acceso && (
              <div className={`rounded-lg p-4 border-2 ${accesoActivo ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {accesoActivo ? (
                      <>
                        <Unlock className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-green-700">Acceso Activo ✓</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-5 w-5 text-red-600" />
                        <span className="font-semibold text-red-700">Acceso Desactivado</span>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  {accesoActivo 
                    ? 'El cliente puede acceder al portal web' 
                    : 'El cliente no puede acceder en este momento'
                  }
                </p>
                <Button
                  size="sm"
                  onClick={handleToggleAcceso}
                  disabled={estaCargando}
                  className={accesoActivo ? 'bg-red-500 hover:bg-red-600 w-full' : 'bg-green-500 hover:bg-green-600 w-full'}
                >
                  {estaCargando ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : accesoActivo ? (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Desactivar Acceso
                    </>
                  ) : (
                    <>
                      <Unlock className="h-4 w-4 mr-2" />
                      Activar Acceso
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Nota: "Credenciales generadas después de reset" - solo se muestra después de hacer reset */}
            {tieneAcceso && acceso && (
              <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-300">
                <div className="flex items-center gap-2 text-blue-700 font-semibold mb-3">
                  <AlertCircle className="h-5 w-5" />
                  Nueva Contraseña Generada
                </div>
                <p className="text-xs text-blue-600 mb-3">
                  Se ha generado una nueva contraseña temporal para el cliente.
                </p>
              </div>
            )}

            {/* Credenciales mostradas */}
            {acceso && (
              <div className="bg-green-50 rounded-lg p-3 border-2 border-green-300 space-y-2">
                <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  Credenciales Generadas
                </div>

                <div className="space-y-2 bg-white rounded p-2 border border-green-200">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">URL del Portal:</label>
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded mt-1 border border-slate-200">
                      <code className="text-xs text-[#FCBA00]">{acceso.urlPortal}</code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(acceso.urlPortal)
                          toast({ title: "✅ Copiado" })
                        }}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600">Correo:</label>
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded mt-1 border border-slate-200">
                      <code className="text-xs">{acceso.correo}</code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(acceso.correo)
                          toast({ title: "✅ Copiado" })
                        }}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-600">Contraseña:</label>
                      <button
                        onClick={() => setMostraContraseña(!mostraContraseña)}
                        className="text-xs text-[#FCBA00] hover:text-[#e0a800] flex items-center gap-1"
                      >
                        {mostraContraseña ? (
                          <>
                            <EyeOff className="h-3 w-3" />
                            Ocultar
                          </>
                        ) : (
                          <>
                            <Eye className="h-3 w-3" />
                            Ver
                          </>
                        )}
                      </button>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded mt-1 border border-slate-200">
                      <code className={`text-xs ${mostraContraseña ? 'text-[#FCBA00]' : 'text-slate-400'}`}>
                        {mostraContraseña ? acceso.passwordTemporal : '••••••••••'}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(acceso.passwordTemporal)
                          toast({ title: "✅ Copiado" })
                        }}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={handleCopiarCredenciales}
                  className="w-full bg-[#FCBA00] hover:bg-[#e0a800] text-[#303030] font-semibold"
                >
                  {copiado ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      ¡Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar Todas
                    </>
                  )}
                </Button>

                <Alert className="border-amber-300 bg-amber-50 py-2">
                  <AlertCircle className="h-3 w-3 text-amber-600" />
                  <AlertDescription className="text-xs text-amber-800 ml-1">
                    Envíe estas credenciales por un medio seguro.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Error */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <DialogFooter className="flex flex-col gap-2 mt-4">
          {acceso ? (
            // Mostrando credenciales después de crear o resetear
            <>
              <Button 
                variant="outline"
                onClick={() => setAcceso(null)} 
                className="flex-1"
              >
                Volver a Gestión
              </Button>
              <Button 
                onClick={() => setAcceso(null)} 
                className="flex-1 bg-[#FCBA00] hover:bg-[#e0a800] text-[#303030] font-semibold"
              >
                ✓ Listo, Enviaré al Cliente
              </Button>
            </>
          ) : tieneAcceso ? (
            // Gestión de acceso existente
            <div className="flex flex-col gap-2 w-full">
              <div className="flex gap-2">
                <Button variant="outline" onClick={onCancelar} disabled={estaCargando} className="flex-1">
                  Cerrar
                </Button>
                <Button
                  onClick={handleResetearContraseña}
                  disabled={estaCargando}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {estaCargando ? <Loader2 className="h-4 w-4 animate-spin" /> : '🔄 Resetear'}
                </Button>
              </div>
              <Button
                onClick={handleEliminarAcceso}
                disabled={estaCargando}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                {estaCargando ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <><Trash2 className="h-4 w-4 mr-2" />Eliminar Acceso Web</>}
              </Button>
            </div>
          ) : (
            // Sin acceso - opción de crear
            <>
              <Button variant="outline" onClick={handleCerrar} disabled={estaCargando} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={handleCrearAcceso}
                disabled={estaCargando}
                className="flex-1 bg-[#FCBA00] hover:bg-[#e0a800] text-[#303030] font-semibold"
              >
                {estaCargando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4 mr-2" />
                    Crear Acceso
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
