'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  UserPlus,
  CalendarCheck,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Datos de ejemplo - Reemplazar con llamadas reales a la API
const mockData = {
  stats: {
    todayAppointments: 12,
    todayRevenue: 1450.00,
    newClientsThisWeek: 8,
    occupancyRate: 78,
  },
  recentAppointments: [
    { id: 1, client: 'María García', service: 'Facial Premium', time: '10:00 AM', status: 'confirmada' },
    { id: 2, client: 'Juan Silva', service: 'Corte de Cabello', time: '11:30 AM', status: 'completada' },
    { id: 3, client: 'Sandra Jiménez', service: 'Terapia de Masajes', time: '2:00 PM', status: 'en-progreso' },
    { id: 4, client: 'Diego Morales', service: 'Manicura', time: '3:30 PM', status: 'confirmada' },
  ],
  salesData: [
    { date: 'Lun', revenue: 1200, appointments: 8 },
    { date: 'Mar', revenue: 1450, appointments: 10 },
    { date: 'Mié', revenue: 1100, appointments: 7 },
    { date: 'Jue', revenue: 1650, appointments: 12 },
    { date: 'Vie', revenue: 1800, appointments: 14 },
    { date: 'Sáb', revenue: 2200, appointments: 18 },
    { date: 'Dom', revenue: 1300, appointments: 9 },
  ],
  serviceDistribution: [
    { name: 'Tratamientos Faciales', value: 35, color: '#8B5CF6' },
    { name: 'Servicios de Cabello', value: 25, color: '#3B82F6' },
    { name: 'Terapia de Masajes', value: 20, color: '#10B981' },
    { name: 'Servicios de Uñas', value: 15, color: '#F59E0B' },
    { name: 'Otros', value: 5, color: '#EF4444' },
  ],
};

const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
  <Card className="hover-lift">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {change && (
            <div className={`flex items-center text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${
          Icon === Calendar ? 'bg-purple-100 text-purple-600' :
          Icon === DollarSign ? 'bg-green-100 text-green-600' :
          Icon === Users ? 'bg-blue-100 text-blue-600' :
          'bg-orange-100 text-orange-600'
        }`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const AppointmentStatusBadge = ({ status }: { status: string }) => {
  const colors = {
    confirmada: 'bg-blue-100 text-blue-800',
    completada: 'bg-green-100 text-green-800',
    'en-progreso': 'bg-yellow-100 text-yellow-800',
    cancelada: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status as keyof typeof colors]}`}>
      {status.replace('-', ' ')}
    </span>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Bienvenido de vuelta, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            {currentTime.toLocaleDateString('es-CL', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex space-x-4 mt-4 sm:mt-0">
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            <Calendar className="w-4 h-4 mr-2" />
            Nueva Cita
          </Button>
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Citas de Hoy"
          value={mockData.stats.todayAppointments}
          change="+2 desde ayer"
          trend="up"
          icon={Calendar}
        />
        <StatCard
          title="Ingresos de Hoy"
          value={formatCurrency(mockData.stats.todayRevenue)}
          change="+12% desde ayer"
          trend="up"
          icon={DollarSign}
        />
        <StatCard
          title="Nuevos Clientes Esta Semana"
          value={mockData.stats.newClientsThisWeek}
          change="+3 desde la semana pasada"
          trend="up"
          icon={Users}
        />
        <StatCard
          title="Tasa de Ocupación"
          value={`${mockData.stats.occupancyRate}%`}
          change="-5% desde la semana pasada"
          trend="down"
          icon={TrendingUp}
        />
      </div>

      {/* Fila de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Ingresos */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>Ingresos Semanales</CardTitle>
            <CardDescription>Ingresos y citas de los últimos 7 días</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData.salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'revenue' ? formatCurrency(Number(value)) : value,
                      name === 'revenue' ? 'Ingresos' : 'Citas'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="appointments" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribución de Servicios */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>Distribución de Servicios</CardTitle>
            <CardDescription>Servicios populares este mes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockData.serviceDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {mockData.serviceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Porcentaje']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Citas Recientes */}
      <Card className="hover-lift">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Citas de Hoy</CardTitle>
            <CardDescription>Próximas citas y en curso</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            Ver Todas
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockData.recentAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {appointment.client.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{appointment.client}</p>
                    <p className="text-sm text-gray-600">{appointment.service}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{appointment.time}</p>
                    <AppointmentStatusBadge status={appointment.status} />
                  </div>
                  <Button variant="ghost" size="sm">
                    Ver
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Acciones Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover-lift cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
              <CalendarCheck className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Agendar Cita</h3>
            <p className="text-sm text-gray-600">Programa una nueva cita para tus clientes</p>
          </CardContent>
        </Card>

        <Card className="hover-lift cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
              <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Agregar Cliente</h3>
            <p className="text-sm text-gray-600">Registra un nuevo cliente en tu sistema</p>
          </CardContent>
        </Card>

        <Card className="hover-lift cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Verificar Horario</h3>
            <p className="text-sm text-gray-600">Ve la disponibilidad y gestiona tu tiempo</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}