'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CheckSquare,
  Target,
  Layers,
  Handshake,
  Award,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Sparkles,
  User,
  Shield,
  Briefcase,
  Menu,
  X,
} from 'lucide-react';
import { Profile } from '@/lib/types/database';
import { INITIAL_PROFILES } from '@/lib/supabase/mock-data';
import { switchDemoUser, logoutUser } from '@/lib/supabase/actions';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  currentUser: Profile;
}

export function Sidebar({ currentUser }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isManager = currentUser.role === 'manager';

  // Collapsible state (collapsed by default or read from localStorage)
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('aljouza_sidebar_collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('aljouza_sidebar_collapsed', String(nextState));
  };

  // Requested Menu Structure:
  // 1. المهام (Tasks)
  // 2. الأهداف المستقبلية (Future Goals)
  // 3. المشاريع (Projects)
  // 4. شركاء النجاح (Success Partners)
  // 5. المنجزات (Achievements)
  // 6. التقارير (Reports)
  const managerLinks = [
    {
      href: '/admin/tasks',
      label: 'المهام',
      icon: CheckSquare,
      badge: null,
    },
    {
      href: '/admin/goals',
      label: 'الأهداف المستقبلية',
      icon: Target,
      badge: 'OKRs',
    },
    {
      href: '/admin/projects',
      label: 'المشاريع',
      icon: Layers,
      badge: null,
    },
    {
      href: '/admin/partners',
      label: 'شركاء النجاح',
      icon: Handshake,
      badge: 'فاعلية',
    },
    {
      href: '/admin/achievements',
      label: 'المنجزات',
      icon: Award,
      badge: 'الفريق',
    },
    {
      href: '/admin/reports',
      label: 'التقارير الدورية',
      icon: BarChart3,
      badge: 'أسبوعية/شهرية',
    },
  ];

  const employeeLinks = [
    {
      href: '/my-tasks',
      label: 'مهامي اليومية',
      icon: CheckSquare,
      badge: null,
    },
    {
      href: '/admin/goals',
      label: 'الأهداف المستقبلية',
      icon: Target,
      badge: null,
    },
    {
      href: '/admin/projects',
      label: 'المشاريع',
      icon: Layers,
      badge: null,
    },
    {
      href: '/admin/partners',
      label: 'شركاء النجاح',
      icon: Handshake,
      badge: null,
    },
    {
      href: '/admin/achievements',
      label: 'منجزاتي',
      icon: Award,
      badge: null,
    },
  ];

  const links = isManager ? managerLinks : employeeLinks;

  const handleSwitchUser = async (profileId: string) => {
    setUserDropdownOpen(false);
    await switchDemoUser(profileId);
    window.location.reload();
  };

  const handleLogout = async () => {
    await logoutUser();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile Top Navbar with Menu Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#f1f3f7] px-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#f5f0ff] border border-[#e9d5ff] flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-[#7c3aed]" />
          </div>
          <span className="font-extrabold text-base text-[#18181c]">إدارة مهام الجوزاء</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl bg-[#f4f7fb] text-[#18181c]"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop Collapsible Sidebar placed on the RIGHT (RTL Position) */}
      <aside
        className={`hidden lg:flex flex-col justify-between bg-white border-l border-[#f1f3f7] h-screen sticky top-0 transition-all duration-300 z-30 shrink-0 ${
          isCollapsed ? 'w-20 px-2 py-6' : 'w-68 px-4 py-6 shadow-xs'
        }`}
      >
        {/* Upper Part */}
        <div>
          {/* Header Brand + Collapse Button */}
          <div className="flex items-center justify-between pb-5 border-b border-[#f1f3f7] mb-5">
            {!isCollapsed ? (
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-10 h-10 rounded-2xl bg-[#f5f0ff] border border-[#e9d5ff] flex items-center justify-center shrink-0">
                  <CheckSquare className="w-6 h-6 text-[#7c3aed]" />
                </div>
                <div className="text-right">
                  <h2 className="text-base font-extrabold text-[#18181c] leading-tight">
                    منصة الجوزاء
                  </h2>
                  <span className="text-[10px] text-[#7c3aed] font-bold">taska.aljouza.sa</span>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 mx-auto rounded-2xl bg-[#f5f0ff] border border-[#e9d5ff] flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-[#7c3aed]" />
              </div>
            )}

            {/* Collapse Toggle Button */}
            <button
              onClick={toggleCollapse}
              className={`p-1.5 rounded-xl hover:bg-[#f4f7fb] text-[#8a94a6] hover:text-[#18181c] transition-colors cursor-pointer ${
                isCollapsed ? 'mx-auto mt-2' : ''
              }`}
              title={isCollapsed ? 'توسيع القائمة' : 'طي القائمة'}
            >
              {isCollapsed ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Navigation Links in exact requested order */}
          <nav className="space-y-1.5">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3.5 px-3 py-3 rounded-2xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#18181c] text-white shadow-sm'
                      : 'text-[#627084] hover:bg-[#f4f7fb] hover:text-[#18181c]'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  title={link.label}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#7c3aed]' : ''}`} />
                  {!isCollapsed && (
                    <div className="flex-1 flex items-center justify-between text-right">
                      <span>{link.label}</span>
                      {link.badge && (
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-white/15 text-white'
                              : 'bg-[#f4f7fb] text-[#8a94a6]'
                          }`}
                        >
                          {link.badge}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Lower Part: User profile & Member Switcher */}
        <div className="pt-4 border-t border-[#f1f3f7]">
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className={`w-full flex items-center p-2.5 rounded-2xl bg-[#f8fafd] hover:bg-[#f1f5fa] border border-[#e2e8f0] transition-all cursor-pointer ${
                isCollapsed ? 'justify-center p-2' : 'justify-between'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-[#fed7aa] text-[#9a3412] flex items-center justify-center font-bold text-sm shrink-0">
                  {currentUser.avatar_badge || currentUser.full_name[0]}
                </span>
                {!isCollapsed && (
                  <div className="text-right overflow-hidden">
                    <p className="text-xs font-bold text-[#18181c] truncate">
                      {currentUser.full_name}
                    </p>
                    <p className="text-[10px] text-[#8a94a6] truncate">{currentUser.email}</p>
                  </div>
                )}
              </div>
            </button>

            {/* Quick Switch Dropdown */}
            {userDropdownOpen && (
              <div
                className={`absolute bottom-full mb-2 bg-white rounded-2xl border border-[#e2e8f0] shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 ${
                  isCollapsed ? 'right-0 w-56' : 'right-0 left-0'
                }`}
              >
                <div className="px-2 py-1 text-[11px] font-bold text-[#8a94a6] border-b border-[#f1f3f7] mb-1">
                  تبديل الحساب (فريق منصة الجوزاء):
                </div>
                {INITIAL_PROFILES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSwitchUser(p.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                      p.id === currentUser.id
                        ? 'bg-[#f5f0ff] text-[#7c3aed] font-bold'
                        : 'hover:bg-[#f4f7fb] text-[#18181c]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-lg bg-[#fed7aa] flex items-center justify-center text-[10px]">
                        {p.avatar_badge || p.full_name[0]}
                      </span>
                      <span>{p.full_name}</span>
                    </div>
                    <span className="text-[10px] text-[#8a94a6]">
                      {p.role === 'manager' ? 'مدير' : 'موظف'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`mt-2 flex items-center gap-2 w-full p-2 rounded-xl text-xs font-bold text-[#8a94a6] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center' : 'justify-start'
            }`}
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && <span>تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-[#18181c]/50 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 h-full bg-white z-10 p-5 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#f1f3f7] mb-4">
                <span className="font-extrabold text-base text-[#18181c]">إدارة مهام الجوزاء</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg bg-[#f4f7fb]"
                >
                  <X className="w-5 h-5 text-[#18181c]" />
                </button>
              </div>

              <nav className="space-y-2">
                {links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold text-sm bg-[#f8fafd] text-[#18181c]"
                    >
                      <Icon className="w-5 h-5 text-[#7c3aed]" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 text-rose-600 font-bold text-sm w-full justify-center"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
