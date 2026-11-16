'use client';

import React, { useState } from 'react';
import { Goal } from '@/lib/types/database';
import { Badge } from '../ui/badge';
import { Target, Calendar, CheckCircle2, TrendingUp, Edit2 } from 'lucide-react';
import { updateGoalProgress } from '@/lib/supabase/actions';

interface GoalCardProps {
  goal: Goal;
  isManager?: boolean;
  onUpdated?: () => void;
}

export function GoalCard({ goal, isManager = false, onUpdated }: GoalCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [progressVal, setProgressVal] = useState(goal.progress);

  const priorityMap: Record<
    string,
    { label: string; variant: 'rose' | 'amber' | 'blue' | 'slate' }
  > = {
    critical: { label: 'أولوية حرجة', variant: 'rose' },
    high: { label: 'أولوية عالية', variant: 'amber' },
    medium: { label: 'أولوية متوسطة', variant: 'blue' },
    low: { label: 'أولوية منخفضة', variant: 'slate' },
  };

  const priority = priorityMap[goal.phase_priority] || priorityMap.medium;

  const handleSaveProgress = async () => {
    await updateGoalProgress(goal.id, progressVal);
    setIsEditing(false);
    onUpdated?.();
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#f1edfa] hover:border-[#e9d5ff] shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Badge variant={priority.variant} size="sm">
            {priority.label}
          </Badge>
          <Badge variant={goal.horizon === 'current' ? 'purple' : 'slate'} size="sm">
            {goal.horizon === 'current' ? 'الربع الحالي' : 'مستقبلي'}
          </Badge>
        </div>

        {goal.target_date && (
          <div className="flex items-center gap-1.5 text-xs text-[#8c829e] font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>{goal.target_date}</span>
          </div>
        )}
      </div>

      <h4 className="text-lg font-bold text-[#1e112a] mb-2">{goal.title}</h4>
      {goal.description && (
        <p className="text-sm text-[#5f556d] leading-relaxed mb-4">{goal.description}</p>
      )}

      {/* Progress Bar & Slider */}
      <div className="mt-4 pt-4 border-t border-[#f1edfa]">
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          <span className="text-[#5f556d] flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-[#581c87]" />
            <span>نسبة إنجاز الهدف</span>
          </span>
          <span className="text-[#3b0764] text-sm">{goal.progress}%</span>
        </div>

        {/* Progress Visual Bar */}
        <div className="w-full h-3 bg-[#f5f3ff] rounded-full overflow-hidden border border-[#e9d5ff]">
          <div
            className="h-full bg-linear-to-r from-[#3b0764] to-[#7e22ce] rounded-full transition-all duration-500"
            style={{ width: `${goal.progress}%` }}
          />
        </div>

        {/* Manager In-Place Progress Adjuster */}
        {isManager && (
          <div className="mt-3">
            {isEditing ? (
              <div className="flex items-center gap-3 bg-[#faf8fd] p-2.5 rounded-2xl border border-[#e9d5ff]">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressVal}
                  onChange={(e) => setProgressVal(Number(e.target.value))}
                  className="flex-1 accent-[#3b0764]"
                />
                <span className="text-xs font-bold w-10 text-center">{progressVal}%</span>
                <button
                  onClick={handleSaveProgress}
                  className="text-xs px-3 py-1 bg-[#3b0764] text-white rounded-xl font-bold cursor-pointer"
                >
                  حفظ
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-xs px-2 py-1 text-[#8c829e] hover:text-[#1e112a] cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="mt-1 text-xs text-[#581c87] hover:text-[#3b0764] font-medium flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>تعديل نسبة الإنجاز يدوياً</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
