'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createClient } from './server';
import {
  Task,
  Profile,
  Goal,
  Partnership,
  ActivityLog,
  TaskStatus,
  TaskPhase,
  TaskPriority,
  GoalHorizon,
  PhasePriority,
  ProgramType,
  UserRole,
} from '../types/database';
import {
  INITIAL_PROFILES,
  INITIAL_GOALS,
  INITIAL_PARTNERSHIPS,
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

// Memory stores for demo/local persistence across requests
let mockTasks: Task[] = [...INITIAL_TASKS];
let mockGoals: Goal[] = [...INITIAL_GOALS];
let mockPartnerships: Partnership[] = [...INITIAL_PARTNERSHIPS];
let mockLogs: ActivityLog[] = [...INITIAL_LOGS];

export async function loginWithEmailAndPassword(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; role?: UserRole; userId?: string }> {
  const cookieStore = await cookies();

  // 1. Live Supabase Auth
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

  // 2. Demo profiles lookup
  const cleanEmail = email.trim().toLowerCase();
  const profile = INITIAL_PROFILES.find((p) => p.email.toLowerCase() === cleanEmail);

  if (!profile) {
    // If not found by exact email, check if it matches a name like jouza, mohammed, reham, dina
    const matchByName = INITIAL_PROFILES.find((p) =>
      cleanEmail.includes(p.full_name.toLowerCase()) || cleanEmail.includes(p.id)
    );
    if (matchByName) {
      cookieStore.set('aljouza_active_user', matchByName.id, { path: '/' });
      return { success: true, role: matchByName.role, userId: matchByName.id };
    }
    return {
      success: false,
      error: 'البريد الإلكتروني غير مسجل في منصة الجوزاء. جرب: jouza@aljouza.com',
    };
  }

  // Validate password (default demo password is 123)
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

export async function getTasks(options?: {
  assignedTo?: string;
  goalId?: string;
  partnershipId?: string;
  phase?: string;
  priority?: string;
  status?: string;
}): Promise<Task[]> {
  const currentUser = await getCurrentUser();
  const profiles = await getProfiles();
  const goals = await getGoals();
  const partnerships = await getPartnerships();

  const effectiveAssignedTo = currentUser.role === 'employee' ? currentUser.id : options?.assignedTo;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      let query = supabase.from('tasks').select('*');

      if (effectiveAssignedTo) query = query.eq('assigned_to', effectiveAssignedTo);
      if (options?.goalId) query = query.eq('goal_id', options.goalId);
      if (options?.partnershipId) query = query.eq('partnership_id', options.partnershipId);
      if (options?.phase) query = query.eq('phase', options.phase);
      if (options?.priority) query = query.eq('priority', options.priority);
      if (options?.status) query = query.eq('status', options.status);

      const { data, error } = await query.order('created_at', { ascending: false });
      if (!error && data) {
        return data.map((t) => ({
          ...t,
          assigned_profile: profiles.find((p) => p.id === t.assigned_to) || null,
          goal: goals.find((g) => g.id === t.goal_id) || null,
          partnership: partnerships.find((p) => p.id === t.partnership_id) || null,
        })) as Task[];
      }
    } catch (e) {
      console.warn('Supabase getTasks fallback:', e);
    }
  }

  let list = [...mockTasks];
  if (effectiveAssignedTo) {
    list = list.filter((t) => t.assigned_to === effectiveAssignedTo);
  }
  if (options?.goalId) {
    list = list.filter((t) => t.goal_id === options.goalId);
  }
  if (options?.partnershipId) {
    list = list.filter((t) => t.partnership_id === options.partnershipId);
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
    partnership: partnerships.find((p) => p.id === t.partnership_id) || null,
  }));
}

export async function createTask(data: {
  title: string;
  description?: string;
  assigned_to: string;
  goal_id?: string;
  partnership_id?: string;
  phase: TaskPhase;
  priority: TaskPriority;
  due_date?: string;
}) {
  const currentUser = await getCurrentUser();
  if (currentUser.role !== 'manager') {
    throw new Error('غير مصرح: إضافة المهام محصورة بالمدير فقط.');
  }

  const symbols = ['B', 'V', 'A', 'W', 'J', 'G'];
  const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];

  const newTask: Task = {
    id: `t-${Date.now()}`,
    title: data.title,
    description: data.description || null,
    assigned_to: data.assigned_to,
    goal_id: data.goal_id || null,
    partnership_id: data.partnership_id || null,
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

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.from('tasks').insert({
        title: newTask.title,
        description: newTask.description,
        assigned_to: newTask.assigned_to,
        goal_id: newTask.goal_id,
        partnership_id: newTask.partnership_id,
        phase: newTask.phase,
        priority: newTask.priority,
        due_date: newTask.due_date,
        created_by: currentUser.id,
      });
    } catch (e) {
      console.warn('Supabase createTask error:', e);
    }
  }

  mockTasks.unshift(newTask);
  mockLogs.unshift({
    id: `l-${Date.now()}`,
    task_id: newTask.id,
    user_id: currentUser.id,
    action: 'إنشاء المهمة',
    details: `تم إنشاء المهمة وإسنادها للموظف.`,
    created_at: new Date().toISOString(),
  });

  revalidatePath('/admin');
  revalidatePath('/admin/tasks');
  revalidatePath('/my-tasks');
  return newTask;
}

export async function updateTaskStatus(taskId: string, status: TaskStatus, note?: string) {
  const currentUser = await getCurrentUser();

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase
        .from('tasks')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', taskId);

      if (note) {
        await supabase.from('activity_logs').insert({
          task_id: taskId,
          user_id: currentUser.id,
          action: 'تحديث الحالة',
          details: note,
        });
      }
    } catch (e) {
      console.warn('Supabase updateTaskStatus error:', e);
    }
  }

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
    details: note || `تم تغيير الحالة إلى ${status}`,
    created_at: new Date().toISOString(),
  });

  revalidatePath('/admin');
  revalidatePath('/admin/tasks');
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

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.from('tasks').update(updates).eq('id', taskId);
      await supabase.from('activity_logs').insert({
        task_id: taskId,
        user_id: currentUser.id,
        action: approved ? 'اعتماد وإغلاق' : 'طلب تعديل',
        details: note || (approved ? 'تم اعتماد المهمة بنجاح' : 'تمت إعادة المهمة للتعديل'),
      });
    } catch (e) {
      console.warn('Supabase approveTask error:', e);
    }
  }

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
  revalidatePath('/my-tasks');
}

export async function addActivityLog(taskId: string, action: string, details?: string) {
  const currentUser = await getCurrentUser();

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.from('activity_logs').insert({
        task_id: taskId,
        user_id: currentUser.id,
        action,
        details,
      });
    } catch (e) {
      console.warn('Supabase addActivityLog error:', e);
    }
  }

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

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (data) {
        return data.map((log) => ({
          ...log,
          user_profile: profiles.find((p) => p.id === log.user_id) || null,
        })) as ActivityLog[];
      }
    } catch (e) {
      console.warn('Supabase getTaskLogs error:', e);
    }
  }

  return mockLogs
    .filter((l) => l.task_id === taskId)
    .map((log) => ({
      ...log,
      user_profile: profiles.find((p) => p.id === log.user_id) || null,
    }));
}

export async function getGoals(horizon?: GoalHorizon): Promise<Goal[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      let query = supabase.from('goals').select('*');
      if (horizon) query = query.eq('horizon', horizon);
      const { data } = await query.order('created_at', { ascending: false });
      if (data) return data as Goal[];
    } catch (e) {
      console.warn('Supabase getGoals fallback:', e);
    }
  }

  let list = [...mockGoals];
  if (horizon) {
    list = list.filter((g) => g.horizon === horizon);
  }
  return list;
}

export async function createGoal(data: {
  title: string;
  description?: string;
  horizon: GoalHorizon;
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
    horizon: data.horizon,
    phase_priority: data.phase_priority,
    progress: 0,
    target_date: data.target_date || null,
    status: 'active',
    created_by: currentUser.id,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.from('goals').insert(newGoal);
    } catch (e) {
      console.warn('Supabase createGoal error:', e);
    }
  }

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

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.from('goals').update({ progress }).eq('id', goalId);
    } catch (e) {
      console.warn('Supabase updateGoalProgress error:', e);
    }
  }

  const idx = mockGoals.findIndex((g) => g.id === goalId);
  if (idx !== -1) {
    mockGoals[idx].progress = Math.min(100, Math.max(0, progress));
  }

  revalidatePath('/admin');
  revalidatePath('/admin/goals');
}

export async function getPartnerships(): Promise<Partnership[]> {
  const profiles = await getProfiles();

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.from('partnerships').select('*').order('created_at', { ascending: false });
      if (data) {
        return data.map((p) => ({
          ...p,
          coordinator: profiles.find((pr) => pr.id === p.coordinator_id) || null,
        })) as Partnership[];
      }
    } catch (e) {
      console.warn('Supabase getPartnerships fallback:', e);
    }
  }

  return mockPartnerships.map((p) => ({
    ...p,
    coordinator: profiles.find((pr) => pr.id === p.coordinator_id) || null,
  }));
}

export async function createPartnership(data: {
  partner_name: string;
  program_title: string;
  program_type: ProgramType;
  coordinator_id?: string;
  start_date?: string;
  end_date?: string;
  notes?: string;
}) {
  const currentUser = await getCurrentUser();
  if (currentUser.role !== 'manager') {
    throw new Error('غير مصرح: إضافة الشراكات محصورة بالمدير فقط.');
  }

  const newPartner: Partnership = {
    id: `p-${Date.now()}`,
    partner_name: data.partner_name,
    program_title: data.program_title,
    program_type: data.program_type,
    coordinator_id: data.coordinator_id || null,
    start_date: data.start_date || null,
    end_date: data.end_date || null,
    status: 'planned',
    notes: data.notes || null,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.from('partnerships').insert(newPartner);
    } catch (e) {
      console.warn('Supabase createPartnership error:', e);
    }
  }

  mockPartnerships.unshift(newPartner);
  revalidatePath('/admin/partners');
  revalidatePath('/my-tasks/programs');
  return newPartner;
}
