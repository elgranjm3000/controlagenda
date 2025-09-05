export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

// User & Authentication
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'staff' | 'viewer';
  company_id: number;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Company
export interface Company {
  id: number;
  name: string;
  slug: string;
  timezone: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

// Client
export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  company_id: number;
  created_at: string;
  updated_at: string;
  appointments_count?: number;
  last_appointment?: string;
}

// Service
export interface Service {
  id: number;
  name: string;
  category: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  company_id: number;
  created_at: string;
  updated_at: string;
}

// Appointment
export interface Appointment {
  id: number;
  client_id: number;
  service_id: number;
  user_id: number;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  company_id: number;
  created_at: string;
  updated_at: string;
  client?: Client;
  service?: Service;
  user?: User;
}

// Payment
export interface Payment {
  id: number;
  appointment_id: number;
  amount: number;
  method: 'cash' | 'card' | 'online';
  status: 'pending' | 'paid' | 'refunded';
  transaction_reference?: string;
  company_id: number;
  created_at: string;
  updated_at: string;
  appointment?: Appointment;
}

// Availability
export interface AvailabilitySlot {
  start_time: string;
  end_time: string;
  available: boolean;
}

// Reports
export interface DailyOccupancyReport {
  date: string;
  total_slots: number;
  booked_slots: number;
  occupancy_rate: number;
  revenue: number;
  appointments: Appointment[];
}

export interface SalesReportItem {
  date: string;
  period: string;
  total_revenue: number;
  total_appointments: number;
  average_revenue_per_appointment: number;
}

export interface FrequentClient {
  client: Client;
  total_appointments: number;
  total_spent: number;
  last_appointment: string;
}

export interface MonthlyOverview {
  year: number;
  month: number;
  total_revenue: number;
  total_appointments: number;
  new_clients: number;
  returning_clients: number;
  most_popular_service: Service;
  top_client: Client;
  daily_breakdown: Array<{
    date: string;
    revenue: number;
    appointments: number;
  }>;
}
