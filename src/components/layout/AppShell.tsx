import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { CommandPalette } from '@/components/search/CommandPalette';
import type { UserRole } from '@/types';

interface AppShellProps {
  children: React.ReactNode;
  role?: UserRole;
  title?: string;
  showSearch?: boolean;
}

export function AppShell({ children, role = 'student', title, showSearch = false }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);

  // Cmd+K / Ctrl+K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="min-h-dvh flex bg-slate-50">
      {/* Sidebar — always rendered on desktop, togglable on mobile */}
      <Sidebar
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area — offset by sidebar width on desktop (direction-aware) */}
      <div className="flex-1 flex flex-col min-w-0 ltr:lg:ml-[260px] rtl:lg:mr-[260px]">
        <Header
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
          title={title}
          showSearch={showSearch}
          onSearchOpen={() => setSearchOpen(true)}
        />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>

      {/* Mobile bottom nav — students only */}
      {(role === 'student' || !role) && <MobileNav />}

      {/* Global command palette */}
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
