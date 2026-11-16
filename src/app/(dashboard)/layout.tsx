import React from 'react';
import { getCurrentUser } from '@/lib/supabase/actions';
import { Sidebar } from '@/components/layout/sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  return (
    <div className="ambient-bg min-h-screen p-2 sm:p-4 lg:p-6 flex items-center justify-center">
      {/* Tablet Bezel Shell matching the exact image framing! */}
      <div className="w-full max-w-[1440px] bg-[#18181c] p-2.5 sm:p-3 rounded-[38px] sm:rounded-[44px] shadow-2xl shadow-[#18181c]/25 border border-[#18181c] my-auto">
        {/* Inner Crisp White Screen */}
        <div className="bg-white rounded-[28px] sm:rounded-[34px] flex flex-row overflow-hidden min-h-[780px]">
          {/* Vertical Dark Sidebar */}
          <Sidebar currentUser={currentUser} />

          {/* Main Content Viewport */}
          <main className="flex-1 p-5 sm:p-7 lg:p-9 overflow-y-auto max-h-[88vh]">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
