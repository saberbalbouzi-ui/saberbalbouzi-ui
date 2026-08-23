// ============================================================
// دليل الرقاة - الدول من Supabase
// ============================================================

import { supabase } from '@/lib/supabase';
import type { Country } from '@/types';

let countriesCache: Country[] = [];

export interface DbCountry extends Country {}

function mapCountry(row: DbCountry): Country {
  return {
    code: row.code,
    name_ar: row.name_ar,
    name_en: row.name_en,
    name_fr: row.name_fr,
    name_local: row.name_local,
    flag_emoji: row.flag_emoji,
    phone_prefix: row.phone_prefix,
    is_active: Boolean(row.is_active),
    has_wilaya_system: Boolean(row.has_wilaya_system),
    default_language: row.default_language,
    currency_code: row.currency_code,
  };
}

export async function loadCountries(
  activeOnly = false
): Promise<Country[]> {
  let query = supabase
    .from('countries')
    .select(`
      code,
      name_ar,
      name_en,
      name_fr,
      name_local,
      flag_emoji,
      phone_prefix,
      is_active,
      has_wilaya_system,
      default_language,
      currency_code
    `)
    .order('name_ar', { ascending: true });

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error loading countries from Supabase:', error);
    throw error;
  }

  countriesCache = (data ?? []).map((row) =>
    mapCountry(row as DbCountry)
  );

  return countriesCache;
}

export async function loadCitiesByCountry(countryCode: string) {
  const { data, error } = await supabase
    .from('cities')
    .select(`
      id,
      country_code,
      name_ar,
      name_en,
      name_local,
      latitude,
      longitude
    `)
    .eq('country_code', countryCode)
    .order('name_ar', { ascending: true });

  if (error) {
    console.error('Error loading cities from Supabase:', error);
    throw error;
  }

  return data ?? [];
}

export function setCountriesCache(countries: Country[]) {
  countriesCache = countries;
}

export function getCachedCountries(): Country[] {
  return countriesCache;
}

/**
 * دالة متزامنة للحفاظ على توافق الصفحات القديمة.
 * يجب تحميل الدول أولاً عبر loadCountries().
 */
export function getCountryByCode(
  code: string,
  countries: Country[] = countriesCache
): Country | undefined {
  return countries.find((country) => country.code === code);
}

export function getActiveCountries(): Country[] {
  return countriesCache.filter((country) => country.is_active);
}

export function getCountryName(
  code: string,
  lang: 'ar' | 'en' | 'fr' = 'ar'
): string {
  const country = getCountryByCode(code);

  if (!country) {
    return code;
  }

  if (lang === 'ar') return country.name_ar;
  if (lang === 'en') return country.name_en;
  return country.name_fr;
}

export function getPhonePrefix(code: string): string {
  return getCountryByCode(code)?.phone_prefix || '';
}

export function normalizePhoneForCountry(
  phone: string,
  countryCode: string
): string {
  const prefix = getPhonePrefix(countryCode);
  const cleaned = phone.replace(/\D/g, '');
  const prefixNoPlus = prefix.replace('+', '');

  if (!prefixNoPlus) {
    return cleaned;
  }

  if (cleaned.startsWith(prefixNoPlus)) {
    return cleaned;
  }

  if (cleaned.startsWith('0')) {
    return prefixNoPlus + cleaned.slice(1);
  }

  return cleaned;
}