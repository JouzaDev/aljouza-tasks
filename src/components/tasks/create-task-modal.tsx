'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';
import { Profile, Goal, Partnership, TaskPhase, TaskPriority } from '@/lib/types/database';
import { createTask } from '@/lib/supabase/actions';
import { PlusCircle } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: Profile[];
  goals: Goal[];
  partnerships: Partnership[];
  onTaskCreated?: () => void;
  defaultPartnershipId?: string;
  defaultGoalId?: string;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  profiles,
  goals,
  partnerships,
  onTaskCreated,
  defaultPartnershipId,
  defaultGoalId,
}: CreateTaskModalProps) {
  const employees = profiles.filter((p) => p.role === 'employee');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState(employees[0]?.id || '');
  const [goalId, setGoalId] = useState(defaultGoalId || '');
  const [partnershipId, setPartnershipId] = useState(defaultPartnershipId || '');
  const [phase, setPhase] = useState<TaskPhase>('planning');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !assignedTo) return;

    setIsLoading(true);
    try {
      await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        assigned_to: assignedTo,
        goal_id: goalId || undefined,
        partnership_id: partnershipId || undefined,
        phase,
        priority,
        due_date: dueDate || undefined,
      });
      // Reset form
      setTitle('');
      setDescription('');
      onTaskCreated?.();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="إسناد وتوزيع مهمة جديدة"
      description="حدد تفاصيل المهمة والموظف المسؤول من فريق منصة الجوزاء"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-bold text-[#1e112a] mb-1.5">
            عنوان المهمة <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: إعداد محتوى الورشة التدريبية..."
            className="w-full px-4 py-3 rounded-2xl border border-[#e9d5ff] focus:outline-none focus:ring-2 focus:ring-[#3b0764] text-base bg-[#fcfbfe]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-[#1e112a] mb-1.5">
            الوصف والتفاصيل
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="اكتب التوجيهات والمخرجات المطلوبة..."
            className="w-full px-4 py-3 rounded-2xl border border-[#e9d5ff] focus:outline-none focus:ring-2 focus:ring-[#3b0764] text-base bg-[#fcfbfe] resize-none"
          />
        </div>

        {/* Assignee & Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-[#1e112a] mb-1.5">
              الموظف المسؤول <span className="text-rose-500">*</span>
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-[#e9d5ff] focus:outline-none focus:ring-2 focus:ring-[#3b0764] text-base bg-[#fcfbfe]"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name} ({emp.job_title})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#1e112a] mb-1.5">
              تاريخ التسليم المتوقع
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-[#e9d5ff] focus:outline-none focus:ring-2 focus:ring-[#3b0764] text-base bg-[#fcfbfe]"
            >
            </input>
          </div>
        </div>

        {/* Phase & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-[#1e112a] mb-1.5">
              مرحلة العمل (Phase)
            </label>
            <select
              value={phase}
              onChange={(e) => setPhase(e.target.value as TaskPhase)}
              className="w-full px-4 py-3 rounded-2xl border border-[#e9d5ff] focus:outline-none focus:ring-2 focus:ring-[#3b0764] text-base bg-[#fcfbfe]"
            >
              <option value="planning">التخطيط والإعداد</option>
              <option value="execution">التنفيذ الفعلي</option>
              <option value="review">المراجعة والاعتماد</option>
              <option value="closed">مغلق ومعتمد</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#1e112a] mb-1.5">الأولوية</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full px-4 py-3 rounded-2xl border border-[#e9d5ff] focus:outline-none focus:ring-2 focus:ring-[#3b0764] text-base bg-[#fcfbfe]"
            >
              <option value="urgent">عاجل ومهم (أعلى أولوية)</option>
              <option value="high">أولوية عالية</option>
              <option value="medium">أولوية متوسطة</option>
              <option value="low">أولوية منخفضة</option>
            </select>
          </div>
        </div>

        {/* Goal & Partnership Linking */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-[#1e112a] mb-1.5">
              ربط بهدف استراتيجي (اختياري)
            </label>
            <select
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-[#e9d5ff] focus:outline-none focus:ring-2 focus:ring-[#3b0764] text-sm bg-[#fcfbfe]"
            >
              <option value="">-- بدون ربط بهدف --</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#1e112a] mb-1.5">
              ربط ببرنامج أو شراكة (اختياري)
            </label>
            <select
              value={partnershipId}
              onChange={(e) => setPartnershipId(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-[#e9d5ff] focus:outline-none focus:ring-2 focus:ring-[#3b0764] text-sm bg-[#fcfbfe]"
            >
              <option value="">-- بدون ربط بشراكة --</option>
              {partnerships.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.partner_name} - {p.program_title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f1edfa]">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            icon={<PlusCircle className="w-5 h-5" />}
          >
            إسناد المهمة الآن
          </Button>
        </div>
      </form>
    </Modal>
  );
}
