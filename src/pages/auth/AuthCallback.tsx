import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ROUTES } from '@/config/app';
import { recordConsent, loadPendingConsent, clearPendingConsent } from '@/hooks/useLegalConsent';

/**
 * Handles the email confirmation redirect from Supabase.
 * Also processes any pending legal consent saved before email confirmation.
 */
export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!supabase) { navigate(ROUTES.login, { replace: true }); return; }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Process any pending consent that was saved before email confirmation
        const pending = loadPendingConsent();
        if (pending) {
          try {
            await recordConsent({
              userId:           session.user.id,
              termsVersionId:   pending.termsVersionId,
              privacyVersionId: pending.privacyVersionId,
              marketingConsent: pending.marketingConsent,
              source:           'signup',
            });
          } catch {
            // Non-fatal: consent recording failure should not block access
          } finally {
            clearPendingConsent();
          }
        }
        navigate(ROUTES.studentDashboard, { replace: true });
      } else if (event === 'USER_UPDATED') {
        navigate(ROUTES.login, { replace: true });
      }
    });

    // Fallback: if no auth event fires in 5 s, go to login
    const timer = setTimeout(() => navigate(ROUTES.login, { replace: true }), 5000);

    return () => { subscription.unsubscribe(); clearTimeout(timer); };
  }, [navigate]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
          <svg className="animate-spin" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-label="Loading">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
            <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
        <p className="text-sm text-slate-500">Confirming your account…</p>
      </div>
    </div>
  );
}
