"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout";
import CalendarView from "@/components/calendar/CalendarView";

export default function PaginaActividades() {
  const [autenticado, setAutenticado] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Actividades y Calendario"
        description="Gestiona tus reuniones y eventos sincronizados con Google Calendar"
      />
      
      <CalendarView onAuthChange={setAutenticado} />
    </div>
  );
}