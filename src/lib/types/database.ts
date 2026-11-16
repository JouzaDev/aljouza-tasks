export type UserRole = 'manager' | 'employee';

export type GoalHorizon = 'current' | 'future';
export type PhasePriority = 'critical' | 'high' | 'medium' | 'low';
export type GoalStatus = 'active' | 'completed' | 'paused';

export type ProgramType = 'course' | 'program' | 'event' | 'partnership';
export type PartnershipStatus = 'planned' | 'ongoing' | 'completed' | 'cancelled';

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
  
  tasks_count?: number;
  completed_tasks_count?: number;
}

export interface Partnership {
  id: string;
  partner_name: string;
  program_title: string;
  program_type: ProgramType;
  coordinator_id?: string | null;
  coordinator?: Profile | null;
  start_date?: string | null;
  end_date?: string | null;
  status: PartnershipStatus;
  notes?: string | null;
  created_at?: string;
  
  tasks_count?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  assigned_to: string;
  assigned_profile?: Profile | null;
  goal_id?: string | null;
  goal?: Goal | null;
  partnership_id?: string | null;
  partnership?: Partnership | null;
  phase: TaskPhase;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string | null;
  manager_approved: boolean;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
  
  // Custom visual metrics matching the cloned UI
  symbol?: string; // e.g. "G1", "P2", "T3"
  is_starred?: boolean;
  progress_pct?: number; // e.g. +14.2%
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
