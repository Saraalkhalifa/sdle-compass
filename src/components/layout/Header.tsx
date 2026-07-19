import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { APP_CONFIG, ROUTES } from '@/config/app';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  useNotifications,
  useUnreadCount,
  useMarkRead,
  useMarkAllRead,
  type NotificationRow,
  type NotificationType,
} from '@/hooks/useNotifications';

interface HeaderProps {
  onMenuToggle: () => void;
  title?: string;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  onSearchOpen?: () => void;
}

// ── Notification helpers ──────────────────────────────────────────────────────

function relativeTime(dateStr: string, lang: 'en' | 'ar'): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return lang === 'ar' ? 'الآن' : 'just now';
  if (mins < 60) return lang === 'ar' ? `منذ ${mins} د` : `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return lang === 'ar' ? `منذ ${hours} س` : `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7)   return lang === 'ar' ? `منذ ${days} أيام` : `${days}d`;
  return new Date(dateStr).toLocaleDateString(
    lang === 'ar' ? 'ar-SA' : 'en-US',
    { month: 'short', day: 'numeric' },
  );
}

const TYPE_ICON: Record<NotificationType, React.ReactNode> = {
  exam_result: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12l2 2 4-4"/><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/>
    </svg>
  ),
  study_reminder: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  ),
  ai_response: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
    </svg>
  ),
  system: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
    </svg>
  ),
  achievement: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21h8m-4-4v4M12 3l2.09 6.26L20 10.27l-5 4.87 1.18 6.88L12 18.77l-4.18 2.25L9 14.14 4 9.27l5.91-1.01L12 3z"/>
    </svg>
  ),
};

const TYPE_COLOR: Record<NotificationType, string> = {
  exam_result:    'bg-green-100 text-green-600',
  study_reminder: 'bg-blue-100 text-blue-600',
  ai_response:    'bg-violet-100 text-violet-600',
  system:         'bg-slate-100 text-slate-500',
  achievement:    'bg-amber-100 text-amber-600',
};

function NotificationItem({ n, onClose }: { n: NotificationRow; onClose: () => void }) {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const markRead = useMarkRead();

  const title = (lang === 'ar' && n.title_ar) ? n.title_ar : n.title;
  const body  = (lang === 'ar' && n.body_ar)  ? n.body_ar  : n.body;
  const type  = n.type as NotificationType;

  const handleClick = () => {
    if (!n.is_read) markRead.mutate(n.id);
    onClose();
    if (n.href) navigate(n.href);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full text-left flex gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0',
        !n.is_read && 'bg-blue-50/40',
      )}
    >
      <div className={cn('w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5', TYPE_COLOR[type])}>
        {TYPE_ICON[type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm text-slate-800 leading-snug', !n.is_read && 'font-semibold')}>{title}</p>
        {body && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{body}</p>}
        <p className="text-[11px] text-slate-400 mt-1">{relativeTime(n.created_at, lang)}</p>
      </div>
      {!n.is_read && (
        <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" aria-hidden="true" />
      )}
    </button>
  );
}

function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { lang } = useLanguage();
  const { data: notifications } = useNotifications();
  const unread = useUnreadCount();
  const markAll = useMarkAllRead();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const ariaLabel = unread > 0
    ? (lang === 'ar' ? `${unread} إشعارات غير مقروءة` : `${unread} unread notifications`)
    : (lang === 'ar' ? 'الإشعارات' : 'Notifications');

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        aria-label={ariaLabel}
        aria-expanded={open}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path strokeLinecap="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/>
        </svg>
        {unread > 0 && (
          <span
            className="absolute top-1 ltr:right-1 rtl:left-1 min-w-[16px] h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white px-0.5"
            aria-hidden="true"
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute ltr:right-0 rtl:left-0 top-full mt-2 w-[340px] bg-white border border-slate-200 rounded-xl shadow-xl z-50 animate-scale-in origin-top-right overflow-hidden"
          role="dialog"
          aria-label={lang === 'ar' ? 'الإشعارات' : 'Notifications'}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900">
              {lang === 'ar' ? 'الإشعارات' : 'Notifications'}
              {unread > 0 && (
                <span className="ltr:ml-2 rtl:mr-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-semibold">
                  {unread}
                </span>
              )}
            </p>
            {unread > 0 && (
              <button
                onClick={() => markAll.mutate()}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                {lang === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all read'}
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto">
            {!notifications || notifications.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-10 h-10 mx-auto mb-3 bg-slate-100 rounded-2xl flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.75">
                    <path strokeLinecap="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/>
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-700">
                  {lang === 'ar' ? 'لا توجد إشعارات' : 'No notifications yet'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === 'ar' ? 'ستظهر الإشعارات هنا عند ورودها' : "You'll see updates here as they arrive"}
                </p>
              </div>
            ) : (
              notifications.map(n => (
                <NotificationItem key={n.id} n={n} onClose={() => setOpen(false)} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function UserMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { profile, signOut } = useAuth();
  const { lang } = useLanguage();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initial = profile?.full_name?.charAt(0).toUpperCase() ?? 'S';

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={lang === 'ar' ? 'قائمة المستخدم' : 'User menu'}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
          style={{ backgroundColor: profile?.avatar_color ?? '#2563eb' }}
        >
          {initial}
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute ltr:right-0 rtl:left-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 animate-scale-in origin-top-right"
        >
          <div className="px-3 py-2 border-b border-slate-100 mb-1">
            <p className="text-sm font-semibold text-slate-900">{profile?.full_name ?? (lang === 'ar' ? 'الطالب' : 'Student')}</p>
            <p className="text-xs text-slate-500 truncate">{profile?.email ?? ''}</p>
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
            {lang === 'ar' ? 'ملفي الشخصي' : 'My Profile'}
          </Link>
          <div className="border-t border-slate-100 mt-1 pt-1">
            <button
              role="menuitem"
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              onClick={() => { setOpen(false); signOut(); }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                <path strokeLinecap="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/>
              </svg>
              {lang === 'ar' ? 'تسجيل الخروج' : 'Sign out'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  const { updateProfile } = useAuth();

  const toggle = () => {
    const next = lang === 'en' ? 'ar' : 'en';
    setLang(next);
    updateProfile({ preferred_language: next }).catch(() => {});
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-0.5 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors text-[11px] font-semibold tracking-wide"
      aria-label={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
      title={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      <span className={cn('px-1 py-0.5 rounded transition-colors', lang === 'en' ? 'text-blue-600 bg-blue-50' : 'text-slate-400')}>EN</span>
      <span className="text-slate-300">|</span>
      <span className={cn('px-1 py-0.5 rounded transition-colors', lang === 'ar' ? 'text-blue-600 bg-blue-50' : 'text-slate-400')}>ع</span>
    </button>
  );
}

export function Header({ onMenuToggle, title, onSearchOpen }: HeaderProps) {
  const { lang } = useLanguage();
  // Detect OS for keyboard shortcut hint
  const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform);

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

      {/* Search trigger button */}
      <button
        onClick={onSearchOpen}
        className="hidden md:flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-400 min-w-[220px] hover:border-slate-300 hover:bg-white transition-colors"
        aria-label={lang === 'ar' ? 'فتح البحث' : 'Open search'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <span className="flex-1 ltr:text-left rtl:text-right">
          {lang === 'ar' ? 'بحث…' : 'Search…'}
        </span>
        <kbd className="text-xs bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-400 font-sans">
          {isMac ? '⌘K' : 'Ctrl K'}
        </kbd>
      </button>

      {/* Spacer */}
      <div className="flex-1" aria-hidden="true" />

      {/* Right actions */}
      <div className="flex items-center gap-1">
        <LanguageToggle />
        <NotificationDropdown />
        <UserMenu />
      </div>
    </header>
  );
}
