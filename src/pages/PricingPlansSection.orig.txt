import React from 'react';
import {
  Shield,
  Award,
  Crown,
  MessageCircle,
  Mail,
  Sparkles,
  Check,
  ArrowRight,
  Zap,
} from 'lucide-react';

type CountryCode = 'DZ' | 'MA' | 'TN' | 'EG' | 'SA' | 'AE';
type AccentColor = 'emerald' | 'amber' | 'purple';
type PriceType = 'verified' | 'featured';

type CountryPrices = {
  verifiedMonthly: string;
  verifiedYearly: string;
  featuredMonthly: string;
  featuredYearly: string;
};

type Plan = {
  key: string;
  badge: string;
  credits: string;
  highlight: boolean;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: AccentColor;
  priceType?: PriceType;
  features: string[];
  cta: string;
  external: boolean;
  ctaStyle: string;
};

const ADMIN_WHATSAPP_NUMBER = '213541138189';

const COUNTRY_NAMES: Record<CountryCode, string> = {
  DZ: 'الجزائر',
  MA: 'المغرب',
  TN: 'تونس',
  EG: 'مصر',
  SA: 'السعودية',
  AE: 'الإمارات',
};

const COUNTRY_PRICES: Record<CountryCode, CountryPrices> = {
  DZ: {
    verifiedMonthly: '900 دج',
    verifiedYearly: '9,900 دج',
    featuredMonthly: '1,200 دج',
    featuredYearly: '13,200 دج',
  },
  MA: {
    verifiedMonthly: '99 درهم',
    verifiedYearly: '990 درهم',
    featuredMonthly: '129 درهم',
    featuredYearly: '1,290 درهم',
  },
  TN: {
    verifiedMonthly: '29 د.ت',
    verifiedYearly: '319 د.ت',
    featuredMonthly: '39 د.ت',
    featuredYearly: '429 د.ت',
  },
  EG: {
    verifiedMonthly: '299 جنيه',
    verifiedYearly: '2,990 جنيه',
    featuredMonthly: '399 جنيه',
    featuredYearly: '3,990 جنيه',
  },
  SA: {
    verifiedMonthly: '29 ريال',
    verifiedYearly: '290 ريال',
    featuredMonthly: '39 ريال',
    featuredYearly: '390 ريال',
  },
  AE: {
    verifiedMonthly: '29 درهم',
    verifiedYearly: '290 درهم',
    featuredMonthly: '39 درهم',
    featuredYearly: '390 درهم',
  },
};

const PLANS: Plan[] = [
  {
    key: 'certified',
    badge: 'معتمد',
    credits: '   5 رصيد تواصل مهدي كل شهر ',
    highlight: false,
    icon: Shield,
    accentColor: 'emerald',
    features: [
      'ظهور في الولاية',
      'التواصل عبر الهاتف',
      'التواصل عبر واتساب',
      '',
      '',
    ],
    cta: 'ابدأ مجاناً',
    external: false,
    ctaStyle:
      'bg-gradient-to-br from-[#1f6f50] to-[#15523b] text-white hover:shadow-xl',
  },
  {
    key: 'verified',
    badge: 'موثق',
    credits: '9 رصيد تواصل مهدي كل شهر ',
    highlight: true,
    icon: Award,
    accentColor: 'amber',
    priceType: 'verified',
    features: [
      'ظهور قبل المعتمد في الولاية',
      'التواصل عبر الهاتف',
      'التواصل عبر واتساب',
      'إضافة صفحة فيسبوك',
      'أولوية في الظهور',
    ],
    cta: 'اشترك الآن',
    external: true,
    ctaStyle:
      'bg-gradient-to-br from-[#f59e0b] to-[#d97706] text-white hover:shadow-xl',
  },
  {
    key: 'featured',
    badge: 'متميز',
    credits: '12  رصيد تواصل مهدي كل شهر ',
    highlight: false,
    icon: Crown,
    accentColor: 'purple',
    priceType: 'featured',
    features: [
      'ظهور في واجهة التطبيق',
      'ظهور قبل الموثق في الولاية',
      'التواصل عن طريق الهاتف وواتساب',
      'إضافة فيسبوك وانستغرام وتيك توك ويوتيوب',
      'إضافة متجر منتجات',
    ],
    cta: 'اشترك الآن',
    external: true,
    ctaStyle:
      'bg-gradient-to-br from-[#7c3aed] to-[#5b21b6] text-white hover:shadow-xl',
  },
];

function ContactAdminCTA() {
  const whatsappMessage = encodeURIComponent(
    'السلام عليكم، أرغب في الاستفسار عن اشتراكات منصة دليل الرقاة.'
  );

  const whatsappUrl =
    `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${whatsappMessage}`;

  const emailAddress = 'contact.roqat@gmail.com';
  const emailSubject = encodeURIComponent(
    'استفسار حول اشتراكات منصة دليل الرقاة'
  );
  const emailBody = encodeURIComponent(
    'السلام عليكم،\n\n' +
      'أرغب في الاستفسار عن اشتراكات منصة دليل الرقاة.\n' +
      'يرجى تزويدي بالتفاصيل المتاحة.\n\n' +
      'الاسم:\n' +
      'رقم الهاتف:\n' +
      'نوع الاستفسار:\n\n' +
      'وشكرًا لكم.'
  );

  const emailUrl =
    `https://mail.google.com/mail/?view=cm&fs=1&to=${emailAddress}&su=${emailSubject}&body=${emailBody}`;

  return (
    <div className="rounded-3xl bg-white/10 backdrop-blur-sm border border-white/15 p-6 md:p-8 text-center">
      <div className="inline-flex items-center rounded-full bg-white/10 text-[#f1d27b] border border-[#d8b24c]/30 px-4 py-1.5 text-xs font-extrabold mb-4">
        الاشتراكات والتواصل
      </div>

      <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
        لشحن رصيدك، تواصل مع إدارة المنصة
      </h2>

      <p className="text-white/60 leading-8 max-w-2xl mx-auto mb-8">
        للاستفسار عن الاشتراكات، التفعيل، أو أي أسئلة عامة، يمكنك التواصل معنا مباشرة.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto min-w-[260px] h-14 inline-flex items-center justify-center rounded-2xl bg-[#25D366] hover:bg-[#1ebe5b] text-white font-extrabold shadow-lg transition-all hover:-translate-y-0.5"
          aria-label="تواصل مع إدارة المنصة عبر واتساب"
        >
          <MessageCircle className="w-5 h-5 ml-2" />
          تواصل عبر واتساب
        </a>

        <a
          href={emailUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto min-w-[260px] h-14 inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold transition-all"
          aria-label={`راسل إدارة المنصة عبر البريد الإلكتروني ${emailAddress}`}
        >
          <Mail className="w-5 h-5 ml-2" />
          راسلنا عبر الإيميل
        </a>
      </div>

      <p className="text-sm text-white/40 mt-5 leading-7">
        واتساب للاستفسارات السريعة، والإيميل للمراسلات الرسمية أو التفاصيل المطولة.
      </p>

      <p className="text-xs text-white/30 mt-2">
        البريد الإلكتروني: {emailAddress}
      </p>
    </div>
  );
}

export default function PricingPlansSection() {
  const [selectedCountry, setSelectedCountry] =
    React.useState<CountryCode>('DZ');

  const selectedPrices = COUNTRY_PRICES[selectedCountry];

  const subscriptionMessage = encodeURIComponent(
    `السلام عليكم، أريد طلب تطوير الحساب والاشتراك.\nالدولة: ${COUNTRY_NAMES[selectedCountry]}`
  );

  const adminWhatsAppSubscriptionUrl =
    `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${subscriptionMessage}`;

  return (
    <section className="bg-gradient-to-b from-[#0a2e1a] via-[#0d3b22] to-[#0a2e1a] py-16 px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-[#25D366] blur-[120px]" />
        <div className="absolute bottom-20 left-10 w-72 h-72 rounded-full bg-[#f59e0b] blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#7c3aed] blur-[150px]" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center rounded-full bg-white/10 text-[#f1d27b] border border-[#d8b24c]/40 px-5 py-2 text-sm font-extrabold mb-5 backdrop-blur-sm">
            
            عروض حصرية
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-5 leading-tight">
            طور حسابك
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f1d27b] to-[#f59e0b]">
              {' '}واصنع الفرق
            </span>
          </h2>

          <p className="text-white/70 text-lg max-w-2xl mx-auto leading-9">
            اختر بلدك لعرض السعر المناسب، ثم اختر الباقة التي تساعدك على الوصول
            إلى المزيد من الزوار وبناء سمعتك بشكل أسرع.
          </p>
        </div>

        <div className="flex justify-center mb-10">
          <label className="flex flex-col items-center gap-2 text-white">
            <span className="text-sm font-bold text-white/70">
              اختر بلدك لعرض الأسعار
            </span>

            <select
              value={selectedCountry}
              onChange={(event) =>
                setSelectedCountry(event.target.value as CountryCode)
              }
              className="min-w-[240px] h-12 rounded-2xl border border-white/20 bg-[#164d30] px-5 text-center font-bold text-white outline-none focus:border-[#f1d27b]"
            >
              {Object.entries(COUNTRY_NAMES).map(([code, name]) => (
                <option key={code} value={code} className="bg-[#0d3b22] text-white">
                  {name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {PLANS.map((plan) => {
            const Icon = plan.icon;

            const accentClasses =
              plan.accentColor === 'emerald'
                ? {
                    bar: 'from-emerald-400 to-emerald-600',
                    icon: 'bg-emerald-500/20 text-emerald-400',
                    check: 'bg-emerald-500/30 text-emerald-300',
                  }
                : plan.accentColor === 'amber'
                ? {
                    bar: 'from-amber-400 to-amber-600',
                    icon: 'bg-amber-500/20 text-amber-400',
                    check: 'bg-amber-500/30 text-amber-300',
                  }
                : {
                    bar: 'from-purple-400 to-purple-600',
                    icon: 'bg-purple-500/20 text-purple-400',
                    check: 'bg-purple-500/30 text-purple-300',
                  };

            const price =
              plan.priceType === 'verified'
                ? {
                    monthly: selectedPrices.verifiedMonthly,
                    yearly: selectedPrices.verifiedYearly,
                  }
                : plan.priceType === 'featured'
                ? {
                    monthly: selectedPrices.featuredMonthly,
                    yearly: selectedPrices.featuredYearly,
                  }
                : {
                    monthly: 'مجاناً',
                    yearly: 'بدون رسوم',
                  };

            const planHref =
              plan.key === 'certified'
                ? '#/register'
                : adminWhatsAppSubscriptionUrl;

            return (
              <div
                key={plan.key}
                className={`relative rounded-3xl overflow-hidden border backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-[#f59e0b]/20 to-[#d97706]/10 border-[#f59e0b]/40 shadow-lg shadow-[#f59e0b]/10'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className={`h-1.5 w-full bg-gradient-to-r ${accentClasses.bar}`} />

                <div className="p-7">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${accentClasses.icon}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-white">
                        {plan.badge}
                      </h3>
                      <p className="text-white/50 text-sm">{plan.credits}</p>
                    </div>
                  </div>

                  <div className="mb-6 space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-white">
                        {price.monthly}
                      </span>
                      <span className="text-white/50 text-sm">
                        {plan.priceType ? 'شهرياً' : ''}
                      </span>
                    </div>

                    {plan.priceType && (
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold text-white/90">
                          {price.yearly}
                        </span>
                        <span className="text-white/50 text-sm">سنوياً</span>
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li
                        key={`${plan.key}-${index}`}
                        className="flex items-center gap-2.5 text-white/80 text-sm leading-7"
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${accentClasses.check}`}>
                          <Check className="w-3 h-3" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={planHref}
                    target={plan.external ? '_blank' : undefined}
                    rel={plan.external ? 'noopener noreferrer' : undefined}
                    className={`w-full py-3.5 rounded-2xl font-extrabold text-base shadow-lg transition-all flex items-center justify-center gap-2 ${plan.ctaStyle}`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-5 h-5" />
                  </a>
                </div>

                {plan.highlight && (
                  <div className="absolute inset-0 bg-gradient-to-t from-[#f59e0b]/5 to-transparent pointer-events-none rounded-3xl" />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 mb-10 text-white/50 text-sm">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#f1d27b]" />
            <span>تفعيل فوري</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>دعم فني على مدار الساعة</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-blue-400" />
            <span>إلغاء في أي وقت</span>
          </div>
        </div>

        <ContactAdminCTA />
      </div>
    </section>
  );
}
