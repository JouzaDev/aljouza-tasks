import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'purple' | 'emerald' | 'amber' | 'rose' | 'slate' | 'blue';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({ children, variant = 'purple', className = '', size = 'md' }: BadgeProps) {
  const variantStyles = {
    purple: 'bg-[#f5f3ff] text-[#581c87] border-[#e9d5ff]',
    emerald: 'bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]',
    amber: 'bg-[#fffbeb] text-[#92400e] border-[#fde68a]',
    rose: 'bg-[#fff1f2] text-[#9f1239] border-[#fecdd3]',
    slate: 'bg-[#f8fafc] text-[#334155] border-[#e2e8f0]',
    blue: 'bg-[#eff6ff] text-[#1e40af] border-[#bfdbfe]',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 rounded-xl',
    md: 'text-sm px-3.5 py-1 rounded-2xl font-medium',
    lg: 'text-base px-4 py-1.5 rounded-2xl font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 border transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}
