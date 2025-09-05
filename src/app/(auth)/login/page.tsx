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
      setError(result.error || 'Login failed');
    }
  };

  const demoAccounts = [
    { role: 'Owner', email: 'owner@beauty-salon-demo.com', password: 'password' },
    { role: 'Manager', email: 'manager@beauty-salon-demo.com', password: 'password' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Hero Section */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AgendaChile
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Professional appointment management platform designed for modern businesses.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 hover-lift">
              <Calendar className="w-8 h-8 text-purple-600 mb-2" />
              <h3 className="font-semibold text-gray-800">Smart Scheduling</h3>
              <p className="text-sm text-gray-600">Intelligent appointment booking with availability optimization</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 hover-lift">
              <Users className="w-8 h-8 text-blue-600 mb-2" />
              <h3 className="font-semibold text-gray-800">Client Management</h3>
              <p className="text-sm text-gray-600">Comprehensive client profiles and history tracking</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 hover-lift">
              <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
              <h3 className="font-semibold text-gray-800">Analytics</h3>
              <p className="text-sm text-gray-600">Detailed reports and business insights</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 hover-lift">
              <Sparkles className="w-8 h-8 text-pink-600 mb-2" />
              <h3 className="font-semibold text-gray-800">Premium Experience</h3>
              <p className="text-sm text-gray-600">Elegant interface designed for efficiency</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto space-y-6">
          <Card className="hover-lift bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription>Sign in to your AgendaPro account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
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
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Demo Accounts */}
          <Card className="bg-gray-50/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="text-lg">Demo Accounts</CardTitle>
              <CardDescription>Try AgendaPro with these demo credentials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {demoAccounts.map((account) => (
                <div 
                  key={account.email}
                  className="flex items-center justify-between p-3 bg-white/60 rounded-lg cursor-pointer hover:bg-white/80 transition-colors"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                  }}
                >
                  <div>
                    <div className="font-medium">{account.role}</div>
                    <div className="text-sm text-gray-600">{account.email}</div>
                  </div>
                  <Button variant="ghost" size="sm">Use</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}