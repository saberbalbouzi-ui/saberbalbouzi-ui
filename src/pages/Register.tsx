import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { registerRaqiWithAccount, supabase } from '@/lib/supabase';
import { useCountries, useCities } from '@/hooks/useCountries';
import {
  ChevronRight,
  Shield,
  UserPlus,
  Loader2,
  CheckCircle,
 
 
  ImagePlus,
  User,
  AlertCircle,
} from 'lucide-react';

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

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

const emptyForm: RegisterForm = {
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
};

export default function Register() {
  const [submitted, setSubmitted] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittingGoogle, setSubmittingGoogle] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [form, setForm] = useState<RegisterForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const {
    countries,
    loading: countriesLoading,
    error: countriesError,
  } = useCountries(true);

  const {
    cities,
    loading: citiesLoading,
    error: citiesError,
  } = useCities(form.country_code);

  const loadingGeo = countriesLoading || citiesLoading;

  const imagePreview = useMemo(() => {
    if (!profileImage) return '';
    return URL.createObjectURL(profileImage);
  }, [profileImage]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const getErrorMessage = (err: unknown) => {
    if (typeof err === 'string' && err.trim()) return err;
    if (err && typeof err === 'object') {
      const value = err as Record<string, unknown>;
      for (const key of ['message', 'error_description', 'details', 'hint']) {
        if (typeof value[key] === 'string' && value[key].trim()) {
          return value[key] as string;
        }
      }
    }
    return 'حدث خطأ أثناء التسجيل';
  };

  const validateImage = (file: File | null) => {
    if (!file) return '';
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return 'صيغة الصورة غير مدعومة. استخدم JPG أو PNG أو WEBP';
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return `حجم الصورة يجب ألا يتجاوز ${MAX_IMAGE_SIZE_MB}MB`;
    }
    return '';
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.full_name.trim()) nextErrors.full_name = 'الاسم الكامل مطلوب';
    if (!form.email.trim()) nextErrors.email = 'البريد الإلكتروني مطلوب';
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      nextErrors.email = 'صيغة البريد الإلكتروني غير صحيحة';
    }
    if (!form.password.trim()) nextErrors.password = 'كلمة المرور مطلوبة';
    else if (form.password.length < 6) {
      nextErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }
    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = 'كلمتا المرور غير متطابقتين';
    }
    if (!form.country_code) nextErrors.country_code = 'الدولة مطلوبة';
    if (!form.wilaya) nextErrors.wilaya = 'الولاية مطلوبة';

    const imageError = validateImage(profileImage);
    if (imageError) nextErrors.profile_image = imageError;

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resetForm = () => {
    setForm({ ...emptyForm });
    setProfileImage(null);
    setErrors({});
    setSubmitError('');
  };

  const handleChange = (field: keyof RegisterForm, value: string | number) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
      ...(field === 'country_code' ? { wilaya: '' } : {}),
    }));

    setErrors((previous) => {
      const next = { ...previous };
      delete next[field];
      return next;
    });
    setSubmitError('');
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    const imageError = validateImage(file);

    if (imageError) {
      setProfileImage(null);
      setErrors((previous) => ({ ...previous, profile_image: imageError }));
      return;
    }

    setProfileImage(file);
    setErrors((previous) => {
      const next = { ...previous };
      delete next.profile_image;
      return next;
    });
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setErrors((previous) => {
      const next = { ...previous };
      delete next.profile_image;
      return next;
    });
  };

 const handleGoogleRegister = async () => {
  setSubmittingGoogle(true);
  setSubmitError('');

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback#/raqi-onboarding`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      setSubmitError(error.message || 'تعذر المتابعة باستخدام Google.');
    }
  } catch (err: any) {
    console.error('Google register error:', err);
    setSubmitError(err?.message || 'حدث خطأ أثناء المتابعة باستخدام Google.');
  } finally {
    setSubmittingGoogle(false);
  }
};
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
        profile_image: profileImage,
      });

      setNeedsConfirmation(Boolean(result.needsEmailConfirmation));
      setSubmitted(true);
      resetForm();
    } catch (error) {
      console.error('Register error:', error);
      setSubmitError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10" dir="rtl">
        <Card className="max-w-2xl mx-auto rounded-3xl p-8 text-center shadow-xl">
          <CheckCircle className="w-16 h-16 mx-auto mb-5 text-green-600" />
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
            تم إنشاء الحساب وإرسال الطلب
          </h1>
          <p className="text-gray-600 leading-8 mb-5">
            تم استلام طلب التسجيل بنجاح. بعد مراجعة الطلب والموافقة سيظهر ملفك في الدليل.
          </p>
          {needsConfirmation && (
            <div className="rounded-2xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800 leading-7 mb-6">
              يجب تأكيد بريدك الإلكتروني أولاً. تحقق من صندوق الوارد والرسائل غير المرغوب فيها.
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/raqi-login" className="flex-1">
              <Button className="w-full h-12 rounded-xl bg-[#1f6f50] text-white">
                الذهاب إلى تسجيل الدخول
              </Button>
            </Link>
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-12 rounded-xl"
              onClick={() => {
                setSubmitted(false);
                setNeedsConfirmation(false);
                resetForm();
              }}
            >
              تسجيل راقٍ آخر
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7f4] px-4 py-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-[#1f6f50] font-bold mb-6">
          <ChevronRight className="w-4 h-4" />
          العودة للرئيسية
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#1f6f50]/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-[#1f6f50]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            تسجيل راقٍ جديد
          </h1>
          <p className="text-gray-600 leading-8">
            أكمل بياناتك لإرسال طلب الانضمام إلى دليل الرقاة.
          </p>
        </div>

        <Card className="rounded-3xl p-6 md:p-8 shadow-xl">
          {submitError && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {(countriesError || citiesError) && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              تعذر تحميل بيانات الدول أو الولايات. حاول تحديث الصفحة.
            </div>
          )}

          <Button
            type="button"
            onClick={handleGoogleRegister}
            disabled={submittingGoogle}
            variant="outline"
            className="w-full h-14 rounded-2xl bg-[#1f1d17] text-white hover:bg-[#171510] font-bold"
          >
            {submittingGoogle ? (
              <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> جاري التحويل إلى Google...</>
            ) : 'المتابعة باستخدام Google'}
          </Button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-sm text-gray-400">أو بالبريد الإلكتروني</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-gray-700">صورة البروفايل</label>
                <div className="rounded-2xl border border-dashed border-gray-300 bg-[#fcfcfb] p-4 flex flex-col md:flex-row items-center gap-4">
                  <div className="w-28 h-28 rounded-full overflow-hidden bg-white flex items-center justify-center shrink-0">
                    {imagePreview ? (
                      <img src={imagePreview} alt="معاينة الصورة" className="w-full h-full object-cover" />
                    ) : <User className="w-10 h-10 text-gray-400" />}
                  </div>
                  <div className="flex-1 w-full space-y-3">
                    <label htmlFor="profile_image" className="inline-flex items-center gap-2 cursor-pointer rounded-xl bg-[#1f6f50] text-white px-4 h-11 font-bold">
                      <ImagePlus className="w-4 h-4" /> اختيار صورة
                    </label>
                    <input id="profile_image" type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleImageChange} className="hidden" />
                    <p className="text-sm text-gray-600">JPG أو PNG أو WEBP، بحد أقصى {MAX_IMAGE_SIZE_MB}MB.</p>
                    {profileImage && (
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span>{profileImage.name}</span>
                        <button type="button" onClick={handleRemoveImage} className="text-red-600 font-bold">إزالة الصورة</button>
                      </div>
                    )}
                  </div>
                </div>
                {errors.profile_image && <p className="text-red-600 text-sm">{errors.profile_image}</p>}
              </div>

              <Field label="الاسم الكامل *" error={errors.full_name}>
                <Input value={form.full_name} onChange={(e) => handleChange('full_name', e.target.value)} placeholder="أحمد بن علي" />
              </Field>
              <Field label="البريد الإلكتروني *" error={errors.email}>
                <Input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="name@example.com" dir="ltr" />
              </Field>
              <Field label="كلمة المرور *" error={errors.password}>
                <Input type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)} placeholder="6 أحرف على الأقل" dir="ltr" />
              </Field>
              <Field label="تأكيد كلمة المرور *" error={errors.confirmPassword}>
                <Input type="password" value={form.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} placeholder="أعد إدخال كلمة المرور" dir="ltr" />
              </Field>

              <Field label="الدولة *" error={errors.country_code}>
                <select value={form.country_code} onChange={(e) => handleChange('country_code', e.target.value)} disabled={countriesLoading} className="w-full h-14 px-4 border border-gray-200 rounded-2xl bg-[#fcfcfb]">
                  <option value="">{countriesLoading ? 'جاري تحميل الدول...' : 'اختر الدولة'}</option>
                  {countries.map((country) => <option key={country.code} value={country.code}>{country.flag_emoji} {country.name_ar}</option>)}
                </select>
              </Field>

              <Field label="الولاية *" error={errors.wilaya}>
                <select value={form.wilaya} onChange={(e) => handleChange('wilaya', e.target.value)} disabled={!form.country_code || citiesLoading} className="w-full h-14 px-4 border border-gray-200 rounded-2xl bg-[#fcfcfb]">
                  <option value="">{citiesLoading ? 'جاري تحميل الولايات...' : 'اختر الولاية'}</option>
                  {cities.map((city) => <option key={city.id} value={city.name_ar}>{city.name_ar}</option>)}
                </select>
              </Field>

              <Field label="العنوان"><Input value={form.address} onChange={(e) => handleChange('address', e.target.value)} placeholder="الجزائر العاصمة" /></Field>
              <Field label="التخصص"><Input value={form.speciality} onChange={(e) => handleChange('speciality', e.target.value)} placeholder="الرقية الشرعية" /></Field>
              <Field label="سنوات الخبرة"><Input type="number" min={0} value={form.experience_years} onChange={(e) => handleChange('experience_years', Number(e.target.value) || 0)} /></Field>
              <Field label="رقم الهاتف"><Input value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="0555123456" dir="ltr" /></Field>
              <Field label="رقم الواتساب"><Input value={form.whatsapp} onChange={(e) => handleChange('whatsapp', e.target.value)} placeholder="0555123456" dir="ltr" /></Field>
            </div>

            <Field label="نبذة عن الراقي">
              <Textarea value={form.bio} onChange={(e) => handleChange('bio', e.target.value)} placeholder="اكتب نبذة مختصرة عن خبرتك وتخصصك..." rows={5} />
            </Field>

            <Button type="submit" disabled={submitting || loadingGeo} className="w-full h-14 rounded-2xl bg-[#1f6f50] text-white font-extrabold disabled:opacity-70">
              {submitting ? <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> جاري إنشاء الحساب...</> : <><UserPlus className="w-4 h-4 ml-2" /> إنشاء الحساب وإرسال الطلب</>}
            </Button>

            <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
              ملاحظة: الطلب لا يُنشر مباشرة، بل يُحفظ للمراجعة والاعتماد.
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-gray-700">{label}</label>
      {children}
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}
