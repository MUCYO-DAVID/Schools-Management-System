import React from "react"
import { cn } from "../../utils/cn"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  initials?: string
  size?: "sm" | "md" | "lg"
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, initials, size = "md", className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-500 text-white font-semibold overflow-hidden flex-shrink-0",
          sizeMap[size],
          className
        )}
        {...props}
      >
        {src && (
          <img
            src={src}
            alt={alt || "Avatar"}
            className="h-full w-full object-cover"
          />
        )}
        {!src && initials && (
          <span>{initials}</span>
        )}
        {!src && !initials && (
          <svg
            className="h-full w-full text-muted-foreground"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.7 15.25c4.991 0 9.591 1.866 13.3 5.743zM16.601 12.3a3.993 3.993 0 003.761 5.973 5.018 5.018 0 002.6-1.48 4 4 0 10-6.361-4.493z" />
          </svg>
        )}
      </div>
    )
  }
)
Avatar.displayName = "Avatar"

export { Avatar }
