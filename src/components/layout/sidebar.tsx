'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import {
  Calendar,
  Users,
  Briefcase,
  CreditCard,
  BarChart3,
  Settings,
  Building2,
  UserCog,
  Home,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

const navigationItems = [
  { name: 'Panel Principal', href: '/dashboard', icon: Home, roles: ['owner', 'manager', 'staff', 'viewer'] },
  //{ name: 'Citas', href: '/appointments', icon: Calendar, roles: ['owner', 'manager', 'staff'] },
  //{ name: 'Clientes', href: '/clients', icon: Users, roles: ['owner', 'manager', 'staff'] },
  { name: 'Clientes', href: '/job-executives', icon: Users, roles: ['owner', 'manager', 'staff'] },
  //{ name: 'Servicios', href: '/services', icon: Briefcase, roles: ['owner', 'manager', 'staff'] },
  //{ name: 'Pagos', href: '/payments', icon: CreditCard, roles: ['owner', 'manager', 'staff'] },
  //{ name: 'Reportes', href: '/reports', icon: BarChart3, roles: ['owner', 'manager'] },
  //{ name: 'Usuarios', href: '/users', icon: UserCog, roles: ['owner', 'manager'] },
  //{ name: 'Empresa', href: '/company', icon: Building2, roles: ['owner', 'manager'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const filteredNavigation = navigationItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
          {/* Logo */}
          {/* <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AgendaChile
            </span>
          </div> */}

          {/* Navegación Desktop - Horizontal */}
          <nav className="hidden lg:flex items-center space-x-1">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon className={cn(
                    'mr-2 h-4 w-4',
                    isActive ? 'text-purple-600' : 'text-gray-500'
                  )} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Usuario Desktop */}
          <div className="hidden lg:flex items-center space-x-3">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role === 'owner' ? 'Propietario' : 
                     user?.role === 'manager' ? 'Gerente' :
                     user?.role === 'staff' ? 'Personal' : 'Visualizador'}
                  </p>
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 text-gray-500 transition-transform",
                  userMenuOpen && "transform rotate-180"
                )} />
              </button>

              {/* Dropdown Menu Usuario */}
              {userMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                    <div className="py-1">
                      {/*<Link
                        href="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Configuración
                      </Link>*/}
                      {/*<button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar Sesión
                      </button>*/}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Botón Menú Móvil */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Menú Móvil Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop oscuro */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={handleMobileMenuClose}
          />
          
          {/* Panel lateral móvil */}
          <div className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 lg:hidden shadow-xl">
            <div className="flex flex-col h-full">
              {/* Header del menú móvil */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                {/*<div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    AgendaChile
                  </span>
                </div>*/}
                <button
                  onClick={handleMobileMenuClose}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-700" />
                </button>
              </div>

              {/* Navegación móvil */}
              <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {filteredNavigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={handleMobileMenuClose}
                      className={cn(
                        'flex items-center px-4 py-3 text-base font-medium rounded-lg transition-all duration-200',
                        isActive
                          ? 'bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 border-l-4 border-purple-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <item.icon className={cn(
                        'mr-3 h-5 w-5',
                        isActive ? 'text-purple-600' : 'text-gray-500'
                      )} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              {/* Usuario y Cerrar Sesión móvil */}
              <div className="px-4 py-4 border-t border-gray-200">
                <div className="flex items-center space-x-3 mb-4 px-4 py-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {user?.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user?.role === 'owner' ? 'Propietario' : 
                       user?.role === 'manager' ? 'Gerente' :
                       user?.role === 'staff' ? 'Personal' : 'Visualizador'}
                    </p>
                  </div>
                </div>
                
                <Link
                  href="/settings"
                  onClick={handleMobileMenuClose}
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors mb-2"
                >
                  <Settings className="mr-3 h-4 w-4" />
                  Configuración
                </Link>

                <button
                  onClick={() => {
                    handleMobileMenuClose();
                    logout();
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}