# RSBS Design System - Implementation Guide

## Quick Start

### 1. Setting Up Your Development Environment

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Open in browser
http://localhost:3000
```

### 2. Project Structure

```
Frontend/
├── app/
│   ├── admin/              # Admin dashboard pages
│   │   ├── dashboard-modern/
│   │   ├── students-modern/
│   │   ├── teachers-modern/
│   │   └── classes-modern/
│   ├── teacher/            # Teacher dashboard
│   ├── student/            # Student dashboard
│   ├── auth/               # Authentication pages
│   │   ├── login-modern/
│   │   ├── signup-modern/
│   │   ├── reset-password-modern/
│   │   └── verify-code/
│   ├── components/         # Reusable components
│   │   ├── ui/             # Base UI components
│   │   └── layout/         # Layout components
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── providers/          # Context providers
│   └── globals.css         # Global styles & tokens
├── public/                 # Static assets
├── tailwind.config.ts      # Tailwind configuration
├── next.config.js          # Next.js configuration
└── package.json
```

---

## Using Components

### Basic Components

#### Button

```tsx
import { Button } from '@/app/components/ui/Button'

export function MyComponent() {
  return (
    <>
      {/* Variants */}
      <Button>Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Delete</Button>

      {/* Sizes */}
      <Button size="sm">Small</Button>
      <Button size="md">Medium (default)</Button>
      <Button size="lg">Large</Button>

      {/* States */}
      <Button disabled>Disabled</Button>
      <Button isLoading>Loading...</Button>
      <Button asChild>
        <a href="/link">Link Button</a>
      </Button>
    </>
  )
}
```

#### Input

```tsx
import { Input } from '@/app/components/ui/Input'

export function MyForm() {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  return (
    <>
      <Input
        type="email"
        placeholder="Enter email"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      <Input
        type="password"
        placeholder="Enter password"
        error={error}
      />

      <Input
        icon="search"
        placeholder="Search..."
      />
    </>
  )
}
```

#### Card

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/app/components/ui/Card'

export function MyCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        Your content here
      </CardContent>
    </Card>
  )
}
```

#### Badge

```tsx
import { Badge } from '@/app/components/ui/Badge'

export function MyBadges() {
  return (
    <>
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge size="lg">Large</Badge>
    </>
  )
}
```

#### Progress

```tsx
import { Progress } from '@/app/components/ui/Progress'

export function MyProgress() {
  return (
    <>
      <Progress value={65} />
      <Progress value={100} />
      <Progress value={25} indicatorClassName="bg-destructive" />
    </>
  )
}
```

### Layout Components

#### DashboardLayout

```tsx
import { DashboardLayout } from '@/app/components/layout/DashboardLayout'

export function MyDashboard() {
  const navItems = [
    { label: 'Overview', href: '/overview' },
    { label: 'Users', href: '/users' },
    { label: 'Settings', href: '/settings' },
  ]

  const handleNavigate = (href: string) => {
    // Handle navigation
  }

  const handleLogout = () => {
    // Handle logout
  }

  return (
    <DashboardLayout
      navItems={navItems}
      user={{
        name: 'John Doe',
        email: 'john@example.com',
        initials: 'JD',
      }}
      notifications={3}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      searchPlaceholder="Search..."
    >
      {/* Your dashboard content */}
    </DashboardLayout>
  )
}
```

#### Table

```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/app/components/ui/Table'

export function MyTable() {
  const data = [
    { id: 1, name: 'John', email: 'john@example.com' },
    { id: 2, name: 'Jane', email: 'jane@example.com' },
  ]

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.email}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

### Loading States

#### Skeleton

```tsx
import { Skeleton, SkeletonCard, SkeletonTable, SkeletonAvatar } from '@/app/components/ui/Skeleton'

export function MyLoadingPage() {
  return (
    <>
      <SkeletonAvatar />
      <SkeletonCard />
      <SkeletonTable />
      <Skeleton className="h-4 w-full" />
    </>
  )
}
```

### Empty States

```tsx
import { NoResultsEmptyState, NoDataEmptyState } from '@/app/components/ui/EmptyState'

export function MyPage({ hasData, hasResults }) {
  if (!hasData) {
    return <NoDataEmptyState />
  }

  if (!hasResults) {
    return <NoResultsEmptyState searchTerm="students" />
  }

  return <div>Your content</div>
}
```

### Notifications (Toast)

```tsx
'use client'

import { useToast } from '@/app/hooks/useToast'
import { ToastContainer } from '@/app/components/ui/Toast'
import { Button } from '@/app/components/ui/Button'

export function MyComponent() {
  const { toasts, removeToast, success, error, info, warning } = useToast()

  return (
    <>
      <Button onClick={() => success('Operation successful!')}>
        Show Success
      </Button>
      <Button onClick={() => error('An error occurred')}>
        Show Error
      </Button>
      <Button onClick={() => info('Here is some information')}>
        Show Info
      </Button>
      <Button onClick={() => warning('Warning: be careful')}>
        Show Warning
      </Button>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  )
}
```

---

## Creating New Pages

### Dashboard Page Template

```tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/app/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import { useAuth } from '@/app/providers/AuthProvider'

const MyDashboardPage = () => {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login-modern')
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, router])

  const navItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Settings', href: '/settings' },
  ]

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <DashboardLayout
      navItems={navItems}
      user={{
        name: user?.firstName || 'User',
        email: user?.email || '',
        initials: user?.firstName?.[0] || 'U',
      }}
      notifications={0}
      onLogout={() => {
        logout()
        router.push('/auth/login-modern')
      }}
      onNavigate={(href) => router.push(href)}
    >
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        {/* Your content here */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
          </CardHeader>
          <CardContent>
            Content goes here
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default MyDashboardPage
```

### Form Page Template

```tsx
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import { useToast } from '@/app/hooks/useToast'

const MyFormPage = () => {
  const router = useRouter()
  const { success, error } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Your API call here
      success('Form submitted successfully!')
      router.push('/success-page')
    } catch (err: any) {
      error(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <h2 className="text-2xl font-bold">Form Title</h2>

          <div>
            <label className="block text-sm font-medium mb-2">
              Name
            </label>
            <input
              type="text"
              className="w-full h-10 px-4 rounded-lg border border-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <Button type="submit" disabled={loading} isLoading={loading}>
            Submit
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default MyFormPage
```

---

## Styling Guidelines

### Using Design Tokens

```tsx
// Colors
<div className="bg-background text-foreground">
  <p className="text-muted-foreground">Muted text</p>
  <button className="bg-primary text-white">Primary Button</button>
  <button className="border border-input">Input with border</button>
</div>

// Spacing
<div className="p-6 space-y-4">
  <div className="mb-2">Item 1</div>
  <div className="mb-2">Item 2</div>
</div>

// Border Radius
<div className="rounded-lg">Default radius</div>

// Responsive Design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Items */}
</div>
```

### Best Practices

✅ **DO:**
- Use Tailwind utility classes
- Apply design tokens for colors
- Use responsive prefixes (sm:, md:, lg:, xl:)
- Keep components small and focused
- Use semantic HTML
- Test accessibility

❌ **DON'T:**
- Use inline styles
- Use arbitrary color values
- Mix margin/padding with gap
- Create custom CSS files
- Use deprecated classes

---

## Data Fetching

### Using AuthProvider

```tsx
import { useAuth } from '@/app/providers/AuthProvider'

export function MyComponent() {
  const { user, token, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login
    }
  }, [isAuthenticated])

  return <div>Hello {user?.firstName}</div>
}
```

### API Calls with Authentication

```tsx
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

const response = await fetch(`${backendUrl}/api/endpoint`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
})
```

---

## Common Patterns

### Search and Filter

```tsx
const [searchTerm, setSearchTerm] = useState('')
const [filterStatus, setFilterStatus] = useState('all')

const filtered = data.filter((item) => {
  const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
  const matchesStatus = filterStatus === 'all' || item.status === filterStatus
  return matchesSearch && matchesStatus
})
```

### Pagination

```tsx
const [page, setPage] = useState(1)
const itemsPerPage = 10

const paginatedData = data.slice(
  (page - 1) * itemsPerPage,
  page * itemsPerPage
)

const totalPages = Math.ceil(data.length / itemsPerPage)
```

### Modal/Dialog

```tsx
const [isOpen, setIsOpen] = useState(false)

return (
  <>
    <Button onClick={() => setIsOpen(true)}>Open</Button>
    
    {isOpen && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <div className="p-6">
            <h2>Modal Title</h2>
            <button onClick={() => setIsOpen(false)}>Close</button>
          </div>
        </Card>
      </div>
    )}
  </>
)
```

---

## Performance Tips

1. **Lazy Load Components**
   ```tsx
   import dynamic from 'next/dynamic'
   
   const HeavyComponent = dynamic(() => import('./Heavy'))
   ```

2. **Use Memoization**
   ```tsx
   const MemoizedComponent = React.memo(MyComponent)
   ```

3. **Optimize Images**
   ```tsx
   import Image from 'next/image'
   
   <Image src="/image.jpg" alt="alt" width={400} height={300} />
   ```

4. **Code Splitting**
   ```tsx
   // Next.js automatically code splits routes
   ```

---

## Troubleshooting

### Components Not Appearing
- Check imports are correct
- Verify component is exported in index.ts
- Check for CSS conflicts

### Styles Not Applying
- Ensure Tailwind config is correct
- Check for conflicting classes
- Verify design tokens in globals.css

### Authentication Issues
- Check backend URL in .env
- Verify token storage in localStorage
- Check API response format

---

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Next.js Documentation](https://nextjs.org)
- [React Documentation](https://react.dev)
- [Design System (DESIGN_SYSTEM.md)](./DESIGN_SYSTEM.md)

---

**Last Updated:** March 2026
**Version:** 1.0.0
