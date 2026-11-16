'use client';

import React, { useState, useEffect } from 'react';
import {
  getCurrentUser,
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  getTasks,
  getProfiles,
} from '@/lib/supabase/actions';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { CreateTaskModal } from '@/components/tasks/create-task-modal';
import {
  Target,
  PlusCircle,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Sparkles,
  Edit2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { Goal, Profile, Task, PhasePriority } from '@/lib/types/database';

export default function GoalsPage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal: Create Goal
  const [createGoalOpen, setCreateGoalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PhasePriority>('high');
  const [targetDate, setTargetDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modal: Edit Goal
  const [editGoalOpen, setEditGoalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<PhasePriority>('high');
  const [editTargetDate, setEditTargetDate] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'completed' | 'paused'>('active');

  // Modal: Delete Goal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);

  // Modal: Link Task to Goal
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | undefined>(undefined);

  const loadData = async () => {
    try {
      const [u, g, t, pr] = await Promise.all([
        getCurrentUser(),
        getGoals(),
        getTasks(),
        getProfiles(),
      ]);
      setCurrentUser(u);
      setGoals(g);
      setTasks(t);
      setProfiles(pr);
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

  const isManager = currentUser.role === 'manager';

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      await createGoal({
        title: title.trim(),
        description: description.trim() || undefined,
        phase_priority: priority,
        target_date: targetDate || undefined,
      });
      setTitle('');
      setDescription('');
      setTargetDate('');
      setCreateGoalOpen(false);
      await loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setEditTitle(goal.title);
    setEditDescription(goal.description || '');
    setEditPriority(goal.phase_priority);
    setEditTargetDate(goal.target_date || '');
    setEditStatus(goal.status);
    setEditGoalOpen(true);
  };

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal || !editTitle.trim()) return;

    setSubmitting(true);
    try {
      await updateGoal(editingGoal.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        phase_priority: editPriority,
        target_date: editTargetDate || undefined,
        status: editStatus,
      });
      setEditGoalOpen(false);
      setEditingGoal(null);
      await loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (goalId: string) => {
    setDeletingGoalId(goalId);
    setDeleteModalOpen(true);
  };

  const handleDeleteGoal = async () => {
    if (!deletingGoalId) return;
    setSubmitting(true);
    try {
      await deleteGoal(deletingGoalId);
      setDeleteModalOpen(false);
      setDeletingGoalId(null);
      await loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenTaskForGoal = (goalId: string) => {
    setSelectedGoalId(goalId);
    setCreateTaskOpen(true);
  };

  const priorityMap: Record<
    PhasePriority,
    { label: string; variant: 'rose' | 'amber' | 'emerald' | 'purple' | 'slate' }
  > = {
    critical: { label: 'حرجة جداً', variant: 'rose' },
    high: { label: 'أولوية عالية', variant: 'amber' },
    medium: { label: 'أولوية متوسطة', variant: 'purple' },
    low: { label: 'أولوية منخفضة', variant: 'slate' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Header
        currentUser={currentUser}
        pendingReviewCount={tasks.filter((t) => t.status === 'waiting_review').length}
      />

      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#f1f3f7] shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-[#18181c] flex items-center gap-2">
            <Target className="w-6 h-6 text-[#7c3aed]" />
            <span>الأهداف المستقبلية (OKRs)</span>
          </h2>
          <p className="text-xs text-[#8a94a6] mt-0.5">
            ربط الأهداف المستقبلية بالمهام اليومية لاحتساب نسبة التقدم بدقة
          </p>
        </div>

        {isManager && (
          <Button
            onClick={() => setCreateGoalOpen(true)}
            variant="primary"
            size="md"
            icon={<PlusCircle className="w-5 h-5 text-amber-300" />}
          >
            إضافة هدف مستقبلي جديد
          </Button>
        )}
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {goals.map((goal) => {
          const linkedTasks = tasks.filter((t) => t.goal_id === goal.id);
          const completedCount = linkedTasks.filter((t) => t.status === 'done').length;
          const pBadge = priorityMap[goal.phase_priority] || priorityMap.high;

          return (
            <div
              key={goal.id}
              className="bg-white rounded-3xl p-5 border border-[#f1f3f7] hover:border-[#ddd6fe] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Badges & Actions */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={pBadge.variant} size="sm">
                      {pBadge.label}
                    </Badge>
                    <Badge variant={goal.status === 'completed' ? 'emerald' : 'purple'} size="sm">
                      {goal.status === 'completed' ? 'مكتمل' : 'هدف استراتيجي'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    {goal.target_date && (
                      <span className="text-xs text-[#8a94a6] flex items-center gap-1 font-medium ml-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{goal.target_date}</span>
                      </span>
                    )}
                    {isManager && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(goal)}
                          className="p-1.5 rounded-xl hover:bg-[#f4f7fb] text-[#8a94a6] hover:text-[#7c3aed] transition-colors cursor-pointer"
                          title="تعديل الهدف"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(goal.id)}
                          className="p-1.5 rounded-xl hover:bg-rose-50 text-[#8a94a6] hover:text-rose-600 transition-colors cursor-pointer"
                          title="حذف الهدف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-[#18181c] mb-2">{goal.title}</h3>

                {goal.description && (
                  <p className="text-xs text-[#627084] leading-relaxed mb-4">
                    {goal.description}
                  </p>
                )}

                {/* Progress Bar (Auto computed from linked tasks) */}
                <div className="p-3.5 rounded-2xl bg-[#f8fafd] border border-[#e2e8f0] mb-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#627084] flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-[#7c3aed]" />
                      <span>مستوى التقدم الفعلي المحسوب:</span>
                    </span>
                    <span className="text-[#18181c] text-sm">{goal.progress}%</span>
                  </div>

                  <div className="w-full h-2.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-[#7c3aed] to-[#38bdf8] rounded-full transition-all duration-500"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#8a94a6] pt-1">
                    <span>المهام المنجزة المرتبطة:</span>
                    <strong className="text-[#18181c]">
                      {completedCount} من أصل {linkedTasks.length} مهام
                    </strong>
                  </div>
                </div>

                {/* Linked Tasks List */}
                <div className="mb-4">
                  <span className="text-xs font-bold text-[#18181c] block mb-2">
                    المهام الحالية الموجهة لتحقيق هذا الهدف:
                  </span>
                  {linkedTasks.length === 0 ? (
                    <p className="text-[11px] text-[#8a94a6] bg-[#faf8fd] p-2.5 rounded-xl border border-dashed border-[#e2e8f0]">
                      لم يتم ربط مهام حالية بهذا الهدف بعد. اضغط أدناه لإسناد مهمة.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {linkedTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between text-xs p-2 rounded-xl border border-[#f1f3f7] bg-white"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                task.status === 'done' ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                            />
                            <span className="font-bold text-[#18181c]">{task.title}</span>
                          </div>
                          <span className="text-[10px] text-[#8a94a6]">
                            {task.assigned_profile?.full_name || 'موظف'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button: Link New Task */}
              {isManager && (
                <div className="pt-3 border-t border-[#f1f3f7]">
                  <Button
                    onClick={() => handleOpenTaskForGoal(goal.id)}
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    icon={<Plus className="w-4 h-4 text-[#7c3aed]" />}
                  >
                    إسناد مهمة جديدة لتحقيق هذا الهدف
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: Create Goal */}
      <Modal
        isOpen={createGoalOpen}
        onClose={() => setCreateGoalOpen(false)}
        title="إضافة هدف مستقبلي استراتيجي"
        description="حدد عنوان الهدف والأولوية، وسيتم احتساب تقدمه تلقائياً بناءً على المهام"
      >
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#18181c] mb-1.5">
              عنوان الهدف المستقبلي <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: تدريب وتأهيل 500 مستفيد خلال الربع الأول"
              className="w-full px-4 py-3 rounded-2xl border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-sm bg-[#f8fafd]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#18181c] mb-1.5">
              تفاصيل ومؤشرات النجاح
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب المعايير التي يقاس بها نجاح هذا الهدف..."
              className="w-full px-4 py-3 rounded-2xl border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-sm bg-[#f8fafd] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#18181c] mb-1.5">الأولوية</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PhasePriority)}
                className="w-full px-4 py-3 rounded-2xl border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-sm bg-[#f8fafd]"
              >
                <option value="critical">حرجة جداً</option>
                <option value="high">عالية</option>
                <option value="medium">متوسطة</option>
                <option value="low">منخفضة</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#18181c] mb-1.5">
                تاريخ الاستهداف
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-sm bg-[#f8fafd]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f1f3f7]">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setCreateGoalOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={submitting}
              icon={<PlusCircle className="w-4 h-4" />}
            >
              حفظ الهدف
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Goal */}
      <Modal
        isOpen={editGoalOpen}
        onClose={() => setEditGoalOpen(false)}
        title="تعديل الهدف المستقبلي"
        description="تحديث بيانات الهدف ومؤشرات نجاحه"
      >
        <form onSubmit={handleUpdateGoal} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#18181c] mb-1.5">
              عنوان الهدف <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-sm bg-[#f8fafd]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#18181c] mb-1.5">
              التفاصيل
            </label>
            <textarea
              rows={3}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-sm bg-[#f8fafd] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#18181c] mb-1.5">الأولوية</label>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as PhasePriority)}
                className="w-full px-4 py-3 rounded-2xl border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-sm bg-[#f8fafd]"
              >
                <option value="critical">حرجة جداً</option>
                <option value="high">عالية</option>
                <option value="medium">متوسطة</option>
                <option value="low">منخفضة</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#18181c] mb-1.5">الحالة</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as any)}
                className="w-full px-4 py-3 rounded-2xl border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-sm bg-[#f8fafd]"
              >
                <option value="active">نشط</option>
                <option value="completed">مكتمل</option>
                <option value="paused">معلق مؤقتاً</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#18181c] mb-1.5">
              تاريخ الاستهداف
            </label>
            <input
              type="date"
              value={editTargetDate}
              onChange={(e) => setEditTargetDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-sm bg-[#f8fafd]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f1f3f7]">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setEditGoalOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={submitting}
            >
              حفظ التعديلات
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Delete Goal Confirmation */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="تأكيد حذف الهدف المستقبلي"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-6 h-6 shrink-0 text-rose-600" />
            <p className="text-xs leading-relaxed">
              هل أنت متأكد من رغبتك في حذف هذا الهدف؟ سيتم فك ارتباط أي مهام مربوطة به دون حذفها.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => setDeleteModalOpen(false)}
            >
              تراجع
            </Button>
            <Button
              variant="danger"
              size="md"
              isLoading={submitting}
              onClick={handleDeleteGoal}
              icon={<Trash2 className="w-4 h-4" />}
            >
              حذف نهائي
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Create Task for this Goal */}
      <CreateTaskModal
        isOpen={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
        onTaskCreated={loadData}
        profiles={profiles}
        goals={goals}
        partners={[]}
        preselectedGoalId={selectedGoalId}
      />
    </div>
  );
}
