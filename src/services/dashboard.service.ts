// services/dashboard.service.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface KPI {
  title: string;
  maskAmount: string;
  footer: string;
  amount: number;
  title_color: string;
}

interface ChartData {
  title: string;
  footer: string;
  y1: number[] | null;
  y2: number[] | null;
  x1: string[] | number[] | null;
  x2: string[] | number[] | null;
}

interface DashboardData {
  period: string;
  executive_id: string | number;
  kpi_1: KPI | null;
  kpi_2: KPI | null;
  kpi_3: KPI | null;
  kpi_4: KPI | null;
  chart_dual: ChartData | null;
  chart_single: ChartData | null;
}

interface PeriodsResponse {
  total: number;
  periods: string[];
  current_period: string;
}

class DashboardService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    };
  }

  /**
   * Obtener dashboard completo
   * @param period - Período en formato YYYYMM (opcional)
   */
  async getDashboard(period?: string): Promise<DashboardData> {
    const url = period 
      ? `${API_BASE_URL}/dashboard?period=${period}`
      : `${API_BASE_URL}/dashboard`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const result: ApiResponse<DashboardData> = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Error al obtener dashboard');
    }

    return result.data;
  }

  /**
   * Obtener KPI individual
   * @param type - Tipo de KPI (10, 11, 12, 13)
   * @param period - Período opcional
   */
  async getKPI(type: 10 | 11 | 12 | 13, period?: string): Promise<KPI> {
    const url = period
      ? `${API_BASE_URL}/dashboard/kpi/${type}?period=${period}`
      : `${API_BASE_URL}/dashboard/kpi/${type}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const result: ApiResponse<KPI> = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Error al obtener KPI');
    }

    return result.data;
  }

  /**
   * Obtener gráfico dual
   * @param period - Período opcional
   */
  async getDualChart(period?: string): Promise<ChartData> {
    const url = period
      ? `${API_BASE_URL}/dashboard/chart/dual?period=${period}`
      : `${API_BASE_URL}/dashboard/chart/dual`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const result: ApiResponse<ChartData> = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Error al obtener gráfico dual');
    }

    return result.data;
  }

  /**
   * Obtener gráfico simple
   * @param period - Período opcional
   */
  async getSingleChart(period?: string): Promise<ChartData> {
    const url = period
      ? `${API_BASE_URL}/dashboard/chart/single?period=${period}`
      : `${API_BASE_URL}/dashboard/chart/single`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const result: ApiResponse<ChartData> = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Error al obtener gráfico');
    }

    return result.data;
  }

  /**
   * Obtener períodos disponibles
   */
  async getPeriods(): Promise<PeriodsResponse> {
    const response = await fetch(`${API_BASE_URL}/dashboard/periods`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const result: ApiResponse<PeriodsResponse> = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Error al obtener períodos');
    }

    return result.data;
  }

  /**
   * Comparar múltiples períodos
   * @param periods - Array de períodos en formato YYYYMM
   */
  async comparePeriods(periods: string[]): Promise<any> {
    const periodsQuery = periods.map((p, i) => `periods[${i}]=${p}`).join('&');
    
    const response = await fetch(
      `${API_BASE_URL}/dashboard/compare?${periodsQuery}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const result: ApiResponse<any> = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Error al comparar períodos');
    }

    return result.data;
  }

  /**
   * Debug de indicador (solo desarrollo)
   * @param id - ID del indicador
   */
  async debugIndicator(id: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/dashboard/debug/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const result: ApiResponse<any> = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Error en debug');
    }

    return result.data;
  }
}

// Exportar instancia única
export const dashboardService = new DashboardService();

// Exportar tipos
export type {
  KPI,
  ChartData,
  DashboardData,
  PeriodsResponse,
};