import * as React from 'react';
import lottie, { type AnimationItem } from 'lottie-web';
import { useInViewport } from '@/src/hooks/useInViewport';
import { useReducedMotionPreference } from '@/src/hooks/useReducedMotionPreference';
import { cn } from '@/src/lib/cn';

// Compact inline Lottie JSON checkmark & medical pulse definitions so they never fail network fetch
const VERIFIED_CHECK_LOTTIE_DATA = {
  v: '5.7.4',
  fr: 60,
  ip: 0,
  op: 45,
  w: 120,
  h: 120,
  nm: 'OrbaiVerifiedCheck',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'CheckLayer',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [60, 60, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [70, 70, 100], e: [104, 104, 100] },
            { t: 22, s: [104, 104, 100], e: [100, 100, 100] },
            { t: 38, s: [100, 100, 100] },
          ],
        },
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          it: [
            {
              d: 1,
              ty: 'el',
              s: { a: 0, k: [96, 96] },
              p: { a: 0, k: [0, 0] },
              nm: 'OuterRing',
            },
            {
              ty: 'st',
              c: { a: 0, k: [0.051, 0.29, 0.243, 1] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 5 },
              lc: 2,
              lj: 2,
            },
            {
              ty: 'fl',
              c: { a: 0, k: [0.933, 0.965, 0.957, 1] },
              o: { a: 0, k: 100 },
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
            },
          ],
        },
        {
          ty: 'gr',
          it: [
            {
              ind: 0,
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  i: [
                    [0, 0],
                    [0, 0],
                    [0, 0],
                  ],
                  o: [
                    [0, 0],
                    [0, 0],
                    [0, 0],
                  ],
                  v: [
                    [-18, 2],
                    [-5, 15],
                    [20, -12],
                  ],
                  c: false,
                },
              },
            },
            {
              ty: 'tm',
              s: { a: 0, k: 0 },
              e: {
                a: 1,
                k: [
                  { t: 8, s: [0], e: [100] },
                  { t: 34, s: [100] },
                ],
              },
              o: { a: 0, k: 0 },
              m: 1,
            },
            {
              ty: 'st',
              c: { a: 0, k: [0.051, 0.29, 0.243, 1] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 6.5 },
              lc: 2,
              lj: 2,
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
            },
          ],
        },
      ],
      ip: 0,
      op: 45,
      st: 0,
    },
  ],
};

export interface LottieViewportPlayerProps {
  loop?: boolean;
  className?: string;
}

export function LottieViewportPlayer({
  loop = false,
  className,
}: LottieViewportPlayerProps): React.JSX.Element {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const animRef = React.useRef<AnimationItem | null>(null);
  const isInView = useInViewport(containerRef);
  const prefersReducedMotion = useReducedMotionPreference();

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const instance = lottie.loadAnimation({
      container: el,
      renderer: 'svg',
      loop,
      autoplay: !prefersReducedMotion,
      animationData: JSON.parse(JSON.stringify(VERIFIED_CHECK_LOTTIE_DATA)),
    });

    animRef.current = instance;

    if (prefersReducedMotion) {
      instance.goToAndStop(40, true);
    }

    return () => {
      instance.destroy();
      animRef.current = null;
    };
  }, [loop, prefersReducedMotion]);

  React.useEffect(() => {
    const instance = animRef.current;
    if (!instance || prefersReducedMotion) return;
    if (isInView) {
      instance.play();
    } else {
      instance.pause();
    }
  }, [isInView, prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn('h-16 w-16 shrink-0', className)}
    />
  );
}
