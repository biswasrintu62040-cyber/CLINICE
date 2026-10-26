import * as React from 'react';

export function ThreeStaticFallback(): React.JSX.Element {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-45"
    >
      <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(197,160,89,0.25),transparent_70%)]" />
      <div className="absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(13,74,62,0.22),transparent_70%)]" />
    </div>
  );
}
