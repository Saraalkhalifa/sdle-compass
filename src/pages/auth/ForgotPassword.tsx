import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { APP_CONFIG, ROUTES } from '@/config/app';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link to={ROUTES.login} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-8 w-fit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
          </svg>
          Back to sign in
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Check your email</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                We sent a password reset link to <strong>{email}</strong>.
                Check your inbox and follow the instructions.
              </p>
              <p className="text-xs text-slate-400 mt-4">
                Didn't receive it? Check your spam folder or{' '}
                <button onClick={() => setSent(false)} className="text-blue-600 hover:underline">try again</button>.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Reset your password</h2>
              <p className="text-sm text-slate-500 mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <Input
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                />
                <Button type="submit" fullWidth size="lg" loading={loading}>
                  Send reset link
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
