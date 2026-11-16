import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
}

export function Card({ children, hoverable = false, className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-white rounded-3xl border border-[#f1edfa] p-6 shadow-sm shadow-[#3b0764]/5 transition-all duration-200 ${
        hoverable ? 'hover:shadow-md hover:shadow-[#3b0764]/10 hover:border-[#e9d5ff] hover:-translate-y-0.5' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
