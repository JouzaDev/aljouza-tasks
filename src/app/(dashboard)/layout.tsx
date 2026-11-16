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
    <div className="flex-1 flex flex-col lg:flex-row min-h-0 w-full antialiased">
      {/* 
        القائمة الجانبية العائمة بحواف دائرية على اليمين (RTL Floating Sidebar)
      */}
      <Sidebar currentUser={currentUser} />

      {/* منطقة المحتوى الرئيسية المتجاوبة مع الجوال والأجهزة اللوحية والمكتبية */}
      <main className="flex-1 min-w-0 p-3 sm:p-6 lg:p-7 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
