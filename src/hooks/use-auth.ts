// src/hooks/use-auth.ts
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { authApi } from '@/lib/auth';
import { authSessionService } from '@/services/auth-session.service';

export function useAuth() {
  const authStore = useAuthStore();
  const pathname = usePathname();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // IMPORTANTE: No restaurar sesión si estamos en la página de AutoLogin
        if (pathname === '/autoLogin') {
          console.log('🔄 En AutoLogin, omitiendo restauración de sesión');
          authStore.setLoading(false);
          return;
        }

        // Obtener datos de la sesión actual
        const token = authSessionService.getToken();
        const email = authSessionService.getCurrentEmail();
        const userStr = localStorage.getItem('user');
        console.log(email ? '🔄 Restaurando sesión para: ' + email : '🔍 No hay sesión guardada');

        // Verificar que existan todos los datos necesarios
        if (token && email && userStr) {
          try {
            const user = JSON.parse(userStr);
            
            // Verificar que el email del user coincida con el almacenado
            if (user.email && user.email === email) {
              console.log('✅ Sesión válida detectada:', email);
              authStore.setAuth(user, token);
            } else {
              console.warn('⚠️ Inconsistencia de datos de usuario, limpiando...');
              authSessionService.clearSession();
              authStore.clearAuth();
            }
          } catch (error) {
            console.error('❌ Error al parsear usuario:', error);
            authSessionService.clearSession();
            authStore.clearAuth();
          }
        } else {
          // No hay sesión completa, limpiar cualquier dato residual
          if (token || email || userStr) {
            console.log('🧹 Datos de sesión incompletos, limpiando...');
            authSessionService.clearSession();
          }
          authStore.setLoading(false);
        }
      } catch (error) {
        console.error('❌ Error al inicializar auth:', error);
        authSessionService.clearSession();
        authStore.clearAuth();
      }
    };

    initAuth();
  }, [pathname]); // Agregar pathname como dependencia

  const login = async (credentials: { email: string; password: string }) => {
    try {
      authStore.setLoading(true);
      
      console.log('🔐 Intentando login para:', credentials.email);

      // Realizar el login
      const { user, token } = await authApi.login(credentials);
      
      console.log('✅ Respuesta de API recibida');
      
      // PRIMERO: Limpiar cualquier sesión anterior
      authSessionService.clearSession();
      
      // SEGUNDO: Guardar en el store
      authStore.setAuth(user, token);
      
      // TERCERO: Guardar en el servicio de sesiones
      authSessionService.saveSession({
        token,
        email: user.email,
        user
      });

      // Verificar que se guardó correctamente
      const savedEmail = authSessionService.getCurrentEmail();
      const savedToken = authSessionService.getToken();
      
      console.log('✅ Login exitoso completado');
      console.log('   Email guardado:', savedEmail);
      console.log('   Token guardado:', savedToken ? 'Sí' : 'No');
      
      return { 
        success: true,
        user,
        token
      };
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      authStore.setLoading(false);
      
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al iniciar sesión',
        user: null,
        token: null
      };
    }
  };

  const logout = async () => {
    try {
      console.log('👋 Iniciando cierre de sesión...');
      
      const email = authSessionService.getCurrentEmail();
      console.log('   Cerrando sesión de:', email);
      
      // Intentar hacer logout en el servidor
      try {
        await authApi.logout();
        console.log('✅ Logout en servidor exitoso');
      } catch (error) {
        console.warn('⚠️ Error al cerrar sesión en servidor:', error);
      }
      
    } catch (error) {
      console.warn('⚠️ Error general en logout:', error);
    } finally {
      // SIEMPRE limpiar sesión local, incluso si falla el servidor
      console.log('🧹 Limpiando sesión local...');
      authSessionService.clearSession();
      authStore.clearAuth();
      
      console.log('✅ Sesión cerrada completamente');
    }
  };

  const refreshAuth = async () => {
    try {
      const session = authSessionService.getCurrentSession();
      
      if (!session || !session.token) {
        console.log('ℹ️ No hay sesión para refrescar');
        return { success: false };
      }

      // Aquí podrías hacer una llamada al servidor para validar/refrescar el token
      // const newToken = await authApi.refreshToken(session.token);
      
      console.log('🔄 Sesión refrescada');
      return { success: true };
    } catch (error) {
      console.error('❌ Error al refrescar sesión:', error);
      authSessionService.clearSession();
      authStore.clearAuth();
      return { success: false };
    }
  };

  const validateSession = () => {
    const token = authSessionService.getToken();
    const email = authSessionService.getCurrentEmail();
    
    const isValid = !!(token && email && authStore.user);
    
    console.log('🔍 Validación de sesión:', {
      hasToken: !!token,
      hasEmail: !!email,
      hasUser: !!authStore.user,
      isValid
    });
    
    if (!isValid) {
      console.warn('⚠️ Sesión inválida detectada');
      authSessionService.clearSession();
      authStore.clearAuth();
    }
    
    return isValid;
  };

  return {
    ...authStore,
    login,
    logout,
    refreshAuth,
    validateSession,
  };
}