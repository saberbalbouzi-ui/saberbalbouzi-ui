// ============================================================
// صفحة عرض ملف الراقي - Raqi Single Page
// ============================================================

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getRaqiBySlug,
  getReviews,
  addReview,
  incrementViewCount,
  trackRaqiClick,
  getRaqiStats,
  getRaqiProducts,
  getCountriesFromDb,
  getCitiesFromDb,
} from '@/lib/supabase';
import type { Raqi, Review, RaqiProduct } from '@/types';
import { Phone, MessageCircle, MapPin, Star, Eye, Clock, Facebook, Youtube, Instagram, ArrowRight, Loader2, AlertCircle, Send, User, ShoppingBag, Tag, ChevronLeft, ExternalLink, ShieldCheck, Crown, Globe, Building2, Share2, Copy, Check, Twitter, Mail, Linkedin } from 'lucide-react';

export default function RaqiSinglePage() {
  const { slug } = useParams<{ slug: string }>();

const [showShareMenu, setShowShareMenu] = useState(false);
const [linkCopied, setLinkCopied] = useState(false);
  const [raqi, setRaqi] = useState<Raqi | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<RaqiProduct[]>([]);
  const [stats, setStats] = useState({
    view_count: 0,
    phone_click_count: 0,
    whatsapp_click_count: 0,
  });

  const [countryName, setCountryName] = useState<string>('');
  const [stateName, setStateName] = useState<string>('');
  const [loadingLocation, setLoadingLocation] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showReviewForm, setShowReviewForm] = useState(false);
const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [contactUnavailable, setContactUnavailable] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const raqiData = await getRaqiBySlug(slug);
        if (!raqiData) {
          setError('لم يتم العثور على هذا الراقي');
          setLoading(false);
          return;
        }
        setRaqi(raqiData);

        incrementViewCount(slug).catch(() => undefined);

        const [reviewsData, statsData, productsData] = await Promise.all([
          getReviews(raqiData.id),
          getRaqiStats(raqiData.id),
          getRaqiProducts(raqiData.id),
        ]);

        setReviews(reviewsData);
        setStats(statsData);
        setProducts(productsData);

        await loadLocationNames(raqiData.country_code, raqiData.wilaya);
      } catch (err) {
        console.error('Load raqi error:', err);
        setError('تعذر تحميل بيانات الراقي');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug]);

  const loadLocationNames = async (countryCode?: string, wilayaValue?: string) => {
    if (!countryCode) return;
    setLoadingLocation(true);

    try {
      const countries = await getCountriesFromDb(true);
      const foundCountry = countries.find((c) => c.code === countryCode);
      if (foundCountry) {
        setCountryName(`${foundCountry.flag_emoji} ${foundCountry.name_ar}`);
      } else {
        setCountryName(countryCode);
      }

      if (wilayaValue) {
        const cities = await getCitiesFromDb(countryCode);
        const foundCity = cities.find(
          (c) =>
            c.id.toString() === wilayaValue ||
            c.name_ar === wilayaValue ||
            c.name_en === wilayaValue
        );
        setStateName(foundCity?.name_ar || wilayaValue);
      }
    } catch (err) {
      console.error('Load location error:', err);
      setCountryName(countryCode || '');
      setStateName(wilayaValue || '');
    } finally {
      setLoadingLocation(false);
    }
  };
const handlePhoneClick = async () => {
  
if (!raqi || !raqi.phone) return;
  const result = await trackRaqiClick(raqi.id, 'phone');

  if (!result.ok) {
    if (result.reason === 'insufficient_balance') {
      setContactUnavailable(true);
 return;
      // ✅ لا ترجع — دع المستخدم يرى التنبيه ويقرر
    } else {
      return; // أخطاء أخرى فقط
    }
  }

  setStats((s) => ({ ...s, phone_click_count: s.phone_click_count + 1 }));
  window.location.href = `tel:${raqi.phone}`;
};

const handleWhatsAppClick = async () => {
  if (!raqi || !raqi.whatsapp) return;
  const result = await trackRaqiClick(raqi.id, 'whatsapp');

  if (!result.ok) {
    if (result.reason === 'insufficient_balance') {
      setContactUnavailable(true);
 return;
      // ✅ لا ترجع
    } else {
      return;
    }
  }

  setStats((s) => ({ ...s, whatsapp_click_count: s.whatsapp_click_count + 1 }));
  window.open(`https://wa.me/${raqi.whatsapp}`, '_blank');
};
{/* ─── أزرار التواصل ─── */}
<div className="grid grid-cols-2 gap-3 mb-6">
  {raqi && raqi.phone && (  // ✅ أضف raqi &&
    <button
      onClick={handlePhoneClick}
      className="flex items-center justify-center gap-2 px-5 py-3.5 bg-[#166534] hover:bg-[#14532d] text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
    >
      <Phone className="w-5 h-5" />
      <span>اتصال</span>
    </button>
  )}
  {raqi && raqi.whatsapp && (  // ✅ أضف raqi &&
    <button
      onClick={handleWhatsAppClick}
      className="flex items-center justify-center gap-2 px-5 py-3.5 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
    >
      <MessageCircle className="w-5 h-5" />
      <span>واتساب</span>
    </button>
  )}
  
  {contactUnavailable && (
    <div className="col-span-2 flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-bold">
      <AlertCircle className="w-4 h-4 shrink-0" />
      عذراً، هذا الراقي غير متاح للتواصل حالياً. يرجى المحاولة لاحقاً.
    </div>
  )}
</div>


  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!raqi || !reviewerName.trim() || rating < 1) return;

    setSubmittingReview(true);
    try {
      await addReview({
        raqi_id: raqi.id,
        reviewer_name: reviewerName.trim(),
        rating,
        comment: comment.trim() || undefined,
      });

      const fresh = await getReviews(raqi.id);
      setReviews(fresh);
      setShowReviewForm(false);
      setReviewerName('');
      setComment('');
      setRating(5);
    } catch {
      alert('تعذر إرسال التقييم');
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatProductDescription = (description?: string | null) => {
    if (!description) {
      return (
        <div className="text-xs text-gray-400 italic">
          لا يوجد وصف تفصيلي
        </div>
      );
    }

    const lines = description.split('\n').filter((l) => l.trim());
    const sections: { title: string; items: string[] }[] = [];
    let currentSection: { title: string; items: string[] } | null = null;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (
        trimmed.endsWith(':') &&
        !trimmed.startsWith('-') &&
        !trimmed.startsWith('•')
      ) {
        if (currentSection) sections.push(currentSection);
        currentSection = { title: trimmed.replace(/:$/, ''), items: [] };
      } else if (
        (trimmed.startsWith('-') || trimmed.startsWith('•')) &&
        currentSection
      ) {
        currentSection.items.push(trimmed.replace(/^[-•]\s*/, ''));
      } else if (trimmed && currentSection) {
        currentSection.items.push(trimmed);
      }
    });

    if (currentSection) sections.push(currentSection);

    if (sections.length === 0) {
      return <p className="text-xs text-gray-600 leading-relaxed">{description}</p>;
    }

    return (
      <div className="space-y-3">
        {sections.map((section, idx) => (
          <div key={idx}>
            <h4 className="text-xs font-bold text-[#166534] mb-1.5 flex items-center gap-1">
              <ChevronLeft className="w-3 h-3" />
              {section.title}
            </h4>
            {section.items.length > 0 ? (
              <ul className="space-y-1 pr-3">
                {section.items.map((item, i) => (
                  <li
                    key={i}
                    className="text-xs text-gray-600 leading-relaxed flex items-start gap-1.5"
                  >
                    <span className="text-[#166534] mt-1.5 shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-400 pr-3">...</p>
            )}
          </div>
        ))}
      </div>
    );
  };

 const averageRating = reviews.length > 0
  ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
  : '0';

const shareUrl = window.location.href;

const shareText = raqi
  ? `${raqi.full_name} - ${raqi.speciality || 'راقي شرعي'}`
  : 'صفحة الراقي';

const handleShare = async () => {
  if (!raqi) return;

  if (navigator.share) {
    try {
      await navigator.share({
        title: raqi.full_name,
        text: shareText,
        url: shareUrl,
      });
    } catch {
      // ألغى المستخدم المشاركة
    }
  } else {
    setShowShareMenu((previous) => !previous);
  }
};

const copyLink = async () => {
  await navigator.clipboard.writeText(shareUrl);
  setLinkCopied(true);
  setTimeout(() => setLinkCopied(false), 2000);
};

const shareLinks = [
  { name: 'واتساب', icon: MessageCircle, color: 'bg-[#25D366]', href: `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}` },
  { name: 'فيسبوك', icon: Facebook, color: 'bg-[#1877F2]', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
  { name: 'إكس (تويتر)', icon: Twitter, color: 'bg-black', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}` },
  { name: 'تيليجرام', icon: Send, color: 'bg-[#229ED9]', href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}` },
  { name: 'لينكدإن', icon: Linkedin, color: 'bg-[#0A66C2]', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
  { name: 'البريد الإلكتروني', icon: Mail, color: 'bg-gray-600', href: `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareUrl)}` },
];
   

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-[#166534]" />
          <p className="text-sm">جاري تحميل بيانات الراقي...</p>
        </div>
      </div>
    );
  }

  if (error || !raqi) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md mx-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {error || 'الراقي غير موجود'}
          </h2>
          <Link
            to="/"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-[#166534] text-white rounded-xl hover:bg-[#14532d] transition-colors font-bold"
          >
            <ArrowRight className="w-4 h-4" />
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20" dir="rtl">
      {/* ─── Header ─── */}
      <div className="bg-gradient-to-br from-[#166534] to-[#14532d] text-white pt-8 pb-16 px-4">
 <div className="max-w-3xl mx-auto">
  <div className="flex items-center justify-between mb-6">
    {/* العودة للرئيسية */}
    <Link
      to="/"
      className="inline-flex items-center gap-1 text-white/80 hover:text-white text-sm transition-colors"
    >
      <ArrowRight className="w-4 h-4" />
      العودة للرئيسية
    </Link>

    {/* زر المشاركة */}
    <div className="relative">
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-sm font-bold backdrop-blur-sm transition-all active:scale-95"
      >
        <Share2 className="w-4 h-4" />
        انشر
      </button>

      {showShareMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowShareMenu(false)}
          />

          <div className="absolute left-0 top-full mt-2 z-50 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2">
            {shareLinks.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowShareMenu(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <span
                    className={`p-1.5 rounded-lg ${item.color} text-white shrink-0`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>

                  <span className="text-sm font-bold text-gray-700">
                    {item.name}
                  </span>
                </a>
              );
            })}

            <button
              type="button"
              onClick={copyLink}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors border-t border-gray-100 mt-1 pt-3"
            >
              <span className="p-1.5 rounded-lg bg-[#166534] text-white shrink-0">
                {linkCopied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </span>

              <span className="text-sm font-bold text-gray-700">
                {linkCopied ? "تم النسخ!" : "نسخ الرابط"}
              </span>
            </button>
          </div>
        </>
      )}
   </div>
  </div>
 

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative shrink-0">
              {raqi.profile_image_url ? (
                <img
                  src={raqi.profile_image_url}
                  alt={raqi.full_name}
                  className="w-28 h-28 md:w-36 md:h-36 rounded-2xl object-cover border-4 border-white/20 shadow-xl"
                />
              ) : (
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-white/10 flex items-center justify-center border-4 border-white/20">
                  <User className="w-12 h-12 text-white/50" />
                </div>
              )}
            </div>

            <div className="text-center md:text-right flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                {raqi.verified_badge && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/30 text-white border border-blue-400/40 font-bold text-sm backdrop-blur-sm">
                    <ShieldCheck className="w-4 h-4" />
                    موثّق
                  </span>
                )}
                {raqi.featured_badge && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/30 text-yellow-100 border border-yellow-400/40 font-bold text-sm backdrop-blur-sm">
                    <Crown className="w-4 h-4" />
                    متميّز
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold mb-2">{raqi.full_name}</h1>
              {raqi.speciality && (
                <p className="text-white/80 text-lg mb-3">{raqi.speciality}   </p>
              )}
            </div>
          </div>
        </div>
      </div>

 

   

      <div className="max-w-3xl mx-auto px-4 -mt-8">
        {/* ═══════════════════════════════════════════════════════
            ─── الإحصائيات المُلوّنة والواضحة ───
            ═══════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {/* المشاهدات */}
          <div className="bg-blue-50 rounded-2xl shadow-md border border-blue-100 p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-blue-600 text-xs font-bold mb-2">
              <div className="p-1.5 rounded-full bg-blue-100">
                <Eye className="w-4 h-4 text-blue-600" />
              </div>
              <span>المشاهدات</span>
            </div>
            <p className="text-2xl font-extrabold text-blue-700">
              {stats.view_count.toLocaleString('ar-DZ')}
            </p>
          </div>

          {/* الاتصالات */}
          <div className="bg-emerald-50 rounded-2xl shadow-md border border-emerald-100 p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-emerald-600 text-xs font-bold mb-2">
              <div className="p-1.5 rounded-full bg-emerald-100">
                <Phone className="w-4 h-4 text-emerald-600" />
              </div>
              <span>الاتصالات</span>
            </div>
            <p className="text-2xl font-extrabold text-emerald-700">
              {stats.phone_click_count.toLocaleString('ar-DZ')}
            </p>
          </div>

          {/* الواتساب */}
          <div className="bg-green-50 rounded-2xl shadow-md border border-green-100 p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-green-600 text-xs font-bold mb-2">
              <div className="p-1.5 rounded-full bg-green-100">
                <MessageCircle className="w-4 h-4 text-green-600" />
              </div>
              <span>واتساب</span>
            </div>
            <p className="text-2xl font-extrabold text-green-700">
              {stats.whatsapp_click_count.toLocaleString('ar-DZ')}
            </p>
          </div>
        </div>

        {/* ─── أزرار التواصل ─── */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {raqi.phone && (
            <button
              onClick={handlePhoneClick}
              className="flex items-center justify-center gap-2 px-5 py-3.5 bg-[#166534] hover:bg-[#14532d] text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <Phone className="w-5 h-5" />
              <span>اتصال</span>
            </button>
          )}
          {raqi.whatsapp && (
            <button
              onClick={handleWhatsAppClick}
              className="flex items-center justify-center gap-2 px-5 py-3.5 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <MessageCircle className="w-5 h-5" />
              <span>واتساب</span>
            </button>
          )}

                    {contactUnavailable && (
            <div className="col-span-2 flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              عذراً، هذا الراقي غير متاح للتواصل حالياً. يرجى المحاولة لاحقاً.
            </div>
          )}
        </div>

        {/* ─── التفاصيل ─── */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6 space-y-5">
          {raqi.bio && (
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-[#166534]" />
                النبذة
              </h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                {raqi.bio}
              </p>
            </div>
          )}

          {raqi.experience_years !== undefined && raqi.experience_years > 0 && (
            <div className="flex items-center gap-3 text-gray-700">
              <Clock className="w-4 h-4 text-[#166534] shrink-0" />
              <span className="font-bold text-sm">سنوات الخبرة:</span>
              <span className="text-sm">{raqi.experience_years} سنة</span>
            </div>
          )}

          <div className="flex items-center gap-3 text-gray-700">
            <Globe className="w-4 h-4 text-[#166534] shrink-0" />
            <span className="font-bold text-sm">البلد:</span>
            <span className="text-sm">
              {loadingLocation ? (
                <Loader2 className="w-3 h-3 animate-spin inline" />
              ) : (
                countryName || raqi.country_code || '—'
              )}
            </span>
          </div>

          <div className="flex items-center gap-3 text-gray-700">
            <Building2 className="w-4 h-4 text-[#166534] shrink-0" />
            <span className="font-bold text-sm">الولاية:</span>
            <span className="text-sm">
              {loadingLocation ? (
                <Loader2 className="w-3 h-3 animate-spin inline" />
              ) : (
                stateName || raqi.wilaya || '—'
              )}
            </span>
          </div>

          {raqi.address && (
            <div className="flex items-center gap-3 text-gray-700">
              <MapPin className="w-4 h-4 text-[#166534] shrink-0" />
              <span className="font-bold text-sm">العنوان:</span>
              <span className="text-sm">{raqi.address}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
            {raqi.facebook_url && (
              <a href={raqi.facebook_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-sm font-bold">
                <Facebook className="w-4 h-4" /> فيسبوك
              </a>
            )}
            {raqi.youtube_url && (
              <a href={raqi.youtube_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm font-bold">
                <Youtube className="w-4 h-4" /> يوتيوب
              </a>
            )}
            {raqi.instagram_url && (
              <a href={raqi.instagram_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors text-sm font-bold">
                <Instagram className="w-4 h-4" /> انستغرام
              </a>
            )}
            {raqi.tiktok_url && (
              <a href={raqi.tiktok_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors text-sm font-bold">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
                تيك توك
              </a>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            ─── 🛒 المتجر (عمودين + عنوان أكبر + زر واضح) ───
            ═══════════════════════════════════════════════════════ */}
        {products.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-[#166534]/10">
                <ShoppingBag className="w-6 h-6 text-[#166534]" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#166534]">متجر الراقي</h2>
              <span className="mr-auto text-sm font-bold text-white bg-[#166534] px-3 py-1.5 rounded-full">
                {products.length} منتج
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group rounded-xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all bg-white flex flex-col"
                >
                  <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ShoppingBag className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  <div className="p-3 flex-1 flex flex-col">
                    <h3 className="font-bold text-gray-800 mb-1.5 text-xs leading-snug line-clamp-2">
                      {product.name}
                    </h3>

                   <div className="mb-3 flex-1">
  {product.description && (
    <button
      type="button"
      onClick={() =>
        setExpandedProductId(prev => (prev === product.id ? null : product.id))
      }
      className="flex items-center gap-1 text-xs font-bold text-[#166534] hover:text-[#14532d] transition-colors"
    >
      <ChevronLeft
        className={`w-3.5 h-3.5 transition-transform duration-300 ${
          expandedProductId === product.id ? '-rotate-90' : ''
        }`}
      />
      وصف المنتج
    </button>
  )}

  {expandedProductId === product.id && (
    <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
      {formatProductDescription(product.description)}
    </div>
  )}
</div>

                    <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <Tag className="w-3 h-3 text-[#166534]" />
                        <span className="text-base font-bold text-[#166534]">
                          {product.price?.toLocaleString('ar-DZ')}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold">
                          {product.currency || 'د.ج'}
                        </span>
                      </div>

                      {raqi.whatsapp && (
                        <a
                          href={`https://wa.me/${raqi.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `السلام عليكم أخي الراقي ${raqi.full_name}،\n\nأرغب في طلب المنتج التالي:\n\n📦 *${product.name}*\n💰 السعر: ${product.price?.toLocaleString('ar-DZ')} ${product.currency || 'د.ج'}\n\nيرجى إرسال تفاصيل الطلب.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white text-xs font-extrabold hover:shadow-lg hover:shadow-green-500/30 hover:scale-105 transition-all active:scale-95 tracking-wide"
                        >
                          <MessageCircle className="w-4 h-4 fill-white" />
                          <span>اطلب الآن</span>
                          <ExternalLink className="w-3 h-3 opacity-80" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── التقييمات ─── */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800">التقييمات</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(Number(averageRating))
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {averageRating} ({reviews.length} تقييم)
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowReviewForm((p) => !p)}
              className="px-4 py-2 rounded-xl bg-[#166534] text-white text-sm font-bold hover:bg-[#14532d] transition-colors"
            >
              {showReviewForm ? 'إلغاء' : 'أضف تقييم'}
            </button>
          </div>

          {showReviewForm && (
            <form
              onSubmit={handleSubmitReview}
              className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4"
            >
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">اسمك</label>
                <input
                  type="text"
                  required
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/20 outline-none transition-all"
                  placeholder="اكتب اسمك"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">التقييم</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">تعليق (اختياري)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/20 outline-none transition-all resize-none"
                  placeholder="اكتب تجربتك مع هذا الراقي..."
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#166534] text-white rounded-xl font-bold hover:bg-[#14532d] transition-all disabled:opacity-50"
              >
                {submittingReview ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    إرسال التقييم
                  </>
                )}
              </button>
            </form>
          )}

          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">
                لا توجد تقييمات بعد. كن أول من يقيّم!
              </p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#166534]/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-[#166534]" />
                      </div>
                      <span className="font-bold text-sm text-gray-800">{review.reviewer_name}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= review.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-600 text-sm leading-relaxed pr-10">{review.comment}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}