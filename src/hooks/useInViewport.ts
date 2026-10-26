import { useEffect, useState, type RefObject } from 'react';

export function useInViewport<T extends Element>(
  elementRef: RefObject<T | null>,
  rootMargin = '120px'
): boolean {
  const [isIntersecting, setIsIntersecting] = useState<boolean>(true);

  useEffect(() => {
    const node = elementRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIsIntersecting(entry.isIntersecting);
        }
      },
      { rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [elementRef, rootMargin]);

  return isIntersecting;
}
