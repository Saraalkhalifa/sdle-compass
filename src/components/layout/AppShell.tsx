import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import type { UserRole } from '@/types';

interface AppShellProps {
  children: React.ReactNode;
  role?: UserRole;
  title?: string;
  showSearch?: boolean;
}

export function AppShell({ children, role = 'student', title, showSearch = false }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-dvh flex bg-slate-50" dir="ltr">
      {/* Sidebar — always rendered on desktop, togglable on mobile */}
      <Sidebar
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area — offset by sidebar width on desktop */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-[260px]">
        <Header
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
          title={title}
          showSearch={showSearch}
        />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>

      {/* Mobile bottom nav — students only */}
      {(role === 'student' || !role) && <MobileNav />}
    </div>
  );
}
