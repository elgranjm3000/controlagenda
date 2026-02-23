// src/services/auth-session.service.ts

interface StoredSession {
  token: string;
  email: string;
  user: any;
  timestamp: number;
}

class AuthSessionService {
  private readonly STORAGE_KEYS = {
    TOKEN: 'auth_token',
    EMAIL: 'user_email',
    USER: 'user',
    SESSION: 'user_session'
  };

  /**
   * ✅ NUEVO: Debug de sesión actual
   */
  debugSession(): void {
    console.log('🔍 DEBUG SESIÓN ACTUAL:');
    console.log('   Token:', this.getToken()?.substring(0, 20) + '...' || 'NONE');
    console.log('   Email:', this.getCurrentEmail() || 'NONE');
    console.log('   Has User:', !!localStorage.getItem(this.STORAGE_KEYS.USER));
    
    const session = this.getCurrentSession();
    if (session) {
      const age = Date.now() - session.timestamp;
      console.log('   Session Age:', Math.round(age / 1000), 'segundos');
    }
  }

  /**
   * ✅ NUEVO: Limpieza forzada de TODOS los datos
   */
  forceCleanAll(): void {
    console.log('🧹🔥 LIMPIEZA FORZADA - Eliminando TODO...');
    
    // Obtener todas las claves del localStorage
    const allKeys = Object.keys(localStorage);
    
    // Eliminar todo lo relacionado con auth
    allKeys.forEach(key => {
      if (
        key.includes('auth') ||
        key.includes('user') ||
        key.includes('token') ||
        key.includes('session') ||
        key.includes('remember') ||
        key.includes('last_')
      ) {
        console.log('   Eliminando:', key);
        localStorage.removeItem(key);
      }
    });
    
    console.log('✅ Limpieza forzada completada');
  }

  /**
   * Verificar si hay una sesión activa y si coincide con el email proporcionado
   */
  verifySession(email: string): {
    hasSession: boolean;
    emailMatches: boolean;
    currentEmail: string | null;
  } {
    const currentEmail = localStorage.getItem(this.STORAGE_KEYS.EMAIL);
    const hasToken = !!localStorage.getItem(this.STORAGE_KEYS.TOKEN);

    return {
      hasSession: hasToken && !!currentEmail,
      emailMatches: currentEmail === email,
      currentEmail: currentEmail
    };
  }

  /**
   * Limpiar completamente la sesión actual
   */
  clearSession(): void {
    console.log('🧹 Limpiando sesión completa...');
    
    // Limpiar todos los items relacionados con autenticación
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });

    // También limpiar cualquier otro item relacionado con sesión
    const keysToRemove = [
      'remember_me',
      'last_activity',
      'session_id',
      'last_autologin_token'
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    console.log('✅ Sesión limpiada');
  }

  /**
   * Guardar nueva sesión
   */
  saveSession(data: {
    token: string;
    email: string;
    user?: any;
  }): void {
    console.log('💾 Guardando nueva sesión para:', data.email);
    
    localStorage.setItem(this.STORAGE_KEYS.TOKEN, data.token);
    localStorage.setItem(this.STORAGE_KEYS.EMAIL, data.email);
    
    if (data.user) {
      localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(data.user));
    }

    // Guardar timestamp de la sesión
    const session: StoredSession = {
      token: data.token,
      email: data.email,
      user: data.user,
      timestamp: Date.now()
    };
    
    localStorage.setItem(this.STORAGE_KEYS.SESSION, JSON.stringify(session));
    
    console.log('✅ Sesión guardada exitosamente');
  }

  /**
   * Obtener información de la sesión actual
   */
  getCurrentSession(): StoredSession | null {
    try {
      const sessionData = localStorage.getItem(this.STORAGE_KEYS.SESSION);
      if (!sessionData) return null;
      
      return JSON.parse(sessionData) as StoredSession;
    } catch (error) {
      console.error('Error al obtener sesión:', error);
      return null;
    }
  }

  /**
   * Verificar si la sesión ha expirado (opcional)
   */
  isSessionExpired(maxAgeMinutes: number = 60): boolean {
    const session = this.getCurrentSession();
    if (!session) return true;

    const now = Date.now();
    const sessionAge = now - session.timestamp;
    const maxAge = maxAgeMinutes * 60 * 1000; // convertir a milisegundos

    return sessionAge > maxAge;
  }

  /**
   * Validar y limpiar sesión si no coincide con el nuevo usuario
   */
  async validateAndCleanSession(newEmail: string): Promise<{
    needsLogin: boolean;
    previousEmail: string | null;
    action: 'same_user' | 'different_user' | 'no_session';
  }> {
    const verification = this.verifySession(newEmail);

    // No hay sesión previa
    if (!verification.hasSession) {
      return {
        needsLogin: true,
        previousEmail: null,
        action: 'no_session'
      };
    }

    // Mismo usuario
    if (verification.emailMatches) {
      console.log('✅ Sesión existente del mismo usuario');
      return {
        needsLogin: false,
        previousEmail: verification.currentEmail,
        action: 'same_user'
      };
    }

    // Usuario diferente - limpiar sesión
    console.log('⚠️ Usuario diferente detectado');
    console.log('  Anterior:', verification.currentEmail);
    console.log('  Nuevo:', newEmail);
    
    this.clearSession();
    
    // Esperar un momento para asegurar que se limpió
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      needsLogin: true,
      previousEmail: verification.currentEmail,
      action: 'different_user'
    };
  }

  /**
   * Obtener token actual
   */
  getToken(): string | null {
    return localStorage.getItem(this.STORAGE_KEYS.TOKEN);
  }

  /**
   * Obtener email actual
   */
  getCurrentEmail(): string | null {
    return localStorage.getItem(this.STORAGE_KEYS.EMAIL);
  }

  /**
   * Verificar si hay token válido
   */
  hasValidToken(): boolean {
    const token = this.getToken();
    return !!token && token.length > 0;
  }
}

// Exportar instancia única
export const authSessionService = new AuthSessionService();

// Exportar clase para testing
export { AuthSessionService };