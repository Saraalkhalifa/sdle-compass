import React from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ROUTES } from '@/config/app';

const SUBJECTS = [
  { id: '1', name: 'Restorative Dentistry',     nameAr: 'طب الأسنان التحفظي',          color: 'bg-blue-500',    weight: 20, topics: 12, progress: 45, icon: '🦷' },
  { id: '2', name: 'Endodontics',               nameAr: 'علاج الجذور',                  color: 'bg-teal-500',    weight: 15, topics: 8,  progress: 60, icon: '🔬' },
  { id: '3', name: 'Periodontics',              nameAr: 'أمراض اللثة',                  color: 'bg-emerald-500', weight: 15, topics: 9,  progress: 30, icon: '🩺' },
  { id: '4', name: 'Prosthodontics',            nameAr: 'تعويضات الأسنان',              color: 'bg-violet-500',  weight: 12, topics: 11, progress: 20, icon: '⚕️' },
  { id: '5', name: 'Oral & Maxillofacial Surgery', nameAr: 'جراحة الفم والوجه والفكين', color: 'bg-rose-500',    weight: 10, topics: 7,  progress: 55, icon: '🏥' },
  { id: '6', name: 'Oral Medicine & Pathology', nameAr: 'طب الفم وعلم الأمراض',        color: 'bg-amber-500',   weight: 8,  topics: 10, progress: 15, icon: '📋' },
  { id: '7', name: 'Pediatric Dentistry',       nameAr: 'طب أسنان الأطفال',            color: 'bg-pink-500',    weight: 6,  topics: 6,  progress: 40, icon: '👶' },
  { id: '8', name: 'Orthodontics',              nameAr: 'تقويم الأسنان',               color: 'bg-indigo-500',  weight: 5,  topics: 5,  progress: 25, icon: '📐' },
  { id: '9', name: 'Dental Radiology',          nameAr: 'الأشعة السنية',               color: 'bg-cyan-500',    weight: 4,  topics: 6,  progress: 70, icon: '📡' },
  { id: '10', name: 'Pharmacology',             nameAr: 'علم الأدوية',                 color: 'bg-orange-500',  weight: 2,  topics: 4,  progress: 50, icon: '💊' },
  { id: '11', name: 'Medical Emergencies',      nameAr: 'الطوارئ الطبية',              color: 'bg-red-500',     weight: 1,  topics: 3,  progress: 80, icon: '🚨' },
  { id: '12', name: 'Infection Control & Ethics', nameAr: 'مكافحة العدوى والأخلاقيات', color: 'bg-slate-500',   weight: 2,  topics: 4,  progress: 90, icon: '🛡️' },
];

export function Subjects() {
  return (
    <AppShell role="student" showSearch title="Subjects">
      <PageContainer
        title="Subjects"
        description="SDLE examination subjects — select any subject to start studying"
        breadcrumbs={[{ label: 'Dashboard', href: ROUTES.studentDashboard }, { label: 'Subjects' }]}
        maxWidth="xl"
      >
        {/* Overall progress */}
        <Card variant="flat" className="mb-6 border border-slate-200">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-medium text-slate-700">Overall Syllabus Coverage</p>
              <p className="text-xs text-slate-500 mt-0.5">Based on questions answered per subject</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">38%</p>
              <p className="text-xs text-slate-400">Complete</p>
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '38%' }} />
          </div>
        </Card>

        {/* Subject grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUBJECTS.map((subject) => (
            <Link
              key={subject.id}
              to={ROUTES.subject(subject.id)}
              className="block group"
            >
              <Card className="h-full transition-shadow hover:shadow-md group-hover:border-blue-200">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 ${subject.color} rounded-xl flex items-center justify-center text-xl flex-shrink-0`}>
                    {subject.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors">
                      {subject.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{subject.nameAr}</p>
                  </div>
                  <Badge color="neutral" size="xs">{subject.weight}%</Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>{subject.topics} topics</span>
                  <span className="font-semibold text-slate-700">{subject.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className={`${subject.color} h-1.5 rounded-full transition-all`}
                    style={{ width: `${subject.progress}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className={`${subject.progress >= 70 ? 'text-green-600' : subject.progress >= 40 ? 'text-amber-600' : 'text-red-500'} font-medium`}>
                    {subject.progress >= 70 ? 'Strong' : subject.progress >= 40 ? 'Moderate' : 'Needs work'}
                  </span>
                  <span className="text-blue-600 font-medium group-hover:underline">Study →</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </PageContainer>
    </AppShell>
  );
}
