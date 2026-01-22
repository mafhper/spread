import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children: ReactNode;
}

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  children, 
  ...props 
}: ButtonProps) {
  const variants = {
    primary: 'bg-zinc-100 text-zinc-950 hover:bg-white shadow-lg shadow-white/10',
    secondary: 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700',
    ghost: 'bg-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800',
    outline: 'bg-transparent border border-zinc-700 text-zinc-100 hover:border-purple-400 hover:text-purple-400',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-6 py-2 text-sm',
    lg: 'px-8 py-3 text-base',
    icon: 'p-2',
  };

  return (
    <button
      className={cn(
        'rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
