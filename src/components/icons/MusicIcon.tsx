/**
 * Music Icon Component (Generic music note)
 * SVG inline otimizado - substitui react-icons
 */

import React from 'react'

interface IconProps {
  className?: string
  size?: number
  color?: string
}

export const MusicIcon: React.FC<IconProps> = ({
  className = '',
  size = 24,
  color = 'currentColor',
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    fill={color}
    aria-hidden="true"
  >
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
  </svg>
)

export default MusicIcon
