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
import { ClonedTopCards } from '@/components/dashboard/cloned-top-cards';
import { ClonedBottomSection } from '@/components/dashboard/cloned-bottom-section';
import { TaskDrawer } from '@/components/tasks/task-drawer';
import { CreateTaskModal } from '@/components/tasks/create-task-modal';
import { Task, Goal, Partnership, Profile } from '@/lib/types/database';

export default function AdminDashboardPage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

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
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 border-4 border-[#18181c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pendingReviewCount = tasks.filter((t) => t.status === 'waiting_review').length;

  return (
    <div className="space-y-6">
      {/* Top Header matching exact specification */}
      <Header
        currentUser={currentUser}
        pendingReviewCount={pendingReviewCount}
      />

      {/* Top Cloned Cards: Portfolio Area Chart + 3 Pastel Team Cards */}
      <ClonedTopCards
        tasks={tasks}
        goals={goals}
        profiles={profiles}
      />

      {/* Bottom Cloned Section: Tasks Table with Symbols + Dark Quick Action Card */}
      <ClonedBottomSection
        tasks={tasks}
        onSelectTask={(task) => {
          setSelectedTask(task);
          setDrawerOpen(true);
        }}
        onOpenCreateTask={() => setCreateModalOpen(true)}
        isManager={true}
      />

      {/* Interactive Task Drawer */}
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
