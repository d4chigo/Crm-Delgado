"use client"

import { Proyecto } from "@/types/proyecto.types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, MoreVertical, Trash2, MapPin, DollarSign, Users, Tag } from "lucide-react"
import Image from "next/image"

interface TarjetaProyectoProps {
  proyecto: Proyecto
  onEditar: (proyecto: Proyecto) => void
  onEliminar: (id: string) => void
  onVerDetalles?: (proyecto: Proyecto) => void
}

const estadoColores = {
  DISPONIBLE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  RESERVADO: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  VENDIDO: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  CONSTRUCCION: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  FINALIZADO: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
}

const estadoTextos = {
  DISPONIBLE: "Disponible",
  RESERVADO: "Reservado",
  VENDIDO: "Vendido",
  CONSTRUCCION: "En Construcción",
  FINALIZADO: "Finalizado"
}

export function TarjetaProyecto({
  proyecto,
  onEditar,
  onEliminar,
  onVerDetalles
}: TarjetaProyectoProps) {
  const handleEliminar = () => {
    if (confirm(`¿Estás seguro de eliminar el proyecto "${proyecto.nombre}"?`)) {
      onEliminar(proyecto.id)
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Imagen */}
      {proyecto.imagen ? (
        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
          {typeof window !== 'undefined' && window.electron ? (
            // Usar img estándar en Electron - manejar tanto URLs como rutas locales
            <>
              <img
                src={proyecto.imagen.startsWith('http') 
                  ? proyecto.imagen // Usar URL directa si es una URL web
                  : `file://${proyecto.imagen.replace(/\\\\/g, '/')}` // Usar file:// para rutas locales
                }
                alt={proyecto.nombre}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Error al cargar la imagen en Electron:', proyecto.imagen);
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
                onLoad={() => console.log('Imagen cargada correctamente en Electron:', proyecto.imagen)}
              />
            </>
          ) : (
            // Usar el componente Image de Next.js en el navegador
            <>
              <Image
                src={proyecto.imagen}
                alt={proyecto.nombre}
                fill
                className="object-cover"
                onError={(e) => {
                  console.error('Error al cargar la imagen en el navegador:', proyecto.imagen);
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
                onLoad={() => console.log('Imagen cargada correctamente en el navegador:', proyecto.imagen)}
              />
            </>
          )}
        </div>
      ) : (
        <div className="h-48 w-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center">
          <span className="text-4xl">🏢</span>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg line-clamp-1">{proyecto.nombre}</h3>
            <Badge
              className={`mt-2 ${estadoColores[proyecto.estado]}`}
              variant="secondary"
            >
              {estadoTextos[proyecto.estado]}
            </Badge>
          </div>

          {/* Menú de opciones */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onVerDetalles && (
                <>
                  <DropdownMenuItem onClick={() => onVerDetalles(proyecto)}>
                    Ver detalles
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={() => onEditar(proyecto)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleEliminar}
                className="text-red-600 dark:text-red-400"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Descripción */}
        {proyecto.descripcion && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {proyecto.descripcion}
          </p>
        )}

        {/* Ubicación */}
        {proyecto.ubicacion && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{proyecto.ubicacion}</span>
          </div>
        )}

        {/* Precio */}
        {proyecto.precio && (
          <div className="flex items-center gap-2 text-sm font-medium">
            <DollarSign className="h-4 w-4" />
            <span>S/. {Number(proyecto.precio).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
          </div>
        )}

        {/* Etiquetas */}
        {proyecto.etiquetas && proyecto.etiquetas.length > 0 && (
          <div className="flex items-start gap-2">
            <Tag className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="flex flex-wrap gap-1">
              {proyecto.etiquetas.slice(0, 3).map((pe, idx) => (
                <Badge
                  key={`${pe.etiquetaId}-${idx}`}
                  variant="outline"
                  className="text-xs"
                  style={{
                    borderColor: pe.etiqueta.color,
                    color: pe.etiqueta.color
                  }}
                >
                  {pe.etiqueta.nombre}
                </Badge>
              ))}
              {proyecto.etiquetas.length > 3 && (
                <Badge key="mas-etiquetas" variant="outline" className="text-xs">
                  +{proyecto.etiquetas.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Clientes asociados */}
        {proyecto.clientes && proyecto.clientes.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{proyecto.clientes.length} cliente(s) asociado(s)</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <p className="text-xs text-muted-foreground">
          Creado {new Date(proyecto.creadoEn).toLocaleDateString('es-PE')}
        </p>
      </CardFooter>
    </Card>
  )
}
