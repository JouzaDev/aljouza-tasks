import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const variants = {
    primary:
      'bg-[#3b0764] hover:bg-[#4c0583] text-white shadow-sm shadow-[#3b0764]/20 border border-transparent',
    secondary:
      'bg-[#f5f3ff] hover:bg-[#ede9fe] text-[#581c87] border border-[#e9d5ff]',
    outline:
      'bg-white hover:bg-[#faf8fd] text-[#1e112a] border border-[#e9d5ff]',
    ghost:
      'bg-transparent hover:bg-[#f5f3ff] text-[#581c87] border-transparent',
    danger:
      'bg-[#fff1f2] hover:bg-[#ffe4e6] text-[#e11d48] border border-[#fecdd3]',
  };

  const sizes = {
    sm: 'text-sm px-3.5 py-2 rounded-xl gap-1.5 h-10',
    md: 'text-base px-5 py-3 rounded-2xl gap-2 h-12 font-medium',
    lg: 'text-lg px-6 py-4 rounded-2xl gap-2.5 h-14 font-semibold',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin ml-2" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
}
