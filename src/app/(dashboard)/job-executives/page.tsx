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
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Building,
  CheckCircle,
  Clock,
  X,
  Phone,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { api } from '@/types/services';
import { JobDayExecutive, JobOffer, JobClientStatus, JobClientStatusContact } from '@/types';
import { Paginator } from '@/components/Paginator';

// Modal para agregar/editar ejecutivo
const ExecutiveModal = ({ 
  isOpen, 
  onClose, 
  executive, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  executive?: JobDayExecutive | null; 
  onSave: () => void; 
}) => {
  const [formData, setFormData] = useState({
    id_offers: '',
    id_client: '',
    dv_client: '',
    id_executive: '',
    dv_executive: '',
    name: '',
    last_name1: '',
    last_name2: '',
    id_office: '',
    id_status: 1,
    id_contact: 0,
    scheduled_date: '',
    attrib1: '',
    attrib2: '',
    attrib3: '',
    attrib4: '',
    attrib5: ''
  });
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [statuses, setStatuses] = useState<JobClientStatus[]>([]);
  const [contactStatuses, setContactStatuses] = useState<JobClientStatusContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const [offersRes, statusesRes] = await Promise.all([
          api.getJobOffers({ active: true }),
          api.getAllStatuses()
        ]);
        setOffers(offersRes.data || []);
        setStatuses(statusesRes?.data?.data?.client_statuses || []);
        setContactStatuses(statusesRes?.data?.data?.contact_statuses || []);
      } catch (error) {
        console.error('Error cargando datos del formulario:', error);
        setOffers([]);
        setStatuses([]);
        setContactStatuses([]);
      }
    };

    if (isOpen) {
      loadFormData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (executive) {
      setFormData({
        id_offers: executive.id_offers?.toString() || '',
        id_client: executive.id_client?.toString() || '',
        dv_client: executive.dv_client || '',
        id_executive: executive.id_executive?.toString() || '',
        dv_executive: executive.dv_executive || '',
        name: executive.name || '',
        last_name1: executive.last_name1 || '',
        last_name2: executive.last_name2 || '',
        id_office: executive.id_office || '',
        id_status: executive.id_status || 1,
        id_contact: executive.id_contact || 0,
        scheduled_date: executive.scheduled_date?.slice(0, 16) || '',
        attrib1: executive.attrib1 || '',
        attrib2: executive.attrib2 || '',
        attrib3: executive.attrib3 || '',
        attrib4: executive.attrib4 || '',
        attrib5: executive.attrib5 || ''
      });
    }
  }, [executive]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const data = {
        ...formData,
        id_offers: parseInt(formData.id_offers),
        id_client: parseInt(formData.id_client),
        id_executive: parseInt(formData.id_executive),
        id_status: parseInt(formData.id_status.toString()),
        id_contact: parseInt(formData.id_contact.toString()),
      };

      if (executive) {
        await api.updateJobExecutive(executive.id, data);
      } else {
        await api.createJobExecutive(data);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {executive ? 'Editar Ejecutivo' : 'Nuevo Ejecutivo'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="id_offers">Oferta/Campaña</Label>
              <select
                id="id_offers"
                value={formData.id_offers}
                onChange={(e) => setFormData({ ...formData, id_offers: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                required
                disabled={!!executive}
              >
                <option value="">Seleccionar oferta</option>
                {offers.map(offer => (
                  <option key={offer.id_offers} value={offer.id_offers}>
                    {offer.descrip}
                  </option>
                ))}
              </select>
              {errors.id_offers && (
                <p className="text-sm text-red-600 mt-1">{errors.id_offers[0]}</p>
              )}
            </div>

            <div>
              <Label htmlFor="id_office">Oficina</Label>
              <Input
                id="id_office"
                value={formData.id_office}
                onChange={(e) => setFormData({ ...formData, id_office: e.target.value })}
                placeholder="Código de oficina"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="id_client">RUT Cliente</Label>
              <div className="flex gap-2">
                <Input
                  id="id_client"
                  type="number"
                  value={formData.id_client}
                  onChange={(e) => setFormData({ ...formData, id_client: e.target.value })}
                  placeholder="12345678"
                  required
                  className="flex-1"
                />
                <Input
                  value={formData.dv_client}
                  onChange={(e) => setFormData({ ...formData, dv_client: e.target.value })}
                  placeholder="K"
                  maxLength={1}
                  className="w-16"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="id_executive">RUT Ejecutivo</Label>
              <div className="flex gap-2">
                <Input
                  id="id_executive"
                  type="number"
                  value={formData.id_executive}
                  onChange={(e) => setFormData({ ...formData, id_executive: e.target.value })}
                  placeholder="87654321"
                  required
                  className="flex-1"
                />
                <Input
                  value={formData.dv_executive}
                  onChange={(e) => setFormData({ ...formData, dv_executive: e.target.value })}
                  placeholder="K"
                  maxLength={1}
                  className="w-16"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Juan"
                required
              />
            </div>

            <div>
              <Label htmlFor="last_name1">Apellido Paterno</Label>
              <Input
                id="last_name1"
                value={formData.last_name1}
                onChange={(e) => setFormData({ ...formData, last_name1: e.target.value })}
                placeholder="Pérez"
                required
              />
            </div>

            <div>
              <Label htmlFor="last_name2">Apellido Materno</Label>
              <Input
                id="last_name2"
                value={formData.last_name2}
                onChange={(e) => setFormData({ ...formData, last_name2: e.target.value })}
                placeholder="González"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="id_status">Estado</Label>
              <select
                id="id_status"
                value={formData.id_status}
                onChange={(e) => setFormData({ ...formData, id_status: parseInt(e.target.value) })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                required
              >
                <option value="">Seleccionar estado</option>
                {statuses && statuses.length > 0 && statuses.map(status => (
                  <option key={status.id_status} value={status.id_status}>
                    {status.descrip}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="id_contact">Tipo de Contacto</Label>
              <select
                id="id_contact"
                value={formData.id_contact}
                onChange={(e) => setFormData({ ...formData, id_contact: parseInt(e.target.value) })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="0">Sin contacto</option>
                {contactStatuses && contactStatuses.map(contact => (
                  <option key={contact.id_contact} value={contact.id_contact}>
                    {contact.descrip}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="scheduled_date">Fecha Agendada</Label>
              <Input
                id="scheduled_date"
                type="datetime-local"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Información Adicional</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="attrib1">Teléfono</Label>
                <Input
                  id="attrib1"
                  value={formData.attrib1}
                  onChange={(e) => setFormData({ ...formData, attrib1: e.target.value })}
                  placeholder="+56 9 1234 5678"
                />
              </div>
              <div>
                <Label htmlFor="attrib2">Email</Label>
                <Input
                  id="attrib2"
                  type="email"
                  value={formData.attrib2}
                  onChange={(e) => setFormData({ ...formData, attrib2: e.target.value })}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="attrib3">Dirección</Label>
                <Input
                  id="attrib3"
                  value={formData.attrib3}
                  onChange={(e) => setFormData({ ...formData, attrib3: e.target.value })}
                  placeholder="Dirección"
                />
              </div>
              <div>
                <Label htmlFor="attrib4">Ciudad</Label>
                <Input
                  id="attrib4"
                  value={formData.attrib4}
                  onChange={(e) => setFormData({ ...formData, attrib4: e.target.value })}
                  placeholder="Ciudad"
                />
              </div>
            </div>
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
              {loading ? 'Guardando...' : executive ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status?: JobClientStatus }) => {
  if (!status) return null;
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
      status.is_life ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
    }`}>
      {status.descrip}
    </span>
  );
};

const ExecutiveActions = ({ 
  executive, 
  onEdit, 
  onDelete,
  onSchedule
}: { 
  executive: JobDayExecutive; 
  onEdit: () => void; 
  onDelete: () => void;
  onSchedule: () => void;
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
            <button 
              onClick={onSchedule}
              className="flex items-center w-full px-4 py-2 text-sm text-blue-700 hover:bg-gray-100"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Agendar
            </button>
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

export default function JobExecutivesPage() {
  const [executives, setExecutives] = useState<JobDayExecutive[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [offerFilter, setOfferFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [officeFilter, setOfficeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedExecutive, setSelectedExecutive] = useState<JobDayExecutive | null>(null);
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [statuses, setStatuses] = useState<JobClientStatus[]>([]);
  const [paginationTotal, setPaginationTotal] = useState(0);
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchExecutives = async () => {
    try {
      setLoading(true);
      const params: any = {
        with_contacts: 1,
        page: currentPage,
        per_page: itemsPerPage,
      };
      
      if (offerFilter !== 'all') params.id_offers = offerFilter;
      if (statusFilter !== 'all') params.id_status = statusFilter;
      if (officeFilter !== 'all') params.id_office = officeFilter;
      
      const response = await api.getJobExecutives(params);
      setExecutives(response.data || []);
      setPaginationTotal(response.pagination?.total || 0);
    } catch (error) {
      console.error('Error al cargar ejecutivos:', error);
      setExecutives([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [offersRes, statusesRes] = await Promise.all([
        api.getJobOffers({ active: true }),
        api.getClientStatuses(),                
      ]);
    
      setOffers(offersRes.data || []);
      setStatuses(statusesRes.data || []);
    } catch (error) {
      console.error('Error cargando filtros:', error);
      setOffers([]);
      setStatuses([]);
    }
  };

  useEffect(() => {
    fetchExecutives();
  }, [offerFilter, statusFilter, officeFilter, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchFilters();
  }, []);

  const handleDelete = async (executive: JobDayExecutive) => {
    if (confirm(`¿Está seguro de que desea eliminar a ${executive.name} ${executive.last_name1}?`)) {
      try {        
        await api.deleteJobExecutive(executive.id);
        fetchExecutives();
      } catch (error) {
        alert('Error al eliminar el ejecutivo');
      }
    }
  };

  const handleSchedule = async (executive: JobDayExecutive) => {
    const scheduledDate = prompt('Ingrese la fecha y hora (YYYY-MM-DD HH:MM)');
    if (scheduledDate) {
      try {
        await api.scheduleExecutive(executive.id, scheduledDate);
        fetchExecutives();
      } catch (error) {
        alert('Error al agendar');
      }
    }
  };

  // Filtrar ejecutivos (búsqueda del lado del cliente)
  const filteredExecutives = executives.filter(executive => {
    const fullName = `${executive.name} ${executive.last_name1} ${executive.last_name2}`.toLowerCase();
    const rut = `${executive.id_executive}-${executive.dv_executive}`;
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
                         rut.includes(searchQuery) ||
                         executive.id_office?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });
const paginatedExecutives = filteredExecutives;

  // Calcular paginación
  const totalItems = paginationTotal;  
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  console.log({ totalItems, totalPages, itemsPerPage });  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  //const paginatedExecutives = filteredExecutives.slice(startIndex, endIndex);

  // Funciones de paginación
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  const offices = Array.from(new Set(executives.map(e => e.id_office).filter(Boolean)));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes prospecto</h1>
          <p className="text-gray-600 mt-1">Gestiona las relaciones con tus prospectos</p>
        </div>
        <Button 
          onClick={() => {
            setSelectedExecutive(null);
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Ejecutivo
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Ejecutivos</p>
                <p className="text-2xl font-bold">{executives.length}</p>
                <div className="flex items-center text-sm text-blue-600">
                  <span>En todas las campañas</span>
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
                <p className="text-sm font-medium text-muted-foreground">Con Contactos</p>
                <p className="text-2xl font-bold">
                  {executives.filter(e => (e.contacts_count || 0) > 0).length}
                </p>
                <div className="flex items-center text-sm text-green-600">
                  <span>Ejecutivos activos</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Agendados</p>
                <p className="text-2xl font-bold">
                  {executives.filter(e => e.scheduled_date).length}
                </p>
                <div className="flex items-center text-sm text-purple-600">
                  <span>Con fecha programada</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Oficinas</p>
                <p className="text-2xl font-bold">{offices.length}</p>
                <div className="flex items-center text-sm text-orange-600">
                  <span>Locaciones únicas</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <Building className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Buscar ejecutivos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="offer">Campaña</Label>
              <select
                id="offer"
                value={offerFilter}
                onChange={(e) => setOfferFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">Todas las Campañas</option>
                {offers.map(offer => (
                  <option key={offer.id_offers} value={offer.id_offers}>
                    {offer.descrip}
                  </option>
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
                {statuses && statuses.length > 0 && statuses.map(status => (
                  <option key={status.id_status} value={status.id_status}>
                    {status.descrip}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="office">Oficina</Label>
              <select
                id="office"
                value={officeFilter}
                onChange={(e) => setOfficeFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">Todas las Oficinas</option>
                {offices.map(office => (
                  <option key={office} value={office}>{office}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Ejecutivos */}
      <Card>
        <CardHeader>
          <CardTitle>Ejecutivos ({totalItems})</CardTitle>
          <CardDescription>
            Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de {totalItems} ejecutivos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {paginatedExecutives.map((executive) => (
                  <div
                    key={executive.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {executive.name[0]}{executive.last_name1[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {executive.name} {executive.last_name1} {executive.last_name2}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>RUT: {executive.id_executive}-{executive.dv_executive}</span>
                          {executive.id_office && (
                            <>
                              <span>•</span>
                              <div className="flex items-center">
                                <Building className="w-3 h-3 mr-1" />
                                {executive.id_office}
                              </div>
                            </>
                          )}
                          {executive.attrib1 && (
                            <>
                              <span>•</span>
                              <div className="flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {executive.attrib1}
                              </div>
                            </>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <StatusBadge status={executive.status} />
                          {executive.scheduled_date && (
                            <span className="flex items-center text-xs text-blue-600">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatDateTime(executive.scheduled_date)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {executive.contacts?.length || 0}
                        </div>
                        <div className="text-xs text-gray-600">Contactos</div>
                      </div>

                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          $ {executive.attrib9 || 0}
                        </div>
                        <div className="text-xs text-gray-600">Total gastado</div>
                      </div>

                      <ExecutiveActions
                        executive={executive}
                        onEdit={() => {
                          setSelectedExecutive(executive);
                          setShowModal(true);
                        }}
                        onDelete={() => handleDelete(executive)}
                        onSchedule={() => handleSchedule(executive)}
                      />
                    </div>
                  </div>
                ))}



                {paginatedExecutives.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron ejecutivos</h3>
                    <p className="text-gray-600 mb-4">Intenta ajustar tus filtros de búsqueda</p>
                    <Button onClick={() => setShowModal(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Nuevo Ejecutivo
                    </Button>
                  </div>
                )}
              </div>

              {/* Paginador */}
              {totalPages > 1 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4">
                  {/* Selector de items por página */}
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="itemsPerPage" className="text-sm whitespace-nowrap">
                      Mostrar:
                    </Label>
                    <select
                      id="itemsPerPage"
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="h-9 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                    <span className="text-sm text-gray-600 whitespace-nowrap">
                      por página
                    </span>
                  </div>

                  {/* Controles de paginación */}
                  <div className="flex items-center space-x-2">
                    {/* Primera página */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(1)}
                      disabled={currentPage === 1}
                      className="hidden sm:flex"
                    >
                      Primera
                    </Button>

                    {/* Página anterior */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {/* Números de página */}
                    <div className="flex items-center space-x-1">
                      {getPageNumbers().map((pageNum) => (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(pageNum)}
                          className={currentPage === pageNum ? "bg-gradient-to-r from-purple-600 to-blue-600" : ""}
                        >
                          {pageNum}
                        </Button>
                      ))}
                    </div>

                    {/* Página siguiente */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>

                    {/* Última página */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="hidden sm:flex"
                    >
                      Última
                    </Button>
                  </div>

                  {/* Info de página actual */}
                  <div className="text-sm text-gray-600 whitespace-nowrap">
                    Página {currentPage} de {totalPages}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <ExecutiveModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedExecutive(null);
        }}
        executive={selectedExecutive}
        onSave={fetchExecutives}
      />
    </div>
  );
}