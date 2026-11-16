-- ==============================================================================
-- سكيما قاعدة بيانات نظام إدارة مهام منصة الجوزاء (Aljouza Tasks)
-- قم بتشغيل هذا السكريبت في Supabase SQL Editor
-- ==============================================================================

-- 1. جدول الملفات الشخصية (مرتبط بـ Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('manager', 'employee')),
  job_title TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- دالة مساعدة للتحقق من صلاحية المدير بأمان
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

-- 2. جدول الأهداف الحالية والمستقبلية (OKRs)
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  horizon TEXT NOT NULL DEFAULT 'current' CHECK (horizon IN ('current', 'future')),
  phase_priority TEXT NOT NULL DEFAULT 'medium' CHECK (phase_priority IN ('critical', 'high', 'medium', 'low')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. جدول البرامج والدورات والمشاركات مع الشركاء
CREATE TABLE IF NOT EXISTS public.partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_name TEXT NOT NULL,
  program_title TEXT NOT NULL,
  program_type TEXT NOT NULL CHECK (program_type IN ('course', 'program', 'event', 'partnership')),
  coordinator_id UUID REFERENCES public.profiles(id),
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'ongoing', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. جدول المهام (مربوط بالموظف والهدف والشراكة والمرحلة)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID NOT NULL REFERENCES public.profiles(id),
  goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  partnership_id UUID REFERENCES public.partnerships(id) ON DELETE SET NULL,
  phase TEXT NOT NULL DEFAULT 'planning' CHECK (phase IN ('planning', 'execution', 'review', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'waiting_review', 'done')),
  due_date TIMESTAMPTZ,
  manager_approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. جدول سجل النشاط والتعليقات
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- تفعيل Row Level Security (RLS) على جميع الجداول
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- تنظيف السياسات القديمة إن وجدت
DROP POLICY IF EXISTS "Managers view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Managers manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow user to view self profile" ON public.profiles;
DROP POLICY IF EXISTS "Managers manage goals" ON public.goals;
DROP POLICY IF EXISTS "Employees view assigned goals" ON public.goals;
DROP POLICY IF EXISTS "Managers manage partnerships" ON public.partnerships;
DROP POLICY IF EXISTS "Employees view relevant partnerships" ON public.partnerships;
DROP POLICY IF EXISTS "Managers manage all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Employees view own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Employees update own task status" ON public.tasks;
DROP POLICY IF EXISTS "Managers view all logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Employees manage logs on own tasks" ON public.activity_logs;

-- سياسات جدول profiles
CREATE POLICY "Managers view all profiles" ON public.profiles
  FOR SELECT USING (public.is_manager() OR id = auth.uid());

CREATE POLICY "Managers manage profiles" ON public.profiles
  FOR ALL USING (public.is_manager());

CREATE POLICY "Allow user to view self profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

-- سياسات جدول goals
CREATE POLICY "Managers manage goals" ON public.goals
  FOR ALL USING (public.is_manager());

CREATE POLICY "Employees view assigned goals" ON public.goals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tasks
      WHERE tasks.goal_id = goals.id AND tasks.assigned_to = auth.uid()
    )
  );

-- سياسات جدول partnerships
CREATE POLICY "Managers manage partnerships" ON public.partnerships
  FOR ALL USING (public.is_manager());

CREATE POLICY "Employees view relevant partnerships" ON public.partnerships
  FOR SELECT USING (
    coordinator_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.tasks
      WHERE tasks.partnership_id = partnerships.id AND tasks.assigned_to = auth.uid()
    )
  );

-- سياسات جدول tasks
CREATE POLICY "Managers manage all tasks" ON public.tasks
  FOR ALL USING (public.is_manager());

CREATE POLICY "Employees view own tasks" ON public.tasks
  FOR SELECT USING (assigned_to = auth.uid());

CREATE POLICY "Employees update own task status" ON public.tasks
  FOR UPDATE USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());

-- سياسات جدول activity_logs
CREATE POLICY "Managers view all logs" ON public.activity_logs
  FOR ALL USING (public.is_manager());

CREATE POLICY "Employees manage logs on own tasks" ON public.activity_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.tasks
      WHERE tasks.id = activity_logs.task_id AND tasks.assigned_to = auth.uid()
    )
  );

-- trigger تلقائي لتحديث حقل updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- إعداد حاوية تخزين المرفقات Supabase Storage (task-attachments)
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-attachments', 'task-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- سياسات التخزين للحاوية
DROP POLICY IF EXISTS "Authenticated users upload attachments" ON storage.objects;
CREATE POLICY "Authenticated users upload attachments" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'task-attachments' AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Users view their relevant task attachments" ON storage.objects;
CREATE POLICY "Users view their relevant task attachments" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'task-attachments' AND (
      public.is_manager() OR auth.role() = 'authenticated'
    )
  );
