import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ROUTES } from '@/config/app';
import { useSubject, useTopicsBySubject, useTopicProgress } from '@/hooks/useSubjects';

const STATUS_CONFIG = {
  not_started: { label: 'Not started', color: 'text-slate-400', dot: 'bg-slate-300' },
  in_progress: { label: 'In progress', color: 'text-amber-600', dot: 'bg-amber-400' },
  completed:   { label: 'Completed',   color: 'text-green-600', dot: 'bg-green-500' },
};

export function SubjectDetail() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const id = subjectId ?? '';

  const { data: subject, isLoading: subjectLoading } = useSubject(id);
  const { data: topics, isLoading: topicsLoading } = useTopicsBySubject(id);
  const topicIds = (topics ?? []).map((t) => t.id);
  const { data: progressMap } = useTopicProgress(topicIds);

  const isLoading = subjectLoading || topicsLoading;

  const completedCount = topicIds.filter((id) => progressMap?.[id] === 'completed').length;
  const totalHours = (topics ?? []).reduce((s, t) => s + t.estimated_hours, 0);

  return (
    <AppShell role="student" title={subject?.name ?? 'Subject'}>
      <PageContainer
        maxWidth="xl"
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.studentDashboard },
          { label: 'Subjects', href: ROUTES.subjects },
          { label: subject?.name ?? '…' },
        ]}
      >
        {/* Subject header */}
        {subjectLoading ? (
          <Card className="mb-6">
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          </Card>
        ) : subject ? (
          <Card className="mb-6">
            <div className="flex items-start gap-4">
              <div
                className={`w-16 h-16 ${subject.color ?? 'bg-blue-500'} rounded-2xl flex items-center justify-center text-3xl flex-shrink-0`}
              >
                {subject.icon ?? '📚'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h1 className="text-xl font-bold text-slate-900">{subject.name}</h1>
                    <p className="text-sm text-slate-500 mt-0.5">{subject.name_ar}</p>
                  </div>
                  <Badge color="primary" size="sm">{subject.exam_weight}% of exam</Badge>
                </div>
                {subject.description && (
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{subject.description}</p>
                )}
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                  <span>{(topics ?? []).length} topics</span>
                  <span>{totalHours.toFixed(1)} estimated hours</span>
                  {topicIds.length > 0 && (
                    <span className="text-green-600 font-medium">
                      {completedCount}/{topicIds.length} completed
                    </span>
                  )}
                </div>
              </div>
            </div>
            {/* Overall progress bar */}
            {topicIds.length > 0 && (
              <div className="mt-4">
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className={`${subject.color ?? 'bg-blue-500'} h-2 rounded-full transition-all`}
                    style={{ width: `${Math.round((completedCount / topicIds.length) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {Math.round((completedCount / topicIds.length) * 100)}% complete
                </p>
              </div>
            )}
          </Card>
        ) : null}

        {/* Topics list */}
        <h2 className="text-base font-semibold text-slate-800 mb-3">Topics</h2>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (topics ?? []).length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="text-3xl mb-2">📝</p>
            <p className="font-medium text-slate-600">No topics yet</p>
            <p className="text-sm mt-1">Topics are being added to this subject.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(topics ?? []).map((topic, index) => {
              const status = (progressMap?.[topic.id] ?? 'not_started') as keyof typeof STATUS_CONFIG;
              const cfg = STATUS_CONFIG[status];

              return (
                <Link
                  key={topic.id}
                  to={ROUTES.topic(id, topic.id)}
                  className="block group"
                >
                  <Card className="transition-shadow hover:shadow-md group-hover:border-blue-200">
                    <div className="flex items-center gap-4">
                      {/* Order number */}
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                        {index + 1}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {topic.name}
                        </h3>
                        {topic.name_ar && (
                          <p className="text-xs text-slate-400 mt-0.5">{topic.name_ar}</p>
                        )}
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-slate-400 hidden sm:block">
                          {topic.estimated_hours}h
                        </span>
                        <span className={`flex items-center gap-1.5 text-xs font-medium ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                        <svg
                          className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors"
                          viewBox="0 0 20 20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </PageContainer>
    </AppShell>
  );
}
