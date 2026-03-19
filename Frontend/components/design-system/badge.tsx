import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-blue-700',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-teal-700',
        success:
          'bg-success/10 text-success dark:bg-success/20',
        warning:
          'bg-warning/10 text-warning dark:bg-warning/20',
        danger:
          'bg-danger/10 text-danger dark:bg-danger/20',
        info:
          'bg-info/10 text-info dark:bg-info/20',
        outline:
          'border border-border bg-background hover:bg-slate-50 dark:hover:bg-slate-900',
        ghost:
          'hover:bg-slate-100 dark:hover:bg-slate-900',
      },
      size: {
        default: 'px-3 py-1 text-xs',
        sm: 'px-2 py-0.5 text-xs',
        lg: 'px-4 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div
      ref={ref}
      className={badgeVariants({ variant, size, className })}
      {...props}
    />
  )
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
