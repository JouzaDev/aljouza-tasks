'use client';

import React, { useState, useEffect } from 'react';
import {
  getCurrentUser,
  getTasks,
  getGoals,
  getPartnerships,
  getProfiles,
} from '@/lib/supabase/actions';
import { Header } from '@/components/layout/header';
import { KanbanBoard } from '@/components/tasks/kanban-board';
import { TasksTable } from '@/components/tasks/tasks-table';
import { TaskDrawer } from '@/components/tasks/task-drawer';
import { CreateTaskModal } from '@/components/tasks/create-task-modal';
import { Button } from '@/components/ui/button';
import { PlusCircle, LayoutGrid, Table, Filter } from 'lucide-react';
import { Task, Goal, Partnership, Profile } from '@/lib/types/database';

export default function AdminTasksPage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [employeeFilter, setEmployeeFilter] = useState('all');

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [u, t, g, p, pr] = await Promise.all([
        getCurrentUser(),
        getTasks(),
        getGoals(),
        getPartnerships(),
        getProfiles(),
      ]);
      setCurrentUser(u);
      setTasks(t);
      setGoals(g);
      setPartnerships(p);
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
        <div className="w-8 h-8 border-4 border-[#3b0764] border-t-transparent rounded-full animate-spin" />
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
        title="إدارة وتوزيع المهام"
        subtitle="متابعة مراحل التنفيذ، اعتماد المخرجات، وتوزيع المهام على فريق العمل"
        pendingReviewCount={tasks.filter((t) => t.status === 'waiting_review').length}
      />

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-[#f1edfa] shadow-sm">
        {/* Left Side: Filter by Employee & View Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Employee Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#8c829e]" />
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="px-3.5 py-2 rounded-2xl border border-[#e9d5ff] focus:outline-none focus:ring-2 focus:ring-[#3b0764] text-sm bg-white"
            >
              <option value="all">جميع الموظفين (الكل)</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#faf8fd] p-1 rounded-2xl border border-[#f1edfa]">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white text-[#3b0764] shadow-xs'
                  : 'text-[#8c829e] hover:text-[#1e112a]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>لوحة كانبان</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-[#3b0764] shadow-xs'
                  : 'text-[#8c829e] hover:text-[#1e112a]'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>جدول البيانات</span>
            </button>
          </div>
        </div>

        {/* Right Side: Create Task Button */}
        <Button
          onClick={() => setCreateModalOpen(true)}
          variant="primary"
          size="md"
          icon={<PlusCircle className="w-5 h-5" />}
        >
          إسناد مهمة جديدة
        </Button>
      </div>

      {/* Task Content */}
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

      {/* Task Drawer */}
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
        partnerships={partnerships}
        onTaskCreated={loadData}
      />
    </div>
  );
}
