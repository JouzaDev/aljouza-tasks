'use client';

import React, { useState, useEffect } from 'react';
import {
  getCurrentUser,
  getTasks,
  getGoals,
  getProfiles,
} from '@/lib/supabase/actions';
import { Header } from '@/components/layout/header';
import { KanbanBoard } from '@/components/tasks/kanban-board';
import { TasksTable } from '@/components/tasks/tasks-table';
import { TaskDrawer } from '@/components/tasks/task-drawer';
import { CreateTaskModal } from '@/components/tasks/create-task-modal';
import { Button } from '@/components/ui/button';
import { PlusCircle, LayoutGrid, Table, Filter, CheckSquare } from 'lucide-react';
import { Task, Goal, Profile } from '@/lib/types/database';

export default function AdminTasksPage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [employeeFilter, setEmployeeFilter] = useState('all');

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [u, t, g, pr] = await Promise.all([
        getCurrentUser(),
        getTasks(),
        getGoals(),
        getProfiles(),
      ]);
      setCurrentUser(u);
      setTasks(t);
      setGoals(g);
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

  const employees = profiles.filter((p) => p.role === 'employee');

  const filteredTasks = tasks.filter((t) => {
    if (employeeFilter !== 'all' && t.assigned_to !== employeeFilter) {
      return false;
    }
    return true;
  });

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Header
        currentUser={currentUser}
        pendingReviewCount={tasks.filter((t) => t.status === 'waiting_review').length}
      />

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-[#f1f3f7] shadow-xs">
        {/* Left: Filter by Employee & View Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#8a94a6]" />
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="px-3.5 py-2 rounded-2xl border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-xs font-bold bg-white text-[#18181c]"
            >
              <option value="all">جميع الموظفين (فريق العمل)</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.role === 'manager' ? 'المدير' : p.job_title})
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#f4f7fb] p-1 rounded-2xl border border-[#e2e8f0]">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white text-[#18181c] shadow-xs'
                  : 'text-[#8a94a6] hover:text-[#18181c]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>لوحة كانبان</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-[#18181c] shadow-xs'
                  : 'text-[#8a94a6] hover:text-[#18181c]'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>جدول البيانات</span>
            </button>
          </div>
        </div>

        {/* Right: Create Task Button */}
        <Button
          onClick={() => setCreateModalOpen(true)}
          variant="primary"
          size="md"
          icon={<PlusCircle className="w-5 h-5 text-amber-300" />}
        >
          إسناد مهمة جديدة
        </Button>
      </div>

      {/* Tasks View */}
      {viewMode === 'kanban' ? (
        <KanbanBoard
          tasks={filteredTasks}
          onSelectTask={handleSelectTask}
          showAssignee={true}
        />
      ) : (
        <TasksTable
          tasks={filteredTasks}
          onSelectTask={handleSelectTask}
          showAssignee={true}
        />
      )}

      {/* Task Drawer for details & approvals */}
      <TaskDrawer
        task={selectedTask}
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedTask(null);
        }}
        currentUser={currentUser}
        onTaskUpdated={loadData}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        profiles={profiles}
        goals={goals}
        onTaskCreated={loadData}
      />
    </div>
  );
}
