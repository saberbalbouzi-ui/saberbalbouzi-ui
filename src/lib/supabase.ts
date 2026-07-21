// ============================================================
// دليل الرقاة - Supabase Client (CORRIGÉ)
// ============================================================
import { createClient } from '@supabase/supabase-js';
import type { Raqi, Review, Wilaya } from '@/types';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

type ExtendedRaqi = Raqi & {
  email?: string | null;
  user_id?: string | null;
};

type PublicRegisterInput = {
  full_name: string;
  speciality?: string;
  phone?: string;
  whatsapp?: string;
  wilaya: string;
  address?: string;
  experience_years?: number;
  bio?: string;
};

type AccountRegisterInput = PublicRegisterInput & {
  email: string;
  password: string;
};

export const mockWilayas: Wilaya[] = [
  { id: 1, code: '01', name_ar: 'أدرار' },
  { id: 2, code: '02', name_ar: 'الشلف' },
  { id: 3, code: '03', name_ar: 'الأغواط' },
  { id: 4, code: '04', name_ar: 'أم البواقي' },
  { id: 5, code: '05', name_ar: 'باتنة' },
  { id: 6, code: '06', name_ar: 'بجاية' },
  { id: 7, code: '07', name_ar: 'بسكرة' },
  { id: 8, code: '08', name_ar: 'بشار' },
  { id: 9, code: '09', name_ar: 'البليدة' },
  { id: 10, code: '10', name_ar: 'البويرة' },
  { id: 11, code: '11', name_ar: 'تمنراست' },
  { id: 12, code: '12', name_ar: 'تبسة' },
  { id: 13, code: '13', name_ar: 'تلمسان' },
  { id: 14, code: '14', name_ar: 'تيارت' },
  { id: 15, code: '15', name_ar: 'تيزي وزو' },
  { id: 16, code: '16', name_ar: 'الجزائر' },
  { id: 17, code: '17', name_ar: 'الجلفة' },
  { id: 18, code: '18', name_ar: 'جيجل' },
  { id: 19, code: '19', name_ar: 'سطيف' },
  { id: 20, code: '20', name_ar: 'سعيدة' },
  { id: 21, code: '21', name_ar: 'سكيكدة' },
  { id: 22, code: '22', name_ar: 'سيدي بلعباس' },
  { id: 23, code: '23', name_ar: 'عنابة' },
  { id: 24, code: '24', name_ar: 'قالمة' },
  { id: 25, code: '25', name_ar: 'قسنطينة' },
  { id: 26, code: '26', name_ar: 'المدية' },
  { id: 27, code: '27', name_ar: 'مستغانم' },
  { id: 28, code: '28', name_ar: 'المسيلة' },
  { id: 29, code: '29', name_ar: 'معسكر' },
  { id: 30, code: '30', name_ar: 'ورقلة' },
  { id: 31, code: '31', name_ar: 'وهران' },
  { id: 32, code: '32', name_ar: 'البيض' },
  { id: 33, code: '33', name_ar: 'إليزي' },
  { id: 34, code: '34', name_ar: 'برج بوعريريج' },
  { id: 35, code: '35', name_ar: 'بومرداس' },
  { id: 36, code: '36', name_ar: 'الطارف' },
  { id: 37, code: '37', name_ar: 'تندوف' },
  { id: 38, code: '38', name_ar: 'تيسمسيلت' },
  { id: 39, code: '39', name_ar: 'الوادي' },
  { id: 40, code: '40', name_ar: 'خنشلة' },
  { id: 41, code: '41', name_ar: 'سوق أهراس' },
  { id: 42, code: '42', name_ar: 'تيبازة' },
  { id: 43, code: '43', name_ar: 'ميلة' },
  { id: 44, code: '44', name_ar: 'عين الدفلى' },
  { id: 45, code: '45', name_ar: 'النعامة' },
  { id: 46, code: '46', name_ar: 'عين تموشنت' },
  { id: 47, code: '47', name_ar: 'غرداية' },
  { id: 48, code: '48', name_ar: 'غليزان' },
  { id: 49, code: '49', name_ar: 'تيميمون' },
  { id: 50, code: '50', name_ar: 'برج باجي مختار' },
  { id: 51, code: '51', name_ar: 'أولاد جلال' },
  { id: 52, code: '52', name_ar: 'بني عباس' },
  { id: 53, code: '53', name_ar: 'عين صالح' },
  { id: 54, code: '54', name_ar: 'عين قزام' },
  { id: 55, code: '55', name_ar: 'تقرت' },
  { id: 56, code: '56', name_ar: 'جانت' },
  { id: 57, code: '57', name_ar: 'المغير' },
  { id: 58, code: '58', name_ar: 'المنيعة' },
];

function sanitizeText(value?: string): string {
  return value?.trim() || '';
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
  if (typeof error === 'string' && error.trim()) return error;

  if (error && typeof error === 'object') {
    const e = error as Record<string, unknown>;

    if (typeof e.message === 'string' && e.message.trim()) return e.message;
    if (typeof e.error_description === 'string' && e.error_description.trim()) {
      return e.error_description;
    }
    if (typeof e.details === 'string' && e.details.trim()) return e.details;
    if (typeof e.hint === 'string' && e.hint.trim()) return e.hint;
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

    if (!data) return slug;

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

export async function getRaqis(wilayaCode?: string): Promise<Raqi[]> {
  let query = supabase
    .from('raqis')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

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

export async function registerRaqi(raqi: PublicRegisterInput): Promise<void> {
  const slug = await generateUniqueSlug(raqi.full_name);

  const { error } = await supabase.from('raqis').insert({
    slug,
    has_auth_account: false,
    full_name: sanitizeText(raqi.full_name),
    speciality: sanitizeText(raqi.speciality),
    phone: sanitizeText(raqi.phone),
    whatsapp: sanitizeText(raqi.whatsapp),
    wilaya: raqi.wilaya,
    address: sanitizeText(raqi.address),
    experience_years: raqi.experience_years ?? 0,
    bio: sanitizeText(raqi.bio),
    status: 'pending',
    verified_badge: false,
  });

  if (error) {
    throw new Error(getSafeErrorMessage(error));
  }
}

/**
 * Inscription avec création de compte Supabase Auth
 * - Vérifie si un ancien profil existe avec cet email
 * - Si non: cherche par nom + wilaya (pour raqis sans email)
 * - Si trouvé: lie le compte auth à l'ancien profil (UPDATE)
 * - Si non: crée un nouveau profil (INSERT)
 */
export async function registerRaqiWithAccount(
  input: AccountRegisterInput
): Promise<{ needsEmailConfirmation: boolean }> {
  const email = input.email.trim().toLowerCase();
  const fullName = sanitizeText(input.full_name);

  // Étape 1: Créer le compte Supabase Auth
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (signUpError) {
    throw new Error(getSafeErrorMessage(signUpError));
  }

  const userId = signUpData.user?.id ?? null;
  const needsEmailConfirmation = signUpData.session === null;

  // Étape 2: Chercher un ancien profil (d'abord par email, puis par nom + wilaya)
  let existingRaqi: any = null;

  // 2a. Chercher par email
  const { data: byEmail, error: errEmail } = await supabase
    .from('raqis')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (errEmail) throw new Error(getSafeErrorMessage(errEmail));
  if (byEmail) existingRaqi = byEmail;

  // 2b. Si pas trouvé par email, chercher par nom + wilaya (pour raqis sans email)
  if (!existingRaqi && fullName && input.wilaya) {
    const { data: byNameWilaya, error: errName } = await supabase
      .from('raqis')
      .select('*')
      .ilike('full_name', fullName)
      .eq('wilaya', input.wilaya)
      .is('user_id', null)
      .maybeSingle();

    if (errName) throw new Error(getSafeErrorMessage(errName));
    if (byNameWilaya) existingRaqi = byNameWilaya;
  }

  if (existingRaqi) {
    // ✅ Ancien raqi trouvé! Lier le compte auth à son profil
    if (existingRaqi.user_id) {
      throw new Error('هذا الحساب مرتبط بالفعل. يرجى تسجيل الدخول.');
    }

    const { error: updateError } = await supabase
      .from('raqis')
      .update({
        user_id: userId,
        email,
        has_auth_account: true,
        full_name: fullName,
        speciality: sanitizeText(input.speciality) || existingRaqi.speciality,
        phone: sanitizeText(input.phone) || existingRaqi.phone,
        whatsapp: sanitizeText(input.whatsapp) || existingRaqi.whatsapp,
        wilaya: input.wilaya || existingRaqi.wilaya,
        address: sanitizeText(input.address) || existingRaqi.address,
        experience_years: input.experience_years ?? existingRaqi.experience_years ?? 0,
        bio: sanitizeText(input.bio) || existingRaqi.bio,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingRaqi.id);

    if (updateError) throw new Error(getSafeErrorMessage(updateError));
  } else {
    // ❌ Aucun ancien profil: créer un nouveau
    const slug = await generateUniqueSlug(fullName);

    const { error: insertError } = await supabase.from('raqis').insert({
      user_id: userId,
      email,
      has_auth_account: true,
      slug,
      full_name: fullName,
      speciality: sanitizeText(input.speciality),
      phone: sanitizeText(input.phone),
      whatsapp: sanitizeText(input.whatsapp),
      wilaya: input.wilaya,
      address: sanitizeText(input.address),
      experience_years: input.experience_years ?? 0,
      bio: sanitizeText(input.bio),
      status: 'pending',
      verified_badge: false,
    });

    if (insertError) throw new Error(getSafeErrorMessage(insertError));
  }

  return { needsEmailConfirmation };
}

/**
 * استعادة حساب راقٍ مسجل سابقاً
 * - تتحقق من وجود البريد في جدول raqis
 * - تُرسل رابط دخول سحري (magic link)
 */
export async function claimRaqiAccount(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();

  // Vérifier que l'email existe dans raqis
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

  // Envoyer le magic link
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

/**
 * CORRECTION: Récupère le profil du raqi connecté
 * Cherche d'abord par user_id, puis par email si nécessaire
 */
export async function getCurrentRaqiProfile(): Promise<ExtendedRaqi | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(getSafeErrorMessage(userError));
  }

  if (!user) return null;

  // Chercher par user_id
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

  // Fallback: chercher par email et lier si trouvé
  if (user.email) {
    const normalizedEmail = user.email.toLowerCase();

    const { data: byEmail, error: byEmailError } = await supabase
      .from('raqis')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (byEmailError) {
      throw new Error(getSafeErrorMessage(byEmailError));
    }

    if (byEmail) {
      if (!byEmail.user_id) {
        const { error: linkError } = await supabase
          .from('raqis')
          .update({
            user_id: user.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', byEmail.id);

        if (linkError) {
          throw new Error(getSafeErrorMessage(linkError));
        }

        return {
          ...(byEmail as ExtendedRaqi),
          user_id: user.id,
        };
      }

      return byEmail as ExtendedRaqi;
    }
  }

  return null;
}

export async function updateCurrentRaqiProfile(
  updates: Partial<ExtendedRaqi>
): Promise<ExtendedRaqi | null> {
  const current = await getCurrentRaqiProfile();

  if (!current) {
    throw new Error('لم يتم العثور على ملف الراقي');
  }

  const { data, error } = await supabase
    .from('raqis')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', current.id)
    .select('*')
    .maybeSingle();

  if (error) {
    throw new Error(getSafeErrorMessage(error));
  }

  return (data as ExtendedRaqi | null) ?? null;
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

export async function deleteRaqi(id: string): Promise<void> {
  const { error } = await supabase.from('raqis').delete().eq('id', id);

  if (error) {
    throw new Error(getSafeErrorMessage(error));
  }
}
