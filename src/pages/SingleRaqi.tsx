// ============================================================
// دليل الرقاة - Single Raqi Page (Details + Reviews)
// ============================================================
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getRaqiBySlug, getReviews, addReview, mockWilayas } from '@/lib/supabase';
import type { Raqi, Review } from '@/types';
import {
  Award, Phone, MessageCircle, Star, ChevronRight,
  Shield, Calendar, Loader2, Send, User
} from 'lucide-react';

export default function SingleRaqi() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [raqi, setRaqi] = useState<Raqi | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', reviewer_name: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const raqiData = await getRaqiBySlug(slug);
        if (raqiData) {
          setRaqi(raqiData);
          const reviewsData = await getReviews(raqiData.id);
          setReviews(reviewsData);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!raqi || !reviewForm.reviewer_name.trim()) return;

    setSubmitting(true);
    try {
      await addReview({
        raqi_id: raqi.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        reviewer_name: reviewForm.reviewer_name,
      });
      // Refresh reviews
      const updated = await getReviews(raqi.id);
      setReviews(updated);
      setSubmitted(true);
      setShowForm(false);
      setReviewForm({ rating: 5, comment: '', reviewer_name: '' });
    } catch (err) {
      console.error('Error adding review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getWilayaName = (code: string) => {
    return mockWilayas.find(w => w.code === code)?.name_ar || code;
  };

  const formatPhone = (phone: string | null): string => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) return '213' + cleaned.slice(1);
    return cleaned;
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-[#1f6f50]" />
      </div>
    );
  }

  if (!raqi) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-10 text-center max-w-md">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">الراقي غير موجود</h2>
          <p className="text-gray-500 mb-6">لم يتم العثور على الراقي المطلوب.</p>
          <Button onClick={() => navigate('/roqat')} className="bg-[#1f6f50] hover:bg-[#18593f]">
            العودة للدليل
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div
        className="py-10 px-4"
        style={{
          background: 'linear-gradient(180deg, #13693e 0%, #115a35 320px, #f7f8f7 320px, #f7f8f7 100%)',
        }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <Link
            to="/roqat"
            className="inline-flex items-center gap-2 text-white/80 text-sm mb-6 hover:text-[#f3d67a] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
            العودة إلى دليل الرقاة
          </Link>

          {/* Hero Content */}
          <div className="text-center text-white mb-8">
            <div className="inline-flex items-center justify-center px-5 py-2 rounded-full
              border border-[#d8b24c]/80 bg-white/[0.07] text-[#f1d27b] text-sm font-extrabold mb-4">
              دليل الرقاة المعتمدين
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3">صفحة الراقي الشرعي</h1>
            <p className="text-white/90 text-base max-w-2xl mx-auto">
              هذه الصفحة تعرض البيانات الأساسية للراقي ووسائل التواصل معه بعد المراجعة والاعتماد داخل الدليل.
            </p>
          </div>

          {/* Main Card */}
          <Card className="rounded-3xl border border-gray-200 shadow-xl overflow-hidden bg-white">
            <div className="p-6 md:p-8 space-y-6">
              {/* Name + Verified */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#163a2b]">
                  {raqi.full_name}
                </h2>
                {raqi.verified_badge && (
                  <span className="shrink-0 inline-flex items-center gap-2 bg-gradient-to-br from-[#ecfdf3] to-[#dff8ea]
                    text-[#166534] border border-[#bfe6cf] rounded-full px-5 py-2.5 text-sm font-extrabold
                    shadow-sm">
                    <Award className="w-4 h-4" />
                    موثّق
                  </span>
                )}
              </div>

              {/* Rating */}
              {reviews.length > 0 && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Star className="w-5 h-5 text-[#d6b14a] fill-[#d6b14a]" />
                  <span className="font-bold text-[#163a2b]">{averageRating}</span>
                  <span className="text-sm">({reviews.length} تقييم)</span>
                </div>
              )}

              {/* Meta Grid */}
              <div className="border-t border-gray-100 divide-y divide-dashed divide-gray-200">
                {raqi.speciality && (
                  <div className="flex justify-between items-start gap-4 py-4">
                    <strong className="text-[#163a2b] font-extrabold shrink-0">التخصص:</strong>
                    <span className="text-gray-700 text-left">{raqi.speciality}</span>
                  </div>
                )}
                <div className="flex justify-between items-start gap-4 py-4">
                  <strong className="text-[#163a2b] font-extrabold shrink-0">الولاية:</strong>
                  <span className="text-gray-700">{getWilayaName(raqi.wilaya)}</span>
                </div>
                {raqi.address && (
                  <div className="flex justify-between items-start gap-4 py-4">
                    <strong className="text-[#163a2b] font-extrabold shrink-0">العنوان:</strong>
                    <span className="text-gray-700">{raqi.address}</span>
                  </div>
                )}
                {raqi.experience_years > 0 && (
                  <div className="flex justify-between items-start gap-4 py-4">
                    <strong className="text-[#163a2b] font-extrabold shrink-0">سنوات الخبرة:</strong>
                    <span className="text-gray-700">{raqi.experience_years} سنة</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {raqi.whatsapp && (
                  <a
                    href={`https://wa.me/${formatPhone(raqi.whatsapp)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 min-h-14 rounded-2xl
                      bg-gradient-to-br from-[#25d366] to-[#128c7e] text-white font-extrabold
                      text-base shadow-lg shadow-[#25d366]/20 hover:-translate-y-0.5 transition-all"
                  >
                    <MessageCircle className="w-5 h-5" />
                    التواصل عبر واتساب
                  </a>
                )}
                {raqi.phone && (
                  <a
                    href={`tel:${formatPhone(raqi.phone)}`}
                    className="inline-flex items-center justify-center gap-2 min-h-14 rounded-2xl
                      bg-white text-[#1f6f50] border border-[#cfe0d8] font-extrabold
                      text-base hover:bg-gray-50 transition-all"
                  >
                    <Phone className="w-5 h-5" />
                    اتصال مباشر
                  </a>
                )}
              </div>
            </div>
          </Card>

          {/* Bio Section */}
          {raqi.bio && (
            <Card className="mt-6 rounded-3xl border border-gray-200 shadow-lg p-6 md:p-8 bg-white">
              <h3 className="text-xl font-extrabold text-[#163a2b] mb-4">نبذة عن الراقي</h3>
              <div className="bg-[#fafcfb] border border-[#edf2ee] rounded-2xl p-5 text-gray-600 leading-loose text-sm md:text-base">
                {raqi.bio}
              </div>
            </Card>
          )}

          {/* Reviews Section */}
          <Card className="mt-6 rounded-3xl border border-gray-200 shadow-lg p-6 md:p-8 bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-extrabold text-[#163a2b]">التقييمات والتعليقات</h3>
              <span className="text-sm text-gray-500">({reviews.length} تقييم)</span>
            </div>

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <div className="space-y-4 mb-6">
                {reviews.map(review => (
                  <div key={review.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-400" />
                        <span className="font-bold text-gray-800 text-sm">{review.reviewer_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'text-[#d6b14a] fill-[#d6b14a]' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                    )}
                    <p className="text-gray-400 text-xs mt-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(review.created_at).toLocaleDateString('ar-DZ')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-6 mb-6">لا يوجد تقييمات بعد. كن أول من يقيم.</p>
            )}

            {/* Add Review Button / Form */}
            {!showForm && !submitted && (
              <Button
                onClick={() => setShowForm(true)}
                className="w-full bg-gradient-to-br from-[#1f6f50] to-[#15523b] hover:from-[#18593f]
                  text-white font-bold py-5 rounded-xl"
              >
                <Star className="w-4 h-4 mr-2" />
                أضف تقييمك
              </Button>
            )}

            {submitted && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <p className="text-green-700 font-bold">شكراً! تم إرسال تقييمك بنجاح.</p>
                <Button
                  variant="ghost"
                  onClick={() => setSubmitted(false)}
                  className="text-green-600 mt-2"
                >
                  إضافة تقييم آخر
                </Button>
              </div>
            )}

            {showForm && (
              <form onSubmit={handleSubmitReview} className="space-y-4 border-t border-gray-100 pt-6">
                <h4 className="font-bold text-gray-800">أضف تقييمك</h4>

                {/* Rating */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">التقييم</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${star <= reviewForm.rating
                            ? 'text-[#d6b14a] fill-[#d6b14a]'
                            : 'text-gray-300'}`}
                        />
                      </button>
                    ))}
                    <span className="text-sm text-gray-500 mr-2">{reviewForm.rating} من 5</span>
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">اسمك</label>
                  <Input
                    value={reviewForm.reviewer_name}
                    onChange={e => setReviewForm(prev => ({ ...prev, reviewer_name: e.target.value }))}
                    placeholder="اكتب اسمك..."
                    required
                    className="h-12 rounded-xl"
                  />
                </div>

                {/* Comment */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">تعليقك (اختياري)</label>
                  <Textarea
                    value={reviewForm.comment}
                    onChange={e => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="اكتب تعليقك هنا..."
                    rows={4}
                    className="rounded-xl resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={submitting || !reviewForm.reviewer_name.trim()}
                    className="flex-1 bg-gradient-to-br from-[#1f6f50] to-[#15523b] hover:from-[#18593f]
                      text-white font-bold py-5 rounded-xl disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        إرسال التقييم
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="px-6 rounded-xl"
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            )}
          </Card>

          {/* Back Button */}
          <div className="text-center mt-8">
            <Link
              to="/roqat"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#166534]
                border border-[#d8e7de] rounded-full font-bold shadow-lg
                hover:border-[#b9d7c5] transition-all"
            >
              <ChevronRight className="w-4 h-4" />
              العودة إلى صفحة الرقاة
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
