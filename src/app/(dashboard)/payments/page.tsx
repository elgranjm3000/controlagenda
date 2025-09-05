'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CreditCard,
  Search,
  Plus,
  DollarSign,
  Calendar,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Receipt,
  Banknote,
  X,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { api } from '@/lib/api';
import { Payment, Appointment } from '@/types';

// Modal para agregar/editar pago
const PaymentModal = ({ 
  isOpen, 
  onClose, 
  payment, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  payment?: Payment | null; 
  onSave: () => void; 
}) => {
  const [formData, setFormData] = useState({
    appointment_id: '',
    amount: 0,
    method: 'cash',
    status: 'pending',
    transaction_reference: ''
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const paymentMethods = [
    { value: 'cash', label: 'Efectivo' },
    { value: 'card', label: 'Tarjeta' },
    { value: 'online', label: 'Pago Online' }
  ];

  const paymentStatuses = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'paid', label: 'Pagado' },
    { value: 'refunded', label: 'Reembolsado' }
  ];

  useEffect(() => {
    // Cargar citas completadas sin pago
    const loadAppointments = async () => {
      try {
        const response = await api.get('/appointments', {
          params: {
            include: 'client,service',
            status: 'completed',
            without_payment: true
          }
        });
        setAppointments(response.data.data);
      } catch (error) {
        console.error('Error cargando citas:', error);
      }
    };

    if (isOpen) {
      loadAppointments();
    }
  }, [isOpen]);

  useEffect(() => {
    if (payment) {
      setFormData({
        appointment_id: payment.appointment_id?.toString() || '',
        amount: payment.amount || 0,
        method: payment.method || 'cash',
        status: payment.status || 'pending',
        transaction_reference: payment.transaction_reference || ''
      });
    } else {
      setFormData({
        appointment_id: '',
        amount: 0,
        method: 'cash',
        status: 'pending',
        transaction_reference: ''
      });
    }
  }, [payment]);

  const handleAppointmentChange = (appointmentId: string) => {
    const appointment = appointments.find(a => a.id.toString() === appointmentId);
    if (appointment) {
      setFormData({
        ...formData,
        appointment_id: appointmentId,
        amount: appointment.service?.price || 0
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const data = {
        ...formData,
        appointment_id: parseInt(formData.appointment_id),
      };

      if (payment) {
        await api.put(`/payments/${payment.id}`, data);
      } else {
        await api.post('/payments', data);
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
            {payment ? 'Editar Pago' : 'Registrar Pago'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="appointment_id">Cita</Label>
            <select
              id="appointment_id"
              value={formData.appointment_id}
              onChange={(e) => handleAppointmentChange(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              required
              disabled={!!payment}
            >
              <option value="">Seleccionar cita</option>
              {appointments.map(appointment => (
                <option key={appointment.id} value={appointment.id}>
                  {appointment.client?.name} - {appointment.service?.name} - {formatDateTime(appointment.start_time)}
                </option>
              ))}
            </select>
            {errors.appointment_id && (
              <p className="text-sm text-red-600 mt-1">{errors.appointment_id[0]}</p>
            )}
          </div>

          <div>
            <Label htmlFor="amount">Monto</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="1000"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              placeholder="0"
              required
            />
            {errors.amount && (
              <p className="text-sm text-red-600 mt-1">{errors.amount[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="method">Método de Pago</Label>
              <select
                id="method"
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                required
              >
                {paymentMethods.map(method => (
                  <option key={method.value} value={method.value}>{method.label}</option>
                ))}
              </select>
              {errors.method && (
                <p className="text-sm text-red-600 mt-1">{errors.method[0]}</p>
              )}
            </div>

            <div>
              <Label htmlFor="status">Estado</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                required
              >
                {paymentStatuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
              {errors.status && (
                <p className="text-sm text-red-600 mt-1">{errors.status[0]}</p>
              )}
            </div>
          </div>

          {(formData.method === 'card' || formData.method === 'online') && (
            <div>
              <Label htmlFor="transaction_reference">Referencia de Transacción</Label>
              <Input
                id="transaction_reference"
                value={formData.transaction_reference}
                onChange={(e) => setFormData({ ...formData, transaction_reference: e.target.value })}
                placeholder="Número de transacción o referencia"
              />
              {errors.transaction_reference && (
                <p className="text-sm text-red-600 mt-1">{errors.transaction_reference[0]}</p>
              )}
            </div>
          )}

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
              {loading ? 'Guardando...' : payment ? 'Actualizar' : 'Registrar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PaymentStatusBadge = ({ status }: { status: string }) => {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    refunded: 'bg-red-100 text-red-800',
  };

  const statusText = {
    pending: 'Pendiente',
    paid: 'Pagado',
    refunded: 'Reembolsado',
  };

  const icons = {
    pending: Clock,
    paid: CheckCircle,
    refunded: XCircle,
  };

  const Icon = icons[status as keyof typeof icons];

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
      <Icon className="w-3 h-3 mr-1" />
      {statusText[status as keyof typeof statusText]}
    </span>
  );
};

const PaymentMethodIcon = ({ method }: { method: string }) => {
  const icons = {
    cash: Banknote,
    card: CreditCard,
    online: Receipt,
  };

  const Icon = icons[method as keyof typeof icons] || CreditCard;
  return <Icon className="w-4 h-4" />;
};

const PaymentActions = ({ 
  payment, 
  onEdit, 
  onDelete 
}: { 
  payment: Payment; 
  onEdit: () => void; 
  onDelete: () => void; 
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
              Editar Pago
            </button>
            <button className="flex items-center w-full px-4 py-2 text-sm text-blue-700 hover:bg-gray-100">
              <Receipt className="mr-2 h-4 w-4" />
              Imprimir Recibo
            </button>
            <button 
              onClick={onDelete}
              className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar Pago
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Cargar pagos desde la API
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payments', {
        params: {
          include: 'appointment.client,appointment.service'
        }
      });
      setPayments(response.data.data);
    } catch (error) {
      console.error('Error al cargar pagos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Eliminar pago
  const handleDelete = async (payment: Payment) => {
    if (confirm('¿Está seguro de que desea eliminar este pago?')) {
      try {
        await api.delete(`/payments/${payment.id}`);
        fetchPayments();
      } catch (error) {
        alert('Error al eliminar el pago');
      }
    }
  };

  const filteredPayments = payments.filter(payment => {
    const clientName = payment.appointment?.client?.name || '';
    const serviceName = payment.appointment?.service?.name || '';
    const matchesSearch = clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.transaction_reference?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = methodFilter === 'all' || payment.method === methodFilter;
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesMethod && matchesStatus;
  });

  // Calcular estadísticas
  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = payments.filter(p => p.status === 'pending');
  const todayPayments = payments.filter(p => {
    const today = new Date().toDateString();
    return new Date(p.created_at).toDateString() === today && p.status === 'paid';
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pagos</h1>
          <p className="text-gray-600 mt-1">Gestiona los pagos y transacciones</p>
        </div>
        <Button 
          onClick={() => {
            setSelectedPayment(null);
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Registrar Pago
        </Button>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ingresos Totales</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                <div className="flex items-center text-sm text-green-600">
                  <span>Pagos completados</span>
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
                <p className="text-sm font-medium text-muted-foreground">Pagos Pendientes</p>
                <p className="text-2xl font-bold">{pendingPayments.length}</p>
                <div className="flex items-center text-sm text-yellow-600">
                  <span>{formatCurrency(pendingPayments.reduce((sum, p) => sum + p.amount, 0))}</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pagos Hoy</p>
                <p className="text-2xl font-bold">{todayPayments.length}</p>
                <div className="flex items-center text-sm text-blue-600">
                  <span>{formatCurrency(todayPayments.reduce((sum, p) => sum + p.amount, 0))}</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Transacciones</p>
                <p className="text-2xl font-bold">{payments.length}</p>
                <div className="flex items-center text-sm text-purple-600">
                  <span>Todos los pagos</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <CreditCard className="h-6 w-6" />
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
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Buscar pagos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="method">Método de Pago</Label>
              <select
                id="method"
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">Todos los Métodos</option>
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta</option>
                <option value="online">Pago Online</option>
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
                <option value="pending">Pendientes</option>
                <option value="paid">Pagados</option>
                <option value="refunded">Reembolsados</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                Exportar Pagos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pagos */}
      <Card>
        <CardHeader>
          <CardTitle>Pagos ({filteredPayments.length})</CardTitle>
          <CardDescription>
            Mostrando {filteredPayments.length} de {payments.length} pagos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <PaymentMethodIcon method={payment.method} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {payment.appointment?.client?.name || 'Cliente no disponible'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {payment.appointment?.service?.name || 'Servicio no disponible'}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>
                          {payment.method === 'cash' ? 'Efectivo' : 
                           payment.method === 'card' ? 'Tarjeta' : 'Pago Online'}
                        </span>
                        {payment.transaction_reference && (
                          <>
                            <span>•</span>
                            <span>Ref: {payment.transaction_reference}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(payment.amount)}
                      </div>
                      <div className="text-xs text-gray-600">
                        {formatDateTime(payment.created_at).split(' ')[0]}
                      </div>
                    </div>

                    <div className="text-center">
                      <PaymentStatusBadge status={payment.status} />
                      <div className="text-xs text-gray-600 mt-1">
                        {formatDateTime(payment.created_at).split(' ')[1]}
                      </div>
                    </div>

                    <PaymentActions
                      payment={payment}
                      onEdit={() => {
                        setSelectedPayment(payment);
                        setShowModal(true);
                      }}
                      onDelete={() => handleDelete(payment)}
                    />
                  </div>
                </div>
              ))}

              {filteredPayments.length === 0 && !loading && (
                <div className="text-center py-12">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron pagos</h3>
                  <p className="text-gray-600 mb-4">Intenta ajustar tus filtros de búsqueda</p>
                  <Button onClick={() => setShowModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar Nuevo Pago
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumen por Método de Pago */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen por Método de Pago</CardTitle>
          <CardDescription>Distribución de ingresos por método de pago</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['cash', 'card', 'online'].map(method => {
              const methodPayments = payments.filter(p => p.method === method && p.status === 'paid');
              const methodTotal = methodPayments.reduce((sum, p) => sum + p.amount, 0);
              const methodName = method === 'cash' ? 'Efectivo' : method === 'card' ? 'Tarjeta' : 'Pago Online';
              
              return (
                <div key={method} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 rounded-full bg-white">
                      <PaymentMethodIcon method={method} />
                    </div>
                    <h4 className="font-semibold text-gray-900">{methodName}</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transacciones:</span>
                      <span className="font-medium">{methodPayments.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-medium">{formatCurrency(methodTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Promedio:</span>
                      <span className="font-medium">
                        {formatCurrency(methodPayments.length > 0 ? methodTotal / methodPayments.length : 0)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <PaymentModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedPayment(null);
        }}
        payment={selectedPayment}
        onSave={fetchPayments}
      />
    </div>
  );
}