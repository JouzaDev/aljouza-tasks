'use client';

import React, { useState, useEffect } from 'react';
import { getCurrentUser, getPartnerships, getTasks } from '@/lib/supabase/actions';
import { Header } from '@/components/layout/header';
import { PartnerCard } from '@/components/partners/partner-card';
import { Handshake } from 'lucide-react';
import { Partnership, Profile, Task } from '@/lib/types/database';

export default function MyProgramsPage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const u = await getCurrentUser();
      const [p, t] = await Promise.all([getPartnerships(), getTasks({ assignedTo: u.id })]);
      setCurrentUser(u);
      setPartnerships(p);
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
        <div className="w-8 h-8 border-4 border-[#3b0764] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Filter programs where employee is coordinator or has an assigned task linked to this program
  const myProgramIds = new Set(
    tasks.filter((t) => t.partnership_id).map((t) => t.partnership_id)
  );

  const relevantPartnerships = partnerships.filter(
    (p) => p.coordinator_id === currentUser.id || myProgramIds.has(p.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Header
        currentUser={currentUser}
        title="البرامج والشراكات المكلف بها"
        subtitle="عرض البرامج والدورات المشتركة التي تم تعيينك منسقاً لها أو تشارك في تنفيذ مهامها"
      />

      {/* Info Banner */}
      <div className="p-4 rounded-3xl bg-white border border-[#f1edfa] flex items-center gap-3 text-sm text-[#5f556d] shadow-sm">
        <Handshake className="w-5 h-5 text-[#3b0764]" />
        <span>
          أنت مرتبط حالياً بـ <strong>{relevantPartnerships.length}</strong> برامج وفعاليات مشتركة.
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relevantPartnerships.length === 0 ? (
          <div className="col-span-full py-16 text-center text-[#8c829e] bg-white rounded-3xl border border-[#f1edfa]">
            <Handshake className="w-10 h-10 text-[#d8b4fe] mx-auto mb-2" />
            <p className="font-semibold text-sm">لم يتم تكليفك بأي برنامج شراكة حتى الآن.</p>
          </div>
        ) : (
          relevantPartnerships.map((partner) => (
            <PartnerCard
              key={partner.id}
              partner={partner}
              isManager={false} // Employee has read-only access
            />
          ))
        )}
      </div>
    </div>
  );
}
