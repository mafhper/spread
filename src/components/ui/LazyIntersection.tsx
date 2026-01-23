import React, { useState, useEffect, useRef } from 'react'

interface LazyIntersectionProps {
  children: React.ReactNode
  rootMargin?: string
  threshold?: number | number[]
  className?: string
  minHeight?: string | number
}

/**
 * LazyIntersection - Defer rendering of components until they are near the viewport.
 * Useful for large landing page sections to reduce initial DOM size and hydration cost.
 */
export const LazyIntersection: React.FC<LazyIntersectionProps> = ({
  children,
  rootMargin = '200px',
  threshold = 0.01,
  className = '',
  minHeight = '400px',
}) => {
  const [isIntersecting, setIntersecting] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntersecting(true)
          observer.disconnect()
        }
      },
      { rootMargin, threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [rootMargin, threshold])

  return (
    <div
      ref={ref}
      className={className}
      style={{ minHeight: isIntersecting ? 'auto' : minHeight }}
    >
      {isIntersecting ? children : null}
    </div>
  )
}
