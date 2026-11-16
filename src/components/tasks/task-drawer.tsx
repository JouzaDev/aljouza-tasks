'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  User,
  Target,
  Handshake,
  CheckCircle2,
  Clock,
  Send,
  ShieldCheck,
  AlertCircle,
  FileCheck2,
  MessageSquare,
  CornerUpLeft,
  Edit2,
  Trash2,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { Task, Profile, ActivityLog, TaskStatus, TaskPriority, TaskPhase } from '@/lib/types/database';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  updateTaskStatus,
  approveTask,
  updateTask,
  deleteTask,
  addActivityLog,
  getTaskLogs,
  getProfiles,
} from '@/lib/supabase/actions';

interface TaskDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: Profile;
  onTaskUpdated?: () => void;
}

export function TaskDrawer({
  task,
  isOpen,
  onClose,
  currentUser,
  onTaskUpdated,
}: TaskDrawerProps) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAssignee, setEditAssignee] = useState('');
  const [editPriority, setEditPriority] = useState<TaskPriority>('medium');
  const [editDueDate, setEditDueDate] = useState('');

  // Delete Confirmation State
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (task && isOpen) {
      setLoadingLogs(true);
      getTaskLogs(task.id)
        .then((data) => setLogs(data))
        .finally(() => setLoadingLogs(false));

      getProfiles().then(setProfiles);

      // Initialize edit fields
      setEditTitle(task.title);
      setEditDescription(task.description || '');
      setEditAssignee(task.assigned_to);
      setEditPriority(task.priority);
      setEditDueDate(task.due_date ? task.due_date.split('T')[0] : '');
      setIsEditing(false);
      setConfirmDelete(false);
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const isManager = currentUser.role === 'manager';
  const isAssignee = task.assigned_to === currentUser.id;

  const handleStatusChange = async (nextStatus: TaskStatus) => {
    setIsSubmitting(true);
    try {
      await updateTaskStatus(task.id, nextStatus, newComment || undefined);
      setNewComment('');
      onTaskUpdated?.();
      const updatedLogs = await getTaskLogs(task.id);
      setLogs(updatedLogs);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproval = async (approved: boolean) => {
    setIsSubmitting(true);
    try {
      await approveTask(task.id, approved, newComment || undefined);
      setNewComment('');
      onTaskUpdated?.();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await updateTask(task.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        assigned_to: editAssignee,
        priority: editPriority,
        due_date: editDueDate || undefined,
      });
      setIsEditing(false);
      onTaskUpdated?.();
      const updatedLogs = await getTaskLogs(task.id);
      setLogs(updatedLogs);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await deleteTask(task.id);
      onTaskUpdated?.();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await addActivityLog(task.id, 'إضافة ملاحظة', newComment.trim());
      setNewComment('');
      const updatedLogs = await getTaskLogs(task.id);
      setLogs(updatedLogs);
      onTaskUpdated?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#18181c]/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="p-5 border-b border-[#f1f3f7] flex items-start justify-between bg-[#f8fafd]">
          <div className="flex-1 mr-2">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="purple" size="sm">
                المرحلة: {task.phase}
              </Badge>
              {task.manager_approved && (
                <Badge variant="emerald" size="sm">
                  معتمدة ومغلقة
                </Badge>
              )}
            </div>
            {!isEditing ? (
              <h3 className="text-lg font-extrabold text-[#18181c]">{task.title}</h3>
            ) : (
              <span className="text-xs font-bold text-[#7c3aed]">نمط تعديل المهمة</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isManager && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-[#8a94a6] hover:text-[#7c3aed] hover:bg-white rounded-xl transition-colors cursor-pointer"
                title="تعديل تفاصيل المهمة"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-[#8a94a6] hover:text-[#18181c] hover:bg-white rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* If Editing Mode */}
          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="space-y-4 p-4 rounded-3xl bg-[#f8fafd] border border-[#e2e8f0]">
              <div>
                <label className="block text-xs font-bold text-[#18181c] mb-1">
                  عنوان المهمة <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#18181c] mb-1">الوصف</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#18181c] mb-1">الموظف المسؤول</label>
                  <select
                    value={editAssignee}
                    onChange={(e) => setEditAssignee(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                  >
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name} ({p.role === 'manager' ? 'المدير' : p.job_title})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#18181c] mb-1">الأولوية</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                  >
                    <option value="urgent">عاجل جداً</option>
                    <option value="high">عالية</option>
                    <option value="medium">متوسطة</option>
                    <option value="low">منخفضة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#18181c] mb-1">تاريخ التسليم</label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                  icon={<Save className="w-3.5 h-3.5" />}
                >
                  حفظ التعديلات
                </Button>
              </div>
            </form>
          ) : (
            /* Details View */
            <div className="space-y-4">
              <div>
                <h5 className="text-xs font-bold text-[#8a94a6] mb-1">وصف المهمة</h5>
                <p className="text-sm text-[#18181c] bg-[#f8fafd] p-4 rounded-2xl border border-[#f1f3f7] leading-relaxed whitespace-pre-wrap">
                  {task.description || 'لا يوجد وصف تفصيلي.'}
                </p>
              </div>

              {/* Grid Attributes */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl border border-[#f1f3f7] bg-white">
                  <span className="text-[#8a94a6] block mb-0.5">الموظف المسؤول</span>
                  <span className="font-bold text-[#18181c]">
                    {task.assigned_profile?.full_name || 'غير مسند'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl border border-[#f1f3f7] bg-white">
                  <span className="text-[#8a94a6] block mb-0.5">تاريخ التسليم</span>
                  <span className="font-bold text-[#18181c]">
                    {task.due_date ? task.due_date.split('T')[0] : 'غير محدد'}
                  </span>
                </div>

                {task.goal && (
                  <div className="p-3 rounded-2xl border border-[#f1f3f7] bg-[#faf5ff] col-span-2">
                    <span className="text-[10px] text-[#7c3aed] block font-bold mb-0.5">الهدف المستقبلي المرتبط</span>
                    <span className="font-extrabold text-[#18181c] text-xs">{task.goal.title}</span>
                  </div>
                )}

                {task.project && (
                  <div className="p-3 rounded-2xl border border-[#f1f3f7] bg-[#eff6ff] col-span-2">
                    <span className="text-[10px] text-[#2563eb] block font-bold mb-0.5">المشروع المرتبط</span>
                    <span className="font-extrabold text-[#18181c] text-xs">{task.project.title}</span>
                  </div>
                )}

                {task.partner && (
                  <div className="p-3 rounded-2xl border border-[#f1f3f7] bg-[#ecfdf5] col-span-2">
                    <span className="text-[10px] text-[#059669] block font-bold mb-0.5">شريك النجاح</span>
                    <span className="font-extrabold text-[#18181c] text-xs">{task.partner.name}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Area: Manager Approval or Employee Status update */}
          <div className="p-4 rounded-3xl bg-[#f5f3ff] border border-[#e9d5ff] space-y-3">
            <h4 className="text-xs font-bold text-[#3b0764] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>إجراءات المهمة</span>
            </h4>

            {/* Manager Actions */}
            {isManager && (
              <div className="space-y-2.5">
                <p className="text-[11px] text-[#5f556d]">
                  بصفتك المدير، يمكنك اعتماد المهمة أو طلب تعديلها من الموظف:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => handleApproval(true)}
                    variant="primary"
                    size="sm"
                    isLoading={isSubmitting}
                    icon={<CheckCircle2 className="w-4 h-4 text-emerald-300" />}
                    className="flex-1"
                  >
                    اعتماد وإغلاق المهمة
                  </Button>
                  <Button
                    onClick={() => handleApproval(false)}
                    variant="outline"
                    size="sm"
                    isLoading={isSubmitting}
                    icon={<CornerUpLeft className="w-4 h-4 text-rose-500" />}
                  >
                    طلب تعديل
                  </Button>
                </div>
              </div>
            )}

            {/* Employee Actions */}
            {!isManager && isAssignee && (
              <div className="space-y-2.5">
                <p className="text-[11px] text-[#5f556d]">تحديث مرحلة العمل الخاصة بك:</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleStatusChange('in_progress')}
                    variant={task.status === 'in_progress' ? 'secondary' : 'outline'}
                    size="sm"
                    disabled={task.status === 'in_progress' || isSubmitting}
                  >
                    بدء العمل (قيد التنفيذ)
                  </Button>
                  <Button
                    onClick={() => handleStatusChange('waiting_review')}
                    variant="primary"
                    size="sm"
                    disabled={task.status === 'waiting_review' || isSubmitting}
                    icon={<FileCheck2 className="w-4 h-4 text-amber-300" />}
                  >
                    إرسال للاعتماد
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Activity Logs Timeline */}
          <div>
            <h4 className="text-xs font-bold text-[#18181c] mb-2.5 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#7c3aed]" />
              <span>سجل النشاط والملاحظات ({logs.length})</span>
            </h4>

            {loadingLogs ? (
              <div className="text-center py-3 text-xs text-[#8a94a6]">جاري التحميل...</div>
            ) : logs.length === 0 ? (
              <div className="text-center py-3 text-xs text-[#8a94a6] bg-[#f8fafd] rounded-2xl border border-[#f1f3f7]">
                لا توجد سجلات بعد.
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-white border border-[#f1f3f7] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[#8a94a6]">
                      <span className="font-bold text-[#7c3aed]">
                        {log.user_profile?.full_name || 'أحد الأعضاء'}
                      </span>
                      <span className="text-[10px]">
                        {new Intl.DateTimeFormat('ar-SA', {
                          hour: 'numeric',
                          minute: 'numeric',
                          day: 'numeric',
                          month: 'short',
                        }).format(new Date(log.created_at))}
                      </span>
                    </div>
                    <p className="font-semibold text-[#18181c]">{log.action}</p>
                    {log.details && (
                      <p className="text-[#5f697a] bg-[#f8fafd] p-2 rounded-xl mt-1 leading-relaxed">
                        {log.details}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="أضف ملاحظة أو استفسار..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-[#e2e8f0] focus:outline-none focus:ring-1 focus:ring-[#7c3aed] text-xs bg-white"
              />
              <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>

          {/* Delete Task Section (Manager Only) */}
          {isManager && (
            <div className="pt-4 border-t border-[#f1f3f7]">
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-2xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف المهمة نهائياً</span>
                </button>
              ) : (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-2">
                  <p className="text-xs text-rose-700 font-bold">
                    هل أنت متأكد من حذف المهمة؟ هذا الإجراء لا يمكن التراجع عنه.
                  </p>
                  <div className="flex justify-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setConfirmDelete(false)}
                    >
                      تراجع
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      isLoading={isSubmitting}
                      onClick={handleDelete}
                    >
                      تأكيد الحذف
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
