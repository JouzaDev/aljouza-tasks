'use client';

import React, { useState, useEffect } from 'react';
import {
  getCurrentUser,
  getAchievements,
  getTasks,
} from '@/lib/supabase/actions';
import { Header } from '@/components/layout/header';
import { Badge } from '@/components/ui/badge';
import {
  Award,
  CheckCircle2,
  TrendingUp,
  Clock,
  Sparkles,
  Trophy,
  Target,
  Zap,
} from 'lucide-react';
import { Achievement, Profile, Task } from '@/lib/types/database';

export default function AchievementsPage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [u, a, t] = await Promise.all([
        getCurrentUser(),
        getAchievements(),
        getTasks(),
      ]);
      setCurrentUser(u);
      setAchievements(a);
      setTasks(t);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalTeamCompleted = tasks.filter((t) => t.status === 'done').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Header
        currentUser={currentUser}
        pendingReviewCount={tasks.filter((t) => t.status === 'waiting_review').length}
      />

      {/* Top Banner */}
      <div className="bg-linear-to-r from-[#18181c] to-[#2c2c36] text-white p-7 rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold mb-2">
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>لوحة الشرف والمنجزات</span>
          </div>
          <h2 className="text-2xl font-black">منجزات فريق منصة الجوزاء</h2>
          <p className="text-xs text-[#a3a3b3] mt-1 max-w-xl leading-relaxed">
            احتساب مؤشرات الإنجاز، الكفاءة، والأثر لجميع أفراد الفريق بما فيهم الإدارة العامة
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10 text-center min-w-[140px]">
          <span className="text-[11px] text-white/70 block font-medium">إجمالي المهام المعتمدة</span>
          <span className="text-3xl font-extrabold text-amber-300">{totalTeamCompleted}</span>
          <span className="text-[10px] text-white/60 block mt-0.5">منجز مؤسسي</span>
        </div>
      </div>

      {/* Achievements Cards for All Members (Including Manager) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {achievements.map((item) => {
          const userTasks = tasks.filter((t) => t.assigned_to === item.user_id);
          const completedTasksList = userTasks.filter((t) => t.status === 'done');

          return (
            <div
              key={item.user_id}
              className="bg-white rounded-3xl p-6 border border-[#f1f3f7] hover:border-[#ddd6fe] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header: Avatar, Name, Role, Badge */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-[#fed7aa] text-[#9a3412] flex items-center justify-center font-black text-2xl shadow-xs shrink-0">
                      {item.avatar_badge || item.user_name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-extrabold text-[#18181c]">
                          {item.user_name}
                        </h3>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#f4f7fb] text-[#7c3aed] border border-[#e2e8f0]">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-[#8a94a6] mt-0.5">{item.job_title}</p>
                    </div>
                  </div>

                  {/* Effectiveness Score */}
                  <div className="text-left bg-[#f8fafd] p-2.5 rounded-2xl border border-[#e2e8f0]">
                    <span className="text-[10px] text-[#8a94a6] block font-bold">مؤشر الإنجاز</span>
                    <span className="text-base font-extrabold text-[#18181c] flex items-center gap-1">
                      <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                      {item.effectiveness_score}%
                    </span>
                  </div>
                </div>

                {/* Metrics Stats Row */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#f8fafd] border border-[#e2e8f0] mb-4 text-center">
                  <div>
                    <span className="text-[10px] text-[#8a94a6] block">مهام مكتملة</span>
                    <strong className="text-base text-emerald-600 font-extrabold">
                      {item.completed_tasks}
                    </strong>
                  </div>
                  <div className="border-r border-l border-[#e2e8f0]">
                    <span className="text-[10px] text-[#8a94a6] block">قيد التنفيذ</span>
                    <strong className="text-base text-blue-600 font-extrabold">
                      {item.in_progress_tasks}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8a94a6] block">المساهمة بالأهداف</span>
                    <strong className="text-base text-[#7c3aed] font-extrabold">
                      {item.goals_contributed}
                    </strong>
                  </div>
                </div>

                {/* Recent Completed Work */}
                <div>
                  <span className="text-xs font-bold text-[#18181c] block mb-2">
                    أحدث الأعمال المنجزة والمعتمدة:
                  </span>
                  {completedTasksList.length === 0 ? (
                    <p className="text-[11px] text-[#8a94a6] bg-[#faf8fd] p-2 rounded-xl border border-[#f1f3f7]">
                      لا توجد مهام منجزة مسجلة في هذه الفترة.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {completedTasksList.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-2 text-xs p-2 rounded-xl bg-white border border-[#f1f3f7]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="text-[#18181c] font-medium truncate">{task.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Bar */}
              <div className="mt-4 pt-3 border-t border-[#f1f3f7] flex items-center justify-between text-[11px] text-[#8a94a6]">
                <span>الدور المؤسسي: <strong>{item.role === 'manager' ? 'إشراف واعتماد' : 'تنفيذ وتنسيق'}</strong></span>
                <span className="text-emerald-600 font-bold">مساهم فعال بمشروع taska</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
