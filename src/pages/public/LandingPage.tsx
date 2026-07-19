import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { APP_CONFIG, ROUTES } from '@/config/app';

// ── Feature list ──────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
      </svg>
    ),
    titleEn: 'Personalized Study Plan',
    titleAr: 'خطة دراسة مخصصة',
    descEn: 'Get a study schedule built around your exam date, available hours, and target score.',
    descAr: 'احصل على جدول دراسي مبني على تاريخ اختبارك وساعاتك المتاحة وهدفك.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>
      </svg>
    ),
    titleEn: 'Practice Questions',
    titleAr: 'أسئلة تدريبية',
    descEn: 'Practice thousands of exam-style questions with instant feedback and detailed explanations.',
    descAr: 'تدرب على آلاف الأسئلة بأسلوب الاختبار مع تعليقات فورية وشروحات تفصيلية.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
      </svg>
    ),
    titleEn: 'AI Tutor',
    titleAr: 'المعلم الذكي',
    descEn: 'Ask any dental question and receive clear, evidence-based answers powered by AI.',
    descAr: 'اسأل أي سؤال طبي واحصل على إجابات واضحة قائمة على الأدلة بمساعدة الذكاء الاصطناعي.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
    ),
    titleEn: 'Mock Examinations',
    titleAr: 'اختبارات تجريبية',
    descEn: 'Simulate the real SDLE exam under timed conditions to identify gaps before exam day.',
    descAr: 'محاكاة اختبار SDLE الحقيقي في ظروف موقوتة لاكتشاف الثغرات قبل يوم الاختبار.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"/>
      </svg>
    ),
    titleEn: 'Performance Analytics',
    titleAr: 'تحليل الأداء',
    descEn: 'Track your accuracy, identify weak subjects, and measure improvement over time.',
    descAr: 'تتبع دقتك، وحدد المواد الضعيفة، وقس تحسنك مع مرور الوقت.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
      </svg>
    ),
    titleEn: 'Bilingual — Arabic & English',
    titleAr: 'ثنائي اللغة — عربي وإنجليزي',
    descEn: 'Study in your preferred language. Full Arabic RTL interface available.',
    descAr: 'ادرس بلغتك المفضلة. تتوفر واجهة عربية كاملة من اليمين إلى اليسار.',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function LandingPage() {
  const { session, isLoading } = useAuth();
  const { lang, setLang, isRTL, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Redirect authenticated users to dashboard
  if (!isLoading && session) {
    return <Navigate to={ROUTES.studentDashboard} replace />;
  }

  const navCls = 'fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm';

  return (
    <div className={`min-h-dvh bg-white ${isRTL ? 'font-sans' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <nav className={navCls} aria-label="Main navigation">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
              </svg>
            </div>
            <span className="text-sm font-bold text-white">
              {t(APP_CONFIG.name, APP_CONFIG.nameAr)}
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="text-xs font-medium text-slate-300 hover:text-white px-2 py-1 rounded transition-colors"
              aria-label="Switch language"
            >
              {lang === 'en' ? 'عربي' : 'EN'}
            </button>
            <Link
              to={ROUTES.login}
              className="text-sm text-slate-300 hover:text-white transition-colors px-3 py-1.5"
            >
              {t('Sign In', 'تسجيل الدخول')}
            </Link>
            <Link
              to={ROUTES.signup}
              className="text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg transition-colors"
            >
              {t('Create Account', 'إنشاء حساب')}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden text-slate-300 hover:text-white p-1"
            onClick={() => setMobileMenuOpen(v => !v)}
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen
                ? <><path d="M18 6L6 18"/><path d="M6 6l12 12"/></>
                : <><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></>
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-white/10 bg-slate-900 px-4 py-3 space-y-2">
            <button
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="block w-full text-left text-sm text-slate-300 hover:text-white py-2 transition-colors"
            >
              {lang === 'en' ? 'عربي — Switch to Arabic' : 'EN — Switch to English'}
            </button>
            <Link to={ROUTES.login} className="block text-sm text-slate-300 hover:text-white py-2">
              {t('Sign In', 'تسجيل الدخول')}
            </Link>
            <Link to={ROUTES.signup} className="block text-sm font-semibold text-blue-400 hover:text-blue-300 py-2">
              {t('Create Free Account', 'إنشاء حساب مجاني')}
            </Link>
          </div>
        )}
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative bg-slate-900 pt-24 pb-20 px-4 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute top-10 left-1/4 w-64 h-64 rounded-full bg-indigo-600/8 blur-2xl" />
        </div>

        <div className="relative max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 text-xs font-semibold bg-blue-600/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            {t('Saudi Dental Licensure Examination', 'اختبار ترخيص طب الأسنان السعودي')}
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
            {lang === 'ar'
              ? <><span className="text-blue-400">SDLE</span>{' '}استعد لاختبار بثقة</>
              : <>Prepare for the{' '}<span className="text-blue-400">SDLE</span>{' '}with confidence</>
            }
          </h1>

          {/* Subheading */}
          <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-2xl mx-auto">
            {t(
              'Organize your subjects, practice questions, track your progress, and study smarter with personalized plans and AI-powered guidance.',
              'نظّم موادك، وتدرب على الأسئلة، وتابع تقدمك، وادرس بذكاء مع خطط مخصصة وإرشادات مدعومة بالذكاء الاصطناعي.'
            )}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={ROUTES.signup}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-base"
            >
              {t('Create Free Account', 'إنشاء حساب مجاني')}
            </Link>
            <Link
              to={ROUTES.login}
              className="w-full sm:w-auto border border-white/20 hover:border-white/40 text-slate-200 hover:text-white font-medium px-8 py-3 rounded-xl transition-colors text-base"
            >
              {t('Sign In', 'تسجيل الدخول')}
            </Link>
          </div>

          {/* Social proof line */}
          <p className="mt-6 text-xs text-slate-500">
            {t('No credit card required · Free to get started', 'لا يلزم بطاقة ائتمانية · مجاني للبدء')}
          </p>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              {t('Everything you need to pass the SDLE', 'كل ما تحتاجه لاجتياز اختبار SDLE')}
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              {t(
                'One platform combining study planning, question practice, and performance tracking.',
                'منصة واحدة تجمع بين تخطيط الدراسة وممارسة الأسئلة وتتبع الأداء.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.titleEn}
                className="bg-slate-50 border border-slate-200 rounded-xl p-6 hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
              >
                <div className="w-11 h-11 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1.5">
                  {t(f.titleEn, f.titleAr)}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {t(f.descEn, f.descAr)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Exam info banner ───────────────────────────────────────────────── */}
      <section className="py-12 px-4 bg-blue-700">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
            {t('Ready to start your SDLE preparation?', 'هل أنت مستعد لبدء تحضيرك لاختبار SDLE؟')}
          </h2>
          <p className="text-blue-200 mb-6 text-sm">
            {t(
              'Join other dental graduates preparing for the Saudi Dental Licensure Examination.',
              'انضم إلى خريجي طب الأسنان الآخرين الذين يستعدون لاختبار ترخيص طب الأسنان السعودي.'
            )}
          </p>
          <Link
            to={ROUTES.signup}
            className="inline-block bg-white text-blue-700 hover:bg-blue-50 font-bold px-8 py-3 rounded-xl transition-colors"
          >
            {t('Get Started Free', 'ابدأ مجانًا')}
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-700/60">
            {/* Brand */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
                </svg>
              </div>
              <span className="text-sm font-semibold text-white">
                {t(APP_CONFIG.name, APP_CONFIG.nameAr)}
              </span>
            </div>

            {/* Links */}
            <nav className="flex items-center gap-5 text-xs" aria-label="Footer navigation">
              <a href="#" className="hover:text-white transition-colors">
                {t('Privacy Policy', 'سياسة الخصوصية')}
              </a>
              <a href="#" className="hover:text-white transition-colors">
                {t('Terms of Use', 'شروط الاستخدام')}
              </a>
              <a href={`mailto:${APP_CONFIG.supportEmail}`} className="hover:text-white transition-colors">
                {t('Support', 'الدعم')}
              </a>
            </nav>
          </div>

          <p className="text-xs text-center mt-6 text-slate-600">
            {t(
              `© ${new Date().getFullYear()} ${APP_CONFIG.name}. Designed to help dental graduates succeed.`,
              `© ${new Date().getFullYear()} ${APP_CONFIG.nameAr}. مصمم لمساعدة خريجي طب الأسنان على النجاح.`
            )}
          </p>
        </div>
      </footer>
    </div>
  );
}
