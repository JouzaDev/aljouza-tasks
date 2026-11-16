'use client';

import React from 'react';
import {
  Calendar,
  User,
  Target,
  Handshake,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { Task } from '@/lib/types/database';
import { Badge } from '../ui/badge';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  showAssignee?: boolean;
}

export function TaskCard({ task, onClick, showAssignee = true }: TaskCardProps) {
  const priorityMap: Record<
    string,
    { label: string; variant: 'rose' | 'amber' | 'blue' | 'slate' }
  > = {
    urgent: { label: 'عاجل ومهم', variant: 'rose' },
    high: { label: 'أولوية عالية', variant: 'amber' },
    medium: { label: 'أولوية متوسطة', variant: 'blue' },
    low: { label: 'أولوية منخفضة', variant: 'slate' },
  };

  const statusMap: Record<
    string,
    { label: string; variant: 'slate' | 'blue' | 'amber' | 'emerald' }
  > = {
    todo: { label: 'بانتظار البدء', variant: 'slate' },
    in_progress: { label: 'قيد التنفيذ', variant: 'blue' },
    waiting_review: { label: 'بانتظار الاعتماد', variant: 'amber' },
    done: { label: 'منجزة', variant: 'emerald' },
  };

  const priority = priorityMap[task.priority] || priorityMap.medium;
  const status = statusMap[task.status] || statusMap.todo;

  let dueDateText = 'بدون موعد';
  let isOverdue = false;
  if (task.due_date) {
    const due = new Date(task.due_date);
    const now = new Date();
    isOverdue = due < now && task.status !== 'done';
    dueDateText = new Intl.DateTimeFormat('ar-SA', {
      day: 'numeric',
      month: 'short',
    }).format(due);
  }

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-3xl p-5 border border-[#f1f3f7] hover:border-[#ddd6fe] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group"
    >
      <div>
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant={priority.variant} size="sm">
            {priority.label}
          </Badge>
          <Badge variant={status.variant} size="sm">
            {status.label}
          </Badge>
        </div>

        {/* Task Title */}
        <h4 className="text-base font-extrabold text-[#18181c] group-hover:text-[#7c3aed] transition-colors leading-snug">
          {task.title}
        </h4>

        {/* Task Description */}
        {task.description && (
          <p className="mt-2 text-xs text-[#627084] line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Relations Tags (Goal / Project / Partner) */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {task.goal && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-xl bg-[#faf5ff] text-[#7c3aed] border border-[#e9d5ff]">
              <Target className="w-3 h-3" />
              <span className="truncate max-w-[130px]">{task.goal.title}</span>
            </span>
          )}
          {task.project && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-xl bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]">
              <Layers className="w-3 h-3" />
              <span className="truncate max-w-[130px]">{task.project.title}</span>
            </span>
          )}
          {task.partner && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-xl bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]">
              <Handshake className="w-3 h-3" />
              <span className="truncate max-w-[130px]">
                {task.partner.name}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-[#f1f3f7] flex items-center justify-between text-xs text-[#627084]">
        {/* Assignee */}
        {showAssignee && (
          <div className="flex items-center gap-1.5 font-bold text-[#18181c]">
            <div className="w-6 h-6 rounded-full bg-[#fed7aa] text-[#9a3412] flex items-center justify-center font-bold text-[10px]">
              {task.assigned_profile?.avatar_badge || task.assigned_profile?.full_name[0] || 'م'}
            </div>
            <span>{task.assigned_profile?.full_name || 'غير محدد'}</span>
          </div>
        )}

        {/* Due Date & Approval */}
        <div className="flex items-center gap-2">
          {task.manager_approved && (
            <span className="flex items-center gap-1 text-emerald-600 font-extrabold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>معتمدة</span>
            </span>
          )}
          <span
            className={`flex items-center gap-1 font-medium ${
              isOverdue ? 'text-rose-600 font-bold' : 'text-[#8a94a6]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{dueDateText}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
