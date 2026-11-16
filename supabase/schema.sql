-- ==============================================================================
-- سكيما وتحديث قاعدة بيانات نظام إدارة مهام منصة الجوزاء (taska.aljouza.sa) - الإصدار 2.0
-- صُممت لتحديث الجداول الحالية بأمان وإضافة الجداول والأعمدة الجديدة دون أي أخطاء
-- ==============================================================================

-- 1. تحديث جدول الملفات الشخصية (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('manager', 'employee')),
  job_title TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- فك قيد الارتباط بـ auth.users لتمكين إدخال ملفات الفريق وحساباتهم بمرونة تامة
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- إضافة الأعمدة الجديدة بأمان إن كان الجدول منشأ سابقاً
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_badge TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- دالة التحقق من صلاحية المدير بأمان
CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'manager'
  );
$$;

-- 2. جدول المشاريع المستقلة (جديد)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('planning', 'active', 'completed', 'on_hold')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. جدول الأهداف المستقبلية (OKRs)
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  horizon TEXT NOT NULL DEFAULT 'future' CHECK (horizon IN ('current', 'future')),
  phase_priority TEXT NOT NULL DEFAULT 'high' CHECK (phase_priority IN ('critical', 'high', 'medium', 'low')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. جدول شركاء النجاح مع مقياس الفاعلية (جديد ومطور)
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  logo_letter TEXT,
  description TEXT,
  mechanism TEXT, -- آلية وكيفية الشراكة
  goal TEXT,      -- هدف الشراكة
  effectiveness_rate INTEGER NOT NULL DEFAULT 80 CHECK (effectiveness_rate BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  actions_done TEXT[], -- المنجزات المسندة للشريك
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. جدول المهام (مربوط بالموظف والهدف والمشروع والشريك)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID NOT NULL REFERENCES public.profiles(id),
  goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  phase TEXT NOT NULL DEFAULT 'planning' CHECK (phase IN ('planning', 'execution', 'review', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'waiting_review', 'done')),
  due_date TIMESTAMPTZ,
  manager_approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ترقية جدول tasks بإضافة الأعمدة الجديدة بأمان إن كان الجدول منشأ سابقاً
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS symbol TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS is_starred BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS progress_pct NUMERIC DEFAULT 10.0;

-- 6. جدول سجل النشاط والتعليقات
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- تفعيل سياسات الأمان (Row Level Security - RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- سياسات profiles (القراءة للجميع لظهور أسماء الزملاء والمهام، والتعديل للمدير)
DROP POLICY IF EXISTS "Profiles view policy" ON public.profiles;
CREATE POLICY "Profiles view policy" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Managers manage profiles" ON public.profiles;
CREATE POLICY "Managers manage profiles" ON public.profiles FOR ALL USING (public.is_manager());

DROP POLICY IF EXISTS "Allow anon reading of profiles" ON public.profiles;
CREATE POLICY "Allow anon reading of profiles" ON public.profiles FOR SELECT USING (true);

-- سياسات projects
DROP POLICY IF EXISTS "View projects" ON public.projects;
CREATE POLICY "View projects" ON public.projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Managers manage projects" ON public.projects;
CREATE POLICY "Managers manage projects" ON public.projects FOR ALL USING (public.is_manager());

-- سياسات goals
DROP POLICY IF EXISTS "View goals" ON public.goals;
CREATE POLICY "View goals" ON public.goals FOR SELECT USING (true);

DROP POLICY IF EXISTS "Managers manage goals" ON public.goals;
CREATE POLICY "Managers manage goals" ON public.goals FOR ALL USING (public.is_manager());

-- سياسات partners
DROP POLICY IF EXISTS "View partners" ON public.partners;
CREATE POLICY "View partners" ON public.partners FOR SELECT USING (true);

DROP POLICY IF EXISTS "Managers manage partners" ON public.partners;
CREATE POLICY "Managers manage partners" ON public.partners FOR ALL USING (public.is_manager());

-- سياسات tasks
DROP POLICY IF EXISTS "Managers manage all tasks" ON public.tasks;
CREATE POLICY "Managers manage all tasks" ON public.tasks FOR ALL USING (public.is_manager());

DROP POLICY IF EXISTS "Employees view own tasks" ON public.tasks;
CREATE POLICY "Employees view own tasks" ON public.tasks FOR SELECT USING (assigned_to = auth.uid());

DROP POLICY IF EXISTS "Employees update own task status" ON public.tasks;
CREATE POLICY "Employees update own task status" ON public.tasks
  FOR UPDATE USING (assigned_to = auth.uid()) WITH CHECK (assigned_to = auth.uid());

-- سياسات activity_logs
DROP POLICY IF EXISTS "Managers view logs" ON public.activity_logs;
CREATE POLICY "Managers view logs" ON public.activity_logs FOR ALL USING (public.is_manager());

DROP POLICY IF EXISTS "Employees logs policy" ON public.activity_logs;
CREATE POLICY "Employees logs policy" ON public.activity_logs FOR ALL
  USING (EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = activity_logs.task_id AND tasks.assigned_to = auth.uid()));

-- ==============================================================================
-- البيانات الأولية لفريق منصة الجوزاء (Seed Data)
-- ==============================================================================

-- 1. إدخال أو تحديث الملفات الشخصية لفريق العمل
INSERT INTO public.profiles (id, full_name, email, role, job_title, avatar_badge)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'جوزاء', 'jouza@aljouza.sa', 'manager', 'مدير عام المنصة', '👑'),
  ('22222222-2222-2222-2222-222222222222', 'محمد', 'mohammed@aljouza.sa', 'employee', 'أخصائي تطوير وعلاقات', '💼'),
  ('33333333-3333-3333-3333-333333333333', 'ريهام', 'reham@aljouza.sa', 'employee', 'منسقة برامج وفعاليات', '🎯'),
  ('44444444-4444-4444-4444-444444444444', 'دينا', 'dina@aljouza.sa', 'employee', 'مسؤولة محتوى وإعلام', '🎨')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  job_title = EXCLUDED.job_title,
  avatar_badge = EXCLUDED.avatar_badge;

-- 2. إدخال المشاريع المستقلة
INSERT INTO public.projects (id, title, description, status, progress, manager_id, due_date)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'تطوير المنصة الرقمية للجوزاء 2026', 'إعادة هيكلة بنية النظام البرمجية وتحسين تجربة المستفيدين.', 'active', 75, '11111111-1111-1111-1111-111111111111', CURRENT_DATE + INTERVAL '45 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'معسكر الجوزاء للريادة والابتكار', 'مشروع تدريبي مكثف يشمل 4 مسارات تخصصية بالتعاون مع الشركاء.', 'active', 50, '11111111-1111-1111-1111-111111111111', CURRENT_DATE + INTERVAL '60 days')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  progress = EXCLUDED.progress;

-- 3. إدخال الأهداف المستقبلية
INSERT INTO public.goals (id, title, description, horizon, phase_priority, progress, target_date, status, created_by)
VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'تدريب وتأهيل 500 مستفيد خلال الربع الأول', 'تطوير المحتوى التفاعلي وتقديم ورش العمل التخصصية.', 'future', 'critical', 65, CURRENT_DATE + INTERVAL '25 days', 'active', '11111111-1111-1111-1111-111111111111'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'توسيع شبكة الشركاء وتوقيع 5 مذكرات تفاهم', 'بناء شراكات استراتيجية فاعلة مع جهات تعليمية وحكومية.', 'future', 'high', 40, CURRENT_DATE + INTERVAL '45 days', 'active', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  progress = EXCLUDED.progress;

-- 4. إدخال شركاء النجاح مع مقياس الفاعلية
INSERT INTO public.partners (id, name, logo_letter, description, mechanism, goal, effectiveness_rate, status, actions_done)
VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'أكاديمية طويق', 'ط', 'شريك تقني لتقديم المعسكرات والبرامج المتقدمة.', 'تنظيم معسكر تدريبي فصلي، استضافة ورش عمل، ومنح شهادات.', 'تأهيل 200 متدرب في الذكاء الاصطناعي.', 92, 'active', ARRAY['اعتماد الحقائب التدريبية', 'تجهيز قاعات المعسكر']),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'جامعة الملك سعود', 'س', 'شريك أكاديمي للربط المعرفي وإتاحة الفرص التدريبية.', 'مشاركة بجناح تعريفي سنوي، وتنسيق جلسات إرشاد مهني.', 'ربط مخرجات التعليم باحتياجات سوق العمل.', 85, 'active', ARRAY['توقيع مذكرة التفاهم الأولية'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  effectiveness_rate = EXCLUDED.effectiveness_rate,
  actions_done = EXCLUDED.actions_done;

-- 5. إدخال عينة المهام المربوطة
INSERT INTO public.tasks (id, title, description, assigned_to, goal_id, project_id, partner_id, phase, priority, status, due_date, manager_approved, symbol, created_by)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'إعداد جدول الاجتماعات مع ممثلي جامعة الملك سعود', 'التواصل لتحديد المحاور ومواعيد الورش للجناح التعريفي لملتقى مهارات المستقبل 2026.', '22222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'planning', 'urgent', 'in_progress', CURRENT_DATE + INTERVAL '3 days', FALSE, 'B', '11111111-1111-1111-1111-111111111111'),
  ('10000000-0000-0000-0000-000000000002', 'اعتماد قائمة المحاضرين لمعسكر ريادة الأعمال مع طويق', 'تم التواصل مع 4 مدربين وجمع السير الذاتية وحقائب التدريب وبانتظار اعتماد الأستاذة جوزاء.', '33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'review', 'high', 'waiting_review', CURRENT_DATE + INTERVAL '2 days', FALSE, 'V', '11111111-1111-1111-1111-111111111111'),
  ('10000000-0000-0000-0000-000000000003', 'تصميم ونشر بوسترات الفعالية وهوية الدومين taska.aljouza.sa', 'تجهيز تصاميم الإطلاق لموقع المهام ونشرها عبر الحسابات الرسمية لمنصة الجوزاء.', '44444444-4444-4444-4444-444444444444', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'execution', 'medium', 'in_progress', CURRENT_DATE + INTERVAL '5 days', FALSE, 'A', '11111111-1111-1111-1111-111111111111'),
  ('10000000-0000-0000-0000-000000000004', 'المراجعة الإدارية الشاملة لمؤشرات الأداء الربيعية', 'مراجعة نسب تقدم الأهداف المستقبلية وتقييم أداء الشركاء من قبل الإدارة العامة.', '11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'closed', 'high', 'done', CURRENT_DATE - INTERVAL '1 days', TRUE, 'J', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  status = EXCLUDED.status,
  manager_approved = EXCLUDED.manager_approved;
