'use client';

import React, { useState } from 'react';
import {
  CheckSquare,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { loginWithEmailAndPassword } from '@/lib/supabase/actions';
import { INITIAL_PROFILES } from '@/lib/supabase/mock-data';
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
          router.push('/admin');
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

  const handleSelectQuickUser = (profileEmail: string) => {
    setEmail(profileEmail);
    setPassword('123');
    setError(null);
  };

  return (
    <div className="ambient-bg min-h-screen flex items-center justify-center p-4">
      {/* Outer Tablet Frame matching the cloned aesthetic */}
      <div className="w-full max-w-md bg-[#18181c] p-2.5 sm:p-3 rounded-[36px] sm:rounded-[42px] shadow-2xl">
        <div className="bg-white rounded-[28px] sm:rounded-[32px] p-7 sm:p-9 shadow-inner">
          {/* Header with Title: "إدارة مهام الجوزاء" with purple checkmark and charcoal font */}
          <div className="flex flex-col items-center text-center mb-7">
            <div className="w-14 h-14 rounded-3xl bg-[#f5f0ff] border border-[#e9d5ff] flex items-center justify-center mb-3 shadow-xs">
              <CheckSquare className="w-8 h-8 text-[#7c3aed]" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#18181c] tracking-tight">
              إدارة مهام الجوزاء
            </h1>
            <p className="text-xs text-[#8a94a6] mt-1">
              تسجيل الدخول بالبريد الإلكتروني وكلمة المرور
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
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
                  placeholder="name@aljouza.com"
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
              className="w-full py-3.5 px-4 rounded-2xl bg-[#18181c] hover:bg-[#2c2c33] text-white font-extrabold text-sm transition-all shadow-md active:scale-[0.98] cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>دخول النظام</span>
              )}
            </button>
          </form>

          {/* Quick Selection for the 4 Team Members */}
          <div className="mt-6 pt-5 border-t border-[#f1f3f7]">
            <p className="text-[11px] font-bold text-[#8a94a6] mb-2.5 text-center">
              اختيار سريع لحسابات فريق العمل (كلمة المرور: 123):
            </p>
            <div className="grid grid-cols-2 gap-2">
              {INITIAL_PROFILES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectQuickUser(p.email)}
                  className={`p-2 rounded-xl border text-right transition-all flex items-center gap-2 cursor-pointer ${
                    email === p.email
                      ? 'bg-[#f5f0ff] border-[#7c3aed] text-[#7c3aed]'
                      : 'bg-[#f8fafd] hover:bg-[#f1f5fa] border-[#e2e8f0] text-[#18181c]'
                  }`}
                >
                  <span className="w-6 h-6 rounded-lg bg-[#fed7aa] flex items-center justify-center text-xs font-bold shrink-0">
                    {p.avatar_badge || p.full_name[0]}
                  </span>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold leading-tight truncate">{p.full_name}</p>
                    <p className="text-[10px] text-[#8a94a6] truncate">
                      {p.role === 'manager' ? 'مدير' : 'موظف'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
