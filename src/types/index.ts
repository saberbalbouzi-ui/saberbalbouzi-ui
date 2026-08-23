// ============================================================
// دليل الرقاة - Types & Interfaces (Global)
// ============================================================

export interface Raqi {
  id: string;
  user_id: string | null;
  email: string | null;
  slug: string;
  full_name: string;
  speciality: string | null;
  phone: string | null;
  whatsapp: string | null;
  balance_credits: number;

  // === IMAGE PROFIL ===
  profile_image_url: string | null;
  profile_image_path: string | null;

  // === MULTI-PAYS ===
  country_code: string;
  city: string | null;
  wilaya: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  languages_spoken: string[] | null;
  // === FIN MULTI-PAYS ===

  address: string | null;
  experience_years: number;
  bio: string | null;

  verified_badge: boolean;
  featured_badge?: boolean;
  has_auth_account?: boolean;

  view_count?: number;
  phone_click_count?: number;
  whatsapp_click_count?: number;

  // === LIENS SOCIAUX ===
  facebook_url: string | null;
  youtube_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;

  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface RaqiInsert {
  user_id?: string | null;
  email?: string | null;
  slug: string;
  full_name: string;
  speciality?: string;
  phone?: string;
  whatsapp?: string;

  // === IMAGE PROFIL ===
  profile_image_url?: string | null;
  profile_image_path?: string | null;

  country_code: string;
  city?: string | null;
  wilaya?: string | null;
  postal_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  languages_spoken?: string[] | null;

  address?: string | null;
  experience_years?: number;
  bio?: string | null;

  facebook_url?: string | null;
  youtube_url?: string | null;
  instagram_url?: string | null;
  tiktok_url?: string | null;

  verified_badge?: boolean;
  featured_badge?: boolean;
  has_auth_account?: boolean;

  view_count?: number;
  phone_click_count?: number;
  whatsapp_click_count?: number;

  status?: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

export interface RaqiProduct {
  id: string;
  raqi_id: string;
  name: string;
  description: string | null;
  price: number | null;
  currency: 'DZD' | 'MAD' | 'TND' | 'EUR' | 'USD';
  image_url: string | null;
  image_path: string | null;
  is_active: boolean;
  sort_order: number;
  image_file?: File | null;      
  remove_image?: boolean;           
  created_at: string;
  updated_at: string;
}

export interface RaqiProductInsert {
  raqi_id: string;
  name: string;
  description?: string | null;
  price?: number | null;
  currency?: 'DZD' | 'MAD' | 'TND' | 'EUR' | 'USD';
  image_url?: string | null;
  image_path?: string | null;
  is_active?: boolean;
  sort_order?: number;
  image_file?: File | null;      
  remove_image?: boolean;    
  created_at?: string;
  updated_at?: string;
}

export interface Review {
  id: string;
  raqi_id: string;
  rating: number;
  comment: string | null;
  reviewer_name: string;
  created_at: string;
}

export interface ReviewInsert {
  raqi_id: string;
  rating: number;
  comment?: string;
  reviewer_name: string;
}

export interface Wilaya {
  id: number;
  code: string;
  name_ar: string;
}

export interface Country {
  code: string;
  name_ar: string;
  name_en: string;
  name_fr: string;
  name_local: string;
  flag_emoji: string;
  phone_prefix: string;
  is_active: boolean;
  has_wilaya_system: boolean;
  default_language: string;
  currency_code: string;
}

export interface City {
  id: number;
  country_code: string;
  name_ar: string;
  name_en: string;
  name_local: string;
}

export type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';