'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Globe, Copy, CheckCircle2, AlertCircle, Trash2, XCircle } from "lucide-react"
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

interface VerificarAccesoResponse {
  exito: boolean
  tieneAcceso: boolean
  datos?: {
    creadoEn: string
    correo: string
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
  const [acceso, setAcceso] = useState<AccesoWebResponse['datos'] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)
  const { toast } = useToast()

  // Verificar si ya tiene acceso web cuando se abre el diálogo
  useEffect(() => {
    if (abierto && contacto) {
      verificarAccesoExistente()
    } else {
      // Resetear estado al cerrar
      setTieneAcceso(false)
      setAcceso(null)
      setError(null)
    }
  }, [abierto, contacto])

  const verificarAccesoExistente = async () => {
    if (!contacto) return

    setVerificandoAcceso(true)
    try {
      const token = localStorage.getItem('crm_token') || localStorage.getItem('token')
      
      if (!token) {
        return
      }

      const response = await fetch(`http://localhost:5000/api/contactos/${contacto.id}/acceso-web`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data: VerificarAccesoResponse = await response.json()
        setTieneAcceso(data.tieneAcceso)
      }
    } catch (err) {
      console.error('Error al verificar acceso:', err)
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

  const handleCrearAcceso = async () => {
    if (!contacto) return

    setEstaCargando(true)
    setError(null)
    setAcceso(null)

    try {
      // Intentar obtener el token con ambos nombres (compatibilidad)
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
          throw new Error('Este cliente ya tiene acceso web creado. Use la opción "Resetear Contraseña" si desea generar una nueva.')
        }
        throw new Error(data.mensaje || 'Error al crear acceso web')
      }

      setAcceso(data.datos || null)
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

  const handleCopiarCredenciales = () => {
    if (!acceso) return

    const texto = `Portal Web - Credenciales de Acceso

Cliente: ${contacto?.nombre} ${contacto?.apellido}
URL: ${acceso.urlPortal}
Correo: ${acceso.correo}
Contraseña: ${acceso.passwordTemporal}

Por favor, cambie su contraseña después del primer inicio de sesión.`

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
    onCancelar()
  }

  if (!contacto) return null

  return (
    <Dialog open={abierto} onOpenChange={handleCerrar}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-[#FCBA00]" />
            {tieneAcceso ? 'Gestionar Acceso Web' : 'Crear Acceso Web'}
          </DialogTitle>
          <DialogDescription>
            {tieneAcceso 
              ? `${contacto.nombre} ${contacto.apellido} ya tiene acceso al portal web`
              : `Generar credenciales para que ${contacto.nombre} ${contacto.apellido} pueda acceder al portal web`
            }
          </DialogDescription>
        </DialogHeader>

        {verificandoAcceso && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#FCBA00]" />
          </div>
        )}

        {!verificandoAcceso && (
          <>
            {/* Información del contacto */}
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Nombre:</span>
                <span className="text-sm font-medium">{contacto.nombre} {contacto.apellido}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Correo:</span>
                <span className="text-sm font-medium">{contacto.correo}</span>
              </div>
              {contacto.telefono && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Teléfono:</span>
                  <span className="text-sm font-medium">{contacto.telefono}</span>
                </div>
              )}
            </div>

            {/* Si ya tiene acceso, mostrar alerta */}
            {tieneAcceso && !acceso && (
              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  <p className="text-sm font-semibold text-blue-800">
                    Este cliente ya tiene acceso web activo
                  </p>
                  <p className="text-xs text-blue-700 mt-2">
                    Puede eliminar el acceso actual si es necesario. Para generar una nueva contraseña, use la opción "Resetear Contraseña".
                  </p>
                </AlertDescription>
              </Alert>
            )}

        {/* Credenciales generadas */}
        {acceso && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-green-800">
                  ¡Credenciales generadas exitosamente!
                </p>
                
                <div className="bg-white rounded-md p-3 space-y-2 border border-green-200">
                  <div>
                    <p className="text-xs text-muted-foreground">URL del portal:</p>
                    <p className="text-sm font-mono font-medium break-all">{acceso.urlPortal}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Correo:</p>
                    <p className="text-sm font-mono font-medium">{acceso.correo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Contraseña temporal:</p>
                    <p className="text-sm font-mono font-medium text-[#FCBA00]">{acceso.passwordTemporal}</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopiarCredenciales}
                  className="w-full"
                >
                  {copiado ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      ¡Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar credenciales
                    </>
                  )}
                </Button>

                <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                  ⚠️ Envíe estas credenciales al cliente por un medio seguro. Se recomienda que cambie su contraseña después del primer inicio de sesión.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

            {/* Error */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              {acceso ? (
                <Button onClick={handleCerrar} className="w-full">
                  Cerrar
                </Button>
              ) : tieneAcceso ? (
                <div className="flex gap-2 w-full">
                  <Button variant="outline" onClick={handleCerrar} disabled={estaCargando} className="flex-1">
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleEliminarAcceso}
                    disabled={estaCargando}
                    variant="destructive"
                    className="flex-1"
                  >
                    {estaCargando ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Eliminando...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar Acceso
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <>
                  <Button variant="outline" onClick={handleCerrar} disabled={estaCargando}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCrearAcceso}
                    disabled={estaCargando}
                    className="bg-[#FCBA00] hover:bg-[#e0a800] text-[#303030]"
                  >
                    {estaCargando ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creando acceso...
                      </>
                    ) : (
                      <>
                        <Globe className="h-4 w-4 mr-2" />
                        Crear Acceso Web
                      </>
                    )}
                  </Button>
                </>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
