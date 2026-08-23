import { useEffect, useState } from 'react';
import {
  getCitiesFromDb,
  getCountriesFromDb,
  type DbCity,
  type DbCountry,
} from '@/lib/supabase';

export type CountryOption = DbCountry & {
  code: string;
  name_ar: string;
  name_en?: string;
  name_fr?: string;
  name_local?: string;
  flag_emoji?: string;
  is_active?: boolean;
};

export type CityOption = DbCity & {
  id: number;
  country_code: string;
  name_ar: string;
  name_en?: string;
  name_local?: string;
};

export interface UseCountriesResult {
  countries: CountryOption[];
  loading: boolean;
  error: Error | null;
  reload: () => void;
}

export interface UseCitiesResult {
  cities: CityOption[];
  loading: boolean;
  error: Error | null;
  reload: () => void;
}

const FALLBACK_COUNTRIES: CountryOption[] = [
  { code: 'DZ', name_ar: 'الجزائر', name_en: 'Algeria', name_fr: 'Algérie', flag_emoji: '🇩🇿', is_active: true } as CountryOption,
  { code: 'MA', name_ar: 'المغرب', name_en: 'Morocco', name_fr: 'Maroc', flag_emoji: '🇲🇦', is_active: true } as CountryOption,
  { code: 'TN', name_ar: 'تونس', name_en: 'Tunisia', name_fr: 'Tunisie', flag_emoji: '🇹🇳', is_active: true } as CountryOption,
  { code: 'FR', name_ar: 'فرنسا', name_en: 'France', name_fr: 'France', flag_emoji: '🇫🇷', is_active: true } as CountryOption,
];

const FALLBACK_CITIES: Record<string, CityOption[]> = {
  DZ: [
    'أدرار', 'الشلف', 'الأغواط', 'أم البواقي', 'باتنة', 'بجاية', 'بسكرة',
    'بشار', 'البليدة', 'البويرة', 'تمنراست', 'تبسة', 'تلمسان', 'تيارت',
    'تيزي وزو', 'الجزائر', 'الجلفة', 'جيجل', 'سطيف', 'سعيدة', 'سكيكدة',
    'سيدي بلعباس', 'عنابة', 'قالمة', 'قسنطينة', 'المدية', 'مستغانم',
    'المسيلة', 'معسكر', 'ورقلة', 'وهران', 'البيض', 'إليزي', 'برج بوعريريج',
    'بومرداس', 'الطارف', 'تندوف', 'تيسمسيلت', 'الوادي', 'خنشلة',
    'سوق أهراس', 'تيبازة', 'ميلة', 'عين الدفلى', 'النعامة', 'عين تموشنت',
    'غرداية', 'غليزان', 'تيميمون', 'برج باجي مختار', 'أولاد جلال', 'بني عباس',
    'إن صالح', 'إن قزام', 'تقرت', 'جانت', 'المغير', 'المنيعة',
  ].map((name, index) => ({ id: index + 1, country_code: 'DZ', name_ar: name } as CityOption)),
  MA: ['الدار البيضاء', 'الرباط', 'فاس', 'مراكش', 'طنجة', 'أكادير', 'وجدة'].map((name, index) => ({ id: 100 + index, country_code: 'MA', name_ar: name } as CityOption)),
  TN: ['تونس', 'أريانة', 'بن عروس', 'منوبة', 'نابل', 'سوسة', 'صفاقس'].map((name, index) => ({ id: 200 + index, country_code: 'TN', name_ar: name } as CityOption)),
  FR: ['باريس', 'مارسيليا', 'ليون', 'تولوز', 'بوردو', 'ليل', 'نانت'].map((name, index) => ({ id: 300 + index, country_code: 'FR', name_ar: name } as CityOption)),
};

function normalizeCountry(value: DbCountry): CountryOption {
  const item = value as DbCountry & Record<string, unknown>;
  return {
    ...value,
    code: String(item.code ?? ''),
    name_ar: String(item.name_ar ?? item.nameAr ?? item.name ?? ''),
    name_en: String(item.name_en ?? item.nameEn ?? ''),
    name_fr: String(item.name_fr ?? item.nameFr ?? ''),
    name_local: String(item.name_local ?? item.nameLocal ?? ''),
    flag_emoji: String(item.flag_emoji ?? item.flagEmoji ?? ''),
    is_active: item.is_active !== false,
  } as CountryOption;
}

function normalizeCity(value: DbCity): CityOption {
  const item = value as DbCity & Record<string, unknown>;
  return {
    ...value,
    id: Number(item.id),
    country_code: String(item.country_code ?? item.countryCode ?? ''),
    name_ar: String(item.name_ar ?? item.nameAr ?? item.name ?? ''),
    name_en: String(item.name_en ?? item.nameEn ?? ''),
    name_local: String(item.name_local ?? item.nameLocal ?? ''),
  } as CityOption;
}

export function useCountries(activeOnly = true): UseCountriesResult {
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getCountriesFromDb(activeOnly);
        const normalized = (data ?? []).map(normalizeCountry).filter((item) => item.code && item.name_ar);

        if (mounted) {
          setCountries(normalized.length ? normalized : FALLBACK_COUNTRIES);
        }
      } catch (cause) {
        const nextError = cause instanceof Error ? cause : new Error('فشل تحميل الدول');
        console.error('useCountries error:', nextError);

        if (mounted) {
          setCountries(FALLBACK_COUNTRIES);
          setError(nextError);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [activeOnly, reloadKey]);

  return { countries, loading, error, reload: () => setReloadKey((value) => value + 1) };
}

export function useCities(countryCode?: string): UseCitiesResult {
  const [cities, setCities] = useState<CityOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    const code = countryCode?.trim().toUpperCase() || '';

    setCities([]);
    setError(null);

    if (!code) {
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    const load = async () => {
      setLoading(true);

      try {
        const data = await getCitiesFromDb(code);
        const normalized = (data ?? []).map(normalizeCity).filter((item) => item.name_ar);

        if (mounted) {
          setCities(normalized.length ? normalized : FALLBACK_CITIES[code] ?? []);
        }
      } catch (cause) {
        const nextError = cause instanceof Error ? cause : new Error('فشل تحميل الولايات والمناطق');
        console.error('useCities error:', nextError);

        if (mounted) {
          setCities(FALLBACK_CITIES[code] ?? []);
          setError(nextError);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [countryCode, reloadKey]);

  return { cities, loading, error, reload: () => setReloadKey((value) => value + 1) };
}
