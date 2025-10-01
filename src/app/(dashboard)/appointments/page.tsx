'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  X,
} from 'lucide-react';
import { formatDateTime, formatCurrency } from '@/lib/utils';
import { api } from '@/lib/api';
import { Appointment, Client, Service, User } from '@/types';

// Modal para agregar/editar cita
const AppointmentModal = ({ 
  isOpen, 
  onClose, 
  appointment, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  appointment?: Appointment | null; 
  onSave: () => void; 
}) => {
  const [formData, setFormData] = useState({
    client_id: '',
    service_id: '',
    user_id: '',
    start_time: '',
    end_time: '',
    notes: ''
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    // Cargar datos necesarios para el formulario
    const loadFormData = async () => {
      try {
        const [clientsRes, servicesRes] = await Promise.all([
          api.get('/clients'),
          api.get('/services'),
        ]);
        console.log("clientes: ",clientsRes.data.data);
        setClients(clientsRes.data.data);
        setServices(servicesRes.data.data);
      } catch (error) {
        console.error('Error cargando datos del formulario:', error);
      }
    };

    if (isOpen) {
      loadFormData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (appointment) {
      setFormData({
        client_id: appointment.client_id?.toString() || '',
        service_id: appointment.service_id?.toString() || '',
        user_id: appointment.user_id?.toString() || '',
        start_time: appointment.start_time?.slice(0, 16) || '',
        end_time: appointment.end_time?.slice(0, 16) || '',
        notes: appointment.notes || ''
      });
    } else {
      setFormData({
        client_id: '',
        service_id: '',
        user_id: '',
        start_time: '',
        end_time: '',
        notes: ''
      });
    }
  }, [appointment]);

  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s.id.toString() === serviceId);
    if (service && formData.start_time) {
      const startTime = new Date(formData.start_time);
      const endTime = new Date(startTime.getTime() + service.duration_minutes * 60000);
      setFormData({
        ...formData,
        service_id: serviceId,
        end_time: endTime.toISOString().slice(0, 16)
      });
    } else {
      setFormData({ ...formData, service_id: serviceId });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const data = {
        ...formData,
        client_id: parseInt(formData.client_id),
        service_id: parseInt(formData.service_id),
        user_id: parseInt(formData.user_id),
      };

      if (appointment) {
        await api.put(`/appointments/${appointment.id}`, data);
      } else {
        await api.post('/appointments', data);
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
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {appointment ? 'Editar Cita' : 'Nueva Cita'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client_id">Cliente</Label>
              <select
                id="client_id"
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                required
              >
                <option value="">Seleccionar cliente</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
              {errors.client_id && (
                <p className="text-sm text-red-600 mt-1">{errors.client_id[0]}</p>
              )}
            </div>

            <div>
              <Label htmlFor="service_id">Servicio</Label>
              <select
                id="service_id"
                value={formData.service_id}
                onChange={(e) => handleServiceChange(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                required
              >
                <option value="">Seleccionar servicio</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {formatCurrency(service.price)}
                  </option>
                ))}
              </select>
              {errors.service_id && (
                <p className="text-sm text-red-600 mt-1">{errors.service_id[0]}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="user_id">Personal</Label>
            <select
              id="user_id"
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              required
            >
              <option value="">Seleccionar personal</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            {errors.user_id && (
              <p className="text-sm text-red-600 mt-1">{errors.user_id[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_time">Fecha y Hora de Inicio</Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
              {errors.start_time && (
                <p className="text-sm text-red-600 mt-1">{errors.start_time[0]}</p>
              )}
            </div>

            <div>
              <Label htmlFor="end_time">Fecha y Hora de Fin</Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required
              />
              {errors.end_time && (
                <p className="text-sm text-red-600 mt-1">{errors.end_time[0]}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notas</Label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas adicionales sobre la cita..."
              className="w-full min-h-[80px] px-3 py-2 border border-input rounded-md text-sm"
            />
            {errors.notes && (
              <p className="text-sm text-red-600 mt-1">{errors.notes[0]}</p>
            )}
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
              {loading ? 'Guardando...' : appointment ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    no_show: 'bg-gray-100 text-gray-800',
  };

  const statusText = {
    scheduled: 'Programada',
    completed: 'Completada',
    cancelled: 'Cancelada',
    no_show: 'No Asistió',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
      {statusText[status as keyof typeof statusText]}
    </span>
  );
};

const AppointmentActions = ({ 
  appointment, 
  onEdit, 
  onDelete, 
  onChangeStatus 
}: { 
  appointment: Appointment; 
  onEdit: () => void; 
  onDelete: () => void; 
  onChangeStatus: (status: string) => void; 
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
              Editar
            </button>
            {appointment.status === 'scheduled' && (
              <>
                <button 
                  onClick={() => onChangeStatus('completed')}
                  className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-gray-100"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Marcar Completada
                </button>
                <button 
                  onClick={() => onChangeStatus('cancelled')}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancelar
                </button>
              </>
            )}
            <button 
              onClick={onDelete}
              className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Cargar citas desde la API
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/appointments', {
        params: {
          include: 'client,service,user',
          date_filter: dateFilter !== 'all' ? dateFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        }
      });
      setAppointments(response.data.data);
    } catch (error) {
      console.error('Error al cargar citas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, dateFilter]);

  // Cambiar estado de la cita
  const handleChangeStatus = async (appointment: Appointment, status: string) => {
    try {
      await api.put(`/appointments/${appointment.id}`, { status });
      fetchAppointments();
    } catch (error) {
      alert('Error al cambiar el estado de la cita');
    }
  };

  // Eliminar cita
  const handleDelete = async (appointment: Appointment) => {
    if (confirm(`¿Está seguro de que desea eliminar esta cita?`)) {
      try {
        await api.delete(`/appointments/${appointment.id}`);
        fetchAppointments();
      } catch (error) {
        alert('Error al eliminar la cita');
      }
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.client?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         appointment.service?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         appointment.user?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Citas</h1>
          <p className="text-gray-600 mt-1">Gestiona tu calendario de citas</p>
        </div>
        <Button 
          onClick={() => {
            setSelectedAppointment(null);
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Cita
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Buscar citas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
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
                <option value="scheduled">Programadas</option>
                <option value="completed">Completadas</option>
                <option value="cancelled">Canceladas</option>
                <option value="no_show">No Asistió</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <select
                id="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="today">Hoy</option>
                <option value="tomorrow">Mañana</option>
                <option value="week">Esta Semana</option>
                <option value="month">Este Mes</option>
                <option value="all">Todas las Fechas</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                Más Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Citas */}
      <Card>
        <CardHeader>
          <CardTitle>Citas ({filteredAppointments.length})</CardTitle>
          <CardDescription>
            Mostrando {filteredAppointments.length} de {appointments.length} citas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {appointment.client?.name?.split(' ').map(n => n[0]).join('') || 'SC'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{appointment.client?.name || 'Sin Cliente'}</h3>
                      <p className="text-sm text-gray-600">{appointment.service?.name || 'Sin Servicio'}</p>
                      <p className="text-xs text-gray-500">con {appointment.user?.name || 'Sin Asignar'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDateTime(appointment.start_time).split(' ')[0]}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDateTime(appointment.start_time).split(' ')[1]} - {formatDateTime(appointment.end_time).split(' ')[1]}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {formatCurrency(appointment.service?.price || 0)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {appointment.service?.duration_minutes || 0} min
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <StatusBadge status={appointment.status} />
                      <AppointmentActions 
                        appointment={appointment}
                        onEdit={() => {
                          setSelectedAppointment(appointment);
                          setShowModal(true);
                        }}
                        onDelete={() => handleDelete(appointment)}
                        onChangeStatus={(status) => handleChangeStatus(appointment, status)}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {filteredAppointments.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron citas</h3>
                  <p className="text-gray-600 mb-4">Intenta ajustar tu búsqueda o filtros</p>
                  <Button onClick={() => setShowModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Nueva Cita
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-lift">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {appointments.filter(a => a.status === 'scheduled').length}
            </div>
            <div className="text-sm text-gray-600">Programadas</div>
          </CardContent>
        </Card>
        <Card className="hover-lift">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {appointments.filter(a => a.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completadas</div>
          </CardContent>
        </Card>
        <Card className="hover-lift">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {appointments.filter(a => a.status === 'cancelled').length}
            </div>
            <div className="text-sm text-gray-600">Canceladas</div>
          </CardContent>
        </Card>
        <Card className="hover-lift">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(appointments.reduce((sum, a) => sum + (a.service?.price || 0), 0))}
            </div>
            <div className="text-sm text-gray-600">Ingresos Totales</div>
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      <AppointmentModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        onSave={fetchAppointments}
      />
    </div>
  );
}