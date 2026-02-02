import React, { useState, useEffect, useRef } from 'react'

interface LazyIntersectionProps {
  children: React.ReactNode
  rootMargin?: string
  threshold?: number | number[]
  className?: string
  minHeight?: string | number
  id?: string
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
  id,
}) => {
  const [isIntersecting, setIntersecting] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if we should render immediately due to hash anchor
    const hash = window.location.hash.replace('#', '')
    if (id && hash === id) {
      setIntersecting(true)
      return
    }

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
      id={id}
      className={className}
      style={{ minHeight: isIntersecting ? 'auto' : minHeight }}
    >
      {isIntersecting ? children : null}
    </div>
  )
}
