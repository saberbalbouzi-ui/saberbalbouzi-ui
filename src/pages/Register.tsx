// ============================================================
// دليل الرقاة - Register Page (Raqi Account Registration) - MULTI-PAYS
// ============================================================
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { registerRaqiWithAccount, mockWilayas } from '@/lib/supabase';
import { getActiveCountries } from '@/lib/countries';
import {
  ChevronRight,
  Shield,
  UserPlus,
  Loader2,
  CheckCircle,
  Mail,
  Lock,
  Globe,
  MapPin,
} from 'lucide-react';

// ============================================================
// WILAYAS PAR PAYS (temporaire — à remplacer par API Supabase)
// ============================================================
const wilayasByCountry: Record<string, { code: string; name_ar: string }[]> = {
  DZ: mockWilayas.map((w) => ({ code: w.code, name_ar: w.name_ar })),
  MA: [
    { code: '01', name_ar: 'طنجة-تطوان-الحسيمة' },
    { code: '02', name_ar: 'الشرق' },
    { code: '03', name_ar: 'فاس-مكناس' },
    { code: '04', name_ar: 'الرباط-سلا-القنيطرة' },
    { code: '05', name_ar: 'بني ملال-خنيفرة' },
    { code: '06', name_ar: 'الدار البيضاء-سطات' },
    { code: '07', name_ar: 'مراكش-آسفي' },
    { code: '08', name_ar: 'درعة-تافيلالت' },
    { code: '09', name_ar: 'سوس-ماسة' },
    { code: '10', name_ar: 'كلميم-واد نون' },
    { code: '11', name_ar: 'العيون-الساقية الحمراء' },
    { code: '12', name_ar: 'الداخلة-وادي الذهب' },
  ],
  TN: [
    { code: '11', name_ar: 'تونس' },
    { code: '12', name_ar: 'أريانة' },
    { code: '13', name_ar: 'منوبة' },
    { code: '14', name_ar: 'بن عروس' },
    { code: '21', name_ar: 'نابل' },
    { code: '22', name_ar: 'زغوان' },
    { code: '23', name_ar: 'بنزرت' },
    { code: '31', name_ar: 'باجة' },
    { code: '32', name_ar: 'جندوبة' },
    { code: '33', name_ar: 'الكاف' },
    { code: '34', name_ar: 'سليانة' },
    { code: '41', name_ar: 'القيروان' },
    { code: '42', name_ar: 'القصرين' },
    { code: '43', name_ar: 'سيدي بوزيد' },
    { code: '51', name_ar: 'سوسة' },
    { code: '52', name_ar: 'المنستير' },
    { code: '53', name_ar: 'المهدية' },
    { code: '61', name_ar: 'صفاقس' },
    { code: '71', name_ar: 'قابس' },
    { code: '72', name_ar: 'مدنين' },
    { code: '73', name_ar: 'تطاوين' },
    { code: '81', name_ar: 'قفصة' },
    { code: '82', name_ar: 'توزر' },
    { code: '83', name_ar: 'قبلي' },
  ],
  FR: [
    { code: '75', name_ar: 'باريس' },
    { code: '13', name_ar: 'مارسيليا' },
    { code: '69', name_ar: 'ليون' },
    { code: '31', name_ar: 'تولوز' },
    { code: '33', name_ar: 'بوردو' },
    { code: '59', name_ar: 'ليل' },
    { code: '44', name_ar: 'نانت' },
    { code: '67', name_ar: 'ستراسبورغ' },
    { code: '34', name_ar: 'مونبلييه' },
    { code: '06', name_ar: 'نيس' },
  ],
};

type RegisterForm = {
  email: string;
  password: string;
  confirmPassword: string;
  full_name: string;
  speciality: string;
  phone: string;
  whatsapp: string;
  country_code: string;
  wilaya: string;
  address: string;
  experience_years: number;
  bio: string;
};

export default function Register() {
  const [submitted, setSubmitted] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [form, setForm] = useState<RegisterForm>({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    speciality: '',
    phone: '',
    whatsapp: '',
    country_code: 'DZ',
    wilaya: '',
    address: '',
    experience_years: 0,
    bio: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeCountries = getActiveCountries();
  const currentWilayas = wilayasByCountry[form.country_code] || wilayasByCountry['DZ'] || [];

  const getErrorMessage = (err: unknown): string => {
    if (typeof err === 'string' && err.trim()) return err;

    if (err && typeof err === 'object') {
      const e = err as Record<string, unknown>;

      if (typeof e.message === 'string' && e.message.trim()) return e.message;
      if (typeof e.error_description === 'string' && e.error_description.trim()) {
        return e.error_description;
      }
      if (typeof e.details === 'string' && e.details.trim()) return e.details;
      if (typeof e.hint === 'string' && e.hint.trim()) return e.hint;

      try {
        const serialized = JSON.stringify(err);
        if (serialized && serialized !== '{}') return serialized;
      } catch {
        return 'حدث خطأ أثناء التسجيل';
      }
    }

    return 'حدث خطأ أثناء التسجيل';
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.full_name.trim()) {
      errs.full_name = 'الاسم الكامل مطلوب';
    }

    if (!form.email.trim()) {
      errs.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'صيغة البريد الإلكتروني غير صحيحة';
    }

    if (!form.password.trim()) {
      errs.password = 'كلمة السر مطلوبة';
    } else if (form.password.length < 6) {
      errs.password = 'كلمة السر يجب أن تكون 6 أحرف على الأقل';
    }

    if (form.password !== form.confirmPassword) {
      errs.confirmPassword = 'كلمتا السر غير متطابقتين';
    }

    if (!form.country_code) {
      errs.country_code = 'الدولة مطلوبة';
    }

    if (!form.wilaya) {
      errs.wilaya = 'الولاية مطلوبة';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const resetForm = () => {
    setForm({
      email: '',
      password: '',
      confirmPassword: '',
      full_name: '',
      speciality: '',
      phone: '',
      whatsapp: '',
      country_code: 'DZ',
      wilaya: '',
      address: '',
      experience_years: 0,
      bio: '',
    });
    setErrors({});
    setSubmitError('');
  };

  const handleChange = (field: keyof RegisterForm, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Si on change le pays, réinitialiser la wilaya
    if (field === 'country_code') {
      setForm((prev) => ({
        ...prev,
        country_code: value as string,
        wilaya: '',
      }));
    }

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }

    if (submitError) {
      setSubmitError('');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) return;

    setSubmitting(true);

    try {
      const result = await registerRaqiWithAccount({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        full_name: form.full_name.trim(),
        speciality: form.speciality.trim(),
        phone: form.phone.trim(),
        whatsapp: form.whatsapp.trim(),
        country_code: form.country_code,
        wilaya: form.wilaya,
        address: form.address.trim(),
        experience_years: Number(form.experience_years) || 0,
        bio: form.bio.trim(),
      });

      setNeedsConfirmation(result.needsEmailConfirmation);
      setSubmitted(true);
      resetForm();
    } catch (err) {
      console.error('Register error:', err);
      setSubmitError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8faf8] to-white px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <Card className="rounded-3xl border border-gray-100 shadow-xl p-8 md:p-10 text-center">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
              تم إنشاء الحساب وإرسال الطلب
            </h1>

            <p className="text-gray-600 leading-8 mb-4">
              تم استلام طلب تسجيل الراقي بنجاح، وتم إنشاء حسابك أيضًا.
            </p>

            {needsConfirmation ? (
              <div className="rounded-2xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800 leading-7 mb-6">
                <strong>تنبيه مهم:</strong> يجب تأكيد بريدك الإلكتروني أولًا قبل تسجيل الدخول.
                يرجى التحقق من صندوق الوارد (و possibly Spam) والنقر على رابط التأكيد.
              </div>
            ) : (
              <p className="text-gray-600 leading-8 mb-6">
                يمكنك الآن تسجيل الدخول مباشرة باستخدام بريدك الإلكتروني وكلمة السر.
              </p>
            )}

            <p className="text-gray-600 leading-8 mb-8">
              بعد مراجعة الطلب والموافقة سيظهر ملفك في دليل الرقاة.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/raqi-login" className="flex-1">
                <Button className="w-full h-12 rounded-xl bg-[#1f6f50] hover:bg-[#18593f] text-white font-bold">
                  الذهاب إلى تسجيل الدخول
                </Button>
              </Link>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSubmitted(false);
                  setNeedsConfirmation(false);
                  resetForm();
                }}
                className="flex-1 h-12 rounded-xl"
              >
                تسجيل راقٍ آخر
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8faf8] to-white px-4 py-8 md:py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#1f6f50] font-bold hover:opacity-80 transition"
          >
            <ChevronRight className="w-4 h-4" />
            العودة للرئيسية
          </Link>
        </div>

        <div className="text-center mb-8 md:mb-10">
          <div className="w-16 h-16 rounded-2xl bg-[#1f6f50]/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-[#1f6f50]" />
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            تسجيل راقٍ جديد
          </h1>

          <p className="text-gray-600 max-w-2xl mx-auto leading-8">
            أنشئ حسابك أولًا، ثم أكمل بياناتك لإرسال طلب الانضمام إلى دليل الرقاة.
          </p>
        </div>

        <Card className="rounded-3xl border border-gray-100 shadow-xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {submitError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 whitespace-pre-wrap break-words">
                {submitError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-gray-700">الاسم الكامل *</label>
                <Input
                  value={form.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  placeholder="أحمد بن علي"
                  className={`h-12 rounded-xl ${
                    errors.full_name ? 'border-red-300 ring-1 ring-red-200' : ''
                  }`}
                />
                {errors.full_name && (
                  <p className="text-red-600 text-sm">{errors.full_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  البريد الإلكتروني *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="name@example.com"
                    dir="ltr"
                    className={`h-12 rounded-xl pl-10 text-left ${
                      errors.email ? 'border-red-300 ring-1 ring-red-200' : ''
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-sm">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">كلمة السر *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="6 أحرف على الأقل"
                    dir="ltr"
                    className={`h-12 rounded-xl pl-10 text-left ${
                      errors.password ? 'border-red-300 ring-1 ring-red-200' : ''
                    }`}
                  />
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-gray-700">تأكيد كلمة السر *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder="أعد إدخال كلمة السر"
                    dir="ltr"
                    className={`h-12 rounded-xl pl-10 text-left ${
                      errors.confirmPassword ? 'border-red-300 ring-1 ring-red-200' : ''
                    }`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm">{errors.confirmPassword}</p>
                )}
              </div>

              {/* ← AJOUTÉ : الدولة */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  الدولة *
                </label>
                <select
                  value={form.country_code}
                  onChange={(e) => handleChange('country_code', e.target.value)}
                  className={`w-full h-12 px-4 border rounded-xl text-base bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1f6f50] ${
                    errors.country_code
                      ? 'border-red-300 ring-1 ring-red-200'
                      : 'border-gray-200'
                  }`}
                >
                  {activeCountries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag_emoji} {c.name_ar}
                    </option>
                  ))}
                </select>
                {errors.country_code && (
                  <p className="text-red-600 text-sm">{errors.country_code}</p>
                )}
              </div>

              {/* ← MODIFIÉ : الولاية dynamique selon le pays */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  الولاية *
                </label>
                <select
                  value={form.wilaya}
                  onChange={(e) => handleChange('wilaya', e.target.value)}
                  className={`w-full h-12 px-4 border rounded-xl text-base bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1f6f50] ${
                    errors.wilaya
                      ? 'border-red-300 ring-1 ring-red-200'
                      : 'border-gray-200'
                  }`}
                >
                  <option value="">اختر الولاية</option>
                  {currentWilayas.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.name_ar}
                    </option>
                  ))}
                </select>
                {errors.wilaya && (
                  <p className="text-red-600 text-sm">{errors.wilaya}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">العنوان</label>
                <Input
                  value={form.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="الجزائر العاصمة - حي محمدي"
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">التخصص</label>
                <Input
                  value={form.speciality}
                  onChange={(e) => handleChange('speciality', e.target.value)}
                  placeholder="الرقية الشرعية وعلاج السحر"
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">سنوات الخبرة</label>
                <Input
                  type="number"
                  min={0}
                  value={form.experience_years}
                  onChange={(e) =>
                    handleChange('experience_years', parseInt(e.target.value, 10) || 0)
                  }
                  placeholder="5"
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">رقم الهاتف</label>
                <Input
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="0555123456"
                  dir="ltr"
                  className="h-12 rounded-xl text-left"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">رقم الواتساب</label>
                <Input
                  value={form.whatsapp}
                  onChange={(e) => handleChange('whatsapp', e.target.value)}
                  placeholder="0555123456"
                  dir="ltr"
                  className="h-12 rounded-xl text-left"
                />
                <p className="text-xs text-gray-500">
                  سيتم تحويل الرقم تلقائيًا لصيغة دولية عند النشر
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">نبذة عن الراقي</label>
              <Textarea
                value={form.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="اكتب نبذة مختصرة عن خبرتك وتخصصك..."
                rows={5}
                className="rounded-xl resize-none"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-xl bg-[#1f6f50] hover:bg-[#18593f] text-white font-bold"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري إنشاء الحساب...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 ml-2" />
                    إنشاء الحساب وإرسال الطلب
                  </>
                )}
              </Button>
            </div>

            <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900 leading-7">
              ملاحظة: الطلب لا يُنشر مباشرة، بل يُحفظ أولًا للمراجعة ثم الاعتماد.
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
