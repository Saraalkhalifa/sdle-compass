import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { APP_CONFIG, ROUTES } from '@/config/app';

export function BillingPolicy() {
  const { t, isRTL } = useLanguage();

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-dvh bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 px-4 h-14 flex items-center gap-3">
        <Link to={ROUTES.home} className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
            </svg>
          </div>
          <span className="text-sm font-bold text-slate-800">{t(APP_CONFIG.name, APP_CONFIG.nameAr)}</span>
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Status banner */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-10 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-green-800 mb-2">
            {t('SDLE Compass Is Currently Free', 'SDLE Compass مجاني حالياً')}
          </h2>
          <p className="text-sm text-green-700 leading-relaxed max-w-lg mx-auto">
            {t(
              'No paid subscription is required at this time. All features described on this platform are available without charge. You do not need to provide payment information to create an account.',
              'لا يُشترط حالياً الاشتراك المدفوع. جميع الميزات الموضّحة على هذه المنصة متاحة مجاناً. لا تحتاج إلى تقديم معلومات دفع لإنشاء حساب.'
            )}
          </p>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {t('Billing and Subscription Policy', 'سياسة الفوترة والاشتراك')}
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          {t('Version 1.0 · Effective: [to be set upon publication]', 'الإصدار 1.0 · النفاذ: [يُحدَّد عند النشر]')}
        </p>

        <div className="space-y-8 text-sm text-slate-700 leading-relaxed">

          {/* Section 1 */}
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">1. {t('Current Service — No Charge', 'الخدمة الحالية — بلا رسوم')}</h2>
            <p>
              {t(
                'SDLE Compass is presently offered free of charge. No registration fee, subscription, or payment is required to access any feature currently available on the Platform.',
                'تُقدَّم منصة SDLE Compass حالياً مجاناً. لا يُشترط أي رسم تسجيل أو اشتراك أو دفع للوصول إلى أي ميزة متاحة حالياً على المنصة.'
              )}
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">2. {t('Future Paid Plans — Safeguards', 'الخطط المدفوعة المستقبلية — الضمانات')}</h2>
            <p className="mb-3">
              {t(
                'The platform administrator may introduce optional paid plans in the future. If that happens:',
                'قد يُقدّم مسؤول المنصة خطط مدفوعة اختيارية في المستقبل. إذا حدث ذلك:'
              )}
            </p>
            <ul className="list-disc ps-5 space-y-2">
              {[
                [
                  'You will receive clear advance notice before any change affects your access.',
                  'ستتلقى إشعاراً مسبقاً واضحاً قبل أن يؤثر أي تغيير على صلاحية وصولك.',
                ],
                [
                  'You will see the price, tax, billing frequency, renewal terms, and cancellation method before paying.',
                  'ستطّلع على السعر والضريبة وتكرار الفوترة وشروط التجديد وطريقة الإلغاء قبل الدفع.',
                ],
                [
                  'You will not be enrolled in any paid plan simply because you already have a free account.',
                  'لن تُسجَّل في أي خطة مدفوعة بمجرد امتلاكك حساباً مجانياً.',
                ],
                [
                  'No payment will be taken without a separate, active purchase or subscription action from you.',
                  'لن يُقتطع أي مبلغ منك دون إجراء شراء أو اشتراك منفصل ونشط منك.',
                ],
                [
                  'Automatic renewal will be clearly disclosed and require your explicit prior authorization.',
                  'سيُفصح بوضوح عن التجديد التلقائي ويستلزم تفويضاً صريحاً مسبقاً منك.',
                ],
                [
                  'You can cancel future renewal at any time through your account settings or by contacting support.',
                  'يمكنك إلغاء التجديد المستقبلي في أي وقت من خلال إعدادات حسابك أو بالتواصل مع الدعم.',
                ],
                [
                  'Cancellation stops future charges; access continues until the end of the paid billing period.',
                  'يوقف الإلغاء الرسوم المستقبلية؛ ويستمر الوصول حتى نهاية فترة الفوترة المدفوعة.',
                ],
                [
                  'Existing users who do not choose a paid plan may continue with whatever free features remain available.',
                  'يجوز للمستخدمين الحاليين الذين لا يختارون خطة مدفوعة الاستمرار في استخدام الميزات المجانية المتاحة.',
                ],
              ].map(([en, ar]) => (
                <li key={en}>{t(en, ar)}</li>
              ))}
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">3. {t('Required Information Before Checkout', 'المعلومات المطلوبة قبل الدفع')}</h2>
            <p>
              {t(
                'When paid features are introduced, the checkout process will clearly display: the plan name and included features, the price in Saudi Riyals (SAR) including VAT, billing frequency, start date, renewal terms, free-trial conditions if applicable, cancellation method, refund eligibility, and a contact method for billing questions.',
                'عند تقديم الميزات المدفوعة، ستعرض عملية الدفع بوضوح: اسم الخطة والميزات المدرجة، والسعر بالريال السعودي (SAR) متضمناً ضريبة القيمة المضافة، وتكرار الفوترة، وتاريخ البدء، وشروط التجديد، وشروط الفترة التجريبية إن وُجدت، وطريقة الإلغاء، وشروط استحقاق الاسترداد، ووسيلة التواصل لأسئلة الفوترة.'
              )}
            </p>
            <p className="mt-3">
              {t(
                'You will be required to actively confirm the purchase. A checkbox acceptance of these Terms is not sufficient authorization for a future charge.',
                'سيُطلب منك تأكيد الشراء بشكل نشط. لا يُعدّ قبول مربع الاختيار لهذه الشروط تفويضاً كافياً لاقتطاع رسوم مستقبلية.'
              )}
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">4. {t('Refunds', 'الاسترداد')}</h2>
            <p>
              {t(
                'A detailed refund policy will be published before any paid features are activated. In general, refunds will be available for duplicate charges, unauthorized transactions, and technical failures that prevent access to a paid feature. Nothing in this policy removes your mandatory consumer rights under applicable Saudi law.',
                'ستُنشر سياسة استرداد مفصّلة قبل تفعيل أي ميزات مدفوعة. بوجه عام، سيتوفر الاسترداد في حالات الرسوم المزدوجة والمعاملات غير المصرّح بها والأعطال التقنية التي تحول دون الوصول إلى ميزة مدفوعة. لا يُلغي أي بند في هذه السياسة حقوقك الإلزامية كمستهلك بموجب القانون السعودي المعمول به.'
              )}
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">5. {t('Contact', 'التواصل')}</h2>
            <p>
              {t('For billing questions, contact:', 'للاستفسارات المتعلقة بالفوترة، تواصل مع:')}{' '}
              <a href={`mailto:${APP_CONFIG.supportEmail}`} className="text-blue-600 hover:underline">
                {APP_CONFIG.supportEmail}
              </a>
            </p>
          </section>

        </div>

        {/* Footer links */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-wrap gap-4 text-sm text-slate-500">
          <Link to={ROUTES.terms} className="text-blue-600 hover:underline">{t('Terms of Service', 'شروط الخدمة')}</Link>
          <Link to={ROUTES.privacy} className="text-blue-600 hover:underline">{t('Privacy Policy', 'سياسة الخصوصية')}</Link>
          <Link to={ROUTES.signup} className="text-blue-600 hover:underline">{t('Create Account', 'إنشاء حساب')}</Link>
          <a href={`mailto:${APP_CONFIG.supportEmail}`} className="text-blue-600 hover:underline">{t('Support', 'الدعم')}</a>
        </div>
      </main>
    </div>
  );
}
