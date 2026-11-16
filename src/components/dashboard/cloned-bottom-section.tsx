'use client';

import React, { useState } from 'react';
import { Star, ChevronDown, Plus, Sparkles, CheckCircle2 } from 'lucide-react';
import { Task, Profile } from '@/lib/types/database';
import { toggleTaskStar } from '@/lib/supabase/actions';

interface ClonedBottomSectionProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onOpenCreateTask?: () => void;
  isManager?: boolean;
}

export function ClonedBottomSection({
  tasks,
  onSelectTask,
  onOpenCreateTask,
  isManager = true,
}: ClonedBottomSectionProps) {
  const [filterTime, setFilterTime] = useState('24h');
  const [filterPriority, setFilterPriority] = useState('all');

  const filteredTasks = tasks.filter((t) => {
    if (filterPriority === 'urgent' && t.priority !== 'urgent') return false;
    if (filterPriority === 'high' && t.priority !== 'high' && t.priority !== 'urgent') return false;
    return true;
  });

  const handleStarClick = async (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    await toggleTaskStar(taskId);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-3">
      {/* 1. Left Table Section matching the image table exactly */}
      <div className="lg:col-span-8 flex flex-col justify-between">
        {/* Table Header Row with Dropdowns */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-[#18181c]">
              المهام النشطة والأولويات
            </h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              نسبة التقدم +18.4%
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-[#627084]">
            {/* Filter 1 */}
            <div className="relative">
              <select
                value={filterTime}
                onChange={(e) => setFilterTime(e.target.value)}
                className="appearance-none bg-[#f4f7fb] hover:bg-[#eef3f9] px-3 py-1.5 pr-6 rounded-xl border-none text-[#18181c] cursor-pointer focus:outline-none"
              >
                <option value="24h">آخر 24 ساعة</option>
                <option value="1w">هذا الأسبوع</option>
                <option value="all">جميع الفترات</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#8a94a6]" />
            </div>

            {/* Filter 2 */}
            <div className="relative">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="appearance-none bg-[#f4f7fb] hover:bg-[#eef3f9] px-3 py-1.5 pr-6 rounded-xl border-none text-[#18181c] cursor-pointer focus:outline-none"
              >
                <option value="all">الأعلى أولوية</option>
                <option value="urgent">عاجل ومهم</option>
                <option value="high">أولوية عالية</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#8a94a6]" />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="text-[#8a94a6] border-b border-[#f1f3f7] pb-2 font-medium">
                <th className="py-2.5 px-3">المهمة</th>
                <th className="py-2.5 px-3">الموظف</th>
                <th className="py-2.5 px-3">التقدم</th>
                <th className="py-2.5 px-3">تاريخ التسليم</th>
                <th className="py-2.5 px-3 text-center">المتابعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f8f9fc]">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-[#8a94a6]">
                    لا توجد مهام تطابق هذا التصفية.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="hover:bg-[#f8fafd] transition-colors cursor-pointer group rounded-2xl"
                  >
                    {/* Task Title with Black Square Symbol Badge matching B, V, A, W */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-[#18181c] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                          {task.symbol || task.title[0]}
                        </div>
                        <div>
                          <p className="font-extrabold text-[#18181c] group-hover:text-[#7c3aed] transition-colors text-sm line-clamp-1">
                            {task.title}
                          </p>
                          <p className="text-[11px] text-[#8a94a6] mt-0.5">
                            {task.goal?.title || task.partner?.name || 'مهام المنصة'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Assignee */}
                    <td className="py-3 px-3 font-semibold text-[#18181c]">
                      {task.assigned_profile?.full_name || 'غير محدد'}
                    </td>

                    {/* Change / Progress Badge in Emerald Green */}
                    <td className="py-3 px-3">
                      <span className="font-bold text-emerald-600 text-xs">
                        +{task.progress_pct || 11.2}%
                      </span>
                    </td>

                    {/* Market Cap / Due Date */}
                    <td className="py-3 px-3 text-[#627084] font-medium">
                      {task.due_date || 'بدون تاريخ'}
                    </td>

                    {/* Star / Watch */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={(e) => handleStarClick(e, task.id)}
                        className={`p-1.5 rounded-lg hover:bg-[#f1f3f7] transition-colors cursor-pointer ${
                          task.is_starred ? 'text-amber-400 fill-amber-400' : 'text-[#c2cbd6]'
                        }`}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Right Dark Promo Card matching "Earn free crypto with Coinview Earn!" */}
      <div className="lg:col-span-4 bg-[#18181c] rounded-[28px] p-6 text-white flex flex-col justify-between relative overflow-hidden shadow-xl min-h-[260px]">
        {/* Abstract Geometric Vector Wireframe Lines in background */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <svg className="w-full h-full" viewBox="0 0 300 250" fill="none">
            <path
              d="M 120 180 L 260 130 L 290 220 L 150 250 Z"
              stroke="#ffffff"
              strokeWidth="1.2"
            />
            <path
              d="M 140 160 L 280 110 L 310 200 L 170 230 Z"
              stroke="#ffffff"
              strokeWidth="0.8"
            />
            <path
              d="M 160 140 L 300 90 L 330 180 L 190 210 Z"
              stroke="#ffffff"
              strokeWidth="0.5"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Header with pill highlight */}
          <div className="text-xl sm:text-2xl font-black leading-snug">
            إنجاز و{' '}
            <span className="inline-block border border-white/60 rounded-full px-3 py-0.5 text-sm font-bold align-middle mx-1">
              اعتماد المهام
            </span>{' '}
            بمنصة الجوزاء!
          </div>

          <p className="text-xs text-[#a3a3b3] mt-3 leading-relaxed max-w-[280px]">
            لوحة الإسناد والتوزيع السريع للمهام ومتابعة المخرجات المعتمدة أولاً بأول.
          </p>
        </div>

        {/* Action Button matching "Earn Now" */}
        <div className="relative z-10 pt-4">
          <button
            onClick={onOpenCreateTask}
            className="px-6 py-3 rounded-2xl bg-[#e2f0fd] hover:bg-white text-[#18181c] font-black text-xs transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#7c3aed]" />
            <span>{isManager ? 'إسناد مهمة جديدة' : 'تحديث إنجازي الآن'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
