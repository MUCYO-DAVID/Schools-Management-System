# Rwanda Schools Bridge System - Design System Documentation

## Overview

This document outlines the comprehensive design system implemented for the RSBS platform modernization. The system provides a unified, scalable foundation for all user-facing components across the application.

## Table of Contents

1. [Color System](#color-system)
2. [Typography](#typography)
3. [Components](#components)
4. [Layout System](#layout-system)
5. [Design Tokens](#design-tokens)
6. [Implementation Guide](#implementation-guide)

---

## Color System

### Primary Colors

The design system uses a carefully curated 5-color palette:

| Name | Hex | Usage | CSS Variable |
|------|-----|-------|--------------|
| Primary (Blue) | `#3B82F6` | CTAs, primary actions, links | `--primary` |
| Accent (Cyan) | `#06B6D4` | Highlights, secondary actions | `--accent` |
| Success (Green) | `#10B981` | Confirmation, positive states | `--success` |
| Warning (Orange) | `#F59E0B` | Alerts, cautionary states | `--warning` |
| Destructive (Red) | `#EF4444` | Errors, deletion actions | `--destructive` |

### Neutral Colors

| Name | Hex | Usage |
|------|-----|-------|
| Background | `#FFFFFF` | Main surface |
| Foreground | `#1F2937` | Text, primary content |
| Muted | `#F3F4F6` | Secondary surfaces |
| Muted Foreground | `#6B7280` | Secondary text |
| Border | `#E5E7EB` | Component borders |
| Input | `#E5E7EB` | Form input borders |
| Ring | `#3B82F6` | Focus rings |

## Typography

### Font Family

- **Sans Serif** (Body & Headings): Geist (via Next.js Google Fonts)
- **Mono** (Code): Geist Mono

### Typographic Scale

| Size | Font Size | Line Height | Weight | Usage |
|------|-----------|-------------|--------|-------|
| H1 | 32px | 40px | 700 | Page titles |
| H2 | 28px | 36px | 700 | Section headings |
| H3 | 24px | 32px | 600 | Subsection headings |
| H4 | 20px | 28px | 600 | Component titles |
| Body | 16px | 24px | 400 | Regular text |
| Body Small | 14px | 20px | 400 | Secondary text |
| Caption | 12px | 16px | 400 | Labels, hints |

### Line Heights

- Headings: 1.2 - 1.3
- Body Text: 1.5 - 1.6
- Labels: 1.4

## Components

### Core UI Components

All components are located in `/app/components/ui/`:

#### Basic Components

1. **Button** (`Button.tsx`)
   - Variants: default, outline, ghost, destructive
   - Sizes: sm, md, lg
   - States: loading, disabled
   - Usage: All interactive actions

2. **Input** (`Input.tsx`)
   - Variants: default, error
   - Icon support (leading/trailing)
   - Placeholder text
   - Usage: Form fields

3. **Card** (`Card.tsx`)
   - Recursive structure: `<Card>`, `<CardHeader>`, `<CardContent>`
   - Customizable borders and shadows
   - Usage: Content containers, panels

4. **Badge** (`Badge.tsx`)
   - Variants: default, secondary, outline, success, warning, destructive
   - Sizes: sm, md
   - Usage: Status labels, tags

5. **Avatar** (`Avatar.tsx`)
   - Configurable size (sm, md, lg)
   - Initials or image fallback
   - Status indicator support
   - Usage: User identification

#### Layout Components

1. **DashboardLayout** (`layout/DashboardLayout.tsx`)
   - Responsive sidebar + main content
   - Integrated topbar with search
   - Navigation support
   - User profile menu
   - Usage: Dashboard pages

2. **Topbar** (`layout/Topbar.tsx`)
   - Search functionality
   - Notification badge
   - Quick actions
   - User menu

3. **Sidebar** (`layout/Sidebar.tsx`)
   - Navigation items with icons
   - Active state highlighting
   - Badge support (unread counts)
   - Collapsible on mobile

#### Content Components

1. **Table** (`Table.tsx`)
   - Semantic HTML structure
   - Header, body, row, cell components
   - Sortable headers
   - Usage: Data display

2. **Skeleton** (`Skeleton.tsx`)
   - SkeletonCard, SkeletonTable, SkeletonAvatar, SkeletonText
   - Usage: Loading states

3. **EmptyState** (`EmptyState.tsx`)
   - NoResultsEmptyState, NoDataEmptyState
   - Configurable icons and messages
   - Usage: No data scenarios

4. **Progress** (`Progress.tsx`)
   - Animated progress bars
   - Customizable colors
   - Usage: Progress indication

### Dashboard Components

#### Admin Dashboard
- Located: `/app/admin/dashboard-modern.tsx`
- Features:
  - Overview statistics
  - School management data
  - User management charts
  - System health monitoring

#### Teacher Dashboard
- Located: `/app/teacher/dashboard-modern.tsx`
- Features:
  - Class management
  - Assignment tracking
  - Student performance analytics
  - Grade distribution charts

#### Student Dashboard
- Located: `/app/student/dashboard-modern.tsx`
- Features:
  - Course overview
  - Grade progress tracking
  - Assignment status
  - Skills assessment radar chart

### Authentication Pages

#### Login
- Location: `/app/auth/login-modern/page.tsx`
- Features: Email/password authentication, role-based routing
- Links to: Signup, Password Reset

#### Signup
- Location: `/app/auth/signup-modern/page.tsx`
- Features: Multi-step form, role selection, form validation
- Supports: Parents, Teachers, Students, School Leaders

#### Password Reset
- Location: `/app/auth/reset-password-modern/page.tsx`
- Features: Email verification, password reset form, success confirmation

#### Email Verification
- Location: `/app/auth/verify-code/page.tsx`
- Features: OTP verification, resend functionality

---

## Layout System

### Responsive Breakpoints

```
Mobile:    < 640px (sm)
Tablet:    640px - 1024px (md)
Desktop:   1024px - 1280px (lg)
Large:     > 1280px (xl)
```

### Grid System

- **12-column responsive grid** using Tailwind CSS
- Flexbox for most layouts
- CSS Grid for complex 2D layouts

### Spacing Scale

```
0.5  = 2px     (xs)
1    = 4px     (sm)
2    = 8px     (md)
3    = 12px    (lg)
4    = 16px    (xl)
6    = 24px    (2xl)
8    = 32px    (3xl)
12   = 48px    (4xl)
16   = 64px    (5xl)
```

---

## Design Tokens

### CSS Variables (in `globals.css`)

```css
/* Colors */
--background: 0 0% 100%;
--foreground: 217 32% 17%;
--primary: 217 92% 55%;
--accent: 188 100% 44%;
--success: 160 84% 39%;
--warning: 38 92% 50%;
--destructive: 0 84% 60%;
--muted: 210 40% 96%;
--muted-foreground: 217 13% 42%;
--border: 217 32% 90%;
--input: 217 32% 90%;
--ring: 217 92% 55%;

/* Border Radius */
--radius: 0.5rem;
```

### Tailwind Configuration

```js
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: 'hsl(var(--primary))',
        // ... other colors
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
    },
  },
}
```

---

## Implementation Guide

### Adding a New Component

1. Create file in `/app/components/ui/ComponentName.tsx`
2. Use semantic HTML elements
3. Accept `className` prop via React props
4. Apply design tokens via Tailwind classes
5. Export from `/app/components/ui/index.ts`

Example:
```tsx
import React from 'react'
import { cn } from '../../utils/cn'

interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline'
}

export const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'px-4 py-2 rounded-lg',
        variant === 'default' && 'bg-primary text-white',
        variant === 'outline' && 'border border-border',
        className
      )}
      {...props}
    />
  )
)
Component.displayName = 'Component'
```

### Creating a Dashboard Page

1. Use `DashboardLayout` component for consistent structure
2. Define `navItems` for role-specific navigation
3. Import and use dashboard components
4. Apply responsive grid layout (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
5. Use Charts (Recharts) for data visualization

### Styling Best Practices

✅ **DO:**
- Use Tailwind utility classes
- Leverage design tokens
- Use `cn()` utility for conditional classes
- Apply responsive prefixes (md:, lg:, xl:)
- Use semantic HTML
- Add ARIA attributes for accessibility

❌ **DON'T:**
- Use arbitrary color values (e.g., `text-[#123456]`)
- Use inline styles
- Mix margin/padding with gap on same element
- Create custom CSS files
- Use deprecated Bootstrap classes

### Component Accessibility

All components include:
- Semantic HTML elements
- ARIA labels and roles
- Focus management
- Keyboard navigation
- Color contrast compliance (WCAG AA)
- Screen reader support

---

## Examples

### Using the Button Component

```tsx
import { Button } from '@/app/components/ui/Button'

export function MyComponent() {
  return (
    <>
      <Button>Default Button</Button>
      <Button variant="outline">Outline Button</Button>
      <Button size="lg" isLoading>Loading State</Button>
      <Button disabled>Disabled Button</Button>
    </>
  )
}
```

### Creating a Dashboard Page

```tsx
'use client'

import { DashboardLayout } from '@/app/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card'

export default function MyDashboard() {
  const navItems = [
    { label: 'Overview', href: '/overview' },
    { label: 'Analytics', href: '/analytics' },
  ]

  return (
    <DashboardLayout
      navItems={navItems}
      user={{ name: 'John Doe', email: 'john@example.com' }}
    >
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
          </CardHeader>
          <CardContent>
            Content here
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
```

---

## Future Enhancements

- [ ] Dark mode support
- [ ] Custom theme generator
- [ ] Component Storybook
- [ ] Design token editor
- [ ] Accessibility audit tools

---

## Support

For design system questions or contributions:
1. Check existing components in `/app/components/`
2. Review Tailwind documentation: https://tailwindcss.com
3. Reference shadcn/ui patterns: https://ui.shadcn.com

---

**Last Updated:** March 2026
**Design System Version:** 1.0.0
