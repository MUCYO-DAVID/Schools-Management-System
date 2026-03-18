# Quick Start Guide - Modern RSBS Redesign

Get started using the new modern components and design system in 5 minutes!

## Step 1: Understand the Structure

```
Frontend/app/
├── components/ui/          ← All UI components here
├── components/layout/      ← Layout components here
├── admin/
│   ├── dashboard-modern.tsx    ← Example: Admin dashboard
│   └── students-modern.tsx     ← Example: Students table
├── auth/
│   └── login-modern/page.tsx   ← Example: Login page
└── globals.css             ← Design tokens
```

## Step 2: View the Examples

Open these URLs in your browser to see what's been built:

1. **Admin Dashboard**: `http://localhost:3000/admin/dashboard-modern`
2. **Login Page**: `http://localhost:3000/auth/login-modern`
3. **Students Table**: `http://localhost:3000/admin/students-modern`

## Step 3: Import Components

Use components in any page:

```tsx
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui"
```

## Step 4: Create Your First Component

Example: Creating a simple stats card

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"

export function StatsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Students</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">1,234</p>
        <p className="text-sm text-muted-foreground">+5% from last month</p>
      </CardContent>
    </Card>
  )
}
```

## Step 5: Use DashboardLayout

Wrap your page in DashboardLayout for consistent design:

```tsx
"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/AuthProvider"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

export default function YourPage() {
  const router = useRouter()
  const { user, logout } = useAuth()

  return (
    <DashboardLayout
      navItems={[
        { label: "Dashboard", href: "/admin", icon: <span>📊</span> },
        { label: "Students", href: "/students", icon: <span>👥</span> },
      ]}
      user={{
        name: user?.firstName || "User",
        email: user?.email || "",
      }}
      onLogout={() => {
        logout()
        router.push("/auth/login-modern")
      }}
      onNavigate={(href) => router.push(href)}
    >
      {/* Your page content here */}
      <div className="p-6">
        <h1>Your Page Title</h1>
      </div>
    </DashboardLayout>
  )
}
```

## Common Patterns

### Button Variants

```tsx
<Button>Primary Button</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost">Ghost</Button>
<Button isLoading>Loading...</Button>
```

### Input Fields

```tsx
<Input
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  error="Invalid email"
  helperText="We'll never share your email"
/>
```

### Badges for Status

```tsx
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="destructive">Inactive</Badge>
<Badge variant="info">Info</Badge>
```

### Data Table

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {items.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.email}</TableCell>
        <TableCell>
          <Badge variant="success">{item.status}</Badge>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Form with Validation

```tsx
const [formData, setFormData] = useState({ email: "", password: "" })
const [errors, setErrors] = useState<Record<string, string>>({})

<form onSubmit={handleSubmit} className="space-y-4">
  <Input
    label="Email"
    type="email"
    value={formData.email}
    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
    error={errors.email}
  />
  <Input
    label="Password"
    type="password"
    value={formData.password}
    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
    error={errors.password}
  />
  <Button type="submit">Sign In</Button>
</form>
```

### Modals/Dialogs

```tsx
const [showDialog, setShowDialog] = useState(false)

<Dialog
  open={showDialog}
  onOpenChange={setShowDialog}
  title="Create New Student"
  description="Fill in the details below"
>
  <form onSubmit={handleSubmit} className="space-y-4">
    <Input label="First Name" placeholder="Jean" />
    <Input label="Last Name" placeholder="Niyigaba" />
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => setShowDialog(false)}>
        Cancel
      </Button>
      <Button type="submit">Create</Button>
    </div>
  </form>
</Dialog>
```

### Toast Notifications

```tsx
import { useToast } from "@/components/ui"

export function MyPage() {
  const { success, error, warning, info } = useToast()

  const handleAction = async () => {
    try {
      await doSomething()
      success("Success!", "Action completed successfully")
    } catch (err) {
      error("Error", "Something went wrong")
    }
  }

  return <Button onClick={handleAction}>Take Action</Button>
}
```

## Styling Tips

### Colors - Use Semantic Tokens ✅

```tsx
<div className="bg-background text-foreground">        ✅ Good
<div className="bg-primary text-primary-foreground">   ✅ Good
<div className="bg-muted text-muted-foreground">       ✅ Good

<div className="bg-white text-black">                   ❌ Wrong
<div className="bg-blue-500 text-white">              ❌ Wrong
```

### Spacing - Use 8px Grid ✅

```tsx
<div className="p-4 gap-6 mt-8">     ✅ Good (4, 6, 8)
<div className="space-y-4">          ✅ Good

<div className="p-5 gap-7 mt-9">     ❌ Wrong (5, 7, 9)
<div className="p-[20px]">           ❌ Wrong (arbitrary)
```

### Responsive Design ✅

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
<div className="hidden sm:block">
<div className="px-4 sm:px-6 lg:px-8">
```

## File Locations Cheat Sheet

| What | Where |
|------|-------|
| UI Components | `/app/components/ui/` |
| Layout Components | `/app/components/layout/` |
| Design Tokens | `/app/globals.css` |
| Tailwind Config | `/tailwind.config.js` |
| Utilities | `/app/utils/cn.ts` |
| Example Pages | `/app/admin/*-modern.tsx`, `/app/auth/login-modern/` |

## Next: Continue with Phase 4

Ready to build more pages? Follow these steps:

1. Copy structure from `/admin/students-modern.tsx`
2. Update the navigation items for your page
3. Create your page using the components
4. Follow patterns in `IMPLEMENTATION_GUIDE.md`

## Troubleshooting

**Components not showing styles?**
- Make sure you imported from `@/components/ui`
- Check that globals.css is loaded in layout.tsx
- Verify tailwind.config.js is correct

**Colors not right?**
- Use semantic color names (primary, secondary, muted, etc.)
- Don't use direct color names (blue, red, gray)
- Check globals.css for color definitions

**Layout looks broken?**
- Use DashboardLayout wrapper
- Don't use absolute positioning unless necessary
- Use flexbox for layouts

## Getting Help

1. **Check examples**: Look at `dashboard-modern.tsx` or `students-modern.tsx`
2. **Read guide**: See `IMPLEMENTATION_GUIDE.md` for patterns
3. **Review docs**: Check `REDESIGN_README.md` for details
4. **Check components**: Look at component files for available props

## Key Files to Study

- `/app/components/ui/Card.tsx` - How to structure components
- `/app/admin/dashboard-modern.tsx` - Complete page example
- `/app/admin/students-modern.tsx` - Table example
- `/app/globals.css` - Design tokens and utilities

---

**Ready to start?** Pick a page and follow the patterns you see in the examples!

**Questions?** Check REDESIGN_README.md or IMPLEMENTATION_GUIDE.md

**Version**: 1.0  
**Last Updated**: March 18, 2026
