# RSBS Frontend - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Installation

```bash
# Clone the repository
git clone [repo-url]
cd Frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
http://localhost:3000
```

### 2. Project Structure

```
Frontend/
├── app/
│   ├── admin/          → Admin dashboard & management pages
│   ├── teacher/        → Teacher dashboard
│   ├── student/        → Student dashboard
│   ├── auth/           → Login, signup, password reset
│   ├── components/     → Reusable UI & layout components
│   ├── hooks/          → Custom React hooks
│   └── providers/      → Context providers (Auth)
├── public/             → Static assets
├── tailwind.config.ts  → Tailwind CSS config
├── next.config.js      → Next.js config
└── package.json
```

---

## 📚 Essential Files

| File | Purpose |
|------|---------|
| `DESIGN_SYSTEM.md` | Design tokens, colors, typography |
| `IMPLEMENTATION_GUIDE.md` | How to use components, build pages |
| `MODERNIZATION_SUMMARY.md` | Project overview, features, tech stack |
| `COMPLETION_REPORT.md` | Deliverables, statistics, next steps |

---

## 🎨 Quick Design Reference

### Colors
```tsx
// Use these Tailwind classes
bg-primary         // Blue #3B82F6
bg-accent          // Cyan #06B6D4
bg-success         // Green #10B981
bg-warning         // Orange #F59E0B
bg-destructive     // Red #EF4444
```

### Spacing
```tsx
// Responsive spacing
p-4        // Padding: 16px
m-2        // Margin: 8px
gap-4      // Gap: 16px
space-y-6  // Vertical spacing: 24px
```

### Responsive
```tsx
// Mobile-first approach
className="text-sm md:text-base lg:text-lg"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
className="hidden md:block"  // Show on tablet+
```

---

## 🧩 Component Quick Reference

### Button
```tsx
import { Button } from '@/app/components/ui/Button'

<Button>Click me</Button>
<Button variant="outline">Outline</Button>
<Button size="lg" isLoading>Loading...</Button>
<Button disabled>Disabled</Button>
```

### Card
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/Card'

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Input
```tsx
import { Input } from '@/app/components/ui/Input'

<Input type="email" placeholder="Email..." />
<Input error="Required" />
```

### Badge
```tsx
import { Badge } from '@/app/components/ui/Badge'

<Badge>Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="destructive">Error</Badge>
```

### Toast Notification
```tsx
import { useToast } from '@/app/hooks/useToast'

const { success, error, info } = useToast()
success('Done!')
error('Failed')
info('Information')
```

---

## 🔐 Authentication

### Login Page
- **Route:** `/auth/login-modern`
- **Features:** Email/password login, forgot password link

### Signup Page
- **Route:** `/auth/signup-modern`
- **Features:** Multi-step form, role selection

### Password Reset
- **Route:** `/auth/reset-password-modern`
- **Features:** Email verification, password reset

---

## 📊 Dashboard Pages

### Admin Dashboard
- **Route:** `/admin/dashboard-modern`
- **Features:** Overview stats, analytics charts
- **File:** `app/admin/dashboard-modern.tsx`

### Teacher Dashboard
- **Route:** `/teacher/dashboard-modern`
- **Features:** Classes, assignments, student performance
- **File:** `app/teacher/dashboard-modern.tsx`

### Student Dashboard
- **Route:** `/student/dashboard-modern`
- **Features:** Courses, grades, assignments
- **File:** `app/student/dashboard-modern.tsx`

---

## ⚙️ Management Pages

| Page | Route | File | Features |
|------|-------|------|----------|
| Students | `/admin/students-modern` | `app/admin/students-modern/page.tsx` | Search, filter, sort |
| Teachers | `/admin/teachers-modern` | `app/admin/teachers-modern/page.tsx` | Subject filter, ratings |
| Classes | `/admin/classes-modern` | `app/admin/classes-modern/page.tsx` | Capacity tracking |

---

## 🔗 API Integration

### Environment Variables
```env
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com
```

### Example API Call
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

## 📱 Building a New Page

### Page Template
```tsx
'use client'

import { DashboardLayout } from '@/app/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/Card'

export default function MyPage() {
  const navItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Settings', href: '/settings' },
  ]

  return (
    <DashboardLayout
      navItems={navItems}
      user={{ name: 'John', email: 'john@example.com', initials: 'JD' }}
    >
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Page Title</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Section</CardTitle>
          </CardHeader>
          <CardContent>Content here</CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
```

---

## 🎯 Common Tasks

### Adding a Component
1. Create file in `/app/components/ui/ComponentName.tsx`
2. Export from `/app/components/ui/index.ts`
3. Import and use in pages

### Creating a Page
1. Create folder in `/app/[section]/page-name/`
2. Add `page.tsx` file
3. Use `DashboardLayout` wrapper
4. Import and compose components

### Styling Tips
```tsx
// Use Tailwind classes
<div className="flex items-center justify-between gap-4 p-4">

// Use design tokens
<div className="text-foreground bg-background border border-input">

// Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Combine with cn() utility
import { cn } from '@/app/utils/cn'
<div className={cn("base-class", condition && "conditional-class")}>
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Component not showing | Check import path, verify export in index.ts |
| Styles not applying | Ensure Tailwind class used, check tailwind.config |
| API errors | Verify NEXT_PUBLIC_BACKEND_URL, check headers |
| Auth issues | Check token in localStorage, verify API response |
| Layout broken | Check responsive classes (md:, lg:), viewport meta tag |

---

## 📦 Build & Deploy

### Development
```bash
npm run dev        # Start dev server
npm run lint       # Run ESLint
npm run type-check # Check TypeScript
```

### Production
```bash
npm run build      # Build for production
npm start          # Start production server
npm run export     # Static export (if needed)
```

### Deployment
```bash
# Vercel (Recommended)
vercel deploy

# Docker
docker build -t rsbs-frontend .
docker run -p 3000:3000 rsbs-frontend
```

---

## 📖 Further Learning

### Documentation
1. **DESIGN_SYSTEM.md** - Colors, typography, tokens
2. **IMPLEMENTATION_GUIDE.md** - Component usage, patterns
3. **MODERNIZATION_SUMMARY.md** - Features, tech stack

### External Resources
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Next.js Docs](https://nextjs.org)
- [React Docs](https://react.dev)
- [Recharts Docs](https://recharts.org)

---

## ✅ Checklist for New Developers

- [ ] Read DESIGN_SYSTEM.md
- [ ] Review IMPLEMENTATION_GUIDE.md
- [ ] Explore component examples
- [ ] Build a test component
- [ ] Create a test page
- [ ] Test responsive design
- [ ] Try API integration
- [ ] Check accessibility

---

## 🆘 Getting Help

1. Check documentation files
2. Review existing components as examples
3. Look for similar patterns in other pages
4. Check troubleshooting section
5. Contact development team

---

## 📞 Quick Links

| What | Where |
|------|-------|
| Design System | `DESIGN_SYSTEM.md` |
| Implementation | `IMPLEMENTATION_GUIDE.md` |
| Features | `MODERNIZATION_SUMMARY.md` |
| Completion | `COMPLETION_REPORT.md` |
| Backend URL | `.env` (set NEXT_PUBLIC_BACKEND_URL) |
| Components | `/app/components/ui/` |
| Pages | `/app/[section]/` |

---

**Ready to build? Start with a component in `/app/components/ui/` and review the examples in the documentation files!**

Last Updated: March 2026
