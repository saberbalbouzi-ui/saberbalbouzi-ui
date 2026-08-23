// ============================================================
// دليل الرقاة - Supabase Client
// ============================================================

import { createClient } from '@supabase/supabase-js';
import type { Raqi, Review, Wilaya, RaqiProduct, RaqiProductInsert } from '@/types';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';

const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const RAQI_PROFILE_BUCKET = 'raqi-profiles';
const RAQI_PRODUCTS_BUCKET = 'raqi-product-images';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

type ExtendedRaqi = Raqi & {
  email?: string | null;
  user_id?: string | null;
  profile_image_url?: string | null;
  profile_image_path?: string | null;
};

type PublicRegisterInput = {
  full_name: string;
  speciality?: string;
  phone?: string;
  whatsapp?: string;
  wilaya: string;
  country_code?: string;
  address?: string;
  experience_years?: number;
  bio?: string;
  facebook_url?: string;
  youtube_url?: string;
  instagram_url?: string;
  tiktok_url?: string;
  profile_image?: File | null;
};

type AccountRegisterInput = PublicRegisterInput & {
  email: string;
  password: string;
};

export interface DbCountry {
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

export interface DbCity {
  id: number;
  country_code: string;
  name_ar: string;
  name_en: string;
  name_local: string;
  latitude: number | null;
  longitude: number | null;
}

export async function getCountriesFromDb(
  activeOnly = false
): Promise<DbCountry[]> {
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
    throw new Error(getSafeErrorMessage(error));
  }

  return (data ?? []) as DbCountry[];
}


export async function getCitiesFromDb(
  countryCode: string
): Promise<DbCity[]> {
  if (!countryCode) {
    return [];
  }

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
    throw new Error(getSafeErrorMessage(error));
  }

  return (data ?? []) as DbCity[];
}

function sanitizeText(value?: string): string {
  return value?.trim() || '';
}

function sanitizeUrl(value?: string): string | null {
  const url = value?.trim() || '';

  if (!url) return null;

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }

  return url;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function getSafeErrorMessage(error: unknown): string {
  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  if (error && typeof error === 'object') {
    const e = error as Record<string, unknown>;

    if (typeof e.message === 'string' && e.message.trim()) {
      return e.message;
    }

    if (typeof e.error_description === 'string' && e.error_description.trim()) {
      return e.error_description;
    }

    if (typeof e.details === 'string' && e.details.trim()) {
      return e.details;
    }

    if (typeof e.hint === 'string' && e.hint.trim()) {
      return e.hint;
    }
  }

  return 'حدث خطأ غير متوقع';
}

async function generateUniqueSlug(fullName: string): Promise<string> {
  const baseSlug = slugify(fullName) || `raqi-${Date.now()}`;
  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const { data, error } = await supabase
      .from('raqis')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      throw new Error(getSafeErrorMessage(error));
    }

    if (!data) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || 'jpg';
}

function buildProfileImagePath(identifier: string, file: File): string {
  const ext = getFileExtension(file.name);
  const cleanIdentifier = identifier.replace(/[^a-zA-Z0-9-_]/g, '');

  return `${cleanIdentifier}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;
}

function buildProductImagePath(identifier: string, file: File): string {
  const ext = getFileExtension(file.name);
  const cleanIdentifier = identifier.replace(/[^a-zA-Z0-9-_]/g, '');

  return `${cleanIdentifier}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;
}

async function uploadProfileImage(
  file: File,
  identifier: string
): Promise<{ profile_image_url: string; profile_image_path: string }> {
  const filePath = buildProfileImagePath(identifier, file);

  const { data, error } = await supabase.storage
    .from(RAQI_PROFILE_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw new Error(getSafeErrorMessage(error));
  }

  const { data: publicUrlData } = supabase.storage
    .from(RAQI_PROFILE_BUCKET)
    .getPublicUrl(data.path);

  return {
    profile_image_url: publicUrlData.publicUrl,
    profile_image_path: data.path,
  };
}

async function uploadProductImage(
  file: File,
  identifier: string
): Promise<{ image_url: string; image_path: string }> {
  const filePath = buildProductImagePath(identifier, file);

  const { data, error } = await supabase.storage
    .from(RAQI_PRODUCTS_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(getSafeErrorMessage(error));
  }

  const { data: publicUrlData } = supabase.storage
    .from(RAQI_PRODUCTS_BUCKET)
    .getPublicUrl(data.path);

  return {
    image_url: publicUrlData.publicUrl,
    image_path: data.path,
  };
}

async function removeProfileImage(path?: string | null): Promise<void> {
  if (!path) return;

  const { error } = await supabase.storage
    .from(RAQI_PROFILE_BUCKET)
    .remove([path]);

  if (error) {
    throw new Error(getSafeErrorMessage(error));
  }
}

async function removeProductImage(path?: string | null): Promise<void> {
  if (!path) return;

  const { error } = await supabase.storage
    .from(RAQI_PRODUCTS_BUCKET)
    .remove([path]);

  if (error) {
    throw new Error(getSafeErrorMessage(error));
  }
}

export async function getRaqis(
  countryCode?: string,
  wilayaCode?: string
): Promise<Raqi[]> {
  let query = supabase
    .from('raqis')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (countryCode) {
    query = query.eq('country_code', countryCode);
  }

  if (wilayaCode) {
    query = query.eq('wilaya', wilayaCode);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(getSafeErrorMessage(error));
  }

  return (data ?? []) as Raqi[];
}

export async function getRaqiBySlug(slug: string): Promise<Raqi | null> {
  const { data, error } = await supabase
    .from('raqis')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    throw new Error(getSafeErrorMessage(error));
  }

  return (data as Raqi | null) ?? null;
}

export async function getReviews(raqiId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('raqi_id', raqiId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(getSafeErrorMessage(error));
  }

  return (data ?? []) as Review[];
}

export async function addReview(review: {
  raqi_id: string;
  rating: number;
  comment?: string;
  reviewer_name: string;
}): Promise<void> {
  const { error } = await supabase.from('reviews').insert({
    raqi_id: review.raqi_id,
    rating: review.rating,
    comment: sanitizeText(review.comment),
    reviewer_name: sanitizeText(review.reviewer_name),
  });

  if (error) {
    throw new Error(getSafeErrorMessage(error));
  }
}

export async function getRaqiProducts(raqiId: string): Promise<RaqiProduct[]> {
  const { data, error } = await supabase
    .from('raqi_products')
    .select('*')
    .eq('raqi_id', raqiId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(getSafeErrorMessage(error));
  }

  return (data ?? []) as RaqiProduct[];
}

export async function getCurrentRaqiProducts(): Promise<RaqiProduct[]> {
  const current = await getCurrentRaqiProfile();

  if (!current) {
    throw new Error('لم يتم العثور على ملف الراقي');
  }

  const { data, error } = await supabase
    .from('raqi_products')
    .select('*')
    .eq('raqi_id', current.id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(getSafeErrorMessage(error));
  }

  return (data ?? []) as RaqiProduct[];
}

export async function createRaqiProduct(
  input: RaqiProductInsert & { image_file?: File | null }
): Promise<RaqiProduct> {
  const current = await getCurrentRaqiProfile();

  if (!current) {
    throw new Error('لم يتم العثور على ملف الراقي');
  }

  if (!current.featured_badge) {
    throw new Error('هذه الميزة متاحة فقط للرقاة المتميزين');
  }

  let uploadedImage: { image_url: string; image_path: string } | null = null;

  if (input.image_file) {
    uploadedImage = await uploadProductImage(
      input.image_file,
      current.user_id || current.id
    );
  }

  const payload = {
    raqi_id: current.id,
    name: sanitizeText(input.name),
    description: sanitizeText(input.description || '') || null,
    price: input.price ?? null,
    currency: input.currency || 'DZD',
    image_url: uploadedImage?.image_url ?? null,
    image_path: uploadedImage?.image_path ?? null,
    is_active: input.is_active ?? true,
    sort_order: input.sort_order ?? 0,
  };

  const { data, error } = await supabase
    .from('raqi_products')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    if (uploadedImage?.image_path) {
      await removeProductImage(uploadedImage.image_path).catch(() => undefined);
    }

    throw new Error(getSafeErrorMessage(error));
  }

  return data as RaqiProduct;
}

export async function updateRaqiProduct(
  productId: string,
  updates: Partial<RaqiProductInsert> & {
    image_file?: File | null;
    remove_image?: boolean;
  }
): Promise<RaqiProduct> {
  const current = await getCurrentRaqiProfile();

  if (!current) {
    throw new Error('لم يتم العثور على ملف الراقي');
  }

  const { data: existing, error: existingError } = await supabase
    .from('raqi_products')
    .select('*')
    .eq('id', productId)
    .eq('raqi_id', current.id)
    .maybeSingle();

  if (existingError) {
    throw new Error(getSafeErrorMessage(existingError));
  }

  if (!existing) {
    throw new Error('المنتج غير موجود');
  }

  let nextImageUrl = existing.image_url ?? null;
  let nextImagePath = existing.image_path ?? null;
  let uploadedImage: { image_url: string; image_path: string } | null = null;

  if (updates.image_file) {
    uploadedImage = await uploadProductImage(
      updates.image_file,
      current.user_id || current.id
    );

    nextImageUrl = uploadedImage.image_url;
    nextImagePath = uploadedImage.image_path;
  }

  if (updates.remove_image) {
    nextImageUrl = null;
    nextImagePath = null;
  }

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    image_url: nextImageUrl,
    image_path: nextImagePath,
  };

  if (updates.name !== undefined) {
    payload.name = sanitizeText(updates.name);
  }

  if (updates.description !== undefined) {
    payload.description = sanitizeText(updates.description || '') || null;
  }

  if (updates.price !== undefined) {
    payload.price = updates.price;
  }

  if (updates.currency !== undefined) {
    payload.currency = updates.currency;
  }

  if (updates.is_active !== undefined) {
    payload.is_active = updates.is_active;
  }

  if (updates.sort_order !== undefined) {
    payload.sort_order = updates.sort_order;
  }

  const { data, error } = await supabase
    .from('raqi_products')
    .update(payload)
    .eq('id', productId)
    .eq('raqi_id', current.id)
    .select('*')
    .single();

  if (error) {
    if (uploadedImage?.image_path) {
      await removeProductImage(uploadedImage.image_path).catch(() => undefined);
    }

    throw new Error(getSafeErrorMessage(error));
  }

  if (updates.image_file && existing.image_path && existing.image_path !== nextImagePath) {
    await removeProductImage(existing.image_path).catch(() => undefined);
  }

  if (updates.remove_image && existing.image_path) {
    await removeProductImage(existing.image_path).catch(() => undefined);
  }

  return data as RaqiProduct;
}

export async function deleteRaqiProduct(productId: string): Promise<void> {
  const current = await getCurrentRaqiProfile();

  if (!current) {
    throw new Error('لم يتم العثور على ملف الراقي');
  }

  const { data: existing, error: existingError } = await supabase
    .from('raqi_products')
    .select('id, image_path')
    .eq('id', productId)
    .eq('raqi_id', current.id)
    .maybeSingle();

  if (existingError) {
    throw new Error(getSafeErrorMessage(existingError));
  }

  if (!existing) {
    throw new Error('المنتج غير موجود');
  }

  const { error } = await supabase
    .from('raqi_products')
    .delete()
    .eq('id', productId)
    .eq('raqi_id', current.id);

  if (error) {
    throw new Error(getSafeErrorMessage(error));
  }

  if (existing.image_path) {
    await removeProductImage(existing.image_path).catch(() => undefined);
  }
}

export async function registerRaqi(raqi: PublicRegisterInput): Promise<void> {
  const slug = await generateUniqueSlug(raqi.full_name);

  let profileImageData: {
    profile_image_url: string;
    profile_image_path: string;
  } | null = null;

  if (raqi.profile_image) {
    profileImageData = await uploadProfileImage(
      raqi.profile_image,
      `guest-${slug}`
    );
  }

  const { error } = await supabase.from('raqis').insert({
    slug,
    has_auth_account: false,
    full_name: sanitizeText(raqi.full_name),
    speciality: sanitizeText(raqi.speciality),
    phone: sanitizeText(raqi.phone),
    whatsapp: sanitizeText(raqi.whatsapp),
    country_code: raqi.country_code || 'DZ',
    wilaya: raqi.wilaya,
    address: sanitizeText(raqi.address),
    experience_years: raqi.experience_years ?? 0,
    bio: sanitizeText(raqi.bio),
    facebook_url: sanitizeUrl(raqi.facebook_url),
    youtube_url: sanitizeUrl(raqi.youtube_url),
    instagram_url: sanitizeUrl(raqi.instagram_url),
    tiktok_url: sanitizeUrl(raqi.tiktok_url),
    profile_image_url: profileImageData?.profile_image_url ?? null,
    profile_image_path: profileImageData?.profile_image_path ?? null,
    status: 'pending',
    verified_badge: false,
    featured_badge: false,
  });

  if (error) {
    if (profileImageData?.profile_image_path) {
      await removeProfileImage(profileImageData.profile_image_path).catch(
        () => undefined
      );
    }

    throw new Error(getSafeErrorMessage(error));
  }
}
function createSlug(value: string): string {
  const base = value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\u0600-\u06FFa-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return base || `raqi-${Date.now()}`;
}
export async function registerRaqiWithAccount(
  input: AccountRegisterInput
): Promise<{ needsEmailConfirmation: boolean }> {
  const email = input.email.trim().toLowerCase();
  const fullName = sanitizeText(input.full_name);

  if (!email || !fullName || !input.wilaya) {
    throw new Error('الاسم الكامل والبريد الإلكتروني والولاية مطلوبة');
  }

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${window.location.origin}/raqi-login`,
    },
  });

  if (signUpError) {
    throw new Error(signUpError.message || 'فشل إنشاء الحساب');
  }

  const userId = signUpData?.user?.id;

  if (!userId) {
    throw new Error('تعذر إنشاء المستخدم. يرجى المحاولة لاحقًا.');
  }

  const needsEmailConfirmation = signUpData.session === null;

  console.log('signUp userId:', userId);
  console.log('needsEmailConfirmation:', needsEmailConfirmation);
  console.log('signUp session direct:', signUpData.session ?? null);

  if (needsEmailConfirmation) {
    console.log('claim skipped: email confirmation required before authenticated session exists');
    return { needsEmailConfirmation: true };
  }

  let uploadedImage: {
    profile_image_url: string;
    profile_image_path: string;
  } | null = null;

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    console.log('session before claim:', sessionData.session);
    console.log('session user before claim:', sessionData.session?.user?.id ?? null);

    const { data: userData, error: userError } = await supabase.auth.getUser();
    console.log('getUser before claim:', userData.user ?? null);
    console.log(
      'getUser error before claim:',
      userError
        ? {
            message: userError.message,
            status: (userError as any).status,
            code: (userError as any).code,
          }
        : null
    );

    if (!sessionData.session || !userData.user) {
      throw new Error('لا توجد جلسة مصادقة صالحة قبل ربط ملف الراقي.');
    }

    if (input.profile_image) {
      uploadedImage = await uploadProfileImage(input.profile_image, userId);
      console.log('uploadedImage:', uploadedImage);
    }

    const slug = createSlug(fullName);

    const { data: claimedRaqi, error: claimError } = await supabase.rpc(
      'claim_or_create_raqi_account',
      {
        p_full_name: fullName,
        p_wilaya: input.wilaya,
        p_email: email,
        p_slug: slug,
        p_speciality: sanitizeText(input.speciality),
        p_phone: sanitizeText(input.phone),
        p_whatsapp: sanitizeText(input.whatsapp),
        p_country_code: input.country_code || 'DZ',
        p_address: sanitizeText(input.address),
        p_experience_years: input.experience_years ?? 0,
        p_bio: sanitizeText(input.bio),
        p_facebook_url: sanitizeUrl(input.facebook_url),
        p_youtube_url: sanitizeUrl(input.youtube_url),
        p_instagram_url: sanitizeUrl(input.instagram_url),
        p_tiktok_url: sanitizeUrl(input.tiktok_url),
        p_profile_image_url: uploadedImage?.profile_image_url ?? null,
        p_profile_image_path: uploadedImage?.profile_image_path ?? null,
      }
    );

    console.log('claimedRaqi:', claimedRaqi);
    console.log(
      'claimError:',
      claimError
        ? {
            message: claimError.message,
            code: (claimError as any).code,
            details: (claimError as any).details,
            hint: (claimError as any).hint,
          }
        : null
    );

    if (claimError) {
      throw new Error(getSafeErrorMessage(claimError));
    }

    if (!claimedRaqi) {
      throw new Error('تعذر ربط أو إنشاء ملف الراقي.');
    }

    const profile = await getCurrentRaqiProfile();
    console.log('profile after claim:', profile);

    return { needsEmailConfirmation: false };
  } catch (error) {
    console.log(
      'registerRaqiWithAccount catch:',
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error
    );

    if (uploadedImage?.profile_image_path) {
      await removeProfileImage(uploadedImage.profile_image_path).catch(() => undefined);
    }

    throw error;
  }
}
export async function claimRaqiAccount(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();

  const { data: raqi, error: raqiError } = await supabase
    .from('raqis')
    .select('id, user_id')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (raqiError) {
    throw new Error(getSafeErrorMessage(raqiError));
  }

  if (!raqi) {
    throw new Error('لم يتم العثور على راقٍ مسجل بهذا البريد الإلكتروني');
  }

  if (raqi.user_id) {
    throw new Error('هذا الحساب مرتبط بالفعل. يرجى استخدام تسجيل الدخول العادي.');
  }

  const { error: otpError } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      emailRedirectTo: `${window.location.origin}/raqi-dashboard`,
    },
  });

  if (otpError) {
    throw new Error(getSafeErrorMessage(otpError));
  }
}

export async function getCurrentRaqiProfile(): Promise<ExtendedRaqi | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(getSafeErrorMessage(userError));
  }

  if (!user) {
    return null;
  }

  const { data: byUserId, error: byUserIdError } = await supabase
    .from('raqis')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (byUserIdError) {
    throw new Error(getSafeErrorMessage(byUserIdError));
  }

  if (byUserId) {
    return byUserId as ExtendedRaqi;
  }

  const normalizedEmail = user.email?.trim().toLowerCase();

  if (!normalizedEmail) {
    return null;
  }

  const { data: byEmail, error: byEmailError } = await supabase
    .from('raqis')
    .select('*')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (byEmailError) {
    throw new Error(getSafeErrorMessage(byEmailError));
  }

  if (!byEmail) {
    return null;
  }

  if (byEmail.user_id && byEmail.user_id !== user.id) {
    throw new Error('هذا البريد مرتبط بملف راقٍ تابع لحساب آخر.');
  }

  if (byEmail.user_id === user.id) {
    return byEmail as ExtendedRaqi;
  }

  const { data: linkedRaqi, error: linkError } = await supabase
    .from('raqis')
    .update({
      user_id: user.id,
      email: normalizedEmail,
      has_auth_account: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', byEmail.id)
    .is('user_id', null)
    .select('*')
    .single();

  if (linkError) {
    throw new Error(getSafeErrorMessage(linkError));
  }

  return linkedRaqi as ExtendedRaqi;
}

export async function updateCurrentRaqiProfile(
  updates: Partial<ExtendedRaqi> & {
    profile_image?: File | null;
    remove_profile_image?: boolean;
  }
): Promise<ExtendedRaqi | null> {
  const current = await getCurrentRaqiProfile();

  if (!current) {
    throw new Error('لم يتم العثور على ملف الراقي');
  }

  const { profile_image, remove_profile_image, ...restUpdates } = updates;

  let nextImageUrl = current.profile_image_url ?? null;
  let nextImagePath = current.profile_image_path ?? null;

  let uploadedImage: {
    profile_image_url: string;
    profile_image_path: string;
  } | null = null;

  if (profile_image) {
    uploadedImage = await uploadProfileImage(
      profile_image,
      current.user_id || current.id
    );

    nextImageUrl = uploadedImage.profile_image_url;
    nextImagePath = uploadedImage.profile_image_path;
  }

  if (remove_profile_image) {
    nextImageUrl = null;
    nextImagePath = null;
  }

  const payload: Record<string, unknown> = {
    ...restUpdates,
    profile_image_url: nextImageUrl,
    profile_image_path: nextImagePath,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('raqis')
    .update(payload)
    .eq('id', current.id)
    .eq('user_id', current.user_id)
    .select('*')
    .maybeSingle();

  if (error) {
    if (uploadedImage?.profile_image_path) {
      await removeProfileImage(uploadedImage.profile_image_path).catch(
        () => undefined
      );
    }

    throw new Error(getSafeErrorMessage(error));
  }

  if (!data) {
    if (uploadedImage?.profile_image_path) {
      await removeProfileImage(uploadedImage.profile_image_path).catch(
        () => undefined
      );
    }

    throw new Error('تعذر تحديث الملف. لا تملك صلاحية التعديل عليه.');
  }

  if (
    profile_image &&
    current.profile_image_path &&
    current.profile_image_path !== nextImagePath
  ) {
    await removeProfileImage(current.profile_image_path).catch(
      () => undefined
    );
  }

  if (remove_profile_image && current.profile_image_path) {
    await removeProfileImage(current.profile_image_path).catch(
      () => undefined
    );
  }

  return data as ExtendedRaqi;
}

export async function signOutRaqi(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(getSafeErrorMessage(error));
  }
}

export async function getAllRaqis(status?: string): Promise<Raqi[]> {
  let query = supabase
    .from('raqis')
    .select('*')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(getSafeErrorMessage(error));
  }

  return (data ?? []) as Raqi[];
}

export async function updateRaqiStatus(
  id: string,
  status: 'pending' | 'approved' | 'rejected'
): Promise<void> {
  const { error } = await supabase
    .from('raqis')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    throw new Error(getSafeErrorMessage(error));
  }
}

export async function toggleVerified(
  id: string,
  verified: boolean
): Promise<void> {
  const { error } = await supabase
    .from('raqis')
    .update({
      verified_badge: verified,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    throw new Error(getSafeErrorMessage(error));
  }
}

export async function incrementViewCount(slug: string): Promise<void> {
  const { error } = await supabase.rpc('increment_raqi_counter', {
    p_slug: slug,
    p_field: 'view_count',
  });

  if (error) {
    console.warn('View count error:', error);
  }
}

export async function incrementPhoneClick(slug: string): Promise<void> {
  const { error } = await supabase.rpc('increment_raqi_counter', {
    p_slug: slug,
    p_field: 'phone_click_count',
  });

  if (error) {
    console.warn('Phone click error:', error);
  }
}

export async function incrementWhatsAppClick(slug: string): Promise<void> {
  const { error } = await supabase.rpc('increment_raqi_counter', {
    p_slug: slug,
    p_field: 'whatsapp_click_count',
  });

  if (error) {
    console.warn('WhatsApp click error:', error);
  }
}
// ============================================================
// تتبع النقرات مع خصم الرصيد
// ============================================================
export type TrackClickResult =
  | { ok: true; newBalance: number }
  | { ok: false; reason: 'insufficient_balance' | 'error' };
export async function trackRaqiClick(
  raqiId: string,
  eventType: 'phone' | 'whatsapp'
): Promise<RaqiClickResult> {
  const { data, error } = await supabase.rpc('track_raqi_click', {
    p_raqi_id: raqiId,
    p_event_type: eventType,  // ✅ تأكد من اسم المعامل
  });

  if (error) {
    if (error.message.includes('INSUFFICIENT_BALANCE')) {
      // ✅ استدعاء الدالة التي تضيف الإيميل إلى queue
      await supabase.rpc('notify_zero_balance_attempt', {
        p_raqi_id: raqiId,
      });
      
      return { ok: false, reason: 'insufficient_balance' };
    }
    console.error('track_raqi_click error:', error.message);
    return { ok: false, reason: 'error' };
  }

  return { ok: true, newBalance: data as number };
}
export async function getRaqiStats(id: string): Promise<{
  view_count: number;
  phone_click_count: number;
  whatsapp_click_count: number;
}> {
  const { data, error } = await supabase
    .from('raqis')
    .select('view_count, phone_click_count, whatsapp_click_count')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(getSafeErrorMessage(error));
  }

  return {
    view_count: data?.view_count ?? 0,
    phone_click_count: data?.phone_click_count ?? 0,
    whatsapp_click_count: data?.whatsapp_click_count ?? 0,
  };
}

export async function deleteRaqi(id: string): Promise<void> {
  const { data: raqi, error: fetchError } = await supabase
    .from('raqis')
    .select('profile_image_path')
    .eq('id', id)
    .maybeSingle();

  if (fetchError) {
    throw new Error(getSafeErrorMessage(fetchError));
  }

  const { error } = await supabase
    .from('raqis')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(getSafeErrorMessage(error));
  }

  if (raqi?.profile_image_path) {
    await removeProfileImage(raqi.profile_image_path).catch(
      () => undefined
    );
  }
}