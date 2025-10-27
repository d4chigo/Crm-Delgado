"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PaginaAyuda() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/reports");
  }, [router]);
  return (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
      Redirigiendo a Reportes...
    </div>
  );
}
