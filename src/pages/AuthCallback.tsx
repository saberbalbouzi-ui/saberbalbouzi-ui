import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

async function ensureRaqiProfile() {
  // 1) احصل على المستخدم الحالي من Supabase Auth
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw userError || new Error('لا يوجد مستخدم مسجل الدخول');
  }

  const email = user.email;

  // 2) هل يوجد صف raqi مرتبط بهذا المستخدم؟
  const { data: existing, error: raqiError } = await supabase
    .from('raqis')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (raqiError) throw raqiError;

  if (!existing) {
    // إنشاء صف جديد في raqis لأول مرة
    const { error: insertError } = await supabase.from('raqis').insert({
      user_id: user.id,
      email,
      full_name: user.user_metadata.full_name || '', // أو استخدم display_name حسب Google
      country_code: 'DZ', // قيمة افتراضية، يمكنك تحديثها لاحقاً من Dashboard
      wilaya: '',
      has_auth_account: true,
    });

    if (insertError) throw insertError;
  } else if (!existing.email && email) {
    // تحديث صف قديم بلا إيميل
    const { error: updateError } = await supabase
      .from('raqis')
      .update({
        email,
        has_auth_account: true,
      })
      .eq('id', existing.id);

    if (updateError) throw updateError;
  }
}

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let handled = false;

    const finish = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user && !handled) {
        try {
          await ensureRaqiProfile(); // مهم: تأكد من وجود/تحديث صف raqis بالإيميل
        } catch (err) {
          console.error('ensureRaqiProfile error:', err);
          // يمكنك هنا إظهار صفحة خطأ مخصصة إن أحببت
        }

        handled = true;
        navigate('/raqi-dashboard', { replace: true });
      }
    };

    void finish();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (handled) return;

      if (event === 'SIGNED_IN' && session?.user) {
        try {
          await ensureRaqiProfile();
        } catch (err) {
          console.error('ensureRaqiProfile error (SIGNED_IN):', err);
        }

        handled = true;
        navigate('/raqi-dashboard', { replace: true });
      }

      if (event === 'SIGNED_OUT') {
        handled = true;
        navigate('/raqi-login', { replace: true });
      }
    });

    const timeout = setTimeout(() => {
      if (!handled) {
        handled = true;
        navigate('/raqi-login', { replace: true });
      }
    }, 8000); // أعطينا وقتاً أطول قليلاً لتهيئة الحساب

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [navigate]);

  return <div>جاري إكمال تسجيل الدخول...</div>;
}