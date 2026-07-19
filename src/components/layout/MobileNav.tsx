import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/config/app';
import { useLanguage } from '@/contexts/LanguageContext';

const mobileItems = [
  {
    label: 'Dashboard', labelAr: 'الرئيسية',
    href: ROUTES.studentDashboard,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    label: 'Subjects', labelAr: 'المواد',
    href: ROUTES.subjects,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path strokeLinecap="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
      </svg>
    ),
  },
  {
    label: 'Questions', labelAr: 'الأسئلة',
    href: ROUTES.questionBank,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <path strokeLinecap="round" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
        <path strokeLinecap="round" d="M12 17h.01"/>
      </svg>
    ),
  },
  {
    label: 'Resources', labelAr: 'المصادر',
    href: ROUTES.resources,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path strokeLinecap="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/>
      </svg>
    ),
  },
  {
    label: 'More', labelAr: 'المزيد',
    href: ROUTES.profile,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path strokeLinecap="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
      </svg>
    ),
  },
];

export function MobileNav() {
  const { lang } = useLanguage();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-slate-200 flex lg:hidden safe-area-pb"
      aria-label={lang === 'ar' ? 'التنقل في التطبيق' : 'Mobile navigation'}
    >
      {mobileItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) =>
            cn(
              'flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 text-[11px] font-medium transition-colors min-h-[56px]',
              isActive ? 'text-blue-600' : 'text-slate-500',
            )
          }
          end={item.href === ROUTES.studentDashboard}
        >
          {({ isActive }) => (
            <>
              <span className={cn(isActive && 'text-blue-600')}>{item.icon}</span>
              <span>{lang === 'ar' ? item.labelAr : item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
