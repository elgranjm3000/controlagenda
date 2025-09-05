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

// Mock data - Replace with actual API calls
const mockData = {
  stats: {
    todayAppointments: 12,
    todayRevenue: 1450.00,
    newClientsThisWeek: 8,
    occupancyRate: 78,
  },
  recentAppointments: [
    { id: 1, client: 'Maria Garcia', service: 'Premium Facial', time: '10:00 AM', status: 'confirmed' },
    { id: 2, client: 'John Smith', service: 'Hair Cut', time: '11:30 AM', status: 'completed' },
    { id: 3, client: 'Sarah Johnson', service: 'Massage Therapy', time: '2:00 PM', status: 'in-progress' },
    { id: 4, client: 'David Brown', service: 'Manicure', time: '3:30 PM', status: 'confirmed' },
  ],
  salesData: [
    { date: 'Mon', revenue: 1200, appointments: 8 },
    { date: 'Tue', revenue: 1450, appointments: 10 },
    { date: 'Wed', revenue: 1100, appointments: 7 },
    { date: 'Thu', revenue: 1650, appointments: 12 },
    { date: 'Fri', revenue: 1800, appointments: 14 },
    { date: 'Sat', revenue: 2200, appointments: 18 },
    { date: 'Sun', revenue: 1300, appointments: 9 },
  ],
  serviceDistribution: [
    { name: 'Facial Treatments', value: 35, color: '#8B5CF6' },
    { name: 'Hair Services', value: 25, color: '#3B82F6' },
    { name: 'Massage Therapy', value: 20, color: '#10B981' },
    { name: 'Nail Services', value: 15, color: '#F59E0B' },
    { name: 'Other', value: 5, color: '#EF4444' },
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
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            {currentTime.toLocaleDateString('en-US', { 
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
            New Appointment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Appointments"
          value={mockData.stats.todayAppointments}
          change="+2 from yesterday"
          trend="up"
          icon={Calendar}
        />
        <StatCard
          title="Today's Revenue"
          value={`$${mockData.stats.todayRevenue.toLocaleString()}`}
          change="+12% from yesterday"
          trend="up"
          icon={DollarSign}
        />
        <StatCard
          title="New Clients This Week"
          value={mockData.stats.newClientsThisWeek}
          change="+3 from last week"
          trend="up"
          icon={Users}
        />
        <StatCard
          title="Occupancy Rate"
          value={`${mockData.stats.occupancyRate}%`}
          change="-5% from last week"
          trend="down"
          icon={TrendingUp}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>Weekly Revenue</CardTitle>
            <CardDescription>Revenue and appointments for the past 7 days</CardDescription>
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
                      name === 'revenue' ? `$${value}` : value,
                      name === 'revenue' ? 'Revenue' : 'Appointments'
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

        {/* Service Distribution */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>Service Distribution</CardTitle>
            <CardDescription>Popular services this month</CardDescription>
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
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Appointments */}
      <Card className="hover-lift">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Today's Appointments</CardTitle>
            <CardDescription>Upcoming and ongoing appointments</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            View All
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
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover-lift cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
              <CalendarCheck className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Book Appointment</h3>
            <p className="text-sm text-gray-600">Schedule a new appointment for your clients</p>
          </CardContent>
        </Card>

        <Card className="hover-lift cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
              <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Add Client</h3>
            <p className="text-sm text-gray-600">Register a new client to your system</p>
          </CardContent>
        </Card>

        <Card className="hover-lift cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Check Schedule</h3>
            <p className="text-sm text-gray-600">View availability and manage your time</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}