// ==================== EJEMPLOS DE USO ====================
// Copiar estos ejemplos a tu proyecto React/TypeScript

import axios, { AxiosInstance } from 'axios';
import {
  ApiResponse,
  PaginatedResponse,
  JobOffer,
  JobDayExecutive,
  JobDayContact,
  JobPhone,
  JobClientStatus,
  JobIndicatorExecutive,
  CreateJobOfferRequest,
  CreateJobExecutiveRequest,
  CreateJobContactRequest,
  JobOfferQueryParams,
  JobExecutiveQueryParams,
} from './api';

// ==================== API CLIENT ====================
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/agendachile/public/api/v1';

class JobSystemAPI {
  private client: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Interceptor para agregar token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Interceptor para manejar errores
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Redirigir al login
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // ==================== AUTHENTICATION ====================

  async login(email: string, password: string) {
    const response = await this.client.post<ApiResponse<{ user: any; token: string }>>(
      '/auth/login',
      { email, password }
    );
    
    // Guardar token
    localStorage.setItem('token', response.data.data.token);
    
    return response.data.data;
  }

  async logout() {
    await this.client.post('/auth/logout');
    localStorage.removeItem('auth_token');
  }

  async getCurrentUser() {
    const response = await this.client.get<ApiResponse>('/auth/me');
    return response.data.data;
  }

  // ==================== JOB OFFERS ====================

  async getJobOffers(params?: JobOfferQueryParams) {
    const response = await this.client.get<PaginatedResponse<JobOffer>>(
      '/job-offers',
      { params }
    );
    return response.data;
  }

  async getJobOffer(id: number) {
    const response = await this.client.get<ApiResponse<JobOffer>>(
      `/job-offers/${id}`
    );
    return response.data.data;
  }

  async createJobOffer(data: CreateJobOfferRequest) {
    const response = await this.client.post<ApiResponse<JobOffer>>(
      '/job-offers',
      data
    );
    return response.data.data;
  }

  async updateJobOffer(id: number, data: Partial<CreateJobOfferRequest>) {
    const response = await this.client.put<ApiResponse<JobOffer>>(
      `/job-offers/${id}`,
      data
    );
    return response.data.data;
  }

  async deleteJobOffer(id: number) {
    await this.client.delete(`/job-offers/${id}`);
  }

  async activateJobOffer(id: number) {
    const response = await this.client.post<ApiResponse<JobOffer>>(
      `/job-offers/${id}/activate`
    );
    return response.data.data;
  }

  async deactivateJobOffer(id: number) {
    const response = await this.client.post<ApiResponse<JobOffer>>(
      `/job-offers/${id}/deactivate`
    );
    return response.data.data;
  }

  async getJobOfferStatistics(id: number) {
    const response = await this.client.get<ApiResponse>(
      `/job-offers/${id}/statistics`
    );
    return response.data.data;
  }

  // ==================== JOB EXECUTIVES ====================

  async getJobExecutives(params?: JobExecutiveQueryParams) {
    const response = await this.client.get<PaginatedResponse<JobDayExecutive>>(
      '/job-executives',
      { params }
    );
    return response.data;
  }

  async getJobExecutive(id: number) {
    const response = await this.client.get<ApiResponse<JobDayExecutive>>(
      `/job-executives/${id}`
    );
    return response.data.data;
  }

  async createJobExecutive(data: CreateJobExecutiveRequest) {
    const response = await this.client.post<ApiResponse<JobDayExecutive>>(
      '/job-executives',
      data
    );
    return response.data.data;
  }

  async updateJobExecutive(id: number, data: Partial<CreateJobExecutiveRequest>) {
    const response = await this.client.put<ApiResponse<JobDayExecutive>>(
      `/job-executives/${id}`,
      data
    );
    return response.data.data;
  }

  async deleteJobExecutive(id: number) {
    await this.client.delete(`/job-executives/${id}`);
  }

  async updateExecutiveStatus(id: number, id_status: number, id_contact?: number) {
    const response = await this.client.put<ApiResponse<JobDayExecutive>>(
      `/job-executives/${id}/status`,
      { id_status, id_contact }
    );
    return response.data.data;
  }

  async scheduleExecutive(id: number, scheduled_date: string) {
    const response = await this.client.put<ApiResponse<JobDayExecutive>>(
      `/job-executives/${id}/schedule`,
      { scheduled_date }
    );
    return response.data.data;
  }

  async getExecutivesByOffice(officeId: string) {
    const response = await this.client.get<ApiResponse>(
      `/job-executives/by-office/${officeId}`
    );
    return response.data.data;
  }

  async bulkUpdateExecutiveStatus(ids: number[], id_status: number, id_contact?: number) {
    const response = await this.client.post<ApiResponse>(
      '/job-executives/bulk-update-status',
      { ids, id_status, id_contact }
    );
    return response.data.data;
  }

  // ==================== JOB CONTACTS ====================

  async getJobContacts(params?: any) {
    const response = await this.client.get<PaginatedResponse<JobDayContact>>(
      '/job-contacts',
      { params }
    );
    return response.data;
  }

  async createJobContact(data: CreateJobContactRequest) {
    const response = await this.client.post<ApiResponse<JobDayContact>>(
      '/job-contacts',
      data
    );
    return response.data.data;
  }

  async getTodayContacts(executiveId: number) {
    const response = await this.client.get<ApiResponse>(
      `/job-contacts/today/${executiveId}`
    );
    return response.data.data;
  }

  async getWeekContacts(executiveId: number) {
    const response = await this.client.get<ApiResponse>(
      `/job-contacts/week/${executiveId}`
    );
    return response.data.data;
  }

  async rescheduleContact(id: number, scheduled_date: string) {
    const response = await this.client.put<ApiResponse<JobDayContact>>(
      `/job-contacts/${id}/reschedule`,
      { scheduled_date }
    );
    return response.data.data;
  }

  async getContactStatistics(params?: any) {
    const response = await this.client.get<ApiResponse>(
      '/job-contacts/statistics',
      { params }
    );
    return response.data.data;
  }

  // ==================== JOB PHONES ====================

  async getJobPhones(params?: any) {
    const response = await this.client.get<PaginatedResponse<JobPhone>>(
      '/job-phones',
      { params }
    );
    return response.data;
  }

  async getPhonesByClient(clientId: number) {
    const response = await this.client.get<ApiResponse>(
      `/job-phones/by-client/${clientId}`
    );
    return response.data.data;
  }

  async createJobPhone(data: any) {
    const response = await this.client.post<ApiResponse<JobPhone>>(
      '/job-phones',
      data
    );
    return response.data.data;
  }

  async bulkCreatePhones(phones: any[]) {
    const response = await this.client.post<ApiResponse>(
      '/job-phones/bulk-create',
      { phones }
    );
    return response.data.data;
  }

  // ==================== JOB STATUS ====================

  async getClientStatuses(params?: any) {
    const response = await this.client.get<ApiResponse<JobClientStatus[]>>(
      '/job-status/client',
      { params }
    );
    return response.data;
  }

  async getContactStatuses(params?: any) {
    const response = await this.client.get<ApiResponse>(
      '/job-status/contact',
      { params }
    );
    return response.data.data;
  }

  async getAllStatuses() {
    const response = await this.client.get<ApiResponse>(
      '/job-status/all'
    );    
    return response.data;
  }

  async createClientStatus(data: { descrip: string; is_life: boolean }) {
    const response = await this.client.post<ApiResponse<JobClientStatus>>(
      '/job-status/client',
      data
    );
    return response.data.data;
  }

  async createContactStatus(data: any) {
    const response = await this.client.post<ApiResponse>(
      '/job-status/contact',
      data
    );
    return response.data.data;
  }

  // ==================== JOB INDICATORS ====================

  async getJobIndicators(params?: any) {
    const response = await this.client.get<PaginatedResponse<JobIndicatorExecutive>>(
      '/job-indicators',
      { params }
    );
    return response.data;
  }

  async createJobIndicator(data: any) {
    const response = await this.client.post<ApiResponse<JobIndicatorExecutive>>(
      '/job-indicators',
      data
    );
    return response.data.data;
  }

  async getIndicatorsByExecutiveAndPeriod(executiveId: number, period: string) {
    const response = await this.client.get<ApiResponse>(
      `/job-indicators/executive/${executiveId}/period/${period}`
    );
    return response.data.data;
  }

  async getLatestIndicators(executiveId: number) {
    const response = await this.client.get<ApiResponse>(
      `/job-indicators/executive/${executiveId}/latest`
    );
    return response.data.data;
  }

  async getIndicatorsSummary(executiveId: number) {
    const response = await this.client.get<ApiResponse>(
      `/job-indicators/summary/${executiveId}`
    );
    return response.data.data;
  }

  async compareIndicators(executive_ids: number[], period: string, type?: number) {
    const response = await this.client.post<ApiResponse>(
      '/job-indicators/compare',
      { executive_ids, period, type }
    );
    return response.data.data;
  }

  async bulkCreateIndicators(indicators: any[]) {
    const response = await this.client.post<ApiResponse>(
      '/job-indicators/bulk-create',
      { indicators }
    );
    return response.data.data;
  }

  // ==================== JOB ATTRIBS ====================

  async getJobAttribs(params?: any) {
    const response = await this.client.get<PaginatedResponse<any>>(
      '/job-attribs',
      { params }
    );
    return response.data;
  }

  async getAttribsByType(type: number) {
    const response = await this.client.get<ApiResponse>(
      `/job-attribs/by-type/${type}`
    );
    return response.data.data;
  }

  async getAttribSchema(type: number) {
    const response = await this.client.get<ApiResponse>(
      `/job-attribs/schema/${type}`
    );
    return response.data.data;
  }

  async validateAttribData(id_type: number, data: Record<string, string>) {
    const response = await this.client.post<ApiResponse>(
      '/job-attribs/validate-data',
      { id_type, data }
    );
    return response.data.data;
  }

  async exportAttribs(type: number) {
    const response = await this.client.get<ApiResponse>(
      `/job-attribs/export/${type}`
    );
    return response.data.data;
  }

  async importAttribs(type: number, configurations: any[], replace_existing = false) {
    const response = await this.client.post<ApiResponse>(
      '/job-attribs/import',
      { type, configurations, replace_existing }
    );
    return response.data.data;
  }
}

// ==================== EXPORT SINGLETON ====================

export const api = new JobSystemAPI();

// ==================== REACT HOOKS EXAMPLES ====================

// Hook personalizado para Job Offers
import { useState, useEffect } from 'react';

export function useJobOffers(params?: JobOfferQueryParams) {
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const response = await api.getJobOffers(params);
        setOffers(response.data);
        setPagination(response.pagination);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [JSON.stringify(params)]);

  return { offers, loading, error, pagination };
}

// Hook para un Job Offer específico
export function useJobOffer(id: number) {
  const [offer, setOffer] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        setLoading(true);
        const data = await api.getJobOffer(id);
        setOffer(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOffer();
    }
  }, [id]);

  return { offer, loading, error };
}

// Hook para Job Executives
export function useJobExecutives(params?: JobExecutiveQueryParams) {
  const [executives, setExecutives] = useState<JobDayExecutive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    const fetchExecutives = async () => {
      try {
        setLoading(true);
        const response = await api.getJobExecutives(params);
        setExecutives(response.data);
        setPagination(response.pagination);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExecutives();
  }, [JSON.stringify(params)]);

  return { executives, loading, error, pagination };
}

// Hook para contactos de hoy
export function useTodayContacts(executiveId: number) {
  const [contacts, setContacts] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        const data = await api.getTodayContacts(executiveId);
        setContacts(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (executiveId) {
      fetchContacts();
    }
  }, [executiveId]);

  const refresh = async () => {
    try {
      const data = await api.getTodayContacts(executiveId);
      setContacts(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return { contacts, loading, error, refresh };
}

// Hook para estados
export function useStatuses() {
  const [statuses, setStatuses] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        setLoading(true);
        const data = await api.getAllStatuses();
        setStatuses(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStatuses();
  }, []);

  return { statuses, loading, error };
}

// ==================== COMPONENTES DE EJEMPLO ====================
