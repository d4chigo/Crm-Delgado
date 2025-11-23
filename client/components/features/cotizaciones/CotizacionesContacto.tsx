'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCotizaciones } from '@/hooks/useCotizaciones';
import { 
  ListaCotizaciones, 
  FormularioCotizacion, 
  DetalleCotizacion 
} from '@/components/features/cotizaciones';
import type { Cotizacion, EstadoCotizacion } from '@/types/cotizacion.types';

interface CotizacionesContactoProps {
  contactoId: string;
  leadId?: string;
  clienteId?: string;
  nombreContacto: string;
  tipoContacto?: 'LEAD' | 'CLIENTE';
  abrirFormularioPorDefecto?: boolean;
}

export const CotizacionesContacto = ({
  contactoId,
  leadId,
  clienteId,
  nombreContacto,
  tipoContacto,
  abrirFormularioPorDefecto = false
}: CotizacionesContactoProps) => {
  const {
    cotizaciones,
    cotizacionActual,
    loading,
    error,
    cargarPorContacto,
    crear,
    actualizar,
    cambiarEstado,
    eliminar,
    setCotizacionActual,
    limpiarError
  } = useCotizaciones();

  const [modalFormulario, setModalFormulario] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [cotizacionEditando, setCotizacionEditando] = useState<Cotizacion | null>(null);

  // Cargar cotizaciones al montar el componente
  useEffect(() => {
    if (contactoId) {
      cargarPorContacto(contactoId);
    }
  }, [contactoId, cargarPorContacto]);

  // Abrir formulario por defecto si se indica
  useEffect(() => {
    if (abrirFormularioPorDefecto) {
      handleNueva();
    }
  }, [abrirFormularioPorDefecto]);

  // Si hay un borrador guardado para este contacto, abrir el formulario automáticamente
  useEffect(() => {
    try {
      const key = `cotizacion_draft_${contactoId}`;
      const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      if (raw && !modalFormulario) {
        setCotizacionEditando(null);
        setModalFormulario(true);
      }
    } catch {}
  }, [contactoId]);

  const handleNueva = () => {
    setCotizacionEditando(null);
    setModalFormulario(true);
  };

  const handleEditar = (cotizacion: Cotizacion) => {
    setCotizacionEditando(cotizacion);
    setModalFormulario(true);
  };

  const handleVerDetalle = (cotizacion: Cotizacion) => {
    setCotizacionActual(cotizacion);
    setModalDetalle(true);
  };

  const handleGuardar = async (datos: any) => {
    try {
      if (cotizacionEditando) {
        const actualizada = await actualizar(cotizacionEditando.id, datos);
        setModalFormulario(false);
        setCotizacionEditando(null);
        // Abrir detalle actualizado
        setCotizacionActual(actualizada);
        setModalDetalle(true);
      } else {
        const nueva = await crear(datos);
        setModalFormulario(false);
        setCotizacionEditando(null);
        // Abrir detalle de la nueva cotización para habilitar exportar
        setCotizacionActual(nueva);
        setModalDetalle(true);
      }
      // refrescar listado
      await cargarPorContacto(contactoId);
    } catch (error) {
      console.error('Error al guardar cotización:', error);
    }
  };

  const handleCambiarEstado = async (id: string, estado: EstadoCotizacion) => {
    try {
      await cambiarEstado(id, estado);
      // Recargar para actualizar la lista
      await cargarPorContacto(contactoId);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  const handleEliminar = async (id: string) => {
    try {
      await eliminar(id);
      if (cotizacionActual?.id === id) {
        setModalDetalle(false);
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            Cotizaciones {tipoContacto && `(${tipoContacto})`}
          </CardTitle>
          <Button onClick={handleNueva} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Cotización
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              {error}
              <Button
                variant="ghost"
                size="sm"
                onClick={limpiarError}
                className="ml-2"
              >
                Cerrar
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <ListaCotizaciones
          cotizaciones={cotizaciones}
          loading={loading}
          onNueva={handleNueva}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
          onCambiarEstado={handleCambiarEstado}
          onVerDetalle={handleVerDetalle}
        />

        {/* Modal de Formulario */}
        <FormularioCotizacion
          open={modalFormulario}
          onOpenChange={(open) => {
            setModalFormulario(open);
            if (!open) setCotizacionEditando(null);
          }}
          onGuardar={handleGuardar}
          cotizacion={cotizacionEditando}
          leadId={leadId}
          clienteId={clienteId}
          nombreContacto={nombreContacto}
        />

        {/* Modal de Detalle */}
        {cotizacionActual && (
          <div className={modalDetalle ? 'block' : 'hidden'}>
            <div 
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setModalDetalle(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div 
                className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">Detalle de Cotización</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setModalDetalle(false)}
                  >
                    ✕
                  </Button>
                </div>
                <DetalleCotizacion
                  cotizacion={cotizacionActual}
                  onCambiarEstado={(estado) => {
                    handleCambiarEstado(cotizacionActual.id, estado as EstadoCotizacion);
                    setModalDetalle(false);
                  }}
                  onEditar={() => {
                    setModalDetalle(false);
                    handleEditar(cotizacionActual);
                  }}
                  onEliminar={() => {
                    handleEliminar(cotizacionActual.id);
                    setModalDetalle(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
