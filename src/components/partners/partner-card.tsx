'use client';

import React from 'react';
import { Partnership } from '@/lib/types/database';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Handshake, Calendar, User, PlusCircle, BookOpen, Flag } from 'lucide-react';

interface PartnerCardProps {
  partner: Partnership;
  onAddTask?: (partnerId: string) => void;
  isManager?: boolean;
}

export function PartnerCard({ partner, onAddTask, isManager = false }: PartnerCardProps) {
  const typeMap: Record<string, { label: string; variant: 'purple' | 'blue' | 'emerald' | 'amber' }> = {
    course: { label: 'دورة تدريبية', variant: 'purple' },
    program: { label: 'برنامج نوعي', variant: 'blue' },
    event: { label: 'فعالية / ملتقى', variant: 'amber' },
    partnership: { label: 'شراكة عامة', variant: 'emerald' },
  };

  const statusMap: Record<string, { label: string; variant: 'slate' | 'blue' | 'emerald' | 'rose' }> = {
    planned: { label: 'مخطط', variant: 'slate' },
    ongoing: { label: 'جاري التنفيذ', variant: 'blue' },
    completed: { label: 'مكتمل', variant: 'emerald' },
    cancelled: { label: 'ملغي', variant: 'rose' },
  };

  const pType = typeMap[partner.program_type] || typeMap.partnership;
  const pStatus = statusMap[partner.status] || statusMap.planned;

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#f1edfa] hover:border-[#e9d5ff] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <Badge variant={pType.variant} size="sm">
            {pType.label}
          </Badge>
          <Badge variant={pStatus.variant} size="sm">
            {pStatus.label}
          </Badge>
        </div>

        <h4 className="text-xl font-bold text-[#1e112a] mb-1">{partner.program_title}</h4>
        <p className="text-sm font-semibold text-[#581c87] mb-3 flex items-center gap-1.5">
          <Handshake className="w-4 h-4" />
          <span>الجهة الشريكة: {partner.partner_name}</span>
        </p>

        {partner.notes && (
          <p className="text-sm text-[#5f556d] bg-[#faf8fd] p-3.5 rounded-2xl border border-[#f1edfa] leading-relaxed mb-4">
            {partner.notes}
          </p>
        )}

        <div className="space-y-2 text-xs text-[#5f556d] mb-4">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-[#8c829e]" />
            <span>
              المنسق المسؤول:{' '}
              <strong className="text-[#1e112a]">
                {partner.coordinator?.full_name || 'غير محدد'}
              </strong>
            </span>
          </div>

          {(partner.start_date || partner.end_date) && (
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#8c829e]" />
              <span>
                الفترة: {partner.start_date || '-'} إلى {partner.end_date || '-'}
              </span>
            </div>
          )}
        </div>
      </div>

      {isManager && onAddTask && (
        <div className="pt-4 border-t border-[#f1edfa]">
          <Button
            onClick={() => onAddTask(partner.id)}
            variant="secondary"
            size="sm"
            className="w-full"
            icon={<PlusCircle className="w-4 h-4" />}
          >
            إسناد مهمة مرتبطة بهذه الشراكة
          </Button>
        </div>
      )}
    </div>
  );
}
