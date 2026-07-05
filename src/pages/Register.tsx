// ============================================================
// دليل الرقاة - Register Page (New Raqi Form)
// ============================================================
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { registerRaqi, mockWilayas } from '@/lib/supabase';
import type { RaqiInsert } from '@/types';
import { ChevronRight, Shield, UserPlus, Loader2, CheckCircle } from 'lucide-react';

export default function Register() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<RaqiInsert>({
    slug: '',
    full_name: '',
    speciality: '',
    phone: '',
    whatsapp: '',
    wilaya: '',
    address: '',
    experience_years: 0,
    bio: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.full_name.trim()) errs.full_name = 'الاسم الكامل مطلوب';
    if (!form.wilaya) errs.wilaya = 'الولاية مطلوبة';
    if (!form.slug.trim()) errs.slug = 'المعرف (slug) مطلوب';
    else if (!/^[a-z0-9-]+$/.test(form.slug)) errs.slug = 'المعرف يجب أن يحتوي على أحف إنجليزية وأرقام وشرطات فقط';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await registerRaqi(form);
      setSubmitted(true);
      setForm({
        slug: '', full_name: '', speciality: '', phone: '',
        whatsapp: '', wilaya: '', address: '', experience_years: 0, bio: '',
      });
    } catch (err) {
      console.error('Error registering:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: keyof RaqiInsert, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error when field changes
    if (errors[field]) {
      setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8 text-center rounded-3xl shadow-xl">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3">تم إرسال الطلب بنجاح!</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            تم استلام طلب التسجيل. بعد المراجعة والموافقة سيظهر الراقي في الدليل وصفحته الخاصة.
          </p>
          <div className="space-y-3">
            <Link
              to="/roqat"
              className="block w-full py-3 bg-[#1f6f50] text-white rounded-xl font-bold text-center
                hover:bg-[#18593f] transition-colors"
            >
              تصفح دليل الرقاة
            </Link>
            <Button variant="ghost" onClick={() => setSubmitted(false)} className="w-full">
              تسجيل راقي آخر
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-500 text-sm mb-6 hover:text-[#1f6f50] transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
          العودة للرئيسية
        </Link>

        <Card className="rounded-3xl border border-gray-100 shadow-xl overflow-hidden bg-white">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#0b5a35] to-[#10693e] px-6 py-8 text-center">
            <Shield className="w-12 h-12 text-[#f1d27b] mx-auto mb-3" />
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">تسجيل راقٍ جديد</h1>
            <p className="text-white/80 text-sm max-w-md mx-auto">
              املأ البيانات التالية بدقة، وسيتم إرسال الطلب للمراجعة قبل النشر في دليل الرقاة.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800">الاسم الكامل <span className="text-red-500">*</span></label>
              <Input
                value={form.full_name}
                onChange={e => handleChange('full_name', e.target.value)}
                placeholder="أحمد بن علي"
                className={`h-12 rounded-xl ${errors.full_name ? 'border-red-300 ring-1 ring-red-200' : ''}`}
              />
              {errors.full_name && <p className="text-red-500 text-xs">{errors.full_name}</p>}
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800">
                المعرف (Slug) <span className="text-red-500">*</span>
                <span className="text-gray-400 font-normal mr-1">- مثال: ahmed-benali</span>
              </label>
              <Input
                value={form.slug}
                onChange={e => handleChange('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="ahmed-benali"
                dir="ltr"
                className={`h-12 rounded-xl text-left ${errors.slug ? 'border-red-300 ring-1 ring-red-200' : ''}`}
              />
              {errors.slug && <p className="text-red-500 text-xs">{errors.slug}</p>}
            </div>

            {/* Wilaya */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800">الولاية <span className="text-red-500">*</span></label>
              <select
                value={form.wilaya}
                onChange={e => handleChange('wilaya', e.target.value)}
                className={`w-full h-12 px-4 border rounded-xl text-base bg-white text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-[#1f6f50]
                  ${errors.wilaya ? 'border-red-300 ring-1 ring-red-200' : 'border-gray-200'}`}
              >
                <option value="">اختر الولاية</option>
                {mockWilayas.map(w => (
                  <option key={w.code} value={w.code}>{w.name_ar}</option>
                ))}
              </select>
              {errors.wilaya && <p className="text-red-500 text-xs">{errors.wilaya}</p>}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800">العنوان</label>
              <Input
                value={form.address}
                onChange={e => handleChange('address', e.target.value)}
                placeholder="الجزائر العاصمة - حي محمدي"
                className="h-12 rounded-xl"
              />
            </div>

            {/* Speciality */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800">التخصص</label>
              <Input
                value={form.speciality}
                onChange={e => handleChange('speciality', e.target.value)}
                placeholder="الرقية الشرعية وعلاج السحر"
                className="h-12 rounded-xl"
              />
            </div>

            {/* Experience */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800">سنوات الخبرة</label>
              <Input
                type="number"
                min={0}
                max={60}
                value={form.experience_years}
                onChange={e => handleChange('experience_years', parseInt(e.target.value) || 0)}
                placeholder="5"
                className="h-12 rounded-xl"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800">رقم الهاتف</label>
              <Input
                value={form.phone}
                onChange={e => handleChange('phone', e.target.value)}
                placeholder="0555123456"
                dir="ltr"
                className="h-12 rounded-xl text-left"
              />
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800">رقم الواتساب</label>
              <Input
                value={form.whatsapp}
                onChange={e => handleChange('whatsapp', e.target.value)}
                placeholder="0555123456"
                dir="ltr"
                className="h-12 rounded-xl text-left"
              />
              <p className="text-gray-400 text-xs">سيتم تحويل الرقم تلقائياً لصيغة دولية عند النشر</p>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800">نبذة عن الراقي</label>
              <Textarea
                value={form.bio}
                onChange={e => handleChange('bio', e.target.value)}
                placeholder="اكتب نبذة مختصرة عن خبرتك وتخصصك..."
                rows={5}
                className="rounded-xl resize-none"
              />
            </div>

            {/* Submit */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-14 bg-gradient-to-br from-[#1f6f50] to-[#15523b] hover:from-[#18593f]
                  text-white font-extrabold text-lg rounded-xl shadow-lg transition-all hover:-translate-y-0.5"
              >
                {submitting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    إرسال طلب التسجيل
                  </>
                )}
              </Button>
            </div>

            {/* Note */}
            <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-4 text-[#166534] text-sm leading-relaxed">
              ملاحظة: الطلب لا يُنشر مباشرة، بل يُحفظ أولًا للمراجعة ثم الاعتماد.
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
