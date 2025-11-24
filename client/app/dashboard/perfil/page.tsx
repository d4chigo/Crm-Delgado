'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Save, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { obtenerUsuario } from '@/lib/autenticacion'

export default function PerfilPage() {
  const router = useRouter()
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null)
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [mostrarPasswordNueva, setMostrarPasswordNueva] = useState(false)
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false)
  const [cambiarPassword, setCambiarPassword] = useState(false)

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    rol: '',
  })

  const [passwordData, setPasswordData] = useState({
    passwordActual: '',
    passwordNueva: '',
    confirmar: '',
  })

  useEffect(() => {
    const usuario = obtenerUsuario()
    if (usuario) {
      setFormData({
        nombre: usuario.nombre || '',
        email: usuario.email || '',
        telefono: usuario.telefono || '',
        rol: usuario.rol || '',
      })
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    setMensaje(null)

    try {
      console.log('Guardando perfil:', formData)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMensaje({
        tipo: 'exito',
        texto: '✅ Perfil actualizado exitosamente'
      })
    } catch (error) {
      setMensaje({
        tipo: 'error',
        texto: '❌ Error al guardar el perfil'
      })
    } finally {
      setGuardando(false)
    }
  }

  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.passwordNueva !== passwordData.confirmar) {
      setMensaje({
        tipo: 'error',
        texto: '❌ Las contraseñas no coinciden'
      })
      return
    }

    if (passwordData.passwordNueva.length < 6) {
      setMensaje({
        tipo: 'error',
        texto: '❌ La contraseña debe tener al menos 6 caracteres'
      })
      return
    }

    setGuardando(true)
    setMensaje(null)

    try {
      console.log('Cambiando contraseña...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMensaje({
        tipo: 'exito',
        texto: '✅ Contraseña actualizada exitosamente'
      })
      
      setPasswordData({
        passwordActual: '',
        passwordNueva: '',
        confirmar: '',
      })
      setCambiarPassword(false)
    } catch (error) {
      setMensaje({
        tipo: 'error',
        texto: '❌ Error al cambiar la contraseña'
      })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
          </div>
          <p className="text-gray-600">Actualiza tu información personal</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
        {mensaje && (
          <div className={`mb-6 p-4 rounded-lg ${
            mensaje.tipo === 'exito'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {mensaje.texto}
          </div>
        )}

        {/* Formulario de Información Personal */}
        <form onSubmit={handleGuardar} className="space-y-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Información Personal</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol
                </label>
                <input
                  type="text"
                  name="rol"
                  value={formData.rol}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="+51 999 999 999"
                />
              </div>
            </div>

            <div className="flex gap-4 justify-end mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="px-6"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={guardando}
                className="px-6 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {guardando ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </div>
        </form>

        {/* Formulario de Cambio de Contraseña */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-500" />
              Seguridad
            </h2>
            <Button
              type="button"
              variant={cambiarPassword ? 'default' : 'outline'}
              onClick={() => setCambiarPassword(!cambiarPassword)}
              className={cambiarPassword ? 'bg-amber-500 hover:bg-amber-600' : ''}
            >
              {cambiarPassword ? 'Cancelar' : 'Cambiar Contraseña'}
            </Button>
          </div>

          {cambiarPassword && (
            <form onSubmit={handleCambiarPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña Actual
                </label>
                <div className="relative">
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    name="passwordActual"
                    value={passwordData.passwordActual}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent pr-10"
                    placeholder="Ingresa tu contraseña actual"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  >
                    {mostrarPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={mostrarPasswordNueva ? 'text' : 'password'}
                    name="passwordNueva"
                    value={passwordData.passwordNueva}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent pr-10"
                    placeholder="Ingresa tu nueva contraseña"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPasswordNueva(!mostrarPasswordNueva)}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  >
                    {mostrarPasswordNueva ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={mostrarConfirmar ? 'text' : 'password'}
                    name="confirmar"
                    value={passwordData.confirmar}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent pr-10"
                    placeholder="Confirma tu nueva contraseña"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  >
                    {mostrarConfirmar ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-4 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCambiarPassword(false)
                    setPasswordData({ passwordActual: '', passwordNueva: '', confirmar: '' })
                  }}
                  className="px-6"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={guardando}
                  className="px-6 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-white"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {guardando ? 'Actualizando...' : 'Actualizar Contraseña'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
