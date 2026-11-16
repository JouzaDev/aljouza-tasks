'use client';

import React, { useState, useEffect } from 'react';
import {
  getCurrentUser,
  getReportsData,
  getTasks,
} from '@/lib/supabase/actions';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  TrendingUp,
  Handshake,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Profile, Task } from '@/lib/types/database';

export default function ReportsPage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [reportData, setReportData] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async (selectedPeriod: 'weekly' | 'monthly' | 'yearly') => {
    try {
      const [u, r, t] = await Promise.all([
        getCurrentUser(),
        getReportsData(selectedPeriod),
        getTasks(),
      ]);
      setCurrentUser(u);
      setReportData(r);
      setTasks(t);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(period);
  }, [period]);

  if (loading || !currentUser || !reportData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const periodLabels = {
    weekly: 'التقرير الأسبوعي',
    monthly: 'التقرير الشهري',
    yearly: 'التقرير السنوي الشامل',
  };

  const handleExportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      ['المهمة,المسؤول,المرحلة,الحالة,الأولوية,تاريخ التسليم,معتمد']
        .concat(
          tasks.map(
            (t) =>
              `"${t.title}","${t.assigned_profile?.full_name || ''}","${t.phase}","${
                t.status
              }","${t.priority}","${t.due_date || ''}","${
                t.manager_approved ? 'نعم' : 'لا'
              }"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `aljouza-${period}-report-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Header
        currentUser={currentUser}
        pendingReviewCount={reportData.waitingReview}
      />

      {/* Top Banner & Timeframe Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#f1f3f7] shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-[#18181c] flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#7c3aed]" />
            <span>التقارير الدورية (أسبوعية • شهرية • سنوية)</span>
          </h2>
          <p className="text-xs text-[#8a94a6] mt-0.5">
            متابعة إحصائيات الإنجاز وسرعة التنفيذ ومؤشرات فاعلية الشراكات والمشاريع
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center bg-[#f4f7fb] p-1.5 rounded-2xl border border-[#e2e8f0]">
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              period === 'weekly'
                ? 'bg-white text-[#18181c] shadow-xs'
                : 'text-[#8a94a6] hover:text-[#18181c]'
            }`}
          >
            أسبوعي
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              period === 'monthly'
                ? 'bg-white text-[#18181c] shadow-xs'
                : 'text-[#8a94a6] hover:text-[#18181c]'
            }`}
          >
            شهري
          </button>
          <button
            onClick={() => setPeriod('yearly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              period === 'yearly'
                ? 'bg-white text-[#18181c] shadow-xs'
                : 'text-[#8a94a6] hover:text-[#18181c]'
            }`}
          >
            سنوي
          </button>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-[#f1f3f7] shadow-xs">
          <span className="text-xs font-bold text-[#8a94a6] block mb-2">
            إجمالي المهام المنجزة ({period === 'weekly' ? 'هذا الأسبوع' : period === 'monthly' ? 'هذا الشهر' : 'هذا العام'})
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">
              {reportData.completedTasks}
            </span>
            <span className="text-xs text-[#8a94a6]">من أصل {reportData.totalTasks}</span>
          </div>
          <span className="inline-block mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            معدل إنجاز: {Math.round((reportData.completedTasks / (reportData.totalTasks || 1)) * 100)}%
          </span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#f1f3f7] shadow-xs">
          <span className="text-xs font-bold text-[#8a94a6] block mb-2">
            متوسط تقدم الأهداف الاستراتيجية
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#7c3aed]">
              {reportData.avgGoalsProgress}%
            </span>
          </div>
          <span className="inline-block mt-2 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
            أهداف مستقبلية مرتبطة
          </span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#f1f3f7] shadow-xs">
          <span className="text-xs font-bold text-[#8a94a6] block mb-2">
            مقياس فاعلية شركاء النجاح
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">
              {reportData.avgPartnerEffectiveness}%
            </span>
            <span className="text-xs text-[#8a94a6]">({reportData.partnersCount} شركاء)</span>
          </div>
          <span className="inline-block mt-2 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
            مؤشر فاعلية عالي
          </span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#f1f3f7] shadow-xs">
          <span className="text-xs font-bold text-[#8a94a6] block mb-2">
            المشاريع النشطة المستقلة
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#18181c]">
              {reportData.activeProjectsCount}
            </span>
            <span className="text-xs text-[#8a94a6]">مشاريع جارية</span>
          </div>
          <span className="inline-block mt-2 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
            تطبيق taska.aljouza.sa
          </span>
        </div>
      </div>

      {/* Team Productivity Breakdown Table */}
      <div className="bg-white rounded-3xl p-6 border border-[#f1f3f7] shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#f1f3f7] mb-4">
          <h3 className="text-base font-extrabold text-[#18181c]">
            مؤشر كفاءة وإنتاجية فريق العمل
          </h3>
          <span className="text-xs text-[#8a94a6]">محدث تلقائياً</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="text-[#8a94a6] border-b border-[#f1f3f7] pb-2 font-medium">
                <th className="py-2.5 px-3">العضو</th>
                <th className="py-2.5 px-3">المسمى الوظيفي</th>
                <th className="py-2.5 px-3">المهام المنجزة</th>
                <th className="py-2.5 px-3">قيد التنفيذ</th>
                <th className="py-2.5 px-3">مؤشر الإنجاز</th>
                <th className="py-2.5 px-3">الوسام الممنوح</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f8f9fc]">
              {reportData.achievements.map((item: any) => (
                <tr key={item.user_id} className="hover:bg-[#f8fafd] transition-colors">
                  <td className="py-3 px-3 font-bold text-[#18181c]">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#fed7aa] flex items-center justify-center text-xs">
                        {item.avatar_badge || item.user_name[0]}
                      </span>
                      <span>{item.user_name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-[#627084]">{item.job_title}</td>
                  <td className="py-3 px-3 font-extrabold text-emerald-600">
                    {item.completed_tasks}
                  </td>
                  <td className="py-3 px-3 font-extrabold text-blue-600">
                    {item.in_progress_tasks}
                  </td>
                  <td className="py-3 px-3 font-extrabold text-[#18181c]">
                    {item.effectiveness_score}%
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-[#f4f7fb] text-[#7c3aed] font-bold text-[11px] border border-[#e2e8f0]">
                      {item.badge}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Bar */}
      <div className="p-6 rounded-3xl bg-white border border-[#f1f3f7] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div>
          <h4 className="font-extrabold text-base text-[#18181c]">
            تصدير {periodLabels[period]}
          </h4>
          <p className="text-xs text-[#8a94a6] mt-0.5">
            تصدير نسخة كاملة بصيغة CSV أو تجهيزها للطباعة بصيغة PDF فوراً
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleExportCsv}
            variant="secondary"
            size="md"
            icon={<Download className="w-4 h-4 text-[#7c3aed]" />}
          >
            تصدير CSV
          </Button>

          <Button
            onClick={() => window.print()}
            variant="outline"
            size="md"
            icon={<Printer className="w-4 h-4" />}
          >
            طباعة التقرير (PDF)
          </Button>
        </div>
      </div>
    </div>
  );
}
