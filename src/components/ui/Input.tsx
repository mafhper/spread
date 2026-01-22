import type { InputHTMLAttributes } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ className, label, error, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium mb-1.5 text-zinc-400">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-purple-400 transition-colors',
          error && 'border-red-500 focus:border-red-500',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-400 mt-1 block">{error}</span>}
    </div>
  );
}
