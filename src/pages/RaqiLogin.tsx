// ============================================================
// دليل الرقاة - Raqi Login & Quick Register (SOLUTION RAPIDE)
// ============================================================
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase, registerRaqiWithAccount } from '@/lib/supabase';
import { Shield, Lock, Mail, Loader2, LogIn, AlertCircle, UserPlus, ChevronDown, ChevronUp } from 'lucide-react';

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
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate('/raqi-dashboard', { replace: true });
          return;
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setSessionLoading(false);
      }
    };
    init();
  }, [navigate]);

  // ─── LOGIN ───
  const handleLogin = async (e?: FormEvent) => {
    if (e) e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setLoginError('يرجى إدخال البريد الإلكتروني وكلمة السر');
      return;
    }

    setSubmittingLogin(true);
    setLoginError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
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

      if (data.session) {
        await new Promise(resolve => setTimeout(resolve, 100));
        navigate('/raqi-dashboard', { replace: true });
      } else {
        setLoginError('تعذر إنشاء الجلسة. يرجى المحاولة مرة أخرى.');
        setSubmittingLogin(false);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setLoginError(err?.message || 'حدث خطأ غير متوقع');
      setSubmittingLogin(false);
    }
  };

  // ─── REGISTER RAPIDE ───
  const handleQuickRegister = async (e: FormEvent) => {
    e.preventDefault();
    setRegError('');

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
      await registerRaqiWithAccount({
        email: regEmail.trim().toLowerCase(),
        password: regPassword,
        full_name: regFullName.trim(),
        wilaya: regWilaya,
      });

      setRegSuccess(true);
      // Connexion automatique
      const { data, error: loginErr } = await supabase.auth.signInWithPassword({
        email: regEmail.trim().toLowerCase(),
        password: regPassword,
      });

      if (!loginErr && data.session) {
        navigate('/raqi-dashboard', { replace: true });
      }
    } catch (err: any) {
      console.error('Register error:', err);
      setRegError(err?.message || 'فشل إنشاء الحساب');
      setSubmittingReg(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="flex items-center gap-3 text-gray-600 font-bold">
          <Loader2 className="w-6 h-6 animate-spin text-[#1f6f50]" />
          جاري التحميل...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-4">
        {/* ─── LOGIN CARD ─── */}
        <Card className="rounded-3xl shadow-2xl p-8 border-0">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#1f6f50]/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-[#1f6f50]" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">لوحة الراقي</h1>
            <p className="text-gray-500 mt-2">سجّل الدخول بحسابك لتعديل بياناتك</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <Input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setLoginError(''); }}
                placeholder="البريد الإلكتروني"
                dir="ltr"
                className="h-12 pr-10 rounded-xl text-left"
                autoComplete="email"
                disabled={submittingLogin}
              />
            </div>

            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <Input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setLoginError(''); }}
                placeholder="كلمة المرور"
                dir="ltr"
                className="h-12 pr-10 rounded-xl text-left"
                autoComplete="current-password"
                disabled={submittingLogin}
              />
            </div>

            {loginError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-600 text-sm font-semibold">{loginError}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={submittingLogin}
              className="w-full h-12 rounded-xl bg-[#1f6f50] hover:bg-[#18593f] text-white font-bold"
            >
              {submittingLogin ? (
                <><Loader2 className="w-4 h-4 ml-2 animate-spin" />جاري الدخول...</>
              ) : (
                <><LogIn className="w-4 h-4 ml-2" />دخول</>
              )}
            </Button>
          </form>
        </Card>

        {/* ─── REGISTER RAPIDE ( Accordéon ) ─── */}
        <Card className="rounded-3xl shadow-xl border-0 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowRegister(!showRegister)}
            className="w-full flex items-center justify-between p-5 text-right hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">ليس لديك حساب؟</p>
                <p className="text-sm text-gray-500">سجّل كراقٍ جديد الآن</p>
              </div>
            </div>
            {showRegister ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {showRegister && (
            <div className="px-5 pb-5 pt-2 border-t border-gray-100">
              {regSuccess ? (
                <div className="text-center py-4">
                  <p className="text-green-600 font-bold">تم إنشاء الحساب بنجاح!</p>
                  <p className="text-gray-500 text-sm mt-1">جاري الدخول...</p>
                </div>
              ) : (
                <form onSubmit={handleQuickRegister} className="space-y-3">
                  {regError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 text-center">
                      {regError}
                    </div>
                  )}

                  <Input
                    value={regFullName}
                    onChange={(e) => { setRegFullName(e.target.value); setRegError(''); }}
                    placeholder="الاسم الكامل *"
                    className="h-11 rounded-xl"
                    disabled={submittingReg}
                  />

                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="email"
                      value={regEmail}
                      onChange={(e) => { setRegEmail(e.target.value); setRegError(''); }}
                      placeholder="البريد الإلكتروني *"
                      dir="ltr"
                      className="h-11 rounded-xl pl-10 text-left"
                      disabled={submittingReg}
                    />
                  </div>

                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="password"
                      value={regPassword}
                      onChange={(e) => { setRegPassword(e.target.value); setRegError(''); }}
                      placeholder="كلمة السر (6 أحرف على الأقل) *"
                      dir="ltr"
                      className="h-11 rounded-xl pl-10 text-left"
                      disabled={submittingReg}
                    />
                  </div>

                  <select
                    value={regWilaya}
                    onChange={(e) => { setRegWilaya(e.target.value); setRegError(''); }}
                    className="w-full h-11 px-4 border border-gray-200 rounded-xl text-base bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1f6f50]"
                    disabled={submittingReg}
                  >
                    <option value="">اختر الولاية *</option>
                    <option value="16">الجزائر</option>
                    <option value="31">وهران</option>
                    <option value="01">أدرار</option>
                    <option value="02">الشلف</option>
                    <option value="03">الأغواط</option>
                    <option value="04">أم البواقي</option>
                    <option value="05">باتنة</option>
                    <option value="06">بجاية</option>
                    <option value="07">بسكرة</option>
                    <option value="08">بشار</option>
                    <option value="09">البليدة</option>
                    <option value="10">البويرة</option>
                    <option value="11">تمنراست</option>
                    <option value="12">تبسة</option>
                    <option value="13">تلمسان</option>
                    <option value="14">تيارت</option>
                    <option value="15">تيزي وزو</option>
                    <option value="17">الجلفة</option>
                    <option value="18">جيجل</option>
                    <option value="19">سطيف</option>
                    <option value="20">سعيدة</option>
                    <option value="21">سكيكدة</option>
                    <option value="22">سيدي بلعباس</option>
                    <option value="23">عنابة</option>
                    <option value="24">قالمة</option>
                    <option value="25">قسنطينة</option>
                    <option value="26">المدية</option>
                    <option value="27">مستغانم</option>
                    <option value="28">المسيلة</option>
                    <option value="29">معسكر</option>
                    <option value="30">ورقلة</option>
                    <option value="32">البيض</option>
                    <option value="33">إليزي</option>
                    <option value="34">برج بوعريريج</option>
                    <option value="35">بومرداس</option>
                    <option value="36">الطارف</option>
                    <option value="37">تندوف</option>
                    <option value="38">تيسمسيلت</option>
                    <option value="39">الوادي</option>
                    <option value="40">خنشلة</option>
                    <option value="41">سوق أهراس</option>
                    <option value="42">تيبازة</option>
                    <option value="43">ميلة</option>
                    <option value="44">عين الدفلى</option>
                    <option value="45">النعامة</option>
                    <option value="46">عين تموشنت</option>
                    <option value="47">غرداية</option>
                    <option value="48">غليزان</option>
                    <option value="49">تيميمون</option>
                    <option value="50">برج باجي مختار</option>
                    <option value="51">أولاد جلال</option>
                    <option value="52">بني عباس</option>
                    <option value="53">عين صالح</option>
                    <option value="54">عين قزام</option>
                    <option value="55">تقرت</option>
                    <option value="56">جانت</option>
                    <option value="57">المغير</option>
                    <option value="58">المنيعة</option>
                  </select>

                  <Button
                    type="submit"
                    disabled={submittingReg}
                    className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold"
                  >
                    {submittingReg ? (
                      <><Loader2 className="w-4 h-4 ml-2 animate-spin" />جاري التسجيل...</>
                    ) : (
                      <><UserPlus className="w-4 h-4 ml-2" />سجّل وادخل</>
                    )}
                  </Button>
                </form>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
