import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/src/lib/cn';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 rounded-xl font-sans font-semibold transition-all duration-200 ease-orbai-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45 cursor-pointer select-none',
  {
    variants: {
      intent: {
        primary:
          'bg-brand-primary text-fg-on-brand hover:bg-brand-hover active:scale-[0.985] shadow-[0_6px_18px_-4px_rgba(13,74,62,0.38),inset_0_1px_0_0_rgba(255,255,255,0.22)]',
        secondary:
          'bg-white/75 dark:bg-[#112C27]/75 backdrop-blur-md text-fg-primary border border-white/80 dark:border-white/15 shadow-[0_2px_10px_-2px_rgba(13,74,62,0.06),inset_0_1px_0_0_rgba(255,255,255,0.85)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:bg-white/95 dark:hover:bg-[#163832]/90 hover:border-border-strong active:scale-[0.985]',
        outline:
          'bg-white/45 dark:bg-white/5 backdrop-blur-md text-brand-primary border border-brand-primary/75 hover:bg-brand-soft active:scale-[0.985]',
        ghost:
          'bg-transparent text-fg-secondary hover:bg-subtle/80 hover:text-fg-primary',
        ivory:
          'bg-[#FAF8F5]/95 backdrop-blur-md text-[#072B24] hover:bg-white active:scale-[0.985] shadow-[0_6px_20px_-4px_rgba(0,0,0,0.25),inset_0_1px_0_0_rgba(255,255,255,0.9)]',
        danger:
          'bg-semantic-danger text-white hover:opacity-90 active:scale-[0.985] shadow-xs',
      },
      size: {
        sm: 'min-h-9 px-3.5 py-1.5 text-xs',
        md: 'min-h-11 px-5 py-2.5 text-sm',
        lg: 'min-h-12 px-7 py-3 text-base',
        icon: 'min-h-11 min-w-11 p-0',
      },
    },
    defaultVariants: {
      intent: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, intent, size, isLoading = false, disabled, children, type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ intent, size, className }))}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading ? (
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
            aria-hidden="true"
          />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
