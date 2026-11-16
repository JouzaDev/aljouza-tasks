'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  FolderKanban,
  BarChart3,
  Box,
  Users,
  LogOut,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Profile } from '@/lib/types/database';
import { logoutUser } from '@/lib/supabase/actions';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  currentUser: Profile;
}

export function Sidebar({ currentUser }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isManager = currentUser.role === 'manager';

  const managerLinks = [
    {
      href: '/admin',
      label: 'نظرة عامة',
      icon: LayoutGrid,
      exact: true,
    },
    {
      href: '/admin/tasks',
      label: 'إدارة المهام',
      icon: FolderKanban,
    },
    {
      href: '/admin/goals',
      label: 'الأهداف',
      icon: BarChart3,
    },
    {
      href: '/admin/partners',
      label: 'الشراكات',
      icon: Box,
    },
  ];

  const employeeLinks = [
    {
      href: '/my-tasks',
      label: 'مهامي',
      icon: FolderKanban,
      exact: true,
    },
    {
      href: '/my-tasks/programs',
      label: 'برامجي',
      icon: Box,
    },
  ];

  const links = isManager ? managerLinks : employeeLinks;

  const handleLogout = async () => {
    await logoutUser();
    router.push('/login');
  };

  return (
    <aside className="w-18 sm:w-20 bg-[#18181c] rounded-r-[32px] sm:rounded-r-[36px] flex flex-col items-center justify-between py-7 px-2 shrink-0 z-20">
      {/* Top Logo Badge - Cream Square matching the image! */}
      <div className="flex flex-col items-center gap-6">
        <Link
          href={isManager ? '/admin' : '/my-tasks'}
          className="w-12 h-12 rounded-2xl bg-[#fff0db] hover:bg-[#ffe7c4] flex items-center justify-center transition-transform hover:scale-105 shadow-md group cursor-pointer"
          title="منصة الجوزاء"
        >
          {/* Logo shape */}
          <div className="relative flex flex-col items-center justify-center gap-0.5">
            <span className="w-4 h-1.5 bg-[#18181c] rounded-full" />
            <span className="w-5 h-1.5 bg-[#18181c] rounded-full" />
            <span className="w-3.5 h-1.5 bg-[#18181c] rounded-full" />
          </div>
        </Link>

        {/* Navigation Icon Stack */}
        <nav className="flex flex-col items-center gap-3">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 relative group cursor-pointer ${
                  isActive
                    ? 'bg-white/15 text-white shadow-xs'
                    : 'text-[#7d7d8a] hover:text-white hover:bg-white/5'
                }`}
                title={link.label}
              >
                <Icon className="w-5 h-5" />
                {isActive && (
                  <span className="absolute -right-2 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-[#7c3aed] rounded-l-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Logout / Settings icon matching the image */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={handleLogout}
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-[#7d7d8a] hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
          title="تسجيل الخروج"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
}
