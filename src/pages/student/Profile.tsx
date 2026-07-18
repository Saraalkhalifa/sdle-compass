import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';

const AVATAR_COLORS = [
  { value: 'bg-blue-500',   label: 'Blue' },
  { value: 'bg-violet-500', label: 'Violet' },
  { value: 'bg-emerald-500',label: 'Green' },
  { value: 'bg-rose-500',   label: 'Rose' },
  { value: 'bg-amber-500',  label: 'Amber' },
  { value: 'bg-teal-500',   label: 'Teal' },
  { value: 'bg-pink-500',   label: 'Pink' },
  { value: 'bg-indigo-500', label: 'Indigo' },
];

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
}

export function ProfilePage() {
  const { profile, updateProfile, signOut } = useAuth();

  const [form, setForm] = useState({
    full_name:        profile?.full_name ?? '',
    university:       profile?.university ?? '',
    graduation_year:  profile?.graduation_year?.toString() ?? '',
    exam_date:        profile?.exam_date ?? '',
    weekly_hours:     profile?.weekly_hours?.toString() ?? '',
    avatar_color:     profile?.avatar_color ?? 'bg-blue-500',
    previous_attempt: profile?.previous_attempt ?? false,
    preferred_language: profile?.preferred_language ?? 'en',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name:        profile.full_name,
        university:       profile.university ?? '',
        graduation_year:  profile.graduation_year?.toString() ?? '',
        exam_date:        profile.exam_date ?? '',
        weekly_hours:     profile.weekly_hours?.toString() ?? '',
        avatar_color:     profile.avatar_color,
        previous_attempt: profile.previous_attempt,
        preferred_language: profile.preferred_language,
      });
    }
  }, [profile]);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim()) { toast.error('Full name is required.'); return; }
    setSaving(true);
    const { error } = await updateProfile({
      full_name:        form.full_name.trim(),
      university:       form.university || undefined,
      graduation_year:  form.graduation_year ? parseInt(form.graduation_year, 10) : undefined,
      exam_date:        form.exam_date || undefined,
      weekly_hours:     form.weekly_hours ? parseFloat(form.weekly_hours) : undefined,
      avatar_color:     form.avatar_color,
      previous_attempt: form.previous_attempt,
      preferred_language: form.preferred_language as 'en' | 'ar',
    });
    setSaving(false);
    if (error) { toast.error(error); } else { toast.success('Profile updated.'); }
  };

  const roleLabel: Record<string, string> = {
    student: 'Student',
    editor: 'Editor',
    reviewer: 'Reviewer',
    admin: 'Admin',
    main_admin: 'Main Admin',
  };

  return (
    <AppShell role="student" title="My Profile">
      <PageContainer title="My Profile" maxWidth="lg">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Avatar + identity */}
          <Card padding="lg">
            <div className="flex items-center gap-5 mb-6">
              <div className={`w-16 h-16 rounded-2xl ${form.avatar_color} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white text-xl font-bold select-none">
                  {initials(form.full_name || profile?.email || '?')}
                </span>
              </div>
              <div>
                <p className="font-semibold text-slate-900">{profile?.full_name}</p>
                <p className="text-sm text-slate-500">{profile?.email}</p>
                <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {roleLabel[profile?.role ?? 'student'] ?? profile?.role}
                </span>
              </div>
            </div>

            {/* Avatar color picker */}
            <div className="mb-5">
              <p className="text-sm font-medium text-slate-700 mb-2">Avatar color</p>
              <div className="flex flex-wrap gap-2">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    aria-label={c.label}
                    onClick={() => setForm((prev) => ({ ...prev, avatar_color: c.value }))}
                    className={`w-8 h-8 rounded-full ${c.value} transition-all ${
                      form.avatar_color === c.value ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'opacity-60 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full name"
                type="text"
                value={form.full_name}
                onChange={set('full_name')}
                required
                autoComplete="name"
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Language preference</label>
                <select
                  value={form.preferred_language}
                  onChange={set('preferred_language')}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Academic info */}
          <Card padding="lg">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Academic information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="University / institution"
                type="text"
                value={form.university}
                onChange={set('university')}
                placeholder="e.g. King Saud University"
                autoComplete="organization"
              />
              <Input
                label="Graduation year"
                type="number"
                value={form.graduation_year}
                onChange={set('graduation_year')}
                placeholder="e.g. 2023"
                min={1990}
                max={2040}
              />
              <Input
                label="Target exam date"
                type="date"
                value={form.exam_date}
                onChange={set('exam_date')}
              />
              <Input
                label="Weekly study hours"
                type="number"
                value={form.weekly_hours}
                onChange={set('weekly_hours')}
                placeholder="e.g. 10"
                min={1}
                max={80}
                step={0.5}
                helperText="Hours you plan to study each week"
              />
            </div>

            <label className="flex items-center gap-3 mt-4 cursor-pointer select-none w-fit">
              <input
                type="checkbox"
                checked={form.previous_attempt}
                onChange={(e) => setForm((prev) => ({ ...prev, previous_attempt: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">I have previously attempted the SDLE exam</span>
            </label>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button type="submit" loading={saving}>
              Save changes
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => signOut()}
              className="text-red-600 hover:bg-red-50"
            >
              Sign out
            </Button>
          </div>
        </form>
      </PageContainer>
    </AppShell>
  );
}
