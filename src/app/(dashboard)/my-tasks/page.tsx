'use client';

import React, { useState, useEffect } from 'react';
import {
  getCurrentUser,
  getTasks,
  getGoals,
  getProfiles,
} from '@/lib/supabase/actions';
import { Header } from '@/components/layout/header';
import { ClonedTopCards } from '@/components/dashboard/cloned-top-cards';
import { ClonedBottomSection } from '@/components/dashboard/cloned-bottom-section';
import { TaskDrawer } from '@/components/tasks/task-drawer';
import { Task, Profile, Goal } from '@/lib/types/database';

export default function MyTasksPage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadData = async () => {
    try {
      const u = await getCurrentUser();
      const [t, g, pr] = await Promise.all([
        getTasks({ assignedTo: u.id }),
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
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 border-4 border-[#18181c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const waitingReviewCount = tasks.filter((t) => t.status === 'waiting_review').length;

  return (
    <div className="space-y-6">
      {/* Header matching exact title and icons */}
      <Header
        currentUser={currentUser}
        pendingReviewCount={waitingReviewCount}
      />

      {/* Top Cloned Cards */}
      <ClonedTopCards
        tasks={tasks}
        goals={goals}
        profiles={profiles}
      />

      {/* Bottom Cloned Section */}
      <ClonedBottomSection
        tasks={tasks}
        onSelectTask={(task) => {
          setSelectedTask(task);
          setDrawerOpen(true);
        }}
        isManager={false}
      />

      {/* Task Drawer for updating status, comments & deliverable files */}
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
    </div>
  );
}
