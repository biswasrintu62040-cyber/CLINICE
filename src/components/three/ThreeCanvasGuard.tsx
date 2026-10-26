import * as React from 'react';
import { useInViewport } from '@/src/hooks/useInViewport';
import { useReducedMotionPreference } from '@/src/hooks/useReducedMotionPreference';
import { useWebGLCapability } from '@/src/hooks/useWebGLCapability';
import { ThreeStaticFallback } from './ThreeStaticFallback';

const LazyOrbaiSanctumScene = React.lazy(() => import('./OrbaiSanctumScene'));

export function ThreeCanvasGuard(): React.JSX.Element {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isInView = useInViewport(containerRef);
  const prefersReducedMotion = useReducedMotionPreference();
  const canRenderWebGL = useWebGLCapability();

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 overflow-hidden">
      {!prefersReducedMotion && canRenderWebGL ? (
        <React.Suspense fallback={<ThreeStaticFallback />}>
          <LazyOrbaiSanctumScene isInView={isInView} />
        </React.Suspense>
      ) : (
        <ThreeStaticFallback />
      )}
    </div>
  );
}
