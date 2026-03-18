import React, { useState } from 'react'
import Image from 'next/image'

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  initials?: string
  status?: 'online' | 'offline' | 'away'
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, size = 'md', initials, status, ...props }, ref) => {
    const [imageError, setImageError] = useState(false)

    const sizeStyles = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
      xl: 'w-16 h-16',
    }

    const statusStyles = {
      online: 'bg-green-500',
      offline: 'bg-gray-400',
      away: 'bg-amber-500',
    }

    const showFallback = !src || imageError

    return (
      <div
        ref={ref}
        className={`relative inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground font-medium overflow-hidden flex-shrink-0 ${
          sizeStyles[size]
        } ${className || ''}`}
        {...props}
      >
        {!showFallback && src ? (
          <Image
            src={src}
            alt={alt || 'avatar'}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="text-sm font-semibold">{initials || 'U'}</span>
        )}

        {status && (
          <div
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
              statusStyles[status]
            }`}
          />
        )}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'

export default Avatar
