import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { PaginatedResponse, ApiResponse } from '@/types';

export function useApi<T>(
  endpoint: string,
  options?: {
    params?: Record<string, any>;
    enabled?: boolean;
  }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (options?.enabled === false) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get<ApiResponse<T>>(endpoint, {
          params: options?.params,
        });
        setData(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, JSON.stringify(options?.params), options?.enabled]);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<ApiResponse<T>>(endpoint, {
        params: options?.params,
      });
      setData(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}

export function usePaginatedApi<T>(
  endpoint: string,
  options?: {
    params?: Record<string, any>;
    enabled?: boolean;
  }
) {
  const [data, setData] = useState<T[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (options?.enabled === false) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get<PaginatedResponse<T>>(endpoint, {
          params: options?.params,
        });
        setData(response.data.data);
        setMeta(response.data.meta);
      } catch (err: any) {
        setError(err.response?.data?.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, JSON.stringify(options?.params), options?.enabled]);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<PaginatedResponse<T>>(endpoint, {
        params: options?.params,
      });
      setData(response.data.data);
      setMeta(response.data.meta);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { data, meta, loading, error, refetch };
}
