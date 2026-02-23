'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Briefcase,
  Search,
  Plus,
  Clock,
  DollarSign,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
} from 'lucide-react';
import { formatCurrency, formatCLP } from '@/lib/utils';
import { api } from '@/lib/api';
import { Service } from '@/types';

// Modal para agregar/editar servicio
const ServiceModal = ({ 
  isOpen, 
  onClose, 
  service, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  service?: Service | null; 
  onSave: () => void; 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    duration_minutes: 60,
    price: 0,
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const categories = [
    'Tratamientos Faciales',
    'Servicios de Cabello',
    'Terapia de Masajes',
    'Servicios de Uñas',
    'Tratamientos Corporales',
    'Depilación',
    'Estética',
    'Otros'
  ];

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        category: service.category || '',
        duration_minutes: service.duration_minutes || 60,
        price: service.price || 0,
        is_active: service.is_active ?? true
      });
    } else {
      setFormData({
        name: '',
        category: '',
        duration_minutes: 60,
        price: 0,
        is_active: true
      });
    }
  }, [service]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (service) {
        await api.put(`/services/${service.id}`, formData);
      } else {
        await api.post('/services', formData);
      }
      onSave();
      onClose();
    } catch (error: any) {
      setErrors(error.response?.data?.errors || {});
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {service ? 'Editar Servicio' : 'Nuevo Servicio'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre del Servicio</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Facial Hidratante"
              required
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name[0]}</p>
            )}
          </div>

          <div>
            <Label htmlFor="category">Categoría</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              required
            >
              <option value="">Seleccionar categoría</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && (
              <p className="text-sm text-red-600 mt-1">{errors.category[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration_minutes">Duración (minutos)</Label>
              <Input
                id="duration_minutes"
                type="number"
                min="15"
                max="480"
                step="15"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                required
              />
              {errors.duration_minutes && (
                <p className="text-sm text-red-600 mt-1">{errors.duration_minutes[0]}</p>
              )}
            </div>

            <div>
              <Label htmlFor="price">Precio</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="1000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                placeholder="0"
                required
              />
              {errors.price && (
                <p className="text-sm text-red-600 mt-1">{errors.price[0]}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
              className="flex items-center space-x-2"
            >
              {formData.is_active ? (
                <ToggleRight className="h-5 w-5 text-green-600" />
              ) : (
                <ToggleLeft className="h-5 w-5 text-gray-400" />
              )}
              <span className="text-sm font-medium">
                {formData.is_active ? 'Servicio Activo' : 'Servicio Inactivo'}
              </span>
            </button>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {loading ? 'Guardando...' : service ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ServiceActions = ({ 
  service, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}: { 
  service: Service; 
  onEdit: () => void; 
  onDelete: () => void; 
  onToggleStatus: () => void; 
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowMenu(!showMenu)}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
      
      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
          <div className="py-1">
            <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <Eye className="mr-2 h-4 w-4" />
              Ver Detalles
            </button>
            <button 
              onClick={onEdit}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar Servicio
            </button>
            <button 
              onClick={onToggleStatus}
              className="flex items-center w-full px-4 py-2 text-sm text-blue-700 hover:bg-gray-100"
            >
              {service.is_active ? <ToggleLeft className="mr-2 h-4 w-4" /> : <ToggleRight className="mr-2 h-4 w-4" />}
              {service.is_active ? 'Desactivar' : 'Activar'}
            </button>
            <button 
              onClick={onDelete}
              className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar Servicio
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ServiceStatusBadge = ({ isActive }: { isActive: boolean }) => {
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
      isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {isActive ? 'Activo' : 'Inactivo'}
    </span>
  );
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Cargar servicios desde la API
  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/services');
      setServices(response.data.data);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Cambiar estado del servicio
  const handleToggleStatus = async (service: Service) => {
    try {
      await api.put(`/services/${service.id}`, { 
        ...service, 
        is_active: !service.is_active 
      });
      fetchServices();
    } catch (error) {
      alert('Error al cambiar el estado del servicio');
    }
  };

  // Eliminar servicio
  const handleDelete = async (service: Service) => {
    if (confirm(`¿Está seguro de que desea eliminar el servicio "${service.name}"?`)) {
      try {
        await api.delete(`/services/${service.id}`);
        fetchServices();
      } catch (error) {
        alert('Error al eliminar el servicio');
      }
    }
  };

  const categories = Array.from(new Set(services.map(s => s.category))).filter(Boolean);

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && service.is_active) ||
                         (statusFilter === 'inactive' && !service.is_active);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Servicios</h1>
          <p className="text-gray-600 mt-1">Gestiona tu catálogo de servicios</p>
        </div>
        <Button 
          onClick={() => {
            setSelectedService(null);
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Servicio
        </Button>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Servicios</p>
                <p className="text-2xl font-bold">{services.length}</p>
                <div className="flex items-center text-sm text-blue-600">
                  <span>{services.filter(s => s.is_active).length} activos</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Briefcase className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Precio Promedio</p>
                <p className="text-2xl font-bold">
                  {formatCLP(services.reduce((sum, s) => sum + s.price, 0) / services.length || 0)}
                </p>
                <div className="flex items-center text-sm text-green-600">
                  <span>Por servicio</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Duración Promedio</p>
                <p className="text-2xl font-bold">
                  {Math.round(services.reduce((sum, s) => sum + s.duration_minutes, 0) / services.length || 0)} min
                </p>
                <div className="flex items-center text-sm text-purple-600">
                  <span>Por sesión</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categorías</p>
                <p className="text-2xl font-bold">{categories.length}</p>
                <div className="flex items-center text-sm text-orange-600">
                  <span>Diferentes tipos</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <Briefcase className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar Servicios</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Buscar por nombre o categoría..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <select
                id="category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">Todas las Categorías</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">Todos los Estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                Exportar Servicios
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Servicios */}
      <Card>
        <CardHeader>
          <CardTitle>Servicios ({filteredServices.length})</CardTitle>
          <CardDescription>
            Mostrando {filteredServices.length} de {services.length} servicios
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServices.map((service) => (
                <Card key={service.id} className="hover-lift">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">
                          {service.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{service.category}</p>
                        <ServiceStatusBadge isActive={service.is_active} />
                      </div>
                      <ServiceActions
                        service={service}
                        onEdit={() => {
                          setSelectedService(service);
                          setShowModal(true);
                        }}
                        onDelete={() => handleDelete(service)}
                        onToggleStatus={() => handleToggleStatus(service)}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{service.duration_minutes} minutos</span>
                        </div>
                        <div className="flex items-center text-lg font-bold text-gray-900">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span>{formatCLP(service.price)}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-500">
                          Creado: {new Date(service.created_at).toLocaleDateString('es-CL')}
                        </div>
                        {service.updated_at !== service.created_at && (
                          <div className="text-xs text-gray-500">
                            Actualizado: {new Date(service.updated_at).toLocaleDateString('es-CL')}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredServices.length === 0 && !loading && (
                <div className="col-span-full text-center py-12">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron servicios</h3>
                  <p className="text-gray-600 mb-4">Intenta ajustar tus criterios de búsqueda</p>
                  <Button onClick={() => setShowModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Nuevo Servicio
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Servicios por Categoría */}
      {categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Servicios por Categoría</CardTitle>
            <CardDescription>Distribución de servicios por categoría</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(category => {
                const categoryServices = services.filter(s => s.category === category);
                const activeServices = categoryServices.filter(s => s.is_active);
                const avgPrice = categoryServices.reduce((sum, s) => sum + s.price, 0) / categoryServices.length;
                
                return (
                  <div key={category} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{category}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-medium">{categoryServices.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Activos:</span>
                        <span className="font-medium text-green-600">{activeServices.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Precio promedio:</span>
                        <span className="font-medium">{formatCLP(avgPrice)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      <ServiceModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedService(null);
        }}
        service={selectedService}
        onSave={fetchServices}
      />
    </div>
  );
}