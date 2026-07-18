import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { APP_CONFIG, ROUTES } from '@/config/app';

interface HeaderProps {
  onMenuToggle: () => void;
  title?: string;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
}

function NotificationBell({ count = 0 }: { count?: number }) {
  return (
    <button
      className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
      aria-label={count > 0 ? `${count} unread notifications` : 'Notifications'}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path strokeLinecap="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/>
      </svg>
      {count > 0 && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" aria-hidden="true" />
      )}
    </button>
  );
}

function UserMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="User menu"
      >
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white">
          S
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 animate-scale-in origin-top-right"
        >
          <div className="px-3 py-2 border-b border-slate-100 mb-1">
            <p className="text-sm font-semibold text-slate-900">Student Name</p>
            <p className="text-xs text-slate-500">student@example.com</p>
          </div>
          <Link
            to={ROUTES.profile}
            role="menuitem"
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            onClick={() => setOpen(false)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
              <path strokeLinecap="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
            </svg>
            My Profile
          </Link>
          <div className="border-t border-slate-100 mt-1 pt-1">
            <button
              role="menuitem"
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              onClick={() => setOpen(false)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                <path strokeLinecap="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/>
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Header({ onMenuToggle, title, showSearch = false, onSearch }: HeaderProps) {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchValue);
  };

  return (
    <header
      className="sticky top-0 z-20 h-[60px] bg-white/95 backdrop-blur-sm border-b border-slate-200 flex items-center gap-3 px-4"
      role="banner"
    >
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors lg:hidden"
        aria-label="Open navigation menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Page title (mobile) */}
      {title && (
        <h1 className="text-base font-semibold text-slate-900 lg:hidden truncate">{title}</h1>
      )}

      {/* Search bar */}
      {showSearch && (
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm" role="search">
          <label htmlFor="global-search" className="sr-only">Search</label>
          <div className="relative w-full">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
            <input
              id="global-search"
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search subjects, questions, resources…"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </form>
      )}

      {/* Spacer */}
      <div className="flex-1" aria-hidden="true" />

      {/* Right actions */}
      <div className="flex items-center gap-1">
        <NotificationBell count={0} />
        <UserMenu />
      </div>
    </header>
  );
}
