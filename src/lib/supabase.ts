// ============================================================
// دليل الرقاة - Supabase Client
// ============================================================
import { createClient } from '@supabase/supabase-js';
import type { Raqi, RaqiInsert, Review, Wilaya } from '@/types';

// NOTE: Replace with your actual Supabase credentials after creating the project
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================
// Mock Data for MVP (until Supabase is connected)
// ============================================================

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

export const mockRaqis: Raqi[] = [
  {
    id: '1',
    slug: 'ahmed-benali',
    full_name: 'أحمد بن علي',
    speciality: 'الرقية الشرعية وعلاج السحر',
    phone: '0555123456',
    whatsapp: '0555123456',
    wilaya: '16',
    address: 'الجزائر العاصمة - حي محمدي',
    experience_years: 15,
    bio: 'راقٍ شرعي معتمد، حاصل على إجازة في القراءات، يعمل في مجال الرقية الشرعية منذ 15 عاماً، يعالج حالات السحر والعين والحسد والمس على وفق الكتاب والسنة.',
    verified_badge: true,
    status: 'approved',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: '2',
    slug: 'khaled-merabet',
    full_name: 'خالد مرابط',
    speciality: 'الرقية الشرعية وعلاج المس',
    phone: '0666789012',
    whatsapp: '0666789012',
    wilaya: '31',
    address: 'وهران - حي السلام',
    experience_years: 10,
    bio: 'متخصص في علاج المس والسحر والعين والحسد باستخدام القرآن الكريم والسنة النبوية.',
    verified_badge: true,
    status: 'approved',
    created_at: '2024-01-02',
    updated_at: '2024-01-02',
  },
  {
    id: '3',
    slug: 'youssef-kadi',
    full_name: 'يوسف القاضي',
    speciality: 'الرقية الشرعية والتعليم',
    phone: '0777123456',
    whatsapp: '0777123456',
    wilaya: '19',
    address: 'سطيف - حي الأمير عبد القادر',
    experience_years: 8,
    bio: 'راقٍ شرعي وخطيب مسجد، يجمع بين الرقية الشرعية والتعليم الشرعي.',
    verified_badge: false,
    status: 'approved',
    created_at: '2024-01-03',
    updated_at: '2024-01-03',
  },
  {
    id: '4',
    slug: 'omar-fares',
    full_name: 'عمر فارس',
    speciality: 'الرقية الشرعية',
    phone: '0555567890',
    whatsapp: '0555567890',
    wilaya: '25',
    address: 'قسنطينة - حي زواغي',
    experience_years: 20,
    bio: 'راقٍ شرعي كبير بخبرة 20 عاماً في علاج حالات السحر والمس والعين.',
    verified_badge: true,
    status: 'approved',
    created_at: '2024-01-04',
    updated_at: '2024-01-04',
  },
  {
    id: '5',
    slug: 'amine-haddad',
    full_name: 'أمين حداد',
    speciality: 'الرقية الشرعية وعلاج العين',
    phone: '0666234567',
    whatsapp: '0666234567',
    wilaya: '06',
    address: 'بجاية - حي الأندلس',
    experience_years: 5,
    bio: 'راقٍ شاب متخصص في علاج العين والحسد والسحر الشرعي.',
    verified_badge: false,
    status: 'approved',
    created_at: '2024-01-05',
    updated_at: '2024-01-05',
  },
];

export const mockReviews: Review[] = [
  { id: '1', raqi_id: '1', rating: 5, comment: 'راقٍ ممتاز ومجرب، شفيت بفضل الله ثم بدعائه', reviewer_name: 'محمد', created_at: '2024-02-01' },
  { id: '2', raqi_id: '1', rating: 5, comment: 'شخص محترم وخلوق، الرقية عنده مؤثرة بإذن الله', reviewer_name: 'فاطمة', created_at: '2024-02-02' },
  { id: '3', raqi_id: '2', rating: 4, comment: 'جزاه الله خيراً، أعانني كثيراً', reviewer_name: 'أحمد', created_at: '2024-02-03' },
];

// ============================================================
// API Functions (Supabase)
// ============================================================

// Get approved raqis with optional wilaya filter
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
    console.error('getRaqis error:', error);
    throw error;
  }

  return (data ?? []) as Raqi[];
}

// Get single raqi by slug
export async function getRaqiBySlug(slug: string): Promise<Raqi | null> {
  const { data, error } = await supabase
    .from('raqis')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('getRaqiBySlug error:', error);
    throw error;
  }

  return (data as Raqi | null) ?? null;
}

// Get reviews for a raqi
export async function getReviews(raqiId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('raqi_id', raqiId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getReviews error:', error);
    throw error;
  }

  return (data ?? []) as Review[];
}

// Add a review
export async function addReview(review: {
  raqi_id: string;
  rating: number;
  comment: string;
  reviewer_name: string;
}): Promise<void> {
  const { error } = await supabase
    .from('reviews')
    .insert(review);

  if (error) {
    console.error('addReview error:', error);
    throw error;
  }
}

// Register new raqi
export async function registerRaqi(raqi: Omit<RaqiInsert, 'status'>): Promise<void> {
  const payload = {
    ...raqi,
    status: 'pending',
    verified_badge: false,
  };

  const { data, error } = await supabase
    .from('raqis')
    .insert(payload)
    .select();

  console.log('registerRaqi payload:', payload);
  console.log('registerRaqi data:', data);
  console.log('registerRaqi error:', error);

  if (error) throw error;
}
// Admin: Get all raqis with filter
export async function getAllRaqis(status?: string): Promise<Raqi[]> {
  let query = supabase
    .from('raqis')
    .select('*')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

 console.log(
  'getAllRaqis data:',
  data?.map(r => ({
    id: r.id,
    full_name: r.full_name,
    status: r.status,
    created_at: r.created_at,
  }))
);
  console.log('getAllRaqis error:', error);

  if (error) throw error;
  return (data ?? []) as Raqi[];
}
// Admin: Update raqi status
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
    console.error('updateRaqiStatus error:', error);
    throw error;
  }
}

// Admin: Toggle verified badge
export async function toggleVerified(id: string, verified: boolean): Promise<void> {
  const { error } = await supabase
    .from('raqis')
    .update({
      verified_badge: verified,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}

// Delete raqi
export async function deleteRaqi(id: string): Promise<void> {
  const { error } = await supabase
    .from('raqis')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('deleteRaqi error:', error);
    throw error;
  }
}