// ============================================================
// دليل الرقاة - Directory Page (Search + Filter + Grid)
// ============================================================

import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getRaqis, mockWilayas } from '@/lib/supabase';
import { useCountryDetection } from '@/hooks/useCountryDetection';
import { getActiveCountries } from '@/lib/countries';
import type { Raqi } from '@/types';
import {
  Search,
  MapPin,
  Award,
  Star,
  ChevronLeft,
  Shield,
  Loader2,
  Sparkles,
  Globe,
} from 'lucide-react';

// ============================================================
// WILAYAS PAR PAYS (temporaire — à remplacer par API Supabase)
// ============================================================
const wilayasByCountry: Record<string, { code: string; name_ar: string }[]> = {
  DZ: mockWilayas.map((w) => ({ code: w.code, name_ar: w.name_ar })),
  MA: [
    { code: '01', name_ar: 'طنجة-تطوان-الحسيمة' },
    { code: '02', name_ar: 'الشرق' },
    { code: '03', name_ar: 'فاس-مكناس' },
    { code: '04', name_ar: 'الرباط-سلا-القنيطرة' },
    { code: '05', name_ar: 'بني ملال-خنيفرة' },
    { code: '06', name_ar: 'الدار البيضاء-سطات' },
    { code: '07', name_ar: 'مراكش-آسفي' },
    { code: '08', name_ar: 'درعة-تافيلالت' },
    { code: '09', name_ar: 'سوس-ماسة' },
    { code: '10', name_ar: 'كلميم-واد نون' },
    { code: '11', name_ar: 'العيون-الساقية الحمراء' },
    { code: '12', name_ar: 'الداخلة-وادي الذهب' },
  ],
  TN: [
    { code: '11', name_ar: 'تونس' },
    { code: '12', name_ar: 'أريانة' },
    { code: '13', name_ar: 'منوبة' },
    { code: '14', name_ar: 'بن عروس' },
    { code: '21', name_ar: 'نابل' },
    { code: '22', name_ar: 'زغوان' },
    { code: '23', name_ar: 'بنزرت' },
    { code: '31', name_ar: 'باجة' },
    { code: '32', name_ar: 'جندوبة' },
    { code: '33', name_ar: 'الكاف' },
    { code: '34', name_ar: 'سليانة' },
    { code: '41', name_ar: 'القيروان' },
    { code: '42', name_ar: 'القصرين' },
    { code: '43', name_ar: 'سيدي بوزيد' },
    { code: '51', name_ar: 'سوسة' },
    { code: '52', name_ar: 'المنستير' },
    { code: '53', name_ar: 'المهدية' },
    { code: '61', name_ar: 'صفاقس' },
    { code: '71', name_ar: 'قابس' },
    { code: '72', name_ar: 'مدنين' },
    { code: '73', name_ar: 'تطاوين' },
    { code: '81', name_ar: 'قفصة' },
    { code: '82', name_ar: 'توزر' },
    { code: '83', name_ar: 'قبلي' },
  ],
  FR: [
    { code: '75', name_ar: 'باريس' },
    { code: '13', name_ar: 'مارسيليا' },
    { code: '69', name_ar: 'ليون' },
    { code: '31', name_ar: 'تولوز' },
    { code: '33', name_ar: 'بوردو' },
    { code: '59', name_ar: 'ليل' },
    { code: '44', name_ar: 'نانت' },
    { code: '67', name_ar: 'ستراسبورغ' },
    { code: '34', name_ar: 'مونبلييه' },
    { code: '06', name_ar: 'نيس' },
  ],
};

export default function Directory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { countryCode, setManualCountry } = useCountryDetection();

  const [raqis, setRaqis] = useState<Raqi[]>([]);
  const [filtered, setFiltered] = useState<Raqi[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtres
  const [selectedCountry, setSelectedCountry] = useState(countryCode);
  const [wilayaFilter, setWilayaFilter] = useState(searchParams.get('wilaya') || '');
  const [searchQuery, setSearchQuery] = useState('');

  const activeCountries = getActiveCountries();
  const currentWilayas = wilayasByCountry[selectedCountry] || wilayasByCountry['DZ'] || [];

  // Sync avec le pays détecté
  useEffect(() => {
    setSelectedCountry(countryCode);
  }, [countryCode]);

  // Charger les raqis quand le pays change
  const load = async () => {
    setLoading(true);
    try {
      const data = await getRaqis(selectedCountry);
      setRaqis(Array.isArray(data) ? data : []);
      setFiltered([]);
    } catch (err) {
      console.error('Error loading raqis:', err);
      setRaqis([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [selectedCountry]);

  // Recharger quand le pays change via le header (si tu gardes le selector ailleurs)
  useEffect(() => {
    const handleCountryChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newCode = customEvent.detail?.code;
      if (newCode) {
        setSelectedCountry(newCode);
        setWilayaFilter('');
        setSearchQuery('');
      }
    };
    window.addEventListener('countrychange', handleCountryChange);
    return () => window.removeEventListener('countrychange', handleCountryChange);
  }, []);

  // Appliquer les filtres (wilaya + recherche texte)
  useEffect(() => {
    let result = [...raqis];
    const q = searchQuery.trim().toLowerCase();

    if (!wilayaFilter && !q) {
      setFiltered([]);
      setSearchParams({});
      return;
    }

    if (wilayaFilter) {
      result = result.filter((r) => r.wilaya === wilayaFilter);
    }

    if (q) {
      result = result.filter(
        (r) =>
          r.full_name?.toLowerCase().includes(q) ||
          (r.speciality?.toLowerCase().includes(q) ?? false) ||
          (r.address?.toLowerCase().includes(q) ?? false)
      );
    }

    setFiltered(result);

    const params = new URLSearchParams();
    if (wilayaFilter) params.set('wilaya', wilayaFilter);
    setSearchParams(params);
  }, [wilayaFilter, searchQuery, raqis, setSearchParams]);

  const handleCountryChange = (code: string) => {
    setSelectedCountry(code);
    setManualCountry(code);
    setWilayaFilter('');
    setSearchQuery('');
  };

  const getWilayaName = (code: string | null) => {
    if (!code) return '';
    return currentWilayas.find((w) => w.code === code)?.name_ar || code;
  };

  const hasSearched = wilayaFilter !== '' || searchQuery !== '';

  const featuredRaqis = wilayaFilter
    ? filtered.filter((raqi: any) => !!raqi.featured_badge)
    : [];

  const verifiedRaqis = wilayaFilter
    ? filtered.filter((raqi: any) => !!raqi.verified_badge && !raqi.featured_badge)
    : [];

  const otherRaqis = wilayaFilter
    ? filtered.filter((raqi: any) => !raqi.featured_badge && !raqi.verified_badge)
    : filtered;

  const renderRaqiCard = (raqi: Raqi & { featured_badge?: boolean }) => (
    <Link key={raqi.id} to={`/roqat/${raqi.slug}`} className="group block">
      <Card className="h-full rounded-2xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden bg-white">
        <div className="p-5 flex flex-col h-full gap-4">
          {/* Top: Name + Badge */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-[#1f6f50] transition-colors leading-snug">
              {raqi.full_name}
            </h3>

            <div className="shrink-0 flex flex-col items-end gap-2">
              {raqi.featured_badge && (
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1 text-xs font-extrabold">
                  <Sparkles className="w-3 h-3" />
                  متميز
                </span>
              )}

              {raqi.verified_badge && (
                <span className="inline-flex items-center gap-1 bg-[#ecfdf3] text-[#166534] border border-[#bfe6cf] rounded-full px-3 py-1 text-xs font-extrabold">
                  <Award className="w-3 h-3" />
                  موثق
                </span>
              )}
            </div>
          </div>

          {/* Meta Info */}
          <div className="space-y-2 text-sm">
            {raqi.speciality && (
              <div className="flex items-center gap-2 text-gray-600">
                <Star className="w-4 h-4 text-[#d6b14a] shrink-0" />
                <span>{raqi.speciality}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 text-[#1f6f50] shrink-0" />
              <span>{getWilayaName(raqi.wilaya)}</span>
            </div>

            {raqi.address && (
              <div className="flex items-center gap-2 text-gray-500">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="truncate">{raqi.address}</span>
              </div>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Action Button */}
          <div className="pt-3 border-t border-gray-100">
            <span className="inline-flex items-center justify-center w-full py-2.5 rounded-xl bg-[#1f6f50] text-white font-bold text-sm group-hover:bg-[#18593f] transition-colors">
              عرض الصفحة
              <ChevronLeft className="w-4 h-4 mr-1" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0b5a35] to-[#10693e] py-10 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#d6b14a60] bg-white/10 mb-4">
            <Shield className="w-4 h-4 text-[#f1d27b]" />
            <span className="text-[#f1d27b] text-sm font-bold">
              دليل الرقاة المعتمدين
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            دليل الرقاة الشرعيين
          </h1>

          <p className="text-white/80 text-base max-w-xl mx-auto">
            ابحث عن الراقي الشرعي الأقرب إليك من بين الرقاة المعتمدين.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Filters — AVEC PAYS + WILAYA DYNAMIQUES */}
        <Card className="p-5 rounded-2xl border border-gray-100 shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Pays */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-1">
                <Globe className="w-4 h-4" />
                الدولة
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full h-12 px-4 border border-gray-200 rounded-xl text-base bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1f6f50] focus:border-transparent"
              >
                {activeCountries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag_emoji} {c.name_ar}
                  </option>
                ))}
              </select>
            </div>

            {/* Wilaya */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                الولاية
              </label>
              <select
                value={wilayaFilter}
                onChange={(e) => setWilayaFilter(e.target.value)}
                className="w-full h-12 px-4 border border-gray-200 rounded-xl text-base bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1f6f50] focus:border-transparent"
              >
                <option value="">اختر الولاية</option>
                {currentWilayas.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.name_ar}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">البحث</label>
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث بالاسم، التخصص، أو العنوان..."
                  className="h-12 pr-12 rounded-xl border-gray-200 text-base focus:ring-2 focus:ring-[#1f6f50]"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#1f6f50]" />
            <span className="mr-3 text-gray-500 font-semibold">جاري التحميل...</span>
          </div>
        ) : filtered.length > 0 ? (
          wilayaFilter ? (
            <div className="space-y-8">
              {featuredRaqis.length > 0 && (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-extrabold text-gray-900">
                      الرقاة المتميزون في {getWilayaName(wilayaFilter)}
                    </h2>

                    <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700 border border-amber-200">
                      <Sparkles className="w-4 h-4" />
                      {featuredRaqis.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {featuredRaqis.map((raqi) => renderRaqiCard(raqi as Raqi & { featured_badge?: boolean }))}
                  </div>
                </div>
              )}

              {verifiedRaqis.length > 0 && (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-extrabold text-gray-900">
                      الرقاة الموثقون في {getWilayaName(wilayaFilter)}
                    </h2>

                    <span className="inline-flex items-center gap-2 rounded-full bg-[#ecfdf3] px-3 py-1 text-sm font-bold text-[#166534] border border-[#bfe6cf]">
                      <Award className="w-4 h-4" />
                      {verifiedRaqis.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {verifiedRaqis.map((raqi) => renderRaqiCard(raqi as Raqi & { featured_badge?: boolean }))}
                  </div>
                </div>
              )}

              {otherRaqis.length > 0 && (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-extrabold text-gray-900">
                      بقية الرقاة المعتمدين في {getWilayaName(wilayaFilter)}
                    </h2>

                    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-700">
                      {otherRaqis.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {otherRaqis.map((raqi) => renderRaqiCard(raqi as Raqi & { featured_badge?: boolean }))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((raqi) => renderRaqiCard(raqi as Raqi & { featured_badge?: boolean }))}
            </div>
          )
        ) : (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 max-w-md mx-auto">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-bold">
                {hasSearched
                  ? 'لا توجد نتائج مطابقة لخيارات البحث.'
                  : 'يرجى اختيار الولاية أو البحث لعرض النتائج.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
