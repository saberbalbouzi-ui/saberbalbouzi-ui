import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getRaqis, mockWilayas } from '@/lib/supabase';
import { azkarCategories, duaaAnbiya } from '@/data/azkar';
import type { ZekrCategory } from '@/data/azkar';
import type { Raqi } from '@/types';
import {
  Sunrise,
  Sunset,
  Moon,
  Sparkles,
  Star,
  Shield,
  AlarmClock,
  Heart,
  Hand,
  BookOpen,
  ChevronUp,
  ChevronLeft,
  Search,
  Users,
  Award,
  MapPin,
  Loader2,
  Home as HomeIcon,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Sunrise,
  Sunset,
  Moon,
  Sparkles,
  Star,
  Shield,
  AlarmClock,
  Heart,
  Hand,
  BookOpen,
};

// Azkar Section Component
function AzkarSection() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [categoryData, setCategoryData] = useState<ZekrCategory | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (activeCategory) {
      const cat = azkarCategories.find((c) => c.id === activeCategory);
      setCategoryData(cat || null);

      const initialCounts: Record<string, number> = {};
      cat?.azkar.forEach((z, i) => {
        initialCounts[`${cat.id}-${i}`] = z.count ?? 0;
      });

      setCounts((prev) => ({ ...prev, ...initialCounts }));
    } else {
      setCategoryData(null);
    }
  }, [activeCategory]);

  const handleCount = (catId: string, idx: number, target: number) => {
    const key = `${catId}-${idx}`;
    setCounts((prev) => {
      const current = prev[key] ?? target;
      return { ...prev, [key]: Math.max(0, current - 1) };
    });
  };

  const handleReset = (catId: string, idx: number, target: number) => {
    const key = `${catId}-${idx}`;
    setCounts((prev) => ({ ...prev, [key]: target }));
  };

  const handleHide = () => {
    setActiveCategory(null);
    setCategoryData(null);
  };

  return (
    <section className="bg-[#0a4d2e] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-center text-white text-2xl md:text-3xl font-extrabold mb-6">
          الأذكار والأدعية
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-8">
          {azkarCategories.map((cat) => {
            const Icon = iconMap[cat.icon] || Star;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(isActive ? null : cat.id)}
                className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-bold transition-all duration-200 min-h-[48px] ${
                  isActive
                    ? 'bg-[#145c32] text-[#f1d27b] ring-2 ring-[#d6b14a] shadow-lg'
                    : 'bg-[#198754] text-white hover:bg-[#145c32] hover:scale-[1.02]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-xs md:text-sm">{cat.name}</span>
              </button>
            );
          })}
        </div>

        {categoryData && (
          <div className="bg-white rounded-2xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-gradient-to-r from-[#1a6b3e] to-[#198754] px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = iconMap[categoryData.icon] || Star;
                    return <Icon className="w-6 h-6 text-[#f1d27b]" />;
                  })()}
                  <h3 className="text-white text-xl font-extrabold">
                    {categoryData.name}
                  </h3>
                </div>

                <button
                  onClick={handleHide}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6 space-y-4 max-h-[600px] overflow-y-auto">
              {categoryData.azkar.map((zekr, idx) => {
                const key = `${categoryData.id}-${idx}`;
                const remaining = counts[key] ?? zekr.count ?? 0;
                const isDone = remaining === 0;

                return (
                  <div
                    key={idx}
                    className={`flex gap-4 bg-gray-50 rounded-xl p-4 border transition-all ${
                      isDone ? 'border-green-300 bg-green-50/50' : 'border-gray-100'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      {zekr.title && (
                        <h4 className="text-green-800 text-lg font-extrabold mb-2">
                          {zekr.title}
                        </h4>
                      )}

                      <p className="text-gray-800 text-base md:text-lg leading-relaxed font-medium whitespace-pre-line">
                        {zekr.text}
                      </p>

                      {zekr.fadl && (
                        <p className="text-gray-500 text-sm mt-2 leading-relaxed border-r-2 border-[#d6b14a] pr-3">
                          {zekr.fadl}
                        </p>
                      )}

                      <p className="text-gray-400 text-xs mt-2">
                        العدد الأصلي: {zekr.count}
                      </p>
                    </div>

                    <div className="flex flex-col items-center gap-2 shrink-0 w-[100px]">
                      <span
                        className={`text-xs font-bold ${
                          isDone ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        المتبقي
                      </span>

                      <span
                        className={`text-2xl font-extrabold ${
                          isDone ? 'text-green-600' : 'text-[#198754]'
                        }`}
                      >
                        {remaining}
                      </span>

                      <button
                        onClick={() =>
                          handleCount(categoryData.id, idx, zekr.count ?? 0)
                        }
                        disabled={isDone}
                        className={`w-full py-2 rounded-lg text-xs font-bold transition-all ${
                          isDone
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-[#198754] text-white hover:bg-[#145c32] active:scale-95'
                        }`}
                      >
                        {isDone ? 'تم' : 'تسبيحة'}
                      </button>

                      <button
                        onClick={() =>
                          handleReset(categoryData.id, idx, zekr.count ?? 0)
                        }
                        className="w-full py-1.5 rounded-lg text-xs font-bold bg-red-500 text-white hover:bg-red-600 active:scale-95 transition-all"
                      >
                        إعادة
                      </button>
                    </div>
                  </div>
                );
              })}

              {activeCategory === 'jawami' && (
                <div className="mt-6 bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <h4 className="text-amber-800 font-extrabold text-lg mb-3">
                    أدعية الأنبياء
                  </h4>

                  <div className="space-y-3">
                    {duaaAnbiya.map((item, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 border border-amber-100">
                        <p className="text-amber-700 font-bold text-sm mb-1">
                          {item.prophet}
                        </p>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {item.duaa}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleHide}
                className="w-full py-3 bg-gray-500 text-white rounded-xl font-bold hover:bg-gray-600 transition-all mt-4"
              >
                إخفاء
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// Hero Section Component
function HeroSection() {
  const navigate = useNavigate();

  return (
    <section
      className="relative min-h-[80vh] flex items-center justify-center overflow-hidden px-4 py-20"
      style={{
        background:
          'radial-gradient(circle at top right, rgba(70, 170, 110, 0.22), transparent 28%), radial-gradient(circle at bottom left, rgba(26, 110, 70, 0.20), transparent 30%), linear-gradient(135deg, #0b5a35 0%, #10693e 45%, #117546 100%)',
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/10 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#d6b14a75] bg-white/10 backdrop-blur-sm mb-8">
          <HomeIcon className="w-5 h-5 text-[#f1df9b]" />
          <span className="text-[#f1df9b] text-sm md:text-base font-semibold">
            منصة الرقية الشرعية المعتمدة
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
          ابحث عن <span className="text-[#d6b14a]">الراقي الشرعي</span> الأقرب إليك
        </h1>

        <p className="text-white/90 text-lg md:text-xl lg:text-2xl leading-relaxed mb-10 max-w-3xl mx-auto">
          منصة متخصصة تجمع الرقاة الشرعيين المعتمدين في جميع ولايات الجزائر.
          <br />
          رقية شرعية على وفق الكتاب والسنة بفهم سلف الأمة.
        </p>

        <Button
          onClick={() => navigate('/roqat')}
          className="bg-gradient-to-br from-[#1f8f57] to-[#2dbf68] hover:from-[#1a7a49] hover:to-[#25a85a] text-white text-lg font-extrabold px-8 py-6 rounded-xl shadow-xl shadow-black/15 transition-all hover:-translate-y-0.5 min-w-[200px]"
        >
          <Search className="w-5 h-5 mr-2" />
          ابحث عن الراقي
        </Button>

        <div className="flex items-center justify-center gap-8 md:gap-14 flex-wrap mt-14">
          <div className="text-center min-w-[100px]">
            <strong className="block text-4xl md:text-5xl font-black text-[#d6b14a] mb-2">
              +1500
            </strong>
            <span className="text-white/90 text-base font-semibold">راقي معتمد</span>
          </div>

          <div className="text-center min-w-[100px]">
            <strong className="block text-4xl md:text-5xl font-black text-[#d6b14a] mb-2">
              58
            </strong>
            <span className="text-white/90 text-base font-semibold">ولاية</span>
          </div>

          <div className="text-center min-w-[100px]">
            <strong className="block text-4xl md:text-5xl font-black text-[#d6b14a] mb-2">
              +5000
            </strong>
            <span className="text-white/90 text-base font-semibold">حالة معالجة</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// Featured Raqis Section
function FeaturedRaqisSection() {
  const [featuredRaqis, setFeaturedRaqis] = useState<(Raqi & { featured_badge?: boolean })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeatured = async () => {
      setLoading(true);
      try {
        const data = await getRaqis();
        const featured = (Array.isArray(data) ? data : [])
          .filter((raqi: any) => raqi.featured_badge)
          .slice(0, 6);

        setFeaturedRaqis(featured);
      } catch (error) {
        console.error('Error loading featured raqis:', error);
        setFeaturedRaqis([]);
      } finally {
        setLoading(false);
      }
    };

    loadFeatured();
  }, []);

  if (loading) {
    return (
      <section className="bg-[#0b5a35] px-4 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-white" />
          <span className="mr-3 text-white/80 font-semibold">جاري التحميل...</span>
        </div>
      </section>
    );
  }

  if (featuredRaqis.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#0b5a35] px-4 pt-4 pb-10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#d6b14a60] bg-white/10 mb-4">
            <Sparkles className="w-4 h-4 text-[#f1d27b]" />
            <span className="text-[#f1d27b] text-sm font-bold">اختيارات مميزة</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
            نخبة الرقاة المتميزين
          </h2>

          <p className="text-white/75 max-w-2xl mx-auto leading-relaxed">
            مجموعة مختارة من الرقاة أصحاب الشارة المميزة لسهولة الوصول إليهم بسرعة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredRaqis.map((raqi) => (
            <Link key={raqi.id} to={`/roqat/${raqi.slug}`} className="group block">
              <Card className="h-full rounded-2xl border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden bg-white">
                <div className="p-5 flex flex-col h-full gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-[#1f6f50] transition-colors leading-snug">
                      {raqi.full_name}
                    </h3>

                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1 text-xs font-extrabold">
                        <Sparkles className="w-3 h-3" />
                        متميز
                      </span>

                      {raqi.verified_badge && (
                        <span className="inline-flex items-center gap-1 bg-[#ecfdf3] text-[#166534] border border-[#bfe6cf] rounded-full px-3 py-1 text-xs font-extrabold">
                          <Award className="w-3 h-3" />
                          موثق
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    {raqi.speciality && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Star className="w-4 h-4 text-[#d6b14a] shrink-0" />
                        <span>{raqi.speciality}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-[#1f6f50] shrink-0" />
                      <span>
                        {mockWilayas.find((w) => w.code === raqi.wilaya)?.name_ar || raqi.wilaya}
                      </span>
                    </div>

                    {raqi.address && (
                      <div className="flex items-center gap-2 text-gray-500">
                        <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="truncate">{raqi.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1" />

                  <div className="pt-3 border-t border-gray-100">
                    <span className="inline-flex items-center justify-center w-full py-2.5 rounded-xl bg-[#1f6f50] text-white font-bold text-sm group-hover:bg-[#18593f] transition-colors">
                      عرض الصفحة
                      <ChevronLeft className="w-4 h-4 mr-1" />
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// Search Section Component
function SearchSection() {
  const navigate = useNavigate();
  const [selectedWilaya, setSelectedWilaya] = useState('');

  const handleSearch = () => {
    if (selectedWilaya) {
      navigate(`/roqat?wilaya=${selectedWilaya}`);
    } else {
      navigate('/roqat');
    }
  };

  return (
    <section className="bg-[#0b5a35] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <p className="text-center text-white text-lg font-semibold mb-8">
          يرجى اختيار الولاية لعرض النتائج.
        </p>

        <Card className="p-6 rounded-2xl border-0 shadow-xl bg-white">
          <div className="space-y-4">
            <label className="block text-gray-700 font-bold text-sm">الولاية</label>

            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedWilaya}
                onChange={(e) => setSelectedWilaya(e.target.value)}
                className="flex-1 h-12 px-4 border border-gray-200 rounded-xl text-base bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1f6f50] focus:border-transparent"
              >
                <option value="">اختر الولاية</option>
                {mockWilayas.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.name_ar}
                  </option>
                ))}
              </select>

              <Button
                onClick={handleSearch}
                className="h-12 px-8 bg-gradient-to-br from-[#1f6f50] to-[#15523b] hover:from-[#18593f] text-white font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5"
              >
                <Search className="w-4 h-4 mr-2" />
                بحث
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

// CTA Register Section
function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="bg-[#0a4d2e] py-12 px-4 border-t border-white/10">
      <div className="max-w-2xl mx-auto text-center">
        <Users className="w-12 h-12 text-[#d6b14a] mx-auto mb-4" />
        <h2 className="text-white text-2xl md:text-3xl font-extrabold mb-4">
          هل أنت راقٍ شرعي معتمد؟
        </h2>
        <p className="text-white/70 mb-8 leading-relaxed">
          سجل في دليل الرقاة وكن أقرب إلى من يحتاجك.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={() => navigate('/register')}
            className="bg-gradient-to-br from-[#1f8f57] to-[#2dbf68] hover:from-[#1a7a49] hover:to-[#25a85a] text-white text-lg font-extrabold px-10 py-6 rounded-xl shadow-xl transition-all hover:-translate-y-0.5 min-w-[250px]"
          >
            <Award className="w-5 h-5 mr-2" />
            سجل في الدليل
          </Button>

        <Button
  onClick={() => navigate('/raqi-login')}
  variant="outline"
  className="border-white text-white bg-transparent hover:bg-white/10 text-lg font-extrabold px-10 py-6 rounded-xl transition-all min-w-[250px]"
>
  دخول الراقي
</Button>
        </div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="bg-[#083d24] py-8 px-4 border-t border-white/5">
      <div className="max-w-5xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Shield className="w-6 h-6 text-[#d6b14a]" />
          <span className="text-white font-bold text-lg">منصة الرقية الشرعية</span>
        </div>

        <p className="text-white/50 text-sm mb-2">
          منصة متخصصة للرقاة الشرعيين المعتمدين.
        </p>

        <p className="text-white/30 text-xs">
          © {new Date().getFullYear()} جميع الحقوق محفوظة
        </p>
      </div>
    </footer>
  );
}

// Home Page
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <AzkarSection />
      <HeroSection />
      <FeaturedRaqisSection />
      <SearchSection />
      <CTASection />
      <Footer />
    </div>
  );
}