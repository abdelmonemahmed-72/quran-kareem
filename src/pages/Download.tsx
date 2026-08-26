import { useState } from 'react';
import {
  BookOpen,
  Download as DownloadIcon,
  Headphones,
  Search,
  ShieldCheck,
  Smartphone,
  Moon,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

const APK_URL =
  'https://github.com/abdelmonemahmed-72/quran-kareem/releases/latest/download/quran-kareem.apk';
const features = [
  {
    icon: BookOpen,
    title: 'قراءة مريحة',
    text: 'واجهة هادئة ومريحة لقراءة القرآن الكريم على الموبايل والكمبيوتر.',
  },
  {
    icon: Headphones,
    title: 'تلاوة صوتية',
    text: 'استمع إلى القرآن الكريم بسهولة مع مشغل صوتي داخل التطبيق.',
  },
  {
    icon: Search,
    title: 'بحث سريع',
    text: 'ابحث عن السور والآيات والوصول إلى ما تريد بسرعة.',
  },
  {
    icon: Moon,
    title: 'وضع مريح',
    text: 'تصميم يدعم الوضع الداكن لتجربة أفضل ليلًا.',
  },
  {
    icon: Smartphone,
    title: 'مصمم للموبايل',
    text: 'تجربة Responsive تعمل بسلاسة على مختلف أحجام الشاشات.',
  },
  {
    icon: ShieldCheck,
    title: 'خصوصيتك أولًا',
    text: 'صفحة مخصصة لسياسة الخصوصية ومعلومات واضحة عن التطبيق.',
  },
];

const steps = [
  'اضغط على زر «تحميل التطبيق».',
  'انتظر اكتمال تحميل ملف APK.',
  'افتح الملف من الإشعارات أو مجلد التنزيلات.',
  'اسمح بالتثبيت من هذا المصدر إذا طلب Android ذلك.',
];

export default function Download() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <main dir="rtl" className="download-page">
      <section className="download-hero">
        <div className="download-hero-glow" />

        <div className="download-nav">
          <a
            className="download-brand"
            href="/"
            aria-label="العودة إلى التطبيق"
          >
            <img
              src="/icons/icon-192.png"
              alt="شعار القرآن الكريم"
            />
            <span>القرآن الكريم</span>
          </a>

          <a className="download-nav-link" href="#features">
            المميزات
          </a>

          <a className="download-nav-link" href="#install">
            طريقة التثبيت
          </a>
        </div>

        <div className="download-hero-grid">
          <div className="download-copy">
            <span className="download-eyebrow">
              <Sparkles size={15} />
              القرآن الكريم بين يديك
            </span>

            <h1>
              تجربة هادئة لقراءة
              <br />
              <span>القرآن الكريم</span>
            </h1>

            <p>
              اقرأ، استمع، ابحث واحفظ ما تريد في تطبيق واحد
              بتصميم بسيط ومريح.
            </p>

            <div className="download-actions">
              <a
                className="download-main-btn"
                href={APK_URL}
                download
              >
                <DownloadIcon size={20} />
                تحميل التطبيق APK
              </a>

              <a
                className="download-secondary-btn"
                href="#features"
              >
                اكتشف المميزات
              </a>
            </div>

            <div className="download-note">
              <ShieldCheck size={16} />
              ملف APK مخصص لنظام Android
            </div>
          </div>

          <div
            className="download-device-wrap"
            aria-label="معاينة التطبيق"
          >
            <div className="download-device">
              <div className="download-device-top">
                <span />
                <span />
                <span />
              </div>

              <div className="download-device-screen">
                <div className="mock-header">
                  <span>القرآن الكريم</span>
                  <span>☾</span>
                </div>

                <div className="mock-card">
                  <div className="mock-arabic">
                    وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا
                  </div>

                  <div className="mock-line" />
                  <div className="mock-line short" />
                </div>

                <div className="mock-section-title">
                  السور
                </div>

                {[
                  ['الفاتحة', '7 آيات'],
                  ['البقرة', '286 آية'],
                  ['آل عمران', '200 آية'],
                ].map(([name, count]) => (
                  <div
                    className="mock-surah"
                    key={name}
                  >
                    <span className="mock-number">
                      {name === 'الفاتحة'
                        ? '1'
                        : name === 'البقرة'
                          ? '2'
                          : '3'}
                    </span>

                    <span>
                      <b>{name}</b>
                      <small>{count}</small>
                    </span>

                    <span>›</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="download-device-shadow" />
          </div>
        </div>
      </section>

      <section
        id="features"
        className="download-section"
      >
        <div className="download-section-heading">
          <span>لماذا التطبيق؟</span>

          <h2>كل ما تحتاجه في مكان واحد</h2>

          <p>
            واجهة مصممة لتجعل علاقتك بالقرآن أبسط وأكثر راحة.
          </p>
        </div>

        <div className="download-feature-grid">
          {features.map(
            ({ icon: Icon, title, text }) => (
              <article
                className="download-feature"
                key={title}
              >
                <div className="download-feature-icon">
                  <Icon size={21} />
                </div>

                <h3>{title}</h3>

                <p>{text}</p>
              </article>
            ),
          )}
        </div>
      </section>

      <section className="download-showcase">
        <div>
          <span className="download-section-kicker">
            تجربة بسيطة
          </span>

          <h2>واجهة نظيفة بدون تعقيد</h2>

          <p>
            وصول سريع إلى القراءة، البحث، الصوت والأذكار
            من خلال تجربة موحدة.
          </p>
        </div>

        <div className="showcase-cards">
          <div className="showcase-mini">
            <BookOpen size={22} />
            <b>القرآن</b>
            <small>تصفح السور والآيات</small>
          </div>

          <div className="showcase-mini">
            <Headphones size={22} />
            <b>الصوت</b>
            <small>استمع أثناء القراءة</small>
          </div>

          <div className="showcase-mini">
            <Search size={22} />
            <b>البحث</b>
            <small>اعثر على الآيات بسرعة</small>
          </div>
        </div>
      </section>

      <section
        id="install"
        className="download-section install-section"
      >
        <div className="download-section-heading">
          <span>ابدأ الآن</span>

          <h2>تحميل التطبيق على Android</h2>

          <p>
            التثبيت بسيط، وفي أول مرة قد يطلب منك Android
            السماح بالتثبيت من مصدر غير معروف.
          </p>
        </div>

        <div className="install-layout">
          <div className="install-steps">
            {steps.map((step, index) => (
              <div
                className="install-step"
                key={step}
              >
                <span>{index + 1}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>

          <div className="install-card">
            <img
              src="/icons/icon-192.png"
              alt="القرآن الكريم"
            />

            <h3>القرآن الكريم</h3>

            <p>
              آخر نسخة متاحة من تطبيق Android
            </p>

            <a
              className="download-main-btn full"
              href={APK_URL}
              download
            >
              <DownloadIcon size={19} />
              تحميل APK
            </a>

            <small>
              سيبدأ التنزيل مباشرة عند توفر الملف.
            </small>
          </div>
        </div>
      </section>

      <section className="download-faq">
        <div className="download-section-heading">
          <span>الأسئلة الشائعة</span>

          <h2>هل لديك سؤال؟</h2>
        </div>

        <div className="faq-list">
          {[
            [
              'هل التطبيق يعمل على Android فقط؟',
              'ملف APK مخصص لأجهزة Android، بينما صفحة الويب نفسها تعمل على الموبايل والكمبيوتر.',
            ],
            [
              'هل أحتاج إلى حساب؟',
              'صفحة التحميل لا تتطلب حسابًا. تفاصيل الحساب، إن وُجدت، تعتمد على النسخة الحالية من التطبيق.',
            ],
            [
              'أين أجد سياسة الخصوصية؟',
              'يمكن إضافة صفحة Privacy Policy مستقلة وربطها من أسفل الصفحة قبل نشر الموقع رسميًا.',
            ],
          ].map(([question, answer], index) => (
            <div
              className={`faq-item ${
                open === index ? 'open' : ''
              }`}
              key={question}
            >
              <button
                onClick={() =>
                  setOpen(
                    open === index ? null : index,
                  )
                }
                aria-expanded={open === index}
              >
                <span>{question}</span>

                <ChevronDown size={19} />
              </button>

              {open === index && (
                <p>{answer}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <footer className="download-footer">
        <div className="download-brand">
          <img
            src="/icons/icon-192.png"
            alt=""
          />

          <span>القرآن الكريم</span>
        </div>

        <div>
          نسأل الله أن يجعل القرآن نورًا لقلوبنا.
        </div>

        <div className="footer-links">
          <a href="/">فتح التطبيق</a>

          <a href="#install">
            تحميل APK
          </a>

          <a href="/privacy">
            Privacy Policy
          </a>
        </div>
      </footer>
    </main>
  );
}