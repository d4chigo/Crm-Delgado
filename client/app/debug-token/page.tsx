'use client'

import { useEffect, useState } from 'react'

export default function DebugTokenPage() {
  const [tokenEnLS, setTokenEnLS] = useState<string | null>(null)
  const [usuarioEnLS, setUsuarioEnLS] = useState<string | null>(null)
  const [verificando, setVerificando] = useState(false)
  const [respuestaServidor, setRespuestaServidor] = useState<any>(null)

  useEffect(() => {
    // Verificar token en localStorage
    const token = localStorage.getItem('crm_token')
    const usuario = localStorage.getItem('crm_user')
    
    setTokenEnLS(token)
    setUsuarioEnLS(usuario)
    
    console.log('[Debug] Token en localStorage:', token ? 'Sí' : 'No')
    console.log('[Debug] Usuario en localStorage:', usuario ? 'Sí' : 'No')
  }, [])

  const verificarTokenEnServidor = async () => {
    setVerificando(true)
    try {
      const token = localStorage.getItem('crm_token')
      
      if (!token) {
        setRespuestaServidor({ error: 'No hay token en localStorage' })
        return
      }

      const response = await fetch('http://localhost:5000/api/auth/perfil', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      setRespuestaServidor({
        status: response.status,
        ok: response.ok,
        data
      })
    } catch (error: any) {
      setRespuestaServidor({ error: error.message })
    } finally {
      setVerificando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Token</h1>

        {/* Token en localStorage */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Token en localStorage</h2>
          <div className="space-y-2">
            <p className="text-sm">
              <strong>Token presente:</strong> {tokenEnLS ? '✅ Sí' : '❌ No'}
            </p>
            {tokenEnLS && (
              <p className="text-sm break-all">
                <strong>Token:</strong> {tokenEnLS.substring(0, 50)}...
              </p>
            )}
          </div>
        </div>

        {/* Usuario en localStorage */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Usuario en localStorage</h2>
          <div className="space-y-2">
            <p className="text-sm">
              <strong>Usuario presente:</strong> {usuarioEnLS ? '✅ Sí' : '❌ No'}
            </p>
            {usuarioEnLS && (
              <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
                {JSON.stringify(JSON.parse(usuarioEnLS), null, 2)}
              </pre>
            )}
          </div>
        </div>

        {/* Verificar token en servidor */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Verificar Token en Servidor</h2>
          <button
            onClick={verificarTokenEnServidor}
            disabled={verificando}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {verificando ? 'Verificando...' : 'Verificar Token'}
          </button>

          {respuestaServidor && (
            <div className="mt-4">
              <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
                {JSON.stringify(respuestaServidor, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Instrucciones */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold mb-2">Instrucciones:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Verifica que el token esté en localStorage</li>
            <li>Haz clic en "Verificar Token" para probar con el servidor</li>
            <li>Si el servidor devuelve error 401, el token es inválido</li>
            <li>Si el servidor devuelve error de conexión, verifica que el backend esté corriendo</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
