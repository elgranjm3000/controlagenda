'use client'
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authSessionService } from '@/services/auth-session.service';
import { authApi } from '@/lib/auth';
import { useAuthStore } from '@/store/auth-store';

// ✅ Bandera global para prevenir que useAuth restaure sesión
if (typeof window !== 'undefined') {
  (window as any).__AUTOLOGIN_ACTIVE__ = true;
}

export default function AutoLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authStore = useAuthStore();
  
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState('Procesando acceso...');
  const [processing, setProcessing] = useState(false);

  // ✅ Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__AUTOLOGIN_ACTIVE__;
      }
    };
  }, []);

  // ✅ EFECTO PRINCIPAL: Detectar cambio de token y procesar
  useEffect(() => {
    console.log('\n🔄 ===== AUTOLOGIN EFFECT =====');
    console.log('Token actual:', token?.substring(0, 20));
    
    if (!token) {
      console.log('❌ No hay token');
      setStatus('Token no encontrado, redirigiendo...');
      setTimeout(() => router.push('/login'), 2000);
      return;
    }

    // Obtener el último token procesado
    const lastToken = sessionStorage.getItem('last_autologin_token');
    console.log('Último token guardado:', lastToken?.substring(0, 20) || 'NINGUNO');
    
    // ✅ Si hay un token diferente, RECARGAR LA PÁGINA COMPLETAMENTE
    if (lastToken && lastToken !== token) {
      console.log('🔥 TOKEN DIFERENTE DETECTADO');
      console.log('   Anterior:', lastToken.substring(0, 20));
      console.log('   Nuevo:', token.substring(0, 20));
      console.log('   🔄 FORZANDO RECARGA COMPLETA DE LA PÁGINA...');
      
      // Limpiar TODO
      sessionStorage.clear();
      localStorage.clear();
      
      // Recargar la página completamente (esto reinicia todo React)
      window.location.reload();
      return;
    }
    
    // ✅ Si el token ya fue procesado exitosamente
    if (lastToken === token) {
      console.log('✅ Token ya procesado, verificando sesión...');
      const currentEmail = authSessionService.getCurrentEmail();
      
      if (currentEmail) {
        console.log('✅ Sesión activa, redirigiendo a dashboard...');
        setTimeout(() => router.push('/out/dashboard'), 500);
      } else {
        console.log('⚠️ Token procesado pero sin sesión, reprocesando...');
        sessionStorage.removeItem('last_autologin_token');
        handleAutoLogin(token);
      }
      return;
    }

    // ✅ Token nuevo, procesarlo
    if (!processing) {
      console.log('🆕 Nuevo token, iniciando proceso...');
      handleAutoLogin(token);
    }
    
    console.log('===================================\n');
  }, [token]);
  
  const handleAutoLogin = async (tempToken: string) => {
    console.log('\n🚀 ===== HANDLEAUTOLOGIN INICIADO =====');
    console.log('Token:', tempToken.substring(0, 20));
    
    if (processing) {
      console.log('⏸️ Ya está procesando, abortando');
      return;
    }

    setProcessing(true);

    try {
      console.log('\n=== INICIO AUTOLOGIN ===');
      console.log('🔑 Token:', tempToken.substring(0, 20) + '...');
      authSessionService.debugSession();
      console.log('========================\n');

      setStatus('Validando token de acceso...');
      
      // PASO 1: Validar el token temporal
      console.log('📡 Paso 1: Validando token en servidor...');
      const formData = new FormData();
      formData.append('token', tempToken);
      
      const response = await fetch(
        'https://desarrollo.solventa.walla.tech/dashboard/validar_token_temporal', 
        {
          method: 'POST',
          body: formData,
        }
      );
      
      console.log('   Response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Error al validar token');
      }
      
      const validation = await response.json();
      console.log('   Validation:', validation);
      
      if (!validation.valid) {
        setStatus('Token inválido o expirado');
        setProcessing(false);
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      const newEmail = validation.email;
      console.log('✅ Token válido para:', newEmail);

      // PASO 2: Limpiar cualquier sesión anterior
      console.log('\n🧹 Paso 2: Limpiando sesión anterior...');
      authSessionService.clearSession();
      authStore.clearAuth();
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log('✅ Limpieza completada');
      
      // PASO 3: Login limpio
      console.log('\n🔐 Paso 3: Iniciando login...');
      setStatus('Iniciando sesión...');
      
      const { user, token } = await authApi.login({
        email: validation.email,
        password: validation.temp_password
      });
      
      console.log('✅ Login exitoso');
      
      // PASO 4: Guardar sesión
      console.log('\n💾 Paso 4: Guardando sesión...');
      
      authStore.setAuth(user, token);
      
      authSessionService.saveSession({
        token: token,
        email: validation.email,
        user: user
      });
      
      // ✅ Marcar token como procesado
      sessionStorage.setItem('last_autologin_token', tempToken);
      
      const savedEmail = authSessionService.getCurrentEmail();
      const savedToken = authSessionService.getToken();
      console.log('   Email guardado:', savedEmail);
      console.log('   Token presente:', !!savedToken);
      
      setStatus('¡Acceso concedido! Redirigiendo...');
      
      console.log('\n=== FIN AUTOLOGIN ===');
      authSessionService.debugSession();
      console.log('====================\n');
      
      // Redirigir
      setTimeout(() => {
        console.log('🚀 Redirigiendo a dashboard...');
        window.location.href = '/out/dashboard';
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error en auto login:', error);
      setStatus('Error de conexión. Redirigiendo...');
      setProcessing(false);
      setTimeout(() => router.push('/login'), 2000);
    } finally {
      setProcessing(false);
    }
  };
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      gap: '20px',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        border: '4px solid #e0e0e0',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        animation: 'spin 1s linear infinite'
      }} />
      
      <div style={{ 
        fontSize: '16px', 
        color: '#333',
        textAlign: 'center',
        maxWidth: '400px',
        padding: '0 20px',
        fontWeight: 500
      }}>
        {status}
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.9)',
          color: '#0f0',
          padding: '15px',
          borderRadius: '8px',
          fontSize: '11px',
          fontFamily: 'Courier New, monospace',
          maxWidth: '400px',
          border: '2px solid #0ff'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#0ff', fontSize: '13px' }}>
            🐛 DEBUG AUTOLOGIN
          </div>
          <div style={{ marginBottom: '3px' }}>
            <strong style={{ color: '#ff0' }}>Token URL:</strong> {token?.substring(0, 20) || 'NONE'}...
          </div>
          <div style={{ marginBottom: '3px' }}>
            <strong style={{ color: '#ff0' }}>Token Guardado:</strong> {sessionStorage.getItem('last_autologin_token')?.substring(0, 20) || 'NONE'}...
          </div>
          <div style={{ marginBottom: '3px' }}>
            <strong style={{ color: '#ff0' }}>¿Son iguales?:</strong> {token === sessionStorage.getItem('last_autologin_token') ? '✅ SÍ' : '❌ NO'}
          </div>
          <div style={{ marginBottom: '3px' }}>
            <strong style={{ color: '#ff0' }}>Processing:</strong> {processing ? '🔴 SÍ' : '🟢 NO'}
          </div>
          <div style={{ marginBottom: '3px' }}>
            <strong style={{ color: '#ff0' }}>Email guardado:</strong> {authSessionService.getCurrentEmail() || 'NONE'}
          </div>
          <div style={{ marginTop: '8px', fontSize: '9px', color: '#888', borderTop: '1px solid #333', paddingTop: '5px' }}>
            💡 Si cambias el token en la URL, la página se recargará automáticamente
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}