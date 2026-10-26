import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useReducedMotionPreference } from '@/src/hooks/useReducedMotionPreference';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export interface ScrollStorySectionProps {
  children: React.ReactNode;
  className?: string;
}

export function ScrollStorySection({
  children,
  className,
}: ScrollStorySectionProps): React.JSX.Element {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotionPreference();

  useGSAP(
    () => {
      if (prefersReducedMotion) return;
      const items = gsap.utils.toArray<HTMLElement>('.gsap-story-item');
      if (items.length === 0) return;

      gsap.fromTo(
        items,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.14,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 84%',
            toggleActions: 'play none none none',
          },
        }
      );
    },
    { scope: containerRef, dependencies: [prefersReducedMotion] }
  );

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
