import React from 'react';
import { Link } from 'react-router-dom';
import { LegalLayout, LegalSection } from '@/components/ui/LegalLayout';
import { APP_CONFIG, ROUTES } from '@/config/app';

const P = {
  entity:       '[LEGAL ENTITY OR OWNER NAME]',
  address:      '[BUSINESS ADDRESS, KINGDOM OF SAUDI ARABIA]',
  privacyEmail: '[PRIVACY CONTACT EMAIL]',
  supportEmail: APP_CONFIG.supportEmail,
  effectiveDate: '[EFFECTIVE DATE — TO BE SET UPON PUBLICATION]',
};

const VERSION        = '1.0';
const EFFECTIVE_DATE = P.effectiveDate;
const LAST_UPDATED   = P.effectiveDate;

// ── Retention schedule ────────────────────────────────────────────────────────

const RETENTION_TABLE = (
  <div className="overflow-x-auto">
    <table className="w-full text-xs border-collapse">
      <thead>
        <tr className="bg-slate-100">
          <th className="border border-slate-200 px-3 py-2 text-start font-semibold">Data category</th>
          <th className="border border-slate-200 px-3 py-2 text-start font-semibold">Retention period</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {[
          ['Account profile', 'Until account deleted, then 30 days for recovery; legal-obligation records longer'],
          ['Study records and progress', 'Duration of account; deleted with account (subject to legal holds)'],
          ['AI chat history', '90 days rolling, or until account deletion'],
          ['Security and access logs', '12 months from event date'],
          ['Consent and acceptance records', '5 years from acceptance date (legal evidence)'],
          ['Support correspondence', '2 years from ticket closure'],
          ['Backup copies', 'Up to 90 days after deletion from primary storage'],
          ['Billing and tax records (when applicable)', 'As required by Saudi financial regulations, typically 10 years'],
        ].map(([cat, period]) => (
          <tr key={cat} className="even:bg-slate-50/50">
            <td className="border border-slate-200 px-3 py-2">{cat}</td>
            <td className="border border-slate-200 px-3 py-2">{period}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const RETENTION_TABLE_AR = (
  <div className="overflow-x-auto">
    <table className="w-full text-xs border-collapse">
      <thead>
        <tr className="bg-slate-100">
          <th className="border border-slate-200 px-3 py-2 text-start font-semibold">فئة البيانات</th>
          <th className="border border-slate-200 px-3 py-2 text-start font-semibold">فترة الاحتفاظ</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {[
          ['الملف الشخصي للحساب', 'حتى حذف الحساب، ثم 30 يوماً للاسترداد؛ وتُحتفظ بسجلات الالتزامات القانونية لفترة أطول'],
          ['سجلات الدراسة والتقدم', 'طوال مدة الحساب؛ يُحذف مع الحساب (مع مراعاة الاحتجازات القانونية)'],
          ['سجل محادثات الذكاء الاصطناعي', '90 يوماً متجددة، أو حتى حذف الحساب'],
          ['سجلات الأمان والوصول', '12 شهراً من تاريخ الحدث'],
          ['سجلات الموافقة والقبول', '5 سنوات من تاريخ القبول (دليل قانوني)'],
          ['مراسلات الدعم', 'سنتان من إغلاق التذكرة'],
          ['النسخ الاحتياطية', 'ما يصل إلى 90 يوماً بعد الحذف من التخزين الأساسي'],
          ['سجلات الفوترة والضرائب (عند تطبيقها)', 'وفقاً لما تقتضيه الأنظمة المالية السعودية، عادةً 10 سنوات'],
        ].map(([cat, period]) => (
          <tr key={cat} className="even:bg-slate-50/50">
            <td className="border border-slate-200 px-3 py-2">{cat}</td>
            <td className="border border-slate-200 px-3 py-2">{period}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ── Sections ──────────────────────────────────────────────────────────────────

const SECTIONS: LegalSection[] = [

  {
    id: 'controller',
    titleEn: 'Identity of the Data Controller',
    titleAr: 'هوية مراقب البيانات',
    contentEn: (
      <>
        <p><strong>{P.entity}</strong> is the data controller responsible for deciding why and how your personal information is processed in connection with SDLE Compass.</p>
        <p><strong>Contact details:</strong></p>
        <ul className="list-disc ps-5 space-y-1">
          <li><strong>Business address:</strong> {P.address}</li>
          <li><strong>Privacy contact:</strong> <a href={`mailto:${P.privacyEmail}`} className="text-blue-600 hover:underline">{P.privacyEmail}</a></li>
          <li><strong>General support:</strong> <a href={`mailto:${P.supportEmail}`} className="text-blue-600 hover:underline">{P.supportEmail}</a></li>
        </ul>
        <p>If you have any questions or requests regarding your personal data, please contact our privacy team at the address above. We aim to acknowledge all privacy requests within 5 business days and respond substantively within 30 days.</p>
      </>
    ),
    contentAr: (
      <>
        <p><strong>{P.entity}</strong> هو مراقب البيانات المسؤول عن تحديد أسباب وطريقة معالجة معلوماتك الشخصية فيما يتعلق بمنصة SDLE Compass.</p>
        <p><strong>بيانات التواصل:</strong></p>
        <ul className="list-disc ps-5 space-y-1">
          <li><strong>عنوان العمل:</strong> {P.address}</li>
          <li><strong>جهة اتصال الخصوصية:</strong> <a href={`mailto:${P.privacyEmail}`} className="text-blue-600 hover:underline">{P.privacyEmail}</a></li>
          <li><strong>الدعم العام:</strong> <a href={`mailto:${P.supportEmail}`} className="text-blue-600 hover:underline">{P.supportEmail}</a></li>
        </ul>
        <p>إذا كانت لديك أي أسئلة أو طلبات تتعلق ببياناتك الشخصية، فتواصل مع فريق الخصوصية لدينا على العنوان أعلاه. نهدف إلى الإقرار بجميع طلبات الخصوصية خلال 5 أيام عمل والرد الموضوعي عليها خلال 30 يوماً.</p>
      </>
    ),
  },

  {
    id: 'scope',
    titleEn: 'Scope of This Policy',
    titleAr: 'نطاق هذه السياسة',
    contentEn: (
      <>
        <p>This Privacy Policy applies to all users of SDLE Compass — including prospective, registered, and former users — and covers all personal information processed through:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>The SDLE Compass website and any associated web applications</li>
          <li>Account registration, onboarding, and profile management</li>
          <li>Study planning, question practice, AI tutoring, and other features</li>
          <li>Customer support communications</li>
          <li>Administrator functions</li>
        </ul>
        <p>This policy does not apply to third-party websites that may be linked from our Platform. We are not responsible for the privacy practices of external sites.</p>
      </>
    ),
    contentAr: (
      <>
        <p>تسري سياسة الخصوصية هذه على جميع مستخدمي منصة SDLE Compass — بمن فيهم المستخدمون المحتملون والمسجَّلون والسابقون — وتغطي جميع المعلومات الشخصية التي تُعالَج من خلال:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>موقع SDLE Compass الإلكتروني وأي تطبيقات ويب مرتبطة به</li>
          <li>تسجيل الحساب والتهيئة الأولية وإدارة الملف الشخصي</li>
          <li>تخطيط الدراسة وممارسة الأسئلة والتعليم بالذكاء الاصطناعي والميزات الأخرى</li>
          <li>مراسلات دعم العملاء</li>
          <li>وظائف المسؤول</li>
        </ul>
        <p>لا تسري هذه السياسة على مواقع الأطراف الثالثة التي قد تُرتبط بها منصتنا. لسنا مسؤولين عن ممارسات الخصوصية للمواقع الخارجية.</p>
      </>
    ),
  },

  {
    id: 'data-categories',
    titleEn: 'Personal Data We Collect',
    titleAr: 'البيانات الشخصية التي نجمعها',
    contentEn: (
      <>
        <p>We collect only information that is reasonably necessary for the purposes described in this Policy. The categories of personal data we process include:</p>
        <p><strong>Account and profile data</strong></p>
        <ul className="list-disc ps-5 space-y-1">
          <li>Full name and email address</li>
          <li>Password (stored in hashed form; we cannot access your plain-text password)</li>
          <li>Preferred language</li>
          <li>University and graduation year (optional)</li>
          <li>Profile colour preference</li>
        </ul>
        <p><strong>Study and examination data</strong></p>
        <ul className="list-disc ps-5 space-y-1">
          <li>Examination date, target score, and study settings (optional)</li>
          <li>Weekly study availability and scheduling preferences</li>
          <li>Subject confidence ratings</li>
          <li>Question responses, practice scores, and attempt history</li>
          <li>Mock examination sessions and results</li>
          <li>Bookmarked items</li>
          <li>Personal study notes (private to you)</li>
          <li>Study plan preferences and progress</li>
          <li>Specialty and learning-style preferences</li>
        </ul>
        <p><strong>AI interaction data</strong></p>
        <ul className="list-disc ps-5 space-y-1">
          <li>Messages and questions submitted to the AI tutor</li>
          <li>AI responses received (retained for service continuity and quality)</li>
        </ul>
        <p><strong>Support and engagement data</strong></p>
        <ul className="list-disc ps-5 space-y-1">
          <li>Error reports and content-flagging actions</li>
          <li>Support messages and correspondence</li>
          <li>Notification preferences</li>
        </ul>
        <p><strong>Technical and security data</strong></p>
        <ul className="list-disc ps-5 space-y-1">
          <li>Browser type and operating system (collected automatically by Supabase authentication)</li>
          <li>Authentication and security event logs</li>
          <li>Session tokens (stored by Supabase; not accessible to Platform application code)</li>
        </ul>
        <p><strong>Legal and consent data</strong></p>
        <ul className="list-disc ps-5 space-y-1">
          <li>Record of Terms and Privacy Policy version accepted, with timestamp</li>
          <li>Marketing and optional-consent preferences</li>
        </ul>
        <p>We do not collect government identification numbers, national ID numbers, health records, payment card details (these remain with the payment provider when paid plans are introduced), or patient-identifiable clinical information.</p>
      </>
    ),
    contentAr: (
      <>
        <p>نجمع المعلومات الضرورية بشكل معقول للأغراض المبيّنة في هذه السياسة فقط. وتشمل فئات البيانات الشخصية التي نعالجها:</p>
        <p><strong>بيانات الحساب والملف الشخصي</strong></p>
        <ul className="list-disc ps-5 space-y-1">
          <li>الاسم الكامل وعنوان البريد الإلكتروني</li>
          <li>كلمة المرور (مخزَّنة بصيغة مجزّأة؛ لا يمكننا الوصول إلى كلمة مرورك بصيغتها الأصلية)</li>
          <li>اللغة المفضلة</li>
          <li>الجامعة وسنة التخرج (اختياري)</li>
          <li>تفضيل لون الملف الشخصي</li>
        </ul>
        <p><strong>بيانات الدراسة والاختبار</strong></p>
        <ul className="list-disc ps-5 space-y-1">
          <li>تاريخ الاختبار والنتيجة المستهدفة وإعدادات الدراسة (اختياري)</li>
          <li>توافر الدراسة الأسبوعي وتفضيلات الجدولة</li>
          <li>تقييمات الثقة في المواد</li>
          <li>إجابات الأسئلة ونتائج التدريب وسجل المحاولات</li>
          <li>جلسات الاختبارات التجريبية ونتائجها</li>
          <li>العناصر المحفوظة في الإشارات المرجعية</li>
          <li>الملاحظات الدراسية الشخصية (خاصة بك)</li>
          <li>تفضيلات خطة الدراسة وتقدمها</li>
          <li>تفضيلات التخصص وأسلوب التعلم</li>
        </ul>
        <p><strong>بيانات التفاعل مع الذكاء الاصطناعي</strong></p>
        <ul className="list-disc ps-5 space-y-1">
          <li>الرسائل والأسئلة المقدَّمة إلى المعلم الذكي</li>
          <li>الردود المستلمة من الذكاء الاصطناعي (يُحتفظ بها لاستمرارية الخدمة وجودتها)</li>
        </ul>
        <p><strong>بيانات الدعم والتفاعل</strong></p>
        <ul className="list-disc ps-5 space-y-1">
          <li>تقارير الأخطاء وإجراءات الإبلاغ عن المحتوى</li>
          <li>رسائل الدعم والمراسلات</li>
          <li>تفضيلات الإشعارات</li>
        </ul>
        <p><strong>البيانات التقنية والأمنية</strong></p>
        <ul className="list-disc ps-5 space-y-1">
          <li>نوع المتصفح ونظام التشغيل (يُجمع تلقائياً بواسطة مصادقة Supabase)</li>
          <li>سجلات أحداث المصادقة والأمان</li>
          <li>رموز الجلسات (تخزّنها Supabase؛ لا يمكن لكود تطبيق المنصة الوصول إليها)</li>
        </ul>
        <p><strong>البيانات القانونية وبيانات الموافقة</strong></p>
        <ul className="list-disc ps-5 space-y-1">
          <li>سجل إصدار الشروط وسياسة الخصوصية المقبول، مع الطابع الزمني</li>
          <li>تفضيلات التسويق والموافقات الاختيارية</li>
        </ul>
        <p>لا نجمع أرقام الهوية الوطنية أو الهويات الحكومية أو السجلات الصحية أو تفاصيل بطاقات الدفع (التي تبقى لدى مزوّد الدفع عند تقديم الخطط المدفوعة) أو المعلومات السريرية التي تعرّف بهوية المرضى.</p>
      </>
    ),
  },

  {
    id: 'purposes',
    titleEn: 'Purposes and Legal Basis for Processing',
    titleAr: 'أغراض المعالجة وأساسها القانوني',
    contentEn: (
      <>
        <p>We process your personal data for the following purposes. Under the Saudi Personal Data Protection Law (PDPL) and its Implementing Regulations, processing must be based on one or more lawful grounds.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-200 px-3 py-2 text-start font-semibold">Purpose</th>
                <th className="border border-slate-200 px-3 py-2 text-start font-semibold">Data used</th>
                <th className="border border-slate-200 px-3 py-2 text-start font-semibold">Lawful ground</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                ['Account creation and authentication', 'Name, email, password hash, language', 'Contractual necessity'],
                ['Onboarding and study-plan generation', 'Exam settings, availability, preferences', 'Contractual necessity'],
                ['Delivering practice questions and mock exams', 'Question responses, scores', 'Contractual necessity'],
                ['AI tutoring assistance', 'AI chat messages, context from study data', 'Contractual necessity; consent for optional sessions'],
                ['Progress tracking and analytics', 'Scores, accuracy, time data', 'Contractual necessity'],
                ['Security and fraud prevention', 'Session logs, IP data, device data', 'Legitimate interest / legal obligation'],
                ['Legal compliance and consent records', 'Acceptance records, timestamps', 'Legal obligation'],
                ['Customer support', 'Name, email, correspondence', 'Contractual necessity / legitimate interest'],
                ['Optional marketing (if consented)', 'Email, language preference', 'Consent (separate, optional, withdrawable)'],
                ['Billing and subscription management (future)', 'Email, payment reference', 'Contractual necessity / legal obligation'],
              ].map(([purpose, data, basis]) => (
                <tr key={purpose} className="even:bg-slate-50/50">
                  <td className="border border-slate-200 px-3 py-2">{purpose}</td>
                  <td className="border border-slate-200 px-3 py-2">{data}</td>
                  <td className="border border-slate-200 px-3 py-2">{basis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3"><em>We do not rely on a single blanket consent for all processing. We obtain separate consent where required by law and where you have a meaningful choice.</em></p>
      </>
    ),
    contentAr: (
      <>
        <p>نعالج بياناتك الشخصية للأغراض التالية. بموجب نظام حماية البيانات الشخصية (PDPL) ولوائحه التنفيذية، يجب أن تستند المعالجة إلى أحد الأسس القانونية المشروعة أو أكثر.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-200 px-3 py-2 text-start font-semibold">الغرض</th>
                <th className="border border-slate-200 px-3 py-2 text-start font-semibold">البيانات المستخدمة</th>
                <th className="border border-slate-200 px-3 py-2 text-start font-semibold">الأساس القانوني</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                ['إنشاء الحساب والمصادقة', 'الاسم والبريد الإلكتروني وبصمة كلمة المرور واللغة', 'الضرورة التعاقدية'],
                ['التهيئة الأولية وإنشاء خطة الدراسة', 'إعدادات الاختبار والتوافر والتفضيلات', 'الضرورة التعاقدية'],
                ['تقديم الأسئلة التدريبية والاختبارات التجريبية', 'إجابات الأسئلة والنتائج', 'الضرورة التعاقدية'],
                ['المساعدة التعليمية بالذكاء الاصطناعي', 'رسائل محادثة الذكاء الاصطناعي وسياق بيانات الدراسة', 'الضرورة التعاقدية؛ الموافقة للجلسات الاختيارية'],
                ['تتبع التقدم والتحليلات', 'النتائج والدقة وبيانات الوقت', 'الضرورة التعاقدية'],
                ['الأمان والوقاية من الاحتيال', 'سجلات الجلسة وبيانات IP والجهاز', 'المصلحة المشروعة / الالتزام القانوني'],
                ['الامتثال القانوني وسجلات الموافقة', 'سجلات القبول والطوابع الزمنية', 'الالتزام القانوني'],
                ['دعم العملاء', 'الاسم والبريد الإلكتروني والمراسلات', 'الضرورة التعاقدية / المصلحة المشروعة'],
                ['التسويق الاختياري (إذا وافقت)', 'البريد الإلكتروني وتفضيل اللغة', 'الموافقة (منفصلة واختيارية وقابلة للسحب)'],
                ['الفوترة وإدارة الاشتراك (مستقبلياً)', 'البريد الإلكتروني ومرجع الدفع', 'الضرورة التعاقدية / الالتزام القانوني'],
              ].map(([purpose, data, basis]) => (
                <tr key={purpose} className="even:bg-slate-50/50">
                  <td className="border border-slate-200 px-3 py-2">{purpose}</td>
                  <td className="border border-slate-200 px-3 py-2">{data}</td>
                  <td className="border border-slate-200 px-3 py-2">{basis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3"><em>لا نعتمد على موافقة شاملة واحدة لجميع عمليات المعالجة. نحصل على موافقة منفصلة حيثما يُوجبه القانون وحيثما يكون لديك خيار حقيقي.</em></p>
      </>
    ),
  },

  {
    id: 'ai-processing',
    titleEn: 'AI Processing and Data',
    titleAr: 'معالجة بيانات الذكاء الاصطناعي',
    contentEn: (
      <>
        <p>The AI tutor feature sends the content of your submitted messages and relevant study context (such as the topic being studied) to our AI service provider, Anthropic, to generate responses.</p>
        <ul className="list-disc ps-5 space-y-1">
          <li><strong>What is sent:</strong> Your message text and relevant educational context, not your full account profile</li>
          <li><strong>Retention:</strong> AI conversation history is retained on our servers for up to 90 days (rolling). You may request earlier deletion</li>
          <li><strong>Provider:</strong> Anthropic, PBC (United States). Subject to Anthropic's API usage policies and privacy terms</li>
          <li><strong>Model training:</strong> API submissions to Anthropic are not used to train AI models by default under Anthropic's standard API terms. Please refer to Anthropic's current privacy documentation for the definitive position</li>
          <li><strong>Cross-border transfer:</strong> Data processed by Anthropic may be handled on servers outside Saudi Arabia. See Section&nbsp;9</li>
        </ul>
        <p>Do not enter patient data, government ID numbers, confidential examination questions, or sensitive third-party information into the AI chat. Such data is not necessary to use the feature and creates unnecessary privacy risk.</p>
      </>
    ),
    contentAr: (
      <>
        <p>ترسل ميزة المعلم الذكي محتوى الرسائل التي ترسلها والسياق الدراسي ذي الصلة (مثل الموضوع الذي تدرسه) إلى مزوّد خدمة الذكاء الاصطناعي لدينا، شركة Anthropic، لتوليد الردود.</p>
        <ul className="list-disc ps-5 space-y-1">
          <li><strong>ما يُرسَل:</strong> نص رسالتك والسياق التعليمي ذو الصلة، وليس ملفك الشخصي الكامل</li>
          <li><strong>الاحتفاظ:</strong> يُحتفظ بسجل محادثات الذكاء الاصطناعي على خوادمنا لمدة تصل إلى 90 يوماً (متجددة). يمكنك طلب الحذف المبكر</li>
          <li><strong>المزوّد:</strong> Anthropic, PBC (الولايات المتحدة). يخضع لسياسات استخدام واجهة برمجة التطبيقات وشروط الخصوصية الخاصة بـ Anthropic</li>
          <li><strong>تدريب النماذج:</strong> لا تُستخدَم طلبات واجهة برمجة التطبيقات المقدَّمة إلى Anthropic لتدريب نماذج الذكاء الاصطناعي بصورة افتراضية وفقاً للشروط القياسية لواجهة برمجة التطبيقات. يُرجى الرجوع إلى وثائق خصوصية Anthropic الحالية للموقف الدقيق</li>
          <li><strong>النقل العابر للحدود:</strong> قد تُعالَج البيانات التي تتولى Anthropic معالجتها على خوادم خارج المملكة العربية السعودية. راجع البند 9</li>
        </ul>
        <p>لا تدخل بيانات المرضى أو أرقام الهوية الحكومية أو أسئلة الاختبار السرية أو المعلومات الحساسة لأطراف ثالثة في محادثة الذكاء الاصطناعي. هذه البيانات غير ضرورية لاستخدام الميزة وتُشكّل خطراً غير ضروري على الخصوصية.</p>
      </>
    ),
  },

  {
    id: 'third-parties',
    titleEn: 'Third-Party Service Providers',
    titleAr: 'مزوّدو خدمات الأطراف الثالثة',
    contentEn: (
      <>
        <p>We share personal data only with service providers that are necessary to operate the Platform. We do not sell your personal data to advertisers or data brokers.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-200 px-3 py-2 text-start font-semibold">Provider</th>
                <th className="border border-slate-200 px-3 py-2 text-start font-semibold">Role</th>
                <th className="border border-slate-200 px-3 py-2 text-start font-semibold">Data shared</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                ['Supabase (Supabase Inc., USA)', 'Authentication, database, storage, edge functions', 'All personal data stored on Platform'],
                ['Anthropic, PBC (USA)', 'AI language model (Claude)', 'AI chat messages and study context'],
                ['[PAYMENT PROVIDER — to be configured]', 'Payment processing (future)', 'Email, payment reference; card details handled directly by provider'],
                ['[EMAIL PROVIDER — to be configured]', 'Transactional emails (future)', 'Email address, name'],
              ].map(([provider, role, data]) => (
                <tr key={provider} className="even:bg-slate-50/50">
                  <td className="border border-slate-200 px-3 py-2 font-medium">{provider}</td>
                  <td className="border border-slate-200 px-3 py-2">{role}</td>
                  <td className="border border-slate-200 px-3 py-2">{data}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3">We do not currently use advertising networks, social-media tracking pixels, or behavioural analytics providers. This table will be updated if additional providers are engaged.</p>
      </>
    ),
    contentAr: (
      <>
        <p>لا نشارك البيانات الشخصية إلا مع مزوّدي الخدمات الضروريين لتشغيل المنصة. نحن لا نبيع بياناتك الشخصية للمعلنين أو وسطاء البيانات.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-200 px-3 py-2 text-start font-semibold">المزوّد</th>
                <th className="border border-slate-200 px-3 py-2 text-start font-semibold">الدور</th>
                <th className="border border-slate-200 px-3 py-2 text-start font-semibold">البيانات المشتركة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                ['Supabase (شركة Supabase Inc.، الولايات المتحدة)', 'المصادقة وقاعدة البيانات والتخزين والوظائف الحافة', 'جميع البيانات الشخصية المخزَّنة على المنصة'],
                ['Anthropic, PBC (الولايات المتحدة)', 'نموذج اللغة بالذكاء الاصطناعي (Claude)', 'رسائل محادثة الذكاء الاصطناعي والسياق الدراسي'],
                ['[مزوّد الدفع — يُحدَّد لاحقاً]', 'معالجة الدفع (مستقبلياً)', 'البريد الإلكتروني ومرجع الدفع؛ يتعامل المزوّد مباشرةً مع تفاصيل البطاقة'],
                ['[مزوّد البريد الإلكتروني — يُحدَّد لاحقاً]', 'رسائل البريد الإلكتروني الخدمية (مستقبلياً)', 'عنوان البريد الإلكتروني والاسم'],
              ].map(([provider, role, data]) => (
                <tr key={provider} className="even:bg-slate-50/50">
                  <td className="border border-slate-200 px-3 py-2 font-medium">{provider}</td>
                  <td className="border border-slate-200 px-3 py-2">{role}</td>
                  <td className="border border-slate-200 px-3 py-2">{data}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3">لا نستخدم حالياً شبكات إعلانية أو بكسلات تتبع وسائل التواصل الاجتماعي أو مزوّدي التحليلات السلوكية. سيُحدَّث هذا الجدول إذا تم التعاقد مع مزوّدين إضافيين.</p>
      </>
    ),
  },

  {
    id: 'transfers',
    titleEn: 'International Data Transfers',
    titleAr: 'النقل الدولي للبيانات',
    contentEn: (
      <>
        <p>Your personal data is stored and processed by Supabase, whose infrastructure may be located outside Saudi Arabia (including the United States and European Union regions). AI interactions are processed by Anthropic, based in the United States.</p>
        <p>These international transfers are necessary to provide the service. Where we transfer personal data outside Saudi Arabia, we take steps to ensure that appropriate contractual, technical, and organisational safeguards are in place, in accordance with the Saudi PDPL and its Implementing Regulations.</p>
        <p>For more information about the safeguards applicable to international transfers, or to request relevant documentation, please contact us at <a href={`mailto:${P.privacyEmail}`} className="text-blue-600 hover:underline">{P.privacyEmail}</a>.</p>
        <p><em>Note to administrator: The transfer mechanisms and specific server regions for Supabase and Anthropic should be verified and described in more detail before publication.</em></p>
      </>
    ),
    contentAr: (
      <>
        <p>تُخزَّن بياناتك الشخصية وتُعالَج من قِبل Supabase، التي قد تقع بنيتها التحتية خارج المملكة العربية السعودية (بما في ذلك مناطق في الولايات المتحدة والاتحاد الأوروبي). تُعالَج تفاعلات الذكاء الاصطناعي من قِبل Anthropic المتخذة من الولايات المتحدة مقراً لها.</p>
        <p>يُعدّ هذا النقل الدولي ضرورياً لتقديم الخدمة. عند نقل البيانات الشخصية خارج المملكة العربية السعودية، نتخذ خطوات للتأكد من وجود ضمانات تعاقدية وتقنية وتنظيمية مناسبة، وفقاً لنظام حماية البيانات الشخصية (PDPL) ولوائحه التنفيذية.</p>
        <p>للحصول على مزيد من المعلومات حول الضمانات المطبَّقة على النقل الدولي، أو لطلب الوثائق ذات الصلة، تواصل معنا على <a href={`mailto:${P.privacyEmail}`} className="text-blue-600 hover:underline">{P.privacyEmail}</a>.</p>
        <p><em>ملاحظة للمسؤول: يجب التحقق من آليات النقل والمناطق الجغرافية المحددة لخوادم Supabase وAnthropic وإضافة تفاصيل أكثر قبل النشر.</em></p>
      </>
    ),
  },

  {
    id: 'retention',
    titleEn: 'Data Retention',
    titleAr: 'الاحتفاظ بالبيانات',
    contentEn: (
      <>
        <p>We retain personal data only for as long as necessary for the purposes for which it was collected or as required by applicable law.</p>
        {RETENTION_TABLE}
        <p className="mt-3">When the retention period expires, data is securely deleted or anonymised. Note that anonymised or aggregated data that cannot be linked back to any individual is no longer personal data and may be retained for platform-improvement purposes.</p>
      </>
    ),
    contentAr: (
      <>
        <p>نحتفظ بالبيانات الشخصية فقط طوال المدة الضرورية للأغراض التي جُمعت من أجلها أو ما يقتضيه القانون المعمول به.</p>
        {RETENTION_TABLE_AR}
        <p className="mt-3">عند انتهاء فترة الاحتفاظ، تُحذف البيانات بشكل آمن أو تُزال هويتها. تجدر الإشارة إلى أن البيانات المجهولة أو المجمَّعة التي لا يمكن ربطها بأي فرد لم تعد بيانات شخصية، ويجوز الاحتفاظ بها لأغراض تحسين المنصة.</p>
      </>
    ),
  },

  {
    id: 'rights',
    titleEn: 'Your Data Rights',
    titleAr: 'حقوقك المتعلقة بالبيانات',
    contentEn: (
      <>
        <p>Under the Saudi Personal Data Protection Law and its Implementing Regulations, you have the following rights regarding your personal data:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li><strong>Right to be informed:</strong> To know what personal data we hold about you and how we use it (this Policy provides that information)</li>
          <li><strong>Right of access:</strong> To request confirmation that we process your data and to receive a copy</li>
          <li><strong>Right to correction:</strong> To request that inaccurate or incomplete data be corrected. You can update most profile information directly through your account settings</li>
          <li><strong>Right to destruction:</strong> To request deletion of your personal data where we no longer have a lawful basis to retain it, subject to legal obligations and legitimate operational needs</li>
          <li><strong>Right to withdraw consent:</strong> Where processing is based on your consent, you may withdraw it at any time without affecting the lawfulness of prior processing</li>
          <li><strong>Right to object:</strong> Where processing is based on legitimate interest, you may object. We will assess your objection and respond</li>
        </ul>
        <p>To exercise any of these rights, email <a href={`mailto:${P.privacyEmail}`} className="text-blue-600 hover:underline">{P.privacyEmail}</a>. We will acknowledge your request within 5 business days and respond within 30 days. In complex cases, we may request verification of your identity before acting.</p>
        <p>If you believe we have not handled your data properly, you may contact us first to resolve the matter. You also have the right to submit a complaint to the competent authority in Saudi Arabia responsible for data protection. <em>(Administrator note: Identify and name the current competent authority under the PDPL before publication.)</em></p>
      </>
    ),
    contentAr: (
      <>
        <p>بموجب نظام حماية البيانات الشخصية ولوائحه التنفيذية في المملكة العربية السعودية، تتمتع بالحقوق التالية فيما يتعلق ببياناتك الشخصية:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li><strong>الحق في الإحاطة:</strong> معرفة البيانات الشخصية التي نحتفظ بها عنك وكيفية استخدامنا لها (تُوفّر هذه السياسة تلك المعلومات)</li>
          <li><strong>حق الوصول:</strong> طلب التأكد من معالجتنا لبياناتك والحصول على نسخة منها</li>
          <li><strong>حق التصحيح:</strong> طلب تصحيح البيانات غير الدقيقة أو غير المكتملة. يمكنك تحديث معظم معلومات الملف الشخصي مباشرةً من خلال إعدادات حسابك</li>
          <li><strong>حق الإتلاف:</strong> طلب حذف بياناتك الشخصية حين لا يكون لدينا أساس قانوني للاحتفاظ بها، مع مراعاة الالتزامات القانونية والاحتياجات التشغيلية المشروعة</li>
          <li><strong>حق سحب الموافقة:</strong> حيثما تستند المعالجة إلى موافقتك، يجوز لك سحبها في أي وقت دون أن يمس ذلك مشروعية المعالجة السابقة</li>
          <li><strong>حق الاعتراض:</strong> حيثما تستند المعالجة إلى مصلحة مشروعة، يجوز لك الاعتراض. سنقيّم اعتراضك ونردّ عليه</li>
        </ul>
        <p>لممارسة أي من هذه الحقوق، راسلنا على <a href={`mailto:${P.privacyEmail}`} className="text-blue-600 hover:underline">{P.privacyEmail}</a>. سنُقرّ بطلبك خلال 5 أيام عمل ونردّ خلال 30 يوماً. وفي الحالات المعقدة، قد نطلب التحقق من هويتك قبل اتخاذ أي إجراء.</p>
        <p>إذا رأيت أننا لم نتعامل مع بياناتك بالشكل الصحيح، فتواصل معنا أولاً لحل الأمر. كما يحق لك تقديم شكوى إلى الجهة المختصة في المملكة العربية السعودية المعنية بحماية البيانات. <em>(ملاحظة للمسؤول: حدّد اسم الجهة المختصة الحالية بموجب نظام حماية البيانات الشخصية قبل النشر.)</em></p>
      </>
    ),
  },

  {
    id: 'deletion',
    titleEn: 'Account Deletion',
    titleAr: 'حذف الحساب',
    contentEn: (
      <>
        <p>You may request deletion of your account at any time from your account settings or by emailing <a href={`mailto:${P.supportEmail}`} className="text-blue-600 hover:underline">{P.supportEmail}</a>.</p>
        <p>Upon account deletion:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>Your profile, study records, notes, bookmarks, AI chat history, and question responses will be deleted from primary storage</li>
          <li>Deletion from backup copies may take up to 90 days</li>
          <li>Legal-obligation records (consent records, tax records) are retained for the periods set out in Section&nbsp;10</li>
          <li>Security logs are retained for 12 months from the relevant event date</li>
          <li>Anonymised or aggregated data derived from your activity may be retained</li>
        </ul>
        <p>Before deletion is finalised, you may request a copy of your personal data in a machine-readable format. <strong>Account deletion and subscription cancellation are separate actions.</strong> If you hold an active paid subscription, cancel your subscription first; account deletion does not automatically stop renewal charges.</p>
      </>
    ),
    contentAr: (
      <>
        <p>يمكنك طلب حذف حسابك في أي وقت من إعدادات الحساب أو بإرسال بريد إلكتروني إلى <a href={`mailto:${P.supportEmail}`} className="text-blue-600 hover:underline">{P.supportEmail}</a>.</p>
        <p>عند حذف الحساب:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>سيُحذف ملفك الشخصي وسجلات دراستك وملاحظاتك وإشاراتك المرجعية وسجل محادثات الذكاء الاصطناعي وإجابات الأسئلة من التخزين الأساسي</li>
          <li>قد يستغرق الحذف من النسخ الاحتياطية ما يصل إلى 90 يوماً</li>
          <li>يُحتفظ بسجلات الالتزام القانوني (سجلات الموافقة والسجلات الضريبية) للفترات المبيّنة في البند 10</li>
          <li>يُحتفظ بسجلات الأمان لمدة 12 شهراً من تاريخ الحدث ذي الصلة</li>
          <li>يجوز الاحتفاظ بالبيانات المجهولة أو المجمَّعة المستخلصة من نشاطك</li>
        </ul>
        <p>قبل اكتمال الحذف، يمكنك طلب نسخة من بياناتك الشخصية بتنسيق قابل للقراءة آلياً. <strong>حذف الحساب وإلغاء الاشتراك إجراءان منفصلان.</strong> إذا كان لديك اشتراك مدفوع نشط، فألغِ اشتراكك أولاً؛ إذ لا يوقف حذف الحساب تلقائياً رسوم التجديد.</p>
      </>
    ),
  },

  {
    id: 'security',
    titleEn: 'Security',
    titleAr: 'الأمان',
    contentEn: (
      <>
        <p>We implement reasonable administrative, organisational, and technical safeguards to protect your personal data, including:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>Encrypted data transmission (HTTPS/TLS) for all Platform connections</li>
          <li>Password hashing using Supabase's secure authentication system</li>
          <li>Row-level security policies enforcing per-user data isolation in the database</li>
          <li>Role-based access controls limiting staff access to the data they need</li>
          <li>Access logging for administrator actions</li>
          <li>Supabase infrastructure security including database encryption at rest</li>
        </ul>
        <p>No system is completely immune from risk. We cannot guarantee absolute security against all threats. If you believe your account has been compromised, notify us immediately at <a href={`mailto:${P.supportEmail}`} className="text-blue-600 hover:underline">{P.supportEmail}</a>.</p>
      </>
    ),
    contentAr: (
      <>
        <p>نُطبّق ضمانات إدارية وتنظيمية وتقنية معقولة لحماية بياناتك الشخصية، تشمل:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>تشفير نقل البيانات (HTTPS/TLS) لجميع اتصالات المنصة</li>
          <li>تجزئة كلمات المرور باستخدام نظام المصادقة الآمن من Supabase</li>
          <li>سياسات أمان على مستوى الصف تُطبّق عزل البيانات لكل مستخدم في قاعدة البيانات</li>
          <li>ضوابط الوصول المستندة إلى الأدوار للحدّ من وصول الموظفين إلى البيانات التي يحتاجونها فعلاً</li>
          <li>تسجيل وصول المسؤولين وإجراءاتهم</li>
          <li>أمان بنية Supabase التحتية بما يشمل تشفير قاعدة البيانات في حالة السكون</li>
        </ul>
        <p>لا يوجد نظام محصّن تماماً من المخاطر. لا يمكننا ضمان الحماية المطلقة من جميع التهديدات. إذا رأيت أن حسابك قد تعرّض للاختراق، فأخطرنا فوراً على <a href={`mailto:${P.supportEmail}`} className="text-blue-600 hover:underline">{P.supportEmail}</a>.</p>
      </>
    ),
  },

  {
    id: 'breaches',
    titleEn: 'Data Breaches',
    titleAr: 'اختراقات البيانات',
    contentEn: (
      <>
        <p>If we become aware of a personal data breach that poses a risk to individuals, we will:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>Investigate and contain the incident promptly</li>
          <li>Assess the nature, scope, and likely impact of the breach</li>
          <li>Notify the competent Saudi authority as required by the PDPL and its Implementing Regulations</li>
          <li>Notify affected users where required or where we determine it is in their interest to be informed</li>
          <li>Take reasonable steps to remediate the cause</li>
        </ul>
        <p>To report a suspected security incident, contact <a href={`mailto:${P.supportEmail}`} className="text-blue-600 hover:underline">{P.supportEmail}</a> and mark your message as urgent.</p>
      </>
    ),
    contentAr: (
      <>
        <p>إذا علمنا باختراق بيانات شخصية يُشكّل خطراً على الأفراد، فسنقوم بما يلي:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>التحقيق في الحادثة واحتوائها بسرعة</li>
          <li>تقييم طبيعة الاختراق ونطاقه وتأثيره المحتمل</li>
          <li>إخطار الجهة السعودية المختصة وفقاً لما يُوجبه نظام حماية البيانات الشخصية ولوائحه التنفيذية</li>
          <li>إخطار المستخدمين المتضررين حيثما يُوجبه ذلك أو نرى فيه مصلحة لهم</li>
          <li>اتخاذ خطوات معقولة لمعالجة السبب</li>
        </ul>
        <p>للإبلاغ عن حادثة أمنية مشتبه بها، تواصل مع <a href={`mailto:${P.supportEmail}`} className="text-blue-600 hover:underline">{P.supportEmail}</a> مع الإشارة إلى أن رسالتك عاجلة.</p>
      </>
    ),
  },

  {
    id: 'cookies',
    titleEn: 'Cookies and Local Storage',
    titleAr: 'ملفات تعريف الارتباط والتخزين المحلي',
    contentEn: (
      <>
        <p>The Platform uses the following types of browser storage:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li><strong>Authentication storage (essential):</strong> Supabase sets session tokens in localStorage or cookies to keep you logged in. These are essential for the Platform to function and cannot be disabled without breaking authentication</li>
          <li><strong>Preference storage (essential):</strong> Your language preference is stored in localStorage (<code>sdle-lang</code>) to remember your choice between sessions</li>
          <li><strong>Consent storage (essential):</strong> Pending consent information may be stored temporarily in localStorage during the email-confirmation flow</li>
        </ul>
        <p>We do not currently use:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>Third-party advertising or tracking cookies</li>
          <li>Analytics cookies (such as Google Analytics)</li>
          <li>Social-media tracking pixels</li>
        </ul>
        <p>If optional analytics or advertising cookies are introduced in the future, we will update this Policy, implement a consent mechanism, and not activate them until you have made a meaningful choice to accept or decline.</p>
      </>
    ),
    contentAr: (
      <>
        <p>تستخدم المنصة أنواع التخزين التالية في المتصفح:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li><strong>تخزين المصادقة (ضروري):</strong> تضع Supabase رموز الجلسة في التخزين المحلي (localStorage) أو ملفات تعريف الارتباط للحفاظ على تسجيل دخولك. وهذه ضرورية لعمل المنصة ولا يمكن تعطيلها دون تعطيل المصادقة</li>
          <li><strong>تخزين التفضيلات (ضروري):</strong> يُخزَّن تفضيل اللغة في التخزين المحلي (<code>sdle-lang</code>) للتذكر بين الجلسات</li>
          <li><strong>تخزين الموافقة (ضروري):</strong> قد تُخزَّن معلومات الموافقة المعلَّقة مؤقتاً في التخزين المحلي أثناء عملية تأكيد البريد الإلكتروني</li>
        </ul>
        <p>لا نستخدم حالياً:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>ملفات تعريف ارتباط الإعلانات أو التتبع من أطراف ثالثة</li>
          <li>ملفات تعريف ارتباط التحليلات (مثل Google Analytics)</li>
          <li>بكسلات تتبع وسائل التواصل الاجتماعي</li>
        </ul>
        <p>إذا قُدِّمت في المستقبل ملفات تعريف ارتباط اختيارية للتحليلات أو الإعلانات، فسنُحدّث هذه السياسة وننفّذ آلية موافقة، ولن نُفعّلها حتى يتسنى لك الاختيار بشكل حقيقي بين القبول والرفض.</p>
      </>
    ),
  },

  {
    id: 'children',
    titleEn: 'Age Restrictions',
    titleAr: 'قيود السن',
    contentEn: (
      <>
        <p>The Platform is intended for users who are at least 18 years old. We do not knowingly collect personal data from persons under 18. If we discover that a person under the minimum age has registered, we will take appropriate steps to delete the account and associated data.</p>
        <p>If you believe that a minor has created an account on the Platform, please notify us at <a href={`mailto:${P.privacyEmail}`} className="text-blue-600 hover:underline">{P.privacyEmail}</a>.</p>
      </>
    ),
    contentAr: (
      <>
        <p>المنصة مخصصة للمستخدمين الذين يبلغون من العمر 18 عاماً على الأقل. لا نجمع بيانات شخصية بصورة متعمدة من أشخاص دون سن 18 عاماً. إذا اكتشفنا أن شخصاً دون الحد الأدنى للسن قد سجّل حساباً، فسنتخذ الخطوات المناسبة لحذف الحساب والبيانات المرتبطة به.</p>
        <p>إذا رأيت أن قاصراً قد أنشأ حساباً على المنصة، فأخطرنا على <a href={`mailto:${P.privacyEmail}`} className="text-blue-600 hover:underline">{P.privacyEmail}</a>.</p>
      </>
    ),
  },

  {
    id: 'policy-changes',
    titleEn: 'Changes to This Privacy Policy',
    titleAr: 'تعديلات على سياسة الخصوصية',
    contentEn: (
      <>
        <p>We may update this Privacy Policy to reflect changes in our practices, technology, or applicable law. The document is versioned and each version carries its effective date.</p>
        <p>For minor changes (format, contact updates, clarifications that do not affect your rights), we will update this Policy and notify registered users in-platform.</p>
        <p>For material changes (new categories of data collected, new purposes, new sharing categories, changes to retention periods, changes to your rights), we will provide at least 30 days' advance notice where legally required or practicable, and will obtain renewed consent where the law requires it.</p>
        <p>Previous versions of this Policy are available upon request by emailing <a href={`mailto:${P.privacyEmail}`} className="text-blue-600 hover:underline">{P.privacyEmail}</a>.</p>
      </>
    ),
    contentAr: (
      <>
        <p>يجوز لنا تحديث سياسة الخصوصية هذه لتعكس التغييرات في ممارساتنا أو تقنياتنا أو القانون المعمول به. الوثيقة مُرقَّمة بإصدارات وتحمل كل نسخة تاريخ نفاذها.</p>
        <p>للتغييرات الطفيفة (التنسيق وتحديثات بيانات التواصل والتوضيحات التي لا تؤثر في حقوقك)، سنُحدّث هذه السياسة ونُخطر المستخدمين المسجّلين من داخل المنصة.</p>
        <p>للتغييرات الجوهرية (فئات بيانات جديدة تُجمَع، أو أغراض جديدة، أو فئات مشاركة جديدة، أو تغييرات في فترات الاحتفاظ، أو تغييرات في حقوقك)، سنقدّم إشعاراً مسبقاً لا يقل عن 30 يوماً حيثما يُوجبه القانون أو يكون ذلك عملياً، وسنستأذن موافقة متجددة حيثما يشترط ذلك القانون.</p>
        <p>تتوفر الإصدارات السابقة لهذه السياسة عند الطلب بإرسال بريد إلكتروني إلى <a href={`mailto:${P.privacyEmail}`} className="text-blue-600 hover:underline">{P.privacyEmail}</a>.</p>
      </>
    ),
  },

  {
    id: 'contact',
    titleEn: 'Privacy Contact and Complaints',
    titleAr: 'التواصل بشأن الخصوصية والشكاوى',
    contentEn: (
      <>
        <p>For all privacy-related inquiries, requests, or complaints:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li><strong>Privacy contact email:</strong> <a href={`mailto:${P.privacyEmail}`} className="text-blue-600 hover:underline">{P.privacyEmail}</a></li>
          <li><strong>Postal address:</strong> {P.address}</li>
          <li><strong>General support:</strong> <a href={`mailto:${P.supportEmail}`} className="text-blue-600 hover:underline">{P.supportEmail}</a></li>
        </ul>
        <p>We will acknowledge your inquiry within 5 business days and respond substantively within 30 days. If we are unable to resolve your concern, you may escalate your complaint to the competent Saudi authority responsible for personal data protection. <em>(Administrator: Identify and name the current competent authority before publication.)</em></p>
      </>
    ),
    contentAr: (
      <>
        <p>لجميع استفسارات الخصوصية وطلباتها وشكاواها:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li><strong>البريد الإلكتروني لجهة اتصال الخصوصية:</strong> <a href={`mailto:${P.privacyEmail}`} className="text-blue-600 hover:underline">{P.privacyEmail}</a></li>
          <li><strong>العنوان البريدي:</strong> {P.address}</li>
          <li><strong>الدعم العام:</strong> <a href={`mailto:${P.supportEmail}`} className="text-blue-600 hover:underline">{P.supportEmail}</a></li>
        </ul>
        <p>سنُقرّ باستفسارك خلال 5 أيام عمل ونردّ موضوعياً في غضون 30 يوماً. إذا تعذّر علينا حل مشكلتك، فيمكنك تصعيد شكواك إلى الجهة السعودية المختصة المعنية بحماية البيانات الشخصية. <em>(ملاحظة للمسؤول: حدّد اسم الجهة المختصة الحالية قبل النشر.)</em></p>
      </>
    ),
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function PrivacyPolicy() {
  const summaryEn = (
    <>
      <p><strong>We collect only what we need</strong> to provide your study preparation experience — your name, email, study preferences, practice data, and AI interactions.</p>
      <p><strong>We do not sell your data</strong> to advertisers. We share it only with service providers who help us operate the Platform (Supabase for infrastructure, Anthropic for AI).</p>
      <p><strong>Your study notes are private.</strong> Only you can see them.</p>
      <p>You have rights to access, correct, and request deletion of your data. Email <a href={`mailto:${P.privacyEmail}`} className="text-blue-600 hover:underline">{P.privacyEmail}</a>.</p>
    </>
  );
  const summaryAr = (
    <>
      <p><strong>نجمع ما نحتاجه فقط</strong> لتوفير تجربة التحضير الدراسي — اسمك وبريدك الإلكتروني وتفضيلاتك الدراسية وبيانات التدريب وتفاعلاتك مع الذكاء الاصطناعي.</p>
      <p><strong>لا نبيع بياناتك</strong> للمعلنين. نشاركها فقط مع مزوّدي الخدمات الذين يساعدوننا في تشغيل المنصة (Supabase للبنية التحتية، وAnthropic للذكاء الاصطناعي).</p>
      <p><strong>ملاحظاتك الدراسية خاصة.</strong> أنت وحدك من يمكنه الاطلاع عليها.</p>
      <p>لديك حق الوصول إلى بياناتك وتصحيحها وطلب حذفها. راسلنا على <a href={`mailto:${P.privacyEmail}`} className="text-blue-600 hover:underline">{P.privacyEmail}</a>.</p>
    </>
  );

  return (
    <LegalLayout
      titleEn="Privacy Policy"
      titleAr="سياسة الخصوصية"
      version={VERSION}
      effectiveDate={EFFECTIVE_DATE}
      lastUpdated={LAST_UPDATED}
      summaryEn={summaryEn}
      summaryAr={summaryAr}
      sections={SECTIONS}
      isAiDraft
    />
  );
}
