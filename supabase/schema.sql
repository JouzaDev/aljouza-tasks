-- ==============================================================================
-- سكيما قاعدة بيانات نظام إدارة مهام منصة الجوزاء (taska.aljouza.sa)
-- ==============================================================================

-- 1. جدول الملفات الشخصية
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('manager', 'employee')),
  job_title TEXT,
  avatar_url TEXT,
  avatar_badge TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- دالة التحقق من صلاحية المدير
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

-- 2. جدول المشاريع المستقلة
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('planning', 'active', 'completed', 'on_hold')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  manager_id UUID REFERENCES public.profiles(id),
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
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. جدول شركاء النجاح
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  logo_letter TEXT,
  description TEXT,
  mechanism TEXT, -- آلية وكيفية الشراكة
  goal TEXT,      -- هدف الشراكة
  effectiveness_rate INTEGER NOT NULL DEFAULT 80 CHECK (effectiveness_rate BETWEEN 0 AND 100), -- مقياس فاعلية الشراكة
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  actions_done TEXT[], -- مخرجات وأعمال تمت
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. جدول المهام (مربوط بالموظف والهدف والمشروع والشريك)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID NOT NULL REFERENCES public.profiles(id),
  goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL,
  phase TEXT NOT NULL DEFAULT 'planning' CHECK (phase IN ('planning', 'execution', 'review', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'waiting_review', 'done')),
  due_date TIMESTAMPTZ,
  manager_approved BOOLEAN NOT NULL DEFAULT FALSE,
  symbol TEXT,
  is_starred BOOLEAN NOT NULL DEFAULT FALSE,
  progress_pct NUMERIC DEFAULT 10.0,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. جدول سجل النشاط
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- تفعيل RLS على جميع الجداول
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- سياسات profiles
CREATE POLICY "Profiles view policy" ON public.profiles
  FOR SELECT USING (public.is_manager() OR id = auth.uid());
CREATE POLICY "Managers manage profiles" ON public.profiles
  FOR ALL USING (public.is_manager());

-- سياسات projects
CREATE POLICY "View projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Managers manage projects" ON public.projects FOR ALL USING (public.is_manager());

-- سياسات goals
CREATE POLICY "View goals" ON public.goals FOR SELECT USING (true);
CREATE POLICY "Managers manage goals" ON public.goals FOR ALL USING (public.is_manager());

-- سياسات partners
CREATE POLICY "View partners" ON public.partners FOR SELECT USING (true);
CREATE POLICY "Managers manage partners" ON public.partners FOR ALL USING (public.is_manager());

-- سياسات tasks
CREATE POLICY "Managers manage all tasks" ON public.tasks FOR ALL USING (public.is_manager());
CREATE POLICY "Employees view own tasks" ON public.tasks FOR SELECT USING (assigned_to = auth.uid());
CREATE POLICY "Employees update own task status" ON public.tasks
  FOR UPDATE USING (assigned_to = auth.uid()) WITH CHECK (assigned_to = auth.uid());

-- سياسات activity_logs
CREATE POLICY "Managers view logs" ON public.activity_logs FOR ALL USING (public.is_manager());
CREATE POLICY "Employees logs policy" ON public.activity_logs FOR ALL
  USING (EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = activity_logs.task_id AND tasks.assigned_to = auth.uid()));
