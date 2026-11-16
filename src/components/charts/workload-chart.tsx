import React from 'react';
import { Profile, Task } from '@/lib/types/database';
import { User, CheckCircle2, Clock, PlayCircle } from 'lucide-react';

interface WorkloadChartProps {
  employees: Profile[];
  tasks: Task[];
}

export function WorkloadChart({ employees, tasks }: WorkloadChartProps) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-[#f1edfa] shadow-sm space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-[#f1edfa]">
        <div>
          <h3 className="text-lg font-bold text-[#1e112a]">مؤشر عبء عمل الفريق</h3>
          <p className="text-xs text-[#5f556d] mt-0.5">
            توزيع المهام ومستويات الإنجاز للأعضاء الثلاثة
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {employees.map((emp) => {
          const empTasks = tasks.filter((t) => t.assigned_to === emp.id);
          const inProgress = empTasks.filter((t) => t.status === 'in_progress').length;
          const waitingReview = empTasks.filter((t) => t.status === 'waiting_review').length;
          const done = empTasks.filter((t) => t.status === 'done').length;
          const totalActive = inProgress + waitingReview;

          return (
            <div
              key={emp.id}
              className="p-5 rounded-2xl bg-[#faf8fd] border border-[#f1edfa] hover:border-[#e9d5ff] transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#3b0764] text-white flex items-center justify-center font-bold text-base shadow-sm">
                  {emp.full_name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-base text-[#1e112a]">{emp.full_name}</h4>
                  <p className="text-xs text-[#5f556d]">{emp.job_title}</p>
                </div>
              </div>

              {/* Progress Distribution */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-[#5f556d]">
                  <span className="flex items-center gap-1.5">
                    <PlayCircle className="w-3.5 h-3.5 text-blue-500" />
                    <span>قيد التنفيذ:</span>
                  </span>
                  <strong className="text-blue-600 text-sm">{inProgress}</strong>
                </div>

                <div className="flex justify-between items-center text-[#5f556d]">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>بانتظار الاعتماد:</span>
                  </span>
                  <strong className="text-amber-600 text-sm">{waitingReview}</strong>
                </div>

                <div className="flex justify-between items-center text-[#5f556d]">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>المهام المنجزة:</span>
                  </span>
                  <strong className="text-emerald-600 text-sm">{done}</strong>
                </div>
              </div>

              {/* Workload Indicator Bar */}
              <div className="mt-4 pt-3 border-t border-[#f1edfa]">
                <div className="flex justify-between items-center text-[11px] mb-1 text-[#8c829e]">
                  <span>الضغط الحالي:</span>
                  <span>{totalActive > 3 ? 'مرتفع' : totalActive > 1 ? 'متوسط' : 'مريح'}</span>
                </div>
                <div className="w-full h-2 bg-[#f5f3ff] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      totalActive > 3
                        ? 'bg-rose-500'
                        : totalActive > 1
                        ? 'bg-[#3b0764]'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(15, totalActive * 25))}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
