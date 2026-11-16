'use client';

import React, { useState } from 'react';
import {
  CheckSquare,
  Search,
  Bell,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { Profile } from '@/lib/types/database';
import { INITIAL_PROFILES } from '@/lib/supabase/mock-data';
import { switchDemoUser, logoutUser } from '@/lib/supabase/actions';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  currentUser: Profile;
  title?: string;
  subtitle?: string;
  pendingReviewCount?: number;
  onSearch?: (query: string) => void;
}

export function Header({
  currentUser,
  pendingReviewCount = 0,
}: HeaderProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isManager = currentUser.role === 'manager';

  const handleSwitchUser = async (profileId: string) => {
    setDropdownOpen(false);
    await switchDemoUser(profileId);
    window.location.reload();
  };

  const handleLogout = async () => {
    await logoutUser();
    router.push('/login');
  };

  return (
    <header className="flex items-center justify-between gap-4 pb-6 pt-2 border-b border-[#f1f3f7]">
      {/* Exact requested Title: "إدارة مهام الجوزاء" مع أيقونة مربع وعليه علامة صح باللون البنفسجي والخط باللون الأسود الفحمي */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#f5f0ff] border border-[#e9d5ff] flex items-center justify-center shrink-0">
          <CheckSquare className="w-6 h-6 text-[#7c3aed]" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18181c] tracking-tight">
            إدارة مهام الجوزاء
          </h1>
        </div>
      </div>

      {/* Right side controls matching the exact image header */}
      <div className="flex items-center gap-3">
        {/* Search Icon / Input */}
        <div className="relative">
          {searchOpen ? (
            <div className="flex items-center gap-2 bg-[#f4f7fb] px-3 py-1.5 rounded-2xl border border-[#e2e8f0]">
              <Search className="w-4 h-4 text-[#8a94a6]" />
              <input
                type="text"
                autoFocus
                placeholder="ابحث في المهام..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => !searchQuery && setSearchOpen(false)}
                className="bg-transparent border-none text-xs text-[#18181c] focus:outline-none w-36 sm:w-48"
              />
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 rounded-2xl hover:bg-[#f4f7fb] text-[#8a94a6] hover:text-[#18181c] transition-colors cursor-pointer"
              aria-label="البحث"
            >
              <Search className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2.5 rounded-2xl hover:bg-[#f4f7fb] text-[#8a94a6] hover:text-[#18181c] transition-colors relative cursor-pointer"
            aria-label="الإشعارات"
          >
            <Bell className="w-5 h-5" />
            {pendingReviewCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#f97316] rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-3xl border border-[#e2e8f0] shadow-xl p-4 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-[#f1f3f7]">
                <h4 className="font-bold text-xs text-[#18181c]">التنبيهات</h4>
                <span className="text-[10px] text-[#7c3aed] bg-[#f5f0ff] px-2 py-0.5 rounded-full font-bold">
                  {pendingReviewCount} جديدة
                </span>
              </div>
              <div className="mt-2 text-xs text-[#5f697a] py-2">
                {pendingReviewCount > 0 ? (
                  <p>هناك {pendingReviewCount} مهام تتطلب المراجعة والاعتماد.</p>
                ) : (
                  <p className="text-center py-2 text-[#8a94a6]">لا توجد تنبيهات جديدة.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill matching "Zoia M." in image */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 pl-2 pr-1.5 py-1.5 rounded-full hover:bg-[#f4f7fb] transition-colors cursor-pointer border border-transparent hover:border-[#e2e8f0]"
          >
            {/* Avatar with Cute styling */}
            <div className="w-9 h-9 rounded-full bg-[#fed7aa] text-[#9a3412] flex items-center justify-center font-bold text-base shadow-xs overflow-hidden">
              {currentUser.avatar_badge || currentUser.full_name[0]}
            </div>
            <span className="text-sm font-bold text-[#18181c] hidden sm:inline">
              {currentUser.full_name}
            </span>
            <ChevronDown className="w-4 h-4 text-[#8a94a6]" />
          </button>

          {/* User Switcher Dropdown */}
          {dropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-3xl border border-[#e2e8f0] shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-[#f1f3f7] mb-1.5">
                <p className="text-xs font-bold text-[#18181c]">{currentUser.full_name}</p>
                <p className="text-[11px] text-[#8a94a6]">{currentUser.email}</p>
                <div className="mt-1.5 inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#f4f7fb] text-[#7c3aed]">
                  {isManager ? 'مدير المنصة' : 'موظف تنفيذي'}
                </div>
              </div>

              {/* Only Manager can switch accounts */}
              {isManager && (
                <>
                  <div className="px-3 py-1 text-[11px] font-bold text-[#8a94a6]">
                    تبديل المستخدم (فريق العمل):
                  </div>

                  {INITIAL_PROFILES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSwitchUser(p.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-2xl text-xs transition-colors cursor-pointer ${
                        p.id === currentUser.id
                          ? 'bg-[#f5f0ff] text-[#7c3aed] font-bold'
                          : 'hover:bg-[#f4f7fb] text-[#18181c]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#fed7aa] flex items-center justify-center text-xs">
                          {p.avatar_badge || p.full_name[0]}
                        </span>
                        <span>{p.full_name}</span>
                      </div>
                      <span className="text-[10px] text-[#8a94a6]">
                        {p.role === 'manager' ? 'مدير' : p.job_title}
                      </span>
                    </button>
                  ))}
                </>
              )}

              <div className="pt-2 mt-2 border-t border-[#f1f3f7]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 p-2 rounded-2xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
