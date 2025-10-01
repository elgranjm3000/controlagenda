'use client';

import { Sidebar } from './sidebar';
import { Header } from './header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar horizontal en la parte superior */}
      <div className="sticky top-0 z-50">
        <Sidebar />
      </div>

      {/* Contenido principal */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}