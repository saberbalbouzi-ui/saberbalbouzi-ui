// ============================================================
// دليل الرقاة - Raqi Login & Quick Register
// ============================================================

import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  supabase,
  registerRaqiWithAccount,
  getCurrentRaqiProfile,
  mockWilayas,
} from '@/lib/supabase';
import {
  Shield,
  Lock,
  Mail,
  Loader2,
  LogIn,
  AlertCircle,
  UserPlus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function RaqiLogin() {
  const navigate = useNavigate();

  const [sessionLoading, setSessionLoading] = useState(true);

  // ─── LOGIN ───
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [submittingLogin, setSubmittingLogin] = useState(false);

  // ─── REGISTER RAPIDE ───
  const [showRegister, setShowRegister] = useState(false);
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regWilaya, setRegWilaya] = useState('');
  const [regError, setRegError] = useState('');
  const [submittingReg, setSubmittingReg] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setSessionLoading(false);
          return;
        }

        const profile = await getCurrentRaqiProfile();

        if (profile) {
          navigate('/raqi-dashboard', { replace: true });
          return;
        }

        await supabase.auth.signOut();
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setSessionLoading(false);
      }
    };

    init();
  }, [navigate]);

  const handleLogin = async (e?: FormEvent) => {
    if (e) e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setLoginError('يرجى إدخال البريد الإلكتروني وكلمة السر');
      return;
    }

    setSubmittingLogin(true);
    setLoginError('');

    try {
      const normalizedEmail = email.trim().toLowerCase();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        if (error.message.includes('not confirmed')) {
          setLoginError('لم يتم تأكيد البريد الإلكتروني بعد. يرجى التحقق من صندوق الوارد.');
        } else if (error.message.includes('Invalid')) {
          setLoginError('البريد الإلكتروني أو كلمة السر غير صحيحة');
        } else {
          setLoginError(error.message || 'فشل تسجيل الدخول');
        }
        setSubmittingLogin(false);
        return;
      }

      if (!data.session) {
        setLoginError('تعذر إنشاء الجلسة. يرجى المحاولة مرة أخرى.');
        setSubmittingLogin(false);
        return;
      }

      const profile = await getCurrentRaqiProfile();

      if (!profile) {
        await supabase.auth.signOut();
        setLoginError('هذا الحساب لا يملك ملف راقٍ مرتبطًا به.');
        setSubmittingLogin(false);
        return;
      }

      navigate('/raqi-dashboard', { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      setLoginError(err?.message || 'حدث خطأ غير متوقع');
      setSubmittingLogin(false);
    }
  };

  const handleQuickRegister = async (e: FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess(false);

    if (!regFullName.trim()) {
      setRegError('الاسم الكامل مطلوب');
      return;
    }

    if (!regEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) {
      setRegError('البريد الإلكتروني غير صحيح');
      return;
    }

    if (!regPassword.trim() || regPassword.length < 6) {
      setRegError('كلمة السر يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    if (!regWilaya) {
      setRegError('الولاية مطلوبة');
      return;
    }

    setSubmittingReg(true);

    try {
      const normalizedEmail = regEmail.trim().toLowerCase();

      await registerRaqiWithAccount({
        email: normalizedEmail,
        password: regPassword,
        full_name: regFullName.trim(),
        wilaya: regWilaya,
      });

      setRegSuccess(true);

      const { data, error: loginErr } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: regPassword,
      });

      if (loginErr) {
        setSubmittingReg(false);
        return;
      }

      if (data.session) {
        const profile = await getCurrentRaqiProfile();

        if (profile) {
          navigate('/raqi-dashboard', { replace: true });
          return;
        }

        await supabase.auth.signOut();
        setRegError('تم إنشاء الحساب لكن تعذر ربط ملف الراقي تلقائيًا.');
      }

      setSubmittingReg(false);
    } catch (err: any) {
      console.error('Register error:', err);
      setRegError(err?.message || 'فشل إنشاء الحساب');
      setSubmittingReg(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f7faf8] to-white flex items-center justify-center px-4">
        <div className="flex items-center gap-3 text-gray-700 font-bold">
          <Loader2 className="w-6 h-6 animate-spin text-[#1f6f50]" />
          جاري التحقق...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7faf8] to-white px-4 py-10">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-6">
        <Card className="rounded-3xl border-0 shadow-xl p-6 md:p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#1f6f50]/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-[#1f6f50]" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">دخول الراقي</h1>
            <p className="text-gray-500 mt-2">سجّل الدخول بحسابك لتعديل بياناتك</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setLoginError('');
                }}
                placeholder="البريد الإلكتروني"
                className="h-12 pr-10 rounded-xl"
                dir="ltr"
              />
            </div>

            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <Input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLoginError('');
                }}
                placeholder="كلمة السر"
                className="h-12 pr-10 rounded-xl"
                dir="ltr"
              />
            </div>

            {loginError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-semibold flex items-start gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={submittingLogin}
              className="w-full h-12 rounded-xl bg-[#1f6f50] hover:bg-[#18593f] text-white font-bold"
            >
              {submittingLogin ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري الدخول...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 ml-2" />
                  دخول
                </>
              )}
            </Button>
          </form>
        </Card>

        <Card className="rounded-3xl border-0 shadow-xl p-6 md:p-8">
          <button
            type="button"
            onClick={() => setShowRegister((v) => !v)}
            className="w-full flex items-center justify-between text-right"
          >
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">إنشاء حساب سريع</h2>
              <p className="text-gray-500 mt-2">أنشئ حسابك أولًا ثم ادخل إلى لوحة الراقي</p>
            </div>

            <div className="w-10 h-10 rounded-xl bg-[#1f6f50]/10 flex items-center justify-center text-[#1f6f50]">
              {showRegister ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </button>

          {showRegister && (
            <form onSubmit={handleQuickRegister} className="space-y-4 mt-6">
              <div>
                <Input
                  value={regFullName}
                  onChange={(e) => {
                    setRegFullName(e.target.value);
                    setRegError('');
                  }}
                  placeholder="الاسم الكامل"
                  className="h-12 rounded-xl"
                />
              </div>

              <div>
                <Input
                  type="email"
                  value={regEmail}
                  onChange={(e) => {
                    setRegEmail(e.target.value);
                    setRegError('');
                  }}
                  placeholder="البريد الإلكتروني"
                  className="h-12 rounded-xl"
                  dir="ltr"
                />
              </div>

              <div>
                <Input
                  type="password"
                  value={regPassword}
                  onChange={(e) => {
                    setRegPassword(e.target.value);
                    setRegError('');
                  }}
                  placeholder="كلمة السر"
                  className="h-12 rounded-xl"
                  dir="ltr"
                />
              </div>

              <div>
                <select
                  value={regWilaya}
                  onChange={(e) => {
                    setRegWilaya(e.target.value);
                    setRegError('');
                  }}
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

              {regError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-semibold flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 font-semibold">
                  تم إنشاء الحساب بنجاح! جاري الدخول...
                </div>
              )}

              <Button
                type="submit"
                disabled={submittingReg}
                className="w-full h-12 rounded-xl bg-[#d6b14a] hover:bg-[#c5a13f] text-white font-bold"
              >
                {submittingReg ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري إنشاء الحساب...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 ml-2" />
                    إنشاء الحساب
                  </>
                )}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}