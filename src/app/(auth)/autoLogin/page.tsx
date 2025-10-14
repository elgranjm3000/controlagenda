'use client'
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { authSessionService } from '@/services/auth-session.service';

export default function AutoLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, logout } = useAuth();
  const [status, setStatus] = useState('Procesando acceso...');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    
    console.log('🔍 AutoLogin montado/actualizado');
    console.log('   Token:', token);
    console.log('   Processing:', processing);

    if (!token) {
      setStatus('Token no encontrado, redirigiendo...');
      setTimeout(() => router.push('/login'), 2000);
      return;
    }

    // Si ya estamos procesando, no hacer nada
    if (processing) {
      console.log('⏳ Ya estamos procesando, esperando...');
      return;
    }

    // Verificar si necesitamos procesar este token
    const currentEmail = authSessionService.getCurrentEmail();
    const lastToken = sessionStorage.getItem('last_autologin_token');

    console.log('   Email actual:', currentEmail);
    console.log('   Último token:', lastToken);

    // Si es el mismo token que ya procesamos, redirigir
    if (token === lastToken && currentEmail) {
      console.log('✅ Token ya procesado y sesión activa, redirigiendo...');
      router.push('/dashboard');
      return;
    }

    // Nuevo token, procesar
    console.log('🆕 Token nuevo detectado, procesando...');
    handleAutoLogin(token);
    
  }, [searchParams.get('token')]); // Reaccionar a cambios en el token
  
  const handleAutoLogin = async (tempToken: string) => {
    // Prevenir ejecuciones múltiples
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
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      const newEmail = validation.email;
      console.log('✅ Token válido para:', newEmail);

      // PASO 2: Verificar sesión actual
      console.log('\n📧 Paso 2: Verificando sesión actual...');
      const currentEmail = authSessionService.getCurrentEmail();
      console.log('   Email actual:', currentEmail || 'NINGUNO');
      console.log('   Email nuevo:', newEmail);
      
      if (currentEmail) {
        if (currentEmail !== newEmail) {
          // Usuario diferente
          setStatus(`Cerrando sesión de ${currentEmail}...`);
          console.log('⚠️ Usuario DIFERENTE detectado, limpiando...');
          
          // Logout completo
          try {
            await logout();
            console.log('   Logout completado');
          } catch (error) {
            console.warn('   Error en logout API:', error);
          }
          
          // Limpiar localStorage
          authSessionService.clearSession();
          
          // Esperar
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Verificar limpieza
          const afterClean = authSessionService.getCurrentEmail();
          if (afterClean) {
            console.error('❌ ERROR: No se limpió, forzando...');
            authSessionService.forceCleanAll();
            await new Promise(resolve => setTimeout(resolve, 300));
          } else {
            console.log('✅ Sesión anterior limpiada');
          }
          
        } else {
          // Mismo usuario
          console.log('ℹ️ Mismo usuario, refrescando sesión');
          authSessionService.clearSession();
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } else {
        console.log('ℹ️ No hay sesión previa');
      }
      
      // PASO 3: Login limpio
      console.log('\n🔐 Paso 3: Iniciando login...');
      setStatus('Iniciando sesión...');
      
      const loginResult = await login({
        email: validation.email,
        password: validation.temp_password
      });
      
      console.log('   Login result:', {
        success: loginResult.success,
        hasToken: !!loginResult.token,
        hasUser: !!loginResult.user
      });
      
      if (!loginResult.success) {
        console.error('❌ Error en login:', loginResult.error);
        setStatus('Error: ' + (loginResult.error || 'Error al iniciar sesión'));
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      console.log('✅ Login exitoso');
      
      // PASO 4: Guardar sesión
      console.log('\n💾 Paso 4: Guardando sesión...');
      if (loginResult.token && loginResult.user) {
        authSessionService.saveSession({
          token: loginResult.token,
          email: validation.email,
          user: loginResult.user
        });
      }
      
      // Guardar token para evitar reprocesar
      sessionStorage.setItem('last_autologin_token', tempToken);
      
      // Verificar
      const savedEmail = authSessionService.getCurrentEmail();
      const savedToken = authSessionService.getToken();
      console.log('   Email guardado:', savedEmail);
      console.log('   Token presente:', !!savedToken);
      
      if (savedEmail !== validation.email) {
        console.error('❌ ERROR: Email no coincide después de guardar');
      }
      
      setStatus('¡Acceso concedido! Redirigiendo...');
      
      console.log('\n=== FIN AUTOLOGIN ===');
      authSessionService.debugSession();
      console.log('====================\n');
      
      // Redirigir
      setTimeout(() => {
        console.log('🚀 Redirigiendo a dashboard...');
        
        // IMPORTANTE: Usar window.location para forzar recarga completa
        // Esto asegura que todos los hooks se reinicialicen
        window.location.href = '/dashboard';
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error en auto login:', error);
      setStatus('Error de conexión. Redirigiendo...');
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
      {/* Loader animado */}
      <div style={{
        border: '4px solid #e0e0e0',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        animation: 'spin 1s linear infinite'
      }} />
      
      {/* Mensaje de estado */}
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
      
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.85)',
          color: '#0f0',
          padding: '12px',
          borderRadius: '6px',
          fontSize: '11px',
          fontFamily: 'Courier New, monospace',
          maxWidth: '300px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#0ff' }}>
            🐛 DEBUG
          </div>
          <div>Token: {searchParams.get('token')?.substring(0, 15)}...</div>
          <div>Processing: {processing ? '✅' : '❌'}</div>
          <div>Email: {authSessionService.getCurrentEmail() || 'NONE'}</div>
          <div style={{ marginTop: '5px', fontSize: '9px', color: '#888' }}>
            Abre la consola para más detalles
          </div>
        </div>
      )}
      
      {/* Animación CSS */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}