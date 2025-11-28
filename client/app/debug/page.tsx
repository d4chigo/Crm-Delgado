"use client"

import { useEffect, useState } from "react"
import { obtenerToken, obtenerUsuario } from "@/lib/autenticacion"
import { fetchAPI } from "@/services/api/config"

export default function DebugPage() {
  const [token, setToken] = useState<string | null>(null)
  const [usuario, setUsuario] = useState<any>(null)
  const [resultado, setResultado] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const t = obtenerToken()
    const u = obtenerUsuario()
    setToken(t)
    setUsuario(u)
  }, [])

  const verificarToken = async () => {
    try {
      setError(null)
      const res = await fetchAPI('/auth/debug/verificar-token')
      setResultado(res)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug de Autenticación</h1>

      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Token en localStorage:</h2>
          <p className="text-xs break-all">{token || "NO ENCONTRADO"}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Usuario en localStorage:</h2>
          <pre className="text-xs">{JSON.stringify(usuario, null, 2)}</pre>
        </div>

        <button
          onClick={verificarToken}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Verificar Token en Servidor
        </button>

        {error && (
          <div className="bg-red-100 p-4 rounded text-red-700">
            <h2 className="font-bold mb-2">Error:</h2>
            <p>{error}</p>
          </div>
        )}

        {resultado && (
          <div className="bg-green-100 p-4 rounded text-green-700">
            <h2 className="font-bold mb-2">Resultado:</h2>
            <pre className="text-xs">{JSON.stringify(resultado, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
