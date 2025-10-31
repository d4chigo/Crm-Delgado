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

  const cargarMiembros = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getToken();
      if (!token) return;

      const url = api('/api/admin/team');
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getToken();
      if (!token) return;

      const url = currentMiembro 
        ? api(`/api/admin/team/${currentMiembro.id}`)
        : api('/api/admin/team');

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
        display_order: formData.orden_mostrar,
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

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al guardar el miembro del equipo');
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
      const res = await fetch(api(`/api/admin/team/${id}`), {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          foto: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
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
            setFormData({
              nombre: '',
              cargo: '',
              descripcion: '',
              foto: null,
              orden_mostrar: 0,
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
                {miembros.map((miembro) => (
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
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEdit(miembro)}
                          className="text-[#303030] hover:text-[#FCBA00] transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(miembro.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          Eliminar
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
        </div>
      )}

      {/* Modal de formulario */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
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
                    Foto
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="h-20 w-20 rounded-full bg-gray-100 overflow-hidden">
                      {formData.foto ? (
                        <img 
                          src={formData.foto} 
                          alt="Preview" 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-400">
                          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                        Subir Imagen
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="mt-1 text-xs text-gray-500">
                        PNG, JPG, GIF (Máx. 2MB)
                      </p>
                    </div>
                  </div>
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
                    Orden
                  </label>
                  <input
                    type="number"
                    name="orden_mostrar"
                    value={formData.orden_mostrar}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FCBA00] focus:border-[#FCBA00]"
                  />
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
