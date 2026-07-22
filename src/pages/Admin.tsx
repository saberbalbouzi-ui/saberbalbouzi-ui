import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  getAllRaqis,
  updateRaqiStatus,
  toggleVerified,
  deleteRaqi,
  mockWilayas,
  supabase,
} from '@/lib/supabase';
import type { Raqi } from '@/types';
import {
  Shield,
  Lock,
  LogOut,
  XCircle,
  Award,
  Users,
  Clock,
  CheckCheck,
  Trash2,
  MapPin,
  Loader2,
  Search,
  Mail,
  Sparkles,
  Eye,
  MessageCircle,
  Phone,
} from 'lucide-react';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [raqis, setRaqis] = useState<Raqi[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadRaqis = async () => {
    setLoading(true);
    try {
      const data = await getAllRaqis(statusFilter === 'all' ? undefined : statusFilter);
      setRaqis(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading raqis:', err);
      setRaqis([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        setIsLoggedIn(!!session);

        if (session) {
          await loadRaqis();
        }
      } finally {
        setSessionLoading(false);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoggedIn(!!session);

      if (session) {
        await loadRaqis();
      } else {
        setRaqis([]);
      }

      setSessionLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadRaqis();
    }
  }, [statusFilter, isLoggedIn]);

  const handleLogin = async () => {
    setLoginError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoginError(error.message || 'فشل تسجيل الدخول');
      return;
    }

    setEmail('');
    setPassword('');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setRaqis([]);
  };

  const handleStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateRaqiStatus(id, status);
      await loadRaqis();
    } catch (error: any) {
      console.error('Status error:', error);
      alert(error?.message || 'فشل تحديث الحالة');
    }
  };

  const handleToggleVerified = async (id: string, current: boolean) => {
    try {
      await toggleVerified(id, !current);
      await loadRaqis();
    } catch (error: any) {
      console.error('Verify error:', error);
      alert(error?.message || 'فشل تحديث التوثيق');
    }
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase
        .from('raqis')
        .update({ featured_badge: !current })
        .eq('id', id);

      if (error) throw error;

      await loadRaqis();
    } catch (error: any) {
      console.error('Featured error:', error);
      alert(error?.message || 'فشل تحديث التمييز');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('هل أنت متأكد من حذف هذا الراقي؟');
    if (!confirmed) return;

    try {
      await deleteRaqi(id);
      await loadRaqis();
      alert('تم حذف الراقي بنجاح');
    } catch (error: any) {
      console.error('Delete error:', error);
      alert(error?.message || 'فشل حذف الراقي');
    }
  };

  const getWilayaName = (code: string) => {
    return mockWilayas.find((w) => w.code === code)?.name_ar || code;
  };

  const filtered = raqis.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();

    return (
      r.full_name?.toLowerCase().includes(q) ||
      r.speciality?.toLowerCase().includes(q) ||
      r.wilaya?.toLowerCase().includes(q) ||
      r.address?.toLowerCase().includes(q)
    );
  });

  const stats = {
    total: raqis.length,
    pending: raqis.filter((r) => r.status === 'pending').length,
    approved: raqis.filter((r) => r.status === 'approved').length,
    rejected: raqis.filter((r) => r.status === 'rejected').length,
    verified: raqis.filter((r) => r.verified_badge).length,
    featured: raqis.filter((r: any) => r.featured_badge).length,
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600 font-bold">
          <Loader2 className="w-6 h-6 animate-spin text-[#1f6f50]" />
          جاري التحقق...
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md rounded-3xl border border-gray-100 shadow-xl p-7">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ecfdf3] text-[#166534] font-bold text-sm mb-4">
              <Shield className="w-4 h-4" />
              لوحة الإدارة
            </div>

            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              لوحة الإدارة
            </h1>

            <p className="text-gray-500 font-medium">
              سجّل الدخول بحساب المدير
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setLoginError('');
                }}
                placeholder="البريد الإلكتروني"
                className="h-12 pr-10 rounded-xl"
              />
            </div>

            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLoginError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="كلمة المرور"
                className="h-12 pr-10 rounded-xl"
              />
            </div>

            {loginError && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-bold text-red-600">
                {loginError}
              </div>
            )}

            <Button
              onClick={handleLogin}
              className="w-full h-12 rounded-xl bg-[#1f6f50] hover:bg-[#195a41] text-white font-extrabold"
            >
              دخول
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-[#0b5a35] to-[#10693e] py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#d6b14a60] bg-white/10 mb-4">
              <Shield className="w-4 h-4 text-[#f1d27b]" />
              <span className="text-[#f1d27b] text-sm font-bold">
                لوحة إدارة دليل الرقاة
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
              لوحة إدارة دليل الرقاة
            </h1>

            <p className="text-white/80 text-base">
              إدارة الطلبات، التوثيق، التمييز، والحذف
            </p>
          </div>

          <Button
            onClick={handleLogout}
            className="bg-white text-[#1f6f50] hover:bg-gray-100 rounded-xl font-bold"
          >
            <LogOut className="w-4 h-4 ml-2" />
            خروج
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {[
            {
              label: 'الكل',
              value: stats.total,
              icon: Users,
              color: 'bg-slate-100 text-slate-700',
            },
            {
              label: 'معلق',
              value: stats.pending,
              icon: Clock,
              color: 'bg-amber-100 text-amber-700',
            },
            {
              label: 'معتمد',
              value: stats.approved,
              icon: CheckCheck,
              color: 'bg-green-100 text-green-700',
            },
            {
              label: 'مرفوض',
              value: stats.rejected,
              icon: XCircle,
              color: 'bg-red-100 text-red-700',
            },
            {
              label: 'موثق',
              value: stats.verified,
              icon: Award,
              color: 'bg-blue-100 text-blue-700',
            },
            {
              label: 'متميز',
              value: stats.featured,
              icon: Sparkles,
              color: 'bg-amber-100 text-amber-700',
            },
            {
              label: 'زيارات',
              value: stats.totalViews,
              icon: Eye,
              color: 'bg-purple-100 text-purple-700',
            },
            {
              label: 'اتصالات',
              value: stats.totalPhone,
              icon: Phone,
              color: 'bg-indigo-100 text-indigo-700',
            },
            {
              label: 'واتساب',
              value: stats.totalWhatsApp,
              icon: MessageCircle,
              color: 'bg-emerald-100 text-emerald-700',
            },
          ].map((s, i) => {
            const Icon = s.icon;

            return (
              <Card
                key={i}
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`rounded-xl p-2 ${s.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-extrabold text-gray-900">
                    {s.value}
                  </span>
                </div>

                <div className="text-sm font-bold text-gray-600">{s.label}</div>
              </Card>
            );
          })}
        </div>

        <Card className="p-5 rounded-2xl border border-gray-100 shadow-lg mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'الكل' },
                { value: 'pending', label: 'معلق' },
                { value: 'approved', label: 'معتمد' },
                { value: 'rejected', label: 'مرفوض' },
              ].map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStatusFilter(s.value as StatusFilter)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    statusFilter === s.value
                      ? 'bg-[#1f6f50] text-white shadow'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بالاسم أو الولاية أو التخصص..."
                className="h-10 pr-10 rounded-lg"
              />
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-[#1f6f50]" />
            <span className="mr-3 text-gray-500 font-semibold">جاري التحميل...</span>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filtered.map((raqi: any) => (
              <Card
                key={raqi.id}
                className="rounded-2xl border border-gray-100 shadow-md bg-white overflow-hidden"
              >
                <div className="p-5 flex flex-col gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold ${
                          raqi.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : raqi.status === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {raqi.status === 'approved'
                          ? 'معتمد'
                          : raqi.status === 'pending'
                          ? 'معلق'
                          : 'مرفوض'}
                      </span>

                      {raqi.verified_badge && (
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1 text-xs font-extrabold">
                          <Award className="w-3 h-3" />
                          موثق
                        </span>
                      )}

                      {raqi.featured_badge && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1 text-xs font-extrabold">
                          <Sparkles className="w-3 h-3" />
                          متميز
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-extrabold text-gray-900 leading-snug">
                      {raqi.full_name}
                    </h3>
                  </div>

                  <div className="space-y-2 text-sm">
                    {raqi.speciality && (
                      <div className="text-gray-600 font-medium">
                        {raqi.speciality}
                      </div>
                    )}

                    {raqi.wilaya && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 text-[#1f6f50] shrink-0" />
                        <span>{getWilayaName(raqi.wilaya)}</span>
                      </div>
                    )}

                    {typeof raqi.experience_years === 'number' && (
                      <div className="text-gray-500">
                        {raqi.experience_years} سنة خبرة
                      </div>
                    )}

                    {/* Compteurs */}
                    <div className="flex gap-3 pt-2 mt-2 border-t border-gray-50">
                      <div className="flex items-center gap-1 text-xs text-purple-600 font-bold">
                        <Eye className="w-3.5 h-3.5" />
                        {raqi.view_count || 0}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-indigo-600 font-bold">
                        <Phone className="w-3.5 h-3.5" />
                        {raqi.phone_click_count || 0}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
                        <MessageCircle className="w-3.5 h-3.5" />
                        {raqi.whatsapp_click_count || 0}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                    {raqi.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => handleStatus(raqi.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700 text-white rounded-lg h-9"
                        >
                          قبول
                        </Button>

                        <Button
                          onClick={() => handleStatus(raqi.id, 'rejected')}
                          className="border border-red-300 text-red-600 hover:bg-red-50 rounded-lg h-9 bg-white"
                        >
                          رفض
                        </Button>
                      </>
                    )}

                    {raqi.status === 'approved' && (
                      <>
                        <Button
                          onClick={() =>
                            handleToggleVerified(raqi.id, !!raqi.verified_badge)
                          }
                          className={
                            raqi.verified_badge
                              ? 'bg-[#d6b14a] hover:bg-[#c4a043] text-white rounded-lg h-9'
                              : 'border border-[#d6b14a] text-[#b8942a] hover:bg-amber-50 rounded-lg h-9 bg-white'
                          }
                        >
                          {raqi.verified_badge ? 'إلغاء التوثيق' : 'توثيق'}
                        </Button>

                        <Button
                          onClick={() =>
                            handleToggleFeatured(raqi.id, !!raqi.featured_badge)
                          }
                          className={
                            raqi.featured_badge
                              ? 'bg-amber-500 hover:bg-amber-600 text-white rounded-lg h-9'
                              : 'border border-amber-300 text-amber-700 hover:bg-amber-50 rounded-lg h-9 bg-white'
                          }
                        >
                          {raqi.featured_badge ? 'إلغاء التمييز' : 'تمييز'}
                        </Button>
                      </>
                    )}

                    <Button
                      onClick={() => handleDelete(raqi.id)}
                      className="bg-white text-red-500 border border-red-200 hover:bg-red-50 rounded-lg h-9"
                    >
                      <Trash2 className="w-4 h-4 ml-1" />
                      حذف
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 max-w-md mx-auto">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-bold">لا توجد نتائج</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}