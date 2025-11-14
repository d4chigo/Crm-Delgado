"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import { otrosServiciosService, type OtroServicio } from '@/services/api/otrosServicios.service';

export default function OtrosServiciosPage() {
  const [servicios, setServicios] = useState<OtroServicio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentServicio, setCurrentServicio] = useState<OtroServicio | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState<Omit<OtroServicio, 'id'>>({
    titulo: '',
    descripcion: '',
    caracteristicas: [],
    imagenes: [],
    enlaceVideo: '',
  });

  // Cargar servicios al montar el componente
  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = async () => {
    try {
      setLoading(true);
      const data = await otrosServiciosService.obtenerTodos();
      setServicios(data);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
      toast.error('Error al cargar los servicios');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (currentServicio) {
        // Actualizar servicio existente
        await otrosServiciosService.actualizar(currentServicio.id, formData);
        toast.success('Servicio actualizado correctamente');
      } else {
        // Crear nuevo servicio
        await otrosServiciosService.crear(formData);
        toast.success('Servicio creado correctamente');
      }
      
      setShowModal(false);
      cargarServicios();
    } catch (error) {
      console.error('Error al guardar el servicio:', error);
      toast.error('Error al guardar el servicio');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (servicio: OtroServicio) => {
    setCurrentServicio(servicio);
    setFormData({
      titulo: servicio.titulo,
      descripcion: servicio.descripcion || '',
      caracteristicas: servicio.caracteristicas || [],
      imagenes: servicio.imagenes || [],
      enlaceVideo: servicio.enlaceVideo || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
      try {
        setLoading(true);
        await otrosServiciosService.eliminar(id);
        toast.success('Servicio eliminado correctamente');
        cargarServicios();
      } catch (error) {
        console.error('Error al eliminar el servicio:', error);
        toast.error('Error al eliminar el servicio');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleNuevoServicio = () => {
    setCurrentServicio(null);
    setFormData({
      titulo: '',
      descripcion: '',
      caracteristicas: [],
      imagenes: [],
      enlaceVideo: '',
    });
    setShowModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#303030]">Gestión de Otros Servicios</h1>
        <button
          onClick={handleNuevoServicio}
          className="bg-[#FCBA00] text-[#303030] px-4 py-2 rounded hover:bg-[#e6a800] transition-colors font-medium flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-1" /> Nuevo Servicio
        </button>
      </div>

      {loading && servicios.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FCBA00]"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {servicios.map((servicio) => (
                  <tr key={servicio.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{servicio.titulo}</div>
                      {servicio.descripcion && (
                        <div className="text-sm text-gray-500 line-clamp-2">{servicio.descripcion}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(servicio)}
                        className="text-[#FCBA00] hover:text-[#e6a800] mr-4"
                        title="Editar"
                      >
                        <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => servicio.id && handleDelete(servicio.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {servicios.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                      No hay servicios registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal para agregar/editar servicio */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                {currentServicio ? 'Editar Servicio' : 'Nuevo Servicio'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Título */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FCBA00] focus:border-[#FCBA00] bg-white"
                    required
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FCBA00] focus:border-[#FCBA00] bg-white"
                  />
                </div>

                {/* Características dinámicas */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Características
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          caracteristicas: [...(prev.caracteristicas || []), '']
                        }));
                      }}
                      className="text-xs bg-[#FCBA00] text-gray-900 px-2 py-1 rounded hover:bg-[#e6a800] transition-colors"
                    >
                      + Agregar
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(formData.caracteristicas || []).map((caracteristica, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={caracteristica}
                          onChange={(e) => {
                            const newCaracteristicas = [...(formData.caracteristicas || [])];
                            newCaracteristicas[index] = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              caracteristicas: newCaracteristicas
                            }));
                          }}
                          placeholder="Ej: Mediciones precisas de terrenos"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FCBA00] focus:border-[#FCBA00] bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newCaracteristicas = (formData.caracteristicas || []).filter((_, i) => i !== index);
                            setFormData(prev => ({
                              ...prev,
                              caracteristicas: newCaracteristicas
                            }));
                          }}
                          className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Imágenes dinámicas */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Imágenes para galería
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          imagenes: [...(prev.imagenes || []), '']
                        }));
                      }}
                      className="text-xs bg-[#FCBA00] text-gray-900 px-2 py-1 rounded hover:bg-[#e6a800] transition-colors"
                    >
                      + Agregar
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(formData.imagenes || []).map((imagen, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="url"
                          value={imagen}
                          onChange={(e) => {
                            const newImagenes = [...(formData.imagenes || [])];
                            newImagenes[index] = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              imagenes: newImagenes
                            }));
                          }}
                          placeholder="https://ejemplo.com/imagen.jpg"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FCBA00] focus:border-[#FCBA00] bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newImagenes = (formData.imagenes || []).filter((_, i) => i !== index);
                            setFormData(prev => ({
                              ...prev,
                              imagenes: newImagenes
                            }));
                          }}
                          className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Video */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL del video (opcional)
                  </label>
                  <input
                    type="url"
                    name="enlaceVideo"
                    value={formData.enlaceVideo || ''}
                    onChange={handleInputChange}
                    placeholder="https://youtube.com/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FCBA00] focus:border-[#FCBA00] bg-white"
                  />
                </div>

                {/* Botones */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FCBA00]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#FCBA00] hover:bg-[#e6a800] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FCBA00] disabled:opacity-50"
                  >
                    {loading ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
