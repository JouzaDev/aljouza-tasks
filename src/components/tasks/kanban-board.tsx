'use client';

import React from 'react';
import { Task, TaskPhase } from '@/lib/types/database';
import { TaskCard } from './task-card';
import { Layers, PlayCircle, Eye, CheckCircle2 } from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  showAssignee?: boolean;
}

export function KanbanBoard({ tasks, onSelectTask, showAssignee = true }: KanbanBoardProps) {
  const columns: {
    phase: TaskPhase;
    title: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      phase: 'planning',
      title: 'التخطيط والإعداد',
      icon: <Layers className="w-4 h-4 text-slate-500" />,
      color: 'border-slate-200 bg-slate-50/50',
    },
    {
      phase: 'execution',
      title: 'التنفيذ الفعلي',
      icon: <PlayCircle className="w-4 h-4 text-blue-500" />,
      color: 'border-blue-200 bg-blue-50/30',
    },
    {
      phase: 'review',
      title: 'المراجعة والاعتماد',
      icon: <Eye className="w-4 h-4 text-amber-500" />,
      color: 'border-amber-200 bg-amber-50/30',
    },
    {
      phase: 'closed',
      title: 'معتمد ومغلق',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
      color: 'border-emerald-200 bg-emerald-50/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {columns.map((col) => {
        const columnTasks = tasks.filter((t) => t.phase === col.phase);

        return (
          <div
            key={col.phase}
            className={`rounded-3xl p-4 border ${col.color} flex flex-col min-h-[500px]`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/5">
              <div className="flex items-center gap-2">
                {col.icon}
                <h4 className="font-bold text-sm text-[#1e112a]">{col.title}</h4>
              </div>
              <span className="w-6 h-6 rounded-full bg-white shadow-xs border border-black/5 flex items-center justify-center text-xs font-bold text-[#581c87]">
                {columnTasks.length}
              </span>
            </div>

            {/* Column Task Cards */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              {columnTasks.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-xs text-[#8c829e] border border-dashed border-[#e9d5ff] rounded-2xl">
                  لا توجد مهام في هذه المرحلة
                </div>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => onSelectTask(task)}
                    showAssignee={showAssignee}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
