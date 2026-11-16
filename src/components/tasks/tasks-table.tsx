'use client';

import React, { useState } from 'react';
import { Task } from '@/lib/types/database';
import { Badge } from '../ui/badge';
import { Search, Filter, CheckCircle2, Calendar, User } from 'lucide-react';

interface TasksTableProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  showAssignee?: boolean;
}

export function TasksTable({ tasks, onSelectTask, showAssignee = true }: TasksTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-3xl border border-[#f1edfa] p-5 shadow-sm space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-[#8c829e]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث في المهام بالعنوان أو الوصف..."
            className="w-full pr-11 pl-4 py-2.5 rounded-2xl border border-[#e9d5ff] focus:outline-none focus:ring-2 focus:ring-[#3b0764] text-sm bg-[#fcfbfe]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#8c829e]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-2xl border border-[#e9d5ff] focus:outline-none focus:ring-2 focus:ring-[#3b0764] text-sm bg-white"
          >
            <option value="all">جميع الحالات</option>
            <option value="todo">بانتظار البدء</option>
            <option value="in_progress">قيد التنفيذ</option>
            <option value="waiting_review">بانتظار الاعتماد</option>
            <option value="done">منجزة ومعتمدة</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="border-b border-[#f1edfa] text-[#8c829e] font-semibold text-xs">
              <th className="py-3 px-4">المهمة</th>
              {showAssignee && <th className="py-3 px-4">المسؤول</th>}
              <th className="py-3 px-4">المرحلة</th>
              <th className="py-3 px-4">الأولوية</th>
              <th className="py-3 px-4">الحالة</th>
              <th className="py-3 px-4">التسليم</th>
              <th className="py-3 px-4">الاعتماد</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1edfa]">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={showAssignee ? 7 : 6}
                  className="py-10 text-center text-xs text-[#8c829e]"
                >
                  لا توجد مهام مطابقة لخيارات البحث
                </td>
              </tr>
            ) : (
              filtered.map((task) => (
                <tr
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className="hover:bg-[#faf8fd] transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-bold text-[#1e112a] group-hover:text-[#3b0764]">
                    {task.title}
                  </td>
                  {showAssignee && (
                    <td className="py-3.5 px-4 text-[#5f556d]">
                      {task.assigned_profile?.full_name || '-'}
                    </td>
                  )}
                  <td className="py-3.5 px-4">
                    <Badge variant="purple" size="sm">
                      {task.phase}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        task.priority === 'urgent'
                          ? 'rose'
                          : task.priority === 'high'
                          ? 'amber'
                          : 'blue'
                      }
                      size="sm"
                    >
                      {task.priority}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        task.status === 'done'
                          ? 'emerald'
                          : task.status === 'waiting_review'
                          ? 'amber'
                          : 'slate'
                      }
                      size="sm"
                    >
                      {task.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-[#8c829e] text-xs">
                    {task.due_date || '-'}
                  </td>
                  <td className="py-3.5 px-4">
                    {task.manager_approved ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>معتمد</span>
                      </span>
                    ) : (
                      <span className="text-[#8c829e] text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
