'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { formatDateTime, formatCurrency } from '@/lib/utils';

// Mock data
const mockAppointments = [
  {
    id: 1,
    client: { name: 'Maria Garcia', email: 'maria@example.com', phone: '+1-555-0123' },
    service: { name: 'Premium Facial Treatment', duration: 90, price: 125.00 },
    staff: { name: 'Sarah Johnson' },
    start_time: '2024-12-20T10:00:00',
    end_time: '2024-12-20T11:30:00',
    status: 'scheduled',
    notes: 'First appointment with this client'
  },
  {
    id: 2,
    client: { name: 'John Smith', email: 'john@example.com', phone: '+1-555-0124' },
    service: { name: 'Hair Cut & Style', duration: 60, price: 85.00 },
    staff: { name: 'Mike Wilson' },
    start_time: '2024-12-20T11:30:00',
    end_time: '2024-12-20T12:30:00',
    status: 'completed',
    notes: 'Regular client, prefers short hair'
  },
  {
    id: 3,
    client: { name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+1-555-0125' },
    service: { name: 'Deep Tissue Massage', duration: 75, price: 110.00 },
    staff: { name: 'Lisa Chen' },
    start_time: '2024-12-20T14:00:00',
    end_time: '2024-12-20T15:15:00',
    status: 'cancelled',
    notes: 'Cancelled due to emergency'
  },
  {
    id: 4,
    client: { name: 'David Brown', email: 'david@example.com', phone: '+1-555-0126' },
    service: { name: 'Manicure & Pedicure', duration: 45, price: 65.00 },
    staff: { name: 'Anna Martinez' },
    start_time: '2024-12-20T15:30:00',
    end_time: '2024-12-20T16:15:00',
    status: 'scheduled',
    notes: 'Requested gel polish'
  },
];

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    no_show: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

const AppointmentActions = ({ appointment }: { appointment: any }) => {
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
              View Details
            </button>
            <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </button>
            {appointment.status === 'scheduled' && (
              <>
                <button className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-gray-100">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark Complete
                </button>
                <button className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-gray-100">
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel
                </button>
              </>
            )}
            <button className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-gray-100">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function AppointmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');

  const filteredAppointments = mockAppointments.filter(appointment => {
    const matchesSearch = appointment.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         appointment.service.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-1">Manage your appointment schedule</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 mt-4 sm:mt-0">
          <Plus className="w-4 h-4 mr-2" />
          New Appointment
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search appointments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <select
                id="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Dates</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle>Appointments ({filteredAppointments.length})</CardTitle>
          <CardDescription>
            Showing {filteredAppointments.length} of {mockAppointments.length} appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {appointment.client.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{appointment.client.name}</h3>
                    <p className="text-sm text-gray-600">{appointment.service.name}</p>
                    <p className="text-xs text-gray-500">with {appointment.staff.name}</p>
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
                      {formatCurrency(appointment.service.price)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {appointment.service.duration} min
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <StatusBadge status={appointment.status} />
                    <AppointmentActions appointment={appointment} />
                  </div>
                </div>
              </div>
            ))}

            {filteredAppointments.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Appointment
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-lift">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {mockAppointments.filter(a => a.status === 'scheduled').length}
            </div>
            <div className="text-sm text-gray-600">Scheduled</div>
          </CardContent>
        </Card>
        <Card className="hover-lift">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {mockAppointments.filter(a => a.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
        <Card className="hover-lift">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {mockAppointments.filter(a => a.status === 'cancelled').length}
            </div>
            <div className="text-sm text-gray-600">Cancelled</div>
          </CardContent>
        </Card>
        <Card className="hover-lift">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(mockAppointments.reduce((sum, a) => sum + a.service.price, 0))}
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}