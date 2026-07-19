import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { APP_CONFIG, ROUTES } from '@/config/app';

export interface LegalSection {
  id: string;
  titleEn: string;
  titleAr: string;
  contentEn: React.ReactNode;
  contentAr: React.ReactNode;
}

interface LegalLayoutProps {
  titleEn: string;
  titleAr: string;
  version: string;
  effectiveDate: string;
  lastUpdated: string;
  summaryEn: React.ReactNode;
  summaryAr: React.ReactNode;
  sections: LegalSection[];
  /** If true, shows a banner that this is an AI draft pending legal review */
  isAiDraft?: boolean;
}

export function LegalLayout({
  titleEn, titleAr, version, effectiveDate, lastUpdated,
  summaryEn, summaryAr, sections, isAiDraft = true,
}: LegalLayoutProps) {
  const { lang, setLang, isRTL, t } = useLanguage();
  const [activeSection, setActiveSection] = useState<string>('');
  const [tocOpen, setTocOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Highlight active TOC item on scroll
  useEffect(() => {
    const handler = () => {
      for (const sec of sections) {
        const el = document.getElementById(`section-${sec.id}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) setActiveSection(sec.id);
        }
      }
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [sections]);

  const scrollTo = (id: string) => {
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTocOpen(false);
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-dvh bg-white">

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between gap-4 print:hidden">
        <Link to={ROUTES.home} className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
            </svg>
          </div>
          <span className="text-sm font-bold text-slate-800">{t(APP_CONFIG.name, APP_CONFIG.nameAr)}</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* TOC toggle (mobile) */}
          <button
            onClick={() => setTocOpen(v => !v)}
            className="lg:hidden text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-lg"
            aria-expanded={tocOpen}
            aria-label={t('Table of contents', 'جدول المحتويات')}
          >
            {t('Contents', 'المحتويات')}
          </button>

          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-lg"
            aria-label={t('Switch to Arabic', 'Switch to English')}
          >
            {lang === 'en' ? 'عربي' : 'EN'}
          </button>

          {/* Print */}
          <button
            onClick={() => window.print()}
            className="hidden sm:flex text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-lg items-center gap-1.5"
            aria-label={t('Print', 'طباعة')}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            {t('Print', 'طباعة')}
          </button>
        </div>
      </header>

      {/* ── AI draft warning ─────────────────────────────────────────────── */}
      {isAiDraft && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 print:hidden">
          <p className="text-xs text-amber-800 text-center max-w-4xl mx-auto">
            <strong>{t('Notice:', 'ملاحظة:')}</strong>{' '}
            {t(
              'This document is an AI-assisted draft awaiting review by a qualified Saudi lawyer. It is provided for transparency during the testing phase and does not constitute final legal advice. The platform administrator will publish the reviewed version before general public launch.',
              'هذه الوثيقة مسودة بمساعدة الذكاء الاصطناعي وهي في انتظار مراجعة محامٍ سعودي مؤهل. تُقدَّم للشفافية أثناء مرحلة الاختبار ولا تشكّل استشارة قانونية نهائية. ستنشر إدارة المنصة النسخة المُراجَعة قبل الإطلاق العام.'
            )}
          </p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 lg:flex lg:gap-8">

        {/* ── Sidebar TOC (desktop always, mobile when open) ───────────── */}
        <aside className={`lg:w-64 lg:shrink-0 print:hidden ${tocOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="lg:sticky lg:top-24">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {t('Contents', 'المحتويات')}
            </p>
            <nav aria-label={t('Document sections', 'أقسام الوثيقة')}>
              <ul className="space-y-0.5">
                {sections.map((sec) => (
                  <li key={sec.id}>
                    <button
                      onClick={() => scrollTo(sec.id)}
                      className={`w-full text-start text-sm px-3 py-1.5 rounded-lg transition-colors ${
                        activeSection === sec.id
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {t(sec.titleEn, sec.titleAr)}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <Link
                to={ROUTES.signup}
                className="block text-center text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-colors"
              >
                {t('Create Account', 'إنشاء حساب')}
              </Link>
              <Link to={ROUTES.login} className="block text-center text-sm text-blue-600 hover:underline mt-2">
                {t('Sign In', 'تسجيل الدخول')}
              </Link>
            </div>
          </div>
        </aside>

        {/* ── Document body ─────────────────────────────────────────────── */}
        <main ref={contentRef} className="flex-1 min-w-0 max-w-3xl">
          {/* Document header */}
          <div className="mb-8 pb-6 border-b border-slate-200">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              {t(titleEn, titleAr)}
            </h1>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
              <span>{t('Version', 'الإصدار')} {version}</span>
              <span>{t('Effective', 'ساري من')} {effectiveDate}</span>
              <span>{t('Updated', 'آخر تحديث')} {lastUpdated}</span>
            </div>
          </div>

          {/* Plain-language summary */}
          <div className="mb-8 p-5 bg-blue-50 border border-blue-100 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                {t('Plain-Language Summary', 'ملخص بلغة مبسّطة')}
              </p>
            </div>
            <div className="text-sm text-blue-900 leading-relaxed space-y-2">
              {lang === 'ar' ? summaryAr : summaryEn}
            </div>
            <p className="mt-3 text-xs text-blue-600 italic">
              {t(
                'This summary is provided for convenience only. The complete document below governs.',
                'يُقدَّم هذا الملخص للتيسير فقط. تسري في جميع الأحوال الوثيقة الكاملة أدناه.'
              )}
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            {sections.map((sec, i) => (
              <section key={sec.id} id={`section-${sec.id}`} className="scroll-mt-24">
                <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-baseline gap-3">
                  <span className="text-sm font-normal text-slate-400 tabular-nums">{i + 1}.</span>
                  {t(sec.titleEn, sec.titleAr)}
                </h2>
                <div className="text-sm text-slate-700 leading-relaxed space-y-3 prose prose-sm prose-slate max-w-none">
                  {lang === 'ar' ? sec.contentAr : sec.contentEn}
                </div>
              </section>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 pt-8 border-t border-slate-200 text-center print:hidden">
            <p className="text-sm text-slate-500 mb-4">
              {t(
                'Questions about this document? Contact us at',
                'هل لديك أسئلة حول هذه الوثيقة؟ تواصل معنا على'
              )}{' '}
              <a href={`mailto:${APP_CONFIG.supportEmail}`} className="text-blue-600 hover:underline">
                {APP_CONFIG.supportEmail}
              </a>
            </p>
            <Link
              to={ROUTES.signup}
              className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
            >
              {t('Create Your Free Account', 'إنشاء حسابك المجاني')}
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
