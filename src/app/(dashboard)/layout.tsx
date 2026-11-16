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
    <div className="min-h-screen bg-[#f8fafd] flex flex-col lg:flex-row antialiased">
      {/* 
        القائمة الجانبية القابلة للطي على يمين لوحة التحكم (RTL Sidebar)
        تمت إزالة الإطار الأسود حول الموقع بالكامل ليصبح الموقع نظيفاً وعريضاً ومرناً
      */}
      <Sidebar currentUser={currentUser} />

      {/* منطقة المحتوى الرئيسية الواسعة بدون إطار أسود */}
      <main className="flex-1 min-w-0 p-4 sm:p-7 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full pt-20 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
