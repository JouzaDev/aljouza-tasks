'use client';

import React, { useState, useEffect } from 'react';
import {
  getCurrentUser,
  getPartners,
  createPartner,
  updatePartnerEffectiveness,
  addPartnerAction,
  getTasks,
  getProfiles,
  getGoals,
} from '@/lib/supabase/actions';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { CreateTaskModal } from '@/components/tasks/create-task-modal';
import {
  Handshake,
  PlusCircle,
  TrendingUp,
  Target,
  CheckCircle2,
  FileText,
  Building2,
  Plus,
  Sparkles,
} from 'lucide-react';
import { Partner, Profile, Task, Goal } from '@/lib/types/database';

export default function PartnersPage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal: Add Partner
  const [createPartnerOpen, setCreatePartnerOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [mechanism, setMechanism] = useState('');
  const [goal, setGoal] = useState('');
  const [effectivenessRate, setEffectivenessRate] = useState(80);
  const [submitting, setSubmitting] = useState(false);

  // Modal: Assign Task for this partner
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | undefined>(undefined);

  // In-place add action for a partner
  const [actionInput, setActionInput] = useState<{ [partnerId: string]: string }>({});

  const loadData = async () => {
    try {
      const [u, prt, t, pr, g] = await Promise.all([
        getCurrentUser(),
        getPartners(),
        getTasks(),
        getProfiles(),
        getGoals(),
      ]);
      setCurrentUser(u);
      setPartners(prt);
      setTasks(t);
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
        <div className="w-8 h-8 border-4 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isManager = currentUser.role === 'manager';

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await createPartner({
        name: name.trim(),
        description: description.trim(),
        mechanism: mechanism.trim(),
        goal: goal.trim(),
        effectiveness_rate: effectivenessRate,
      });
      setName('');
      setDescription('');
      setMechanism('');
      setGoal('');
      setEffectivenessRate(80);
      setCreatePartnerOpen(false);
      await loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddAction = async (partnerId: string) => {
    const text = actionInput[partnerId]?.trim();
    if (!text) return;
    await addPartnerAction(partnerId, text);
    setActionInput((prev) => ({ ...prev, [partnerId]: '' }));
    await loadData();
  };

  const handleOpenTaskForPartner = (partnerId: string) => {
    setSelectedPartnerId(partnerId);
    setCreateTaskOpen(true);
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
            <Handshake className="w-6 h-6 text-[#7c3aed]" />
            <span>شركاء النجاح ومقياس الفاعلية</span>
          </h2>
          <p className="text-xs text-[#8a94a6] mt-0.5">
            حصر الشركاء الاستراتيجيين، تحديد آليات وأهداف التعاون، وقياس مدى فاعلية كل شراكة
          </p>
        </div>

        {isManager && (
          <Button
            onClick={() => setCreatePartnerOpen(true)}
            variant="primary"
            size="md"
            icon={<PlusCircle className="w-5 h-5 text-amber-300" />}
          >
            إضافة شريك نجاح جديد
          </Button>
        )}
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {partners.length === 0 ? (
          <div className="col-span-full py-16 text-center text-[#8a94a6] bg-white rounded-3xl border border-[#f1f3f7]">
            <Building2 className="w-12 h-12 text-[#ddd6fe] mx-auto mb-2" />
            <p className="font-bold text-sm text-[#18181c]">لا يوجد شركاء مسجلين حتى الآن</p>
          </div>
        ) : (
          partners.map((partner) => {
            const partnerTasks = tasks.filter((t) => t.partner_id === partner.id);
            const completedCount = partnerTasks.filter((t) => t.status === 'done').length;

            return (
              <div
                key={partner.id}
                className="bg-white rounded-3xl p-6 border border-[#f1f3f7] hover:border-[#ddd6fe] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Logo & Effectiveness Gauge */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#18181c] text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
                        {partner.logo_letter || partner.name[0]}
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-[#18181c]">{partner.name}</h3>
                        <Badge variant="emerald" size="sm" className="mt-1">
                          شريك نشط
                        </Badge>
                      </div>
                    </div>

                    {/* Effectiveness Rate Badge */}
                    <div className="text-left bg-[#f4f7fb] p-3 rounded-2xl border border-[#e2e8f0]">
                      <span className="text-[10px] text-[#8a94a6] block font-bold mb-0.5">
                        مقياس فاعلية الشراكة
                      </span>
                      <div className="flex items-center gap-1.5 font-extrabold text-[#18181c] text-base">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span>{partner.effectiveness_rate}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {partner.description && (
                    <div className="mb-3.5">
                      <p className="text-xs text-[#627084] leading-relaxed">
                        {partner.description}
                      </p>
                    </div>
                  )}

                  {/* Mechanism (كيفية الشراكة) */}
                  <div className="p-3.5 rounded-2xl bg-[#f8fafd] border border-[#e2e8f0] mb-3">
                    <span className="text-[11px] font-bold text-[#7c3aed] flex items-center gap-1 mb-1">
                      <FileText className="w-3.5 h-3.5" />
                      <span>كيفية وآلية الشراكة:</span>
                    </span>
                    <p className="text-xs text-[#18181c] leading-relaxed">
                      {partner.mechanism || 'تم تحديد مجالات التعاون المشترك وتبادل الخبرات.'}
                    </p>
                  </div>

                  {/* Goal (هدف الشراكة) */}
                  <div className="p-3.5 rounded-2xl bg-[#faf5ff] border border-[#e9d5ff] mb-4">
                    <span className="text-[11px] font-bold text-[#581c87] flex items-center gap-1 mb-1">
                      <Target className="w-3.5 h-3.5" />
                      <span>هدف الشراكة الاستراتيجي:</span>
                    </span>
                    <p className="text-xs text-[#18181c] leading-relaxed">
                      {partner.goal || 'تحقيق التكامل المؤسسي وتوسيع دائرة المستفيدين.'}
                    </p>
                  </div>

                  {/* Accomplishments / Actions Done */}
                  <div className="mb-4">
                    <span className="text-xs font-bold text-[#18181c] block mb-2">
                      مخرجات وأعمال تمت مع الشريك:
                    </span>
                    <div className="space-y-1.5">
                      {(partner.actions_done || []).map((action, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-xs text-[#627084] bg-white p-2 rounded-xl border border-[#f1f3f7]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>

                    {/* Quick Add Action Input */}
                    {isManager && (
                      <div className="flex gap-2 mt-2">
                        <input
                          type="text"
                          placeholder="إضافة إنجاز أو عمل تم مع الشريك..."
                          value={actionInput[partner.id] || ''}
                          onChange={(e) =>
                            setActionInput({ ...actionInput, [partner.id]: e.target.value })
                          }
                          className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-[#e2e8f0] bg-[#f8fafd] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
                        />
                        <button
                          onClick={() => handleAddAction(partner.id)}
                          className="px-3 py-1.5 rounded-xl bg-[#18181c] text-white text-xs font-bold cursor-pointer hover:bg-[#2c2c33]"
                        >
                          إضافة
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions: Assign Task to Partner */}
                <div className="pt-4 border-t border-[#f1f3f7] flex items-center justify-between">
                  <div className="text-xs text-[#8a94a6]">
                    <span>المهام المشتركة: </span>
                    <strong className="text-[#18181c]">
                      {completedCount} من {partnerTasks.length} منجزة
                    </strong>
                  </div>

                  {isManager && (
                    <Button
                      onClick={() => handleOpenTaskForPartner(partner.id)}
                      variant="secondary"
                      size="sm"
                      icon={<Plus className="w-4 h-4 text-[#7c3aed]" />}
                    >
                      إسناد مهمة لهذا الشريك
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create Partner */}
      <Modal
        isOpen={createPartnerOpen}
        onClose={() => setCreatePartnerOpen(false)}
        title="إضافة شريك نجاح جديد"
        description="حدد بيانات الشريك، آلية التعاون، وهدف الشراكة ومقياس فاعليتها"
      >
        <form onSubmit={handleCreatePartner} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#18181c] mb-1.5">
              اسم الجهة الشريكة <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: أكاديمية طويق، هيئة منشآت..."
              className="w-full px-4 py-3 rounded-2xl border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-sm bg-[#f8fafd]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#18181c] mb-1.5">
              وصف مختصر للشراكة
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف مجال الشراكة والخدمات المتبادلة..."
              className="w-full px-4 py-3 rounded-2xl border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-sm bg-[#f8fafd] resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#18181c] mb-1.5">
              كيفية وآلية الشراكة <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={mechanism}
              onChange={(e) => setMechanism(e.target.value)}
              placeholder="كيف سنعمل معاً؟ (مثال: تنظيم معسكر فصلي، استضافة ورش، تبادل خبرات...)"
              className="w-full px-4 py-3 rounded-2xl border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-sm bg-[#f8fafd] resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#18181c] mb-1.5">
              هدف الشراكة الاستراتيجي <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="ما هو الهدف النهائي؟ (مثال: تدريب 200 رائد أعمال وتأهيلهم لسوق العمل)"
              className="w-full px-4 py-3 rounded-2xl border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-sm bg-[#f8fafd]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-sm font-bold text-[#18181c] mb-1.5">
              <span>مقياس الفاعلية المبدئي</span>
              <span className="text-[#7c3aed]">{effectivenessRate}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={effectivenessRate}
              onChange={(e) => setEffectivenessRate(Number(e.target.value))}
              className="w-full accent-[#7c3aed]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f1f3f7]">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setCreatePartnerOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={submitting}
              icon={<Handshake className="w-4 h-4" />}
            >
              حفظ الشريك
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create Task for Partner */}
      <CreateTaskModal
        isOpen={createTaskOpen}
        onClose={() => {
          setCreateTaskOpen(false);
          setSelectedPartnerId(undefined);
        }}
        profiles={profiles}
        goals={goals}
        partnerships={[]}
        defaultPartnershipId={selectedPartnerId}
        onTaskCreated={loadData}
      />
    </div>
  );
}
