import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-800',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-red-600 dark:hover:bg-red-600',
        outline:
          'border border-input bg-background hover:bg-slate-50 hover:text-foreground dark:hover:bg-slate-900',
        ghost:
          'hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-900 dark:hover:text-slate-50',
        link: 'text-primary underline-offset-4 hover:underline',
        soft: 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={buttonVariants({ variant, size, className })}
      ref={ref}
      {...props}
    />
  )
);

Button.displayName = 'Button';

export { Button, buttonVariants };
