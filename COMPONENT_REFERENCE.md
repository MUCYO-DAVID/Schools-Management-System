# Component Reference Guide

Complete visual and code reference for all components in the modern RSBS redesign.

## Core Components

### 1. Button Component

**File**: `/app/components/ui/Button.tsx`

**Variants**:
- `default` - Primary action button
- `secondary` - Secondary actions
- `destructive` - Delete/danger actions
- `outline` - Ghost outline style
- `ghost` - Minimal style
- `link` - Text link style

**Sizes**:
- `default` - Standard size
- `sm` - Small button
- `lg` - Large button
- `icon` - Icon-only button

**Props**:
```tsx
<Button
  variant="default"              // default | secondary | destructive | outline | ghost | link
  size="default"                 // default | sm | lg | icon
  isLoading={false}              // Shows spinner
  disabled={false}               // Disabled state
  onClick={() => {}}             // Click handler
>
  Click Me
</Button>
```

**Examples**:
```tsx
<Button>Save</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Learn More</Button>
<Button variant="ghost">More options</Button>
<Button variant="link">Forgot password?</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button isLoading>Saving...</Button>
<Button disabled>Disabled</Button>
```

---

### 2. Input Component

**File**: `/app/components/ui/Input.tsx`

**Props**:
```tsx
<Input
  label="Email Address"          // Label text
  type="text"                    // Input type: text, email, password, number, etc.
  placeholder="Enter email"      // Placeholder text
  value=""                       // Input value
  onChange={(e) => {}}           // Change handler
  error="Invalid email"          // Error message
  helperText="Min 8 characters" // Helper text below
  icon={<Mail className="h-4 w-4" />}  // Icon component
  disabled={false}               // Disabled state
/>
```

**Examples**:
```tsx
<Input label="Email" type="email" placeholder="you@example.com" />
<Input label="Password" type="password" placeholder="••••••••" />
<Input 
  label="Search" 
  icon={<Search className="h-4 w-4" />}
  placeholder="Type to search..." 
/>
<Input 
  label="Username" 
  error="Username already taken"
  helperText="Choose a unique username"
/>
<Input label="Name" disabled value="Read only" />
```

---

### 3. Card Components

**File**: `/app/components/ui/Card.tsx`

**Sub-components**:
- `Card` - Container
- `CardHeader` - Header section
- `CardTitle` - Title text
- `CardDescription` - Subtitle/description
- `CardContent` - Main content
- `CardFooter` - Footer actions

**Example**:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description or subtitle</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

**Variants**:
```tsx
// Simple card
<Card>
  <CardContent className="pt-6">
    <p>Content</p>
  </CardContent>
</Card>

// Header + Content
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Content</p>
  </CardContent>
</Card>

// Full featured
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content</p>
  </CardContent>
  <CardFooter>
    <Button>Save</Button>
  </CardFooter>
</Card>
```

---

### 4. Avatar Component

**File**: `/app/components/ui/Avatar.tsx`

**Props**:
```tsx
<Avatar
  src="/image.jpg"               // Image URL
  alt="User name"                // Alt text
  initials="JN"                  // Fallback initials
  size="md"                      // sm | md | lg
/>
```

**Examples**:
```tsx
<Avatar src="/avatar.jpg" alt="Jean Niyigaba" />
<Avatar initials="JN" />
<Avatar initials="JN" size="sm" />
<Avatar initials="JN" size="lg" />
<Avatar src="/avatar.jpg" initials="JN" />  // Image with fallback
```

---

### 5. Badge Component

**File**: `/app/components/ui/Badge.tsx`

**Variants**:
- `default` - Primary badge
- `secondary` - Secondary
- `destructive` - Red/danger
- `outline` - Outlined
- `success` - Green success
- `warning` - Yellow warning
- `info` - Blue info

**Examples**:
```tsx
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="destructive">Inactive</Badge>
<Badge variant="info">Information</Badge>
<Badge variant="outline">Outlined</Badge>
```

---

### 6. Table Components

**File**: `/app/components/ui/Table.tsx`

**Sub-components**:
- `Table` - Container
- `TableHeader` - Header section
- `TableBody` - Body section
- `TableFooter` - Footer section
- `TableRow` - Row element
- `TableHead` - Header cell
- `TableCell` - Data cell

**Example**:
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Status</TableHead>
      <TableHead className="text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.email}</TableCell>
        <TableCell>
          <Badge variant="success">Active</Badge>
        </TableCell>
        <TableCell className="text-right">
          <Button size="sm" variant="ghost">Edit</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

### 7. Dialog/Modal Component

**File**: `/app/components/ui/Dialog.tsx`

**Props**:
```tsx
<Dialog
  open={isOpen}                  // Boolean state
  onOpenChange={setIsOpen}       // State setter
  title="Dialog Title"           // Title
  description="Dialog description"
  className="custom-class"       // Custom styles
  contentClassName="custom"      // Content wrapper styles
>
  {/* Content goes here */}
</Dialog>
```

**Example**:
```tsx
const [open, setOpen] = useState(false)

return (
  <>
    <Button onClick={() => setOpen(true)}>Open</Button>
    
    <Dialog
      open={open}
      onOpenChange={setOpen}
      title="Create New Item"
      description="Fill in the form below"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Name" placeholder="Enter name" />
        <Input label="Email" type="email" placeholder="Enter email" />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit">Create</Button>
        </div>
      </form>
    </Dialog>
  </>
)
```

---

### 8. Skeleton Component

**File**: `/app/components/ui/Skeleton.tsx`

**Basic Skeleton**:
```tsx
<Skeleton className="h-12 w-12 rounded-full" />    // Avatar
<Skeleton className="h-4 w-full" />                 // Text line
<Skeleton className="h-10 w-full" />                // Input
```

**Preset Skeletons**:
```tsx
import { 
  SkeletonCard, 
  SkeletonTable, 
  SkeletonAvatar, 
  SkeletonText 
} from "@/components/ui"

<SkeletonCard />      // Card loading skeleton
<SkeletonTable />     // Table loading skeleton
<SkeletonAvatar />    // Avatar loading skeleton
<SkeletonText />      // Text loading skeleton
```

**Usage in Loading State**:
```tsx
{loading ? (
  <SkeletonCard />
) : (
  <Card>
    {/* Content */}
  </Card>
)}
```

---

### 9. EmptyState Component

**File**: `/app/components/ui/EmptyState.tsx`

**Basic EmptyState**:
```tsx
<EmptyState
  icon={<Plus className="h-12 w-12" />}
  title="No data found"
  description="Create your first item to get started"
  action={{
    label: "Create",
    onClick: () => {}
  }}
/>
```

**Preset EmptyStates**:
```tsx
// No results
<NoResultsEmptyState
  searchQuery="invalid"
  onClear={() => setSearch("")}
/>

// No data
<NoDataEmptyState
  title="No students yet"
  description="Add your first student to get started"
  actionLabel="Add Student"
  onAction={() => setShowForm(true)}
/>
```

---

### 10. Toast Component

**File**: `/app/components/ui/Toast.tsx`

**Using useToast Hook**:
```tsx
import { useToast } from "@/components/ui"

export function MyComponent() {
  const { success, error, warning, info } = useToast()

  return (
    <div className="space-y-2">
      <Button onClick={() => success("Success!", "Operation completed")}>
        Success
      </Button>
      <Button onClick={() => error("Error", "Something went wrong")}>
        Error
      </Button>
      <Button onClick={() => warning("Warning", "Be careful!")}>
        Warning
      </Button>
      <Button onClick={() => info("Info", "Here's some information")}>
        Info
      </Button>
    </div>
  )
}
```

---

## Layout Components

### Sidebar Component

**File**: `/app/components/layout/Sidebar.tsx`

**Props**:
```tsx
<Sidebar
  items={navItems}              // Array of NavItem
  onLogout={() => {}}            // Logout handler
  onNavigate={(href) => {}}      // Navigation handler
  collapsed={false}              // Collapsed state
  onCollapsedChange={(v) => {}}  // Collapsed state setter
/>
```

**NavItem Structure**:
```tsx
interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
  submenu?: NavItem[]
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: <BarChart className="h-5 w-5" />,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: <Users className="h-5 w-5" />,
    badge: 5,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: <Settings className="h-5 w-5" />,
    submenu: [
      {
        label: "General",
        href: "/admin/settings/general",
        icon: <Cog className="h-5 w-5" />,
      },
    ],
  },
]
```

---

### Topbar Component

**File**: `/app/components/layout/Topbar.tsx`

**Props**:
```tsx
<Topbar
  user={{
    name: "Jean Niyigaba",
    email: "jean@example.com",
    avatar: "/avatar.jpg",
    initials: "JN",
  }}
  notifications={3}              // Badge count
  onSettingsClick={() => {}}     // Settings handler
  onProfileClick={() => {}}      // Profile handler
  onLogout={() => {}}            // Logout handler
  onMenuClick={() => {}}         // Mobile menu handler
  searchPlaceholder="Search..."
  onSearch={(query) => {}}       // Search handler
/>
```

---

### DashboardLayout Component

**File**: `/app/components/layout/DashboardLayout.tsx`

**Complete Example**:
```tsx
<DashboardLayout
  navItems={[
    { label: "Dashboard", href: "/admin", icon: <BarChart /> },
    { label: "Students", href: "/admin/students", icon: <Users /> },
  ]}
  user={{
    name: user?.firstName,
    email: user?.email,
    initials: `${user?.firstName?.[0]}${user?.lastName?.[0]}`,
  }}
  notifications={5}
  onLogout={() => {
    logout()
    router.push("/auth/login-modern")
  }}
  onNavigate={(href) => router.push(href)}
  onSettingsClick={() => router.push("/settings")}
  onProfileClick={() => router.push("/profile")}
  searchPlaceholder="Search..."
  onSearch={(query) => console.log(query)}
>
  <div className="p-6">
    {/* Your page content */}
  </div>
</DashboardLayout>
```

---

## Styling Reference

### Color Tokens

```tsx
// Backgrounds
className="bg-background"         // Main background
className="bg-card"               // Card background
className="bg-muted"              // Muted background

// Text
className="text-foreground"       // Main text
className="text-muted-foreground" // Secondary text

// Buttons & Interactive
className="bg-primary"            // Primary color
className="bg-secondary"          // Secondary color
className="bg-destructive"        // Danger color

// Borders
className="border-border"         // Border color
className="border-input"          // Input border
```

### Spacing Scale

```tsx
p-1 p-2 p-3 p-4 p-5 p-6 p-7 p-8     // Padding
m-1 m-2 m-3 m-4 m-5 m-6 m-7 m-8     // Margin
gap-1 gap-2 gap-3 gap-4 gap-6 gap-8 // Gap between flex items
space-y-2 space-y-4 space-y-6        // Vertical spacing
```

### Responsive Prefixes

```tsx
sm:text-lg    // Small screens and up
md:grid-cols-2
lg:p-8
xl:text-xl
```

---

## Complete Page Template

Use this template for new dashboard pages:

```tsx
"use client"

import { useRouter } from "next/navigation"
import { Plus, Download } from "lucide-react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Button,
  Input,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  useToast,
} from "@/components/ui"
import { useAuth } from "@/providers/AuthProvider"

export default function YourPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { success, error } = useToast()

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: <span>📊</span> },
    { label: "Your Page", href: "/admin/your-page", icon: <span>📄</span> },
  ]

  return (
    <DashboardLayout
      navItems={navItems}
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
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Page Title</h1>
            <p className="text-muted-foreground mt-1">Description</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>

        {/* Content Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Stat 1</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">123</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stat 2</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">456</p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Data Table</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Rows here */}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
```

---

**Last Updated**: March 18, 2026
**Total Components**: 10 UI + 3 Layout
**Status**: All components production-ready
