import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { APP_CONFIG, ROUTES, FEATURES } from '@/config/app';
import type { UserRole } from '@/types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  comingSoon?: boolean;
  section?: string;
}

// ── Icons (inline SVG to avoid large icon bundle in Phase 1) ──────────────────
const icons = {
  dashboard:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  studyPlan:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/><path strokeLinecap="round" d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>,
  subjects:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path strokeLinecap="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>,
  questions:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><path strokeLinecap="round" d="M12 17h.01"/></svg>,
  mockExams:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path strokeLinecap="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
  aiTutor:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path strokeLinecap="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/><path strokeLinecap="round" d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"/></svg>,
  resources:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path strokeLinecap="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>,
  performance: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path strokeLinecap="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>,
  bookmarks:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path strokeLinecap="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"/></svg>,
  profile:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path strokeLinecap="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>,
  users:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path strokeLinecap="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>,
  analytics:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path strokeLinecap="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"/></svg>,
  settings:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path strokeLinecap="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/><circle cx="12" cy="12" r="2.25"/></svg>,
  upload:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path strokeLinecap="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/></svg>,
  video:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path strokeLinecap="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"/></svg>,
  notes:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path strokeLinecap="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>,
  alert:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path strokeLinecap="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>,
  audit:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path strokeLinecap="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>,
};

function getStudentNavItems(): NavItem[] {
  return [
    { label: 'Dashboard',     href: ROUTES.studentDashboard, icon: icons.dashboard },
    { label: 'Study Plan',    href: ROUTES.studyPlan,        icon: icons.studyPlan,   comingSoon: !FEATURES.studyPlan },
    { label: 'Subjects',      href: ROUTES.subjects,         icon: icons.subjects },
    { label: 'Question Bank', href: ROUTES.questionBank,     icon: icons.questions },
    { label: 'Mock Exams',    href: ROUTES.mockExams,        icon: icons.mockExams,   comingSoon: !FEATURES.mockExams },
    { label: 'AI Tutor',      href: ROUTES.aiTutor,          icon: icons.aiTutor,     comingSoon: !FEATURES.aiTutor },
    { label: 'Resources',     href: ROUTES.resources,        icon: icons.resources },
    { label: 'Performance',   href: ROUTES.performance,      icon: icons.performance, comingSoon: !FEATURES.analytics },
    { label: 'Bookmarks',     href: ROUTES.bookmarks,        icon: icons.bookmarks },
    { label: 'Profile',       href: ROUTES.profile,          icon: icons.profile },
  ];
}

function getAdminNavItems(): { section: string; items: NavItem[] }[] {
  return [
    {
      section: 'Overview',
      items: [
        { label: 'Admin Overview',   href: ROUTES.adminDashboard,        icon: icons.dashboard },
      ],
    },
    {
      section: 'Content',
      items: [
        { label: 'Subjects & Curriculum', href: ROUTES.adminSubjects,         icon: icons.subjects },
        { label: 'Resources',             href: ROUTES.adminResources,        icon: icons.resources },
        { label: 'Videos & Transcripts',  href: ROUTES.adminVideos,           icon: icons.video },
        { label: 'Notes',                 href: ROUTES.adminNotes,            icon: icons.notes },
        { label: 'Question Bank',         href: ROUTES.adminQuestions,        icon: icons.questions },
        { label: 'Question Imports',      href: ROUTES.adminQuestionImports,  icon: icons.upload },
        { label: 'AI Review Queue',       href: ROUTES.adminAIQueue,          icon: icons.aiTutor },
        { label: 'Mock Exams',            href: ROUTES.adminMockExams,        icon: icons.mockExams },
      ],
    },
    {
      section: 'Management',
      items: [
        { label: 'Student Reports', href: ROUTES.adminStudents,     icon: icons.users },
        { label: 'Error Reports',   href: ROUTES.adminErrorReports, icon: icons.alert },
        { label: 'Users & Roles',   href: ROUTES.adminUsers,        icon: icons.users },
      ],
    },
    {
      section: 'System',
      items: [
        { label: 'Analytics',   href: ROUTES.adminAnalytics,  icon: icons.analytics },
        { label: 'Audit Logs',  href: ROUTES.adminAuditLogs,  icon: icons.audit },
        { label: 'Settings',    href: ROUTES.adminSettings,   icon: icons.settings },
      ],
    },
  ];
}

// ── Sidebar component ─────────────────────────────────────────────────────────

interface SidebarProps {
  role: UserRole;
  isOpen?: boolean;
  onClose?: () => void;
}

function NavItemLink({ item }: { item: NavItem }) {
  if (item.comingSoon) {
    return (
      <div className="nav-item opacity-50 cursor-not-allowed select-none" aria-disabled="true" title="Coming soon">
        <span className="icon">{item.icon}</span>
        <span className="flex-1 min-w-0">{item.label}</span>
        <span className="text-xs bg-slate-700/50 text-slate-400 px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0">
          Soon
        </span>
      </div>
    );
  }

  return (
    <NavLink
      to={item.href}
      className={({ isActive }) => cn('nav-item', isActive && 'active')}
      end={item.href === ROUTES.studentDashboard || item.href === ROUTES.adminDashboard}
    >
      <span className="icon">{item.icon}</span>
      <span className="flex-1 min-w-0 truncate">{item.label}</span>
      {item.badge !== undefined && (
        <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full min-w-5 text-center leading-none flex-shrink-0">
          {item.badge}
        </span>
      )}
    </NavLink>
  );
}

export function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const isAdmin = role === 'admin' || role === 'main_admin' || role === 'editor' || role === 'reviewer';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen !== undefined && isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-dvh flex flex-col',
          'bg-slate-800 text-slate-100',
          'transition-transform duration-300',
          'w-[260px]',
          // Mobile: slide in/out. Desktop: always visible.
          isOpen !== undefined
            ? isOpen ? 'translate-x-0' : '-translate-x-full'
            : 'hidden lg:flex',
          'lg:translate-x-0',
        )}
        aria-label="Navigation"
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-slate-700/60">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">{APP_CONFIG.name}</p>
            <p className="text-xs text-slate-400 truncate">{APP_CONFIG.examAbbreviation} Preparation</p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2" aria-label="Main navigation">
          {isAdmin ? (
            getAdminNavItems().map((group) => (
              <div key={group.section} className="mb-3">
                <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  {group.section}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <NavItemLink key={item.href} item={item} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-0.5">
              {getStudentNavItems().map((item) => (
                <NavItemLink key={item.href} item={item} />
              ))}
            </div>
          )}
        </nav>

        {/* Bottom footer */}
        <div className="border-t border-slate-700/60 px-2 py-2">
          <NavLink to={ROUTES.profile} className={({ isActive }) => cn('nav-item', isActive && 'active')}>
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              S
            </div>
            <span className="flex-1 min-w-0 truncate text-slate-300">My Profile</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
}
