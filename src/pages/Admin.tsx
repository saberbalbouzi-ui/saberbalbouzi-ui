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
  Shield, Lock, LogOut, XCircle, Award,
  Users, Clock, CheckCheck, Trash2, MapPin, Loader2, Search, Mail
} from 'lucide-react';

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [raqis, setRaqis] = useState<Raqi[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setIsLoggedIn(!!session);

      if (session) {
        await loadRaqis();
      }

      setSessionLoading(false);
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

  const loadRaqis = async () => {
    setLoading(true);
    try {
      const data = await getAllRaqis(statusFilter === 'all' ? undefined : statusFilter);
      setRaqis(data);
    } catch (err) {
      console.error('Error loading raqis:', err);
    } finally {
      setLoading(false);
    }
  };

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
    return mockWilayas.find(w => w.code === code)?.name_ar || code;
  };

  const filtered = raqis.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();

    return (
      r.full_name?.toLowerCase().includes(q) ||
      r.speciality?.toLowerCase().includes(q) ||
      r.wilaya?.toLowerCase().includes(q)
    );
  });

  const stats = {
    total: raqis.length,
    pending: raqis.filter(r => r.status === 'pending').length,
    approved: raqis.filter(r => r.status === 'approved').length,
    rejected: raqis.filter(r => r.status === 'rejected').length,
    verified: raqis.filter(r => r.verified_badge).length,
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-[#1f6f50] font-bold">
          <Loader2 className="w-6 h-6 animate-spin" />
          جاري التحقق...
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b5a35] to-[#10693e] flex items-center justify-center px-4">
        <Card className="w-full max-w-md rounded-3xl shadow-2xl p-8 border-0">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#1f6f50]/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-[#1f6f50]" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">لوحة الإدارة</h1>
            <p className="text-gray-500 mt-2">سجّل الدخول بحساب المدير</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <Input
                type="email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setLoginError('');
                }}
                placeholder="البريد الإلكتروني"
                className="h-12 pr-10 rounded-xl"
              />
            </div>

            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <Input
                type="password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setLoginError('');
                }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="كلمة المرور"
                className="h-12 pr-10 rounded-xl"
              />
            </div>

            {loginError && (
              <p className="text-red-600 text-sm font-semibold text-center">{loginError}</p>
            )}

            <Button
              onClick={handleLogin}
              className="w-full h-12 rounded-xl bg-[#1f6f50] hover:bg-[#18593f] text-white font-bold"
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
      <div className="bg-gradient-to-br from-[#0b5a35] to-[#10693e] py-8 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white">لوحة إدارة دليل الرقاة</h1>
            <p className="text-white/80 mt-2">إدارة الطلبات، التوثيق، والحذف</p>
          </div>

          <Button
            onClick={handleLogout}
            className="text-white bg-white/10 hover:bg-white/20 rounded-xl"
          >
            <LogOut className="w-4 h-4 ml-2" />
            خروج
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'الكل', value: stats.total, icon: Users, color: 'bg-slate-100 text-slate-700' },
            { label: 'معلق', value: stats.pending, icon: Clock, color: 'bg-amber-100 text-amber-700' },
            { label: 'معتمد', value: stats.approved, icon: CheckCheck, color: 'bg-green-100 text-green-700' },
            { label: 'مرفوض', value: stats.rejected, icon: XCircle, color: 'bg-red-100 text-red-700' },
            { label: 'موثق', value: stats.verified, icon: Award, color: 'bg-blue-100 text-blue-700' },
          ].map((s, i) => (
            <Card key={i} className="p-4 rounded-2xl border-0 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
                  <p className="text-sm text-gray-500 font-semibold mt-1">{s.label}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-5 rounded-2xl shadow-sm border-0 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'الكل' },
                { value: 'pending', label: 'معلق' },
                { value: 'approved', label: 'معتمد' },
                { value: 'rejected', label: 'مرفوض' },
              ].map(s => (
                <button
                  key={s.value}
                  onClick={() => setStatusFilter(s.value)}
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

            <div className="relative w-full lg:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="بحث بالاسم أو الولاية أو التخصص..."
                className="h-10 pr-10 rounded-lg"
              />
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#1f6f50] font-bold">
            <Loader2 className="w-6 h-6 animate-spin ml-2" />
            جاري التحميل...
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map(raqi => (
              <Card
                key={raqi.id}
                className="rounded-3xl border border-gray-200 shadow-sm p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap mb-3">
                    <h3 className="text-2xl font-extrabold text-gray-900">{raqi.full_name}</h3>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
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
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                        موثق
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                    {raqi.speciality && <span>{raqi.speciality}</span>}
                    {raqi.wilaya && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-[#1f6f50]" />
                        {getWilayaName(raqi.wilaya)}
                      </span>
                    )}
                    {typeof raqi.experience_years === 'number' && (
                      <span>{raqi.experience_years} سنة خبرة</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
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
                    <Button
                      onClick={() => handleToggleVerified(raqi.id, !!raqi.verified_badge)}
                      className={
                        raqi.verified_badge
                          ? 'bg-[#d6b14a] hover:bg-[#c4a043] text-white rounded-lg h-9'
                          : 'border border-[#d6b14a] text-[#b8942a] hover:bg-amber-50 rounded-lg h-9 bg-white'
                      }
                    >
                      {raqi.verified_badge ? 'إلغاء التوثيق' : 'توثيق'}
                    </Button>
                  )}

                  <Button
                    onClick={() => handleDelete(raqi.id)}
                    className="bg-white text-red-500 border border-red-200 hover:bg-red-50 rounded-lg h-9"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl border-0 shadow-sm p-12 text-center text-gray-500 font-semibold">
            لا توجد نتائج
          </Card>
        )}
      </div>
    </div>
  );
}