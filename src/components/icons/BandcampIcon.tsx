/**
 * Bandcamp Icon Component
 * SVG inline otimizado - substitui react-icons
 */

import React from 'react'
import type { IconProps } from './types'

export const BandcampIcon: React.FC<IconProps> = ({
  className = '',
  size = 24,
  color = 'currentColor',
  style,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    fill={color}
    style={style}
    aria-hidden="true"
  >
    <path d="M0 18.75l7.437-13.5h16.563l-7.438 13.5h-16.562zm18.082-3.75l3.543-6.375h-11.979l-3.543 6.375h11.979z" />
  </svg>
)

export default BandcampIcon
