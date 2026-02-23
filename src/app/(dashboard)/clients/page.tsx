'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';
import { formatCurrency, formatDate, formatCLP } from '@/lib/utils';
import { api } from '@/lib/api';
import { Client } from '@/types';

// Modal para agregar/editar cliente
const ClientModal = ({ 
  isOpen, 
  onClose, 
  client, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  client?: Client | null; 
  onSave: () => void; 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        notes: client.notes || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        notes: ''
      });
    }
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (client) {
        // Actualizar cliente existente
        await api.put(`/clients/${client.id}`, formData);
      } else {
        // Crear nuevo cliente
        await api.post('/clients', formData);
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
            {client ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre Completo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ingrese el nombre completo"
              required
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name[0]}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="correo@ejemplo.com"
              required
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email[0]}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+56 9 1234 5678"
              required
            />
            {errors.phone && (
              <p className="text-sm text-red-600 mt-1">{errors.phone[0]}</p>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Notas</Label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas adicionales sobre el cliente..."
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
              {loading ? 'Guardando...' : client ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ClientActions = ({ client, onEdit, onDelete }: { client: Client; onEdit: () => void; onDelete: () => void; }) => {
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
              Ver Perfil
            </button>
            <button 
              onClick={onEdit}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar Detalles
            </button>
            <button className="flex items-center w-full px-4 py-2 text-sm text-blue-700 hover:bg-gray-100">
              <Calendar className="mr-2 h-4 w-4" />
              Agendar Cita
            </button>
            <button 
              onClick={onDelete}
              className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar Cliente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ClientStatusBadge = ({ status }: { status: string }) => {
  const colors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-yellow-100 text-yellow-800',
    blocked: 'bg-red-100 text-red-800',
  };

  const statusText = {
    active: 'Activo',
    inactive: 'Inactivo',
    blocked: 'Bloqueado',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status as keyof typeof colors]}`}>
      {statusText[status as keyof typeof statusText]}
    </span>
  );
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Cargar clientes desde la API
  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/clients');
      setClients(response.data.data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Eliminar cliente
  const handleDelete = async (client: Client) => {
    if (confirm(`¿Está seguro de que desea eliminar a ${client.name}?`)) {
      try {
        await api.delete(`/clients/${client.id}`);
        fetchClients(); // Recargar la lista
      } catch (error) {
        alert('Error al eliminar el cliente');
      }
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && (!client.last_appointment || 
                         new Date(client.last_appointment) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))) ||
                         (statusFilter === 'inactive' && client.last_appointment && 
                         new Date(client.last_appointment) <= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-1">Gestiona las relaciones con tus clientes</p>
        </div>
        <Button 
          onClick={() => {
            setSelectedClient(null);
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Cliente
        </Button>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Clientes</p>
                <p className="text-2xl font-bold">{clients.length}</p>
                <div className="flex items-center text-sm text-green-600">
                  <span>+2 esta semana</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clientes Activos</p>
                <p className="text-2xl font-bold">
                  {clients.filter(c => !c.last_appointment || 
                    new Date(c.last_appointment) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)).length}
                </p>
                <div className="flex items-center text-sm text-green-600">
                  <span>85% tasa activa</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <UserPlus className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Promedio Gastado</p>
                <p className="text-2xl font-bold">
                  {formatCLP(45000)}
                </p>
                <div className="flex items-center text-sm text-green-600">
                  <span>+12% vs mes pasado</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mayor Gastador</p>
                <p className="text-lg font-bold">María García</p>
                <div className="flex items-center text-sm text-purple-600">
                  <span>{formatCurrency(125000)}</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar Clientes</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Buscar por nombre, correo o teléfono..."
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
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                Exportar Clientes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Clientes ({filteredClients.length})</CardTitle>
          <CardDescription>
            Mostrando {filteredClients.length} de {clients.length} clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {client.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{client.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {client.email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {client.phone}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Miembro desde {formatDate(client.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {client.appointments_count || 0}
                      </div>
                      <div className="text-xs text-gray-600">Citas</div>
                    </div>

                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCLP(Math.random() * 100000)}
                      </div>
                      <div className="text-xs text-gray-600">Total Gastado</div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm text-gray-900">
                        {client.last_appointment ? formatDate(client.last_appointment) : 'Nunca'}
                      </div>
                      <div className="text-xs text-gray-600">Última Visita</div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <ClientStatusBadge 
                        status={!client.last_appointment || 
                               new Date(client.last_appointment) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) 
                               ? 'active' : 'inactive'} 
                      />
                      <ClientActions 
                        client={client}
                        onEdit={() => {
                          setSelectedClient(client);
                          setShowModal(true);
                        }}
                        onDelete={() => handleDelete(client)}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {filteredClients.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron clientes</h3>
                  <p className="text-gray-600 mb-4">Intenta ajustar tus criterios de búsqueda</p>
                  <Button onClick={() => setShowModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Nuevo Cliente
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <ClientModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
        onSave={fetchClients}
      />
    </div>
  );
}