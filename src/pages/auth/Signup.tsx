import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { APP_CONFIG, ROUTES } from '@/config/app';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import {
  getCurrentConsentVersions,
  recordConsent,
  savePendingConsent,
} from '@/hooks/useLegalConsent';

export function Signup() {
  const { signUp } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [showOptional, setShowOptional] = useState(false);

  const [form, setForm] = useState({
    fullName:          '',
    email:             '',
    password:          '',
    confirmPassword:   '',
    preferredLanguage: 'en' as 'en' | 'ar',
    university:        '',
    graduationYear:    '',
    agreeTerms:        false,
    marketingConsent:  false,
  });

  const update = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) =>
    setForm((prev) => ({
      ...prev,
      [field]:
        e.target.type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : e.target.value,
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.fullName.trim()) {
      setError('Please enter your full name.'); return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.'); return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.'); return;
    }
    if (!form.agreeTerms) {
      setError('Please agree to the Terms of Service and acknowledge the Privacy Policy.'); return;
    }

    setLoading(true);

    // Fetch current legal version IDs before signup
    const versions = await getCurrentConsentVersions();

    const { error: err, needsConfirmation } = await signUp(
      form.email.trim(),
      form.password,
      form.fullName.trim(),
      form.preferredLanguage,
    );

    setLoading(false);

    if (err) {
      setError(err);
      return;
    }

    if (needsConfirmation) {
      // Store consent info for when the user confirms their email
      savePendingConsent({
        termsVersionId:   versions.termsVersionId,
        privacyVersionId: versions.privacyVersionId,
        marketingConsent: form.marketingConsent,
      });
      setConfirmed(true);
    } else {
      // Auto-confirmed: session is now live — record consent immediately
      const { data: { user } } = await (supabase?.auth.getUser() ?? Promise.resolve({ data: { user: null } }));
      if (user) {
        await recordConsent({
          userId:          user.id,
          termsVersionId:  versions.termsVersionId,
          privacyVersionId: versions.privacyVersionId,
          marketingConsent: form.marketingConsent,
          source:          'signup',
        });
      }
      // PublicOnlyRoute / AuthContext redirects to /onboarding
    }
  };

  // ── Email confirmation screen ─────────────────────────────────────────────

  if (confirmed) {
    return (
      <div className="min-h-dvh bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Check your email</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              We sent a confirmation link to <strong>{form.email}</strong>.
              Click it to activate your account and start your personalized setup.
            </p>
            <p className="text-xs text-slate-400 mt-4">
              Didn't receive it? Check your spam folder or{' '}
              <button onClick={() => setConfirmed(false)} className="text-blue-600 hover:underline">
                try again
              </button>.
            </p>
            <Link to={ROUTES.login} className="block mt-6 text-sm text-blue-600 hover:underline">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Registration form ─────────────────────────────────────────────────────

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
            <div role="alert" className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <path strokeLinecap="round" d="M12 8v4m0 4h.01"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Full name"
              type="text"
              value={form.fullName}
              onChange={update('fullName')}
              placeholder="Your name"
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

            {/* Language preference */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Preferred language
              </label>
              <select
                value={form.preferredLanguage}
                onChange={update('preferredLanguage')}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              >
                <option value="en">English</option>
                <option value="ar">Arabic — عربي</option>
              </select>
            </div>

            {/* Optional academic info */}
            <div>
              <button
                type="button"
                onClick={() => setShowOptional(!showOptional)}
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
                aria-expanded={showOptional}
              >
                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  className={`transition-transform ${showOptional ? 'rotate-90' : ''}`}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
                </svg>
                {showOptional ? 'Hide' : 'Add'} academic info (optional)
              </button>

              {showOptional && (
                <div className="mt-3 space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <Input
                    label="University"
                    type="text"
                    value={form.university}
                    onChange={update('university')}
                    placeholder="Your university"
                    autoComplete="organization"
                  />
                  <Input
                    label="Graduation year"
                    type="number"
                    value={form.graduationYear}
                    onChange={update('graduationYear')}
                    placeholder="2024"
                    min={2000}
                    max={new Date().getFullYear() + 2}
                  />
                </div>
              )}
            </div>

            {/* ── Required: Terms + Privacy ──────────────────────────────── */}
            <div className="space-y-3 pt-1">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  id="agreeTerms"
                  type="checkbox"
                  checked={form.agreeTerms}
                  onChange={update('agreeTerms')}
                  required
                  aria-required="true"
                  aria-describedby="agreeTerms-desc"
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                />
                <span id="agreeTerms-desc" className="text-sm text-slate-600 leading-relaxed">
                  I agree to the{' '}
                  <Link
                    to={ROUTES.terms}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                    tabIndex={0}
                  >
                    Terms of Service
                  </Link>{' '}
                  and acknowledge that I have read the{' '}
                  <Link
                    to={ROUTES.privacy}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                    tabIndex={0}
                  >
                    Privacy Policy
                  </Link>.{' '}
                  <span className="text-red-500" aria-hidden="true">*</span>
                </span>
              </label>

              {/* Optional: Marketing consent */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  id="marketingConsent"
                  type="checkbox"
                  checked={form.marketingConsent}
                  onChange={update('marketingConsent')}
                  aria-describedby="marketingConsent-desc"
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                />
                <span id="marketingConsent-desc" className="text-sm text-slate-500 leading-relaxed">
                  I would like to receive optional product updates and promotional messages.{' '}
                  <span className="text-slate-400 text-xs">(Optional — you can change this in settings)</span>
                </span>
              </label>
            </div>

            <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
              Create account
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6 leading-relaxed">
          {APP_CONFIG.name} is an independent study tool. Not affiliated with or endorsed by SCFHS.
        </p>
      </div>
    </div>
  );
}
