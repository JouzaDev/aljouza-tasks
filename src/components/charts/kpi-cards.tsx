import React from 'react';
import { CheckSquare, AlertCircle, Clock, TrendingUp } from 'lucide-react';

interface KpiCardsProps {
  activeTasksCount: number;
  overdueTasksCount: number;
  pendingReviewCount: number;
  averageGoalsProgress: number;
}

export function KpiCards({
  activeTasksCount,
  overdueTasksCount,
  pendingReviewCount,
  averageGoalsProgress,
}: KpiCardsProps) {
  const cards = [
    {
      title: 'إجمالي المهام النشطة',
      value: activeTasksCount,
      subtitle: 'قيد التخطيط والتنفيذ',
      icon: CheckSquare,
      color: 'bg-[#f5f3ff] text-[#3b0764] border-[#e9d5ff]',
      textColor: 'text-[#3b0764]',
    },
    {
      title: 'بانتظار الاعتماد',
      value: pendingReviewCount,
      subtitle: 'تتطلب قرار المدير',
      icon: Clock,
      color: 'bg-[#fffbeb] text-[#d97706] border-[#fde68a]',
      textColor: 'text-[#d97706]',
    },
    {
      title: 'مهام متأخرة عن موعدها',
      value: overdueTasksCount,
      subtitle: 'تجاوزت تاريخ التسليم',
      icon: AlertCircle,
      color: 'bg-[#fff1f2] text-[#e11d48] border-[#fecdd3]',
      textColor: 'text-[#e11d48]',
    },
    {
      title: 'متوسط إنجاز الأهداف',
      value: `${averageGoalsProgress}%`,
      subtitle: 'الأهداف الاستراتيجية',
      icon: TrendingUp,
      color: 'bg-[#ecfdf5] text-[#059669] border-[#a7f3d0]',
      textColor: 'text-[#059669]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-3xl p-6 border border-[#f1edfa] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-[#5f556d]">{card.title}</span>
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${card.color}`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div>
              <div className={`text-3xl sm:text-4xl font-extrabold ${card.textColor}`}>
                {card.value}
              </div>
              <p className="text-xs text-[#8c829e] mt-1.5 font-medium">{card.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
