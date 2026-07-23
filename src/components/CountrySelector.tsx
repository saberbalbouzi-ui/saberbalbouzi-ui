// ============================================================
// Sélecteur de pays (Header)
// ============================================================
import { useState } from 'react';
import { useCountryDetection } from '@/hooks/useCountryDetection';
import { SUPPORTED_COUNTRIES, getActiveCountries } from '@/lib/countries';
import { Globe, ChevronDown, MapPin } from 'lucide-react';

export default function CountrySelector() {
  const { countryCode, setManualCountry } = useCountryDetection();
  const [open, setOpen] = useState(false);

  const activeCountries = getActiveCountries();
  const currentCountry = SUPPORTED_COUNTRIES.find((c) => c.code === countryCode);

  const handleSelect = (code: string) => {
    setManualCountry(code);
    setOpen(false);
    window.location.reload();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-bold">
          {currentCountry ? `${currentCountry.flag_emoji} ${currentCountry.name_ar}` : '🌍 اختر الدولة'}
        </span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
            <div className="p-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
                الدول المتاحة
              </p>
              {activeCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => handleSelect(country.code)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-right transition-all ${
                    country.code === countryCode
                      ? 'bg-[#ecfdf3] text-[#166534] font-bold'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="text-xl">{country.flag_emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{country.name_ar}</p>
                    <p className="text-xs text-gray-400">{country.name_fr}</p>
                  </div>
                  {country.code === countryCode && (
                    <MapPin className="w-4 h-4 text-[#1f6f50]" />
                  )}
                </button>
              ))}
            </div>

            <div className="border-t border-gray-100 p-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
                قريباً
              </p>
              {SUPPORTED_COUNTRIES
                .filter((c) => !c.is_active)
                .slice(0, 5)
                .map((country) => (
                  <div
                    key={country.code}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 cursor-not-allowed"
                  >
                    <span className="text-xl opacity-50">{country.flag_emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold">{country.name_ar}</p>
                      <p className="text-xs">{country.name_fr}</p>
                    </div>
                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full">قريباً</span>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
