'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Save, Trash2, FileText, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaginaServicio {
  id?: string;
  tipoServicio: string;
  titulo: string;
  subtitulo?: string;
  descripcionCorta?: string;
  descripcionLarga?: string;
  imagenBanner?: string;
  videoBanner?: string;
  requisitos?: string[];
  beneficios?: string[];
  pasos?: Array<{ titulo: string; descripcion: string }>;
  preguntas?: Array<{ pregunta: string; respuesta: string }>;
  activo: boolean;
  ordenMostrar: number;
  metaTitle?: string;
  metaDescription?: string;
}

const TIPOS_SERVICIO = [
  { value: 'techo_propio', label: 'Techo Propio' },
  { value: 'credito_mivivienda', label: 'Crédito MiVivienda' },
  { value: 'habilitaciones', label: 'Habilitaciones Urbanas' },
];

export default function ServiciosWebPage() {
  const { toast } = useToast();
  const [servicios, setServicios] = useState<PaginaServicio[]>([]);
  const [servicioActual, setServicioActual] = useState<PaginaServicio>({
    tipoServicio: 'techo_propio',
    titulo: '',
    subtitulo: '',
    descripcionCorta: '',
    descripcionLarga: '',
    imagenBanner: '',
    videoBanner: '',
    requisitos: [],
    beneficios: [],
    pasos: [],
    preguntas: [],
    activo: true,
    ordenMostrar: 0,
    metaTitle: '',
    metaDescription: '',
  });
  const [loading, setLoading] = useState(false);
  const [nuevoRequisito, setNuevoRequisito] = useState('');
  const [nuevoBeneficio, setNuevoBeneficio] = useState('');
  const [nuevoPaso, setNuevoPaso] = useState({ titulo: '', descripcion: '' });
  const [nuevaPregunta, setNuevaPregunta] = useState({ pregunta: '', respuesta: '' });

  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/web/servicios`);
      if (response.ok) {
        const data = await response.json();
        setServicios(data.servicios || []);
      }
    } catch (error) {
      console.error('Error al cargar servicios:', error);
    }
  };

  const cargarServicioPorTipo = async (tipo: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/web/servicios/${tipo}`);
      if (response.ok) {
        const data = await response.json();
        if (data.servicio) {
          setServicioActual(data.servicio);
        } else {
          // Si no existe, cargar datos vacíos para ese tipo
          setServicioActual({
            tipoServicio: tipo,
            titulo: '',
            subtitulo: '',
            descripcionCorta: '',
            descripcionLarga: '',
            imagenBanner: '',
            videoBanner: '',
            requisitos: [],
            beneficios: [],
            pasos: [],
            preguntas: [],
            activo: true,
            ordenMostrar: 0,
            metaTitle: '',
            metaDescription: '',
          });
        }
      }
    } catch (error) {
      console.error('Error al cargar servicio:', error);
    }
  };

  const guardarServicio = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/web/servicios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(servicioActual),
      });

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: 'Página de servicio guardada correctamente',
        });
        cargarServicios();
      } else {
        throw new Error('Error al guardar');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la página de servicio',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const agregarRequisito = () => {
    if (nuevoRequisito.trim()) {
      setServicioActual({
        ...servicioActual,
        requisitos: [...(servicioActual.requisitos || []), nuevoRequisito.trim()],
      });
      setNuevoRequisito('');
    }
  };

  const eliminarRequisito = (index: number) => {
    setServicioActual({
      ...servicioActual,
      requisitos: servicioActual.requisitos?.filter((_, i) => i !== index),
    });
  };

  const agregarBeneficio = () => {
    if (nuevoBeneficio.trim()) {
      setServicioActual({
        ...servicioActual,
        beneficios: [...(servicioActual.beneficios || []), nuevoBeneficio.trim()],
      });
      setNuevoBeneficio('');
    }
  };

  const eliminarBeneficio = (index: number) => {
    setServicioActual({
      ...servicioActual,
      beneficios: servicioActual.beneficios?.filter((_, i) => i !== index),
    });
  };

  const agregarPaso = () => {
    if (nuevoPaso.titulo.trim() && nuevoPaso.descripcion.trim()) {
      setServicioActual({
        ...servicioActual,
        pasos: [...(servicioActual.pasos || []), { ...nuevoPaso }],
      });
      setNuevoPaso({ titulo: '', descripcion: '' });
    }
  };

  const eliminarPaso = (index: number) => {
    setServicioActual({
      ...servicioActual,
      pasos: servicioActual.pasos?.filter((_, i) => i !== index),
    });
  };

  const agregarPregunta = () => {
    if (nuevaPregunta.pregunta.trim() && nuevaPregunta.respuesta.trim()) {
      setServicioActual({
        ...servicioActual,
        preguntas: [...(servicioActual.preguntas || []), { ...nuevaPregunta }],
      });
      setNuevaPregunta({ pregunta: '', respuesta: '' });
    }
  };

  const eliminarPregunta = (index: number) => {
    setServicioActual({
      ...servicioActual,
      preguntas: servicioActual.preguntas?.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Servicios Web</h1>
          <p className="text-muted-foreground">
            Administra el contenido de las páginas de servicios del sitio web
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Servicio</CardTitle>
          <CardDescription>Elige el tipo de servicio que deseas editar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {TIPOS_SERVICIO.map((tipo) => (
              <Button
                key={tipo.value}
                variant={servicioActual.tipoServicio === tipo.value ? 'default' : 'outline'}
                onClick={() => cargarServicioPorTipo(tipo.value)}
              >
                {tipo.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="contenido" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="contenido">Contenido</TabsTrigger>
          <TabsTrigger value="requisitos">Requisitos</TabsTrigger>
          <TabsTrigger value="beneficios">Beneficios</TabsTrigger>
          <TabsTrigger value="proceso">Proceso</TabsTrigger>
          <TabsTrigger value="faq">Preguntas</TabsTrigger>
        </TabsList>

        <TabsContent value="contenido">
          <Card>
            <CardHeader>
              <CardTitle>Contenido Principal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    value={servicioActual.titulo}
                    onChange={(e) => setServicioActual({ ...servicioActual, titulo: e.target.value })}
                    placeholder="Ej: Techo Propio"
                  />
                </div>

                <div>
                  <Label htmlFor="subtitulo">Subtítulo</Label>
                  <Input
                    id="subtitulo"
                    value={servicioActual.subtitulo || ''}
                    onChange={(e) => setServicioActual({ ...servicioActual, subtitulo: e.target.value })}
                    placeholder="Ej: Tu primera vivienda con el apoyo del Estado"
                  />
                </div>

                <div>
                  <Label htmlFor="descripcionCorta">Descripción Corta</Label>
                  <Textarea
                    id="descripcionCorta"
                    value={servicioActual.descripcionCorta || ''}
                    onChange={(e) => setServicioActual({ ...servicioActual, descripcionCorta: e.target.value })}
                    placeholder="Breve descripción del servicio"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="descripcionLarga">Descripción Larga</Label>
                  <Textarea
                    id="descripcionLarga"
                    value={servicioActual.descripcionLarga || ''}
                    onChange={(e) => setServicioActual({ ...servicioActual, descripcionLarga: e.target.value })}
                    placeholder="Descripción detallada del servicio (acepta HTML)"
                    rows={8}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="imagenBanner">URL Imagen Banner</Label>
                    <Input
                      id="imagenBanner"
                      value={servicioActual.imagenBanner || ''}
                      onChange={(e) => setServicioActual({ ...servicioActual, imagenBanner: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="videoBanner">URL Video Banner</Label>
                    <Input
                      id="videoBanner"
                      value={servicioActual.videoBanner || ''}
                      onChange={(e) => setServicioActual({ ...servicioActual, videoBanner: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="metaTitle">Meta Title (SEO)</Label>
                    <Input
                      id="metaTitle"
                      value={servicioActual.metaTitle || ''}
                      onChange={(e) => setServicioActual({ ...servicioActual, metaTitle: e.target.value })}
                      placeholder="Título para Google"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ordenMostrar">Orden de Visualización</Label>
                    <Input
                      id="ordenMostrar"
                      type="number"
                      value={servicioActual.ordenMostrar}
                      onChange={(e) => setServicioActual({ ...servicioActual, ordenMostrar: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="metaDescription">Meta Description (SEO)</Label>
                  <Textarea
                    id="metaDescription"
                    value={servicioActual.metaDescription || ''}
                    onChange={(e) => setServicioActual({ ...servicioActual, metaDescription: e.target.value })}
                    placeholder="Descripción para Google (150-160 caracteres)"
                    rows={2}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="activo"
                    checked={servicioActual.activo}
                    onCheckedChange={(checked) => setServicioActual({ ...servicioActual, activo: checked })}
                  />
                  <Label htmlFor="activo">Página activa</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requisitos">
          <Card>
            <CardHeader>
              <CardTitle>Requisitos del Servicio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={nuevoRequisito}
                  onChange={(e) => setNuevoRequisito(e.target.value)}
                  placeholder="Agregar requisito..."
                  onKeyPress={(e) => e.key === 'Enter' && agregarRequisito()}
                />
                <Button onClick={agregarRequisito}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </div>

              <div className="space-y-2">
                {servicioActual.requisitos?.map((req, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="flex-1">{req}</span>
                    <Button variant="ghost" size="sm" onClick={() => eliminarRequisito(index)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="beneficios">
          <Card>
            <CardHeader>
              <CardTitle>Beneficios del Servicio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={nuevoBeneficio}
                  onChange={(e) => setNuevoBeneficio(e.target.value)}
                  placeholder="Agregar beneficio..."
                  onKeyPress={(e) => e.key === 'Enter' && agregarBeneficio()}
                />
                <Button onClick={agregarBeneficio}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </div>

              <div className="space-y-2">
                {servicioActual.beneficios?.map((ben, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    <span className="flex-1">{ben}</span>
                    <Button variant="ghost" size="sm" onClick={() => eliminarBeneficio(index)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="proceso">
          <Card>
            <CardHeader>
              <CardTitle>Pasos del Proceso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Input
                  value={nuevoPaso.titulo}
                  onChange={(e) => setNuevoPaso({ ...nuevoPaso, titulo: e.target.value })}
                  placeholder="Título del paso..."
                />
                <Input
                  value={nuevoPaso.descripcion}
                  onChange={(e) => setNuevoPaso({ ...nuevoPaso, descripcion: e.target.value })}
                  placeholder="Descripción del paso..."
                />
                <Button onClick={agregarPaso}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Paso
                </Button>
              </div>

              <div className="space-y-2">
                {servicioActual.pasos?.map((paso, index) => (
                  <div key={index} className="p-4 bg-secondary rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                            {index + 1}
                          </span>
                          <h4 className="font-semibold">{paso.titulo}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground ml-8">{paso.descripcion}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => eliminarPaso(index)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Preguntas Frecuentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Input
                  value={nuevaPregunta.pregunta}
                  onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, pregunta: e.target.value })}
                  placeholder="Pregunta..."
                />
                <Textarea
                  value={nuevaPregunta.respuesta}
                  onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, respuesta: e.target.value })}
                  placeholder="Respuesta..."
                  rows={3}
                />
                <Button onClick={agregarPregunta}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Pregunta
                </Button>
              </div>

              <div className="space-y-4">
                {servicioActual.preguntas?.map((faq, index) => (
                  <div key={index} className="p-4 bg-secondary rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <h4 className="font-semibold">❓ {faq.pregunta}</h4>
                        <p className="text-sm text-muted-foreground">{faq.respuesta}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => eliminarPregunta(index)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={cargarServicios}>
          Cancelar
        </Button>
        <Button onClick={guardarServicio} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  );
}
