export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
}

// ==================== EXISTING TYPES ====================

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

// ==================== JOB SYSTEM TYPES ====================

// Job Offer (Ofertas/Campañas)
export interface JobOffer {
  id_offers: number;
  descrip: string;
  date_begin: string;
  date_end: string;
  stamp: string;
  id_user: number;
  is_life: boolean;
  is_delete: boolean;
  day_executives_count?: number;
  day_contacts_count?: number;
  dayExecutives?: JobDayExecutive[];
  dayContacts?: JobDayContact[];
}

export interface CreateJobOfferRequest {
  descrip: string;
  date_begin: string;
  date_end: string;
  id_user: number;
  is_life?: boolean;
}

export interface UpdateJobOfferRequest {
  descrip?: string;
  date_begin?: string;
  date_end?: string;
  is_life?: boolean;
}

export interface JobOfferStatistics {
  offer: JobOffer;
  statistics: {
    total_executives: number;
    total_contacts: number;
    scheduled_contacts: number;
    executives_by_status: Array<{
      id_status: number;
      total: number;
    }>;
    contacts_by_status: Array<{
      id_contact: number;
      total: number;
    }>;
  };
}

// Job Day Executive (Ejecutivos del día)
export interface JobDayExecutive {
  id: number;
  id_offers: number;
  id_client: number;
  dv_client: string;
  id_executive: number;
  dv_executive: string;
  name: string;
  last_name1: string;
  last_name2: string;
  full_name?: string;
  id_office: string;
  attrib1?: string;
  attrib2?: string;
  attrib3?: string;
  attrib4?: string;
  attrib5?: string;
  attrib6?: string;
  attrib7?: string;
  attrib8?: string;
  attrib9?: string;
  attrib10?: string;
  attrib11?: string;
  attrib12?: string;
  attrib13?: string;
  attrib14?: string;
  attrib15?: string;
  attrib16?: string;
  attrib17?: string;
  attrib18?: string;
  attrib19?: string;
  attrib20?: string;
  attrib21?: string;
  attrib22?: string;
  id_status: number;
  id_contact: number;
  scheduled_date?: string;
  stamp: string;
  offer?: JobOffer;
  status?: JobClientStatus;
  contactStatus?: JobClientStatusContact;
  contacts?: JobDayContact[];
  contacts_count?: number;
}

export interface CreateJobExecutiveRequest {
  id_offers: number;
  id_client: number;
  dv_client: string;
  id_executive: number;
  dv_executive: string;
  name: string;
  last_name1: string;
  last_name2?: string;
  id_office?: string;
  attrib1?: string;
  attrib2?: string;
  attrib3?: string;
  attrib4?: string;
  attrib5?: string;
  attrib6?: string;
  attrib7?: string;
  attrib8?: string;
  attrib9?: string;
  attrib10?: string;
  id_status?: number;
  id_contact?: number;
  scheduled_date?: string;
}

export interface UpdateJobExecutiveRequest {
  name?: string;
  last_name1?: string;
  last_name2?: string;
  id_office?: string;
  id_status?: number;
  id_contact?: number;
  scheduled_date?: string;
  attrib1?: string;
  attrib2?: string;
  attrib3?: string;
  attrib4?: string;
  attrib5?: string;
}

export interface UpdateExecutiveStatusRequest {
  id_status: number;
  id_contact?: number;
}

export interface ScheduleExecutiveRequest {
  scheduled_date: string;
}

export interface BulkUpdateStatusRequest {
  ids: number[];
  id_status: number;
  id_contact?: number;
}

// Job Day Contact (Contactos)
export interface JobDayContact {
  id: number;
  id_offers: number;
  id_phone: number;
  id_client: number;
  stamp: string;
  id_executive: number;
  id_status: number;
  id_contact: number;
  scheduled_date?: string;
  offer?: JobOffer;
  phone?: JobPhone;
  executive?: JobDayExecutive;
  user?: User;
  status?: JobClientStatus;
  contactStatus?: JobClientStatusContact;
}

export interface CreateJobContactRequest {
  id_offers: number;
  id_phone: number;
  id_client: number;
  id_executive: number;
  id_status: number;
  id_contact: number;
  scheduled_date?: string;
}

export interface UpdateJobContactRequest {
  id_status?: number;
  id_contact?: number;
  scheduled_date?: string;
}

export interface RescheduleContactRequest {
  scheduled_date: string;
}

export interface ContactStatistics {
  total_contacts: number;
  scheduled_contacts: number;
  completed_contacts: number;
  by_status: Array<{
    id_status: number;
    total: number;
    status?: JobClientStatus;
  }>;
  by_contact_type: Array<{
    id_contact: number;
    total: number;
    contactStatus?: JobClientStatusContact;
  }>;
}

// Job Phone (Teléfonos)
export interface JobPhone {
  id_phone: number;
  id_client: number;
  attrib1?: string;
  attrib2?: string;
  attrib3?: string;
  attrib4?: string;
  attrib5?: string;
  phone: number;
  update_date: string;
  formatted_phone?: string;
  contacts?: JobDayContact[];
  contacts_count?: number;
}

export interface CreateJobPhoneRequest {
  id_client: number;
  phone: number;
  attrib1?: string;
  attrib2?: string;
  attrib3?: string;
  attrib4?: string;
  attrib5?: string;
}

export interface UpdateJobPhoneRequest {
  phone?: number;
  attrib1?: string;
  attrib2?: string;
  attrib3?: string;
  attrib4?: string;
  attrib5?: string;
}

export interface BulkCreatePhonesRequest {
  phones: CreateJobPhoneRequest[];
}

// Job Client Status (Estados de Cliente)
export interface JobClientStatus {
  id_status: number;
  descrip: string;
  is_life: boolean;
  executives_count?: number;
  contacts_count?: number;
  contact_statuses_count?: number;
  contactStatuses?: JobClientStatusContact[];
}

export interface CreateJobClientStatusRequest {
  descrip: string;
  is_life: boolean;
}

export interface UpdateJobClientStatusRequest {
  descrip?: string;
  is_life?: boolean;
}

// Job Client Status Contact (Estados de Contacto)
export interface JobClientStatusContact {
  id_contact: number;
  descrip: string;
  id_status: number;
  is_life: boolean;
  is_scheduled: boolean;
  status?: JobClientStatus;
  executives_count?: number;
  contacts_count?: number;
}

export interface CreateJobClientStatusContactRequest {
  descrip: string;
  id_status: number;
  is_life: boolean;
  is_scheduled: boolean;
}

export interface UpdateJobClientStatusContactRequest {
  descrip?: string;
  id_status?: number;
  is_life?: boolean;
  is_scheduled?: boolean;
}

export interface AllStatusResponse {
  client_statuses: JobClientStatus[];
  contact_statuses: JobClientStatusContact[];
}

// Job Indicator Executive (Indicadores)
export interface JobIndicatorExecutive {
  id: number;
  type: number;
  period: string;
  id_executive: number;
  title: string;
  amount: number;
  maskAmount: string;
  footer: string;
  title_color: string;
  y1?: number[];
  x1?: string[];
  y2?: number[];
  x2?: string[];
  chart_data?: {
    y1?: number[];
    x1?: string[];
    y2?: number[];
    x2?: string[];
  };
  executive?: User;
}

export interface CreateJobIndicatorRequest {
  type: number;
  period: string;
  id_executive: number;
  title: string;
  amount: number;
  maskAmount: string;
  footer?: string;
  title_color?: string;
  y1?: number[];
  x1?: string[];
  y2?: number[];
  x2?: string[];
}

export interface UpdateJobIndicatorRequest {
  title?: string;
  amount?: number;
  maskAmount?: string;
  footer?: string;
  title_color?: string;
  y1?: number[];
  x1?: string[];
  y2?: number[];
  x2?: string[];
}

export interface IndicatorsByPeriodResponse {
  executive_id: number;
  period: string;
  total: number;
  indicators: JobIndicatorExecutive[];
}

export interface IndicatorsSummaryResponse {
  executive_id: number;
  total_periods: number;
  summary: Array<{
    period: string;
    total_indicators: number;
    total_amount: number;
    avg_amount: number;
    indicators: JobIndicatorExecutive[];
  }>;
}

export interface CompareIndicatorsRequest {
  executive_ids: number[];
  period: string;
  type?: number;
}

export interface CompareIndicatorsResponse {
  period: string;
  type: number | 'all';
  executives_count: number;
  comparison: Record<number, JobIndicatorExecutive[]>;
}

export interface BulkCreateIndicatorsRequest {
  indicators: CreateJobIndicatorRequest[];
}

export interface BulkCreateIndicatorsResponse {
  created_count: number;
  error_count: number;
  errors: string[];
  indicators: JobIndicatorExecutive[];
}

// Job Attrib (Atributos Configurables)
export interface JobAttrib {
  id: number;
  id_type: number;
  attrib1?: string;
  attrib2?: string;
  attrib3?: string;
  attrib4?: string;
  attrib5?: string;
  attrib6?: string;
  attrib7?: string;
  attrib8?: string;
  attrib9?: string;
  attrib10?: string;
  attrib11?: string;
  attrib12?: string;
  attrib13?: string;
  attrib14?: string;
  attrib15?: string;
  attrib16?: string;
  attrib17?: string;
  attrib18?: string;
  attrib19?: string;
  attrib20?: string;
  attrib21?: string;
  attrib22?: string;
}

export interface CreateJobAttribRequest {
  id_type: number;
  attrib1?: string;
  attrib2?: string;
  attrib3?: string;
  attrib4?: string;
  attrib5?: string;
  attrib6?: string;
  attrib7?: string;
  attrib8?: string;
  attrib9?: string;
  attrib10?: string;
  attrib11?: string;
  attrib12?: string;
  attrib13?: string;
  attrib14?: string;
  attrib15?: string;
  attrib16?: string;
  attrib17?: string;
  attrib18?: string;
  attrib19?: string;
  attrib20?: string;
  attrib21?: string;
  attrib22?: string;
}

export interface UpdateJobAttribRequest {
  id_type?: number;
  attrib1?: string;
  attrib2?: string;
  attrib3?: string;
  attrib4?: string;
  attrib5?: string;
  attrib6?: string;
  attrib7?: string;
  attrib8?: string;
  attrib9?: string;
  attrib10?: string;
}

export interface AttribSchemaField {
  field: string;
  label: string;
  order: number;
}

export interface AttribSchemaResponse {
  type: number;
  fields_count: number;
  schema: AttribSchemaField[];
}

export interface ValidateAttribDataRequest {
  id_type: number;
  data: Record<string, string>;
}

export interface ValidateAttribDataResponse {
  is_valid: boolean;
  validation: {
    valid_fields: string[];
    invalid_fields: string[];
    missing_required: string[];
  };
  schema: Record<string, string>;
}

export interface ExportAttribResponse {
  type: number;
  exported_at: string;
  count: number;
  configurations: Array<Record<string, string>>;
}

export interface ImportAttribRequest {
  type: number;
  replace_existing?: boolean;
  configurations: Array<Record<string, string>>;
}

export interface ImportAttribResponse {
  imported_count: number;
  type: number;
  replaced_existing: boolean;
  configurations: JobAttrib[];
}

// ==================== QUERY PARAMETERS ====================

export interface JobOfferQueryParams {
  is_life?: boolean;
  is_delete?: boolean;
  current?: boolean;
  active?: boolean;
  search?: string;
  date_from?: string;
  date_to?: string;
  with_counts?: boolean;
  with_relations?: boolean;
  per_page?: number;
  page?: number;
}

export interface JobExecutiveQueryParams {
  id_offers?: number;
  id_office?: string;
  id_status?: number;
  id_executive?: number;
  id_client?: number;
  scheduled?: boolean;
  search?: string;
  scheduled_from?: string;
  scheduled_to?: string;
  with_contacts?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface JobContactQueryParams {
  id_offers?: number;
  id_executive?: number;
  id_client?: number;
  id_phone?: number;
  id_status?: number;
  id_contact?: number;
  scheduled?: boolean;
  today?: boolean;
  date?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface JobPhoneQueryParams {
  id_client?: number;
  phone?: string;
  search?: string;
  with_contacts?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface JobStatusQueryParams {
  is_life?: boolean;
  is_scheduled?: boolean;
  active?: boolean;
  scheduled?: boolean;
  search?: string;
  with_counts?: boolean;
  with_relations?: boolean;
}

export interface JobIndicatorQueryParams {
  id_executive?: number;
  period?: string;
  type?: number;
  period_from?: string;
  period_to?: string;
  with_executive?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface JobAttribQueryParams {
  id_type?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}


export interface summaryQueryParams {
  success?: boolean;
  message?: string;
  summary_1?: any;
  summary_2?: any;
  summary_3?: any;
  summary_4?: any;
  data?: any;
}