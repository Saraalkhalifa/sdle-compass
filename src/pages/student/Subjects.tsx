import React from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ROUTES } from '@/config/app';
import { useSubjectsList } from '@/hooks/useSubjects';

function SubjectsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <Card key={i} className="h-[140px]">
          <div className="flex items-start gap-3 mb-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-2 w-full rounded-full mt-4" />
        </Card>
      ))}
    </div>
  );
}

export function Subjects() {
  const { data: subjects, isLoading, error } = useSubjectsList();

  return (
    <AppShell role="student" showSearch title="Subjects">
      <PageContainer
        title="Subjects"
        description="SDLE examination subjects — select any subject to start studying"
        breadcrumbs={[{ label: 'Dashboard', href: ROUTES.studentDashboard }, { label: 'Subjects' }]}
        maxWidth="xl"
      >
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            Failed to load subjects. Please refresh the page.
          </div>
        )}

        {isLoading ? (
          <SubjectsSkeleton />
        ) : (
          <>
            {/* Summary bar */}
            <Card variant="flat" className="mb-6 border border-slate-200">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-sm font-medium text-slate-700">Examination subjects</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {subjects?.length ?? 0} subjects · select any to start studying
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    {subjects?.reduce((s, subj) => s + subj.exam_weight, 0).toFixed(0)}%
                  </p>
                  <p className="text-xs text-slate-400">Total coverage</p>
                </div>
              </div>
            </Card>

            {/* Subject grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(subjects ?? []).map((subject) => (
                <Link
                  key={subject.id}
                  to={ROUTES.subject(subject.id)}
                  className="block group"
                >
                  <Card className="h-full transition-shadow hover:shadow-md group-hover:border-blue-200">
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className={`w-10 h-10 ${subject.color ?? 'bg-blue-500'} rounded-xl flex items-center justify-center text-xl flex-shrink-0`}
                      >
                        {subject.icon ?? '📚'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors">
                          {subject.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">{subject.name_ar}</p>
                      </div>
                      <Badge color="neutral" size="xs">{subject.exam_weight}%</Badge>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        {subject.description ? subject.description.slice(0, 50) + (subject.description.length > 50 ? '…' : '') : 'View topics →'}
                      </span>
                      <span className="text-blue-600 font-medium group-hover:underline shrink-0 ml-2">
                        Study →
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {!subjects?.length && !isLoading && (
              <div className="text-center py-16 text-slate-400">
                <p className="text-4xl mb-3">📚</p>
                <p className="font-medium text-slate-600">No subjects yet</p>
                <p className="text-sm mt-1">Check back soon — curriculum is being set up.</p>
              </div>
            )}
          </>
        )}
      </PageContainer>
    </AppShell>
  );
}
