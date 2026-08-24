// ============================================================
// دليل الرقاة - Raqi Dashboard (نهائي مصحَّح)
// ============================================================
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sparkles,
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
  Lock,
  Facebook,
  Youtube,
  Instagram,
  Music2,
  Globe,
  ImagePlus,
  PackagePlus,
  Pencil,
  ArrowLeft,
} from 'lucide-react';
import {
  createRaqiProduct,
  deleteRaqiProduct,
  getCurrentRaqiProducts,
  getCurrentRaqiProfile,
  getRaqiStats,
  signOutRaqi,
  supabase,
  updateCurrentRaqiProfile,
  updateRaqiProduct,
} from '@/lib/supabase';
import { useRealtimeCounters } from '@/hooks/useRealtimeCounters';
import { useCountries, useCities } from '@/hooks/useCountries';
import type { Raqi, RaqiProduct } from '@/types';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

const PRODUCT_DESCRIPTION_TEMPLATE = `وصف قصير للمنتج:\n...\n\nالفوائد:\n- ...\n- ...\n- ...\n\nالمكونات:\n- ...\n- ...\n- ...\n\nطريقة الاستعمال:\n- ...\n- ...\n- ...`;

type DashboardRaqi = Raqi & {
  email?: string | null;
  profile_image_url?: string | null;
  profile_image_path?: string | null;
  featured_badge?: boolean | null;
  balance_credits?: number | null;
};

export default function RaqiDashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const productImageInputRef = useRef<HTMLInputElement | null>(null);

  const [sessionLoading, setSessionLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<DashboardRaqi | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageError, setImageError] = useState('');

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);

  const [stats, setStats] = useState({
    view_count: 0,
    phone_click_count: 0,
    whatsapp_click_count: 0,
    balance_credits: 0,
  });

  const { view_count, phone_click_count, whatsapp_click_count, balance_credits } =
    useRealtimeCounters(profile?.id, stats);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const [products, setProducts] = useState<RaqiProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSaving, setProductSaving] = useState(false);
  const [productError, setProductError] = useState('');
  const [productSuccess, setProductSuccess] = useState('');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [selectedProductImage, setSelectedProductImage] = useState<File | null>(null);
  const [removeProductImage, setRemoveProductImage] = useState(false);

  // الدول والولايات (المدن) عبر الـ hooks نفسها المستعملة في Directory
  const { countries, loading: countriesLoading } = useCountries(true);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    speciality: '',
    phone: '',
    whatsapp: '',
    country_code: 'DZ',
    wilaya: '',
    address: '',
    experience_years: '',
    bio: '',
    facebook_url: '',
    youtube_url: '',
    instagram_url: '',
    tiktok_url: '',
  });
  const { cities, loading: citiesLoading } = useCities(form.country_code);
  const loadingGeo = countriesLoading || citiesLoading;

  const [productForm, setProductForm] = useState({
    name: '',
    description: PRODUCT_DESCRIPTION_TEMPLATE,
    price: '',
    currency: 'DZD',
    is_active: true,
    sort_order: '0',
  });

  const currentCities = useMemo(
    () => cities || [],
    [cities],
  );

  const selectedCountry = useMemo(
    () => countries.find((c) => c.code === form.country_code),
    [countries, form.country_code],
  );

  const country = selectedCountry;

  // تحديث عملة المنتجات تلقائياً حسب الدولة
  useEffect(() => {
    if (!selectedCountry?.currency_code) return;
    setProductForm((prev) => ({ ...prev, currency: selectedCountry.currency_code! }));
  }, [selectedCountry]);

  const imagePreview = useMemo(() => {
    if (!selectedImage) return '';
    return URL.createObjectURL(selectedImage);
  }, [selectedImage]);

  const productImagePreview = useMemo(() => {
    if (!selectedProductImage) return '';
    return URL.createObjectURL(selectedProductImage);
  }, [selectedProductImage]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => {
    return () => {
      if (productImagePreview) URL.revokeObjectURL(productImagePreview);
    };
  }, [productImagePreview]);

  const validateImage = (file: File | null): string => {
    if (!file) return '';
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return 'صيغة الصورة غير مدعومة. استخدم JPG أو PNG أو WEBP';
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return `حجم الصورة يجب ألا يتجاوز ${MAX_IMAGE_SIZE_MB}MB`;
    }
    return '';
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: PRODUCT_DESCRIPTION_TEMPLATE,
      price: '',
      currency: selectedCountry?.currency_code || 'DZD',
      is_active: true,
      sort_order: '0',
    });
    setEditingProductId(null);
    setSelectedProductImage(null);
    setRemoveProductImage(false);
    setProductError('');
    setProductSuccess('');
    if (productImageInputRef.current) {
      productImageInputRef.current.value = '';
    }
  };

  const loadProducts = async (featured?: boolean) => {
    if (!featured) {
      setProducts([]);
      return;
    }
    setProductsLoading(true);
    setProductError('');
    try {
      const data = await getCurrentRaqiProducts();
      setProducts(data);
    } catch (err: any) {
      console.error('Load products error:', err);
      setProductError(err?.message || 'فشل تحميل المنتجات');
    } finally {
      setProductsLoading(false);
    }
  };

  const loadProfile = async () => {
    setLoadingProfile(true);
    setError('');
    setSuccess('');
    setImageError('');
    setSelectedImage(null);
    setRemoveCurrentImage(false);
    if (fileInputRef.current) fileInputRef.current.value = '';

    try {
      const data = await getCurrentRaqiProfile();
      if (!data) {
        setProfile(null);
        setError('تعذر تحميل الملف الشخصي.');
        return;
      }

      const dashboardProfile: DashboardRaqi = {
        ...data,
        verified_badge: (data as any).verified_badge ?? false,
        featured_badge: (data as any).featured_badge ?? false,
        balance_credits: (data as any).balance_credits ?? 0,
      };

      setProfile(dashboardProfile);

      try {
        const statsData = await getRaqiStats(data.id);
        setStats(statsData);
      } catch (err) {
        console.warn('Stats load error:', err);
      }

      setForm({
        full_name: data.full_name ?? '',
        email: data.email ?? '',
        speciality: data.speciality ?? '',
        phone: data.phone ?? '',
        whatsapp: data.whatsapp ?? '',
        country_code: data.country_code ?? 'DZ',
        wilaya: data.wilaya ?? '',
        address: data.address ?? '',
        experience_years:
          typeof data.experience_years === 'number'
            ? String(data.experience_years)
            : '',
        bio: data.bio ?? '',
        facebook_url: data.facebook_url ?? '',
        youtube_url: data.youtube_url ?? '',
        instagram_url: data.instagram_url ?? '',
        tiktok_url: data.tiktok_url ?? '',
      });

      if (dashboardProfile.featured_badge) {
        try {
          const productData = await getCurrentRaqiProducts();
          setProducts(productData);
        } catch (err) {
          console.warn('Products load error:', err);
          setProducts([]);
        }
      } else {
        setProducts([]);
      }
    } catch (err: any) {
      console.error('Load profile error:', err);
      setError(err?.message || 'حدث خطأ أثناء تحميل الملف الشخصي');
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const checkSessionAndLoad = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mounted) {
            setError('تعذر التحقق من الجلسة');
            setSessionLoading(false);
          }
          return;
        }

        if (!session) {
          if (mounted) {
            setSessionLoading(false);
            navigate('/raqi-login', { replace: true });
          }
          return;
        }

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

    void checkSessionAndLoad();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/raqi-login', { replace: true });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'country_code') {
        next.wilaya = '';
      }
      return next;
    });
    setError('');
    setSuccess('');
  };

  const handleProductChange = (
    key: keyof typeof productForm,
    value: string | boolean,
  ) => {
    setProductForm((prev) => ({ ...prev, [key]: value }));
    setProductError('');
    setProductSuccess('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    const validationError = validateImage(file);

    if (validationError) {
      setSelectedImage(null);
      setImageError(validationError);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setSelectedImage(file);
    setRemoveCurrentImage(false);
    setImageError('');
    setError('');
    setSuccess('');
  };

  const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    const validationError = validateImage(file);

    if (validationError) {
      setSelectedProductImage(null);
      setProductError(validationError);
      if (productImageInputRef.current) {
        productImageInputRef.current.value = '';
      }
      return;
    }

    setSelectedProductImage(file);
    setRemoveProductImage(false);
    setProductError('');
    setProductSuccess('');
  };

  const handleRemoveSelectedImage = () => {
    setSelectedImage(null);
    setRemoveCurrentImage(true);
    setImageError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setError('');
    setSuccess('');
  };

  const handleKeepCurrentImage = () => {
    setSelectedImage(null);
    setRemoveCurrentImage(false);
    setImageError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEditProduct = (product: RaqiProduct) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name || '',
      description: product.description || PRODUCT_DESCRIPTION_TEMPLATE,
      price: product.price != null ? String(product.price) : '',
      currency: product.currency || 'DZD',
      is_active: product.is_active ?? true,
      sort_order: String(product.sort_order ?? 0),
    });
    setSelectedProductImage(null);
    setRemoveProductImage(false);
    setProductError('');
    setProductSuccess('');
    if (productImageInputRef.current) {
      productImageInputRef.current.value = '';
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const confirmed = window.confirm('هل تريد حذف هذا المنتج نهائيًا؟');
    if (!confirmed) return;

    setProductError('');
    setProductSuccess('');

    try {
      await deleteRaqiProduct(productId);
      setProducts((prev) => prev.filter((item) => item.id !== productId));
      if (editingProductId === productId) {
        resetProductForm();
      }
      setProductSuccess('تم حذف المنتج بنجاح');
    } catch (err: any) {
      console.error('Delete product error:', err);
      setProductError(err?.message || 'فشل حذف المنتج');
    }
  };

  const handleSaveProduct = async () => {
    if (!productForm.name.trim()) {
      setProductError('اسم المنتج مطلوب');
      return;
    }

    if (productForm.price && Number(productForm.price) < 0) {
      setProductError('السعر غير صالح');
      return;
    }

    setProductSaving(true);
    setProductError('');
    setProductSuccess('');

    try {
      const payload = {
        name: productForm.name.trim(),
        description: productForm.description.trim() || null,
        price: productForm.price.trim() ? Number(productForm.price) : null,
        currency: productForm.currency || 'DZD',
        is_active: productForm.is_active,
        sort_order: productForm.sort_order.trim()
          ? Number(productForm.sort_order)
          : 0,
      };

     let saved: RaqiProduct;
if (editingProductId) {
  saved = await updateRaqiProduct(editingProductId, {
    ...payload,
    image_file: selectedProductImage,
    remove_image: removeProductImage,
    // ✅ أضف currency مع type assertion
    currency: payload.currency as 'DZD' | 'MAD' | 'TND' | 'EUR' | 'USD',
  });
}
        setProducts((prev) => prev.map((item) => (item.id === saved.id ? saved : item)));
        setProductSuccess('تم تحديث المنتج بنجاح');
      } else {
        saved = await createRaqiProduct({
          ...payload,
          image_file: selectedProductImage,
        });
        setProducts((prev) => [saved, ...prev]);
        setProductSuccess('تمت إضافة المنتج بنجاح');
      }

      resetProductForm();
    } catch (err: any) {
      console.error('Save product error:', err);
      setProductError(err?.message || 'فشل حفظ المنتج');
    } finally {
      setProductSaving(false);
    }
  };

  const handleSave = async () => {
    if (!form.full_name.trim()) {
      setError('الاسم الكامل مطلوب');
      return;
    }
    if (!form.country_code) {
      setError('الدولة مطلوبة');
      return;
    }
    if (!form.wilaya.trim()) {
      setError('الولاية مطلوبة');
      return;
    }

    if (selectedImage) {
      const validationError = validateImage(selectedImage);
      if (validationError) {
        setImageError(validationError);
        return;
      }
    }

    setSaving(true);
    setError('');
    setSuccess('');
    setImageError('');

    try {
      const payload = {
        full_name: form.full_name.trim(),
        email: form.email.trim() || null,
        speciality: form.speciality.trim() || null,
        phone: form.phone.trim() || null,
        whatsapp: form.whatsapp.trim() || null,
        country_code: form.country_code,
        wilaya: form.wilaya,
        address: form.address.trim() || null,
        experience_years: form.experience_years.trim()
          ? Number(form.experience_years)
          : 0,
        bio: form.bio.trim() || null,
        facebook_url: form.facebook_url.trim() || null,
        youtube_url: form.youtube_url.trim() || null,
        instagram_url: form.instagram_url.trim() || null,
        tiktok_url: form.tiktok_url.trim() || null,
        profile_image: selectedImage,
        remove_profile_image: removeCurrentImage,
      };

      const updated = (await updateCurrentRaqiProfile(payload)) as DashboardRaqi;

      if (updated) {
        setProfile(updated);

        if (updated.featured_badge) {
          await loadProducts(updated.featured_badge);
        } else {
          setProducts([]);
        }

        setSelectedImage(null);
        setRemoveCurrentImage(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        setSuccess('تم حفظ التغييرات بنجاح');
      }
    } catch (err: any) {
      console.error('Save profile error:', err);
      setError(err?.message || 'حدث خطأ أثناء حفظ التغييرات');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOutRaqi();
      navigate('/raqi-login', { replace: true });
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err?.message || 'فشل تسجيل الخروج');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim() !== 'حذف') {
      setError('اكتب عبارة "حذف" للتأكيد');
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

      const { error: deleteRaqiError } = await supabase
        .from('raqis')
        .delete()
        .eq('id', current.id);

      if (deleteRaqiError) {
        throw new Error(deleteRaqiError.message);
      }

      await signOutRaqi();
      navigate('/raqi-login', { replace: true });
    } catch (err: any) {
      console.error('Delete account error:', err);
      setError(err?.message || 'حدث خطأ أثناء حذف الحساب');
    } finally {
      setDeleting(false);
    }
  };

  const isVerified = profile?.verified_badge ?? false;
  const isFeatured = profile?.featured_badge ?? false;

  const facebookLocked = !isVerified;
  const featuredLocked = !isFeatured;

  const displayedProfileImage =
    imagePreview || (!removeCurrentImage ? profile?.profile_image_url || '' : '');

  const displayedProductImage =
    productImagePreview ||
    (!removeProductImage
      ? products.find((item) => item.id === editingProductId)?.image_url || ''
      : '');

  if (sessionLoading || loadingGeo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" dir="rtl">
        <div className="flex items-center gap-3 text-gray-600 font-bold">
          <Loader2 className="w-6 h-6 animate-spin text-[#1f6f50]" />
          {sessionLoading ? 'جاري التحقق...' : 'جاري تحميل بيانات الدول والولايات...'}
        </div>
      </div>
    );
  }

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" dir="rtl">
        <div className="flex items-center gap-3 text-gray-600 font-bold">
          <Loader2 className="w-6 h-6 animate-spin text-[#1f6f50]" />
          جاري تحميل بيانات الراقي...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-gradient-to-br from-[#0b5a35] to-[#10693e] py-8 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#d6b14a60] bg-white/10 mb-4">
              <Shield className="w-4 h-4 text-[#f1d27b]" />
              <span className="text-[#f1d27b] text-sm font-bold">لوحة الراقي</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">إدارة الملف الشخصي</h1>
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
        {!profile && error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-red-700 mb-2">لم يتم العثور على الملف</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {profile && (
          <>
            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="rounded-2xl border-0 shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-semibold">الحالة</p>
                    <p className="text-xl font-extrabold text-gray-900 mt-1">
                      {profile.status === 'approved'
                        ? 'معتمد'
                        : profile.status === 'pending'
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
                      {profile.verified_badge ? 'موثق' : 'غير موثق'}
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
                    <p className="text-sm text-gray-500 font-semibold">التمييز</p>
                    <p className="text-xl font-extrabold text-gray-900 mt-1">
                      {profile.featured_badge ? 'متميز' : 'غير متميز'}
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
                    <p className="text-sm text-gray-500 font-semibold">الزيارات</p>
                    <p className="text-xl font-extrabold text-gray-900 mt-1">
                      {view_count.toLocaleString('ar-DZ')}
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
                      {phone_click_count.toLocaleString('ar-DZ')}
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
                      {whatsapp_click_count.toLocaleString('ar-DZ')}
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                </div>
              </Card>

              <Card className="rounded-2xl border-0 shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-semibold">رصيد التواصل المتبقي</p>
                    <p className="text-xl font-extrabold text-gray-900 mt-1">
                      {(profile.balance_credits ?? 0).toLocaleString('ar-DZ')}
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                    ر
                  </div>
                </div>
              </Card>
            </div>

            {/* بيانات الراقي */}
            <Card className="rounded-3xl border-0 shadow-sm p-6 md:p-8 mb-6">
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">بيانات الراقي</h2>
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

              {/* صورة البروفايل */}
              <div className="mb-8">
                <label className="text-sm font-bold text-gray-700 block mb-3">صورة البروفايل</label>

                <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4 md:p-5">
                  <div className="flex flex-col md:flex-row items-center gap-5">
                    <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow bg-white flex items-center justify-center shrink-0">
                      {displayedProfileImage ? (
                        <img
                          src={displayedProfileImage}
                          alt="صورة الراقي"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1 w-full">
                      <div className="flex flex-wrap gap-3 mb-3">
                        <Button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="h-11 rounded-xl bg-[#1f6f50] hover:bg-[#195a41] text-white font-bold"
                        >
                          <ImagePlus className="w-4 h-4 ml-2" />
                          {displayedProfileImage ? 'تغيير الصورة' : 'إضافة صورة'}
                        </Button>

                        {(selectedImage || profile.profile_image_url) && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleRemoveSelectedImage}
                            className="h-11 rounded-xl border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 ml-2" />
                            إزالة الصورة
                          </Button>
                        )}

                        {removeCurrentImage && profile.profile_image_url && !selectedImage && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleKeepCurrentImage}
                            className="h-11 rounded-xl"
                          >
                            تراجع عن الإزالة
                          </Button>
                        )}
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                      />

                      <p className="text-sm text-gray-500 leading-7">
                        ارفع صورة شخصية واضحة للراقي. الصيغ المدعومة: JPG, PNG, WEBP
                        والحجم الأقصى {MAX_IMAGE_SIZE_MB}MB.
                      </p>

                      {selectedImage && (
                        <div className="mt-3 text-sm text-gray-700">
                          <span className="font-bold">{selectedImage.name}</span>
                          <span className="text-gray-500 mr-2">
                            ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                      )}

                      {removeCurrentImage && !selectedImage && (
                        <p className="mt-3 text-sm font-bold text-amber-700">
                          سيتم حذف الصورة الحالية عند حفظ التغييرات.
                        </p>
                      )}

                      {imageError && (
                        <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                          {imageError}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* الحقول الأساسية */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">الاسم الكامل</label>
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
                  <label className="text-sm font-bold text-gray-700">البريد الإلكتروني</label>
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
                  <label className="text-sm font-bold text-gray-700">التخصص</label>
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
                  <label className="text-sm font-bold text-gray-700">سنوات الخبرة</label>
                  <Input
                    type="number"
                    min="0"
                    value={form.experience_years}
                    onChange={(e) => handleChange('experience_years', e.target.value)}
                    placeholder="عدد سنوات الخبرة"
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">رقم الهاتف</label>
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
                  <label className="text-sm font-bold text-gray-700">رقم واتساب</label>
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

                {/* الدولة */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    الدولة
                  </label>
                  <select
                    value={form.country_code}
                    onChange={(e) => handleChange('country_code', e.target.value)}
                    className="w-full h-12 px-4 border border-gray-200 rounded-xl text-base bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1f6f50] focus:border-transparent"
                  >
                    <option value="">اختر الدولة</option>
                    {countries.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag_emoji} {c.name_ar}{' '}
                        {c.currency_code ? `(${c.currency_code})` : ''}
                      </option>
                    ))}
                  </select>
                  {country?.currency_code && (
                    <p className="text-xs text-gray-400">
                      العملة الافتراضية:{' '}
                      <span className="font-bold text-[#1f6f50]">
                        {country.currency_code}
                      </span>
                    </p>
                  )}
                </div>

                {/* الولاية (من cities) */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    الولاية أو المنطقة
                  </label>
                  <select
                    value={form.wilaya}
                    onChange={(e) => handleChange('wilaya', e.target.value)}
                    disabled={!form.country_code || citiesLoading}
                    className="w-full h-12 px-4 border border-gray-200 rounded-xl text-base bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1f6f50] focus:border-transparent"
                  >
                    <option value="">
                      {citiesLoading ? 'جاري تحميل الولايات...' : 'اختر الولاية'}
                    </option>
                    {currentCities.map((city) => (
                      <option key={city.id} value={city.name_ar}>
                        {city.name_ar}
                      </option>
                    ))}
                  </select>
                  {form.country_code && currentCities.length === 0 && !loadingGeo && (
                    <p className="text-xs text-amber-600">
                      لا توجد ولايات مسجلة لهذه الدولة
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700">العنوان</label>
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

              {/* حسابات التواصل */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items៦  gap-2 mb-4">
                  <Globe className="w-5 h-5 text-[#1f6f50]" />
                  <h3 className="text-lg font-extrabold text-gray-900">حسابات التواصل الاجتماعي</h3>
                </div>

                <p className="text-sm text-gray-500 mb-4">
                  🔵 فيسبوك: متاح عند الحصول على شارة{' '}
                  <span className="font-bold text-amber-600">التوثيق</span>
                  {'  '}🔒 يوتيوب / انستغرام / تيك توك: متاح عند الحصول على شارة{' '}
                  <span className="font-bold text-amber-600">التمييز</span>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Facebook className="w-4 h-4 text-[#1877F2]" />
                      فيسبوك
                      {facebookLocked && (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          <Lock className="w-3 h-3" />
                          يتطلب التوثيق
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <Input
                        value={form.facebook_url}
                        onChange={(e) => handleChange('facebook_url', e.target.value)}
                        placeholder={facebookLocked ? 'متاح بعد التوثيق' : 'https://facebook.com/...'}
                        disabled={facebookLocked}
                        className={`h-12 rounded-xl ${
                          facebookLocked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''
                        }`}
                      />
                      {facebookLocked && (
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Youtube className="w-4 h-4 text-[#FF0000]" />
                      يوتيوب
                      {featuredLocked && (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          <Lock className="w-3 h-3" />
                          يتطلب التمييز
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <Input
                        value={form.youtube_url}
                        onChange={(e) => handleChange('youtube_url', e.target.value)}
                        placeholder={featuredLocked ? 'متاح بعد التمييز' : 'https://youtube.com/...'}
                        disabled={featuredLocked}
                        className={`h-12 rounded-xl ${
                          featuredLocked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''
                        }`}
                      />
                      {featuredLocked && (
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-[#E4405F]" />
                      انستغرام
                      {featuredLocked && (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          <Lock className="w-3 h-3" />
                          يتطلب التمييز
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <Input
                        value={form.instagram_url}
                        onChange={(e) => handleChange('instagram_url', e.target.value)}
                        placeholder={featuredLocked ? 'متاح بعد التمييز' : 'https://instagram.com/...'}
                        disabled={featuredLocked}
                        className={`h-12 rounded-xl ${
                          featuredLocked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''
                        }`}
                      />
                      {featuredLocked && (
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Music2 className="w-4 h-4 text-black" />
                      تيك توك
                      {featuredLocked && (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          <Lock className="w-3 h-3" />
                          يتطلب التمييز
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <Input
                        value={form.tiktok_url}
                        onChange={(e) => handleChange('tiktok_url', e.target.value)}
                        placeholder={featuredLocked ? 'متاح بعد التمييز' : 'https://tiktok.com/@...'}
                        disabled={featuredLocked}
                        className={`h-12 rounded-xl ${
                          featuredLocked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''
                        }`}
                      />
                      {featuredLocked && (
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
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

            {/* المتجر والمنتجات */}
            <Card className="rounded-3xl border-0 shadow-sm p-6 md:p-8">
              <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-2">المتجر والمنتجات</h2>
                  <p className="text-gray-500 font-medium">
                    أضف منتجاتك أو عدلها لتظهر داخل ملفك الشخصي
                  </p>
                </div>

                {!isFeatured && (
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 text-amber-700 px-4 py-2 text-sm font-bold">
                    <Lock className="w-4 h-4" />
                    المتجر متاح فقط للحسابات المميزة
                  </div>
                )}
              </div>

              {productError && (
                <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                  {productError}
                </div>
              )}

              {productSuccess && (
                <div className="mb-5 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                  {productSuccess}
                </div>
              )}

              {isFeatured ? (
                <div className="space-y-8">
                  {/* نموذج المنتج */}
                  <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-5">
                    <h3 className="text-lg font-extrabold text-gray-900 mb-4">
                      {editingProductId ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">اسم المنتج *</label>
                        <Input
                          value={productForm.name}
                          onChange={(e) => handleProductChange('name', e.target.value)}
                          placeholder="اسم المنتج"
                          className="h-12 rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">السعر</label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min="0"
                            value={productForm.price}
                            onChange={(e) => handleProductChange('price', e.target.value)}
                            placeholder="0"
                            className="h-12 rounded-xl flex-1"
                          />
                          <select
                            value={productForm.currency}
                            onChange={(e) => handleProductChange('currency', e.target.value)}
                            className="h-12 px-3 border border-gray-200 rounded-xl bg-white"
                          >
                            <option value="DZD">DZD</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="SAR">SAR</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <label className="text-sm font-bold text-gray-700">الوصف</label>
                      <textarea
                        value={productForm.description}
                        onChange={(e) => handleProductChange('description', e.target.value)}
                        rows={8}
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1f6f50] focus:border-transparent resize-none font-mono text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">الترتيب</label>
                        <Input
                          type="number"
                          value={productForm.sort_order}
                          onChange={(e) => handleProductChange('sort_order', e.target.value)}
                          placeholder="0"
                          className="h-12 rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">الحالة</label>
                        <select
                          value={productForm.is_active ? 'true' : 'false'}
                          onChange={(e) =>
                            handleProductChange('is_active', e.target.value === 'true')
                          }
                          className="w-full h-12 px-4 border border-gray-200 rounded-xl bg-white"
                        >
                          <option value="true">نشط</option>
                          <option value="false">غير نشط</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="text-sm font-bold text-gray-700 block mb-3">
                        صورة المنتج
                      </label>
                      <div className="flex flex-col md:flex-row items-center gap-5">
                        <div className="w-28 h-28 rounded-xl overflow-hidden border-2 border-gray-200 bg-white flex items-center justify-center shrink-0">
                          {displayedProductImage ? (
                            <img
                              src={displayedProductImage}
                              alt="صورة المنتج"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <PackagePlus className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 w-full">
                          <div className="flex flex-wrap gap-3 mb-3">
                            <Button
                              type="button"
                              onClick={() => productImageInputRef.current?.click()}
                              className="h-11 rounded-xl bg-[#1f6f50] hover:bg-[#195a41] text-white font-bold"
                            >
                              <ImagePlus className="w-4 h-4 ml-2" />
                              {displayedProductImage ? 'تغيير الصورة' : 'إضافة صورة'}
                            </Button>
                            {(selectedProductImage ||
                              products.find((p) => p.id === editingProductId)?.image_url) && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setSelectedProductImage(null);
                                  setRemoveProductImage(true);
                                  if (productImageInputRef.current)
                                    productImageInputRef.current.value = '';
                                }}
                                className="h-11 rounded-xl border-red-300 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 ml-2" />
                                إزالة الصورة
                              </Button>
                            )}
                          </div>
                          <input
                            ref={productImageInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            onChange={handleProductImageChange}
                            className="hidden"
                          />
                          <p className="text-sm text-gray-500">
                            الصيغ المدعومة: JPG, PNG, WEBP. الحجم الأقصى 5MB.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={handleSaveProduct}
                        disabled={productSaving}
                        className="h-12 px-6 rounded-xl bg-[#1f6f50] hover:bg-[#195a41] text-white font-extrabold disabled:opacity-70"
                      >
                        {productSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                            جاري الحفظ...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 ml-2" />
                            {editingProductId ? 'تحديث المنتج' : 'إضافة المنتج'}
                          </>
                        )}
                      </Button>

                      {editingProductId && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={resetProductForm}
                          className="h-12 px-6 rounded-xl"
                        >
                          <X className="w-4 h-4 ml-2" />
                          إلغاء التعديل
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* قائمة المنتجات */}
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-900 mb-4">قائمة المنتجات</h3>
                    {productsLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-[#1f6f50]" />
                      </div>
                    ) : products.length === 0 ? (
                      <div className="text-center py-12 rounded-2xl border border-dashed border-gray-300">
                        <PackagePlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">
                          لا توجد منتجات مضافة بعد
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {products.map((product) => (
                          <div
                            key={product.id}
                            className="rounded-2xl border border-gray-200 bg-white p-4 flex gap-4"
                          >
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <PackagePlus className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="font-bold text-gray-900 truncate">
                                    {product.name}
                                  </h4>
                                  <p className="text-sm text-[#1f6f50] font-bold mt-1">
                                    {product.price != null
                                      ? `${product.price} ${product.currency}`
                                      : 'غير محدد'}
                                  </p>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditProduct(product)}
                                    className="h-8 w-8 p-0 rounded-lg"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="h-8 w-8 p-0 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                                {product.description}
                              </p>
                              {!product.is_active && (
                                <span className="inline-block mt-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                  غير نشط
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 rounded-2xl border border-dashed border-amber-200 bg-amber-50/50">
                  <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    المتجر غير متاح
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    خاصية المتجر متاحة فقط للحسابات المميزة. تواصل مع الإدارة للترقية.
                  </p>
                </div>
              )}
            </Card>




            {/* نافذة حذف الحساب */}
            {showDeleteModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                <Card className="w-full max-w-md rounded-3xl border-0 shadow-xl p-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-extrabold text-gray-900 mb-2">
                      حذف الحساب نهائياً
                    </h3>
                    <p className="text-gray-500 text-sm">
                      هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك ومنتجاتك نهائياً.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">
                        اكتب "حذف" للتأكيد
                      </label>
                      <Input
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="حذف"
                        className="h-12 rounded-xl text-center font-bold"
                      />
                    </div>

                    {error && (
                      <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                        {error}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        onClick={handleDeleteAccount}
                        disabled={deleting}
                        className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold disabled:opacity-70"
                      >
                        {deleting ? (
                          <>
                            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                            جاري الحذف...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 ml-2" />
                            نعم، احذف الحساب
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowDeleteModal(false);
                          setDeleteConfirmText('');
                          setError('');
                        }}
                        className="flex-1 h-12 rounded-xl"
                      >
                        إلغاء
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
  

    {/* قسم الاشتراك للرقاة المتميزين */}
    <section className="relative overflow-hidden bg-[#0a4d2e] py-14 px-4 border-t border-white/10 mt-10">
      {/* تأثيرات خلفية */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 right-10 h-64 w-64 rounded-full bg-[#25D366]/10 blur-3xl" />
        <div className="absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-[#f1d27b]/10 blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto">
        <div className="rounded-[2rem] border border-white/15 bg-white/10 p-7 text-center shadow-2xl backdrop-blur-md md:p-10">
          {/* الشارة */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#f1d27b]/30 bg-[#f1d27b]/10 px-5 py-2 text-xs font-extrabold text-[#f1d27b]">
            <Sparkles className="h-4 w-4" />
            فرصة مميزة للرقاة
          </div>

          {/* العنوان */}
          <h2 className="mb-4 text-3xl font-extrabold leading-tight text-white md:text-4xl">
            انضم إلى الرقاة المتميزين
          </h2>

          {/* النص */}
          <p className="mx-auto mb-8 max-w-2xl text-base leading-8 text-white/75 md:text-lg">
            طوّر حضورك داخل المنصة، واحصل على ظهور أفضل ومزايا حصرية تساعدك
            على الوصول إلى المزيد من الزوار وبناء ثقة أكبر مع جمهورك.
          </p>

          {/* الرابط */}
          <a
            href="#/offers"
            className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-gradient-to-l from-[#f1d27b] to-[#d8aa3e] px-8 text-base font-extrabold text-[#163a2b] shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:brightness-105"
            aria-label="الانتقال إلى صفحة الاشتراكات والعروض"
          >
            <Sparkles className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
            اكتشف عروض الاشتراك
            <ArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
          </a>

          {/* نص أسفل الرابط */}
          <p className="mt-5 text-sm text-white/50">
            اختر الباقة المناسبة وابدأ بتطوير حسابك اليوم
          </p>
        </div>
      </div>
    </section>
  </div>
);

}
