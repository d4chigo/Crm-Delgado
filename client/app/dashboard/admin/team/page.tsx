'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import { useAuthToken } from '@/hooks/useAuthToken';

interface MiembroEquipo {
  id: number;
  nombre: string;
  cargo: string;
  descripcion: string;
  correo?: string;
  telefono?: string;
  foto: string | null;
  activo: boolean;
  orden_mostrar: number;
  facebook?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  creado_en: string;
  actualizado_en?: string | null;
}

export default function TeamPage() {
  const { getToken } = useAuthToken();
  const [miembros, setMiembros] = useState<MiembroEquipo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentMiembro, setCurrentMiembro] = useState<MiembroEquipo | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState<Omit<MiembroEquipo, 'id' | 'creado_en' | 'actualizado_en'>>({
    nombre: '',
    cargo: '',
    descripcion: '',
    correo: '',
    telefono: '',
    foto: null,
    activo: true,
    orden_mostrar: 0,
    facebook: null,
    instagram: null,
    tiktok: null,
  });
  const [error, setError] = useState<string | null>(null);

  // Calcular paginación
  const totalPages = Math.ceil(miembros.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const miembrosPaginados = miembros.slice(startIndex, endIndex);

  const cargarMiembros = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getToken();
      if (!token) return;

      const url = api('/admin/team');
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      // Mapear los datos para que coincidan con la interfaz
      const miembrosFormateados = data.map((miembro: any) => ({
        ...miembro,
        nombre: miembro.name || '',
        cargo: miembro.position || '',
        descripcion: miembro.description || '',
        correo: miembro.email || '',
        telefono: miembro.phone || '',
        foto: miembro.photo || null,
        activo: miembro.active !== undefined ? miembro.active : true,
        orden_mostrar: miembro.display_order || 0,
        facebook: miembro.facebook_url || null,
        instagram: miembro.instagram_url || null,
        tiktok: miembro.tiktok_url || null,
        creado_en: miembro.created_at || new Date().toISOString(),
        actualizado_en: miembro.updated_at || null,
      }));
      
      setMiembros(miembrosFormateados);
    } catch (error) {
      console.error('Error al cargar miembros del equipo:', error);
      setError('No se pudieron cargar los miembros del equipo. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMiembros();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Validaciones según el campo
    if (name === 'nombre' || name === 'cargo') {
      // Solo aceptar letras, espacios y algunos caracteres especiales comunes en nombres
      const sanitized = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: sanitized
      }));
    } else if (name === 'telefono') {
      // Solo aceptar números y algunos caracteres de formato telefónico
      const sanitized = value.replace(/[^0-9+\-\s()]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: sanitized
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getToken();
      if (!token) return;

      const url = currentMiembro 
        ? api(`/admin/team/${currentMiembro.id}`)
        : api('/admin/team');

      const method = currentMiembro ? 'PUT' : 'POST';
      
      // Mapear los datos al formato esperado por la API
      const datosParaEnviar = {
        name: formData.nombre,
        position: formData.cargo,
        description: formData.descripcion,
        email: formData.correo || null,
        phone: formData.telefono || null,
        photo: formData.foto,
        active: formData.activo,
        display_order: Number(formData.orden_mostrar) || 0,  // ← Convertir a número
        facebook_url: formData.facebook,
        instagram_url: formData.instagram,
        tiktok_url: formData.tiktok,
      };
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(datosParaEnviar),
      });

      // Log de la respuesta para debugging
      console.log('Response status:', res.status);
      console.log('Response statusText:', res.statusText);
      console.log('URL enviada:', url);
      console.log('Método:', method);
      console.log('Datos enviados:', JSON.stringify(datosParaEnviar, null, 2));
      
      let errorData = {};
      try {
        errorData = await res.json();
        console.log('Response data:', errorData);
        
        // Si hay details de validación, mostrarlos
        if ((errorData as any).details && Array.isArray((errorData as any).details)) {
          console.log('Errores de validación:');
          (errorData as any).details.forEach((detail: any, index: number) => {
            console.log(`  ${index + 1}. ${detail.message || detail.code || JSON.stringify(detail)}`);
          });
        }
      } catch (e) {
        console.log('Could not parse response as JSON');
      }

      if (!res.ok) {
        const errorMessage = (errorData as any).message || (errorData as any).error || `Error ${res.status}: ${res.statusText}`;
        console.error('Error detallado:', errorMessage);
        throw new Error(errorMessage);
      }
      
      toast.success(`Miembro ${currentMiembro ? 'actualizado' : 'agregado'} correctamente`);
      setShowModal(false);
      cargarMiembros();
    } catch (error) {
      console.error('Error al guardar miembro:', error);
      toast.error(error instanceof Error ? error.message : 'Error al guardar el miembro del equipo');
    }
  };

  const handleEdit = (miembro: MiembroEquipo) => {
    setCurrentMiembro(miembro);
    setFormData({
      nombre: miembro.nombre,
      cargo: miembro.cargo,
      descripcion: miembro.descripcion || '',
      correo: miembro.correo || '',
      telefono: miembro.telefono || '',
      foto: miembro.foto,
      activo: miembro.activo,
      orden_mostrar: miembro.orden_mostrar,
      facebook: miembro.facebook || null,
      instagram: miembro.instagram || null,
      tiktok: miembro.tiktok || null,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este miembro del equipo?')) return;
    
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(api(`/admin/team/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Error al eliminar el miembro');
      
      toast.success('Miembro eliminado correctamente');
      cargarMiembros();
    } catch (error) {
      console.error('Error al eliminar miembro:', error);
      toast.error('Error al eliminar el miembro del equipo');
    }
  };

  const handleFotoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      foto: value || null
    }));
  };

  const handleChangeOrder = async (miembroId: number, direction: 'up' | 'down') => {
    const token = getToken();
    if (!token) return;

    const miembroIndex = miembros.findIndex(m => m.id === miembroId);
    if (miembroIndex === -1) return;

    // Validar límites
    if (direction === 'up' && miembroIndex === 0) {
      toast.warning('Este miembro ya está al principio');
      return;
    }
    if (direction === 'down' && miembroIndex === miembros.length - 1) {
      toast.warning('Este miembro ya está al final');
      return;
    }

    try {
      const otherIndex = direction === 'up' ? miembroIndex - 1 : miembroIndex + 1;
      const currentOrden = miembros[miembroIndex].orden_mostrar;
      const otherOrden = miembros[otherIndex].orden_mostrar;

      // Intercambiar órdenes
      const updatedMiembros = [...miembros];
      [updatedMiembros[miembroIndex].orden_mostrar, updatedMiembros[otherIndex].orden_mostrar] = 
      [otherOrden, currentOrden];

      // Actualizar ambos miembros
      await Promise.all([
        fetch(api(`/admin/team/${miembros[miembroIndex].id}`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: miembros[miembroIndex].nombre,
            position: miembros[miembroIndex].cargo,
            description: miembros[miembroIndex].descripcion,
            display_order: otherOrden,
            active: miembros[miembroIndex].activo,
          }),
        }),
        fetch(api(`/admin/team/${miembros[otherIndex].id}`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: miembros[otherIndex].nombre,
            position: miembros[otherIndex].cargo,
            description: miembros[otherIndex].descripcion,
            display_order: currentOrden,
            active: miembros[otherIndex].activo,
          }),
        }),
      ]);

      toast.success('Orden actualizado correctamente');
      cargarMiembros();
    } catch (error) {
      console.error('Error al cambiar orden:', error);
      toast.error('Error al cambiar el orden del miembro');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#303030]">Gestión de Equipo</h1>
        <button
          onClick={() => {
            setCurrentMiembro(null);
            // Calcular automáticamente el siguiente orden
            const maxOrden = miembros.length > 0 
              ? Math.max(...miembros.map(m => m.orden_mostrar)) 
              : -1;
            setFormData({
              nombre: '',
              cargo: '',
              descripcion: '',
              correo: '',
              telefono: '',
              foto: null,
              activo: true,
              orden_mostrar: maxOrden + 1,
              facebook: null,
              instagram: null,
              tiktok: null,
            });
            setShowModal(true);
          }}
          className="bg-[#FCBA00] text-[#303030] px-4 py-2 rounded hover:bg-[#e6a800] transition-colors font-medium"
        >
          Nuevo Miembro
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FCBA00]"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#303030] uppercase tracking-wider">Foto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#303030] uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#303030] uppercase tracking-wider">Cargo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#303030] uppercase tracking-wider">Orden</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#303030] uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {miembrosPaginados.map((miembro) => (
                  <tr key={miembro.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {miembro.foto ? (
                        <img 
                          className="h-10 w-10 rounded-full object-cover" 
                          src={miembro.foto} 
                          alt={miembro.nombre} 
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {miembro.nombre.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {miembro.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {miembro.cargo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {miembro.orden_mostrar}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2 items-center">
                        <button
                          onClick={() => handleChangeOrder(miembro.id, 'up')}
                          disabled={miembrosPaginados[0]?.id === miembro.id}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Mover arriba"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleChangeOrder(miembro.id, 'down')}
                          disabled={miembrosPaginados[miembrosPaginados.length - 1]?.id === miembro.id}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Mover abajo"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <div className="w-px h-5 bg-gray-200"></div>
                        <button
                          onClick={() => handleEdit(miembro)}
                          className="p-1.5 text-gray-400 hover:text-[#FCBA00] hover:bg-yellow-50 rounded transition-colors"
                          title="Editar miembro"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(miembro.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Eliminar miembro"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {miembros.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No hay miembros en el equipo
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Mostrando {startIndex + 1} a {Math.min(endIndex, miembros.length)} de {miembros.length} miembros
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Anterior
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-[#FCBA00] text-[#303030]'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de formulario */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {currentMiembro ? 'Editar Miembro' : 'Nuevo Miembro'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de Foto
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="h-20 w-20 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                      {formData.foto ? (
                        <img 
                          src={formData.foto} 
                          alt="Preview" 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-400">
                          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <input
                      type="url"
                      name="foto"
                      value={formData.foto || ''}
                      onChange={handleFotoUrlChange}
                      placeholder="https://ejemplo.com/foto.jpg"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FCBA00] focus:border-[#FCBA00]"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Ingresa la URL completa de la imagen
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FCBA00] focus:border-[#FCBA00]"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cargo *
                  </label>
                  <input
                    type="text"
                    name="cargo"
                    value={formData.cargo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FCBA00] focus:border-[#FCBA00]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, correo: e.target.value }))}
                    placeholder="correo@ejemplo.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FCBA00] focus:border-[#FCBA00]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono || ''}
                    onChange={handleInputChange}
                    placeholder="+51 999 999 999"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FCBA00] focus:border-[#FCBA00]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Orden (Automático)
                  </label>
                  <input
                    type="number"
                    name="orden_mostrar"
                    value={formData.orden_mostrar}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Se asigna automáticamente
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FCBA00] focus:border-[#FCBA00]"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FCBA00] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-[#303030] bg-[#FCBA00] hover:bg-[#e6a800] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FCBA00] transition-colors"
                >
                  {currentMiembro ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
