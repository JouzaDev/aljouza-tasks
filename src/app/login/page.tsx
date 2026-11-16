'use client';

import React, { useState } from 'react';
import {
  CheckSquare,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { loginWithEmailAndPassword } from '@/lib/supabase/actions';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await loginWithEmailAndPassword(email, password);
      if (res.success) {
        if (res.role === 'manager') {
          router.push('/admin/tasks');
        } else {
          router.push('/my-tasks');
        }
      } else {
        setError(res.error || 'فشل تسجيل الدخول. يرجى التحقق من صحة البيانات.');
      }
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-10px)] flex items-center justify-center p-4 sm:p-6 bg-[#f8fafd]">
      {/* Clean, centered login card with rounded corners and subtle shadow */}
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-[#e2e8f0]">
        {/* Header with Title: "إدارة مهام الجوزاء" with purple checkmark and charcoal font */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#f5f0ff] border border-[#e9d5ff] flex items-center justify-center mb-3 shadow-xs">
            <CheckSquare className="w-8 h-8 text-[#7c3aed]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18181c] tracking-tight">
            إدارة مهام الجوزاء
          </h1>
          <p className="text-xs text-[#8a94a6] font-medium mt-1.5">
            تسجيل الدخول إلى منصة إدارة المهام
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#18181c] mb-1.5">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8a94a6]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@aljouza.sa"
                className="w-full pr-10 pl-3 py-3 rounded-2xl border border-[#e2e8f0] focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 text-sm bg-[#f8fafd] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#18181c] mb-1.5">
              كلمة المرور
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8a94a6]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pr-10 pl-10 py-3 rounded-2xl border border-[#e2e8f0] focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 text-sm bg-[#f8fafd] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a94a6] hover:text-[#18181c] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#18181c] hover:bg-[#2c2c33] text-white font-extrabold text-sm transition-all shadow-md active:scale-[0.98] cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>دخول النظام</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
