'use client';

import React from 'react';
import {
  Calendar,
  User,
  Target,
  Handshake,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Task } from '@/lib/types/database';
import { Badge } from '../ui/badge';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  showAssignee?: boolean;
}

export function TaskCard({ task, onClick, showAssignee = true }: TaskCardProps) {
  // Priority styles
  const priorityMap: Record<
    string,
    { label: string; variant: 'rose' | 'amber' | 'blue' | 'slate' }
  > = {
    urgent: { label: 'عاجل ومهم', variant: 'rose' },
    high: { label: 'أولوية عالية', variant: 'amber' },
    medium: { label: 'أولوية متوسطة', variant: 'blue' },
    low: { label: 'أولوية منخفضة', variant: 'slate' },
  };

  // Status styles
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

  // Format date
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
      className="bg-white rounded-3xl p-5 border border-[#f1edfa] hover:border-[#d8b4fe] shadow-sm hover:shadow-md hover:shadow-[#3b0764]/5 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
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
        <h4 className="text-base font-bold text-[#1e112a] group-hover:text-[#3b0764] transition-colors leading-snug">
          {task.title}
        </h4>

        {/* Task Description */}
        {task.description && (
          <p className="mt-2 text-sm text-[#5f556d] line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Relations Tags (Goal / Partnership) */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {task.goal && (
            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-xl bg-[#faf8fd] text-[#581c87] border border-[#f1edfa]">
              <Target className="w-3 h-3" />
              <span className="truncate max-w-[140px]">{task.goal.title}</span>
            </span>
          )}
          {task.partnership && (
            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-xl bg-[#faf8fd] text-[#1e40af] border border-[#dbeafe]">
              <Handshake className="w-3 h-3" />
              <span className="truncate max-w-[140px]">{task.partnership.partner_name}</span>
            </span>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-[#f1edfa] flex items-center justify-between text-xs text-[#5f556d]">
        {/* Assignee */}
        {showAssignee && (
          <div className="flex items-center gap-1.5 font-medium">
            <div className="w-6 h-6 rounded-full bg-[#f5f3ff] text-[#3b0764] border border-[#e9d5ff] flex items-center justify-center font-bold text-[10px]">
              {task.assigned_profile?.full_name[0] || 'م'}
            </div>
            <span>{task.assigned_profile?.full_name || 'غير محدد'}</span>
          </div>
        )}

        {/* Due Date & Approval */}
        <div className="flex items-center gap-2">
          {task.manager_approved && (
            <span className="flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>معتمدة</span>
            </span>
          )}
          <span
            className={`flex items-center gap-1 font-medium ${
              isOverdue ? 'text-rose-600 font-bold' : 'text-[#8c829e]'
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
