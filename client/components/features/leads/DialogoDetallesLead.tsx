'use client';

import { useState, useEffect } from 'react';
import { Contacto, Cotizacion } from '@/types';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { User, Briefcase, TrendingUp, Calendar, MapPin, Mail, Phone, DollarSign, Tag, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCotizaciones } from '@/hooks/useCotizaciones';
import { ListaCotizacionesSoloLectura } from '@/components/features/cotizaciones/ListaCotizacionesSoloLectura';

// NOTE: This component uses extensive inline styles as a last resort to override
// potential external CSS conflicts that may be causing layout issues.
// This is not standard practice but is used here for maximum style isolation.

const DetailItem = ({ label, value }) => (
    <div style={{ marginBottom: '1rem' }}>
        <p style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
        <p 
            style={{ 
                fontSize: '0.875rem', 
                fontWeight: 500, 
                color: '#1f2937', 
                marginTop: '0.25rem',
                wordBreak: 'break-all',
                overflowWrap: 'break-word'
            }}
            title={value}
        >
            {value || '-'}
        </p>
    </div>
);

interface DialogoDetallesLeadProps {
  lead: Contacto | null;
  abierto: boolean;
  onCerrar: () => void;
}

export function DialogoDetallesLead({ lead, abierto, onCerrar }: DialogoDetallesLeadProps) {
  const { cotizaciones, loading: loadingCotizaciones, cargarPorContacto } = useCotizaciones();

  useEffect(() => {
    if (abierto && lead) {
      cargarPorContacto(lead.id);
    }
  }, [abierto, lead, cargarPorContacto]);

  if (!lead) return null;

  return (
    <Dialog open={abierto} onOpenChange={onCerrar}>
      <DialogContent style={{ width: '1200px', maxWidth: 'none', height: '800px', display: 'flex', flexDirection: 'column', padding: 0, background: '#f9fafb', borderRadius: '1rem' }}>
        
        {/* Header */}
        <div style={{ padding: '2rem', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '6rem', height: '6rem', borderRadius: '9999px', background: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '3rem', fontWeight: 'bold', color: 'white' }}>{lead.nombre?.charAt(0).toUpperCase()}</span>
            </div>
            <div style={{ marginLeft: '1.5rem' }}>
                <DialogTitle style={{ fontSize: '2.25rem', fontWeight: 800, color: '#111827' }}>{lead.nombre} {lead.apellido}</DialogTitle>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <Badge variant="default">{lead.tipo}</Badge>
                    {lead.estadoLead && <Badge variant="secondary">{lead.estadoLead}</Badge>}
                </div>
            </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            
            {/* Left Column */}
            <div style={{ width: '65%', padding: '2rem', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '2rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Información Personal</h2>
                        <DetailItem label="Correo" value={lead.correo} />
                        <DetailItem label="Teléfono" value={lead.telefono} />
                        <DetailItem label="DNI" value={lead.dni} />
                        <DetailItem label="Dirección" value={lead.direccion} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Información Comercial</h2>
                        <DetailItem label="Empresa" value={lead.empresa} />
                        <DetailItem label="Cargo" value={lead.cargo} />
                        <DetailItem label="Presupuesto" value={lead.presupuesto ? `S/ ${lead.presupuesto}` : '-'} />
                        <DetailItem label="Prioridad" value={lead.prioridad} />
                    </div>
                </div>
            </div>

            {/* Right Column */}
            <div style={{ width: '35%', borderLeft: '1px solid #e5e7eb', background: 'white', padding: '2rem', overflowY: 'auto' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#374151', marginBottom: '1rem' }}>Etiquetas</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {lead.etiquetas && lead.etiquetas.length > 0 ? (
                            lead.etiquetas.map(et => (
                                <Badge key={et.etiqueta.id} variant="outline">{et.etiqueta.nombre}</Badge>
                            ))
                        ) : <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>No hay etiquetas.</p>}
                    </div>
                </div>
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#374151', marginBottom: '1rem' }}>Notas</h2>
                    <p style={{ fontSize: '0.875rem', color: '#4b5563', whiteSpace: 'pre-wrap' }}>{lead.notas || 'No hay notas.'}</p>
                </div>
                <div>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#374151', marginBottom: '1rem' }}>Historial de Cotizaciones</h2>
                    <ListaCotizacionesSoloLectura cotizaciones={cotizaciones} loading={loadingCotizaciones} />
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
