// src/app/(dashboard)/clients/page.tsx
'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

// Mock data
const mockClients = [
  {
    id: 1,
    name: 'Maria Garcia',
    email: 'maria.garcia@example.com',
    phone: '+1-555-0123',
    notes: 'Prefers morning appointments. Allergic to certain oils.',
    created_at: '2024-01-15T10:00:00',
    total_appointments: 12,
    total_spent: 1450.00,
    last_appointment: '2024-12-18T10:00:00',
    status: 'active'
  },
  {
    id: 2,
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1-555-0124',
    notes: 'Regular client, comes every 6 weeks.',
    created_at: '2024-02-20T14:30:00',
    total_appointments: 8,
    total_spent: 680.00,
    last_appointment: '2024-12-15T11:30:00',
    status: 'active'
  },
  {
    id: 3,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+1-555-0125',
    notes: 'New client, referred by Maria Garcia.',
    created_at: '2024-11-01T09:15:00',
    total_appointments: 3,
    total_spent: 285.00,
    last_appointment: '2024-12-10T14:00:00',
    status: 'active'
  },
  {
    id: 4,
    name: 'David Brown',
    email: 'david.brown@example.com',
    phone: '+1-555-0126',
    notes: 'Enjoys conversation during treatments.',
    created_at: '2024-03-10T16:45:00',
    total_appointments: 15,
    total_spent: 1875.00,
    last_appointment: '2024-12-19T15:30:00',
    status: 'active'
  },
  {
    id: 5,
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    phone: '+1-555-0127',
    notes: 'Haven\'t seen in 3 months.',
    created_at: '2024-06-05T11:20:00',
    total_appointments: 6,
    total_spent: 520.00,
    last_appointment: '2024-09-15T13:00:00',
    status: 'inactive'
  },
];

const ClientActions = ({ client }: { client: any }) => {
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
              View Profile
            </button>
            <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <Edit className="mr-2 h-4 w-4" />
              Edit Details
            </button>
            <button className="flex items-center w-full px-4 py-2 text-sm text-blue-700 hover:bg-gray-100">
              <Calendar className="mr-2 h-4 w-4" />
              Book Appointment
            </button>
            <button className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-gray-100">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Client
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

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status as keyof typeof colors]}`}>
      {status}
    </span>
  );
};

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredClients = mockClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">Manage your client relationships</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 mt-4 sm:mt-0">
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold">{mockClients.length}</p>
                <div className="flex items-center text-sm text-green-600">
                  <span>+2 this week</span>
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
                <p className="text-sm font-medium text-muted-foreground">Active Clients</p>
                <p className="text-2xl font-bold">
                  {mockClients.filter(c => c.status === 'active').length}
                </p>
                <div className="flex items-center text-sm text-green-600">
                  <span>85% active rate</span>
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
                <p className="text-sm font-medium text-muted-foreground">Avg. Spent</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(mockClients.reduce((sum, c) => sum + c.total_spent, 0) / mockClients.length)}
                </p>
                <div className="flex items-center text-sm text-green-600">
                  <span>+12% vs last month</span>
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
                <p className="text-sm font-medium text-muted-foreground">Top Spender</p>
                <p className="text-lg font-bold">David Brown</p>
                <div className="flex items-center text-sm text-purple-600">
                  <span>{formatCurrency(1875)}</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Clients</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or phone..."
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                Export Clients
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clients List */}
      <Card>
        <CardHeader>
          <CardTitle>Clients ({filteredClients.length})</CardTitle>
          <CardDescription>
            Showing {filteredClients.length} of {mockClients.length} clients
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                      Member since {formatDate(client.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {client.total_appointments}
                    </div>
                    <div className="text-xs text-gray-600">Appointments</div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(client.total_spent)}
                    </div>
                    <div className="text-xs text-gray-600">Total Spent</div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm text-gray-900">
                      {formatDate(client.last_appointment)}
                    </div>
                    <div className="text-xs text-gray-600">Last Visit</div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <ClientStatusBadge status={client.status} />
                    <ClientActions client={client} />
                  </div>
                </div>
              </div>
            ))}

            {filteredClients.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search criteria</p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Client
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}