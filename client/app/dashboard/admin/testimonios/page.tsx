'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';

interface Testimonio {
  id: number;
  nombre: string;
  email: string;
  calificacion: number;
  testimonio: string;
  foto: string | null;
  estado: 'APROBADO' | 'PENDIENTE' | 'RECHAZADO';
  creadoEn: string;
}

import { useAuthToken } from '@/hooks/useAuthToken';

const TestimoniosPage: React.FC = () => {
  const { getToken } = useAuthToken();
  const [testimonios, setTestimonios] = useState<Testimonio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentTestimonio, setCurrentTestimonio] = useState<Testimonio | null>(null);

  const [formData, setFormData] = useState<{
    nombre: string;
    email: string;
    calificacion: number;
    testimonio: string;
    foto: string;
    estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  }>({
    nombre: '',
    email: '',
    calificacion: 5,
    testimonio: '',
    foto: '',
    estado: 'PENDIENTE',
  });

  const [error, setError] = useState<string | null>(null);

  const cargarTestimonios = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Cargando testimonios...');
      
      // Usar la función api para construir la URL correctamente
      const token = getToken() || process.env.NEXT_PUBLIC_DEV_ADMIN_TOKEN;
      if (!token) return;

      const url = api('/api/admin/testimonials');
      console.log('Fetching testimonials from:', url);
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
      console.log('Datos recibidos:', data);
      setTestimonios(data);
    } catch (error) {
      console.error('Error al cargar testimonios:', error);
      setError('No se pudieron cargar los testimonios. Intente nuevamente.');
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTestimonios();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = currentTestimonio ? 'PATCH' : 'POST';
      const url = currentTestimonio 
        ? api(`/api/admin/testimonials/${currentTestimonio.id}`)
        : api('/api/admin/testimonials');
      
      const token = getToken();
      if (!token) return;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Error al guardar el testimonio');
      
      toast.success(`Testimonio ${currentTestimonio ? 'actualizado' : 'creado'} correctamente`);
      setShowModal(false);
      cargarTestimonios();
    } catch (error) {
      console.error('Error al guardar testimonio:', error);
      toast.error('Error al guardar el testimonio');
    }
  };

  const handleEdit = (testimonio: Testimonio) => {
    setCurrentTestimonio(testimonio);
    setFormData({
      nombre: testimonio.nombre,
      email: testimonio.email,
      calificacion: testimonio.calificacion,
      testimonio: testimonio.testimonio,
      foto: testimonio.foto || '',
      estado: testimonio.estado as 'PENDIENTE' | 'APROBADO' | 'RECHAZADO',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este testimonio?')) return;
    
    const token = getToken() || process.env.NEXT_PUBLIC_DEV_ADMIN_TOKEN;
    if (!token) return;

    try {
      const res = await fetch(api(`/api/admin/testimonials/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Error al eliminar el testimonio');
      
      toast.success('Testimonio eliminado correctamente');
      cargarTestimonios();
    } catch (error) {
      console.error('Error al eliminar testimonio:', error);
      toast.error('Error al eliminar el testimonio');
    }
  };

  const cambiarEstado = async (id: number, nuevoEstado: 'APROBADO' | 'RECHAZADO' | 'PENDIENTE') => {
    const token = getToken() || process.env.NEXT_PUBLIC_DEV_ADMIN_TOKEN;
    if (!token) return;

    try {
      const res = await fetch(api(`/api/admin/testimonials/${id}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!res.ok) throw new Error('Error al actualizar el estado');
      
      toast.success('Estado actualizado correctamente');
      cargarTestimonios();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      toast.error('Error al actualizar el estado');
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
        <h1 className="text-2xl font-bold">Gestión de Testimonios</h1>
        <button
          onClick={() => {
            setCurrentTestimonio(null);
            setFormData({
              nombre: '',
              email: '',
              calificacion: 5,
              testimonio: '',
              foto: '',
              estado: 'PENDIENTE',
            });
            setShowModal(true);
          }}
          className="bg-[#FCBA00] text-[#303030] px-4 py-2 rounded hover:bg-[#e6a800] transition-colors font-medium"
        >
          Nuevo Testimonio
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#303030] uppercase tracking-wider bg-gray-100">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#303030] uppercase tracking-wider bg-gray-100">Calificación</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#303030] uppercase tracking-wider bg-gray-100">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#303030] uppercase tracking-wider bg-gray-100">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {testimonios.map((testimonio) => (
                  <tr key={testimonio.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {testimonio.foto ? (
                          <img 
                            className="h-10 w-10 rounded-full object-cover" 
                            src={testimonio.foto} 
                            alt={testimonio.nombre} 
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            {testimonio.nombre.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{testimonio.nombre}</div>
                          <div className="text-sm text-gray-500">{testimonio.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`h-5 w-5 ${i < testimonio.calificacion ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        testimonio.estado === 'APROBADO' 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : testimonio.estado === 'RECHAZADO'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      }`}>
                        {testimonio.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(testimonio)}
                          className="text-[#303030] hover:text-[#FCBA00] transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(testimonio.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          Eliminar
                        </button>
                        {testimonio.estado !== 'APROBADO' && (
                          <button
                            onClick={() => cambiarEstado(testimonio.id, 'APROBADO')}
                            className="text-green-600 hover:text-green-800 transition-colors"
                          >
                            Aprobar
                          </button>
                        )}
                        {testimonio.estado !== 'RECHAZADO' && (
                          <button
                            onClick={() => cambiarEstado(testimonio.id, 'RECHAZADO')}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            Rechazar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de formulario */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {currentTestimonio ? 'Editar Testimonio' : 'Nuevo Testimonio'}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calificación (1-5)
                  </label>
                  <select
                    name="calificacion"
                    value={formData.calificacion}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'estrella' : 'estrellas'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Testimonio *
                  </label>
                  <textarea
                    name="testimonio"
                    value={formData.testimonio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de la Foto (opcional)
                  </label>
                  <input
                    type="url"
                    name="foto"
                    value={formData.foto}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://ejemplo.com/foto.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="APROBADO">Aprobado</option>
                    <option value="RECHAZADO">Rechazado</option>
                  </select>
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
                  {currentTestimonio ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimoniosPage;
