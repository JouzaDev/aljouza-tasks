'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';
import { Profile, ProgramType } from '@/lib/types/database';
import { createPartnership } from '@/lib/supabase/actions';
import { Handshake } from 'lucide-react';

interface CreatePartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: Profile[];
  onCreated?: () => void;
}

export function CreatePartnerModal({
  isOpen,
  onClose,
  profiles,
  onCreated,
}: CreatePartnerModalProps) {
  const employees = profiles.filter((p) => p.role === 'employee');

  const [partnerName, setPartnerName] = useState('');
  const [programTitle, setProgramTitle] = useState('');
  const [programType, setProgramType] = useState<ProgramType>('program');
  const [coordinatorId, setCoordinatorId] = useState(employees[0]?.id || '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim() || !programTitle.trim()) return;

    setIsLoading(true);
    try {
      await createPartnership({
        partner_name: partnerName.trim(),
        program_title: programTitle.trim(),
        program_type: programType,
        coordinator_id: coordinatorId || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        notes: notes.trim() || undefined,
      });
      setPartnerName('');
      setProgramTitle('');
      setNotes('');
      onCreated?.();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="إضافة برنامج أو شراكة جديدة"
      description="سجل بيانات الجهة الشريكة وتفاصيل الدورة أو الفعالية المشتركة"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-[#1e112a] mb-1.5">
              اسم الجهة الشريكة <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              placeholder="مثال: أكاديمية طويق، منشآت..."
              className="w-full px-4 py-3 rounded-2xl border border-[#e9d5ff] focus:outline-none focus:ring-2 focus:ring-[#3b0764] text-base bg-[#fcfbfe]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#1e112a] mb-1.5">
              عنوان البرنامج / الدورة <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={programTitle}
              onChange={(e) => setProgramTitle(e.target.value)}
              placeholder="مثال: معسكر ريادة الأعمال..."
              className="w-full px-4 py-3 rounded-2xl border border-[#e9d5ff] focus:outline-none focus:ring-2 focus:ring-[#3b0764] text-base bg-[#fcfbfe]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-[#1e112a] mb-1.5">
              نوع المشاركة
            </label>
            <select
              value={programType}
              onChange={(e) => setProgramType(e.target.value as ProgramType)}
              className="w-full px-4 py-3 rounded-2xl border border-[#e9d5ff] focus:outline-none focus:ring-2 focus:ring-[#3b0764] text-base bg-[#fcfbfe]"
            >
              <option value="program">برنامج نوعي</option>
              <option value="course">دورة تدريبية</option>
              <option value="event">فعالية أو ملتقى</option>
              <option value="partnership">شراكة استراتيجية</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#1e112a] mb-1.5">
              المنسق المسؤول من الفريق
            </label>
            <select
              value={coordinatorId}
              onChange={(e) => setCoordinatorId(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-[#e9d5ff] focus:outline-none focus:ring-2 focus:ring-[#3b0764] text-base bg-[#fcfbfe]"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name} ({emp.job_title})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-[#1e112a] mb-1.5">
              تاريخ البداية
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-[#e9d5ff] focus:outline-none focus:ring-2 focus:ring-[#3b0764] text-sm bg-[#fcfbfe]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#1e112a] mb-1.5">
              تاريخ النهاية
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-[#e9d5ff] focus:outline-none focus:ring-2 focus:ring-[#3b0764] text-sm bg-[#fcfbfe]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-[#1e112a] mb-1.5">
            ملاحظات وتفاصيل التنسيق
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="أهداف المشاركة، الالتزامات المشتركة..."
            className="w-full px-4 py-3 rounded-2xl border border-[#e9d5ff] focus:outline-none focus:ring-2 focus:ring-[#3b0764] text-sm bg-[#fcfbfe] resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f1edfa]">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            icon={<Handshake className="w-5 h-5" />}
          >
            تسجيل الشراكة
          </Button>
        </div>
      </form>
    </Modal>
  );
}
