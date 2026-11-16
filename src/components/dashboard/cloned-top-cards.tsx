'use client';

import React, { useState } from 'react';
import { MoreHorizontal, ArrowLeftRight, TrendingUp, Sparkles } from 'lucide-react';
import { Task, Profile, Goal } from '@/lib/types/database';

interface ClonedTopCardsProps {
  tasks: Task[];
  goals: Goal[];
  profiles: Profile[];
}

export function ClonedTopCards({ tasks, goals, profiles }: ClonedTopCardsProps) {
  const [timeRange, setTimeRange] = useState('1W');

  const employees = profiles.filter((p) => p.role === 'employee');
  const mohammed = employees.find((e) => e.full_name.includes('محمد')) || employees[0];
  const reham = employees.find((e) => e.full_name.includes('ريهام')) || employees[1];
  const dina = employees.find((e) => e.full_name.includes('دينا')) || employees[2];

  const mohammedTasks = tasks.filter((t) => t.assigned_to === mohammed?.id);
  const rehamTasks = tasks.filter((t) => t.assigned_to === reham?.id);
  const dinaTasks = tasks.filter((t) => t.assigned_to === dina?.id);

  const activeCount = tasks.filter((t) => t.status !== 'done').length;
  const completedCount = tasks.filter((t) => t.status === 'done').length;
  const totalCount = tasks.length || 1;
  const completionRate = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* 1. Large Chart Card (Portfolio) matching the exact left card */}
      <div className="lg:col-span-5 bg-[#f4f8fe] rounded-[28px] p-6 border border-[#e3edf9] flex flex-col justify-between relative overflow-hidden">
        <div>
          {/* Card Top Label & Three dots */}
          <div className="flex items-center justify-between text-[#8a94a6] mb-2">
            <span className="text-xs font-bold text-[#627084] tracking-wide">
              سير إنجاز المهام والأهداف
            </span>
            <button className="text-[#8a94a6] hover:text-[#18181c] cursor-pointer">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Big Number & Subtitle */}
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#18181c] tracking-tight">
              {activeCount} مهام نشطة
            </span>
          </div>
          <p className="text-xs text-[#8a94a6] mt-1">
            نسبة الإنجاز العامة: {completionRate}%
          </p>
        </div>

        {/* Floating Highlight Pill matching $27 483.00 */}
        <div className="relative my-2">
          <div className="absolute right-12 -top-1 bg-[#18181c] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 z-10">
            <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse" />
            <span>معتمد: {completedCount} مهمة</span>
          </div>

          {/* SVG Smooth Line Chart matching the exact visual curve */}
          <div className="w-full h-28 pt-4">
            <svg
              viewBox="0 0 400 100"
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartBlueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Filled area */}
              <path
                d="M 0,75 Q 40,70 80,68 T 160,65 T 240,60 T 290,40 L 300,75 T 340,78 T 400,60 L 400,100 L 0,100 Z"
                fill="url(#chartBlueGrad)"
              />
              {/* Line path */}
              <path
                d="M 0,75 Q 40,70 80,68 T 160,65 T 240,60 T 290,40 L 300,75 T 340,78 T 400,60"
                fill="none"
                stroke="#60a5fa"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Active Marker Dot */}
              <circle cx="290" cy="40" r="4.5" fill="#38bdf8" />
              <line
                x1="290"
                y1="40"
                x2="290"
                y2="100"
                stroke="#93c5fd"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
            </svg>
          </div>
        </div>

        {/* Time Filter Pills matching 1H 24H 1W 1M 1Y ALL */}
        <div className="flex items-center gap-1 pt-2 border-t border-[#e3edf9]/60 text-xs">
          {['1H', '24H', '1W', '1M', '1Y', 'الكل'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                timeRange === range
                  ? 'bg-white text-[#18181c] shadow-xs'
                  : 'text-[#8a94a6] hover:text-[#18181c]'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* 2. 3 Pastel Cards side-by-side matching "Your Assets" */}
      <div className="lg:col-span-7 flex flex-col justify-between gap-2">
        <div className="flex items-center justify-between mb-1 px-1">
          <span className="text-xs font-bold text-[#627084] tracking-wide">
            فريق العمل والتنفيذ (Your Team)
          </span>
          <button className="text-[#8a94a6] hover:text-[#18181c] cursor-pointer" title="تحديث">
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-full">
          {/* Card 1: Pastel Lavender matching 1.25 BTC */}
          <div className="bg-[#ede9fe] rounded-[28px] p-5 border border-[#ddd6fe] flex flex-col justify-between hover:scale-[1.02] transition-transform">
            <div>
              <div className="flex items-center justify-between text-[#7c3aed]">
                <span className="text-sm font-extrabold text-[#18181c]">
                  {mohammed?.full_name || 'محمد'}
                </span>
                <MoreHorizontal className="w-4 h-4 text-[#8a94a6]" />
              </div>
              <p className="text-[11px] text-[#6b7280] mt-0.5 font-medium">
                {mohammedTasks.length} مهام مسندة
              </p>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="w-9 h-9 rounded-xl bg-white text-[#18181c] flex items-center justify-center font-bold text-sm shadow-xs">
                م
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-white/70 px-2.5 py-1 rounded-xl">
                +14%
              </span>
            </div>
          </div>

          {/* Card 2: Pastel Mint matching 0.32 LTC */}
          <div className="bg-[#e6f7ef] rounded-[28px] p-5 border border-[#c7eedb] flex flex-col justify-between hover:scale-[1.02] transition-transform">
            <div>
              <div className="flex items-center justify-between text-[#059669]">
                <span className="text-sm font-extrabold text-[#18181c]">
                  {reham?.full_name || 'ريهام'}
                </span>
                <MoreHorizontal className="w-4 h-4 text-[#8a94a6]" />
              </div>
              <p className="text-[11px] text-[#6b7280] mt-0.5 font-medium">
                {rehamTasks.length} مهام مسندة
              </p>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="w-9 h-9 rounded-xl bg-white text-[#18181c] flex items-center justify-center font-bold text-sm shadow-xs">
                ر
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-white/70 px-2.5 py-1 rounded-xl">
                +31%
              </span>
            </div>
          </div>

          {/* Card 3: Pastel Cream matching 1.25 ETH */}
          <div className="bg-[#fef7db] rounded-[28px] p-5 border border-[#fdeab4] flex flex-col justify-between hover:scale-[1.02] transition-transform">
            <div>
              <div className="flex items-center justify-between text-[#d97706]">
                <span className="text-sm font-extrabold text-[#18181c]">
                  {dina?.full_name || 'دينا'}
                </span>
                <MoreHorizontal className="w-4 h-4 text-[#8a94a6]" />
              </div>
              <p className="text-[11px] text-[#6b7280] mt-0.5 font-medium">
                {dinaTasks.length} مهام مسندة
              </p>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="w-9 h-9 rounded-xl bg-white text-[#18181c] flex items-center justify-center font-bold text-sm shadow-xs">
                د
              </div>
              <span className="text-xs font-bold text-amber-700 bg-white/70 px-2.5 py-1 rounded-xl">
                +27%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
