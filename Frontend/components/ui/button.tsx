import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-sm whitespace-nowrap rounded-lg text-body-md font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-rwanda-blue text-white hover:bg-rwanda-blue-dark shadow-sm hover:shadow-md",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 shadow-sm hover:shadow-md",
        outline:
          "border-2 border-rwanda-blue text-rwanda-blue hover:bg-rwanda-blue hover:text-white transition-all",
        secondary:
          "bg-neutral-200 text-neutral-900 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-50 dark:hover:bg-neutral-600 shadow-sm hover:shadow-md",
        ghost: "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-foreground",
        link: "text-rwanda-blue underline-offset-4 hover:underline",
        success: "bg-green-500 text-white hover:bg-green-600 shadow-sm hover:shadow-md",
      },
      size: {
        default: "h-10 px-lg py-md",
        sm: "h-9 rounded-md px-md py-xs text-body-sm",
        lg: "h-11 rounded-lg px-xl py-lg",
        icon: "h-10 w-10 p-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
