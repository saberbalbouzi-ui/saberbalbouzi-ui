-- ============================================================
-- دليل الرقاة - Supabase Schema (MVP)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. جدول الولايات الجزائرية (58 ولاية)
-- ============================================================
CREATE TABLE IF NOT EXISTS wilayas (
    id      SERIAL PRIMARY KEY,
    code    TEXT UNIQUE NOT NULL,
    name_ar TEXT NOT NULL
);

-- Insert Algeria's 58 Wilayas
INSERT INTO wilayas (code, name_ar) VALUES
('01', 'أدرار'),
('02', 'الشلف'),
('03', 'الأغواط'),
('04', 'أم البواقي'),
('05', 'باتنة'),
('06', 'بجاية'),
('07', 'بسكرة'),
('08', 'بشار'),
('09', 'البليدة'),
('10', 'البويرة'),
('11', 'تمنراست'),
('12', 'تبسة'),
('13', 'تلمسان'),
('14', 'تيارت'),
('15', 'تيزي وزو'),
('16', 'الجزائر'),
('17', 'الجلفة'),
('18', 'جيجل'),
('19', 'سطيف'),
('20', 'سعيدة'),
('21', 'سكيكدة'),
('22', 'سيدي بلعباس'),
('23', 'عنابة'),
('24', 'قالمة'),
('25', 'قسنطينة'),
('26', 'المدية'),
('27', 'مستغانم'),
('28', 'المسيلة'),
('29', 'معسكر'),
('30', 'ورقلة'),
('31', 'وهران'),
('32', 'البيض'),
('33', 'إليزي'),
('34', 'برج بوعريريج'),
('35', 'بومرداس'),
('36', 'الطارف'),
('37', 'تندوف'),
('38', 'تيسمسيلت'),
('39', 'الوادي'),
('40', 'خنشلة'),
('41', 'سوق أهراس'),
('42', 'تيبازة'),
('43', 'ميلة'),
('44', 'عين الدفلى'),
('45', 'النعامة'),
('46', 'عين تموشنت'),
('47', 'غرداية'),
('48', 'غليزان'),
('49', 'تيميمون'),
('50', 'برج باجي مختار'),
('51', 'أولاد جلال'),
('52', 'بني عباس'),
('53', 'عين صالح'),
('54', 'عين قزام'),
('55', 'تقرت'),
('56', 'جانت'),
('57', 'المغير'),
('58', 'المنيعة')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- 2. جدول الرقاة (الجدول الرئيسي)
-- ============================================================
CREATE TABLE IF NOT EXISTS raqis (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            TEXT UNIQUE NOT NULL,
    full_name       TEXT NOT NULL,
    speciality      TEXT,
    phone           TEXT,
    whatsapp        TEXT,
    wilaya          TEXT NOT NULL,
    address         TEXT,
    experience_years INTEGER DEFAULT 0,
    bio             TEXT,
    verified_badge  BOOLEAN DEFAULT FALSE,
    status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. جدول التقييمات والتعليقات
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raqi_id         UUID REFERENCES raqis(id) ON DELETE CASCADE,
    rating          INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT,
    reviewer_name   TEXT NOT NULL DEFAULT 'زائر',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. Row Level Security (RLS) Policies
-- ============================================================

-- Enable RLS
ALTER TABLE raqis ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wilayas ENABLE ROW LEVEL SECURITY;

-- Wilayas: public read
CREATE POLICY "wilayas_public_read" ON wilayas
    FOR SELECT USING (true);

-- Raqis: public can only read approved raqis
CREATE POLICY "raqis_public_read" ON raqis
    FOR SELECT USING (status = 'approved');

-- Raqis: public can insert (new registrations go to pending)
CREATE POLICY "raqis_public_insert" ON raqis
    FOR INSERT WITH CHECK (status = 'pending');

-- Reviews: public read
CREATE POLICY "reviews_public_read" ON reviews
    FOR SELECT USING (true);

-- Reviews: public insert
CREATE POLICY "reviews_public_insert" ON reviews
    FOR INSERT WITH CHECK (true);

-- ============================================================
-- 5. Function to update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_raqis_updated_at
    BEFORE UPDATE ON raqis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 6. Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_raqis_status ON raqis(status);
CREATE INDEX IF NOT EXISTS idx_raqis_wilaya ON raqis(wilaya);
CREATE INDEX IF NOT EXISTS idx_raqis_slug ON raqis(slug);
CREATE INDEX IF NOT EXISTS idx_reviews_raqi_id ON reviews(raqi_id);

-- ============================================================
-- 7. Sample Data (for testing)
-- ============================================================
INSERT INTO raqis (slug, full_name, speciality, phone, whatsapp, wilaya, address, experience_years, bio, verified_badge, status) VALUES
('ahmed-benali', 'أحمد بن علي', 'الرقية الشرعية وعلاج السحر', '0555123456', '0555123456', '16', 'الجزائر العاصمة - حي محمدي', 15, 'راقٍ شرعي معتمد، حاصل على إجازة في القراءات، يعمل في مجال الرقية الشرعية منذ 15 عاماً، يعالج حالات السحر والعين والحسد والمس على وفق الكتاب والسنة.', true, 'approved'),
('khaled-merabet', 'خالد مرابط', 'الرقية الشرعية وعلاج المس', '0666789012', '0666789012', '31', 'وهران - حي السلام', 10, 'متخصص في علاج المس والسحر والعين والحسد باستخدام القرآن الكريم والسنة النبوية.', true, 'approved'),
('youssef-kadi', 'يوسف القاضي', 'الرقية الشرعية والتعليم', '0777123456', '0777123456', '19', 'سطيف - حي الأمير عبد القادر', 8, 'راقٍ شرعي وخطيب مسجد، يجمع بين الرقية الشرعية والتعليم الشرعي.', false, 'approved'),
('omar-fares', 'عمر فارس', 'الرقية الشرعية', '0555567890', '0555567890', '25', 'قسنطينة - حي زواغي', 20, 'راقٍ شرعي كبير بخبرة 20 عاماً في علاج حالات السحر والمس والعين.', true, 'approved'),
('amine-haddad', 'أمين حداد', 'الرقية الشرعية وعلاج العين', '0666234567', '0666234567', '06', 'بجاية - حي الأندلس', 5, 'راقٍ شاب متخصص في علاج العين والحسد والسحر الشرعي.', false, 'approved')
ON CONFLICT (slug) DO NOTHING;

-- Sample reviews
INSERT INTO reviews (raqi_id, rating, comment, reviewer_name) 
SELECT id, 5, 'راقٍ ممتاز ومجرب، شفيت بفضل الله ثم بدعائه', 'محمد' 
FROM raqis WHERE slug = 'ahmed-benali'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (raqi_id, rating, comment, reviewer_name) 
SELECT id, 5, 'شخص محترم وخلوق، الرقية عنده مؤثرة بإذن الله', 'فاطمة' 
FROM raqis WHERE slug = 'ahmed-benali'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (raqi_id, rating, comment, reviewer_name) 
SELECT id, 4, 'جزاه الله خيراً، أعانني كثيراً', 'أحمد' 
FROM raqis WHERE slug = 'khaled-merabet'
ON CONFLICT DO NOTHING;
