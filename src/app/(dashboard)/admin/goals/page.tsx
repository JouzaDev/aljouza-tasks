'use client';

import React, { useState, useEffect } from 'react';
import { getCurrentUser, getGoals } from '@/lib/supabase/actions';
import { Header } from '@/components/layout/header';
import { GoalCard } from '@/components/goals/goal-card';
import { CreateGoalModal } from '@/components/goals/create-goal-modal';
import { Button } from '@/components/ui/button';
import { PlusCircle, Target, Sparkles, TrendingUp } from 'lucide-react';
import { Goal, Profile, GoalHorizon } from '@/lib/types/database';

export default function AdminGoalsPage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeTab, setActiveTab] = useState<GoalHorizon>('current');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [u, g] = await Promise.all([getCurrentUser(), getGoals()]);
      setCurrentUser(u);
      setGoals(g);
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
        <div className="w-8 h-8 border-4 border-[#3b0764] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filteredGoals = goals.filter((g) => g.horizon === activeTab);
  const avgProgress =
    filteredGoals.length > 0
      ? Math.round(
          filteredGoals.reduce((acc, g) => acc + g.progress, 0) / filteredGoals.length
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Header
        currentUser={currentUser}
        title="الأهداف الاستراتيجية (OKRs)"
        subtitle="تحديد مؤشرات الأداء، أولويات المراحل، وتتبع نسب إنجاز منصة الجوزاء"
      />

      {/* Tabs & Create Goal Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-[#f1edfa] shadow-sm">
        <div className="flex items-center bg-[#faf8fd] p-1.5 rounded-2xl border border-[#f1edfa]">
          <button
            onClick={() => setActiveTab('current')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'current'
                ? 'bg-[#3b0764] text-white shadow-xs'
                : 'text-[#5f556d] hover:text-[#1e112a]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>الأهداف الحالية (الفترة الحالية)</span>
          </button>
          <button
            onClick={() => setActiveTab('future')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'future'
                ? 'bg-[#3b0764] text-white shadow-xs'
                : 'text-[#5f556d] hover:text-[#1e112a]'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>خطط وأهداف مستقبلية</span>
          </button>
        </div>

        <Button
          onClick={() => setCreateModalOpen(true)}
          variant="primary"
          size="md"
          icon={<PlusCircle className="w-5 h-5" />}
        >
          إضافة هدف جديد
        </Button>
      </div>

      {/* Average Progress Banner */}
      <div className="p-5 rounded-3xl bg-linear-to-r from-[#f5f3ff] to-[#faf5ff] border border-[#e9d5ff] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#3b0764] text-white flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h4 className="font-bold text-base text-[#1e112a]">
              متوسط إنجاز {activeTab === 'current' ? 'الأهداف الحالية' : 'الأهداف المستقبلية'}
            </h4>
            <p className="text-xs text-[#5f556d]">
              إجمالي {filteredGoals.length} أهداف استراتيجية مسجلة في هذا القسم
            </p>
          </div>
        </div>
        <div className="text-3xl font-extrabold text-[#3b0764]">{avgProgress}%</div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGoals.length === 0 ? (
          <div className="col-span-full py-16 text-center text-[#8c829e] bg-white rounded-3xl border border-[#f1edfa]">
            <Target className="w-10 h-10 text-[#d8b4fe] mx-auto mb-2" />
            <p className="font-semibold text-sm">لا توجد أهداف مسجلة في هذا التبويب بعد.</p>
          </div>
        ) : (
          filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              isManager={true}
              onUpdated={loadData}
            />
          ))
        )}
      </div>

      {/* Create Modal */}
      <CreateGoalModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onGoalCreated={loadData}
      />
    </div>
  );
}
