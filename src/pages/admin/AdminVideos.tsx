import React, { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAllResources, getVideoEmbedUrl, type ResourceWithTopic } from '@/hooks/useResources';
import { useSubjectsList } from '@/hooks/useSubjects';

// ── Video card ─────────────────────────────────────────────────────────────────

function VideoCard({ video }: { video: ResourceWithTopic }) {
  const embedUrl = getVideoEmbedUrl(video.url);
  const subject  = video.topics?.subjects?.name;
  const topic    = video.topics?.name;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
      {/* Embed / thumbnail */}
      <div className="aspect-video bg-slate-100 relative">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={video.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
            <span className="text-xs">Custom video host</span>
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline"
            >
              Open link
            </a>
          </div>
        )}

        {/* Duration badge */}
        {video.duration_mins && (
          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
            {video.duration_mins} min
          </span>
        )}

        {/* Hidden badge */}
        {!video.is_active && (
          <span className="absolute top-2 left-2 bg-slate-700/80 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
            Hidden
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">{video.title}</p>
        {subject && topic && (
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <span>{subject}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            <span>{topic}</span>
          </p>
        )}
        {video.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">{video.description}</p>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function AdminVideos() {
  const [search, setSearch]           = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [showHidden, setShowHidden]   = useState(false);

  const { data: resources = [], isLoading } = useAllResources();
  const { data: subjects = [] } = useSubjectsList();

  const videos = useMemo(() => resources.filter(r => r.type === 'video'), [resources]);

  const filtered = useMemo(() => {
    let list = videos;
    if (!showHidden) list = list.filter(v => v.is_active);
    if (subjectFilter) list = list.filter(v => v.topics?.subjects?.id === subjectFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(v =>
        v.title.toLowerCase().includes(q) ||
        v.title_ar?.toLowerCase().includes(q) ||
        v.topics?.name.toLowerCase().includes(q),
      );
    }
    return list;
  }, [videos, showHidden, subjectFilter, search]);

  const totalMins = filtered.reduce((s, v) => s + (v.duration_mins ?? 0), 0);

  return (
    <AppShell role="admin" title="Videos">
      <PageContainer
        title="Video Library"
        description="All video resources across the platform"
        maxWidth="2xl"
      >
        {/* Stats row */}
        <div className="flex flex-wrap gap-4 mb-5">
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{videos.length}</p>
              <p className="text-xs text-slate-500">Total videos</p>
            </div>
          </div>
          {totalMins > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">
                  {totalMins >= 60 ? `${Math.floor(totalMins / 60)}h ${totalMins % 60}m` : `${totalMins}m`}
                </p>
                <p className="text-xs text-slate-500">Total content (shown)</p>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <select
            value={subjectFilter}
            onChange={e => setSubjectFilter(e.target.value)}
            className="px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg bg-white"
          >
            <option value="">All subjects</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <div className="relative">
            <svg width="12" height="12" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search videos…"
              className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none ml-auto">
            <input
              type="checkbox"
              checked={showHidden}
              onChange={e => setShowHidden(e.target.checked)}
              className="w-4 h-4 rounded accent-blue-600"
            />
            <span className="text-xs font-medium text-slate-600">Show hidden</span>
          </label>

          <p className="text-xs text-slate-400">{filtered.length} video{filtered.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <Skeleton className="aspect-video" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-xl py-20 text-center">
            <div className="w-14 h-14 mx-auto mb-4 bg-violet-50 rounded-2xl flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
            </div>
            <p className="text-base font-semibold text-slate-800">No videos found</p>
            <p className="text-sm text-slate-400 mt-1">
              {videos.length === 0
                ? 'Add video resources from the Resource Library.'
                : 'Try adjusting your filters.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(v => <VideoCard key={v.id} video={v} />)}
          </div>
        )}
      </PageContainer>
    </AppShell>
  );
}
