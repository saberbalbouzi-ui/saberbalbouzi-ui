// ============================================================
// دليل الرقاة - Home Page (with Azkar + Hero + Search + CTA)
// ============================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { mockWilayas } from '@/lib/supabase';
import { azkarCategories, duaaAnbiya } from '@/data/azkar';
import type { ZekrCategory } from '@/data/azkar';
import {
  Sunrise, Sunset, Moon, Sparkles, Star, Shield, AlarmClock,
  Heart, Hand, BookOpen, ChevronUp, Search, Users, Award,
  Home as HomeIcon
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Sunrise, Sunset, Moon, Sparkles, Star, Shield, AlarmClock, Heart, Hand, BookOpen
};

// ============================================================
// Azkar Section Component
// ============================================================
function AzkarSection() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [categoryData, setCategoryData] = useState<ZekrCategory | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (activeCategory) {
      const cat = azkarCategories.find(c => c.id === activeCategory);
      setCategoryData(cat || null);
      // Reset counts when changing category
      const initialCounts: Record<string, number> = {};
      cat?.azkar.forEach((z, i) => { initialCounts[`${cat.id}-${i}`] = z.count ?? 0; });
      setCounts(prev => ({ ...prev, ...initialCounts }));
    } else {
      setCategoryData(null);
    }
  }, [activeCategory]);

  const handleCount = (catId: string, idx: number, target: number) => {
    const key = `${catId}-${idx}`;
    setCounts(prev => {
      const current = prev[key] ?? target;
      return { ...prev, [key]: Math.max(0, current - 1) };
    });
  };

  const handleReset = (catId: string, idx: number, target: number) => {
    const key = `${catId}-${idx}`;
    setCounts(prev => ({ ...prev, [key]: target }));
  };

  const handleHide = () => {
    setActiveCategory(null);
    setCategoryData(null);
  };

  return (
    <section className="bg-[#0a4d2e] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-center text-white text-2xl md:text-3xl font-extrabold mb-6"> أذكار المسلم</h2>

        {/* Azkar Category Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-8">
          {azkarCategories.map(cat => {
            const Icon = iconMap[cat.icon] || Star;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(isActive ? null : cat.id)}
                className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-bold
                  transition-all duration-200 min-h-[48px]
                  ${isActive
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

        {/* Active Category Azkar */}
        {categoryData && (
          <div className="bg-white rounded-2xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-gradient-to-r from-[#1a6b3e] to-[#198754] px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = iconMap[categoryData.icon] || Star;
                    return <Icon className="w-6 h-6 text-[#f1d27b]" />;
                  })()}
                  <h3 className="text-white text-xl font-extrabold">{categoryData.name}</h3>
                </div>
                <button onClick={handleHide} className="text-white/70 hover:text-white transition-colors">
                  <ChevronUp className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6 space-y-4 max-h-[600px] overflow-y-auto">
              {categoryData.azkar.map((zekr, idx) => {
                const key = `${categoryData.id}-${idx}`;
                const remaining = counts[key] ?? zekr.count;
                const isDone = remaining === 0;

                return (
                  <div
                    key={idx}
                    className={`flex gap-4 bg-gray-50 rounded-xl p-4 border transition-all
                      ${isDone ? 'border-green-300 bg-green-50/50' : 'border-gray-100'}`}
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

  <p className="text-gray-400 text-xs mt-2">العدد الأصلي: {zekr.count}</p>
</div>

                    <div className="flex flex-col items-center gap-2 shrink-0 w-[100px]">
                      <span className={`text-xs font-bold ${isDone ? 'text-green-600' : 'text-gray-400'}`}>
                        العدد
                      </span>
                      <span className={`text-2xl font-extrabold ${isDone ? 'text-green-600' : 'text-[#198754]'}`}>
                        {remaining}
                      </span>
                      <button
                        onClick={() => handleCount(categoryData.id, idx, zekr.count ?? 0)}
                        disabled={isDone}
                        className={`w-full py-2 rounded-lg text-xs font-bold transition-all
                          ${isDone
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-[#198754] text-white hover:bg-[#145c32] active:scale-95'
                          }`}
                      >
                        {isDone ? 'تم' : 'تسبيح'}
                      </button>
                      <button
                       onClick={() => handleReset(categoryData.id, idx, zekr.count ?? 0)}
                        className="w-full py-1.5 rounded-lg text-xs font-bold bg-red-500 text-white hover:bg-red-600 active:scale-95 transition-all"
                      >
                        إعادة
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Duaa al-Anbiya (only show for certain categories) */}
              {activeCategory === 'jawami' && (
                <div className="mt-6 bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <h4 className="text-amber-800 font-extrabold text-lg mb-3">دعاء الأنبياء</h4>
                  <div className="space-y-3">
                    {duaaAnbiya.map((item, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 border border-amber-100">
                        <p className="text-amber-700 font-bold text-sm mb-1">{item.prophet}</p>
                        <p className="text-gray-700 text-sm leading-relaxed">{item.duaa}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleHide}
                className="w-full py-3 bg-gray-500 text-white rounded-xl font-bold hover:bg-gray-600 transition-all mt-4"
              >
                إخفاء المحتوى
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================
// Hero Section Component
// ============================================================
function HeroSection() {
  const navigate = useNavigate();

  return (
    <section
      className="relative min-h-[80vh] flex items-center justify-center overflow-hidden px-4 py-20"
      style={{
        background: `
          radial-gradient(circle at top right, rgba(70, 170, 110, 0.22), transparent 28%),
          radial-gradient(circle at bottom left, rgba(26, 110, 70, 0.20), transparent 30%),
          linear-gradient(135deg, #0b5a35 0%, #10693e 45%, #117546 100%)
        `,
      }}
    >
      {/* Dotted pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/[0.06] to-black/[0.12] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#d6b14a]/75 bg-white/[0.06] backdrop-blur-sm mb-8">
          <HomeIcon className="w-5 h-5 text-[#f1df9b]" />
          <span className="text-[#f1df9b] text-sm md:text-base font-semibold">
            منصة الرقية الشرعية المعتمدة في الجزائر
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
          ابحث عن <span className="text-[#d6b14a]">الراقي الشرعي</span> الأقرب إليك
        </h1>

        {/* Description */}
        <p className="text-white/90 text-lg md:text-xl lg:text-2xl leading-relaxed mb-10 max-w-3xl mx-auto">
          منصة متخصصة تجمع الرقاة الشرعيين المعتمدين في جميع ولايات الجزائر.
          رقية شرعية على وفق الكتاب والسنة بفهم سلف الأمة.
        </p>

        {/* CTA Button */}
        <Button
          onClick={() => navigate('/roqat')}
          className="bg-gradient-to-br from-[#1f8f57] to-[#2dbf68] hover:from-[#1a7a49] hover:to-[#25a85a]
            text-white text-lg font-extrabold px-8 py-6 rounded-xl shadow-xl shadow-black/15
            transition-all hover:-translate-y-0.5 min-w-[200px]"
        >
          <Search className="w-5 h-5 mr-2" />
          ابحث عن الراقي
        </Button>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 md:gap-14 flex-wrap mt-14">
          <div className="text-center min-w-[100px]">
            <strong className="block text-4xl md:text-5xl font-black text-[#d6b14a] mb-2">+150</strong>
            <span className="text-white/90 text-base font-semibold">راقي معتمد</span>
          </div>
          <div className="text-center min-w-[100px]">
            <strong className="block text-4xl md:text-5xl font-black text-[#d6b14a] mb-2">58</strong>
            <span className="text-white/90 text-base font-semibold">ولاية جزائرية</span>
          </div>
          <div className="text-center min-w-[100px]">
            <strong className="block text-4xl md:text-5xl font-black text-[#d6b14a] mb-2">+5000</strong>
            <span className="text-white/90 text-base font-semibold">حالة معالجة</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Search Section Component
// ============================================================
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
                onChange={e => setSelectedWilaya(e.target.value)}
                className="flex-1 h-12 px-4 border border-gray-200 rounded-xl text-base
                  bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1f6f50]
                  focus:border-transparent"
              >
                <option value="">اختر الولاية</option>
                {mockWilayas.map(w => (
                  <option key={w.code} value={w.code}>{w.name_ar}</option>
                ))}
              </select>

              <Button
                onClick={handleSearch}
                className="h-12 px-8 bg-gradient-to-br from-[#1f6f50] to-[#15523b] hover:from-[#18593f]
                  text-white font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5"
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

// ============================================================
// CTA Register Section
// ============================================================
function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="bg-[#0a4d2e] py-12 px-4 border-t border-white/10">
      <div className="max-w-2xl mx-auto text-center">
        <Users className="w-12 h-12 text-[#d6b14a] mx-auto mb-4" />
        <h2 className="text-white text-2xl md:text-3xl font-extrabold mb-4">
          انضم إلى شبكة الرقاة المعتمدين في الجزائر
        </h2>
        <p className="text-white/70 mb-8 leading-relaxed">
          هل أنت راقٍ شرعي معتمد؟ سجل في دليل الرقاة وكن أقرب إلى من يحتاجك.
        </p>
        <Button
          onClick={() => navigate('/register')}
          className="bg-gradient-to-br from-[#1f8f57] to-[#2dbf68] hover:from-[#1a7a49] hover:to-[#25a85a]
            text-white text-lg font-extrabold px-10 py-6 rounded-xl shadow-xl
            transition-all hover:-translate-y-0.5 min-w-[250px]"
        >
          <Award className="w-5 h-5 mr-2" />
          سجل كراقي شرعي
        </Button>
      </div>
    </section>
  );
}

// ============================================================
// Footer
// ============================================================
function Footer() {
  return (
    <footer className="bg-[#083d24] py-8 px-4 border-t border-white/5">
      <div className="max-w-5xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Shield className="w-6 h-6 text-[#d6b14a]" />
          <span className="text-white font-bold text-lg">دليل الرقاة</span>
        </div>
        <p className="text-white/50 text-sm mb-2">
          منصة الرقية الشرعية المعتمدة في الجزائر
        </p>
        <p className="text-white/30 text-xs">
          جميع الحقوق محفوظة &copy; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}

// ============================================================
// Home Page
// ============================================================
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <AzkarSection />
      <HeroSection />
      <SearchSection />
      <CTASection />
      <Footer />
    </div>
  );
}
