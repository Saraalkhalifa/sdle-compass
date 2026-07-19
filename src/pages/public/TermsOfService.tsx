import React from 'react';
import { Link } from 'react-router-dom';
import { LegalLayout, LegalSection } from '@/components/ui/LegalLayout';
import { APP_CONFIG, ROUTES } from '@/config/app';

// ── Placeholders requiring administrator input ────────────────────────────────
// Before publishing, replace every value marked [PLACEHOLDER] with verified information.
// Do not publish this document with unresolved placeholders.
const P = {
  entity:          '[LEGAL ENTITY OR OWNER NAME]',
  cr:              '[COMMERCIAL REGISTRATION NUMBER, IF APPLICABLE]',
  address:         '[BUSINESS ADDRESS, KINGDOM OF SAUDI ARABIA]',
  legalEmail:      '[LEGAL CONTACT EMAIL]',
  privacyEmail:    '[PRIVACY CONTACT EMAIL]',
  supportEmail:    APP_CONFIG.supportEmail,
  effectiveDate:   '[EFFECTIVE DATE — TO BE SET UPON PUBLICATION]',
  paymentProvider: '[PAYMENT PROVIDER NAME]',
};

const EFFECTIVE_DATE = P.effectiveDate;
const LAST_UPDATED   = P.effectiveDate;
const VERSION        = '1.0';

// ── Section content ───────────────────────────────────────────────────────────

const SECTIONS: LegalSection[] = [

  // 1
  {
    id: 'introduction',
    titleEn: 'Introduction and Agreement',
    titleAr: 'المقدمة والاتفاقية',
    contentEn: (
      <>
        <p>SDLE Compass ("<strong>the Platform</strong>", "<strong>we</strong>", "<strong>us</strong>") is an independent educational preparation service operated by {P.entity}, a business established in the Kingdom of Saudi Arabia.</p>
        <p>These Terms of Service ("<strong>Terms</strong>") govern your access to and use of the Platform, including all features, content, and functionality made available through the website and any associated applications. By creating an account or using the Platform, you agree to be bound by these Terms and our <Link to={ROUTES.privacy} className="text-blue-600 hover:underline">Privacy Policy</Link>. If you do not agree, do not use the Platform.</p>
        <p>These Terms were last updated on {LAST_UPDATED} and take effect on {EFFECTIVE_DATE}. We will notify registered users of material changes in accordance with Section&nbsp;22.</p>
        <p><strong>Contact:</strong> {P.entity}, {P.address}. Email: <a href={`mailto:${P.legalEmail}`} className="text-blue-600 hover:underline">{P.legalEmail}</a>. Support: <a href={`mailto:${P.supportEmail}`} className="text-blue-600 hover:underline">{P.supportEmail}</a>.</p>
      </>
    ),
    contentAr: (
      <>
        <p>SDLE Compass ("<strong>المنصة</strong>", "<strong>نحن</strong>") خدمة تعليمية تحضيرية مستقلة تديرها {P.entity}، مؤسسة في المملكة العربية السعودية.</p>
        <p>تنظّم شروط الخدمة هذه ("<strong>الشروط</strong>") وصولك إلى المنصة واستخدامك لها. بإنشاء حساب أو باستخدام المنصة، فأنت توافق على الالتزام بهذه الشروط وبـ<Link to={ROUTES.privacy} className="text-blue-600 hover:underline">سياسة الخصوصية</Link>. إن لم توافق على ذلك، فامتنع عن استخدام المنصة.</p>
        <p>آخر تحديث لهذه الشروط كان في {LAST_UPDATED}، وتسري اعتباراً من {EFFECTIVE_DATE}. سنُخطر المستخدمين المسجّلين بالتغييرات الجوهرية وفقاً للبند 22.</p>
        <p><strong>التواصل:</strong> {P.entity}، {P.address}. البريد الإلكتروني: <a href={`mailto:${P.legalEmail}`} className="text-blue-600 hover:underline">{P.legalEmail}</a>. الدعم: <a href={`mailto:${P.supportEmail}`} className="text-blue-600 hover:underline">{P.supportEmail}</a>.</p>
      </>
    ),
  },

  // 2
  {
    id: 'eligibility',
    titleEn: 'Eligibility',
    titleAr: 'أهلية الاستخدام',
    contentEn: (
      <>
        <p>You must be at least 18 years old to create an account. The Platform is designed for dental graduates and students preparing for the Saudi Dental Licensure Examination and is not intended for minors.</p>
        <p>By registering, you confirm that you are at least 18 years of age and that all information you provide is accurate, current, and complete. Each person may hold only one account. You are responsible for ensuring that your use of the Platform complies with any applicable local or professional regulations in your jurisdiction.</p>
      </>
    ),
    contentAr: (
      <>
        <p>يجب أن يكون عمرك 18 عاماً على الأقل لإنشاء حساب. صُمِّمت المنصة لخريجي طب الأسنان والطلاب المستعدين لاختبار ترخيص طب الأسنان السعودي، وليست موجَّهة للقاصرين.</p>
        <p>بتسجيلك، تؤكد أن عمرك 18 عاماً على الأقل، وأن جميع المعلومات التي تقدّمها صحيحة وحديثة وكاملة. يحق لكل شخص الاحتفاظ بحساب واحد فقط. وأنت مسؤول عن التحقق من أن استخدامك للمنصة يمتثل للأنظمة المحلية أو المهنية المعمول بها في نطاق اختصاصك.</p>
      </>
    ),
  },

  // 3
  {
    id: 'service',
    titleEn: 'Description of the Service',
    titleAr: 'وصف الخدمة',
    contentEn: (
      <>
        <p>SDLE Compass may provide the following features, which may vary over time:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>Personalized study planning and scheduling</li>
          <li>Educational resources including PDFs, videos, and external links</li>
          <li>Study notes organized by subject and topic</li>
          <li>Practice question banks</li>
          <li>Timed mock examinations</li>
          <li>Performance tracking and analytics</li>
          <li>AI-generated explanations and tutoring assistance</li>
          <li>Bookmarking and progress management tools</li>
          <li>Administrative content-management tools for authorized administrators</li>
        </ul>
        <p>Specific features may be added, modified, temporarily limited, or removed at any time. Where a change materially affects a paid feature, we will provide advance notice in accordance with Section&nbsp;17. We do not promise that any particular feature will remain available indefinitely.</p>
      </>
    ),
    contentAr: (
      <>
        <p>قد توفر منصة SDLE Compass الميزات التالية، التي قد تتغير بمرور الوقت:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>تخطيط الدراسة الشخصي وجدولتها</li>
          <li>موارد تعليمية تشمل ملفات PDF ومقاطع فيديو وروابط خارجية</li>
          <li>ملاحظات دراسية مرتّبة حسب المادة والموضوع</li>
          <li>بنوك أسئلة تدريبية</li>
          <li>اختبارات تجريبية موقوتة</li>
          <li>تتبّع الأداء والتحليلات</li>
          <li>شروحات وإرشادات بمساعدة الذكاء الاصطناعي</li>
          <li>أدوات الإشارات المرجعية وإدارة التقدم</li>
          <li>أدوات إدارة المحتوى للمسؤولين المخوَّلين</li>
        </ul>
        <p>يجوز إضافة ميزات بعينها أو تعديلها أو تقييدها مؤقتاً أو إزالتها في أي وقت. وإذا أثّر التغيير تأثيراً جوهرياً على ميزة مدفوعة، فسنقدّم إشعاراً مسبقاً وفقاً للبند 17. لا نضمن أن أي ميزة بعينها ستبقى متاحة إلى أجل غير مسمى.</p>
      </>
    ),
  },

  // 4
  {
    id: 'disclaimer',
    titleEn: 'Educational-Use Disclaimer',
    titleAr: 'إخلاء مسؤولية الاستخدام التعليمي',
    contentEn: (
      <>
        <p>SDLE Compass is an <strong>independent educational support platform</strong>. It is not an official service of the Saudi Commission for Health Specialties (SCFHS) and is not endorsed by or affiliated with SCFHS unless a formal written authorization is in place and disclosed on the Platform.</p>
        <p>Examination readiness indicators, practice scores, and AI-generated feedback are study-support tools, not official predictions or guarantees of examination performance. Passing a practice examination on the Platform does not guarantee passing the actual SDLE.</p>
        <p>Educational content on the Platform is intended to support your preparation and does not constitute professional clinical advice, medical diagnosis, or guidance on patient-specific treatment. Important clinical decisions must always be verified against authoritative sources and professional judgment.</p>
      </>
    ),
    contentAr: (
      <>
        <p>SDLE Compass منصة دعم تعليمي <strong>مستقلة</strong>. وهي ليست خدمة رسمية تابعة للهيئة السعودية للتخصصات الصحية (SCFHS)، ولا تحظى بتأييدها أو انتمائها ما لم يكن ثمة تفويض رسمي مكتوب موضّح على المنصة.</p>
        <p>مؤشرات الجاهزية للاختبار والنتائج التدريبية والتغذية الراجعة من الذكاء الاصطناعي هي أدوات دعم دراسي، وليست تنبؤات رسمية أو ضمانات لأداء الاختبار. اجتياز اختبار تجريبي على المنصة لا يضمن اجتياز اختبار SDLE الفعلي.</p>
        <p>المحتوى التعليمي على المنصة مخصص لدعم تحضيرك ولا يُشكّل استشارة سريرية مهنية أو تشخيصاً طبياً أو توجيهاً خاصاً بعلاج المرضى. يجب دائماً التحقق من القرارات السريرية المهمة من خلال مصادر موثوقة والاحتكام إلى الحكم المهني.</p>
      </>
    ),
  },

  // 5
  {
    id: 'integrity',
    titleEn: 'Examination Integrity',
    titleAr: 'نزاهة الاختبار',
    contentEn: (
      <>
        <p>The integrity of professional licensing examinations is fundamental to public health and professional standards. You must not use the Platform to:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>Upload, reproduce, share, sell, or distribute confidential or official examination questions</li>
          <li>Post recalled items from the SDLE or any official examination without authorization</li>
          <li>Solicit or reconstruct confidential examination content</li>
          <li>Share or disseminate leaked answers or unauthorized examination materials</li>
          <li>Upload copyrighted third-party materials without the required permission</li>
        </ul>
        <p>Practice questions on the Platform are independently authored educational content and are not represented as official SDLE questions. The Platform administrator may remove suspected unauthorized content without prior notice, suspend accounts involved in serious violations, preserve relevant evidence, and cooperate with lawful requests from regulatory or law-enforcement authorities. We take examination integrity seriously and will act promptly on credible reports.</p>
      </>
    ),
    contentAr: (
      <>
        <p>تُعدّ نزاهة اختبارات الترخيص المهنية أمراً أساسياً للصحة العامة والمعايير المهنية. يُحظر عليك استخدام المنصة من أجل:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>رفع أسئلة اختبار سرية أو رسمية أو نسخها أو مشاركتها أو بيعها أو توزيعها</li>
          <li>نشر أسئلة مستعادة من اختبار SDLE أو أي اختبار رسمي دون إذن مسبق</li>
          <li>طلب محتوى سري من الاختبار أو إعادة تركيبه</li>
          <li>مشاركة إجابات مسرّبة أو مواد اختبار غير مصرّح بها أو نشرها</li>
          <li>رفع مواد محمية بحقوق الطبع والنشر لأطراف ثالثة دون الحصول على الإذن اللازم</li>
        </ul>
        <p>أسئلة التدريب على المنصة هي محتوى تعليمي مستقل من تأليفنا، ولا يُقدَّم على أنه أسئلة SDLE الرسمية. يجوز للمسؤول عن المنصة إزالة المحتوى المشتبه في كونه غير مصرّح به دون إشعار مسبق، وتعليق الحسابات المتورطة في مخالفات جسيمة، والاحتفاظ بالأدلة ذات الصلة، والتعاون مع الطلبات القانونية الصادرة عن جهات تنظيمية أو أجهزة إنفاذ القانون.</p>
      </>
    ),
  },

  // 6
  {
    id: 'accounts',
    titleEn: 'User Accounts',
    titleAr: 'حسابات المستخدمين',
    contentEn: (
      <>
        <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities conducted through your account. You must:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>Choose a strong password and keep it confidential</li>
          <li>Notify us immediately at <a href={`mailto:${P.supportEmail}`} className="text-blue-600 hover:underline">{P.supportEmail}</a> if you suspect unauthorized access</li>
          <li>Not share, sell, transfer, or allow others to use your account</li>
          <li>Not impersonate any person or misrepresent your identity or affiliation</li>
          <li>Ensure that your account information remains accurate and up to date</li>
        </ul>
        <p>If we suspect that your account has been compromised, we may temporarily suspend it for security purposes and contact you to assist with recovery. You may update your account information at any time through your profile settings.</p>
      </>
    ),
    contentAr: (
      <>
        <p>أنت مسؤول عن الحفاظ على سرية بيانات اعتماد حسابك، وعن جميع الأنشطة التي تُجرى من خلاله. يجب عليك:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>اختيار كلمة مرور قوية والحفاظ على سريتها</li>
          <li>إخطارنا فوراً على <a href={`mailto:${P.supportEmail}`} className="text-blue-600 hover:underline">{P.supportEmail}</a> إذا اشتبهت في وجود وصول غير مصرّح به</li>
          <li>عدم مشاركة حسابك أو بيعه أو نقله أو السماح لآخرين باستخدامه</li>
          <li>عدم انتحال شخصية أي شخص أو تقديم معلومات مضلّلة حول هويتك أو انتمائك</li>
          <li>التأكد من أن معلومات حسابك دقيقة ومحدَّثة</li>
        </ul>
        <p>إذا اشتبهنا في تعرّض حسابك للاختراق، فقد نعلّقه مؤقتاً لأغراض أمنية ونتواصل معك للمساعدة في استعادته. يمكنك تحديث معلومات حسابك في أي وقت من خلال إعدادات ملفك الشخصي.</p>
      </>
    ),
  },

  // 7
  {
    id: 'acceptable-use',
    titleEn: 'Acceptable Use',
    titleAr: 'الاستخدام المقبول',
    contentEn: (
      <>
        <p>You agree not to use the Platform for any of the following:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>Any illegal activity or facilitation of illegal activity</li>
          <li>Harassment, threats, or abuse of any person</li>
          <li>Fraud, deception, or misrepresentation</li>
          <li>Unauthorized scraping, indexing, or automated data collection</li>
          <li>Attempting to bypass, disable, or circumvent access controls or security features</li>
          <li>Uploading malware, viruses, or harmful code</li>
          <li>Attacks on the Platform, its infrastructure, or other users</li>
          <li>Creating accounts by automated means or under false pretences</li>
          <li>Misuse of AI features, including entering patient-identifiable data or confidential examination content</li>
          <li>Uploading private third-party data without authority to do so</li>
          <li>Infringing the intellectual-property rights of others</li>
          <li>Reselling, sublicensing, or commercially redistributing Platform content without express written permission</li>
          <li>Attempting to access, view, or interfere with another user's account or personal data</li>
        </ul>
        <p>We reserve the right to investigate suspected violations and take appropriate action, including suspension or termination of accounts, as set out in Section&nbsp;20.</p>
      </>
    ),
    contentAr: (
      <>
        <p>توافق على عدم استخدام المنصة في أي مما يلي:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>أي نشاط غير قانوني أو تسهيل نشاط مخالف للقانون</li>
          <li>مضايقة أي شخص أو تهديده أو إساءته</li>
          <li>الاحتيال أو الخداع أو التضليل</li>
          <li>استخراج البيانات أو فهرستها أو جمعها آلياً دون إذن</li>
          <li>محاولة تجاوز ضوابط الوصول أو تعطيل ميزات الأمان أو التحايل عليها</li>
          <li>رفع برامج ضارة أو فيروسات أو شفرات مؤذية</li>
          <li>شنّ هجمات على المنصة أو بنيتها التحتية أو على المستخدمين الآخرين</li>
          <li>إنشاء حسابات بوسائل آلية أو بذرائع كاذبة</li>
          <li>إساءة استخدام ميزات الذكاء الاصطناعي، بما في ذلك إدخال بيانات تعرّف بهوية المرضى أو محتوى الاختبار السري</li>
          <li>رفع بيانات خاصة بأطراف ثالثة دون صلاحية لذلك</li>
          <li>انتهاك حقوق الملكية الفكرية للآخرين</li>
          <li>إعادة بيع محتوى المنصة أو ترخيصه من الباطن أو إعادة توزيعه تجارياً دون إذن كتابي صريح</li>
          <li>محاولة الوصول إلى حساب مستخدم آخر أو البيانات الشخصية له أو التدخل فيها</li>
        </ul>
        <p>نحتفظ بحق التحقيق في المخالفات المشتبه بها واتخاذ الإجراءات المناسبة، بما في ذلك تعليق الحسابات أو إنهاؤها، وفقاً للبند 20.</p>
      </>
    ),
  },

  // 8
  {
    id: 'ownership',
    titleEn: 'Platform and Content Ownership',
    titleAr: 'ملكية المنصة والمحتوى',
    contentEn: (
      <>
        <p>The Platform's software, interface design, original educational content, question sets authored by the Platform, notes, study-plan frameworks, databases, and related materials are owned by {P.entity} or used under licence. These are protected by applicable intellectual-property laws.</p>
        <p>You may access Platform content for your personal, non-commercial educational preparation only. You may not reproduce, copy, distribute, publicly display, sell, modify, create derivative works from, or exploit Platform content for any commercial purpose without express written permission.</p>
        <p>Certain content on the Platform may be provided by third-party authors or publishers under licence. Such content is credited where applicable and remains the property of the respective right holder. The Platform does not claim ownership of materials it does not legally own.</p>
        <p>The SDLE Compass name, logo, and interface design are proprietary. Nothing in these Terms grants you any right to use them without prior written consent.</p>
      </>
    ),
    contentAr: (
      <>
        <p>برمجيات المنصة وتصميم واجهتها والمحتوى التعليمي الأصلي ومجموعات الأسئلة من تأليف المنصة والملاحظات وأطر خطط الدراسة وقواعد البيانات والمواد ذات الصلة — كلها مملوكة لـ{P.entity} أو مستخدَمة بموجب ترخيص. وهي محمية بموجب قوانين الملكية الفكرية المعمول بها.</p>
        <p>يمكنك الوصول إلى محتوى المنصة لأغراضك الشخصية التعليمية غير التجارية فقط. لا يحق لك نسخ المحتوى أو نشره أو توزيعه أو عرضه علناً أو بيعه أو تعديله أو إنشاء أعمال مشتقة منه أو استغلاله لأي غرض تجاري دون إذن كتابي صريح.</p>
        <p>قد يُقدَّم بعض المحتوى على المنصة من قِبل مؤلفين أو ناشرين من أطراف ثالثة بموجب ترخيص. ويُشار إلى هذا المحتوى عند الاقتضاء ويبقى ملكاً لصاحب الحق المعني. لا تدّعي المنصة ملكية المواد التي لا تملكها قانونياً.</p>
        <p>اسم SDLE Compass وشعاره وتصميم واجهته خاصة ومحمية. لا يمنحك أي بند من هذه الشروط أي حق في استخدامها دون موافقة كتابية مسبقة.</p>
      </>
    ),
  },

  // 9
  {
    id: 'user-content',
    titleEn: 'User-Submitted Content',
    titleAr: 'المحتوى الذي يرفعه المستخدم',
    contentEn: (
      <>
        <p>You retain applicable ownership rights in content you submit to the Platform, such as personal study notes, questions you report, or messages you send through support channels.</p>
        <p>By submitting content, you grant {P.entity} a limited, non-exclusive licence to host, store, process, display, and transmit that content solely as necessary to provide the service to you. You do not assign ownership of your content to us.</p>
        <p>You confirm that you have the necessary rights and permissions to upload any content you submit. You must not upload content that infringes third-party rights, violates applicable law, or contains unauthorized examination materials.</p>
        <p>Your personal study notes remain private and are accessible only to you, except where access is technically or legally necessary and disclosed in our Privacy Policy. We may remove content that is unlawful, harmful, infringing, or in violation of these Terms. We will not demand transfer of all rights in your content as a condition of using the service.</p>
      </>
    ),
    contentAr: (
      <>
        <p>تحتفظ بحقوق الملكية المعمول بها في المحتوى الذي ترفعه إلى المنصة، كملاحظاتك الدراسية الشخصية والأسئلة التي ترفعها والرسائل التي ترسلها عبر قنوات الدعم.</p>
        <p>برفعك للمحتوى، تمنح {P.entity} ترخيصاً محدوداً وغير حصري لاستضافة هذا المحتوى وتخزينه ومعالجته وعرضه ونقله بالقدر الضروري فقط لتقديم الخدمة لك. ولا تنقل إلينا ملكية محتواك.</p>
        <p>تؤكد أن لديك الحقوق والأذونات اللازمة لرفع أي محتوى تقدمه. يُحظر عليك رفع محتوى ينتهك حقوق أطراف ثالثة أو يخالف القانون المعمول به أو يتضمن مواد اختبار غير مصرّح بها.</p>
        <p>تبقى ملاحظاتك الدراسية الشخصية خاصة ولا يمكن الوصول إليها إلا لك، إلا إذا كان الوصول ضرورياً من الناحية التقنية أو القانونية وجرى الإفصاح عنه في سياسة الخصوصية. يجوز لنا إزالة المحتوى غير القانوني أو الضار أو المنتهِك لهذه الشروط. ولن نطلب نقل جميع الحقوق في محتواك شرطاً لاستخدام الخدمة.</p>
      </>
    ),
  },

  // 10
  {
    id: 'ai',
    titleEn: 'AI Features',
    titleAr: 'ميزات الذكاء الاصطناعي',
    contentEn: (
      <>
        <p>The Platform provides AI-assisted features including explanations, tutoring responses, and question commentary. These outputs are generated automatically and may contain errors, omissions, or inaccuracies. You should independently verify important information against authoritative sources before relying on it.</p>
        <p>AI-generated questions and explanations are educational content only. They are not official SDLE questions and do not predict examination performance.</p>
        <p>Citations provided by AI features may occasionally be incomplete or incorrectly mapped. Do not treat AI-provided references as confirmed bibliographic records without independent verification.</p>
        <p>You must not enter patient-identifiable information, confidential examination content, or sensitive personal data about third parties into any AI chat feature. Prompts you submit may be processed by our AI service provider as described in our <Link to={ROUTES.privacy} className="text-blue-600 hover:underline">Privacy Policy</Link>.</p>
        <p>Important clinical decisions must always be verified against authoritative professional and scientific sources.</p>
      </>
    ),
    contentAr: (
      <>
        <p>توفر المنصة ميزات بمساعدة الذكاء الاصطناعي، تشمل الشروحات والردود التعليمية والتعليق على الأسئلة. تُنتَج هذه المخرجات تلقائياً وقد تحتوي على أخطاء أو إغفالات أو معلومات غير دقيقة. يجب عليك التحقق بشكل مستقل من المعلومات المهمة بالرجوع إلى مصادر موثوقة قبل الاستناد إليها.</p>
        <p>الأسئلة والشروحات التي يُنشئها الذكاء الاصطناعي هي محتوى تعليمي فقط، وليست أسئلة SDLE رسمية ولا تتنبأ بأداء الاختبار.</p>
        <p>قد تكون الاستشهادات التي يوفرها الذكاء الاصطناعي أحياناً غير مكتملة أو مربوطة بصورة غير صحيحة. لا تعامل المراجع التي يقدمها الذكاء الاصطناعي باعتبارها سجلات ببليوغرافية موثّقة دون التحقق منها بشكل مستقل.</p>
        <p>يُحظر عليك إدخال بيانات تعرّف بهوية المرضى أو محتوى الاختبار السري أو بيانات شخصية حساسة لأطراف ثالثة في أي ميزة محادثة بالذكاء الاصطناعي. قد تُعالَج الطلبات التي ترسلها من قِبل مزوّد خدمة الذكاء الاصطناعي لدينا كما هو موضَّح في <Link to={ROUTES.privacy} className="text-blue-600 hover:underline">سياسة الخصوصية</Link>.</p>
        <p>يجب دائماً التحقق من القرارات السريرية المهمة بالرجوع إلى مصادر مهنية وعلمية موثوقة.</p>
      </>
    ),
  },

  // 11
  {
    id: 'free-access',
    titleEn: 'Current Free Access',
    titleAr: 'الوصول المجاني الحالي',
    contentEn: (
      <>
        <p><strong>SDLE Compass is currently available without a subscription fee, except for any feature or content package that is clearly and separately identified as paid.</strong></p>
        <p>We do not describe the service as permanently free. The current free availability may change in the future. If we decide to introduce paid plans or to restrict currently-free features to paid tiers, we will notify registered users in advance through the process described in Section&nbsp;17, and any changes will be subject to applicable Saudi law and consumer-protection requirements.</p>
        <p>Simply having a free account does not create any commitment to pay in the future. You are not enrolled in any paid plan and will not be charged unless you separately and actively choose to subscribe to a paid feature, as described in Section&nbsp;12.</p>
      </>
    ),
    contentAr: (
      <>
        <p><strong>تتوفر منصة SDLE Compass حالياً دون رسوم اشتراك، باستثناء أي ميزة أو حزمة محتوى تُحدَّد بوضوح وبصورة منفصلة باعتبارها مدفوعة.</strong></p>
        <p>لا نصف الخدمة بأنها مجانية بشكل دائم. وقد يتغير توافرها المجاني الحالي في المستقبل. إذا قررنا تقديم خطط مدفوعة أو تقييد الميزات المجانية الحالية ضمن مستويات مدفوعة، فسنُخطر المستخدمين المسجّلين مسبقاً وفق الإجراء المبيّن في البند 17، وستخضع أي تغييرات للقانون السعودي المعمول به ومتطلبات حماية المستهلك.</p>
        <p>مجرد امتلاكك لحساب مجاني لا يُوجِد أي التزام بالدفع في المستقبل. أنت غير مسجَّل في أي خطة مدفوعة ولن يُقتطع منك أي مبلغ إلا إذا اخترت بشكل منفصل ونشط الاشتراك في ميزة مدفوعة كما هو موضَّح في البند 12.</p>
      </>
    ),
  },

  // 12
  {
    id: 'paid-plans',
    titleEn: 'Future Paid Plans',
    titleAr: 'الخطط المدفوعة المستقبلية',
    contentEn: (
      <>
        <p>The Platform administrator may, in the future, offer optional paid features or subscriptions, which may include:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>Premium subscription plans</li>
          <li>Institutional or group access</li>
          <li>Optional content packages or add-ons</li>
          <li>One-time purchases</li>
          <li>Free trials with optional upgrade paths</li>
          <li>Advertising-supported free access as an alternative to paid plans</li>
        </ul>
        <p>The following protections apply regardless of which paid options may be introduced in the future:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>Existing free users will <strong>not</strong> be automatically enrolled in any paid plan</li>
          <li>No payment will be taken without an affirmative, separate purchase or subscription action from you</li>
          <li>You will see the price, tax, billing frequency, renewal terms, and cancellation method before any payment is processed</li>
          <li>You can choose not to subscribe and continue with whatever free features remain available</li>
          <li>Paid features will not be charged retroactively</li>
          <li>All changes will be subject to applicable Saudi law, including any applicable consumer protection and e-commerce requirements</li>
        </ul>
      </>
    ),
    contentAr: (
      <>
        <p>قد يُقدّم مسؤول المنصة في المستقبل ميزات أو اشتراكات مدفوعة اختيارية، وقد تشمل:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>خطط اشتراك مميّزة</li>
          <li>وصول للمؤسسات أو المجموعات</li>
          <li>حزم محتوى اختيارية أو إضافات</li>
          <li>مشتريات لمرة واحدة</li>
          <li>فترات تجريبية مجانية مع مسارات ترقية اختيارية</li>
          <li>وصول مجاني مدعوم بالإعلانات كبديل للخطط المدفوعة</li>
        </ul>
        <p>تسري الضمانات التالية بصرف النظر عن الخيارات المدفوعة التي قد تُقدَّم في المستقبل:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>لن يُسجَّل المستخدمون المجانيون الحاليون تلقائياً في أي خطة مدفوعة</li>
          <li>لن يُقتطع أي مبلغ منك دون اتخاذ إجراء اشتراك أو شراء منفصل وإيجابي منك</li>
          <li>ستطّلع على السعر والضريبة وتكرار الفوترة وشروط التجديد وطريقة الإلغاء قبل معالجة أي دفعة</li>
          <li>يمكنك اختيار عدم الاشتراك والاستمرار في استخدام الميزات المجانية المتاحة</li>
          <li>لن تُحتسب الميزات المدفوعة بأثر رجعي</li>
          <li>ستخضع جميع التغييرات للقانون السعودي المعمول به، بما في ذلك متطلبات حماية المستهلك والتجارة الإلكترونية</li>
        </ul>
      </>
    ),
  },

  // 13
  {
    id: 'subscription-disclosures',
    titleEn: 'Subscription Disclosures',
    titleAr: 'إفصاحات الاشتراك',
    contentEn: (
      <>
        <p>Before any paid subscription is activated, the Platform will clearly display all of the following information:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>Plan name and included features</li>
          <li>Price in Saudi Riyals (SAR), including any applicable VAT</li>
          <li>Billing frequency (monthly, annual, or other)</li>
          <li>Subscription start date</li>
          <li>Whether the subscription renews automatically</li>
          <li>Renewal price and date (or calculation method)</li>
          <li>Free trial terms and end date, when applicable</li>
          <li>Cancellation method</li>
          <li>Refund eligibility</li>
          <li>Effect of cancellation on access</li>
          <li>Contact method for billing questions or disputes</li>
        </ul>
        <p>You will be required to actively confirm the purchase. Acceptance of these general Terms is not sufficient to authorize a future subscription charge. A separate, affirmative confirmation step is required for each paid subscription you choose to activate.</p>
      </>
    ),
    contentAr: (
      <>
        <p>قبل تفعيل أي اشتراك مدفوع، ستعرض المنصة بوضوح جميع المعلومات التالية:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>اسم الخطة والميزات المدرجة فيها</li>
          <li>السعر بالريال السعودي (SAR) متضمناً ضريبة القيمة المضافة المعمول بها</li>
          <li>تكرار الفوترة (شهري أو سنوي أو غير ذلك)</li>
          <li>تاريخ بدء الاشتراك</li>
          <li>ما إذا كان الاشتراك يُجدَّد تلقائياً</li>
          <li>سعر التجديد وتاريخه (أو طريقة احتسابه)</li>
          <li>شروط الفترة التجريبية المجانية وتاريخ انتهائها عند الاقتضاء</li>
          <li>طريقة الإلغاء</li>
          <li>شروط استحقاق استرداد المبلغ</li>
          <li>أثر الإلغاء على صلاحية الوصول</li>
          <li>وسيلة التواصل للاستفسارات أو النزاعات المتعلقة بالفوترة</li>
        </ul>
        <p>سيُطلب منك تأكيد الشراء بشكل نشط. لا يكفي قبول هذه الشروط العامة لترخيص أي رسوم اشتراك مستقبلية. يُشترط وجود خطوة تأكيد منفصلة وإيجابية لكل اشتراك مدفوع تختار تفعيله.</p>
      </>
    ),
  },

  // 14
  {
    id: 'auto-renewal',
    titleEn: 'Automatic Renewal',
    titleAr: 'التجديد التلقائي',
    contentEn: (
      <>
        <p>If any paid subscription on the Platform uses automatic renewal, the following safeguards will apply:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>Automatic renewal will be clearly disclosed before payment is taken</li>
          <li>Your affirmative authorization for automatic renewal will be required</li>
          <li>The renewal schedule and renewal price will be displayed</li>
          <li>An accessible cancellation method will be provided before renewal occurs</li>
          <li>Billing or renewal notices will be sent as required by applicable law</li>
          <li>Evidence of your authorization will be retained</li>
          <li>Future renewal charges will stop upon valid cancellation</li>
        </ul>
        <p>We will not enroll you in automatic renewal without your prior explicit consent. Deleting the application or ceasing to use the Platform does not constitute cancellation of an active subscription. See Section&nbsp;15 for the cancellation process.</p>
      </>
    ),
    contentAr: (
      <>
        <p>إذا استخدم أي اشتراك مدفوع على المنصة التجديد التلقائي، فستسري الضمانات التالية:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>سيُفصح بوضوح عن التجديد التلقائي قبل اقتطاع الدفعة</li>
          <li>سيكون تفويضك الصريح للتجديد التلقائي مطلوباً</li>
          <li>سيُعرض جدول التجديد وسعره</li>
          <li>ستُتاح طريقة إلغاء ميسّرة قبل حدوث التجديد</li>
          <li>ستُرسَل إشعارات الفوترة أو التجديد وفقاً لما يقتضيه القانون المعمول به</li>
          <li>سيُحتفظ بدليل على موافقتك</li>
          <li>ستتوقف رسوم التجديد المستقبلية عند الإلغاء الصحيح</li>
        </ul>
        <p>لن نسجّلك في التجديد التلقائي دون موافقتك الصريحة المسبقة. لا يُعدّ حذف التطبيق أو التوقف عن استخدام المنصة إلغاءً لاشتراك نشط. راجع البند 15 لمعرفة عملية الإلغاء.</p>
      </>
    ),
  },

  // 15
  {
    id: 'cancellation',
    titleEn: 'Cancellation',
    titleAr: 'الإلغاء',
    contentEn: (
      <>
        <p>You may cancel renewal of your subscription at any time through your account settings or by contacting support at <a href={`mailto:${P.supportEmail}`} className="text-blue-600 hover:underline">{P.supportEmail}</a>. The cancellation process will be reasonably easy to find and use.</p>
        <p>Unless otherwise stated in the applicable subscription terms or required by law:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>Cancellation stops future automatic renewal charges</li>
          <li>Access to paid features may continue until the end of the already-paid billing period</li>
          <li>Deleting the Platform application does not automatically cancel your subscription</li>
          <li>Account deletion and subscription cancellation are separate actions; see Section&nbsp;20 for account deletion</li>
          <li>You will receive written confirmation of cancellation, including the effective date and end-of-access date</li>
        </ul>
        <p>We will not use manipulative language or difficult navigation to discourage you from cancelling. We will explain the effect of cancellation clearly and without pressure.</p>
      </>
    ),
    contentAr: (
      <>
        <p>يمكنك إلغاء تجديد اشتراكك في أي وقت من خلال إعدادات حسابك أو بالتواصل مع الدعم على <a href={`mailto:${P.supportEmail}`} className="text-blue-600 hover:underline">{P.supportEmail}</a>. ستكون عملية الإلغاء سهلة الإيجاد والاستخدام.</p>
        <p>ما لم ينص على خلاف ذلك في شروط الاشتراك المعمول بها أو يقتضيه القانون:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>يوقف الإلغاء رسوم التجديد التلقائي المستقبلية</li>
          <li>قد يستمر الوصول إلى الميزات المدفوعة حتى نهاية فترة الفوترة المدفوعة مسبقاً</li>
          <li>لا يُلغي حذف تطبيق المنصة اشتراكك تلقائياً</li>
          <li>حذف الحساب وإلغاء الاشتراك إجراءان منفصلان؛ راجع البند 20 لحذف الحساب</li>
          <li>ستتلقى تأكيداً كتابياً بالإلغاء يتضمن تاريخ نفاذه وتاريخ انتهاء صلاحية الوصول</li>
        </ul>
        <p>لن نستخدم لغة تحايلية أو تنقلاً معقداً لثنيك عن الإلغاء. سنوضّح أثر الإلغاء بشكل واضح ودون ضغط.</p>
      </>
    ),
  },

  // 16
  {
    id: 'refunds',
    titleEn: 'Refunds',
    titleAr: 'الاسترداد',
    contentEn: (
      <>
        <p>When paid plans are introduced, the Platform will publish a clear refund policy. Until then, this section describes the general framework that will apply.</p>
        <p>Refunds may be available in the following circumstances:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>Duplicate charges caused by a technical error</li>
          <li>Charges made without your authorization</li>
          <li>Failure to deliver the service as reasonably described</li>
          <li>As otherwise required by applicable Saudi consumer-protection law</li>
        </ul>
        <p>Refunds will not normally be available for:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>Unused portion of a billing period following voluntary cancellation, unless otherwise stated</li>
          <li>Free trials that have already been used</li>
        </ul>
        <p>Nothing in this policy removes any mandatory rights available to you under applicable Saudi law. To request a refund, contact <a href={`mailto:${P.supportEmail}`} className="text-blue-600 hover:underline">{P.supportEmail}</a> with your account details and a description of the issue.</p>
      </>
    ),
    contentAr: (
      <>
        <p>عند تقديم الخطط المدفوعة، ستنشر المنصة سياسة استرداد واضحة. وحتى ذلك الحين، يصف هذا البند الإطار العام الذي سيُطبَّق.</p>
        <p>قد يتوفر الاسترداد في الحالات التالية:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>رسوم مزدوجة ناجمة عن خطأ تقني</li>
          <li>رسوم تُقتطع دون إذنك</li>
          <li>إخفاق في تقديم الخدمة كما هو موصوف بشكل معقول</li>
          <li>الحالات التي يُوجبها نظام حماية المستهلك السعودي المعمول به</li>
        </ul>
        <p>لن يتوفر الاسترداد عادةً في الحالات التالية:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>الجزء غير المستخدم من فترة الفوترة بعد الإلغاء الطوعي، ما لم ينص على خلاف ذلك</li>
          <li>الفترات التجريبية المجانية التي استُخدمت بالفعل</li>
        </ul>
        <p>لا يُلغي أي بند في هذه السياسة الحقوق الإلزامية المتاحة لك بموجب القانون السعودي المعمول به. لطلب الاسترداد، تواصل مع <a href={`mailto:${P.supportEmail}`} className="text-blue-600 hover:underline">{P.supportEmail}</a> مع تفاصيل حسابك ووصف للمشكلة.</p>
      </>
    ),
  },

  // 17
  {
    id: 'price-changes',
    titleEn: 'Price Changes',
    titleAr: 'تغييرات الأسعار',
    contentEn: (
      <>
        <p>If the Platform introduces or changes pricing for any feature or subscription:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>Existing subscribers will receive reasonable advance notice before a price change affects a future renewal</li>
          <li>The notice will identify the new price and the effective date</li>
          <li>You will have the opportunity to cancel before the new price takes effect</li>
          <li>Price changes will not be applied retroactively to a completed billing period</li>
          <li>Additional consent will be obtained where required by applicable law</li>
        </ul>
        <p>This section applies only when paid subscriptions are active. Currently, the service is free and this section has no immediate effect.</p>
      </>
    ),
    contentAr: (
      <>
        <p>إذا قدّمت المنصة أسعاراً لأي ميزة أو اشتراك أو غيّرتها:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>سيتلقى المشتركون الحاليون إشعاراً مسبقاً معقولاً قبل أن يؤثر تغيير السعر على تجديد مستقبلي</li>
          <li>سيُحدَّد في الإشعار السعر الجديد وتاريخ نفاذه</li>
          <li>ستتاح لك الفرصة للإلغاء قبل دخول السعر الجديد حيز التنفيذ</li>
          <li>لن تُطبَّق تغييرات الأسعار بأثر رجعي على فترة فوترة مكتملة</li>
          <li>ستُستأذن موافقة إضافية حيثما يوجب ذلك القانون المعمول به</li>
        </ul>
        <p>يسري هذا البند فقط عند تفعيل الاشتراكات المدفوعة. في الوقت الحالي، الخدمة مجانية وليس لهذا البند أي أثر فوري.</p>
      </>
    ),
  },

  // 18
  {
    id: 'payment',
    titleEn: 'Payment Processing',
    titleAr: 'معالجة الدفع',
    contentEn: (
      <>
        <p>When paid features are introduced, payments will be handled through a third-party payment provider ({P.paymentProvider}). The payment provider's own terms of service and privacy policy will also apply to payment transactions.</p>
        <p>The Platform does not directly store complete payment card details. Payment processing is handled by the provider through a compliant payment gateway. Billing records may be retained as required by Saudi financial and tax regulations. Fraud-prevention checks may be performed in connection with payment processing.</p>
        <p>This section is provided for informational purposes and does not create any current payment obligation. No payment provider is currently integrated.</p>
      </>
    ),
    contentAr: (
      <>
        <p>عند تقديم الميزات المدفوعة، ستُعالَج المدفوعات عبر مزوّد دفع خارجي ({P.paymentProvider}). كما ستسري شروط خدمة مزوّد الدفع وسياسة خصوصيته على معاملات الدفع.</p>
        <p>لا تخزّن المنصة تفاصيل بطاقة الدفع الكاملة مباشرةً. تُعالَج مدفوعات عبر بوابة دفع متوافقة يديرها المزوّد. يجوز الاحتفاظ بسجلات الفوترة وفقاً لما تقتضيه الأنظمة المالية والضريبية السعودية. قد تُجرى عمليات فحص للوقاية من الاحتيال في إطار معالجة الدفع.</p>
        <p>يُقدَّم هذا البند لأغراض إعلامية ولا يُنشئ أي التزام دفع حالياً. لا يوجد حالياً أي مزوّد دفع مدمج.</p>
      </>
    ),
  },

  // 19
  {
    id: 'availability',
    titleEn: 'Service Availability',
    titleAr: 'توافر الخدمة',
    contentEn: (
      <>
        <p>We will make reasonable efforts to keep the Platform accessible, but we do not promise uninterrupted or error-free access. The Platform may be unavailable or degraded due to:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>Scheduled maintenance</li>
          <li>Internet or connectivity issues beyond our control</li>
          <li>Third-party service interruptions (database, AI provider, cloud storage)</li>
          <li>Security incidents requiring prompt intervention</li>
          <li>Software updates and improvements</li>
          <li>Events outside our reasonable control (force majeure)</li>
        </ul>
        <p>We will endeavour to minimise disruption and to notify users of significant planned maintenance where practical. No liability will arise solely from brief or unavoidable service interruptions, subject to applicable mandatory consumer-protection law.</p>
      </>
    ),
    contentAr: (
      <>
        <p>سنبذل جهوداً معقولة للحفاظ على إمكانية الوصول إلى المنصة، لكننا لا نعد بوصول غير منقطع أو خالٍ من الأخطاء. قد تكون المنصة غير متاحة أو تعمل بشكل محدود بسبب:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>الصيانة المجدولة</li>
          <li>مشكلات الإنترنت أو الاتصال خارجة عن سيطرتنا</li>
          <li>انقطاعات خدمات الأطراف الثالثة (قاعدة البيانات، مزوّد الذكاء الاصطناعي، التخزين السحابي)</li>
          <li>الحوادث الأمنية التي تستوجب تدخلاً فورياً</li>
          <li>تحديثات البرمجيات وتحسيناتها</li>
          <li>أحداث خارجة عن سيطرتنا المعقولة (قوة قاهرة)</li>
        </ul>
        <p>سنسعى إلى تقليل الانقطاعات وإخطار المستخدمين بالصيانة المخططة المهمة حيثما أمكن ذلك. لن تنشأ أي مسؤولية بسبب انقطاعات الخدمة الموجزة أو التي لا يمكن تجنبها، مع مراعاة أنظمة حماية المستهلك الإلزامية المعمول بها.</p>
      </>
    ),
  },

  // 20
  {
    id: 'termination',
    titleEn: 'Suspension and Termination',
    titleAr: 'التعليق والإنهاء',
    contentEn: (
      <>
        <p>We may suspend or terminate your account in the following circumstances:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>A credible security risk to the Platform or other users</li>
          <li>Suspected unlawful conduct or fraud</li>
          <li>Repeated serious violations of these Terms</li>
          <li>Upload or dissemination of unauthorized examination content</li>
          <li>Abuse, harassment, or threats directed at other users or staff</li>
          <li>Attempted unauthorized access to accounts or data</li>
          <li>Payment failure on a paid subscription (for paid features, when introduced)</li>
        </ul>
        <p>Where practical, we will provide notice and an opportunity to address the situation before permanent termination. In urgent cases involving security or legal risk, immediate action may be necessary without prior notice. An appeal or support process will be available by contacting <a href={`mailto:${P.supportEmail}`} className="text-blue-600 hover:underline">{P.supportEmail}</a>.</p>
        <p>Upon account deletion, you may request a copy of your personal data in a readable format before deletion is completed, as described in our Privacy Policy. If you hold an active paid subscription, we will apply the applicable refund and cancellation terms.</p>
        <p>You may request deletion of your own account at any time from your account settings or by emailing support.</p>
      </>
    ),
    contentAr: (
      <>
        <p>يجوز لنا تعليق حسابك أو إنهاؤه في الحالات التالية:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>وجود خطر أمني موثوق يستهدف المنصة أو مستخدمين آخرين</li>
          <li>الاشتباه في نشاط غير قانوني أو احتيال</li>
          <li>انتهاكات جسيمة متكررة لهذه الشروط</li>
          <li>رفع محتوى اختبار غير مصرّح به أو نشره</li>
          <li>إساءة مستخدمين أو موظفين آخرين أو تهديدهم</li>
          <li>محاولة الوصول غير المصرّح به إلى حسابات أو بيانات</li>
          <li>إخفاق في الدفع لاشتراك مدفوع (للميزات المدفوعة عند تقديمها)</li>
        </ul>
        <p>حيثما أمكن، سنقدّم إشعاراً وفرصة لمعالجة الوضع قبل الإنهاء الدائم. في الحالات العاجلة التي تنطوي على مخاطر أمنية أو قانونية، قد يكون الإجراء الفوري ضرورياً دون إشعار مسبق. يتوفر إجراء استئناف أو دعم عبر التواصل مع <a href={`mailto:${P.supportEmail}`} className="text-blue-600 hover:underline">{P.supportEmail}</a>.</p>
        <p>عند حذف الحساب، يمكنك طلب نسخة من بياناتك الشخصية بتنسيق قابل للقراءة قبل اكتمال الحذف كما هو موضَّح في سياسة الخصوصية. إذا كان لديك اشتراك مدفوع نشط، فسنطبّق شروط الاسترداد والإلغاء المعمول بها.</p>
        <p>يمكنك طلب حذف حسابك في أي وقت من إعدادات الحساب أو بالتواصل مع الدعم عبر البريد الإلكتروني.</p>
      </>
    ),
  },

  // 21
  {
    id: 'liability',
    titleEn: 'Disclaimers and Limitation of Liability',
    titleAr: 'إخلاءات المسؤولية وتحديد المسؤولية',
    contentEn: (
      <>
        <p>The Platform and its content are provided on an "as is" and "as available" basis without warranties of any kind, except as required by applicable law. We do not warrant that the Platform will always be accurate, complete, uninterrupted, or free of errors.</p>
        <p>To the maximum extent permitted by applicable Saudi law, our total liability for any claim arising from these Terms or your use of the Platform will be limited. This limitation does not apply to:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>Liability that cannot lawfully be excluded or limited under Saudi law</li>
          <li>Mandatory consumer-protection rights</li>
          <li>Rights under the Saudi Personal Data Protection Law</li>
          <li>Liability for intentional misconduct where exclusion is prohibited by law</li>
        </ul>
        <p>We are not liable for decisions made on the basis of Platform content, AI-generated explanations, or practice results. You remain solely responsible for your professional conduct and examination preparation.</p>
        <p><em>Note to administrator: This section should be reviewed by qualified Saudi legal counsel before publication to ensure the specific limitation language is enforceable and compliant with applicable regulations.</em></p>
      </>
    ),
    contentAr: (
      <>
        <p>تُقدَّم المنصة ومحتواها "كما هي" و"حسب التوافر" دون ضمانات من أي نوع، إلا ما يُوجبه القانون المعمول به. لا نضمن أن المنصة ستكون دائماً دقيقة أو كاملة أو غير منقطعة أو خالية من الأخطاء.</p>
        <p>بالقدر الذي يسمح به القانون السعودي المعمول به، ستكون مسؤوليتنا الإجمالية عن أي مطالبة ناشئة عن هذه الشروط أو عن استخدامك للمنصة محدودة. لا يسري هذا التحديد على:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>المسؤولية التي لا يجوز قانوناً استثناؤها أو تحديدها بموجب القانون السعودي</li>
          <li>حقوق حماية المستهلك الإلزامية</li>
          <li>الحقوق بموجب نظام حماية البيانات الشخصية السعودي</li>
          <li>المسؤولية عن الإهمال المتعمد حيث يُحظر القانون استثناءها</li>
        </ul>
        <p>لسنا مسؤولين عن القرارات المتخذة بناءً على محتوى المنصة أو الشروحات التي يُنشئها الذكاء الاصطناعي أو نتائج التدريب. أنت وحدك المسؤول عن سلوكك المهني وعن تحضيرك للاختبار.</p>
        <p><em>ملاحظة للمسؤول: يجب أن يراجع محامٍ سعودي مؤهل هذا البند قبل النشر للتأكد من قابلية تطبيق صياغة التحديد المحددة وامتثالها للأنظمة المعمول بها.</em></p>
      </>
    ),
  },

  // 22
  {
    id: 'changes',
    titleEn: 'Changes to These Terms',
    titleAr: 'تعديلات على هذه الشروط',
    contentEn: (
      <>
        <p>We may update these Terms from time to time. We distinguish between minor and material changes:</p>
        <p><strong>Minor changes</strong> (typographical corrections, contact-detail updates, formatting, non-material clarifications) may take effect without requiring renewed acceptance. Registered users will be informed through in-platform notifications or email as appropriate.</p>
        <p><strong>Material changes</strong> (introducing paid subscriptions or automatic renewal, expanding data sharing, materially reducing free access, changing cancellation or refund rights, changing the governing law) will be communicated with at least 30 days' advance notice where legally required or practicable. We will:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>Provide a plain-language summary of what changed and why</li>
          <li>Display the effective date prominently</li>
          <li>Request renewed acceptance where required by applicable law</li>
          <li>Allow users to decline and close their account where applicable</li>
          <li>Not apply material changes retroactively to completed billing periods</li>
        </ul>
        <p>We will retain records of each version of these Terms and of each user's acceptance.</p>
      </>
    ),
    contentAr: (
      <>
        <p>يجوز لنا تحديث هذه الشروط من وقت لآخر. نُفرِّق بين التعديلات الطفيفة والجوهرية:</p>
        <p><strong>التعديلات الطفيفة</strong> (التصحيحات الإملائية وتحديثات بيانات التواصل والتنسيق والتوضيحات غير الجوهرية) قد تدخل حيز التنفيذ دون الحاجة إلى قبول متجدد. سيُخطر المستخدمون المسجّلون من خلال الإشعارات داخل المنصة أو البريد الإلكتروني حسب الاقتضاء.</p>
        <p><strong>التعديلات الجوهرية</strong> (تقديم الاشتراكات المدفوعة أو التجديد التلقائي، وتوسيع نطاق مشاركة البيانات، وتقليص الوصول المجاني بصورة جوهرية، وتغيير حقوق الإلغاء أو الاسترداد، وتغيير القانون الحاكم) ستُبلَّغ بإشعار مسبق لا يقل عن 30 يوماً حيثما يقتضيه القانون أو يكون ذلك عملياً. وسنقوم بما يلي:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li>تقديم ملخص بلغة مبسّطة يوضّح ما تغيّر وسببه</li>
          <li>عرض تاريخ النفاذ بشكل بارز</li>
          <li>طلب قبول متجدد حيثما يُوجبه القانون المعمول به</li>
          <li>السماح للمستخدمين بالرفض وإغلاق حساباتهم عند الاقتضاء</li>
          <li>عدم تطبيق التعديلات الجوهرية بأثر رجعي على فترات الفوترة المكتملة</li>
        </ul>
        <p>سنحتفظ بسجلات لكل إصدار من هذه الشروط وبقبول كل مستخدم.</p>
      </>
    ),
  },

  // 23
  {
    id: 'governing-law',
    titleEn: 'Governing Law and Disputes',
    titleAr: 'القانون الحاكم وتسوية النزاعات',
    contentEn: (
      <>
        <p>These Terms are governed by and shall be construed in accordance with the laws of the Kingdom of Saudi Arabia, including but not limited to the Electronic Transactions Law, the Consumer Protection Law, the Personal Data Protection Law, and applicable e-commerce regulations.</p>
        <p>If you have a complaint or dispute, please contact us first at <a href={`mailto:${P.legalEmail}`} className="text-blue-600 hover:underline">{P.legalEmail}</a>. We will make reasonable efforts to resolve disputes informally. If informal resolution is not possible, disputes will be subject to the jurisdiction of the competent courts of the Kingdom of Saudi Arabia.</p>
        <p>Nothing in these Terms limits your right to bring a complaint before a competent consumer-protection authority in Saudi Arabia.</p>
        <p><strong>Language:</strong> These Terms are prepared in both Arabic and English. In the event of any conflict between the Arabic and English versions, the Arabic text shall govern to the extent required by applicable Saudi law. Both versions are intended to have the same legal effect, and users are encouraged to consult both.</p>
        <p><em>Note to administrator: The controlling-language provision and dispute-resolution mechanism should be confirmed by qualified Saudi legal counsel before publication.</em></p>
      </>
    ),
    contentAr: (
      <>
        <p>تخضع هذه الشروط وتُفسَّر وفقاً لقوانين المملكة العربية السعودية، بما في ذلك على سبيل المثال لا الحصر: نظام التعاملات الإلكترونية، ونظام حماية المستهلك، ونظام حماية البيانات الشخصية، وأنظمة التجارة الإلكترونية المعمول بها.</p>
        <p>إذا كان لديك شكوى أو نزاع، فتواصل معنا أولاً على <a href={`mailto:${P.legalEmail}`} className="text-blue-600 hover:underline">{P.legalEmail}</a>. سنبذل جهوداً معقولة لتسوية النزاعات وداً. وإذا تعذّرت التسوية الودية، فستخضع النزاعات لاختصاص المحاكم المختصة في المملكة العربية السعودية.</p>
        <p>لا يحدّ أي بند في هذه الشروط من حقك في تقديم شكوى إلى جهة حماية المستهلك المختصة في المملكة العربية السعودية.</p>
        <p><strong>اللغة:</strong> أُعدَّت هذه الشروط باللغتين العربية والإنجليزية. في حال وجود أي تعارض بين النسختين، يسود النص العربي بالقدر الذي يُوجبه القانون السعودي المعمول به. تهدف كلتا النسختين إلى الحصول على الأثر القانوني ذاته، ويُشجَّع المستخدمون على الاطلاع على كليهما.</p>
        <p><em>ملاحظة للمسؤول: يجب أن يؤكد محامٍ سعودي مؤهل بند اللغة الحاكمة وآلية تسوية النزاعات قبل النشر.</em></p>
      </>
    ),
  },

  // 24
  {
    id: 'contact',
    titleEn: 'Contact Information',
    titleAr: 'معلومات التواصل',
    contentEn: (
      <>
        <p>For questions, notices, or complaints regarding these Terms:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li><strong>Platform operator:</strong> {P.entity}</li>
          <li><strong>Commercial registration:</strong> {P.cr}</li>
          <li><strong>Business address:</strong> {P.address}</li>
          <li><strong>Legal notices email:</strong> <a href={`mailto:${P.legalEmail}`} className="text-blue-600 hover:underline">{P.legalEmail}</a></li>
          <li><strong>Privacy inquiries:</strong> <a href={`mailto:${P.privacyEmail}`} className="text-blue-600 hover:underline">{P.privacyEmail}</a></li>
          <li><strong>User support:</strong> <a href={`mailto:${P.supportEmail}`} className="text-blue-600 hover:underline">{P.supportEmail}</a></li>
        </ul>
        <p>We aim to respond to all written inquiries within 5 business days.</p>
      </>
    ),
    contentAr: (
      <>
        <p>للاستفسارات أو الإشعارات أو الشكاوى المتعلقة بهذه الشروط:</p>
        <ul className="list-disc ps-5 space-y-1">
          <li><strong>مشغّل المنصة:</strong> {P.entity}</li>
          <li><strong>السجل التجاري:</strong> {P.cr}</li>
          <li><strong>عنوان العمل:</strong> {P.address}</li>
          <li><strong>البريد الإلكتروني للإشعارات القانونية:</strong> <a href={`mailto:${P.legalEmail}`} className="text-blue-600 hover:underline">{P.legalEmail}</a></li>
          <li><strong>استفسارات الخصوصية:</strong> <a href={`mailto:${P.privacyEmail}`} className="text-blue-600 hover:underline">{P.privacyEmail}</a></li>
          <li><strong>دعم المستخدمين:</strong> <a href={`mailto:${P.supportEmail}`} className="text-blue-600 hover:underline">{P.supportEmail}</a></li>
        </ul>
        <p>نهدف إلى الرد على جميع الاستفسارات الكتابية خلال 5 أيام عمل.</p>
      </>
    ),
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function TermsOfService() {
  const summaryEn = (
    <>
      <p><strong>SDLE Compass is currently free.</strong> You will not be charged unless you separately agree to a paid plan in the future.</p>
      <p>If paid plans are introduced later, you will receive clear advance notice, see the full price and terms before paying, and be able to cancel future renewal at any time through your account settings.</p>
      <p>The Platform is an independent educational tool — not an official SCFHS service. AI outputs and practice scores are study aids, not examination guarantees.</p>
      <p>Do not upload confidential examination content. Your personal notes remain private.</p>
    </>
  );
  const summaryAr = (
    <>
      <p><strong>منصة SDLE Compass مجانية حالياً.</strong> لن يُقتطع منك أي مبلغ إلا إذا وافقت بشكل منفصل على خطة مدفوعة في المستقبل.</p>
      <p>إذا قُدِّمت خطط مدفوعة لاحقاً، فستتلقى إشعاراً مسبقاً واضحاً، وستطّلع على السعر الكامل والشروط قبل الدفع، وستتمكن من إلغاء التجديد المستقبلي في أي وقت عبر إعدادات حسابك.</p>
      <p>المنصة أداة تعليمية مستقلة وليست خدمة رسمية من الهيئة السعودية للتخصصات الصحية. مخرجات الذكاء الاصطناعي ونتائج التدريب وسائل دعم دراسي، وليست ضمانات لأداء الاختبار.</p>
      <p>لا ترفع محتوى اختبار سرياً. ملاحظاتك الشخصية تبقى خاصة.</p>
    </>
  );

  return (
    <LegalLayout
      titleEn="Terms of Service"
      titleAr="شروط الخدمة"
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
