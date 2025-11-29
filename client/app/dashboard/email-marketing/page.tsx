'use client';

import { useState, useEffect } from 'react';
import { Mail, Send, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import AssistantFab from '@/components/assistant/AssistantFab';
import dynamic from 'next/dynamic';

const AssistantPanel = dynamic(() => import('@/components/assistant/AssistantPanel'), { ssr: false });

interface Etiqueta {
  id: string;
  nombre: string;
  color: string;
  icono?: string;
}

interface Contacto {
  id: string;
  nombre: string;
  correo: string;
  tipo: 'LEAD' | 'CLIENTE';
}

interface Estadisticas {
  totalContactos: number;
  emailsValidos: number;
  emailsInvalidos: number;
  porcentajeValido: number;
  leads: { total: number; validos: number; invalidos: number };
  clientes: { total: number; validos: number; invalidos: number };
  contactosInvalidos: Array<{ id: string; nombre: string; correo: string; tipo: string }>;
  etiquetas: Etiqueta[];
  contactos: Contacto[];
}

interface ResultadoCampana {
  enviados: number;
  fallidos: number;
  invalidos: number;
}

export default function EmailMarketingPage() {
  const [abiertoAsistente, setAbiertoAsistente] = useState(false);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mostrarInvalidos, setMostrarInvalidos] = useState(false);
  const [resultado, setResultado] = useState<ResultadoCampana | null>(null);

  // Formulario
  const [asunto, setAsunto] = useState('');
  const [contenido, setContenido] = useState('');
  const [destinatarios, setDestinatarios] = useState<'leads' | 'clientes' | 'todos' | 'etiquetas' | 'individuales'>('todos');
  const [urlImagen, setUrlImagen] = useState('');
  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState<string[]>([]);
  const [contactosSeleccionados, setContactosSeleccionados] = useState<string[]>([]);
  const [busquedaContactos, setBusquedaContactos] = useState('');
  const [mostrarSelectorContactos, setMostrarSelectorContactos] = useState(false);

  // Cargar estadísticas
  useEffect(() => {
    cargarEstadisticas();
  }, []);

  async function cargarEstadisticas() {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/email-marketing/estadisticas');
      const data = await res.json();
      if (data.exito) {
        setEstadisticas(data.datos);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  }

  async function enviarCampana(e: React.FormEvent) {
    e.preventDefault();

    if (!asunto.trim() || !contenido.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (destinatarios === 'etiquetas' && etiquetasSeleccionadas.length === 0) {
      alert('Por favor selecciona al menos una etiqueta');
      return;
    }

    if (destinatarios === 'individuales' && contactosSeleccionados.length === 0) {
      alert('Por favor selecciona al menos un contacto');
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch('http://localhost:5000/api/email-marketing/enviar-campana', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asunto,
          contenido,
          destinatarios,
          urlImagen: urlImagen.trim() || undefined,
          etiquetaIds: etiquetasSeleccionadas.length > 0 ? etiquetasSeleccionadas : undefined,
          contactoIds: contactosSeleccionados.length > 0 ? contactosSeleccionados : undefined,
        }),
      });

      const data = await res.json();
      if (data.exito) {
        setResultado(data.datos.resultado);
        setAsunto('');
        setContenido('');
        setUrlImagen('');
        setEtiquetasSeleccionadas([]);
        setContactosSeleccionados([]);
        alert('✅ Campaña enviada exitosamente');
      } else {
        alert('❌ Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error enviando campaña:', error);
      alert('Error enviando campaña');
    } finally {
      setEnviando(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-8 h-8 text-amber-500" />
            <h1 className="text-3xl font-bold text-gray-900">Email Marketing</h1>
          </div>
          <p className="text-gray-600">Envía campañas de anuncios a tus leads y clientes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda: Estadísticas */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">📊 Estadísticas</h2>

              {/* Total de contactos */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Total de Contactos</p>
                <p className="text-2xl font-bold text-blue-900">{estadisticas?.totalContactos || 0}</p>
              </div>

              {/* Emails válidos */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Emails Válidos
                </p>
                <p className="text-2xl font-bold text-green-900">{estadisticas?.emailsValidos || 0}</p>
                <p className="text-xs text-green-700 mt-1">{estadisticas?.porcentajeValido || 0}% del total</p>
              </div>

              {/* Emails inválidos */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
                <p className="text-sm text-red-600 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Emails Inválidos
                </p>
                <p className="text-2xl font-bold text-red-900">{estadisticas?.emailsInvalidos || 0}</p>
              </div>

              {/* Desglose por tipo */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Desglose</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Leads válidos:</span>
                    <span className="font-semibold text-gray-900">{estadisticas?.leads.validos || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Clientes válidos:</span>
                    <span className="font-semibold text-gray-900">{estadisticas?.clientes.validos || 0}</span>
                  </div>
                </div>
              </div>

              {/* Botón para ver inválidos */}
              {(estadisticas?.emailsInvalidos || 0) > 0 && (
                <button
                  onClick={() => setMostrarInvalidos(!mostrarInvalidos)}
                  className="w-full mt-4 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors text-sm font-medium"
                >
                  {mostrarInvalidos ? 'Ocultar' : 'Ver'} Emails Inválidos ({estadisticas?.emailsInvalidos})
                </button>
              )}
            </div>

            {/* Lista de emails inválidos */}
            {mostrarInvalidos && estadisticas?.contactosInvalidos.length! > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4 mt-4 max-h-96 overflow-y-auto">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Contactos con emails inválidos</h3>
                <div className="space-y-2">
                  {estadisticas?.contactosInvalidos.map(contacto => (
                    <div key={contacto.id} className="text-xs bg-gray-50 p-2 rounded">
                      <p className="font-medium text-gray-900">{contacto.nombre}</p>
                      <p className="text-gray-600">{contacto.correo}</p>
                      <p className="text-gray-500 text-xs mt-1">({contacto.tipo})</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Columna derecha: Formulario */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">📧 Nueva Campaña</h2>

              <form onSubmit={enviarCampana} className="space-y-6">
                {/* Destinatarios */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">📧 Selecciona Destinatarios</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {(['leads', 'clientes', 'todos', 'etiquetas', 'individuales'] as const).map(tipo => (
                      <button
                        key={tipo}
                        type="button"
                        onClick={() => {
                          setDestinatarios(tipo);
                          if (tipo === 'individuales') setMostrarSelectorContactos(true);
                        }}
                        className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                          destinatarios === tipo
                            ? 'bg-amber-500 text-white ring-2 ring-amber-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tipo === 'leads' && `👥 Leads (${estadisticas?.leads.validos || 0})`}
                        {tipo === 'clientes' && `🏢 Clientes (${estadisticas?.clientes.validos || 0})`}
                        {tipo === 'todos' && `📋 Todos (${estadisticas?.emailsValidos || 0})`}
                        {tipo === 'etiquetas' && `🏷️ Por Etiquetas`}
                        {tipo === 'individuales' && `✋ Individuales (${contactosSeleccionados.length})`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filtrar por Etiquetas */}
                {destinatarios === 'etiquetas' && estadisticas?.etiquetas && estadisticas.etiquetas.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">🏷️ Selecciona Etiquetas</label>
                    <p className="text-xs text-gray-500 mb-3">Elige una o más etiquetas para enviar solo a contactos con esas etiquetas</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {estadisticas.etiquetas.map(etiqueta => (
                        <button
                          key={etiqueta.id}
                          type="button"
                          onClick={() => {
                            setEtiquetasSeleccionadas(prev =>
                              prev.includes(etiqueta.id)
                                ? prev.filter(id => id !== etiqueta.id)
                                : [...prev, etiqueta.id]
                            );
                          }}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            etiquetasSeleccionadas.includes(etiqueta.id)
                              ? 'ring-2 ring-offset-2 ring-amber-500'
                              : ''
                          }`}
                          style={{
                            backgroundColor: etiquetasSeleccionadas.includes(etiqueta.id)
                              ? etiqueta.color
                              : etiqueta.color + '33',
                            color: etiquetasSeleccionadas.includes(etiqueta.id) ? 'white' : '#333',
                            borderColor: etiqueta.color,
                            border: '1px solid ' + etiqueta.color
                          }}
                        >
                          {etiqueta.icono && <span className="mr-1">{etiqueta.icono}</span>}
                          {etiqueta.nombre}
                        </button>
                      ))}
                    </div>
                    {etiquetasSeleccionadas.length > 0 && (
                      <p className="text-xs text-amber-600 mt-2">
                        ✓ {etiquetasSeleccionadas.length} etiqueta(s) seleccionada(s)
                      </p>
                    )}
                  </div>
                )}

                {/* Selector de Contactos Individuales */}
                {destinatarios === 'individuales' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">✋ Selecciona Contactos Individuales</label>
                      <input
                        type="text"
                        placeholder="🔍 Busca por nombre o correo..."
                        value={busquedaContactos}
                        onChange={(e) => setBusquedaContactos(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    {/* Contactos Seleccionados */}
                    {contactosSeleccionados.length > 0 && (
                      <div className="bg-white rounded-lg p-3 border border-blue-300">
                        <p className="text-xs font-semibold text-blue-700 mb-2">
                          ✓ {contactosSeleccionados.length} contacto(s) seleccionado(s)
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {estadisticas?.contactos
                            ?.filter(c => contactosSeleccionados.includes(c.id))
                            .map(contacto => (
                              <div key={contacto.id} className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                                <span>{contacto.nombre}</span>
                                <button
                                  type="button"
                                  onClick={() => setContactosSeleccionados(contactosSeleccionados.filter(id => id !== contacto.id))}
                                  className="ml-1 hover:text-blue-900 font-bold"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Lista de Contactos Disponibles */}
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-2">Disponibles para agregar:</p>
                      <div className="max-h-48 overflow-y-auto space-y-1 bg-white rounded-lg p-2 border border-gray-200">
                        {estadisticas?.contactos && estadisticas.contactos.length > 0 ? (
                          estadisticas.contactos
                            ?.filter(c => 
                              !contactosSeleccionados.includes(c.id) &&
                              (c.nombre.toLowerCase().includes(busquedaContactos.toLowerCase()) ||
                               c.correo.toLowerCase().includes(busquedaContactos.toLowerCase()))
                            )
                            .map(contacto => (
                              <label key={contacto.id} className="flex items-center gap-2 p-2 hover:bg-blue-50 rounded cursor-pointer transition-colors">
                                <input
                                  type="checkbox"
                                  checked={false}
                                  onChange={() => setContactosSeleccionados([...contactosSeleccionados, contacto.id])}
                                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{contacto.nombre}</p>
                                  <p className="text-xs text-gray-500 truncate">{contacto.correo}</p>
                                </div>
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 flex-shrink-0">
                                  {contacto.tipo === 'LEAD' ? '👥 Lead' : '🏢 Cliente'}
                                </span>
                              </label>
                            ))
                        ) : (
                          <p className="text-xs text-gray-500 p-2">No hay contactos disponibles</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Asunto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Asunto del Email</label>
                  <input
                    type="text"
                    value={asunto}
                    onChange={e => setAsunto(e.target.value)}
                    placeholder="Ej: Nuevas propiedades disponibles"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Contenido */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contenido del Email</label>
                  <textarea
                    value={contenido}
                    onChange={e => setContenido(e.target.value)}
                    placeholder="Escribe el contenido del email. Usa placeholders como {nombre} para personalizar automáticamente cada email."
                    rows={8}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-sm"
                  />
                  <div className="text-xs text-gray-600 mt-2 bg-blue-50 p-3 rounded border border-blue-200">
                    <p className="font-semibold mb-1">💡 Placeholders disponibles para personalización:</p>
                    <ul className="space-y-1 ml-4">
                      <li>• <code className="bg-white px-1 rounded">{'{nombre}'}</code> - Nombre del contacto</li>
                      <li>• <code className="bg-white px-1 rounded">{'{apellido}'}</code> - Apellido del contacto</li>
                      <li>• <code className="bg-white px-1 rounded">{'{nombre_completo}'}</code> - Nombre y apellido</li>
                    </ul>
                    <p className="text-gray-600 mt-2">Ejemplo: "Hola {'{nombre}'}, te presentamos nuestras nuevas propiedades..."</p>
                  </div>
                </div>

                {/* URL de Imagen */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">🖼️ URL de Imagen (Flyer/Promoción)</label>
                  <input
                    type="url"
                    value={urlImagen}
                    onChange={e => setUrlImagen(e.target.value)}
                    placeholder="Ej: https://ejemplo.com/flyer.jpg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-xs text-gray-500 mt-2">💡 Opcional: Pega el link de tu imagen/flyer. Se enviará al final del email</p>
                  {urlImagen && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-medium text-gray-700 mb-2">Vista previa:</p>
                      <img 
                        src={urlImagen} 
                        alt="Preview" 
                        className="max-w-full h-auto rounded-lg max-h-48 object-cover"
                        onError={() => console.log('Error cargando imagen')}
                      />
                    </div>
                  )}
                </div>

                {/* Botón enviar */}
                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {enviando ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Enviar Campaña
                    </>
                  )}
                </button>
              </form>

              {/* Resultado */}
              {resultado && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">✅ Campaña Enviada</h3>
                  <div className="text-sm text-green-800 space-y-1">
                    <p>✅ Enviados: <span className="font-bold">{resultado.enviados}</span></p>
                    {resultado.fallidos > 0 && <p>❌ Fallidos: <span className="font-bold">{resultado.fallidos}</span></p>}
                    {resultado.invalidos > 0 && <p>⚠️ Inválidos: <span className="font-bold">{resultado.invalidos}</span></p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AssistantFab onClick={() => setAbiertoAsistente(true)} />
      <AssistantPanel open={abiertoAsistente} onClose={() => setAbiertoAsistente(false)} />
    </div>
  );
}
