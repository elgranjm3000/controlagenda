'use client';
//13071788
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

// Tipos del API
interface DashboardData {
  period: string;
  executive_id: string | number;
  kpi_1: {
    title: string;
    maskAmount: string;
    footer: string;
    amount: number;
    title_color: string;
  } | null;
  kpi_2: {
    title: string;
    maskAmount: string;
    footer: string;
    amount: number;
    title_color: string;
  } | null;
  kpi_3: {
    title: string;
    maskAmount: string;
    footer: string;
    amount: number;
    title_color: string;
  } | null;
  kpi_4: {
    title: string;
    maskAmount: string;
    footer: string;
    amount: number;
    title_color: string;
  } | null;
  chart_dual: {
    title: string;
    footer: string;
    y1: number[] | null;
    y2: number[] | null;
    x1: (string | number)[] | null;
    x2: (string | number)[] | null;
  } | null;
  chart_single: {
    title: string;
    footer: string;
    y1: number[] | null;
    x1: (string | number)[] | null;
  } | null;
}

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
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Cargar datos del dashboard desde el API
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${API_URL}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setDashboardData(result.data);
          console.log('Dashboard data:', result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  // Preparar datos para el gráfico dual (si existen)
  const prepareDualChartData = () => {
    if (!dashboardData?.chart_dual?.y1 || !dashboardData?.chart_dual?.x1) {
      return [];
    }

    const { y1, y2, x1 } = dashboardData.chart_dual;
    
    return x1.map((label, index) => ({
      date: label,
      revenue: y1[index] || 0,
      appointments: y2 ? (y2[index] || 0) : 0,
    }));
  };


const preparePieChartData = () => {
  if (!dashboardData?.chart_single?.y1 || !dashboardData?.chart_single?.x1) {
    return []; // Fallback a mock
  }

  const { y1, x1 } = dashboardData.chart_single;
  
  return x1.map((label, index) => ({
    name: String(label),        // ← Nombre del servicio
    value: y1[index] || 0,      // ← Valor/porcentaje
    color: colors[index % 8],   // ← Color auto-asignado
  }));
};

const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#14B8A6', '#F97316'];
const pieData = preparePieChartData();
 

  const salesData = prepareDualChartData();

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
          {dashboardData && (
            <p className="text-xs text-gray-500 mt-1">
              Período: {dashboardData.period}
            </p>
          )}
        </div>
        <div className="flex space-x-4 mt-4 sm:mt-0">
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            <Calendar className="w-4 h-4 mr-2" />
            Nueva Cita
          </Button>
        </div>
      </div>

      {/* Tarjetas de Estadísticas - Usar datos del API si existen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={dashboardData?.kpi_1?.title || "Citas de Hoy"}
          value={dashboardData?.kpi_1?.maskAmount || 0}
          change={dashboardData?.kpi_1?.footer || "+2 desde ayer"}
          trend="up"
          icon={Calendar}
        />
        <StatCard
          title={dashboardData?.kpi_2?.title || "Ingresos de Hoy"}
          value={dashboardData?.kpi_2?.maskAmount || formatCurrency(0)}
          change={dashboardData?.kpi_2?.footer || "+12% desde ayer"}
          trend="up"
          icon={DollarSign}
        />
        <StatCard
          title={dashboardData?.kpi_3?.title || "Nuevos Clientes Esta Semana"}
          value={dashboardData?.kpi_3?.maskAmount || 0}
          change={dashboardData?.kpi_3?.footer || "+3 desde la semana pasada"}
          trend="up"
          icon={Users}
        />
        <StatCard
          title={dashboardData?.kpi_4?.title || "Tasa de Ocupación"}
          value={dashboardData?.kpi_4?.maskAmount || `0%`}
          change={dashboardData?.kpi_4?.footer || "-5% desde la semana pasada"}
          trend="down"
          icon={TrendingUp}
        />
      </div>

      {/* Fila de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Ingresos - Usar datos del API si existen */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>
              {dashboardData?.chart_dual?.title || "Ingresos Semanales"}
            </CardTitle>
            <CardDescription>
              {dashboardData?.chart_dual?.footer || "Ingresos y citas de los últimos 7 días"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
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
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : '0'}%`}
                  >
                    {mockData.serviceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [`${value}%`, props.payload.name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Citas Recientes */}
    
      {/* Acciones Rápidas */}
   
    </div>
  );
}