// ============================================================
// دليل الرقاة - Pays supportés (Global)
// ============================================================
import type { Country } from '@/types';

export const SUPPORTED_COUNTRIES: Country[] = [
  {
    code: 'DZ',
    name_ar: 'الجزائر',
    name_en: 'Algeria',
    name_fr: 'Algérie',
    name_local: 'Algérie',
    flag_emoji: '🇩🇿',
    phone_prefix: '+213',
    is_active: true,
    has_wilaya_system: true,
    default_language: 'ar',
    currency_code: 'DZD',
  },
  {
    code: 'MA',
    name_ar: 'المغرب',
    name_en: 'Morocco',
    name_fr: 'Maroc',
    name_local: 'Maroc',
    flag_emoji: '🇲🇦',
    phone_prefix: '+212',
    is_active: true,
    has_wilaya_system: false,
    default_language: 'ar',
    currency_code: 'MAD',
  },
  {
    code: 'TN',
    name_ar: 'تونس',
    name_en: 'Tunisia',
    name_fr: 'Tunisie',
    name_local: 'Tunisie',
    flag_emoji: '🇹🇳',
    phone_prefix: '+216',
    is_active: true,
    has_wilaya_system: false,
    default_language: 'ar',
    currency_code: 'TND',
  },
  {
    code: 'FR',
    name_ar: 'فرنسا',
    name_en: 'France',
    name_fr: 'France',
    name_local: 'France',
    flag_emoji: '🇫🇷',
    phone_prefix: '+33',
    is_active: true,
    has_wilaya_system: false,
    default_language: 'fr',
    currency_code: 'EUR',
  },
  {
    code: 'SA',
    name_ar: 'السعودية',
    name_en: 'Saudi Arabia',
    name_fr: 'Arabie Saoudite',
    name_local: 'السعودية',
    flag_emoji: '🇸🇦',
    phone_prefix: '+966',
    is_active: false,
    has_wilaya_system: false,
    default_language: 'ar',
    currency_code: 'SAR',
  },
  {
    code: 'AE',
    name_ar: 'الإمارات',
    name_en: 'UAE',
    name_fr: 'Émirats',
    name_local: 'الإمارات',
    flag_emoji: '🇦🇪',
    phone_prefix: '+971',
    is_active: false,
    has_wilaya_system: false,
    default_language: 'ar',
    currency_code: 'AED',
  },
  {
    code: 'TR',
    name_ar: 'تركيا',
    name_en: 'Turkey',
    name_fr: 'Turquie',
    name_local: 'Türkiye',
    flag_emoji: '🇹🇷',
    phone_prefix: '+90',
    is_active: false,
    has_wilaya_system: false,
    default_language: 'tr',
    currency_code: 'TRY',
  },
  {
    code: 'DE',
    name_ar: 'ألمانيا',
    name_en: 'Germany',
    name_fr: 'Allemagne',
    name_local: 'Deutschland',
    flag_emoji: '🇩🇪',
    phone_prefix: '+49',
    is_active: false,
    has_wilaya_system: false,
    default_language: 'de',
    currency_code: 'EUR',
  },
  {
    code: 'BE',
    name_ar: 'بلجيكا',
    name_en: 'Belgium',
    name_fr: 'Belgique',
    name_local: 'België',
    flag_emoji: '🇧🇪',
    phone_prefix: '+32',
    is_active: false,
    has_wilaya_system: false,
    default_language: 'fr',
    currency_code: 'EUR',
  },
  {
    code: 'NL',
    name_ar: 'هولندا',
    name_en: 'Netherlands',
    name_fr: 'Pays-Bas',
    name_local: 'Nederland',
    flag_emoji: '🇳🇱',
    phone_prefix: '+31',
    is_active: false,
    has_wilaya_system: false,
    default_language: 'nl',
    currency_code: 'EUR',
  },
  {
    code: 'GB',
    name_ar: 'بريطانيا',
    name_en: 'United Kingdom',
    name_fr: 'Royaume-Uni',
    name_local: 'United Kingdom',
    flag_emoji: '🇬🇧',
    phone_prefix: '+44',
    is_active: false,
    has_wilaya_system: false,
    default_language: 'en',
    currency_code: 'GBP',
  },
  {
    code: 'ID',
    name_ar: 'إندونيسيا',
    name_en: 'Indonesia',
    name_fr: 'Indonésie',
    name_local: 'Indonesia',
    flag_emoji: '🇮🇩',
    phone_prefix: '+62',
    is_active: false,
    has_wilaya_system: false,
    default_language: 'id',
    currency_code: 'IDR',
  },
  {
    code: 'MY',
    name_ar: 'ماليزيا',
    name_en: 'Malaysia',
    name_fr: 'Malaisie',
    name_local: 'Malaysia',
    flag_emoji: '🇲🇾',
    phone_prefix: '+60',
    is_active: false,
    has_wilaya_system: false,
    default_language: 'ms',
    currency_code: 'MYR',
  },
  {
    code: 'PK',
    name_ar: 'باكستان',
    name_en: 'Pakistan',
    name_fr: 'Pakistan',
    name_local: 'Pakistan',
    flag_emoji: '🇵🇰',
    phone_prefix: '+92',
    is_active: false,
    has_wilaya_system: false,
    default_language: 'ur',
    currency_code: 'PKR',
  },
  {
    code: 'US',
    name_ar: 'أمريكا',
    name_en: 'USA',
    name_fr: 'États-Unis',
    name_local: 'United States',
    flag_emoji: '🇺🇸',
    phone_prefix: '+1',
    is_active: false,
    has_wilaya_system: false,
    default_language: 'en',
    currency_code: 'USD',
  },
  {
    code: 'CA',
    name_ar: 'كندا',
    name_en: 'Canada',
    name_fr: 'Canada',
    name_local: 'Canada',
    flag_emoji: '🇨🇦',
    phone_prefix: '+1',
    is_active: false,
    has_wilaya_system: false,
    default_language: 'en',
    currency_code: 'CAD',
  },
];

export function getCountryByCode(code: string): Country | undefined {
  return SUPPORTED_COUNTRIES.find((c) => c.code === code);
}

export function getActiveCountries(): Country[] {
  return SUPPORTED_COUNTRIES.filter((c) => c.is_active);
}

export function getCountryName(code: string, lang: 'ar' | 'en' | 'fr' = 'ar'): string {
  const country = getCountryByCode(code);
  if (!country) return code;
  return country[`name_${lang}` as keyof Country] as string;
}

export function getPhonePrefix(code: string): string {
  return getCountryByCode(code)?.phone_prefix || '';
}

export function normalizePhoneForCountry(phone: string, countryCode: string): string {
  const prefix = getPhonePrefix(countryCode);
  const cleaned = phone.replace(/\D/g, '');
  const prefixNoPlus = prefix.replace('+', '');
  if (cleaned.startsWith(prefixNoPlus)) return cleaned;
  if (cleaned.startsWith('0')) return prefixNoPlus + cleaned.slice(1);
  return cleaned;
}
