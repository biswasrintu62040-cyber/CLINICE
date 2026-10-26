import * as React from 'react';
import { motion } from 'motion/react';
import { useReducedMotionPreference } from '@/src/hooks/useReducedMotionPreference';
import { cn } from '@/src/lib/cn';

export interface SplitTextRevealProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2';
}

export function SplitTextReveal({
  text,
  className,
  as: Tag = 'h1',
}: SplitTextRevealProps): React.JSX.Element {
  const prefersReducedMotion = useReducedMotionPreference();
  const words = React.useMemo(() => text.split(' '), [text]);

  if (prefersReducedMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag className={cn('inline-block', className)} aria-label={text}>
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.42,
            delay: index * 0.04,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="inline-block mr-[0.26em]"
          aria-hidden="true"
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  );
}
