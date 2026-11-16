-- ==============================================================================
-- بيانات أولية تجريبية (Seed Data) لفريق منصة الجوزاء (4 أفراد)
-- ==============================================================================

-- ملاحظة: في حال كنت تستخدم حسابات حقيقية من Supabase Auth، يمكنك ربط المعرفات (id)
-- مع جدول auth.users. هنا نضع مستخدمين افتراضيين مع معرفات UUID ثابتة للتجربة.

DO $$
DECLARE
  jouza_id UUID := '11111111-1111-1111-1111-111111111111';
  mohammed_id UUID := '22222222-2222-2222-2222-222222222222';
  reham_id UUID := '33333333-3333-3333-3333-333333333333';
  dina_id UUID := '44444444-4444-4444-4444-444444444444';
  
  goal_1_id UUID := gen_random_uuid();
  goal_2_id UUID := gen_random_uuid();
  goal_3_id UUID := gen_random_uuid();
  
  partner_1_id UUID := gen_random_uuid();
  partner_2_id UUID := gen_random_uuid();
  
  task_1_id UUID := gen_random_uuid();
  task_2_id UUID := gen_random_uuid();
  task_3_id UUID := gen_random_uuid();
  task_4_id UUID := gen_random_uuid();
BEGIN

  -- 1. إدخال أو تحديث الملفات الشخصية للأعضاء الأربعة
  -- (نستخدم ON CONFLICT على id)
  INSERT INTO public.profiles (id, full_name, role, job_title)
  VALUES
    (jouza_id, 'جوزاء', 'manager', 'مدير عام المنصة'),
    (mohammed_id, 'محمد', 'employee', 'أخصائي تطوير وعلاقات'),
    (reham_id, 'ريهام', 'employee', 'منسقة برامج وفعاليات'),
    (dina_id, 'دينا', 'employee', 'مسؤولة محتوى وإعلام')
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    job_title = EXCLUDED.job_title;

  -- 2. إدخال الأهداف (OKRs)
  INSERT INTO public.goals (id, title, description, horizon, phase_priority, progress, target_date, status, created_by)
  VALUES
    (goal_1_id, 'إطلاق المعسكر التدريبي للربع الأول', 'تدريب 500 مستفيد وتطوير المحتوى التفاعلي', 'current', 'critical', 65, CURRENT_DATE + INTERVAL '20 days', 'active', jouza_id),
    (goal_2_id, 'توسيع شبكة الشراكات الاستراتيجية', 'توقيع 3 مذكرات تفاهم مع مراكز تدريب وجامعات', 'current', 'high', 40, CURRENT_DATE + INTERVAL '45 days', 'active', jouza_id),
    (goal_3_id, 'تطوير تطبيق الهاتف لمنصة الجوزاء', 'البدء في مرحلة دراسة الجدوى وتصميم واجهات المستخدم', 'future', 'medium', 10, CURRENT_DATE + INTERVAL '90 days', 'active', jouza_id)
  ON CONFLICT DO NOTHING;

  -- 3. إدخال برامج الشراكات
  INSERT INTO public.partnerships (id, partner_name, program_title, program_type, coordinator_id, start_date, end_date, status, notes)
  VALUES
    (partner_1_id, 'أكاديمية طويق', 'برنامج ريادة الأعمال التقنية', 'program', reham_id, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '30 days', 'ongoing', 'تنسيق معسكر تدريبي مشترك لـ 30 متدرب'),
    (partner_2_id, 'جامعة الملك سعود', 'ملتقى مهارات المستقبل 2026', 'event', mohammed_id, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '18 days', 'planned', 'مشاركة بجناح تعريفي وجلستين حواريتين')
  ON CONFLICT DO NOTHING;

  -- 4. إدخال المهام الموزعة على الموظفين
  INSERT INTO public.tasks (id, title, description, assigned_to, goal_id, partnership_id, phase, priority, status, due_date, manager_approved, created_by)
  VALUES
    -- مهمة لمحمد
    (task_1_id, 'إعداد جدول الاجتماعات مع ممثلي جامعة الملك سعود', 'التواصل لتحديد المحاور ومواعيد الورش للجناح التعريفي', mohammed_id, goal_2_id, partner_2_id, 'planning', 'urgent', 'in_progress', CURRENT_DATE + INTERVAL '3 days', FALSE, jouza_id),
    
    -- مهمة لريهام بانتظار الاعتماد
    (task_2_id, 'اعتماد قائمة المحاضرين لمعسكر ريادة الأعمال', 'تم التواصل مع 4 مدربين وجمع السير الذاتية وحقائب التدريب', reham_id, goal_1_id, partner_1_id, 'review', 'high', 'waiting_review', CURRENT_DATE + INTERVAL '2 days', FALSE, jouza_id),
    
    -- مهمة لدينا
    (task_3_id, 'تصميم ونشر بوسترات الفعالية القادمة', 'تجهيز 5 تصاميم لهوية الملتقى ونشرها عبر منصات التواصل', dina_id, goal_1_id, partner_2_id, 'execution', 'medium', 'in_progress', CURRENT_DATE + INTERVAL '5 days', FALSE, jouza_id),
    
    -- مهمة منجزة ومعتمدة لمحمد
    (task_4_id, 'صياغة مسودة الشراكة الأولية', 'كتابة بنود مذكرة التفاهم ومراجعتها قانونياً', mohammed_id, goal_2_id, partner_1_id, 'closed', 'high', 'done', CURRENT_DATE - INTERVAL '2 days', TRUE, jouza_id)
  ON CONFLICT DO NOTHING;

  -- 5. سجل نشاط وتعليق افتراضي
  INSERT INTO public.activity_logs (task_id, user_id, action, details)
  VALUES
    (task_2_id, reham_id, 'إرسال للمراجعة', 'تم إرفاق قائمة المدربين وبانتظار اعتماد الأستاذة جوزاء'),
    (task_1_id, mohammed_id, 'تحديث الحالة', 'تم البدء في التواصل الهاتفي مع منسق الجامعة')
  ON CONFLICT DO NOTHING;

END $$;
