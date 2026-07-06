// ============================================================
// دليل الرقاة - Directory Page (Search + Filter + Grid)
// ============================================================
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getRaqis, mockWilayas } from '@/lib/supabase';
import type { Raqi } from '@/types';
import {
  Search, MapPin, Award, Star, ChevronLeft, Shield, Loader2
} from 'lucide-react';

export default function Directory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [raqis, setRaqis] = useState<Raqi[]>([]);
  const [filtered, setFiltered] = useState<Raqi[]>([]);
  const [loading, setLoading] = useState(true);
  const [wilayaFilter, setWilayaFilter] = useState(searchParams.get('wilaya') || '');
  const [searchQuery, setSearchQuery] = useState('');

  // Load raqis
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getRaqis();
        setRaqis(data);
        setFiltered([]);
      } catch (err) {
        console.error('Error loading raqis:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...raqis];

if (!wilayaFilter && !searchQuery.trim()) {
  setFiltered([]);
  setSearchParams({});
  return;
}

if (wilayaFilter) {
  result = result.filter(r => r.wilaya === wilayaFilter);
}

if (searchQuery.trim()) {
  const q = searchQuery.trim().toLowerCase();
  result = result.filter(r =>
    r.full_name.toLowerCase().includes(q) ||
    (r.speciality?.toLowerCase().includes(q) ?? false) ||
    (r.address?.toLowerCase().includes(q) ?? false)
  );
}

setFiltered(result);

    // Update URL
    if (wilayaFilter) {
      setSearchParams({ wilaya: wilayaFilter });
    } else {
      setSearchParams({});
    }
  }, [wilayaFilter, searchQuery, raqis]);

  const getWilayaName = (code: string) => {
    return mockWilayas.find(w => w.code === code)?.name_ar || code;
  };

  const hasSearched = wilayaFilter !== '' || searchQuery !== '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0b5a35] to-[#10693e] py-10 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#d6b14a]/60 bg-white/[0.06] mb-4">
            <Shield className="w-4 h-4 text-[#f1d27b]" />
            <span className="text-[#f1d27b] text-sm font-bold">دليل الرقاة المعتمدين</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            دليل الرقاة الشرعيين
          </h1>
          <p className="text-white/80 text-base max-w-xl mx-auto">
            ابحث عن الراقي الشرعي الأقرب إليك من بين الرقاة المعتمدين في ولايات الجزائر.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="p-5 rounded-2xl border border-gray-100 shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Wilaya Select */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">الولاية</label>
              <select
                value={wilayaFilter}
                onChange={e => setWilayaFilter(e.target.value)}
                className="w-full h-12 px-4 border border-gray-200 rounded-xl text-base
                  bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1f6f50]
                  focus:border-transparent"
              >
                <option value="">اختر الولاية</option>
                {mockWilayas.map(w => (
                  <option key={w.code} value={w.code}>{w.name_ar}</option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-gray-700">البحث</label>
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(raqi => (
              <Link
                key={raqi.id}
                to={`/roqat/${raqi.slug}`}
                className="group block"
              >
                <Card className="h-full rounded-2xl border border-gray-100 shadow-md hover:shadow-xl
                  transition-all duration-300 hover:-translate-y-1 overflow-hidden bg-white">
                  <div className="p-5 flex flex-col h-full gap-4">
                    {/* Top: Name + Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-[#1f6f50] transition-colors leading-snug">
                        {raqi.full_name}
                      </h3>
                      {raqi.verified_badge && (
                        <span className="shrink-0 inline-flex items-center gap-1 bg-[#ecfdf3] text-[#166534]
                          border border-[#bfe6cf] rounded-full px-3 py-1 text-xs font-extrabold">
                          <Award className="w-3 h-3" />
                          موثق
                        </span>
                      )}
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
                      <span className="inline-flex items-center justify-center w-full py-2.5 rounded-xl
                        bg-[#1f6f50] text-white font-bold text-sm
                        group-hover:bg-[#18593f] transition-colors">
                        عرض الصفحة
                        <ChevronLeft className="w-4 h-4 mr-1" />
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 max-w-md mx-auto">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-bold">
                {hasSearched
                  ? 'لا توجد نتائج مطابقة لخيارات البحث.'
                  : 'يرجى اختيار الولاية أو البحث لعرض النتائج.'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
