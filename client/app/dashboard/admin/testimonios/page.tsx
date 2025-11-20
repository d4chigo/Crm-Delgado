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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

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

  // Calcular paginación
  const totalPages = Math.ceil(testimonios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const testimoniosPaginados = testimonios.slice(startIndex, endIndex);

  const cargarTestimonios = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Cargando testimonios...');
      
      // Usar la función api para construir la URL correctamente
      const token = getToken() || process.env.NEXT_PUBLIC_DEV_ADMIN_TOKEN;
      if (!token) return;

      const url = api('/admin/testimonials');
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
      // Mapear 'correo' a 'email' para compatibilidad con la interfaz
      const mappedData = data.map((t: any) => ({
        ...t,
        email: t.email || t.correo,
      }));
      setTestimonios(mappedData);
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
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'calificacion' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = currentTestimonio ? 'PATCH' : 'POST';
      const url = currentTestimonio 
        ? api(`/admin/testimonials/${currentTestimonio.id}`)
        : api('/admin/testimonials');
      
      const token = getToken();
      if (!token) return;

      // Preparar datos: convertir foto vacía a null
      const dataToSend = {
        ...formData,
        foto: formData.foto?.trim() ? formData.foto : null,
      };

      console.log('Enviando datos:', dataToSend);

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Error response:', errorData);
        
        // Intentar obtener el mensaje de error más descriptivo
        let errorMessage = errorData.message || errorData.error || 'Error al guardar el testimonio';
        
        // Si hay detalles de validación, agregarlos
        if (errorData.details && Array.isArray(errorData.details)) {
          const details = errorData.details.map((d: any) => `${d.path?.join('.') || 'campo'}: ${d.message}`).join(', ');
          errorMessage = `${errorMessage}: ${details}`;
        }
        
        throw new Error(errorMessage);
      }
      
      const responseData = await res.json();
      console.log('Respuesta exitosa:', responseData);
      
      toast.success(`Testimonio ${currentTestimonio ? 'actualizado' : 'creado'} correctamente`);
      setShowModal(false);
      cargarTestimonios();
    } catch (error) {
      console.error('Error al guardar testimonio:', error);
      let errorMessage = 'Error al guardar el testimonio';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        const err = error as any;
        errorMessage = err.error || err.message || JSON.stringify(error);
      }
      
      console.log('Error message final:', errorMessage);
      toast.error(errorMessage);
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
      const res = await fetch(api(`/admin/testimonials/${id}`), {
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
      const res = await fetch(api(`/admin/testimonials/${id}`), {
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#303030] uppercase tracking-wider bg-gray-100">Testimonio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#303030] uppercase tracking-wider bg-gray-100">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#303030] uppercase tracking-wider bg-gray-100">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {testimoniosPaginados.map((testimonio) => (
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
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-700 line-clamp-2 hover:line-clamp-none cursor-help" title={testimonio.testimonio}>
                          {testimonio.testimonio}
                        </p>
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
                      <div className="flex space-x-1 items-center">
                        <button
                          onClick={() => handleEdit(testimonio)}
                          className="p-1.5 text-gray-400 hover:text-[#FCBA00] hover:bg-yellow-50 rounded transition-colors"
                          title="Editar testimonio"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(testimonio.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Eliminar testimonio"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <div className="w-px h-5 bg-gray-200"></div>
                        {testimonio.estado !== 'APROBADO' && (
                          <button
                            onClick={() => cambiarEstado(testimonio.id, 'APROBADO')}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Aprobar testimonio"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                        {testimonio.estado !== 'RECHAZADO' && (
                          <button
                            onClick={() => cambiarEstado(testimonio.id, 'RECHAZADO')}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Rechazar testimonio"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Mostrando {startIndex + 1} a {Math.min(endIndex, testimonios.length)} de {testimonios.length} testimonios
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
                    value={String(formData.calificacion)}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={String(num)}>
                        {num} {num === 1 ? 'estrella' : 'estrellas'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Testimonio * 
                    <span className="text-xs text-gray-500 font-normal ml-2">
                      (Mínimo 10 caracteres)
                    </span>
                  </label>
                  <textarea
                    name="testimonio"
                    value={formData.testimonio}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                      formData.testimonio.length < 10 && formData.testimonio.length > 0
                        ? 'border-orange-300 focus:ring-orange-500'
                        : formData.testimonio.length >= 10
                        ? 'border-green-300 focus:ring-green-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    required
                  />
                  <div className="flex justify-between items-start mt-2">
                    <p className={`text-xs font-medium ${
                      formData.testimonio.length < 10 && formData.testimonio.length > 0
                        ? 'text-orange-600'
                        : formData.testimonio.length >= 10
                        ? 'text-green-600'
                        : 'text-gray-500'
                    }`}>
                      {formData.testimonio.length < 10 && formData.testimonio.length > 0 ? (
                        <>
                          ⚠️ Faltan {10 - formData.testimonio.length} caracteres
                        </>
                      ) : formData.testimonio.length >= 10 ? (
                        <>
                          ✓ Cumple el mínimo de caracteres
                        </>
                      ) : (
                        'Escribe al menos 10 caracteres'
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formData.testimonio.length}/10 caracteres
                    </p>
                  </div>
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
                  disabled={formData.testimonio.length < 10}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium transition-colors ${
                    formData.testimonio.length < 10
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'text-[#303030] bg-[#FCBA00] hover:bg-[#e6a800] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FCBA00]'
                  }`}
                  title={formData.testimonio.length < 10 ? `Faltan ${10 - formData.testimonio.length} caracteres` : ''}
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
