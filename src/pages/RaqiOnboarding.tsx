import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2, Shield, UserPlus, Globe, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getCurrentRaqiProfile, supabase } from '@/lib/supabase';
import { useCountries, useCities } from '@/hooks/useCountries';

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export default function RaqiOnboarding() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [countryCode, setCountryCode] = useState('DZ');
  const [wilaya, setWilaya] = useState('');

  const { countries, loading: countriesLoading } = useCountries(true);
  const { cities, loading: citiesLoading } = useCities(countryCode);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data, error: userError } = await supabase.auth.getUser();
        const user = data.user;

        if (userError || !user) {
          navigate('/raqi-login', { replace: true });
          return;
        }

        const existingProfile = await getCurrentRaqiProfile();
        if (!mounted) return;

        if (existingProfile) {
          navigate('/raqi-dashboard', { replace: true });
          return;
        }

        const googleName = user.user_metadata?.full_name || user.user_metadata?.name || '';
        const googleCountry = user.user_metadata?.country_code || user.user_metadata?.countrycode || 'DZ';

        setUserEmail(user.email || '');
        setFullName(googleName);
        setCountryCode(['DZ', 'MA', 'TN', 'FR'].includes(googleCountry) ? googleCountry : 'DZ');
      } catch (err: any) {
        console.error('Onboarding init error:', err);
        if (mounted) setError(err?.message || 'تعذر تجهيز صفحة إكمال التسجيل.');
      } finally {
        if (mounted) setChecking(false);
      }
    };

    void init();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    const normalizedName = fullName.trim();
    const generatedSlug = slugify(normalizedName);

    if (!normalizedName) return setError('الاسم الكامل مطلوب.');
    if (!countryCode) return setError('يرجى اختيار الدولة.');
    if (!wilaya) return setError('يرجى اختيار الولاية أو المنطقة.');
    if (!generatedSlug) return setError('تعذر إنشاء رابط الملف من الاسم الكامل.');

    setSubmitting(true);

    try {
      const { data, error: userError } = await supabase.auth.getUser();
      const user = data.user;
      if (userError || !user) {
        navigate('/raqi-login', { replace: true });
        return;
      }

      const existingProfile = await getCurrentRaqiProfile();
      if (existingProfile) {
        navigate('/raqi-dashboard', { replace: true });
        return;
      }

  const { error: insertError } = await supabase.from('raqis').insert({
  user_id: user.id,
  has_auth_account: true,
  full_name: normalizedName,
  email: user.email,
  country_code: countryCode,
  wilaya,
  slug: generatedSlug,
  // يمكن إضافة address, speciality, ... لاحقاً عند الحاجة
});

      if (insertError) {
        if (insertError.code === '23505') {
          setError('يوجد تعارض في البيانات، ربما الاسم مستخدم سابقًا. غيّر الاسم أو أضف تمييزًا له.');
        } else {
          setError(insertError.message || 'تعذر إنشاء ملف الراقي.');
        }
        return;
      }

      navigate('/raqi-dashboard', { replace: true });
    } catch (err: any) {
      console.error('Create raqi profile error:', err);
      setError(err?.message || 'حدث خطأ غير متوقع أثناء إنشاء ملف الراقي.');
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#f6f7f4] flex items-center justify-center px-4">
        <div className="flex items-center gap-3 text-gray-700 font-bold">
          <Loader2 className="w-6 h-6 animate-spin text-[#1f6f50]" />
          جاري تجهيز التسجيل...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#f6f7f4] px-4 py-10" dir="rtl">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[420px] h-[420px] bg-[#1f6f50]/[0.06] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[380px] h-[380px] bg-[#d6b14a]/[0.08] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto">
        <Card className="rounded-[32px] border-0 bg-white/95 shadow-xl p-6 md:p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#1f6f50]/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-[#1f6f50]" />
            </div>
            <span className="inline-flex items-center rounded-full border border-[#1f6f50]/10 bg-[#f5faf7] px-4 py-1.5 text-xs font-bold text-[#1f6f50] mb-4">
              إكمال التسجيل
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900">أكمل تسجيلك كراقٍ</h1>
            <p className="text-gray-500 mt-3 leading-7">بقيت خطوة أخيرة لإنشاء ملفك الشخصي.</p>
            {userEmail && <p className="mt-3 text-sm text-gray-600">{userEmail}</p>}
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-semibold flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الاسم الكامل</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="مثال: محمد بن أحمد" className="h-12 rounded-xl" autoComplete="name" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1"><Globe className="w-4 h-4" /> الدولة</label>
              <select value={countryCode} onChange={(e) => { setCountryCode(e.target.value); setWilaya(''); }} disabled={countriesLoading} className="w-full h-12 px-4 border border-gray-200 rounded-xl text-base bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1f6f50] focus:border-transparent">
                <option value="">اختر الدولة</option>
                {countries.map((country) => <option key={country.code} value={country.code}>{country.flag_emoji} {country.name_ar}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1"><MapPin className="w-4 h-4" /> الولاية أو المنطقة</label>
              <select value={wilaya} onChange={(e) => setWilaya(e.target.value)} disabled={citiesLoading} className="w-full h-12 px-4 border border-gray-200 rounded-xl text-base bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1f6f50] focus:border-transparent">
                <option value="">اختر الولاية</option>
                {cities.map((item) => <option key={item.id} value={item.name_ar}>{item.name_ar}</option>)}
              </select>
            </div>

            <Button type="submit" disabled={submitting} className="w-full h-14 rounded-2xl bg-[#1f6f50] hover:bg-[#18593f] text-white font-extrabold shadow-[0_12px_30px_rgba(31,111,80,0.22)]">
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري إنشاء الملف...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 ml-2" />
                  إكمال التسجيل والدخول للوحة التحكم
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
