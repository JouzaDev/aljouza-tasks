'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';
import { Profile, Goal, Project, Partner, TaskPhase, TaskPriority } from '@/lib/types/database';
import { createTask, getProjects, getPartners } from '@/lib/supabase/actions';
import { PlusCircle } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: Profile[];
  goals: Goal[];
  partnerships?: any[];
  onTaskCreated?: () => void;
  defaultPartnershipId?: string;
  defaultGoalId?: string;
  defaultProjectId?: string;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  profiles,
  goals,
  onTaskCreated,
  defaultPartnershipId,
  defaultGoalId,
  defaultProjectId,
}: CreateTaskModalProps) {
  const employees = profiles.filter((p) => p.role === 'employee');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState(employees[0]?.id || profiles[0]?.id || '');
  const [goalId, setGoalId] = useState(defaultGoalId || '');
  const [projectId, setProjectId] = useState(defaultProjectId || '');
  const [partnerId, setPartnerId] = useState(defaultPartnershipId || '');
  const [phase, setPhase] = useState<TaskPhase>('planning');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [partnersList, setPartnersList] = useState<Partner[]>([]);

  useEffect(() => {
    if (isOpen) {
      getProjects().then((p) => setProjectsList(p));
      getPartners().then((prt) => setPartnersList(prt));
    }
  }, [isOpen]);

  useEffect(() => {
    if (defaultGoalId) setGoalId(defaultGoalId);
    if (defaultPartnershipId) setPartnerId(defaultPartnershipId);
    if (defaultProjectId) setProjectId(defaultProjectId);
  }, [defaultGoalId, defaultPartnershipId, defaultProjectId]);

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
        project_id: projectId || undefined,
        partner_id: partnerId || undefined,
        phase,
        priority,
        due_date: dueDate || undefined,
      });
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
      description="حدد تفاصيل المهمة والمسؤول وربطها بالمشروع أو الهدف أو الشريك"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-bold text-[#18181c] mb-1.5">
            عنوان المهمة <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: إعداد خطة إطلاق تطبيق taska.aljouza.sa..."
            className="w-full px-4 py-3 rounded-2xl border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-sm bg-[#f8fafd]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-[#18181c] mb-1.5">
            الوصف والتفاصيل
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="اكتب التوجيهات والمخرجات المطلوبة..."
            className="w-full px-4 py-3 rounded-2xl border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-sm bg-[#f8fafd] resize-none"
          />
        </div>

        {/* Assignee & Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-[#18181c] mb-1.5">
              المسؤول عن المهمة <span className="text-rose-500">*</span>
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-sm bg-[#f8fafd]"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.role === 'manager' ? 'المدير' : p.job_title})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#18181c] mb-1.5">
              تاريخ التسليم المتوقع
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-sm bg-[#f8fafd]"
            />
          </div>
        </div>

        {/* Phase & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-[#18181c] mb-1.5">
              المرحلة (Phase)
            </label>
            <select
              value={phase}
              onChange={(e) => setPhase(e.target.value as TaskPhase)}
              className="w-full px-4 py-3 rounded-2xl border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-sm bg-[#f8fafd]"
            >
              <option value="planning">التخطيط والإعداد</option>
              <option value="execution">التنفيذ الفعلي</option>
              <option value="review">المراجعة والاعتماد</option>
              <option value="closed">مغلق ومعتمد</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#18181c] mb-1.5">الأولوية</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full px-4 py-3 rounded-2xl border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-sm bg-[#f8fafd]"
            >
              <option value="urgent">عاجل ومهم</option>
              <option value="high">أولوية عالية</option>
              <option value="medium">أولوية متوسطة</option>
              <option value="low">أولوية منخفضة</option>
            </select>
          </div>
        </div>

        {/* Three Linkings: Goal, Project, Partner */}
        <div className="space-y-3 pt-2 border-t border-[#f1f3f7]">
          <span className="text-xs font-bold text-[#7c3aed] block">
            خيارات الربط الاستراتيجي (اختياري):
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#627084] mb-1">
                ربط بهدف مستقبلي:
              </label>
              <select
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] text-xs bg-[#f8fafd] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
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
              <label className="block text-[11px] font-bold text-[#627084] mb-1">
                ربط بمشروع مستقل:
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] text-xs bg-[#f8fafd] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
              >
                <option value="">-- بدون ربط بمشروع --</option>
                {projectsList.map((prj) => (
                  <option key={prj.id} value={prj.id}>
                    {prj.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#627084] mb-1">
                ربط بشريك نجاح:
              </label>
              <select
                value={partnerId}
                onChange={(e) => setPartnerId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] text-xs bg-[#f8fafd] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
              >
                <option value="">-- بدون ربط بشريك --</option>
                {partnersList.map((prt) => (
                  <option key={prt.id} value={prt.id}>
                    {prt.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f1f3f7]">
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
