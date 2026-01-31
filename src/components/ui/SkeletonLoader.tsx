import React from 'react'
import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'

interface SkeletonLoaderProps {
  height?: string
  className?: string
  variant?: 'card' | 'text' | 'section'
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  height = '400px',
  className,
  variant = 'section',
}) => {
  return (
    <div
      className={clsx(
        'w-full flex items-center justify-center bg-white/5 animate-pulse rounded-xl',
        className
      )}
      style={{ height }}
      role="status"
      aria-label="Carregando conteúdo..."
    >
      <div className="flex flex-col items-center gap-4 text-white/20">
        <Loader2 size={32} className="animate-spin" />
        {variant === 'section' && (
          <div className="space-y-2 w-full max-w-md px-4">
            <div className="h-4 bg-white/10 rounded w-3/4 mx-auto" />
            <div className="h-4 bg-white/10 rounded w-1/2 mx-auto" />
          </div>
        )}
      </div>
    </div>
  )
}
