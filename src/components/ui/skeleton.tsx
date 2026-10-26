import * as React from 'react';
import { cn } from '@/src/lib/cn';

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-subtle border border-border-hairline', className)}
      aria-hidden="true"
      {...props}
    />
  );
}
