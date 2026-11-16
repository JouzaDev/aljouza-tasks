'use client';

import React, { useState, useEffect } from 'react';
import {
  getCurrentUser,
  getProjects,
  createProject,
  getTasks,
} from '@/lib/supabase/actions';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import {
  Layers,
  PlusCircle,
  Calendar,
  CheckCircle2,
  TrendingUp,
  FolderGit2,
  Clock,
} from 'lucide-react';
import { Project, Profile, Task } from '@/lib/types/database';

export default function ProjectsPage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [u, p, t] = await Promise.all([
        getCurrentUser(),
        getProjects(),
        getTasks(),
      ]);
      setCurrentUser(u);
      setProjects(p);
      setTasks(t);
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      await createProject({
        title: title.trim(),
        description: description.trim() || undefined,
        due_date: dueDate || undefined,
      });
      setTitle('');
      setDescription('');
      setDueDate('');
      setCreateModalOpen(false);
      await loadData();
    } finally {
      setSubmitting(false);
    }
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
            <Layers className="w-6 h-6 text-[#7c3aed]" />
            <span>المشاريع المستقلة</span>
          </h2>
          <p className="text-xs text-[#8a94a6] mt-0.5">
            إدارة مبادرات ومشاريع منصة الجوزاء الاستراتيجية ومتابعة نسب إنجازها
          </p>
        </div>

        {isManager && (
          <Button
            onClick={() => setCreateModalOpen(true)}
            variant="primary"
            size="md"
            icon={<PlusCircle className="w-5 h-5 text-amber-300" />}
          >
            إضافة مشروع جديد
          </Button>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full py-16 text-center text-[#8a94a6] bg-white rounded-3xl border border-[#f1f3f7]">
            <FolderGit2 className="w-12 h-12 text-[#ddd6fe] mx-auto mb-2" />
            <p className="font-bold text-sm text-[#18181c]">لا توجد مشاريع مسجلة حالياً</p>
          </div>
        ) : (
          projects.map((project) => {
            const projectTasks = tasks.filter((t) => t.project_id === project.id);
            const completedCount = projectTasks.filter((t) => t.status === 'done').length;

            return (
              <div
                key={project.id}
                className="bg-white rounded-3xl p-6 border border-[#f1f3f7] hover:border-[#ddd6fe] shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant={project.status === 'active' ? 'emerald' : 'purple'} size="sm">
                      {project.status === 'active' ? 'مشروع نشط' : 'قيد التخطيط'}
                    </Badge>
                    {project.due_date && (
                      <span className="text-xs text-[#8a94a6] flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{project.due_date}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-extrabold text-[#18181c] group-hover:text-[#7c3aed] transition-colors mb-2">
                    {project.title}
                  </h3>

                  {project.description && (
                    <p className="text-xs text-[#627084] leading-relaxed line-clamp-3 mb-4">
                      {project.description}
                    </p>
                  )}
                </div>

                {/* Progress & Task Stats */}
                <div className="pt-4 border-t border-[#f1f3f7] space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#627084] flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-[#7c3aed]" />
                      <span>نسبة الإنجاز</span>
                    </span>
                    <span className="text-[#18181c]">{project.progress}%</span>
                  </div>

                  <div className="w-full h-2.5 bg-[#f4f7fb] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-[#7c3aed] to-[#38bdf8] rounded-full transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#8a94a6]">
                    <span>إجمالي المهام المرتبطة:</span>
                    <strong className="text-[#18181c]">
                      {completedCount} من {projectTasks.length} منجزة
                    </strong>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create Project */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="إضافة مشروع جديد لمنصة الجوزاء"
        description="سجل بيانات المشروع وموعد التسليم المستهدف"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#18181c] mb-1.5">
              عنوان المشروع <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: إطلاق تطبيق الهاتف الذكي taska.aljouza.sa"
              className="w-full px-4 py-3 rounded-2xl border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-sm bg-[#f8fafd]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#18181c] mb-1.5">
              وصف المشروع ونطاق العمل
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب أهداف ومخرجات المشروع الرئيسية..."
              className="w-full px-4 py-3 rounded-2xl border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-sm bg-[#f8fafd] resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#18181c] mb-1.5">
              تاريخ التسليم المستهدف
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-sm bg-[#f8fafd]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f1f3f7]">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setCreateModalOpen(false)}
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
              إنشاء المشروع
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
