// ============================================================
// دليل الرقاة - Raqi Dashboard (CORRIGÉ)
// ============================================================
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  getCurrentRaqiProfile,
  getRaqiStats,
  mockWilayas,
  signOutRaqi,
  supabase,
  updateCurrentRaqiProfile,
} from '@/lib/supabase';
import type { Raqi } from '@/types';
import {
  Shield,
  LogOut,
  Loader2,
  Save,
  User,
  Phone,
  MapPin,
  Eye,
  MessageCircle,
  BookOpen,
  Award,
  Mail,
  AlertTriangle,
  Home,
  Trash2,
  X,
} from 'lucide-react';

export default function RaqiDashboard() {
  const navigate = useNavigate();

  const [sessionLoading, setSessionLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<Raqi | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Compteurs
  const [stats, setStats] = useState({
    view_count: 0,
    phone_click_count: 0,
    whatsapp_click_count: 0,
  });

  // حذف الحساب
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    speciality: '',
    phone: '',
    whatsapp: '',
    wilaya: '',
    address: '',
    experience_years: '',
    bio: '',
  });

  // CORRECTION: Vérifier la session et charger le profil
  useEffect(() => {
    let mounted = true;

    const checkSessionAndLoad = async () => {
      try {
        // CORRECTION: Utiliser getSession() pour vérifier la session locale
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mounted) {
            setError('تعذر التحقق من الجلسة');
            setSessionLoading(false);
          }
          return;
        }

        if (!session) {
          // Pas de session active, rediriger vers login
          if (mounted) {
            setSessionLoading(false);
            navigate('/raqi-login', { replace: true });
          }
          return;
        }

        // Session active, charger le profil
        if (mounted) {
          await loadProfile();
          setSessionLoading(false);
        }
      } catch (err) {
        console.error('Dashboard init error:', err);
        if (mounted) {
          setError('تعذر التحقق من الجلسة');
          setSessionLoading(false);
        }
      }
    };

    checkSessionAndLoad();

    // CORRECTION: Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session ? 'has session' : 'no session');

      if (event === 'SIGNED_OUT' || !session) {
        navigate('/raqi-login', { replace: true });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const loadProfile = async () => {
    setLoadingProfile(true);
    setError('');
    setSuccess('');

    try {
      const data = await getCurrentRaqiProfile();

      if (!data) {
        setProfile(null);
        setError('لم يتم العثور على ملف الراقي المرتبط بهذا الحساب. يرجى التواصل مع الإدارة.');
        return;
      }

      setProfile(data);

      // Charger les compteurs
      try {
        const statsData = await getRaqiStats(data.id);
        setStats(statsData);
      } catch (err) {
        console.warn('Stats load error:', err);
      }

      setForm({
        full_name: data.full_name || '',
        email: (data as any).email || '',
        speciality: data.speciality || '',
        phone: data.phone || '',
        whatsapp: data.whatsapp || '',
        wilaya: data.wilaya || '',
        address: data.address || '',
        experience_years:
          typeof data.experience_years === 'number'
            ? String(data.experience_years)
            : '',
        bio: data.bio || '',
      });
    } catch (err: any) {
      console.error('Load profile error:', err);
      setError(err?.message || 'فشل تحميل بيانات الراقي');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChange = (
    key: keyof typeof form,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    if (!form.full_name.trim()) {
      setError('الاسم الكامل مطلوب');
      return;
    }

    if (!form.wilaya.trim()) {
      setError('الولاية مطلوبة');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updated = await updateCurrentRaqiProfile({
        full_name: form.full_name.trim(),
        email: form.email.trim() || undefined,
        speciality: form.speciality.trim() || null,
        phone: form.phone.trim() || null,
        whatsapp: form.whatsapp.trim() || null,
        wilaya: form.wilaya,
        address: form.address.trim() || null,
        experience_years: form.experience_years.trim()
          ? Number(form.experience_years)
          : 0,
        bio: form.bio.trim() || null,
      });

      if (updated) {
        setProfile(updated);
      }

      setSuccess('تم حفظ التعديلات بنجاح');
    } catch (err: any) {
      console.error('Save profile error:', err);
      setError(err?.message || 'فشل حفظ التعديلات');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOutRaqi();
      // CORRECTION: La redirection est gérée par onAuthStateChange
      // mais on force aussi ici pour être sûr
      navigate('/raqi-login', { replace: true });
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err?.message || 'فشل تسجيل الخروج');
    }
  };

  // حذف الحساب نهائياً
  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim() !== 'حذف') {
      setError('يجب كتابة "حذف" للتأكيد');
      return;
    }

    setDeleting(true);
    setError('');
    setSuccess('');

    try {
      const current = await getCurrentRaqiProfile();

      if (!current?.id) {
        throw new Error('لم يتم العثور على ملف الراقي');
      }

      // حذف من جدول raqis
      const { error: deleteRaqiError } = await supabase
        .from('raqis')
        .delete()
        .eq('id', current.id);

      if (deleteRaqiError) {
        throw new Error(deleteRaqiError.message || 'فشل حذف ملف الراقي');
      }

      // حذف المستخدم من Auth
      const { error: deleteUserError } = await supabase.rpc('delete_user');

      if (deleteUserError) {
        console.warn('Auth delete warning:', deleteUserError);
        // نستمر حتى لو فشل حذف الـ Auth
      }

      // تسجيل الخروج
      await signOutRaqi();
      navigate('/', { replace: true });
    } catch (err: any) {
      console.error('Delete account error:', err);
      setError(err?.message || 'فشل حذف الحساب');
      setDeleting(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="flex items-center gap-3 text-gray-600 font-bold">
          <Loader2 className="w-6 h-6 animate-spin text-[#1f6f50]" />
          جاري التحقق...
        </div>
      </div>
    );
  }

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="flex items-center gap-3 text-gray-600 font-bold">
          <Loader2 className="w-6 h-6 animate-spin text-[#1f6f50]" />
          جاري تحميل بيانات الراقي...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-[#0b5a35] to-[#10693e] py-8 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#d6b14a60] bg-white/10 mb-4">
              <Shield className="w-4 h-4 text-[#f1d27b]" />
              <span className="text-[#f1d27b] text-sm font-bold">
                لوحة الراقي
              </span>
            </div>

            <h1 className="text-3xl font-extrabold text-white">
              إدارة الملف الشخصي
            </h1>

            <p className="text-white/80 mt-2 font-medium">
              يمكنك تعديل معلوماتك الظاهرة في الدليل
            </p>
          </div>

          <div className="flex gap-2">
            <Link to="/">
              <Button
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl"
              >
                <Home className="w-4 h-4 ml-2" />
                الرئيسية
              </Button>
            </Link>
            <Button
              onClick={handleLogout}
              className="bg-white/10 hover:bg-white/20 text-white rounded-xl"
            >
              <LogOut className="w-4 h-4 ml-2" />
              خروج
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* CORRECTION: Afficher un message si le profil n'est pas trouvé */}
        {!profile && error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-red-700 mb-2">
              لم يتم العثور على الملف
            </h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {profile && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="rounded-2xl border-0 shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-semibold">الحالة</p>
                    <p className="text-xl font-extrabold text-gray-900 mt-1">
                      {profile?.status === 'approved'
                        ? 'معتمد'
                        : profile?.status === 'pending'
                        ? 'معلق'
                        : 'مرفوض'}
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                </div>
              </Card>

              <Card className="rounded-2xl border-0 shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-semibold">التوثيق</p>
                    <p className="text-xl font-extrabold text-gray-900 mt-1">
                      {profile?.verified_badge ? 'موثق' : 'غير موثق'}
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                </div>
              </Card>

              <Card className="rounded-2xl border-0 shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-semibold">الرابط</p>
                    <p className="text-sm font-extrabold text-gray-900 mt-1 break-all">
                      /roqat/{profile?.slug}
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                </div>
              </Card>

              {/* Compteurs */}
              <Card className="rounded-2xl border-0 shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-semibold">الزيارات</p>
                    <p className="text-xl font-extrabold text-gray-900 mt-1">
                      {stats.view_count.toLocaleString('ar-DZ')}
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Eye className="w-5 h-5" />
                  </div>
                </div>
              </Card>

              <Card className="rounded-2xl border-0 shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-semibold">اتصالات الهاتف</p>
                    <p className="text-xl font-extrabold text-gray-900 mt-1">
                      {stats.phone_click_count.toLocaleString('ar-DZ')}
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                </div>
              </Card>

              <Card className="rounded-2xl border-0 shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-semibold">تواصل واتساب</p>
                    <p className="text-xl font-extrabold text-gray-900 mt-1">
                      {stats.whatsapp_click_count.toLocaleString('ar-DZ')}
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                </div>
              </Card>
            </div>

            <Card className="rounded-3xl border-0 shadow-sm p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
                  بيانات الراقي
                </h2>
                <p className="text-gray-500 font-medium">
                  عدّل المعلومات الأساسية ثم احفظ التغييرات
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-5 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    الاسم الكامل
                  </label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      value={form.full_name}
                      onChange={(e) => handleChange('full_name', e.target.value)}
                      placeholder="الاسم الكامل"
                      className="h-12 pr-10 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="البريد الإلكتروني"
                      className="h-12 pr-10 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    التخصص
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      value={form.speciality}
                      onChange={(e) => handleChange('speciality', e.target.value)}
                      placeholder="مثال: الرقية الشرعية وعلاج العين"
                      className="h-12 pr-10 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    سنوات الخبرة
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={form.experience_years}
                    onChange={(e) =>
                      handleChange('experience_years', e.target.value)
                    }
                    placeholder="عدد سنوات الخبرة"
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    رقم الهاتف
                  </label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      value={form.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="رقم الهاتف"
                      className="h-12 pr-10 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    رقم واتساب
                  </label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      value={form.whatsapp}
                      onChange={(e) => handleChange('whatsapp', e.target.value)}
                      placeholder="رقم واتساب"
                      className="h-12 pr-10 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    الولاية
                  </label>
                  <select
                    value={form.wilaya}
                    onChange={(e) => handleChange('wilaya', e.target.value)}
                    className="w-full h-12 px-4 border border-gray-200 rounded-xl text-base bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1f6f50] focus:border-transparent"
                  >
                    <option value="">اختر الولاية</option>
                    {mockWilayas.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.name_ar}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    العنوان
                  </label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      value={form.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      placeholder="العنوان"
                      className="h-12 pr-10 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <label className="text-sm font-bold text-gray-700">نبذة</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder="اكتب نبذة مختصرة عن خبرتك ومنهجك"
                  rows={6}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1f6f50] focus:border-transparent resize-none"
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="h-12 px-6 rounded-xl bg-[#1f6f50] hover:bg-[#195a41] text-white font-extrabold disabled:opacity-70"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 ml-2" />
                      حفظ التغييرات
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={loadProfile}
                  className="h-12 px-6 rounded-xl"
                >
                  إعادة تحميل البيانات
                </Button>
              </div>

              {/* زر حذف الحساب */}
              <div className="mt-8 pt-6 border-t border-red-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(true);
                    setDeleteConfirmText('');
                    setError('');
                  }}
                  className="h-11 px-5 rounded-xl border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold"
                >
                  <Trash2 className="w-4 h-4 ml-2" />
                  حذف الحساب نهائياً
                </Button>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* نافذة تأكيد حذف الحساب */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!deleting) {
                setShowDeleteModal(false);
                setDeleteConfirmText('');
              }
            }}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                if (!deleting) {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }
              }}
              disabled={deleting}
              className="absolute left-4 top-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-2">
                تأكيد حذف الحساب
              </h3>
              <p className="text-gray-500 text-sm leading-7">
                هذا الإجراء <span className="text-red-600 font-bold">نهائي ولا يمكن التراجع عنه</span>.
                سيتم حذف ملفك الشخصي وجميع بياناتك من الدليل.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  اكتب <span className="text-red-600">"حذف"</span> للتأكيد
                </label>
                <Input
                  value={deleteConfirmText}
                  onChange={(e) => {
                    setDeleteConfirmText(e.target.value);
                    setError('');
                  }}
                  placeholder="اكتب حذف هنا..."
                  disabled={deleting}
                  className="h-12 rounded-xl text-center"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText('');
                    setError('');
                  }}
                  disabled={deleting}
                  className="flex-1 h-12 rounded-xl"
                >
                  إلغاء
                </Button>
                <Button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      جاري الحذف...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 ml-2" />
                      نعم، احذف
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
