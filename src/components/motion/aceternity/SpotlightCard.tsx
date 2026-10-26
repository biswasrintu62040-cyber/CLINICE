import * as React from 'react';
import { cn } from '@/src/lib/cn';

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function SpotlightCard({
  children,
  className,
  ...props
}: SpotlightCardProps): React.JSX.Element {
  const divRef = React.useRef<HTMLDivElement>(null);
  const [coords, setCoords] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [opacity, setOpacity] = React.useState<number>(0);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>): void => {
    const el = divRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setCoords({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={cn(
        'glass-card-interactive relative overflow-hidden rounded-2xl border border-white/75 dark:border-white/12 bg-elevated hover:border-brand-primary/35',
        className
      )}
      {...props}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(480px circle at ${coords.x}px ${coords.y}px, rgba(13, 74, 62, 0.08), transparent 45%)`,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
