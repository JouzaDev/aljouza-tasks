export type UserRole = 'manager' | 'employee';

export type GoalHorizon = 'current' | 'future';
export type PhasePriority = 'critical' | 'high' | 'medium' | 'low';
export type GoalStatus = 'active' | 'completed' | 'paused';

export type ProjectStatus = 'planning' | 'active' | 'completed' | 'on_hold';
export type PartnerStatus = 'active' | 'completed' | 'paused';

export type TaskPhase = 'planning' | 'execution' | 'review' | 'closed';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'waiting_review' | 'done';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  job_title?: string | null;
  avatar_url?: string | null;
  avatar_badge?: string;
  created_at?: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string | null;
  horizon: GoalHorizon;
  phase_priority: PhasePriority;
  progress: number;
  target_date?: string | null;
  status: GoalStatus;
  created_by?: string | null;
  created_at?: string;
  
  // Linked tasks metrics
  tasks_count?: number;
  completed_tasks_count?: number;
}

export interface Project {
  id: string;
  title: string;
  description?: string | null;
  status: ProjectStatus;
  progress: number;
  manager_id?: string | null;
  due_date?: string | null;
  created_at?: string;
  
  tasks_count?: number;
  completed_tasks_count?: number;
}

export interface Partner {
  id: string;
  name: string;
  logo_url?: string | null;
  logo_letter?: string;
  description: string;
  mechanism: string; // كيفية الشراكة
  goal: string;      // هدف الشراكة
  effectiveness_rate: number; // مقياس مدى فاعلية الشراكة (0 - 100%)
  status: PartnerStatus;
  created_at?: string;
  
  tasks_count?: number;
  completed_tasks_count?: number;
  actions_done?: string[];
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  assigned_to: string;
  assigned_profile?: Profile | null;
  goal_id?: string | null;
  goal?: Goal | null;
  project_id?: string | null;
  project?: Project | null;
  partner_id?: string | null;
  partner?: Partner | null;
  phase: TaskPhase;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string | null;
  manager_approved: boolean;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
  
  symbol?: string;
  is_starred?: boolean;
  progress_pct?: number;
}

export interface Achievement {
  user_id: string;
  user_name: string;
  role: UserRole;
  job_title: string;
  avatar_badge: string;
  completed_tasks: number;
  in_progress_tasks: number;
  goals_contributed: number;
  effectiveness_score: number; // 0 - 100
  badge: string;
}

export interface ActivityLog {
  id: string;
  task_id: string;
  user_id: string;
  user_profile?: Profile | null;
  action: string;
  details?: string | null;
  created_at: string;
}
