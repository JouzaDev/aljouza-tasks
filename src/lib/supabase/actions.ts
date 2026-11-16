'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createClient } from './server';
import {
  Task,
  Profile,
  Goal,
  Project,
  Partner,
  Achievement,
  ActivityLog,
  TaskStatus,
  TaskPhase,
  TaskPriority,
  GoalHorizon,
  PhasePriority,
  ProjectStatus,
  PartnerStatus,
  UserRole,
} from '../types/database';
import {
  INITIAL_PROFILES,
  INITIAL_GOALS,
  INITIAL_PROJECTS,
  INITIAL_PARTNERS,
  INITIAL_TASKS,
  INITIAL_LOGS,
} from './mock-data';

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes('dummy') &&
    !url.includes('your-project') &&
    key !== 'dummy-anon-key'
  );
}

// In-memory data store for persistent experience
let mockTasks: Task[] = [...INITIAL_TASKS];
let mockGoals: Goal[] = [...INITIAL_GOALS];
let mockProjects: Project[] = [...INITIAL_PROJECTS];
let mockPartners: Partner[] = [...INITIAL_PARTNERS];
let mockLogs: ActivityLog[] = [...INITIAL_LOGS];

export async function loginWithEmailAndPassword(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; role?: UserRole; userId?: string }> {
  const cookieStore = await cookies();

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (!error && data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const role = (profile?.role || data.user.user_metadata?.role || 'employee') as UserRole;
        cookieStore.set('aljouza_active_user', data.user.id, { path: '/' });
        return { success: true, role, userId: data.user.id };
      }
    } catch (e: any) {
      console.warn('Supabase login error:', e);
    }
  }

  const cleanEmail = email.trim().toLowerCase();
  const profile = INITIAL_PROFILES.find(
    (p) =>
      p.email.toLowerCase() === cleanEmail ||
      cleanEmail.includes(p.full_name.toLowerCase()) ||
      p.email.replace('@aljouza.sa', '') === cleanEmail.replace('@aljouza.sa', '').replace('@aljouza.com', '')
  );

  if (!profile) {
    return {
      success: false,
      error: 'البريد الإلكتروني غير مسجل على نطاق aljouza.sa. جرب: jouza@aljouza.sa',
    };
  }

  if (profile.password && profile.password !== password && password !== '123' && password !== '123456') {
    return {
      success: false,
      error: 'كلمة المرور غير صحيحة. كلمة المرور الافتراضية للتجربة هي: 123',
    };
  }

  cookieStore.set('aljouza_active_user', profile.id, { path: '/' });
  return { success: true, role: profile.role, userId: profile.id };
}

export async function logoutUser() {
  const cookieStore = await cookies();
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch {}
  }
  cookieStore.set('aljouza_active_user', '', { path: '/', maxAge: 0 });
  revalidatePath('/', 'layout');
}

export async function getCurrentUser(): Promise<Profile> {
  const cookieStore = await cookies();
  const demoUserId = cookieStore.get('aljouza_active_user')?.value;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (profile) return profile as Profile;
      }
    } catch (e) {
      console.warn('Supabase auth fallback:', e);
    }
  }

  const found = INITIAL_PROFILES.find((p) => p.id === demoUserId);
  return found || INITIAL_PROFILES[0];
}

export async function switchDemoUser(userId: string) {
  const currentUser = await getCurrentUser();
  if (currentUser.role !== 'manager') {
    throw new Error('غير مصرح: التنقل بين حسابات الموظفين متاح للمدير فقط.');
  }
  const cookieStore = await cookies();
  cookieStore.set('aljouza_active_user', userId, { path: '/' });
  revalidatePath('/', 'layout');
}

export async function getProfiles(): Promise<Profile[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.from('profiles').select('*').order('role', { ascending: false });
      if (data && data.length > 0) return data as Profile[];
    } catch (e) {
      console.warn('Supabase getProfiles fallback:', e);
    }
  }
  return INITIAL_PROFILES;
}

// -------------------------------------------------------------
// Tasks Actions
// -------------------------------------------------------------
export async function getTasks(options?: {
  assignedTo?: string;
  goalId?: string;
  projectId?: string;
  partnerId?: string;
  phase?: string;
  priority?: string;
  status?: string;
}): Promise<Task[]> {
  const currentUser = await getCurrentUser();
  const profiles = await getProfiles();
  const goals = await getGoals();
  const projects = await getProjects();
  const partners = await getPartners();

  const effectiveAssignedTo = currentUser.role === 'employee' ? currentUser.id : options?.assignedTo;

  let list = [...mockTasks];
  if (effectiveAssignedTo) {
    list = list.filter((t) => t.assigned_to === effectiveAssignedTo);
  }
  if (options?.goalId) {
    list = list.filter((t) => t.goal_id === options.goalId);
  }
  if (options?.projectId) {
    list = list.filter((t) => t.project_id === options.projectId);
  }
  if (options?.partnerId) {
    list = list.filter((t) => t.partner_id === options.partnerId);
  }
  if (options?.phase) {
    list = list.filter((t) => t.phase === options.phase);
  }
  if (options?.priority) {
    list = list.filter((t) => t.priority === options.priority);
  }
  if (options?.status) {
    list = list.filter((t) => t.status === options.status);
  }

  return list.map((t) => ({
    ...t,
    assigned_profile: profiles.find((p) => p.id === t.assigned_to) || null,
    goal: goals.find((g) => g.id === t.goal_id) || null,
    project: projects.find((prj) => prj.id === t.project_id) || null,
    partner: partners.find((p) => p.id === t.partner_id) || null,
  }));
}

export async function createTask(data: {
  title: string;
  description?: string;
  assigned_to: string;
  goal_id?: string;
  project_id?: string;
  partner_id?: string;
  phase: TaskPhase;
  priority: TaskPriority;
  due_date?: string;
}) {
  const currentUser = await getCurrentUser();
  if (currentUser.role !== 'manager') {
    throw new Error('غير مصرح: إضافة المهام محصورة بالمدير فقط.');
  }

  const symbols = ['B', 'V', 'A', 'W', 'J', 'G', 'P'];
  const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];

  const newTask: Task = {
    id: `t-${Date.now()}`,
    title: data.title,
    description: data.description || null,
    assigned_to: data.assigned_to,
    goal_id: data.goal_id || null,
    project_id: data.project_id || null,
    partner_id: data.partner_id || null,
    phase: data.phase,
    priority: data.priority,
    status: 'todo',
    due_date: data.due_date || null,
    manager_approved: false,
    created_by: currentUser.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    symbol: randomSymbol,
    is_starred: false,
    progress_pct: Math.round(Math.random() * 20 + 5) / 10,
  };

  mockTasks.unshift(newTask);
  mockLogs.unshift({
    id: `l-${Date.now()}`,
    task_id: newTask.id,
    user_id: currentUser.id,
    action: 'إنشاء المهمة',
    details: `تم إنشاء وإسناد المهمة للموظف.`,
    created_at: new Date().toISOString(),
  });

  revalidatePath('/admin');
  revalidatePath('/admin/tasks');
  revalidatePath('/admin/goals');
  revalidatePath('/admin/projects');
  revalidatePath('/admin/partners');
  revalidatePath('/my-tasks');
  return newTask;
}

export async function updateTaskStatus(taskId: string, status: TaskStatus, note?: string) {
  const currentUser = await getCurrentUser();

  const taskIndex = mockTasks.findIndex((t) => t.id === taskId);
  if (taskIndex !== -1) {
    mockTasks[taskIndex].status = status;
    mockTasks[taskIndex].updated_at = new Date().toISOString();
  }

  mockLogs.unshift({
    id: `l-${Date.now()}`,
    task_id: taskId,
    user_id: currentUser.id,
    action: 'تحديث الحالة',
    details: note || `تم تحديث الحالة إلى ${status}`,
    created_at: new Date().toISOString(),
  });

  revalidatePath('/admin');
  revalidatePath('/admin/tasks');
  revalidatePath('/admin/goals');
  revalidatePath('/my-tasks');
}

export async function updateTask(
  taskId: string,
  data: {
    title?: string;
    description?: string;
    assigned_to?: string;
    goal_id?: string | null;
    project_id?: string | null;
    partner_id?: string | null;
    phase?: TaskPhase;
    priority?: TaskPriority;
    status?: TaskStatus;
    due_date?: string | null;
  }
) {
  const currentUser = await getCurrentUser();
  if (currentUser.role !== 'manager') {
    throw new Error('غير مصرح: تعديل بيانات المهمة متاح للمدير فقط.');
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase
        .from('tasks')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId);
    } catch (e) {
      console.warn('Supabase updateTask error:', e);
    }
  }

  const idx = mockTasks.findIndex((t) => t.id === taskId);
  if (idx !== -1) {
    mockTasks[idx] = {
      ...mockTasks[idx],
      ...data,
      updated_at: new Date().toISOString(),
    };
  }

  mockLogs.unshift({
    id: `l-${Date.now()}`,
    task_id: taskId,
    user_id: currentUser.id,
    action: 'تعديل المهمة',
    details: 'تم تحديث بيانات وتفاصيل المهمة.',
    created_at: new Date().toISOString(),
  });

  revalidatePath('/admin');
  revalidatePath('/admin/tasks');
  revalidatePath('/admin/goals');
  revalidatePath('/admin/projects');
  revalidatePath('/admin/partners');
  revalidatePath('/my-tasks');
}

export async function deleteTask(taskId: string) {
  const currentUser = await getCurrentUser();
  if (currentUser.role !== 'manager') {
    throw new Error('غير مصرح: حذف المهمة متاح للمدير فقط.');
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.from('tasks').delete().eq('id', taskId);
    } catch (e) {
      console.warn('Supabase deleteTask error:', e);
    }
  }

  mockTasks = mockTasks.filter((t) => t.id !== taskId);
  mockLogs = mockLogs.filter((l) => l.task_id !== taskId);

  revalidatePath('/admin');
  revalidatePath('/admin/tasks');
  revalidatePath('/admin/goals');
  revalidatePath('/admin/projects');
  revalidatePath('/admin/partners');
  revalidatePath('/my-tasks');
}

export async function toggleTaskStar(taskId: string) {
  const taskIndex = mockTasks.findIndex((t) => t.id === taskId);
  if (taskIndex !== -1) {
    mockTasks[taskIndex].is_starred = !mockTasks[taskIndex].is_starred;
  }
  revalidatePath('/admin');
  revalidatePath('/admin/tasks');
  revalidatePath('/my-tasks');
}

export async function approveTask(taskId: string, approved: boolean, note?: string) {
  const currentUser = await getCurrentUser();
  if (currentUser.role !== 'manager') {
    throw new Error('غير مصرح: الاعتماد مخصص للمدير فقط.');
  }

  const updates = {
    manager_approved: approved,
    status: approved ? ('done' as TaskStatus) : ('in_progress' as TaskStatus),
    phase: approved ? ('closed' as TaskPhase) : ('execution' as TaskPhase),
    updated_at: new Date().toISOString(),
  };

  const taskIndex = mockTasks.findIndex((t) => t.id === taskId);
  if (taskIndex !== -1) {
    mockTasks[taskIndex] = {
      ...mockTasks[taskIndex],
      ...updates,
    };
  }

  mockLogs.unshift({
    id: `l-${Date.now()}`,
    task_id: taskId,
    user_id: currentUser.id,
    action: approved ? 'اعتماد وإغلاق' : 'طلب تعديل',
    details: note || (approved ? 'تم اعتماد المهمة بنجاح من المدير' : 'تمت إعادة المهمة مع ملاحظات'),
    created_at: new Date().toISOString(),
  });

  revalidatePath('/admin');
  revalidatePath('/admin/tasks');
  revalidatePath('/admin/goals');
  revalidatePath('/admin/achievements');
  revalidatePath('/my-tasks');
}

export async function addActivityLog(taskId: string, action: string, details?: string) {
  const currentUser = await getCurrentUser();

  mockLogs.unshift({
    id: `l-${Date.now()}`,
    task_id: taskId,
    user_id: currentUser.id,
    action,
    details: details || null,
    created_at: new Date().toISOString(),
  });

  revalidatePath('/admin/tasks');
  revalidatePath('/my-tasks');
}

export async function getTaskLogs(taskId: string): Promise<ActivityLog[]> {
  const profiles = await getProfiles();
  return mockLogs
    .filter((l) => l.task_id === taskId)
    .map((log) => ({
      ...log,
      user_profile: profiles.find((p) => p.id === log.user_id) || null,
    }));
}

// -------------------------------------------------------------
// Future Goals (الأهداف المستقبلية المرتبطة بالمهام)
// -------------------------------------------------------------
export async function getGoals(): Promise<Goal[]> {
  // Compute progress dynamically based on linked tasks!
  return mockGoals.map((goal) => {
    const linkedTasks = mockTasks.filter((t) => t.goal_id === goal.id);
    const completedTasks = linkedTasks.filter((t) => t.status === 'done');
    const autoProgress =
      linkedTasks.length > 0
        ? Math.round((completedTasks.length / linkedTasks.length) * 100)
        : goal.progress;

    return {
      ...goal,
      progress: autoProgress,
      tasks_count: linkedTasks.length,
      completed_tasks_count: completedTasks.length,
    };
  });
}

export async function createGoal(data: {
  title: string;
  description?: string;
  phase_priority: PhasePriority;
  target_date?: string;
}) {
  const currentUser = await getCurrentUser();
  if (currentUser.role !== 'manager') {
    throw new Error('غير مصرح: إضافة الأهداف محصورة بالمدير فقط.');
  }

  const newGoal: Goal = {
    id: `g-${Date.now()}`,
    title: data.title,
    description: data.description || null,
    horizon: 'future', // أهداف مستقبلية دائماً حسب التوجيه
    phase_priority: data.phase_priority,
    progress: 0,
    target_date: data.target_date || null,
    status: 'active',
    created_by: currentUser.id,
    created_at: new Date().toISOString(),
  };

  mockGoals.unshift(newGoal);
  revalidatePath('/admin');
  revalidatePath('/admin/goals');
  return newGoal;
}

export async function updateGoalProgress(goalId: string, progress: number) {
  const currentUser = await getCurrentUser();
  if (currentUser.role !== 'manager') {
    throw new Error('غير مصرح: تعديل نسبة الهدف للمدير فقط.');
  }

  const idx = mockGoals.findIndex((g) => g.id === goalId);
  if (idx !== -1) {
    mockGoals[idx].progress = Math.min(100, Math.max(0, progress));
  }

  revalidatePath('/admin');
  revalidatePath('/admin/goals');
}

export async function updateGoal(
  goalId: string,
  data: {
    title?: string;
    description?: string;
    horizon?: GoalHorizon;
    phase_priority?: PhasePriority;
    progress?: number;
    target_date?: string;
    status?: 'active' | 'completed' | 'paused';
  }
) {
  const currentUser = await getCurrentUser();
  if (currentUser.role !== 'manager') {
    throw new Error('غير مصرح: تعديل الأهداف متاح للمدير فقط.');
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.from('goals').update(data).eq('id', goalId);
    } catch (e) {
      console.warn('Supabase updateGoal error:', e);
    }
  }

  const idx = mockGoals.findIndex((g) => g.id === goalId);
  if (idx !== -1) {
    mockGoals[idx] = { ...mockGoals[idx], ...data };
  }

  revalidatePath('/admin');
  revalidatePath('/admin/goals');
  revalidatePath('/admin/tasks');
}

export async function deleteGoal(goalId: string) {
  const currentUser = await getCurrentUser();
  if (currentUser.role !== 'manager') {
    throw new Error('غير مصرح: حذف الأهداف متاح للمدير فقط.');
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.from('goals').delete().eq('id', goalId);
    } catch (e) {
      console.warn('Supabase deleteGoal error:', e);
    }
  }

  mockGoals = mockGoals.filter((g) => g.id !== goalId);
  mockTasks.forEach((t) => {
    if (t.goal_id === goalId) t.goal_id = null;
  });

  revalidatePath('/admin');
  revalidatePath('/admin/goals');
  revalidatePath('/admin/tasks');
}

// -------------------------------------------------------------
// Projects Actions (المشاريع المنفصلة)
// -------------------------------------------------------------
export async function getProjects(): Promise<Project[]> {
  return mockProjects.map((prj) => {
    const linkedTasks = mockTasks.filter((t) => t.project_id === prj.id);
    const completed = linkedTasks.filter((t) => t.status === 'done');
    const autoProgress =
      linkedTasks.length > 0
        ? Math.round((completed.length / linkedTasks.length) * 100)
        : prj.progress;

    return {
      ...prj,
      progress: autoProgress,
      tasks_count: linkedTasks.length,
      completed_tasks_count: completed.length,
    };
  });
}

export async function createProject(data: {
  title: string;
  description?: string;
  due_date?: string;
}) {
  const currentUser = await getCurrentUser();
  if (currentUser.role !== 'manager') {
    throw new Error('غير مصرح: إضافة المشاريع محصورة بالمدير فقط.');
  }

  const newProject: Project = {
    id: `prj-${Date.now()}`,
    title: data.title,
    description: data.description || null,
    status: 'active',
    progress: 0,
    manager_id: currentUser.id,
    due_date: data.due_date || null,
    created_at: new Date().toISOString(),
  };

  mockProjects.unshift(newProject);
  revalidatePath('/admin/projects');
  return newProject;
}

export async function updateProject(
  projectId: string,
  data: {
    title?: string;
    description?: string;
    status?: ProjectStatus;
    progress?: number;
    due_date?: string;
  }
) {
  const currentUser = await getCurrentUser();
  if (currentUser.role !== 'manager') {
    throw new Error('غير مصرح: تعديل المشاريع متاح للمدير فقط.');
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.from('projects').update(data).eq('id', projectId);
    } catch (e) {
      console.warn('Supabase updateProject error:', e);
    }
  }

  const idx = mockProjects.findIndex((p) => p.id === projectId);
  if (idx !== -1) {
    mockProjects[idx] = { ...mockProjects[idx], ...data };
  }

  revalidatePath('/admin/projects');
  revalidatePath('/admin/tasks');
}

export async function deleteProject(projectId: string) {
  const currentUser = await getCurrentUser();
  if (currentUser.role !== 'manager') {
    throw new Error('غير مصرح: حذف المشاريع متاح للمدير فقط.');
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.from('projects').delete().eq('id', projectId);
    } catch (e) {
      console.warn('Supabase deleteProject error:', e);
    }
  }

  mockProjects = mockProjects.filter((p) => p.id !== projectId);
  mockTasks.forEach((t) => {
    if (t.project_id === projectId) t.project_id = null;
  });

  revalidatePath('/admin/projects');
  revalidatePath('/admin/tasks');
}

// -------------------------------------------------------------
// Success Partners Actions (شركاء النجاح مع مقياس الفاعلية)
// -------------------------------------------------------------
export async function getPartners(): Promise<Partner[]> {
  return mockPartners.map((partner) => {
    const linkedTasks = mockTasks.filter((t) => t.partner_id === partner.id);
    const completed = linkedTasks.filter((t) => t.status === 'done');
    return {
      ...partner,
      tasks_count: linkedTasks.length,
      completed_tasks_count: completed.length,
    };
  });
}

export async function createPartner(data: {
  name: string;
  description: string;
  mechanism: string;
  goal: string;
  effectiveness_rate?: number;
}) {
  const currentUser = await getCurrentUser();
  if (currentUser.role !== 'manager') {
    throw new Error('غير مصرح: إضافة الشركاء محصورة بالمدير فقط.');
  }

  const newPartner: Partner = {
    id: `prt-${Date.now()}`,
    name: data.name,
    logo_letter: data.name[0] || 'ش',
    description: data.description,
    mechanism: data.mechanism,
    goal: data.goal,
    effectiveness_rate: data.effectiveness_rate || 75,
    status: 'active',
    actions_done: ['تسجيل وتوثيق الشراكة في النظام'],
    created_at: new Date().toISOString(),
  };

  mockPartners.unshift(newPartner);
  revalidatePath('/admin/partners');
  return newPartner;
}

export async function updatePartnerEffectiveness(partnerId: string, rate: number) {
  const idx = mockPartners.findIndex((p) => p.id === partnerId);
  if (idx !== -1) {
    mockPartners[idx].effectiveness_rate = Math.min(100, Math.max(0, rate));
  }
  revalidatePath('/admin/partners');
}

export async function addPartnerAction(partnerId: string, actionText: string) {
  const idx = mockPartners.findIndex((p) => p.id === partnerId);
  if (idx !== -1) {
    if (!mockPartners[idx].actions_done) mockPartners[idx].actions_done = [];
    mockPartners[idx].actions_done!.push(actionText);
  }
  revalidatePath('/admin/partners');
}

export async function updatePartner(
  partnerId: string,
  data: {
    name?: string;
    logo_letter?: string;
    description?: string;
    mechanism?: string;
    goal?: string;
    effectiveness_rate?: number;
    status?: PartnerStatus;
  }
) {
  const currentUser = await getCurrentUser();
  if (currentUser.role !== 'manager') {
    throw new Error('غير مصرح: تعديل بيانات الشركاء متاح للمدير فقط.');
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.from('partners').update(data).eq('id', partnerId);
    } catch (e) {
      console.warn('Supabase updatePartner error:', e);
    }
  }

  const idx = mockPartners.findIndex((p) => p.id === partnerId);
  if (idx !== -1) {
    mockPartners[idx] = { ...mockPartners[idx], ...data };
  }

  revalidatePath('/admin/partners');
  revalidatePath('/admin/tasks');
}

export async function deletePartner(partnerId: string) {
  const currentUser = await getCurrentUser();
  if (currentUser.role !== 'manager') {
    throw new Error('غير مصرح: حذف الشركاء متاح للمدير فقط.');
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.from('partners').delete().eq('id', partnerId);
    } catch (e) {
      console.warn('Supabase deletePartner error:', e);
    }
  }

  mockPartners = mockPartners.filter((p) => p.id !== partnerId);
  mockTasks.forEach((t) => {
    if (t.partner_id === partnerId) t.partner_id = null;
  });

  revalidatePath('/admin/partners');
  revalidatePath('/admin/tasks');
}

export async function deletePartnerAction(partnerId: string, actionIndex: number) {
  const currentUser = await getCurrentUser();
  if (currentUser.role !== 'manager') {
    throw new Error('غير مصرح: حذف منجزات الشركاء متاح للمدير فقط.');
  }

  const partner = mockPartners.find((p) => p.id === partnerId);
  if (partner && partner.actions_done) {
    partner.actions_done.splice(actionIndex, 1);
  }

  if (isSupabaseConfigured() && partner) {
    try {
      const supabase = await createClient();
      await supabase
        .from('partners')
        .update({
          actions_done: partner.actions_done,
        })
        .eq('id', partnerId);
    } catch (e) {
      console.warn('Supabase deletePartnerAction error:', e);
    }
  }

  revalidatePath('/admin/partners');
}

// -------------------------------------------------------------
// Achievements Actions (منجزات لكل موظف حتى المدير)
// -------------------------------------------------------------
export async function getAchievements(): Promise<Achievement[]> {
  const profiles = await getProfiles();

  return profiles.map((p) => {
    const userTasks = mockTasks.filter((t) => t.assigned_to === p.id);
    const completed = userTasks.filter((t) => t.status === 'done').length;
    const inProgress = userTasks.filter((t) => t.status === 'in_progress').length;
    
    // Calculate effectiveness score
    const total = userTasks.length || 1;
    const effectivenessScore = Math.min(100, Math.round((completed / total) * 100) + (p.role === 'manager' ? 25 : 15));

    let badge = 'عضو فعال';
    if (p.role === 'manager') badge = 'القائد الاستراتيجي 👑';
    else if (completed >= 2) badge = 'نجم الإنجاز 🌟';
    else if (inProgress >= 1) badge = 'رواد التنفيذ 🚀';

    return {
      user_id: p.id,
      user_name: p.full_name,
      role: p.role,
      job_title: p.job_title || (p.role === 'manager' ? 'مدير عام' : 'موظف'),
      avatar_badge: p.avatar_badge || (p.role === 'manager' ? '👑' : '⭐'),
      completed_tasks: completed,
      in_progress_tasks: inProgress,
      goals_contributed: mockGoals.length,
      effectiveness_score: Math.min(100, effectivenessScore),
      badge,
    };
  });
}

// -------------------------------------------------------------
// Reports Actions (تقارير أسبوعية، شهرية، سنوية)
// -------------------------------------------------------------
export async function getReportsData(period: 'weekly' | 'monthly' | 'yearly') {
  const tasks = await getTasks();
  const goals = await getGoals();
  const projects = await getProjects();
  const partners = await getPartners();
  const achievements = await getAchievements();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const waitingReview = tasks.filter((t) => t.status === 'waiting_review').length;

  const avgPartnerEffectiveness =
    partners.length > 0
      ? Math.round(partners.reduce((sum, p) => sum + p.effectiveness_rate, 0) / partners.length)
      : 0;

  const avgGoalsProgress =
    goals.length > 0
      ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
      : 0;

  return {
    period,
    totalTasks,
    completedTasks,
    inProgressTasks,
    waitingReview,
    avgPartnerEffectiveness,
    avgGoalsProgress,
    activeProjectsCount: projects.filter((p) => p.status === 'active').length,
    partnersCount: partners.length,
    achievements,
  };
}
