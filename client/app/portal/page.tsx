'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, LogOut, FileText, MessageSquare, Calendar, TrendingUp, Download } from 'lucide-react'
import { fetchAPI } from '@/services/api/config'

interface Perfil {
  id: string
  nombre: string
  apellido?: string
  correo?: string
  telefono?: string
  ciudad?: string
}

interface Oportunidad {
  id: string
  titulo: string
  etapa: string
  valor?: number
  probabilidad?: number
  ultimaActividad?: string
}

interface Cotizacion {
  id: string
  numeroReferencia: string
  nombreProyecto: string
  precioInmueble?: number
  estado: string
  creadoEn: string
}

interface Documento {
  id: string
  nombreArchivo: string
  tipoDocumento: string
  subidoEn: string
}

interface Actividad {
  id: string
  tipo: string
  descripcion: string
  fecha: string
}

export default function PortalCliente() {
  const router = useRouter()
  const [cargando, setCargando] = useState(true)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([])
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [actividades, setActividades] = useState<Actividad[]>([])
  const [pestaña, setPestaña] = useState<'resumen' | 'oportunidades' | 'cotizaciones' | 'documentos' | 'actividades'>('resumen')

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    try {
      setCargando(true)

      // Cargar perfil
      const perfilRes = await fetchAPI<any>('/portal-cliente/perfil')
      if (perfilRes?.data) {
        setPerfil(perfilRes.data)
      }

      // Cargar oportunidades
      const oportunidadesRes = await fetchAPI<any>('/portal-cliente/oportunidades')
      if (oportunidadesRes?.data) {
        setOportunidades(oportunidadesRes.data)
      }

      // Cargar cotizaciones
      const cotizacionesRes = await fetchAPI<any>('/portal-cliente/cotizaciones')
      if (cotizacionesRes?.data) {
        setCotizaciones(cotizacionesRes.data)
      }

      // Cargar documentos
      const documentosRes = await fetchAPI<any>('/portal-cliente/documentos')
      if (documentosRes?.data) {
        setDocumentos(documentosRes.data)
      }

      // Cargar actividades
      const actividadesRes = await fetchAPI<any>('/portal-cliente/actividades')
      if (actividadesRes?.data) {
        setActividades(actividadesRes.data)
      }
    } catch (error) {
      console.error('Error cargando datos del portal:', error)
    } finally {
      setCargando(false)
    }
  }

  async function cerrarSesion() {
    localStorage.removeItem('crm_token')
    router.push('/login')
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Portal de Cliente</h1>
            <p className="text-gray-600 mt-1">Bienvenido, {perfil?.nombre} {perfil?.apellido}</p>
          </div>
          <Button
            onClick={cerrarSesion}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navegación de pestañas */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'resumen', label: '📊 Resumen', icon: TrendingUp },
            { id: 'oportunidades', label: '🎯 Oportunidades', icon: TrendingUp },
            { id: 'cotizaciones', label: '📋 Cotizaciones', icon: FileText },
            { id: 'documentos', label: '📁 Documentos', icon: Download },
            { id: 'actividades', label: '📅 Actividades', icon: Calendar },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPestaña(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                pestaña === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenido */}
        {pestaña === 'resumen' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="p-6 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Oportunidades Activas</p>
                  <p className="text-3xl font-bold text-blue-600">{oportunidades.length}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600 opacity-20" />
              </div>
            </Card>

            <Card className="p-6 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Cotizaciones</p>
                  <p className="text-3xl font-bold text-green-600">{cotizaciones.length}</p>
                </div>
                <FileText className="w-8 h-8 text-green-600 opacity-20" />
              </div>
            </Card>

            <Card className="p-6 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Documentos</p>
                  <p className="text-3xl font-bold text-purple-600">{documentos.length}</p>
                </div>
                <Download className="w-8 h-8 text-purple-600 opacity-20" />
              </div>
            </Card>

            <Card className="p-6 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Últimas Actividades</p>
                  <p className="text-3xl font-bold text-orange-600">{actividades.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-orange-600 opacity-20" />
              </div>
            </Card>
          </div>
        )}

        {pestaña === 'oportunidades' && (
          <Card className="p-6 bg-white">
            <h2 className="text-2xl font-bold mb-6">Mis Oportunidades</h2>
            {oportunidades.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay oportunidades disponibles</p>
            ) : (
              <div className="space-y-4">
                {oportunidades.map((oportunidad) => (
                  <div key={oportunidad.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">{oportunidad.titulo}</h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {oportunidad.etapa}
                      </span>
                    </div>
                    {oportunidad.valor && (
                      <p className="text-gray-600">Valor: <span className="font-semibold text-green-600">S/. {oportunidad.valor.toLocaleString()}</span></p>
                    )}
                    {oportunidad.probabilidad && (
                      <p className="text-gray-600">Probabilidad: <span className="font-semibold">{oportunidad.probabilidad}%</span></p>
                    )}
                    {oportunidad.ultimaActividad && (
                      <p className="text-sm text-gray-500 mt-2">Última actividad: {new Date(oportunidad.ultimaActividad).toLocaleDateString()}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {pestaña === 'cotizaciones' && (
          <Card className="p-6 bg-white">
            <h2 className="text-2xl font-bold mb-6">Mis Cotizaciones</h2>
            {cotizaciones.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay cotizaciones disponibles</p>
            ) : (
              <div className="space-y-4">
                {cotizaciones.map((cotizacion) => (
                  <div key={cotizacion.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{cotizacion.nombreProyecto}</h3>
                        <p className="text-sm text-gray-500">Ref: {cotizacion.numeroReferencia}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        cotizacion.estado === 'APROBADA' ? 'bg-green-100 text-green-800' :
                        cotizacion.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {cotizacion.estado}
                      </span>
                    </div>
                    {cotizacion.precioInmueble && (
                      <p className="text-gray-600">Precio: <span className="font-semibold text-green-600">S/. {cotizacion.precioInmueble.toLocaleString()}</span></p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">Creado: {new Date(cotizacion.creadoEn).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {pestaña === 'documentos' && (
          <Card className="p-6 bg-white">
            <h2 className="text-2xl font-bold mb-6">Mis Documentos</h2>
            {documentos.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay documentos disponibles</p>
            ) : (
              <div className="space-y-3">
                {documentos.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="font-semibold text-gray-900">{doc.nombreArchivo}</p>
                        <p className="text-sm text-gray-500">{doc.tipoDocumento} • {new Date(doc.subidoEn).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {pestaña === 'actividades' && (
          <Card className="p-6 bg-white">
            <h2 className="text-2xl font-bold mb-6">Historial de Actividades</h2>
            {actividades.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay actividades registradas</p>
            ) : (
              <div className="space-y-4">
                {actividades.map((actividad) => (
                  <div key={actividad.id} className="border-l-4 border-blue-600 pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">{actividad.tipo}</p>
                        <p className="text-gray-600">{actividad.descripcion}</p>
                      </div>
                      <span className="text-sm text-gray-500">{new Date(actividad.fecha).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </main>
    </div>
  )
}
