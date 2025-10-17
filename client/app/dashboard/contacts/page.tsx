"use client"

import { useState, useEffect } from "react"
import { useContactos } from "@/hooks/useContactos"
import { FormularioContacto } from "@/components/features/contacts/FormularioContacto";
import { ContactCard } from "@/components/features/contacts/ContactCard";
import { DialogoEditarContacto } from "@/components/features/contacts/DialogoEditarContacto"
import { DialogoEliminarContacto } from "@/components/features/contacts/DialogoEliminarContacto"
import { DialogoImportarGoogle } from "@/components/features/contacts/DialogoImportarGoogle";
import { PageHeader } from "@/components/layout";
import googleAuthService from "@/services/api/google-auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Plus, Search, Users, UserPlus, UserCheck, Loader2, Edit, Trash2, ArrowRightCircle, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { TipoContacto, type Contacto } from "@/types/contacto.types"

export default function PaginaContactos() {
  const {
    contactos,
    estadisticas,
    estaCargando,
    error,
    paginacion,
    buscarContactos,
    crearContacto,
    actualizarContacto,
    eliminarContacto,
    convertirALead,
    convertirVariosALeads,
    cargarContactos,
    iniciarImportacionGoogle,
    completarImportacionGoogle,
    cambiarPagina,
    filtrarPorTipo,
  } = useContactos()

  const { toast } = useToast()
  const [busqueda, setBusqueda] = useState("")
  const [contactoEditando, setContactoEditando] = useState<Contacto | null>(null)
  const [contactoEliminando, setContactoEliminando] = useState<Contacto | null>(null)
  const [contactosSeleccionados, setContactosSeleccionados] = useState<string[]>([])
  const [convirtiendoALeads, setConvirtiendoALeads] = useState(false)
  const [resultadoImportacion, setResultadoImportacion] = useState<{
    importados: number
    duplicados: number
    errores: number
  } | null>(null)

  // NO filtrar en el frontend - el backend ya envía solo contactos tipo CONTACTO
  const contactosFiltrados = contactos

  // Cargar contactos con filtro CONTACTO al montar el componente
  useEffect(() => {
    console.log('🎯 Cargando contactos iniciales con filtro: solo CONTACTO')
    cargarContactos({ tipo: TipoContacto.CONTACTO, pagina: 1, limite: 6 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Verificar si hay un callback de Google al cargar la página
  useEffect(() => {
    const procesarCallbackGoogle = async () => {
      // Verificar si hay un error en el callback
      const error = googleAuthService.getErrorFromCallback()
      if (error) {
        toast({
          title: "Error al importar",
          description: googleAuthService.getErrorMessage(error.error) + (error.message ? `: ${error.message}` : ''),
          variant: "destructive",
        })
        googleAuthService.clearPendingImport()
        return
      }

      // Verificar si hay un token en el callback y una importación pendiente
      const token = googleAuthService.getTokenFromCallback()
      if (token && googleAuthService.isPendingImport()) {
        try {
          console.log('📥 Completando importación de Google con token recibido...')
          const resultado = await completarImportacionGoogle(token)
          setResultadoImportacion(resultado)
          toast({
            title: "✅ Importación completada",
            description: `Se importaron ${resultado.importados} contactos correctamente`,
          })
        } catch (err: any) {
          toast({
            title: "Error al importar",
            description: err.message || "No se pudieron importar los contactos",
            variant: "destructive",
          })
        }
      }
    }

    procesarCallbackGoogle()
  }, [completarImportacionGoogle, toast])

  // Efecto para buscar con delay (debounce) - solo después del montaje inicial
  useEffect(() => {
    // No ejecutar en el montaje inicial (cuando busqueda está vacía)
    if (busqueda === '') return
    
    const timer = setTimeout(() => {
      buscarContactos(busqueda)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [busqueda, buscarContactos])

  const handleBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value)
  }

  const handleConfirmarEliminar = async () => {
    if (!contactoEliminando) return
    
    try {
      await eliminarContacto(contactoEliminando.id)
      setContactoEliminando(null)
      toast({
        title: "✅ Contacto eliminado",
        description: "El contacto se eliminó correctamente",
      })
    } catch (error) {
      console.error('Error al eliminar contacto:', error)
      toast({
        title: "❌ Error",
        description: "No se pudo eliminar el contacto",
        variant: "destructive",
      })
    }
  }

  const handleConvertirALead = async (contacto: Contacto) => {
    try {
      await convertirALead(contacto.id)
      toast({
        title: "✅ Convertido a Lead",
        description: `${contacto.nombre} ${contacto.apellido} ahora es un lead`,
      })
    } catch (error) {
      console.error('Error al convertir contacto:', error)
      toast({
        title: "❌ Error",
        description: "No se pudo convertir el contacto a lead",
        variant: "destructive",
      })
    }
  }

  const handleSeleccionarContacto = (contactoId: string) => {
    setContactosSeleccionados(prev => {
      if (prev.includes(contactoId)) {
        return prev.filter(id => id !== contactoId)
      } else {
        return [...prev, contactoId]
      }
    })
  }

  const handleSeleccionarTodos = () => {
    if (contactosSeleccionados.length === contactosFiltrados.length) {
      setContactosSeleccionados([])
    } else {
      setContactosSeleccionados(contactosFiltrados.map(c => c.id))
    }
  }

  const handleConvertirVariosALeads = async () => {
    if (contactosSeleccionados.length === 0) return
    
    setConvirtiendoALeads(true)
    try {
      const resultado = await convertirVariosALeads(contactosSeleccionados)
      setContactosSeleccionados([])
      toast({
        title: "✅ Conversión exitosa",
        description: `${resultado.convertidos} de ${resultado.total} contacto(s) convertido(s) a leads`,
      })
    } catch (error) {
      console.error('Error al convertir contactos:', error)
      toast({
        title: "❌ Error",
        description: "No se pudieron convertir los contactos a leads",
        variant: "destructive",
      })
    } finally {
      setConvirtiendoALeads(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contactos"
        description="Gestiona tus contactos y conviértelos en leads"
      >
        <DialogoImportarGoogle onImportar={iniciarImportacionGoogle} />
        <FormularioContacto onCrear={crearContacto} />
      </PageHeader>

      {/* Resultado de importación */}
      {resultadoImportacion && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>¡Importación completada!</strong>
            <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Importados:</span>
                <span className="ml-2 font-semibold text-green-600">{resultadoImportacion.importados}</span>
              </div>
              {resultadoImportacion.duplicados > 0 && (
                <div>
                  <span className="text-muted-foreground">Duplicados:</span>
                  <span className="ml-2 font-semibold text-amber-600">{resultadoImportacion.duplicados}</span>
                </div>
              )}
              {resultadoImportacion.errores > 0 && (
                <div>
                  <span className="text-muted-foreground">Errores:</span>
                  <span className="ml-2 font-semibold text-red-600">{resultadoImportacion.errores}</span>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => setResultadoImportacion(null)}
            >
              Cerrar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            title="Total de Registros"
            value={estadisticas.total}
            description="Todos los contactos registrados"
            icon={Users}
          />
          <StatCard
            title="Solo Contactos"
            value={estadisticas.totalContactos}
            description="Sin convertir a leads"
            icon={Users}
            iconColor="text-blue-500"
            valueColor="text-blue-600"
          />
        </div>
      )}

      {/* Barra de búsqueda y acciones */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, apellido o correo..."
            value={busqueda}
            onChange={handleBusqueda}
            className="pl-9"
          />
        </div>
        
        {/* Acciones masivas */}
        {contactosSeleccionados.length > 0 && (
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground">
              {contactosSeleccionados.length} seleccionado(s)
            </span>
            <Button
              onClick={handleConvertirVariosALeads}
              disabled={convirtiendoALeads}
              size="sm"
              className="bg-[#FCBA00] hover:bg-[#e0a800] text-[#303030]"
            >
              {convirtiendoALeads ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Convirtiendo...
                </>
              ) : (
                <>
                  <ArrowRightCircle className="h-4 w-4 mr-2" />
                  Convertir a Leads
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Seleccionar todos */}
      {contactosFiltrados.length > 0 && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="seleccionar-todos"
            checked={contactosSeleccionados.length === contactosFiltrados.length}
            onCheckedChange={handleSeleccionarTodos}
          />
          <label
            htmlFor="seleccionar-todos"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Seleccionar todos ({contactosFiltrados.length})
          </label>
        </div>
      )}

      {/* Estado de carga */}
      {estaCargando && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#FCBA00]" />
        </div>
      )}

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Lista de contactos */}
      {!estaCargando && contactosFiltrados.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contactosFiltrados.map((contacto) => (
              <ContactCard
                key={contacto.id}
                contacto={contacto}
                isSelected={contactosSeleccionados.includes(contacto.id)}
                onSeleccionar={handleSeleccionarContacto}
                onConvertir={handleConvertirALead}
                onEditar={setContactoEditando}
                onEliminar={setContactoEliminando}
              />
            ))}
          </div>

          {/* Paginación */}
          {paginacion.totalPaginas > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Mostrando {contactosFiltrados.length} de {paginacion.total} contactos
              </p>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cambiarPagina(paginacion.pagina - 1)}
                  disabled={paginacion.pagina === 1 || estaCargando}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                
                <span className="text-sm text-muted-foreground px-4">
                  Página {paginacion.pagina} de {paginacion.totalPaginas}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cambiarPagina(paginacion.pagina + 1)}
                  disabled={paginacion.pagina === paginacion.totalPaginas || estaCargando}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Estado vacío */}
      {!estaCargando && contactosFiltrados.length === 0 && !error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay contactos</h3>
            <p className="text-muted-foreground text-center mb-4">
              {busqueda 
                ? "No se encontraron contactos con ese criterio de búsqueda"
                : "Comienza agregando tu primer contacto para gestionar tus relaciones"}
            </p>
            <FormularioContacto onCrear={crearContacto} />
          </CardContent>
        </Card>
      )}

      {/* Diálogos */}
      <DialogoEditarContacto
        contacto={contactoEditando}
        abierto={!!contactoEditando}
        onActualizar={actualizarContacto}
        onCancelar={() => setContactoEditando(null)}
        onRecargar={cargarContactos}
      />

      <DialogoEliminarContacto
        contacto={contactoEliminando}
        abierto={!!contactoEliminando}
        onConfirmar={handleConfirmarEliminar}
        onCancelar={() => setContactoEliminando(null)}
      />
    </div>
  )
}
