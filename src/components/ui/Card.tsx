import * as React from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden',
        className
      )}
      {
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        ...(props as any)
      }
    >
      {children}
    </div>
  )
}
