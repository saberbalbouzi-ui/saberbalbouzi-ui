// ============================================================
// دليل الرقاة - Admin Dashboard (Secret Link)
// ============================================================
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAllRaqis, updateRaqiStatus, toggleVerified, deleteRaqi, mockWilayas } from '@/lib/supabase';
import type { Raqi } from '@/types';
import {
  Shield, Lock, LogOut, CheckCircle, XCircle, Award, Star,
  Users, Clock, CheckCheck, Trash2, MapPin, Loader2, Search
} from 'lucide-react';

const ADMIN_KEY = 'raqi-admin-2024';

export default function Admin() {
  const [searchParams] = useSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [raqis, setRaqis] = useState<Raqi[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Check for key in URL
  useEffect(() => {
    const key = searchParams.get('key');
    if (key === ADMIN_KEY) {
      setIsLoggedIn(true);
      loadRaqis();
    }
  }, [searchParams]);

  const loadRaqis = async () => {
    setLoading(true);
    try {
      const data = await getAllRaqis(statusFilter === 'all' ? undefined : statusFilter);
      setRaqis(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) loadRaqis();
  }, [statusFilter, isLoggedIn]);

  const handleLogin = () => {
    if (password === ADMIN_KEY) {
      setIsLoggedIn(true);
      loadRaqis();
      setLoginError('');
    } else {
      setLoginError('كلمة المرور غير صحيحة');
    }
  };

  const handleStatus = async (id: string, status: 'approved' | 'rejected') => {
    await updateRaqiStatus(id, status);
    await loadRaqis();
  };

  const handleToggleVerified = async (id: string, current: boolean) => {
    await toggleVerified(id, !current);
    await loadRaqis();
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
    alert(error?.message || 'حدث خطأ أثناء الحذف');
  }
};

  const getWilayaName = (code: string) => {
    return mockWilayas.find(w => w.code === code)?.name_ar || code;
  };

  const filtered = raqis.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return r.full_name.toLowerCase().includes(q);
  });

  const stats = {
    total: raqis.length,
    pending: raqis.filter(r => r.status === 'pending').length,
    approved: raqis.filter(r => r.status === 'approved').length,
    rejected: raqis.filter(r => r.status === 'rejected').length,
    verified: raqis.filter(r => r.verified_badge).length,
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b5a35] to-[#10693e] flex items-center justify-center px-4">
        <Card className="max-w-sm w-full p-8 rounded-3xl shadow-2xl bg-white">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#f0fdf4] rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-[#1f6f50]" />
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 mb-1">لوحة الإدارة</h1>
            <p className="text-gray-500 text-sm">أدخل كلمة المرور للوصول</p>
          </div>

          <div className="space-y-4">
            <Input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setLoginError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="كلمة المرور"
              className="h-12 rounded-xl text-center"
            />
            {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}
            <Button
              onClick={handleLogin}
              className="w-full h-12 bg-[#1f6f50] hover:bg-[#18593f] text-white font-bold rounded-xl"
            >
              دخول
            </Button>
          </div>

          <p className="text-center text-gray-400 text-xs mt-6">
            للوصول استخدم: ?key=raqi-admin-2024
          </p>
        </Card>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0b5a35] to-[#10693e] px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-[#f1d27b]" />
              <h1 className="text-xl md:text-2xl font-extrabold text-white">لوحة إدارة دليل الرقاة</h1>
            </div>
            <Button
              variant="ghost"
              onClick={() => setIsLoggedIn(false)}
              className="text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              خروج
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'الكل', value: stats.total, icon: Users, color: 'bg-white/10' },
              { label: 'معلق', value: stats.pending, icon: Clock, color: 'bg-amber-500/20' },
              { label: 'معتمد', value: stats.approved, icon: CheckCheck, color: 'bg-green-500/20' },
              { label: 'مرفوض', value: stats.rejected, icon: XCircle, color: 'bg-red-500/20' },
              { label: 'موثق', value: stats.verified, icon: Award, color: 'bg-blue-500/20' },
            ].map((s, i) => (
              <div key={i} className={`${s.color} backdrop-blur-sm rounded-xl p-3 text-center`}>
                <s.icon className="w-5 h-5 text-white/80 mx-auto mb-1" />
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-white/70 text-xs font-semibold">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Filters */}
        <Card className="p-4 rounded-2xl shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'all', label: 'الكل' },
                { value: 'pending', label: 'معلق' },
                { value: 'approved', label: 'معتمد' },
                { value: 'rejected', label: 'مرفوض' },
              ].map(s => (
                <button
                  key={s.value}
                  onClick={() => setStatusFilter(s.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all
                    ${statusFilter === s.value
                      ? 'bg-[#1f6f50] text-white shadow'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="بحث بالاسم..."
                className="h-10 pr-10 rounded-lg"
              />
            </div>
          </div>
        </Card>

        {/* Raqis Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#1f6f50]" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map(raqi => (
              <Card
                key={raqi.id}
                className="p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-extrabold text-gray-900">{raqi.full_name}</h3>
                      {raqi.verified_badge && (
                        <Award className="w-4 h-4 text-[#d6b14a]" />
                      )}
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                        ${raqi.status === 'approved' ? 'bg-green-100 text-green-700'
                          : raqi.status === 'pending' ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'}`}>
                        {raqi.status === 'approved' ? 'معتمد'
                          : raqi.status === 'pending' ? 'معلق'
                          : 'مرفوض'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      {raqi.speciality && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" /> {raqi.speciality}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {getWilayaName(raqi.wilaya)}
                      </span>
                      <span>{raqi.experience_years} سنة خبرة</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {raqi.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStatus(raqi.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700 text-white rounded-lg h-9"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          قبول
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatus(raqi.id, 'rejected')}
                          className="border-red-300 text-red-600 hover:bg-red-50 rounded-lg h-9"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          رفض
                        </Button>
                      </>
                    )}
                    {raqi.status === 'approved' && (
                      <Button
                        size="sm"
                        variant={raqi.verified_badge ? 'default' : 'outline'}
                        onClick={() => handleToggleVerified(raqi.id, raqi.verified_badge)}
                        className={raqi.verified_badge
                          ? 'bg-[#d6b14a] hover:bg-[#c4a043] text-white rounded-lg h-9'
                          : 'border-[#d6b14a] text-[#b8942a] hover:bg-amber-50 rounded-lg h-9'
                        }
                      >
                        <Award className="w-4 h-4 mr-1" />
                        {raqi.verified_badge ? 'إلغاء التوثيق' : 'توثيق'}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(raqi.id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 h-9"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 font-bold">لا توجد نتائج</p>
          </div>
        )}
      </div>
    </div>
  );
}
