'use client';

import React, { useState, useEffect } from 'react';
import {
  getCurrentUser,
  getPartnerships,
  getProfiles,
  getGoals,
} from '@/lib/supabase/actions';
import { Header } from '@/components/layout/header';
import { PartnerCard } from '@/components/partners/partner-card';
import { CreatePartnerModal } from '@/components/partners/create-partner-modal';
import { CreateTaskModal } from '@/components/tasks/create-task-modal';
import { Button } from '@/components/ui/button';
import { PlusCircle, Handshake } from 'lucide-react';
import { Partnership, Profile, Goal } from '@/lib/types/database';

export default function AdminPartnersPage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [createPartnerOpen, setCreatePartnerOpen] = useState(false);

  // Quick Task Creation for a specific partnership
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | undefined>(undefined);

  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [u, p, pr, g] = await Promise.all([
        getCurrentUser(),
        getPartnerships(),
        getProfiles(),
        getGoals(),
      ]);
      setCurrentUser(u);
      setPartnerships(p);
      setProfiles(pr);
      setGoals(g);
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

  const handleAddTaskForPartner = (partnerId: string) => {
    setSelectedPartnerId(partnerId);
    setCreateTaskOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Header
        currentUser={currentUser}
        title="البرامج والدورات والشراكات"
        subtitle="إدارة المشاريع المشتركة مع الجهات الشريكة وربطها بالمهام والمنسقين"
      />

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-[#f1edfa] shadow-sm">
        <div className="flex items-center gap-2 text-sm text-[#5f556d]">
          <Handshake className="w-5 h-5 text-[#3b0764]" />
          <span>إجمالي الشراكات المسجلة: <strong>{partnerships.length}</strong></span>
        </div>

        <Button
          onClick={() => setCreatePartnerOpen(true)}
          variant="primary"
          size="md"
          icon={<PlusCircle className="w-5 h-5" />}
        >
          إضافة شراكة أو برنامج
        </Button>
      </div>

      {/* Partnerships Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partnerships.length === 0 ? (
          <div className="col-span-full py-16 text-center text-[#8c829e] bg-white rounded-3xl border border-[#f1edfa]">
            <Handshake className="w-10 h-10 text-[#d8b4fe] mx-auto mb-2" />
            <p className="font-semibold text-sm">لا توجد شراكات مسجلة بعد.</p>
          </div>
        ) : (
          partnerships.map((partner) => (
            <PartnerCard
              key={partner.id}
              partner={partner}
              isManager={true}
              onAddTask={handleAddTaskForPartner}
            />
          ))
        )}
      </div>

      {/* Create Partner Modal */}
      <CreatePartnerModal
        isOpen={createPartnerOpen}
        onClose={() => setCreatePartnerOpen(false)}
        profiles={profiles}
        onCreated={loadData}
      />

      {/* Create Task Modal linked to Partner */}
      <CreateTaskModal
        isOpen={createTaskOpen}
        onClose={() => {
          setCreateTaskOpen(false);
          setSelectedPartnerId(undefined);
        }}
        profiles={profiles}
        goals={goals}
        partnerships={partnerships}
        defaultPartnershipId={selectedPartnerId}
        onTaskCreated={loadData}
      />
    </div>
  );
}
