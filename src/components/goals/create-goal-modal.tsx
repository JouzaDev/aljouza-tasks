'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';
import { GoalHorizon, PhasePriority } from '@/lib/types/database';
import { createGoal } from '@/lib/supabase/actions';
import { Target } from 'lucide-react';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalCreated?: () => void;
}

export function CreateGoalModal({ isOpen, onClose, onGoalCreated }: CreateGoalModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [horizon, setHorizon] = useState<GoalHorizon>('current');
  const [priority, setPriority] = useState<PhasePriority>('high');
  const [targetDate, setTargetDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      await createGoal({
        title: title.trim(),
        description: description.trim() || undefined,
        horizon,
        phase_priority: priority,
        target_date: targetDate || undefined,
      });
      setTitle('');
      setDescription('');
      onGoalCreated?.();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="إضافة هدف استراتيجي جديد (OKR)"
      description="حدد خطط منصة الجوزاء والأولويات للمراحل القادمة"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-[#1e112a] mb-1.5">
            عنوان الهدف <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: إطلاق المعسكر التدريبي للربع الأول..."
            className="w-full px-4 py-3 rounded-2xl border border-[#e9d5ff] focus:outline-none focus:ring-2 focus:ring-[#3b0764] text-base bg-[#fcfbfe]"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-[#1e112a] mb-1.5">
            تفاصيل ومؤشرات النجاح
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="اكتب المعايير التي يقاس بها نجاح هذا الهدف..."
            className="w-full px-4 py-3 rounded-2xl border border-[#e9d5ff] focus:outline-none focus:ring-2 focus:ring-[#3b0764] text-base bg-[#fcfbfe] resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-[#1e112a] mb-1.5">
              الإطار الزمني
            </label>
            <select
              value={horizon}
              onChange={(e) => setHorizon(e.target.value as GoalHorizon)}
              className="w-full px-4 py-3 rounded-2xl border border-[#e9d5ff] focus:outline-none focus:ring-2 focus:ring-[#3b0764] text-sm bg-[#fcfbfe]"
            >
              <option value="current">الربع الحالي (Current)</option>
              <option value="future">خطط مستقبلية (Future)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#1e112a] mb-1.5">الأولوية</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as PhasePriority)}
              className="w-full px-4 py-3 rounded-2xl border border-[#e9d5ff] focus:outline-none focus:ring-2 focus:ring-[#3b0764] text-sm bg-[#fcfbfe]"
            >
              <option value="critical">حرجة جداً</option>
              <option value="high">عالية</option>
              <option value="medium">متوسطة</option>
              <option value="low">منخفضة</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#1e112a] mb-1.5">
              تاريخ الاستهداف
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-[#e9d5ff] focus:outline-none focus:ring-2 focus:ring-[#3b0764] text-sm bg-[#fcfbfe]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f1edfa]">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            icon={<Target className="w-5 h-5" />}
          >
            حفظ الهدف
          </Button>
        </div>
      </form>
    </Modal>
  );
}
