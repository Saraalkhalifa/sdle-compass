import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

type DocType = 'terms' | 'privacy' | 'billing' | 'cookies' | 'cancellation' | 'acceptable_use';
type DocStatus = 'draft' | 'ai_draft' | 'awaiting_review' | 'approved' | 'scheduled' | 'published' | 'superseded' | 'archived';
type ReviewStatus = 'pending' | 'in_review' | 'approved' | 'not_required';

interface LegalVersion {
  id: string;
  version: string;
  status: DocStatus;
  is_material_change: boolean;
  change_summary_en: string | null;
  effective_date: string | null;
  published_at: string | null;
  legal_review_status: ReviewStatus;
  legal_reviewed_at: string | null;
  created_at: string;
  document_id: string;
  document_type?: DocType;
}

const DOC_LABELS: Record<DocType, string> = {
  terms:          'Terms of Service',
  privacy:        'Privacy Policy',
  billing:        'Billing & Subscription Policy',
  cookies:        'Cookie Policy',
  cancellation:   'Cancellation & Refunds',
  acceptable_use: 'Acceptable Use Policy',
};

const STATUS_COLORS: Record<DocStatus, string> = {
  draft:           'bg-slate-100 text-slate-600',
  ai_draft:        'bg-amber-100 text-amber-700',
  awaiting_review: 'bg-orange-100 text-orange-700',
  approved:        'bg-green-100 text-green-700',
  scheduled:       'bg-blue-100 text-blue-700',
  published:       'bg-green-600 text-white',
  superseded:      'bg-slate-200 text-slate-500',
  archived:        'bg-slate-200 text-slate-500',
};

const REVIEW_COLORS: Record<ReviewStatus, string> = {
  pending:      'text-amber-600',
  in_review:    'text-blue-600',
  approved:     'text-green-600',
  not_required: 'text-slate-500',
};

function useLegalVersions() {
  return useQuery({
    queryKey: ['admin-legal-versions'],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('legal_document_versions')
        .select('*, legal_documents(type)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((v: Record<string, unknown>) => ({
        ...v,
        document_type: (v.legal_documents as { type: DocType } | null)?.type,
      })) as LegalVersion[];
    },
  });
}

function useLegalAcceptanceStats() {
  return useQuery({
    queryKey: ['legal-acceptance-stats'],
    queryFn: async () => {
      if (!supabase) return { total: 0, byVersion: [] };
      const { count } = await supabase
        .from('user_legal_acceptances')
        .select('*', { count: 'exact', head: true });
      const { count: marketing } = await supabase
        .from('user_consent_preferences')
        .select('*', { count: 'exact', head: true })
        .eq('marketing_consent', true);
      return { total: count ?? 0, marketingConsent: marketing ?? 0 };
    },
  });
}

export function AdminLegal() {
  const { data: versions = [], isLoading, refetch } = useLegalVersions();
  const { data: stats } = useLegalAcceptanceStats();
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [confirmPublish, setConfirmPublish] = useState<LegalVersion | null>(null);

  // Group by document type
  const grouped = versions.reduce<Record<string, LegalVersion[]>>((acc, v) => {
    const key = v.document_type ?? 'unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(v);
    return acc;
  }, {});

  const handlePublish = async (version: LegalVersion) => {
    if (!supabase || !version.document_id) return;
    setPublishingId(version.id);
    try {
      // Archive existing published version for this document
      await supabase
        .from('legal_document_versions')
        .update({ status: 'superseded' })
        .eq('document_id', version.document_id)
        .eq('status', 'published');

      // Publish this version
      await supabase
        .from('legal_document_versions')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
        })
        .eq('id', version.id);

      await refetch();
    } finally {
      setPublishingId(null);
      setConfirmPublish(null);
    }
  };

  const handleStatusUpdate = async (id: string, status: DocStatus) => {
    if (!supabase) return;
    await supabase.from('legal_document_versions').update({ status }).eq('id', id);
    await refetch();
  };

  return (
    <AppShell>
      <PageContainer
        title="Legal Document Management"
        description="Manage Terms of Service, Privacy Policy, and other legal documents"
      >

        {/* Warning banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" className="shrink-0 mt-0.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div className="text-sm">
            <p className="font-semibold text-amber-800">Legal review required before publishing</p>
            <p className="text-amber-700 mt-0.5">All documents marked <em>AI Draft</em> must be reviewed and approved by a qualified Saudi lawyer before being published to users. Do not publish unreviewed documents.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total consent records', value: stats?.total ?? '—' },
            { label: 'Marketing consent (opt-in)', value: stats?.marketingConsent ?? '—' },
            { label: 'Documents tracked', value: Object.keys(grouped).length },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xl font-bold text-slate-900">{String(s.value)}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Document groups */}
        {isLoading ? (
          <div className="text-center py-16 text-slate-400 text-sm">Loading documents…</div>
        ) : (
          <div className="space-y-6">
            {(Object.keys(DOC_LABELS) as DocType[]).map((docType) => {
              const docVersions = grouped[docType] ?? [];
              const published = docVersions.find((v) => v.status === 'published');

              return (
                <div key={docType} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{DOC_LABELS[docType]}</h3>
                      {published ? (
                        <p className="text-xs text-green-600 mt-0.5">
                          Published: v{published.version} · {published.published_at ? new Date(published.published_at).toLocaleDateString() : '—'}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 mt-0.5">No published version</p>
                      )}
                    </div>
                  </div>

                  {docVersions.length === 0 ? (
                    <p className="text-xs text-slate-400 px-5 py-4">No versions yet.</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-slate-500 border-b border-slate-100">
                          <th className="text-start px-5 py-2.5 font-medium">Version</th>
                          <th className="text-start px-3 py-2.5 font-medium">Status</th>
                          <th className="text-start px-3 py-2.5 font-medium hidden md:table-cell">Legal review</th>
                          <th className="text-start px-3 py-2.5 font-medium hidden lg:table-cell">Material change</th>
                          <th className="text-start px-3 py-2.5 font-medium hidden lg:table-cell">Effective</th>
                          <th className="text-start px-3 py-2.5 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {docVersions.map((v) => (
                          <tr key={v.id} className="hover:bg-slate-50/50">
                            <td className="px-5 py-3 font-mono font-semibold text-slate-800">v{v.version}</td>
                            <td className="px-3 py-3">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[v.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                {v.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="px-3 py-3 hidden md:table-cell">
                              <span className={`text-xs font-medium ${REVIEW_COLORS[v.legal_review_status] ?? 'text-slate-500'}`}>
                                {v.legal_review_status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="px-3 py-3 hidden lg:table-cell text-xs text-slate-500">
                              {v.is_material_change ? '⚠ Yes' : 'No'}
                            </td>
                            <td className="px-3 py-3 hidden lg:table-cell text-xs text-slate-500">
                              {v.effective_date ?? '—'}
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                {/* Mark as awaiting review */}
                                {(v.status === 'draft' || v.status === 'ai_draft') && (
                                  <button
                                    onClick={() => handleStatusUpdate(v.id, 'awaiting_review')}
                                    className="text-xs text-blue-600 hover:underline"
                                  >
                                    Mark for review
                                  </button>
                                )}
                                {/* Mark as approved */}
                                {v.status === 'awaiting_review' && (
                                  <button
                                    onClick={() => handleStatusUpdate(v.id, 'approved')}
                                    className="text-xs text-green-600 hover:underline"
                                  >
                                    Mark approved
                                  </button>
                                )}
                                {/* Publish (only if approved, never if ai_draft/draft) */}
                                {v.status === 'approved' && (
                                  <Button
                                    size="sm"
                                    onClick={() => setConfirmPublish(v)}
                                    loading={publishingId === v.id}
                                  >
                                    Publish
                                  </Button>
                                )}
                                {/* Archive */}
                                {(v.status === 'published' || v.status === 'superseded') && (
                                  <button
                                    onClick={() => handleStatusUpdate(v.id, 'archived')}
                                    className="text-xs text-slate-400 hover:underline"
                                  >
                                    Archive
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Publish confirmation modal */}
        {confirmPublish && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-base font-bold text-slate-900 mb-2">Confirm publication</h3>
              <p className="text-sm text-slate-600 mb-1">
                You are about to publish{' '}
                <strong>{DOC_LABELS[confirmPublish.document_type ?? 'terms' as DocType]} v{confirmPublish.version}</strong>.
              </p>
              {confirmPublish.is_material_change && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 my-3 text-xs text-amber-800">
                  <strong>Material change:</strong> This version contains material changes. Affected users will need to re-accept the updated terms. Ensure you have reviewed the notification plan.
                </div>
              )}
              <p className="text-xs text-slate-500 mt-3 mb-6">
                Any currently-published version will be superseded. This action cannot be undone without re-publishing the previous version.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setConfirmPublish(null)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={() => handlePublish(confirmPublish)}
                  loading={publishingId === confirmPublish.id}
                  className="flex-1"
                >
                  Publish
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Implementation checklist */}
        <div className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Pre-publication checklist</h3>
          <ul className="text-xs text-slate-600 space-y-1.5">
            {[
              'Replace all [PLACEHOLDER] values in Terms and Privacy Policy with verified legal entity information',
              'Review all documents with a qualified Saudi lawyer',
              'Confirm the competent data-protection authority name for the Privacy Policy',
              'Confirm the governing-law and dispute-resolution clauses are enforceable under Saudi law',
              'Configure the commercial registration number and business address',
              'Set the effective date for both documents',
              'Verify international transfer mechanisms for Supabase and Anthropic',
              'Update third-party provider list when payment provider and email provider are selected',
              'Test that consent records are written to user_legal_acceptances after signup',
              'Test that the privacy contact email is monitored and responsive',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-slate-400 mt-0.5">☐</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </PageContainer>
    </AppShell>
  );
}
