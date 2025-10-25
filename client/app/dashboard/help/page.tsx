"use client";

export default function PaginaAyuda() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#303030]">Centro de Ayuda</h1>
        <p className="text-muted-foreground">Guías rápidas para tareas frecuentes en el CRM.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="border rounded-lg p-5 bg-background">
          <h2 className="text-lg font-semibold text-[#303030] mb-2">Crear una cotización</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>Ve a <strong>Contactos</strong> y selecciona un cliente.</li>
            <li>Haz clic en <strong>Crear Cotización</strong>.</li>
            <li>Completa datos del inmueble, financiamiento y opciones.</li>
            <li>Guarda y comparte con el cliente.</li>
          </ol>
        </section>

        <section className="border rounded-lg p-5 bg-background">
          <h2 className="text-lg font-semibold text-[#303030] mb-2">Importar contactos</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>Ve a <strong>Contactos</strong> y elige <strong>Importar</strong>.</li>
            <li>Descarga la plantilla CSV y complétala.</li>
            <li>Sube el archivo y valida las columnas.</li>
            <li>Confirma la importación.</li>
          </ol>
        </section>

        <section className="border rounded-lg p-5 bg-background">
          <h2 className="text-lg font-semibold text-[#303030] mb-2">Convertir lead a cliente</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>Ve a <strong>Leads</strong> y abre el lead.</li>
            <li>Actualiza el <strong>Estado</strong> a <strong>GANADO</strong> o usa <strong>Convertir</strong>.</li>
            <li>Completa la información faltante y guarda.</li>
          </ol>
        </section>

        <section className="border rounded-lg p-5 bg-background">
          <h2 className="text-lg font-semibold text-[#303030] mb-2">Conectar Google Calendar</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>Ve a <strong>Actividades</strong> y haz clic en <strong>Conectar con Google Calendar</strong>.</li>
            <li>Inicia sesión con tu cuenta de Google.</li>
            <li>Autoriza el acceso a tu calendario.</li>
            <li>¡Tus eventos aparecerán automáticamente!</li>
          </ol>
        </section>

        <section className="border rounded-lg p-5 bg-background">
          <h2 className="text-lg font-semibold text-[#303030] mb-2">Gestionar Actividades</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>Navega por meses con los botones <strong>‹</strong> y <strong>›</strong>.</li>
            <li>Haz clic en eventos para programar recordatorios.</li>
            <li>Configura notificaciones (5, 10, 15 o 30 minutos antes).</li>
            <li>Usa <strong>Sync</strong> para actualizar eventos.</li>
          </ol>
        </section>

        <section className="border rounded-lg p-5 bg-background">
          <h2 className="text-lg font-semibold text-[#303030] mb-2">Consejos</h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Usa etiquetas para segmentar contactos y proyectos.</li>
            <li>Mantén actualizada la etapa de oportunidades.</li>
            <li>Consulta <strong>Reportes</strong> y el <strong>Asistente</strong> para insights.</li>
            <li>Sincroniza tu calendario para no perder citas importantes.</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
