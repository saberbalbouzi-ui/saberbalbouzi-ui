// ============================================================
// Sélecteur de pays - Header
// Les pays sont chargés depuis Supabase
// ============================================================

import { useState } from 'react';
import { useCountryDetection } from '@/hooks/useCountryDetection';
import { useCountries } from '@/hooks/useCountries';
import {
  Globe,
  ChevronDown,
  MapPin,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function CountrySelector() {
  const { countryCode, setManualCountry } = useCountryDetection();

  const {
    countries,
    loading,
    error,
  } = useCountries(true);

  const [open, setOpen] = useState(false);

  const currentCountry = countries.find(
    (country) => country.code === countryCode
  );

  const handleSelect = (code: string) => {
    setManualCountry(code);
    setOpen(false);

    // إعادة تحميل التطبيق لتطبيق الدولة في جميع الصفحات
    window.location.reload();
  };

  return (
    <div className="relative" dir="rtl">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
      >
        <Globe className="w-4 h-4" />

        <span className="text-sm font-bold">
          {currentCountry
            ? `${currentCountry.flag_emoji} ${currentCountry.name_ar}`
            : '🌍 اختر الدولة'}
        </span>

        <ChevronDown
          className={`w-3 h-3 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <div
            className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
            role="listbox"
            aria-label="الدول المتاحة"
          >
            <div className="p-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
                الدول المتاحة
              </p>

              {loading && (
                <div className="flex items-center justify-center gap-2 px-3 py-5 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري تحميل الدول...</span>
                </div>
              )}

              {error && !loading && (
                <div className="flex items-center gap-2 px-3 py-4 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>تعذر تحميل الدول</span>
                </div>
              )}

              {!loading && !error && countries.length === 0 && (
                <p className="px-3 py-4 text-sm text-gray-500 text-center">
                  لا توجد دول متاحة حالياً
                </p>
              )}

              {!loading &&
                !error &&
                countries.map((country) => {
                  const isSelected = country.code === countryCode;

                  return (
                    <button
                      key={country.code}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(country.code)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-right transition-all ${
                        isSelected
                          ? 'bg-[#ecfdf3] text-[#166534] font-bold'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="text-xl shrink-0">
                        {country.flag_emoji}
                      </span>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">
                          {country.name_ar}
                        </p>

                        <p className="text-xs text-gray-400 truncate">
                          {country.name_fr || country.name_en}
                        </p>
                      </div>

                      {isSelected && (
                        <MapPin className="w-4 h-4 text-[#1f6f50] shrink-0" />
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}