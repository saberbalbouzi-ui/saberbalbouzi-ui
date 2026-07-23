// ============================================================
// Hook de détection automatique du pays (CORRIGÉ)
// ============================================================
import { useState, useEffect, useRef } from 'react';

interface GeoLocation {
  country_code: string;
  country_name: string;
  city: string;
  latitude: number;
  longitude: number;
}

const DEFAULT_COUNTRY = 'DZ';
const STORAGE_KEY = 'user_country';
const STORAGE_CITY_KEY = 'user_city';

export function useCountryDetection() {
  const [countryCode, setCountryCode] = useState<string>(() => {
    if (typeof window === 'undefined') return DEFAULT_COUNTRY;
    return localStorage.getItem(STORAGE_KEY) || '';
  });
  const [loading, setLoading] = useState(!countryCode);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    if (countryCode) {
      setLoading(false);
      return;
    }

    const detect = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/', {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data: GeoLocation = await response.json();

        const supportedCodes = [
          'DZ', 'MA', 'TN', 'FR', 'SA', 'AE', 'TR', 'DE', 'BE', 'NL',
          'GB', 'ID', 'MY', 'PK', 'US', 'CA',
        ];
        const detected = supportedCodes.includes(data.country_code)
          ? data.country_code
          : DEFAULT_COUNTRY;

        setCountryCode(detected);
        localStorage.setItem(STORAGE_KEY, detected);
        localStorage.setItem(STORAGE_CITY_KEY, data.city || '');
      } catch (err) {
        console.warn('Country detection failed:', err);
        const fallback = detectFromLanguage();
        setCountryCode(fallback);
        localStorage.setItem(STORAGE_KEY, fallback);
      } finally {
        setLoading(false);
      }
    };

    detect();
  }, []);

  const setManualCountry = (code: string) => {
    setCountryCode(code);
    localStorage.setItem(STORAGE_KEY, code);
    window.dispatchEvent(new CustomEvent('countrychange', { detail: { code } }));
  };

  return {
    countryCode: countryCode || DEFAULT_COUNTRY,
    loading,
    setManualCountry,
  };
}

function detectFromLanguage(): string {
  if (typeof navigator === 'undefined') return DEFAULT_COUNTRY;

  const lang = navigator.language.toLowerCase();

  const langMap: Record<string, string> = {
    'ar-dz': 'DZ', 'ar-ma': 'MA', 'ar-tn': 'TN', 'ar-sa': 'SA',
    'ar-ae': 'AE', 'fr-dz': 'DZ', 'fr-ma': 'MA', 'fr-tn': 'TN',
    'fr-fr': 'FR', 'fr-be': 'BE', 'en-gb': 'GB', 'en-us': 'US',
    'en-ca': 'CA', 'tr-tr': 'TR', 'de-de': 'DE', 'de-at': 'DE',
    'nl-nl': 'NL', 'nl-be': 'BE', 'id-id': 'ID', 'ms-my': 'MY',
    'ur-pk': 'PK',
  };

  if (langMap[lang]) return langMap[lang];

  const baseLang = lang.split('-')[0];
  const baseMap: Record<string, string> = {
    'ar': 'SA', 'fr': 'FR', 'en': 'GB', 'tr': 'TR',
    'de': 'DE', 'nl': 'NL', 'id': 'ID', 'ms': 'MY',
    'ur': 'PK', 'es': 'ES', 'pt': 'PT', 'it': 'IT',
  };

  return baseMap[baseLang] || DEFAULT_COUNTRY;
}
