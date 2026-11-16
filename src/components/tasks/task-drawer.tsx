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
} from 'lucide-react';
import { Task, Profile, ActivityLog, TaskStatus } from '@/lib/types/database';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  updateTaskStatus,
  approveTask,
  addActivityLog,
  getTaskLogs,
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

  useEffect(() => {
    if (task && isOpen) {
      setLoadingLogs(true);
      getTaskLogs(task.id)
        .then((data) => setLogs(data))
        .finally(() => setLoadingLogs(false));
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
      // Refresh logs
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
        className="fixed inset-0 bg-[#1e112a]/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="p-6 border-b border-[#f1edfa] flex items-start justify-between bg-[#fcfbfe]">
          <div>
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
            <h3 className="text-xl font-extrabold text-[#1e112a]">{task.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8c829e] hover:text-[#1e112a] hover:bg-[#f5f3ff] rounded-2xl cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Details Section */}
          <div className="space-y-4">
            <div>
              <h5 className="text-xs font-bold text-[#8c829e] mb-1">وصف المهمة</h5>
              <p className="text-base text-[#1e112a] bg-[#faf8fd] p-4 rounded-2xl border border-[#f1edfa] leading-relaxed whitespace-pre-wrap">
                {task.description || 'لا يوجد وصف تفصيلي.'}
              </p>
            </div>

            {/* Grid Attributes */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3.5 rounded-2xl border border-[#f1edfa] bg-white">
                <span className="text-xs text-[#8c829e] block mb-1">الموظف المسؤول</span>
                <span className="font-bold text-[#1e112a]">
                  {task.assigned_profile?.full_name || 'غير مسند'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl border border-[#f1edfa] bg-white">
                <span className="text-xs text-[#8c829e] block mb-1">تاريخ التسليم</span>
                <span className="font-bold text-[#1e112a]">
                  {task.due_date || 'غير محدد'}
                </span>
              </div>

              {task.goal && (
                <div className="p-3.5 rounded-2xl border border-[#f1edfa] bg-white col-span-2">
                  <span className="text-xs text-[#8c829e] block mb-1">الهدف الاستراتيجي المرتبط</span>
                  <span className="font-bold text-[#581c87]">{task.goal.title}</span>
                </div>
              )}

              {task.partnership && (
                <div className="p-3.5 rounded-2xl border border-[#f1edfa] bg-white col-span-2">
                  <span className="text-xs text-[#8c829e] block mb-1">برنامج الشراكة</span>
                  <span className="font-bold text-[#1e40af]">
                    {task.partnership.partner_name} - {task.partnership.program_title}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Area: Manager Approval or Employee Status update */}
          <div className="p-5 rounded-3xl bg-[#f5f3ff] border border-[#e9d5ff] space-y-4">
            <h4 className="text-sm font-bold text-[#3b0764] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>إجراءات المهمة</span>
            </h4>

            {/* Manager Actions */}
            {isManager && (
              <div className="space-y-3">
                <p className="text-xs text-[#5f556d]">
                  بصفتك المدير (جوزاء)، يمكنك اعتماد المهمة بشكل نهائي أو إعادتها للموظف للتعديل:
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <Button
                    onClick={() => handleApproval(true)}
                    variant="primary"
                    size="md"
                    isLoading={isSubmitting}
                    icon={<CheckCircle2 className="w-5 h-5 text-emerald-300" />}
                    className="flex-1"
                  >
                    اعتماد وإغلاق المهمة
                  </Button>
                  <Button
                    onClick={() => handleApproval(false)}
                    variant="outline"
                    size="md"
                    isLoading={isSubmitting}
                    icon={<CornerUpLeft className="w-4 h-4 text-[#e11d48]" />}
                  >
                    طلب تعديل
                  </Button>
                </div>
              </div>
            )}

            {/* Employee Actions */}
            {!isManager && isAssignee && (
              <div className="space-y-3">
                <p className="text-xs text-[#5f556d]">تحديث مرحلة العمل الخاصة بك:</p>
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
            <h4 className="text-sm font-bold text-[#1e112a] mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#581c87]" />
              <span>سجل النشاط والملاحظات ({logs.length})</span>
            </h4>

            {loadingLogs ? (
              <div className="text-center py-4 text-xs text-[#8c829e]">جاري التحميل...</div>
            ) : logs.length === 0 ? (
              <div className="text-center py-4 text-xs text-[#8c829e] bg-[#faf8fd] rounded-2xl border border-[#f1edfa]">
                لا توجد سجلات بعد.
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl bg-white border border-[#f1edfa] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[#8c829e]">
                      <span className="font-bold text-[#3b0764]">
                        {log.user_profile?.full_name || 'أحد الأعضاء'}
                      </span>
                      <span>
                        {new Intl.DateTimeFormat('ar-SA', {
                          hour: 'numeric',
                          minute: 'numeric',
                          day: 'numeric',
                          month: 'short',
                        }).format(new Date(log.created_at))}
                      </span>
                    </div>
                    <p className="font-semibold text-[#1e112a]">{log.action}</p>
                    {log.details && (
                      <p className="text-[#5f556d] bg-[#faf8fd] p-2 rounded-xl mt-1 leading-relaxed">
                        {log.details}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="أضف ملاحظة أو رابط التسليم..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 px-4 py-3 rounded-2xl border border-[#e9d5ff] focus:outline-none focus:ring-2 focus:ring-[#3b0764] text-sm bg-white"
              />
              <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
