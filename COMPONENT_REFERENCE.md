# Component Quick Reference

A visual guide to all components available in Slash Admin.

---

## 📦 Component Categories

- [shadcn/ui Components (35+)](#shadcnui-components)
- [Custom Components](#custom-components)
- [Layout Components](#layout-components)
- [Page Components](#page-components)

---

## shadcn/ui Components

**Location:** `src/ui/`

All components are fully typed and follow shadcn conventions. Import from `@/ui/[component-name]`.

### Form Components

| Component | Import | Use Case |
|-----------|--------|----------|
| **Button** | `import { Button } from '@/ui/button'` | Actions, submissions |
| **Input** | `import { Input } from '@/ui/input'` | Text input fields |
| **Textarea** | `import { Textarea } from '@/ui/textarea'` | Multi-line text input |
| **Select** | `import { Select } from '@/ui/select'` | Dropdown selection |
| **Checkbox** | `import { Checkbox } from '@/ui/checkbox'` | Boolean choices |
| **Radio Group** | `import { RadioGroup } from '@/ui/radio-group'` | Single choice from options |
| **Switch** | `import { Switch } from '@/ui/switch'` | Toggle on/off |
| **Slider** | `import { Slider } from '@/ui/slider'` | Range selection |
| **Calendar** | `import { Calendar } from '@/ui/calendar'` | Date selection |
| **Form** | `import { Form } from '@/ui/form'` | Form wrapper with validation |
| **Label** | `import { Label } from '@/ui/label'` | Form labels |
| **Input OTP** | `import { InputOTP } from '@/ui/input-otp'` | OTP/PIN input |

**Example:**
```tsx
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';

<Button variant="default" size="md">Click me</Button>
<Input type="email" placeholder="Email" />
```

---

### Data Display

| Component | Import | Use Case |
|-----------|--------|----------|
| **Card** | `import { Card } from '@/ui/card'` | Content containers |
| **Table** | `import { Table } from '@/ui/table'` | Tabular data |
| **Avatar** | `import { Avatar } from '@/ui/avatar'` | User avatars |
| **Badge** | `import { Badge } from '@/ui/badge'` | Status indicators |
| **Tooltip** | `import { Tooltip } from '@/ui/tooltip'` | Hover information |
| **Popover** | `import { Popover } from '@/ui/popover'` | Floating content |
| **Hover Card** | `import { HoverCard } from '@/ui/hover-card'` | Hover details |
| **Progress** | `import { Progress } from '@/ui/progress'` | Progress bars |
| **Skeleton** | `import { Skeleton } from '@/ui/skeleton'` | Loading placeholders |
| **Typography** | `import { Typography } from '@/ui/typography'` | Text styles |

**Example:**
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/card';
import { Badge } from '@/ui/badge';
import { Avatar } from '@/ui/avatar';

<Card>
  <CardHeader>
    <CardTitle>User Profile</CardTitle>
  </CardHeader>
  <CardContent>
    <Avatar src="/avatar.jpg" />
    <Badge variant="success">Active</Badge>
  </CardContent>
</Card>
```

---

### Navigation

| Component | Import | Use Case |
|-----------|--------|----------|
| **Tabs** | `import { Tabs } from '@/ui/tabs'` | Tab navigation |
| **Breadcrumb** | `import { Breadcrumb } from '@/ui/breadcrumb'` | Page hierarchy |
| **Dropdown Menu** | `import { DropdownMenu } from '@/ui/dropdown-menu'` | Action menus |
| **Command** | `import { Command } from '@/ui/command'` | Command palette |
| **Sidebar** | `import { Sidebar } from '@/ui/sidebar'` | Side navigation |

**Example:**
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/ui/tabs';

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

---

### Overlays

| Component | Import | Use Case |
|-----------|--------|----------|
| **Dialog** | `import { Dialog } from '@/ui/dialog'` | Modal dialogs |
| **Sheet** | `import { Sheet } from '@/ui/sheet'` | Side drawers |
| **Drawer** | `import { Drawer } from '@/ui/drawer'` | Bottom drawers |

**Example:**
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/ui/dialog';
import { Button } from '@/ui/button';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    <p>Dialog content</p>
  </DialogContent>
</Dialog>
```

---

### Layout

| Component | Import | Use Case |
|-----------|--------|----------|
| **Separator** | `import { Separator } from '@/ui/separator'` | Visual dividers |
| **Scroll Area** | `import { ScrollArea } from '@/ui/scroll-area'` | Scrollable containers |
| **Collapsible** | `import { Collapsible } from '@/ui/collapsible'` | Expandable content |
| **Toggle** | `import { Toggle } from '@/ui/toggle'` | Toggle buttons |
| **Toggle Group** | `import { ToggleGroup } from '@/ui/toggle-group'` | Toggle button groups |

---

## Custom Components

**Location:** `src/components/`

### Animation Components

**Location:** `src/components/animate/`

| Component | File | Use Case |
|-----------|------|----------|
| **MotionContainer** | [motion-container.tsx](src/components/animate/motion-container.tsx) | Animate children sequentially |
| **MotionViewport** | [motion-viewport.tsx](src/components/animate/motion-viewport.tsx) | Animate on scroll into view |
| **MotionLazy** | [motion-lazy.tsx](src/components/animate/motion-lazy.tsx) | Lazy load Framer Motion |
| **ScrollProgress** | [scroll-progress/](src/components/animate/scroll-progress/) | Page scroll indicator |

**Animation Variants:** `src/components/animate/variants/`
- fade, slide, scale, rotate, zoom, flip, bounce, background, path

**Example:**
```tsx
import { MotionContainer } from '@/components/animate';
import { varFade } from '@/components/animate/variants';
import { motion } from 'motion/react';

<MotionContainer>
  <motion.div variants={varFade().inUp}>
    <Card>Content fades up on mount</Card>
  </motion.div>
</MotionContainer>
```

---

### Auth Components

**Location:** `src/components/auth/`

| Component | File | Use Case |
|-----------|------|----------|
| **AuthGuard** | [auth-guard.tsx](src/components/auth/auth-guard.tsx) | Protect routes (redirect if not logged in) |
| **useAuth** | [use-auth.ts](src/components/auth/use-auth.ts) | Check permissions/roles |

**Example:**
```tsx
import AuthGuard from '@/components/auth/auth-guard';
import { useAuthCheck } from '@/components/auth';

// Protect entire route
<AuthGuard>
  <AdminPanel />
</AuthGuard>

// Check permission in component
function EditButton() {
  const { check } = useAuthCheck('permission');
  if (!check('user.edit')) return null;
  return <Button>Edit</Button>;
}
```

---

### Chart Component

**Location:** `src/components/chart/`

| Component | File | Use Case |
|-----------|------|----------|
| **Chart** | [chart.tsx](src/components/chart/chart.tsx) | ApexCharts wrapper |
| **useChart** | [useChart.ts](src/components/chart/useChart.ts) | Chart configuration hook |

**Example:**
```tsx
import Chart from '@/components/chart';
import { useChart } from '@/components/chart/useChart';

function SalesChart() {
  const chartOptions = useChart({
    chart: { type: 'line' },
    xaxis: { categories: ['Jan', 'Feb', 'Mar'] },
  });

  return (
    <Chart
      type="line"
      series={[{ name: 'Sales', data: [30, 40, 45] }]}
      options={chartOptions}
      height={350}
    />
  );
}
```

---

### Code Components

**Location:** `src/components/code/`

| Component | File | Use Case |
|-----------|------|----------|
| **CodeBlock** | [code-block.tsx](src/components/code/code-bock.tsx) | Code with syntax highlighting |
| **HighlightCode** | [highlight-code.tsx](src/components/code/highlight-code.tsx) | Inline code highlighting |

**Example:**
```tsx
import { CodeBlock } from '@/components/code';

<CodeBlock language="typescript">
  {`const greeting = "Hello World";`}
</CodeBlock>
```

---

### Editor Component

**Location:** `src/components/editor/`

| Component | File | Use Case |
|-----------|------|----------|
| **Editor** | [index.tsx](src/components/editor/index.tsx) | Rich text editor (Quill) |

**Example:**
```tsx
import Editor from '@/components/editor';

function BlogPost() {
  const [content, setContent] = useState('');
  return <Editor value={content} onChange={setContent} />;
}
```

---

### Icon Component

**Location:** `src/components/icon/`

| Component | File | Use Case |
|-----------|------|----------|
| **Icon** | [icon.tsx](src/components/icon/icon.tsx) | Iconify icons |

**Example:**
```tsx
import Icon from '@/components/icon';

<Icon icon="solar:user-bold" width={24} />
<Icon icon="solar:settings-outline" className="text-gray-500" />
```

Browse icons: [https://icon-sets.iconify.design/](https://icon-sets.iconify.design/)

---

### Loading Components

**Location:** `src/components/loading/`

| Component | File | Use Case |
|-----------|------|----------|
| **RouteLoadingProgress** | [route-loading.tsx](src/components/loading/route-loading.tsx) | Top bar route loading |
| **LineLoading** | [line-loading.tsx](src/components/loading/line-loading.tsx) | Linear progress bar |
| **CircleLoading** | [index.tsx](src/components/loading/index.tsx) | Circular spinner |

**Example:**
```tsx
import { CircleLoading, LineLoading } from '@/components/loading';

{isLoading && <CircleLoading />}
{isLoading && <LineLoading />}
```

---

### Navigation Components

**Location:** `src/components/nav/`

| Component | Directory | Use Case |
|-----------|-----------|----------|
| **Vertical Nav** | [vertical/](src/components/nav/vertical/) | Vertical sidebar navigation |
| **Horizontal Nav** | [horizontal/](src/components/nav/horizontal/) | Horizontal top navigation |
| **Mini Nav** | [mini/](src/components/nav/mini/) | Collapsed sidebar navigation |

**These are used by the layout system. Customization is done via nav data.**

---

### Upload Components

**Location:** `src/components/upload/`

| Component | File | Use Case |
|-----------|------|----------|
| **Upload** | [upload.tsx](src/components/upload/upload.tsx) | Base file upload |
| **UploadAvatar** | [upload-avatar.tsx](src/components/upload/upload-avatar.tsx) | Avatar upload with preview |
| **UploadBox** | [upload-box.tsx](src/components/upload/upload-box.tsx) | Drag & drop upload box |

**Example:**
```tsx
import { UploadAvatar } from '@/components/upload';

function ProfilePicture() {
  const [file, setFile] = useState<File>();

  return (
    <UploadAvatar
      file={file}
      onChange={setFile}
      maxSize={5 * 1024 * 1024} // 5MB
    />
  );
}
```

---

### Other Custom Components

| Component | Location | Use Case |
|-----------|----------|----------|
| **Logo** | [components/logo/](src/components/logo/) | App logo |
| **LocalePicker** | [components/locale-picker/](src/components/locale-picker/) | Language switcher |
| **AvatarGroup** | [components/avatar-group/](src/components/avatar-group/) | Stacked avatars |
| **Toast** | [components/toast/](src/components/toast/) | Toast notifications (Sonner) |

**Example:**
```tsx
import Logo from '@/components/logo';
import LocalePicker from '@/components/locale-picker';
import AvatarGroup from '@/components/avatar-group';
import { toast } from 'sonner';

<Logo />
<LocalePicker />
<AvatarGroup users={[user1, user2, user3]} max={3} />

// Toast
toast.success('Success!');
toast.error('Error!');
```

---

## Layout Components

**Location:** `src/layouts/`

### Dashboard Layout

**Main:** [src/layouts/dashboard/index.tsx](src/layouts/dashboard/index.tsx)

**Sub-components:**
- **Header:** [header.tsx](src/layouts/dashboard/header.tsx)
- **Main:** [main.tsx](src/layouts/dashboard/main.tsx)
- **Nav:** `nav/` (Vertical, Horizontal, Mobile)
- **MultiTabs:** `multi-tabs/` (Tab navigation system)

### Layout Utility Components

**Location:** `src/layouts/components/`

| Component | File | Use Case |
|-----------|------|----------|
| **BreadCrumb** | [bread-crumb.tsx](src/layouts/components/bread-crumb.tsx) | Page breadcrumb navigation |
| **SearchBar** | [search-bar.tsx](src/layouts/components/search-bar.tsx) | Global search |
| **Notice** | [notice.tsx](src/layouts/components/notice.tsx) | Notifications dropdown |
| **SettingButton** | [setting-button.tsx](src/layouts/components/setting-button.tsx) | Theme settings drawer |
| **HeaderSimple** | [header-simple.tsx](src/layouts/components/header-simple.tsx) | Simple header (for auth pages) |

---

## Page Components

**Location:** `src/pages/`

### Dashboard Pages

**Location:** `src/pages/dashboard/`

- **Workbench:** [workbench/](src/pages/dashboard/workbench/) - Main dashboard
- **Analysis:** [analysis/](src/pages/dashboard/analysis/) - Analytics dashboard

### Management Pages

**Location:** `src/pages/management/`

- **User Management:** `management/user/` - User CRUD
- **Role Management:** `management/system/role/` - Role management
- **Permission Management:** `management/system/permission/` - Permission management

### System Pages

**Location:** `src/pages/sys/`

- **Login:** `sys/login/` - Login page
- **Register:** `sys/register/` - Registration
- **404:** `sys/error/Page404.tsx` - Not found
- **403:** `sys/error/Page403.tsx` - Forbidden
- **500:** `sys/error/Page500.tsx` - Server error

### Function Pages

**Location:** `src/pages/functions/`

- **Clipboard:** `functions/clipboard/` - Copy to clipboard demo
- **Multi-language:** `functions/multi-language/` - i18n demo

### Other Pages

**Location:** `src/pages/sys/others/`

- **Calendar:** `others/calendar/` - Calendar integration
- **Kanban:** `others/kanban/` - Kanban board
- **Permission:** `others/permission/` - Permission demo

---

## Custom Hooks

**Location:** `src/hooks/`

| Hook | File | Use Case |
|------|------|----------|
| **useMediaQuery** | [use-media-query.ts](src/hooks/use-media-query.ts) | Responsive breakpoints |
| **useCopyToClipboard** | [use-copy-to-clipboard.ts](src/hooks/use-copy-to-clipboard.ts) | Copy to clipboard |

**Route Hooks:** `src/routes/hooks/`
- **useRouter** - Navigation
- **usePathname** - Current path
- **useParams** - URL params
- **useSearchParams** - Query params

**Example:**
```tsx
import { useMediaQuery, down, up } from '@/hooks';
import { useRouter } from '@/routes/hooks';

const isMobile = useMediaQuery(down('md'));
const router = useRouter();
router.push('/dashboard');
```

---

## Utilities

**Location:** `src/utils/`

| Utility | File | Functions |
|---------|------|-----------|
| **Common** | [index.ts](src/utils/index.ts) | `cn()`, `check()`, `urlJoin()` |
| **Format Number** | [format-number.ts](src/utils/format-number.ts) | `fNumber()`, `fCurrency()`, `fPercent()` |
| **Highlight** | [highlight.ts](src/utils/highlight.ts) | Code syntax highlighting |
| **Storage** | [storage.ts](src/utils/storage.ts) | LocalStorage helpers |
| **Theme** | [theme.ts](src/utils/theme.ts) | Theme utilities |
| **Tree** | [tree.ts](src/utils/tree.ts) | Tree data manipulation |

**Example:**
```tsx
import { cn } from '@/utils';
import { fCurrency } from '@/utils/format-number';

const classes = cn('px-4 py-2', isActive && 'bg-blue-500');
const price = fCurrency(1234.56); // "$1,234.56"
```

---

## State Stores

**Location:** `src/store/`

| Store | File | Purpose |
|-------|------|---------|
| **userStore** | [userStore.ts](src/store/userStore.ts) | User auth & info |
| **settingStore** | [settingStore.ts](src/store/settingStore.ts) | App settings (theme, layout) |

**Example:**
```tsx
import { useUserInfo, useUserToken } from '@/store/userStore';
import { useSettings } from '@/store/settingStore';

const userInfo = useUserInfo();
const { accessToken } = useUserToken();
const settings = useSettings();
```

---

## Quick Component Finder

### I need to...

| Task | Use This Component |
|------|-------------------|
| Display data in a table | `<Table>` from `@/ui/table` |
| Show a modal dialog | `<Dialog>` from `@/ui/dialog` |
| Create a form | `<Form>` from `@/ui/form` |
| Upload a file | `<Upload>` from `@/components/upload` |
| Display a chart | `<Chart>` from `@/components/chart` |
| Show loading state | `<CircleLoading>` from `@/components/loading` |
| Add an icon | `<Icon>` from `@/components/icon` |
| Protect a route | `<AuthGuard>` from `@/components/auth` |
| Add animation | `<MotionContainer>` from `@/components/animate` |
| Show a notification | `toast()` from `sonner` |
| Edit rich text | `<Editor>` from `@/components/editor` |
| Display code | `<CodeBlock>` from `@/components/code` |
| Show avatar | `<Avatar>` from `@/ui/avatar` |
| Create tabs | `<Tabs>` from `@/ui/tabs` |
| Show a tooltip | `<Tooltip>` from `@/ui/tooltip` |
| Create a dropdown | `<DropdownMenu>` from `@/ui/dropdown-menu` |

---

## Import Patterns

### UI Components (shadcn)
```tsx
import { ComponentName } from '@/ui/component-name';
```

### Custom Components
```tsx
import ComponentName from '@/components/category/component-name';
// OR
import { ComponentName } from '@/components/category';
```

### Hooks
```tsx
import { useHookName } from '@/hooks';
import { useRouteHook } from '@/routes/hooks';
```

### Utils
```tsx
import { utilFunction } from '@/utils';
import { formatFunction } from '@/utils/format-number';
```

### Stores
```tsx
import { useStoreSelector } from '@/store/storeName';
```

### Types
```tsx
import type { TypeName } from '#/entity';
import { EnumName } from '#/enum';
```

---

## Variants & Options

### Button Variants
```tsx
<Button variant="default" size="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>
```

### Badge Variants
```tsx
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

### Dialog, Sheet, Drawer
All follow similar patterns with trigger, content, header, footer, etc.

---

## Component Composition Examples

### Card with Header and Footer
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Form with Multiple Fields
```tsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="fieldName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Label</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormDescription>Help text</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">Submit</Button>
  </form>
</Form>
```

### Dropdown Menu
```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Open</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Item 1</DropdownMenuItem>
    <DropdownMenuItem>Item 2</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Item 3</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## Summary

**Total Components Available:**
- ✅ 35+ shadcn/ui components
- ✅ 15+ custom components
- ✅ 10+ custom hooks
- ✅ 6+ utility modules
- ✅ 2 state stores
- ✅ Multiple layout components

**All components are:**
- ✅ Fully typed with TypeScript
- ✅ Responsive & accessible
- ✅ Themeable (light/dark mode)
- ✅ Well-documented
- ✅ Production-ready

**For detailed usage examples, see:**
- [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md)
- [SLASH_ADMIN_DOCUMENTATION.md](./SLASH_ADMIN_DOCUMENTATION.md)

---

**Last Updated:** 2025-10-17
