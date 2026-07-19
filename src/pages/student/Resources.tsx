import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { Skeleton } from '@/components/ui/Skeleton';
import { ROUTES } from '@/config/app';
import {
  useAllResources,
  getVideoEmbedUrl,
  type ResourceWithTopic,
  type ResourceType,
} from '@/hooks/useResources';

// ── Type metadata ─────────────────────────────────────────────────────────────

const TYPE_META: Record<ResourceType, {
  label: string; plural: string;
  iconBg: string; iconColor: string;
  badgeCls: string;
  icon: React.ReactNode;
}> = {
  pdf: {
    label: 'PDF', plural: 'PDFs',
    iconBg: 'bg-red-50', iconColor: 'text-red-500',
    badgeCls: 'bg-red-100 text-red-700',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7z"/><path d="M14 2v5h5"/>
        <path d="M10 11H8v4h2m0-4v4m4-4a2 2 0 110 4h-1"/>
      </svg>
    ),
  },
  video: {
    label: 'Video', plural: 'Videos',
    iconBg: 'bg-blue-50', iconColor: 'text-blue-500',
    badgeCls: 'bg-blue-100 text-blue-700',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="16" height="16" rx="2"/>
        <path d="M10 9l5 3-5 3V9z"/><path d="M22 8l-4 4 4 4V8z"/>
      </svg>
    ),
  },
  link: {
    label: 'Link', plural: 'Links',
    iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600',
    badgeCls: 'bg-emerald-100 text-emerald-700',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
      </svg>
    ),
  },
};

type TypeFilter = 'all' | ResourceType;

// ── Resource card ─────────────────────────────────────────────────────────────

function ResourceCard({ resource }: { resource: ResourceWithTopic }) {
  const meta = TYPE_META[resource.type as ResourceType] ?? TYPE_META.link;
  const topic = resource.topics;
  const subjectName = topic?.subjects?.name;
  const topicRoute = topic ? ROUTES.topic(topic.subject_id, topic.id) : null;

  // Build the primary action
  const isVideo = resource.type === 'video';
  const embedUrl = isVideo ? getVideoEmbedUrl(resource.url) : null;
  const actionLabel = resource.type === 'pdf' ? 'Open PDF' : resource.type === 'video' ? 'Watch' : 'Open Link';

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col hover:shadow-md hover:border-slate-300 transition-all group">
      {/* Video thumbnail strip */}
      {isVideo && embedUrl && (
        <div className="relative bg-slate-900 h-36 overflow-hidden">
          <iframe
            src={embedUrl}
            className="w-full h-full pointer-events-none"
            title={resource.title}
            tabIndex={-1}
            aria-hidden="true"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
            <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#3b82f6" stroke="none">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Card body */}
      <div className="flex-1 p-4">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${meta.iconBg} ${meta.iconColor}`}>
            {meta.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug">
              {resource.title}
            </p>
            {resource.description && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {resource.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Card footer */}
      <div className="px-4 pb-4 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${meta.badgeCls}`}>
            {meta.label}
          </span>
          {topic && (
            <Link
              to={topicRoute!}
              className="text-xs text-slate-400 hover:text-blue-600 hover:underline truncate transition-colors"
              onClick={e => e.stopPropagation()}
            >
              {subjectName ? `${subjectName} › ` : ''}{topic.name}
            </Link>
          )}
        </div>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
          onClick={e => e.stopPropagation()}
        >
          {actionLabel}
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6m4-3h6v6m-11 5L21 3"/>
          </svg>
        </a>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function Resources() {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [subjectId, setSubjectId]   = useState('');
  const [search, setSearch]         = useState('');

  const { data: resources, isLoading } = useAllResources();

  // Derive subjects from resources
  const subjects = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of resources ?? []) {
      const s = r.topics?.subjects;
      if (s) map.set(s.id, s.name);
    }
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [resources]);

  // Filtered list
  const filtered = useMemo(() => {
    let list = resources ?? [];
    if (typeFilter !== 'all') list = list.filter(r => r.type === typeFilter);
    if (subjectId) list = list.filter(r => r.topics?.subjects?.id === subjectId);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.title.toLowerCase().includes(q) ||
        (r.description ?? '').toLowerCase().includes(q) ||
        (r.topics?.name ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [resources, typeFilter, subjectId, search]);

  // Counts per type
  const total = resources?.length ?? 0;
  const counts: Record<TypeFilter, number> = {
    all:   total,
    pdf:   resources?.filter(r => r.type === 'pdf').length ?? 0,
    video: resources?.filter(r => r.type === 'video').length ?? 0,
    link:  resources?.filter(r => r.type === 'link').length ?? 0,
  };

  const TYPE_TABS: { value: TypeFilter; label: string }[] = [
    { value: 'all',   label: 'All' },
    { value: 'pdf',   label: 'PDFs' },
    { value: 'video', label: 'Videos' },
    { value: 'link',  label: 'Links' },
  ];

  return (
    <AppShell role="student" title="Resources">
      <PageContainer
        title="Resource Library"
        description="PDFs, videos, and reference links from the SDLE curriculum"
        maxWidth="2xl"
      >
        {/* Search + subject filter */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative">
            <svg width="14" height="14" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search resources…"
              className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
            />
          </div>
          <select
            value={subjectId}
            onChange={e => setSubjectId(e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          >
            <option value="">All subjects</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {(search || subjectId || typeFilter !== 'all') && (
            <button
              onClick={() => { setSearch(''); setSubjectId(''); setTypeFilter('all'); }}
              className="text-xs text-slate-400 hover:text-slate-600 underline"
            >
              Reset
            </button>
          )}
        </div>

        {/* Type tabs */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 mb-5 w-fit">
          {TYPE_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setTypeFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                typeFilter === tab.value
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
              {counts[tab.value] > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  typeFilter === tab.value ? 'bg-slate-100 text-slate-600' : 'bg-slate-200 text-slate-500'
                }`}>
                  {counts[tab.value]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!isLoading && (
          <p className="text-xs text-slate-400 mb-3">
            {filtered.length === total
              ? `${total} resource${total !== 1 ? 's' : ''}`
              : `${filtered.length} of ${total} resources`}
          </p>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-xl p-14 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 rounded-2xl flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7z"/><path d="M14 2v5h5"/>
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-700 mb-1">No resources found</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              {total === 0
                ? 'Resources will appear here once added to topics by your instructors.'
                : 'Try adjusting your filters or search terms.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(r => <ResourceCard key={r.id} resource={r} />)}
          </div>
        )}
      </PageContainer>
    </AppShell>
  );
}
