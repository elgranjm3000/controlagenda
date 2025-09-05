'use client';

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
} from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['owner', 'manager', 'staff', 'viewer'] },
  { name: 'Appointments', href: '/appointments', icon: Calendar, roles: ['owner', 'manager', 'staff'] },
  { name: 'Clients', href: '/clients', icon: Users, roles: ['owner', 'manager', 'staff'] },
  { name: 'Services', href: '/services', icon: Briefcase, roles: ['owner', 'manager', 'staff'] },
  { name: 'Payments', href: '/payments', icon: CreditCard, roles: ['owner', 'manager', 'staff'] },
  { name: 'Reports', href: '/reports', icon: BarChart3, roles: ['owner', 'manager'] },
  { name: 'Users', href: '/users', icon: UserCog, roles: ['owner', 'manager'] },
  { name: 'Company', href: '/company', icon: Building2, roles: ['owner', 'manager'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const filteredNavigation = navigationItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AgendaChile
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-gray-50',
                isActive
                  ? 'bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 border-r-2 border-purple-600'
                  : 'text-gray-700 hover:text-gray-900'
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

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
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
              {user?.role}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}