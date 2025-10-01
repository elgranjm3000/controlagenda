'use client'
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function AutoLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [status, setStatus] = useState('Procesando acceso...');
  
  useEffect(() => {
    // Obtener el token de los search params (?token=...)
    const token = searchParams.get('token');
    
    if (token) {
      handleAutoLogin(token);
    } else {
      setStatus('Token no encontrado, redirigiendo...');
      setTimeout(() => router.push('/login'), 2000);
    }
  }, [searchParams]); // Cambiar dependencia
  
  const handleAutoLogin = async (tempToken: string) => {
    try {
      setStatus('Validando acceso...');
      

      const formData = new FormData();
      formData.append('token', tempToken);
    const response = await fetch('https://desarrollo.solventa.walla.tech/dashboard/validar_token_temporal', {
        method: 'POST',
        body: formData, // No necesitas headers, el navegador los pone automáticamente
    });
	console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', response.headers);
      
      const validation = await response.json();


		/*const validation = {
			  valid: true,
			  email: 'owner@beauty-salon-demo.com',
			  temp_password: 'password'
		};*/ 
      
      if (validation.valid) {
        setStatus('Iniciando sesión...');
        const loginResult = await login({
          email: validation.email,
          password: validation.temp_password
        });
        
        if (loginResult.success) {
          router.push('/dashboard');
        } else {
          setStatus('Error en el login: ' + loginResult.error);
          setTimeout(() => router.push('/login'), 2000);
        }
      } else {
        setStatus('Token inválido, redirigiendo...');
        setTimeout(() => router.push('/login'), 2000);
      }
    } catch (error) {
      console.error('Error en auto login:', error);
      setStatus('Error de conexión, redirigiendo...');
      setTimeout(() => router.push('/login'), 2000);
    }
  };
  
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <div>{status}</div>
    </div>
  );
}
