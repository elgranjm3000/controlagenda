// hooks/use-dashboard.ts

import { useState, useEffect, useCallback } from 'react';
import { dashboardService, type DashboardData } from '@/services/dashboard.service';

interface UseDashboardOptions {
  period?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // en milisegundos
}

interface UseDashboardReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setPeriod: (period: string) => void;
}

export function useDashboard(options: UseDashboardOptions = {}): UseDashboardReturn {
  const { 
    period: initialPeriod, 
    autoRefresh = false, 
    refreshInterval = 60000 // 1 minuto por defecto
  } = options;

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string | undefined>(initialPeriod);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await dashboardService.getDashboard(period);
      setData(result);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [period]);

  // Cargar datos inicialmente
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);

  return {
    data,
    loading,
    error,
    refresh: fetchData,
    setPeriod,
  };
}

// Hook para obtener períodos disponibles
export function useDashboardPeriods() {
  const [periods, setPeriods] = useState<string[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPeriods() {
      try {
        setLoading(true);
        setError(null);

        const result = await dashboardService.getPeriods();
        setPeriods(result.periods);
        setCurrentPeriod(result.current_period);
      } catch (err) {
        console.error('Error fetching periods:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }

    fetchPeriods();
  }, []);

  return { periods, currentPeriod, loading, error };
}