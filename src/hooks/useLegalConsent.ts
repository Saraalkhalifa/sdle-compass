import { supabase } from '@/lib/supabase';

export type LegalDocType = 'terms' | 'privacy' | 'billing' | 'cookies' | 'cancellation' | 'acceptable_use';

export interface ConsentVersions {
  termsVersionId: string | null;
  privacyVersionId: string | null;
}

/** Returns the latest version ID for a given document type (any status). */
async function getLatestVersionId(type: LegalDocType): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from('legal_documents')
    .select('id')
    .eq('type', type)
    .single();
  if (!data) return null;

  const { data: version } = await supabase
    .from('legal_document_versions')
    .select('id')
    .eq('document_id', data.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return version?.id ?? null;
}

/** Fetch current version IDs for Terms and Privacy. */
export async function getCurrentConsentVersions(): Promise<ConsentVersions> {
  const [termsVersionId, privacyVersionId] = await Promise.all([
    getLatestVersionId('terms'),
    getLatestVersionId('privacy'),
  ]);
  return { termsVersionId, privacyVersionId };
}

export interface RecordConsentParams {
  userId: string;
  termsVersionId: string | null;
  privacyVersionId: string | null;
  marketingConsent: boolean;
  source?: 'signup' | 'reaccept' | 'settings';
}

/** Record acceptance of Terms and Privacy, plus optional marketing preference. */
export async function recordConsent({
  userId,
  termsVersionId,
  privacyVersionId,
  marketingConsent,
  source = 'signup',
}: RecordConsentParams): Promise<void> {
  if (!supabase) return;

  type Acceptance = {
    user_id: string;
    document_version_id: string;
    acceptance_source: typeof source;
    is_required: boolean;
  };
  const inserts: Acceptance[] = [];
  if (termsVersionId) {
    inserts.push({ user_id: userId, document_version_id: termsVersionId, acceptance_source: source, is_required: true });
  }
  if (privacyVersionId) {
    inserts.push({ user_id: userId, document_version_id: privacyVersionId, acceptance_source: source, is_required: true });
  }

  if (inserts.length > 0) {
    await supabase
      .from('user_legal_acceptances')
      .upsert(inserts, { onConflict: 'user_id,document_version_id', ignoreDuplicates: true });
  }

  // Upsert consent preferences
  await supabase
    .from('user_consent_preferences')
    .upsert(
      {
        user_id: userId,
        marketing_consent: marketingConsent,
        marketing_consent_at: marketingConsent ? new Date().toISOString() : null,
        analytics_consent: false,
      },
      { onConflict: 'user_id' }
    );
}

// ── localStorage helpers for email-confirmation flow ──────────────────────────
// When email confirmation is required, we can't insert yet (no session).
// Store the pending consent info and process it in AuthCallback after sign-in.

const PENDING_KEY = 'sdle_pending_consent';

export interface PendingConsent {
  termsVersionId: string | null;
  privacyVersionId: string | null;
  marketingConsent: boolean;
}

export function savePendingConsent(data: PendingConsent): void {
  try { localStorage.setItem(PENDING_KEY, JSON.stringify(data)); } catch {}
}

export function loadPendingConsent(): PendingConsent | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as PendingConsent) : null;
  } catch { return null; }
}

export function clearPendingConsent(): void {
  try { localStorage.removeItem(PENDING_KEY); } catch {}
}
