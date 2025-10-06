"use client"

import { useContactos } from "@/hooks/useContactos"
import {
  TarjetaContacto,
  FormularioContacto,
  DialogoImportarContacto,
  EstadisticasContacto,
  BarraBusquedaContacto,
  EstadoVacioContacto,
} from "@/components/features/contacts"

export default function PaginaContactos() {
  const {
    contactos,
    contactosFiltrados,
    consultaBusqueda,
    setConsultaBusqueda,
    contactosSeleccionados,
    crearContacto,
    importarDesdeGoogle,
    alternarSeleccionContacto,
    convertirALeads,
  } = useContactos()

  const manejarConversionALeads = () => {
    const exitoso = convertirALeads()
    if (exitoso) {
      alert(`${contactosSeleccionados.length} contacto(s) convertido(s) a Leads exitosamente`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#303030]">Contactos</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus contactos e impórtalos desde Google
          </p>
        </div>
        <div className="flex gap-3">
          <DialogoImportarContacto alImportar={importarDesdeGoogle} />
          <FormularioContacto alEnviar={crearContacto} />
        </div>
      </div>

      {/* Estadísticas */}
      <EstadisticasContacto
        total={contactos.length}
        desdeGoogle={contactos.filter((c) => c.fuente === "google").length}
        seleccionados={contactosSeleccionados.length}
      />

      {/* Búsqueda y Acciones */}
      <BarraBusquedaContacto
        consulta={consultaBusqueda}
        alCambiarBusqueda={setConsultaBusqueda}
        cantidadSeleccionados={contactosSeleccionados.length}
        alConvertirALeads={manejarConversionALeads}
      />

      {/* Cuadrícula de Contactos */}
      {contactosFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contactosFiltrados.map((contacto) => (
            <TarjetaContacto
              key={contacto.id}
              contacto={contacto}
              estaSeleccionado={contactosSeleccionados.includes(contacto.id)}
              alAlternarSeleccion={alternarSeleccionContacto}
            />
          ))}
        </div>
      ) : (
        <EstadoVacioContacto tieneConsulta={!!consultaBusqueda} />
      )}
    </div>
  )
}
