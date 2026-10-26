import * as React from 'react';
import { cn } from '@/src/lib/cn';

export interface OrbaiSanctumEmblemProps {
  size?: 'sm' | 'md' | 'lg' | 'intro';
  half?: 'full' | 'left' | 'right';
  className?: string;
}

export function OrbaiSanctumEmblem({
  size = 'md',
  half = 'full',
  className,
}: OrbaiSanctumEmblemProps): React.JSX.Element {
  const dimensions =
    size === 'sm'
      ? 'h-6 w-6'
      : size === 'lg'
        ? 'h-12 w-12'
        : size === 'intro'
          ? 'h-16 w-16 sm:h-20 sm:w-20'
          : 'h-8 w-8';

  const clipStyle =
    half === 'left'
      ? { clipPath: 'inset(0 50% 0 0)' }
      : half === 'right'
        ? { clipPath: 'inset(0 0 0 50%)' }
        : undefined;

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={clipStyle}
      className={cn('shrink-0 select-none', dimensions, className)}
      aria-hidden="true"
    >
      {/* Outer Architectural Sanctuary Ring */}
      <circle
        cx="32"
        cy="32"
        r="28"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeOpacity="0.88"
      />
      {/* Golden-Ratio Orbital Arcs */}
      <path
        d="M32 8C45.2548 8 56 18.7452 56 32C56 45.2548 45.2548 56 32 56"
        stroke="#C5A059"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M32 56C18.7452 56 8 45.2548 8 32C8 18.7452 18.7452 8 32 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="3 3"
      />
      {/* Inner Diamond Sanctuary Geometry */}
      <polygon
        points="32,14 50,32 32,50 14,32"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeOpacity="0.7"
      />
      {/* Precision Clinical Cross Axis */}
      <line x1="32" y1="18" x2="32" y2="46" stroke="#C5A059" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="32" x2="46" y2="32" stroke="#C5A059" strokeWidth="2" strokeLinecap="round" />
      {/* Center Botanical Gold Node */}
      <circle cx="32" cy="32" r="4.5" fill="#C5A059" />
      <circle cx="32" cy="32" r="2" fill="#FAF8F5" />
    </svg>
  );
}
