'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Calendar, Sparkles, Users, TrendingUp } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await login({ email, password });
    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error || 'Error en el inicio de sesión');
    }
  };

  const demoAccounts = [
    { role: 'Propietario', email: 'owner@beauty-salon-demo.com', password: 'password' },
    { role: 'Gerente', email: 'manager@beauty-salon-demo.com', password: 'password' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Lado Izquierdo - Sección Hero */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AgendaChile
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Plataforma profesional de gestión de citas diseñada para empresas modernas.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 hover-lift">
              <Calendar className="w-8 h-8 text-purple-600 mb-2" />
              <h3 className="font-semibold text-gray-800">Programación Inteligente</h3>
              <p className="text-sm text-gray-600">Reserva inteligente de citas con optimización de disponibilidad</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 hover-lift">
              <Users className="w-8 h-8 text-blue-600 mb-2" />
              <h3 className="font-semibold text-gray-800">Gestión de Clientes</h3>
              <p className="text-sm text-gray-600">Perfiles completos de clientes y seguimiento de historial</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 hover-lift">
              <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
              <h3 className="font-semibold text-gray-800">Analíticas</h3>
              <p className="text-sm text-gray-600">Reportes detallados e insights de negocio</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 hover-lift">
              <Sparkles className="w-8 h-8 text-pink-600 mb-2" />
              <h3 className="font-semibold text-gray-800">Experiencia Premium</h3>
              <p className="text-sm text-gray-600">Interfaz elegante diseñada para la eficiencia</p>
            </div>
          </div>
        </div>

        {/* Lado Derecho - Formulario de Login */}
        <div className="w-full max-w-md mx-auto space-y-6">
          <Card className="hover-lift bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-2xl font-bold">Bienvenido</CardTitle>
              <CardDescription>Inicia sesión en tu cuenta de AgendaChile</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Ingresa tu correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/50"
                  />
                </div>
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Cuentas Demo */}
          
        </div>
      </div>
    </div>
  );
}