import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/src/lib/cn';

const inputVariants = cva(
  'flex w-full rounded-xl border bg-white/75 dark:bg-[#0C211D]/75 backdrop-blur-md px-3.5 py-2.5 text-base font-sans text-fg-primary shadow-[inset_0_1px_2px_rgba(13,74,62,0.04)] transition-all duration-150 placeholder:text-fg-muted/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus focus-visible:border-brand-primary disabled:cursor-not-allowed disabled:opacity-50 min-h-11',
  {
    variants: {
      state: {
        default: 'border-border-strong/80 hover:border-fg-muted',
        error: 'border-semantic-danger focus-visible:ring-semantic-danger',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, state, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(inputVariants({ state, className }))}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
