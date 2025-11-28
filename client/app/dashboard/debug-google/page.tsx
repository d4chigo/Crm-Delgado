"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { fetchAPI } from "@/services/api/config"

export default function DebugGooglePage() {
  const router = useRouter()
  const [token, setToken] = useState("")
  const [cargando, setCargando] = useState(false)
  const [resultado, setResultado] = useState<any>(null)

  const handleProbarToken = async () => {
    if (!token.trim()) {
      toast({ title: "Error", description: "Ingresa un token", variant: "destructive" })
      return
    }

    setCargando(true)
    try {
      console.log("🧪 Probando token de Google...")
      const resultado = await fetchAPI<any>("/auth/google/test-token", {
        method: "POST",
        body: JSON.stringify({ accessToken: token })
      })
      
      console.log("✅ Resultado:", resultado)
      setResultado(resultado)
      
      toast({
        title: "✅ Token válido",
        description: `Se encontraron ${resultado.contactosEncontrados} contactos`
      })
    } catch (error: any) {
      console.error("❌ Error:", error.message)
      toast({
        title: "❌ Error",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setCargando(false)
    }
  }

  const handleObtenerTokenDelURL = () => {
    const params = new URLSearchParams(window.location.search)
    const googleToken = params.get("google_token")
    
    if (googleToken) {
      setToken(googleToken)
      toast({ title: "Token copiado", description: "Token de Google copiado del URL" })
    } else {
      toast({
        title: "No hay token",
        description: "No se encontró google_token en el URL",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Debug - Google OAuth</h1>
        <p className="text-gray-600 dark:text-gray-400">Prueba tokens de Google</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Probar Token de Google</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Token de Google</label>
            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Pega el token de Google aquí..."
              className="w-full p-3 border rounded-lg font-mono text-sm h-32"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleObtenerTokenDelURL} variant="outline">
              Obtener del URL
            </Button>
            <Button onClick={handleProbarToken} disabled={cargando}>
              {cargando ? "Probando..." : "Probar Token"}
            </Button>
            <Button
              onClick={() => router.push("/dashboard/leads?google_error=test")}
              variant="outline"
            >
              Ir a Leads
            </Button>
          </div>
        </CardContent>
      </Card>

      {resultado && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold">Token válido:</p>
                <p className="text-green-600">✅ Sí</p>
              </div>

              <div>
                <p className="text-sm font-semibold">Contactos encontrados:</p>
                <p className="text-lg font-bold">{resultado.contactosEncontrados}</p>
              </div>

              {resultado.contactos && resultado.contactos.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Primeros contactos:</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {resultado.contactos.map((contacto: any, idx: number) => (
                      <div key={idx} className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                        <p>
                          <strong>Nombre:</strong> {contacto.names?.[0]?.givenName} {contacto.names?.[0]?.familyName}
                        </p>
                        <p>
                          <strong>Email:</strong> {contacto.emailAddresses?.[0]?.value || "N/A"}
                        </p>
                        <p>
                          <strong>Teléfono:</strong> {contacto.phoneNumbers?.[0]?.value || "N/A"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Instrucciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>1. Ve a <code className="bg-gray-100 px-2 py-1 rounded">/dashboard/leads</code></p>
          <p>2. Haz clic en "Importar de Google"</p>
          <p>3. Autoriza el acceso</p>
          <p>4. Serás redirigido a leads con el token en la URL</p>
          <p>5. Copia el token del URL y pégalo aquí para probar</p>
          <p>6. O haz clic en "Obtener del URL" si estás en la página correcta</p>
        </CardContent>
      </Card>
    </div>
  )
}
