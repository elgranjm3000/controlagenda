import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { authApi } from '@/lib/auth';

export function useAuth() {
  const authStore = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const userStr = localStorage.getItem('user');

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          authStore.setAuth(user, token);
        } catch (error) {
          authStore.clearAuth();
        }
      } else {
        authStore.setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      authStore.setLoading(true);
      const { user, token } = await authApi.login(credentials);
      authStore.setAuth(user, token);
      return { success: true };
    } catch (error: any) {
      authStore.setLoading(false);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      authStore.clearAuth();
    }
  };

  return {
    ...authStore,
    login,
    logout,
  };
}