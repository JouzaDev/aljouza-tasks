-- ==============================================================================
-- بيانات أولية تجريبية لفريق منصة الجوزاء (taska.aljouza.sa)
-- ==============================================================================

DO $$
DECLARE
  jouza_id UUID := '11111111-1111-1111-1111-111111111111';
  mohammed_id UUID := '22222222-2222-2222-2222-222222222222';
  reham_id UUID := '33333333-3333-3333-3333-333333333333';
  dina_id UUID := '44444444-4444-4444-4444-444444444444';
  
  prj_1_id UUID := gen_random_uuid();
  prj_2_id UUID := gen_random_uuid();
  
  goal_1_id UUID := gen_random_uuid();
  goal_2_id UUID := gen_random_uuid();
  
  partner_1_id UUID := gen_random_uuid();
  partner_2_id UUID := gen_random_uuid();
BEGIN

  -- 1. الملفات الشخصية للأعضاء الأربعة
  INSERT INTO public.profiles (id, full_name, email, role, job_title, avatar_badge)
  VALUES
    (jouza_id, 'جوزاء', 'jouza@aljouza.sa', 'manager', 'مدير عام المنصة', '👑'),
    (mohammed_id, 'محمد', 'mohammed@aljouza.sa', 'employee', 'أخصائي تطوير وعلاقات', '💼'),
    (reham_id, 'ريهام', 'reham@aljouza.sa', 'employee', 'منسقة برامج وفعاليات', '🎯'),
    (dina_id, 'دينا', 'dina@aljouza.sa', 'employee', 'مسؤولة محتوى وإعلام', '🎨')
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    job_title = EXCLUDED.job_title;

  -- 2. المشاريع المستقلة
  INSERT INTO public.projects (id, title, description, status, progress, manager_id, due_date)
  VALUES
    (prj_1_id, 'تطوير المنصة الرقمية للجوزاء 2026', 'إعادة هيكلة بنية النظام البرمجية وتحسين تجربة المستفيدين.', 'active', 75, jouza_id, CURRENT_DATE + INTERVAL '45 days'),
    (prj_2_id, 'معسكر الجوزاء للريادة والابتكار', 'مشروع تدريبي مكثف يشمل 4 مسارات تخصصية بالتعاون مع الشركاء.', 'active', 50, jouza_id, CURRENT_DATE + INTERVAL '60 days')
  ON CONFLICT DO NOTHING;

  -- 3. الأهداف المستقبلية
  INSERT INTO public.goals (id, title, description, horizon, phase_priority, progress, target_date, status, created_by)
  VALUES
    (goal_1_id, 'تدريب وتأهيل 500 مستفيد خلال الربع الأول', 'تطوير المحتوى التفاعلي وتقديم ورش العمل التخصصية.', 'future', 'critical', 65, CURRENT_DATE + INTERVAL '25 days', 'active', jouza_id),
    (goal_2_id, 'توسيع شبكة الشركاء وتوقيع 5 مذكرات تفاهم', 'بناء شراكات استراتيجية فاعلة مع جهات تعليمية وحكومية.', 'future', 'high', 40, CURRENT_DATE + INTERVAL '45 days', 'active', jouza_id)
  ON CONFLICT DO NOTHING;

  -- 4. شركاء النجاح
  INSERT INTO public.partners (id, name, logo_letter, description, mechanism, goal, effectiveness_rate, status, actions_done)
  VALUES
    (partner_1_id, 'أكاديمية طويق', 'ط', 'شريك تقني لتقديم المعسكرات والبرامج المتقدمة.', 'تنظيم معسكر تدريبي فصلي، استضافة ورش عمل، ومنح شهادات.', 'تأهيل 200 متدرب في الذكاء الاصطناعي.', 92, 'active', ARRAY['اعتماد الحقائب التدريبية', 'تجهيز قاعات المعسكر']),
    (partner_2_id, 'جامعة الملك سعود', 'س', 'شريك أكاديمي للربط المعرفي وإتاحة الفرص التدريبية.', 'مشاركة بجناح تعريفي سنوي، وتنسيق جلسات إرشاد مهني.', 'ربط مخرجات التعليم باحتياجات سوق العمل.', 85, 'active', ARRAY['توقيع مذكرة التفاهم الأولية'])
  ON CONFLICT DO NOTHING;

  -- 5. المهام الموزعة
  INSERT INTO public.tasks (title, description, assigned_to, goal_id, project_id, partner_id, phase, priority, status, due_date, manager_approved, symbol, created_by)
  VALUES
    ('إعداد جدول الاجتماعات مع ممثلي جامعة الملك سعود', 'التواصل لتحديد المحاور ومواعيد الورش للجناح التعريفي لملتقى مهارات المستقبل 2026.', mohammed_id, goal_2_id, prj_2_id, partner_2_id, 'planning', 'urgent', 'in_progress', CURRENT_DATE + INTERVAL '3 days', FALSE, 'B', jouza_id),
    ('اعتماد قائمة المحاضرين لمعسكر ريادة الأعمال مع طويق', 'تم التواصل مع 4 مدربين وجمع السير الذاتية وحقائب التدريب وبانتظار اعتماد الأستاذة جوزاء.', reham_id, goal_1_id, prj_2_id, partner_1_id, 'review', 'high', 'waiting_review', CURRENT_DATE + INTERVAL '2 days', FALSE, 'V', jouza_id),
    ('تصميم ونشر بوسترات الفعالية وهوية الدومين taska.aljouza.sa', 'تجهيز تصاميم الإطلاق لموقع المهام ونشرها عبر الحسابات الرسمية لمنصة الجوزاء.', dina_id, goal_1_id, prj_1_id, partner_1_id, 'execution', 'medium', 'in_progress', CURRENT_DATE + INTERVAL '5 days', FALSE, 'A', jouza_id),
    ('المراجعة الإدارية الشاملة لمؤشرات الأداء الربيعية', 'مراجعة نسب تقدم الأهداف المستقبلية وتقييم أداء الشركاء من قبل الإدارة العامة.', jouza_id, goal_2_id, prj_1_id, partner_1_id, 'closed', 'high', 'done', CURRENT_DATE - INTERVAL '1 days', TRUE, 'J', jouza_id);

END $$;
