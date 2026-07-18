import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { APP_CONFIG, ROUTES } from '@/config/app';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      // Auth implementation comes in Phase 2
      await new Promise((r) => setTimeout(r, 800));
      navigate(ROUTES.studentDashboard);
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-none">{APP_CONFIG.name}</h1>
            <p className="text-xs text-slate-500 mt-0.5">{APP_CONFIG.examAbbreviation} Preparation Platform</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Create your account</h2>
          <p className="text-sm text-slate-500 mb-6">
            Already have an account?{' '}
            <Link to={ROUTES.login} className="text-blue-600 font-medium hover:underline">Sign in</Link>
          </p>

          {error && (
            <div role="alert" className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Full name"
              type="text"
              value={form.fullName}
              onChange={update('fullName')}
              placeholder="Dr. Sara Al-Khalifa"
              required
              autoComplete="name"
            />
            <Input
              label="Email address"
              type="email"
              value={form.email}
              onChange={update('email')}
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={update('password')}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              helperText="At least 8 characters"
            />
            <Input
              label="Confirm password"
              type="password"
              value={form.confirmPassword}
              onChange={update('confirmPassword')}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />

            <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
              Create account
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6 leading-relaxed">
          By creating an account you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
