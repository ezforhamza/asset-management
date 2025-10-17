# Slash Admin - Quick Start Guide

Get up and running with Slash Admin in 5 minutes!

---

## Installation

```bash
# Clone or download the template
cd slash-admin

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Default Login Credentials

```
Username: admin
Password: demo1234
```

*These are mock credentials working with MSW (Mock Service Worker)*

---

## Project Structure at a Glance

```
src/
├── components/     # Reusable components (Nav, Chart, Editor, Upload, etc.)
├── pages/          # Page components
├── layouts/        # Layout components (Dashboard, Simple)
├── routes/         # Routing configuration
├── store/          # Zustand state stores (user, settings)
├── api/            # API client & services
├── hooks/          # Custom React hooks
├── utils/          # Utility functions
├── ui/             # shadcn/ui components (35+ components)
├── theme/          # Theme system (colors, tokens, provider)
├── locales/        # i18n translations (EN, CN)
├── types/          # TypeScript types
└── _mock/          # MSW mock API handlers
```

---

## Most Used Components

### 1. UI Components (shadcn/ui)

```tsx
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/ui/form';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/card';

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  );
}
```

### 2. Navigation

```tsx
// Already configured in layouts, but you can customize nav data:
// File: src/layouts/dashboard/nav/nav-data/nav-data-frontend.tsx

export const navData = [
  {
    title: 'Dashboard',
    path: '/workbench',
    icon: 'solar:widget-outline',
  },
  {
    title: 'Users',
    path: '/users',
    icon: 'solar:users-group-rounded-outline',
    children: [
      { title: 'List', path: '/users/list' },
      { title: 'Create', path: '/users/create' },
    ],
  },
];
```

### 3. Icons

```tsx
import Icon from '@/components/icon';

<Icon icon="solar:user-bold" width={24} />
<Icon icon="solar:settings-outline" />
<Icon icon="solar:trash-bin-outline" className="text-red-500" />
```

Browse icons at: [https://icon-sets.iconify.design/](https://icon-sets.iconify.design/)

### 4. Charts

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

## Common Tasks

### Create a New Page

1. **Create page file:**
```tsx
// src/pages/my-feature/index.tsx
export default function MyFeaturePage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">My Feature</h1>
    </div>
  );
}
```

2. **Add route:**
```tsx
// src/routes/sections/dashboard/frontend.tsx
import MyFeaturePage from '@/pages/my-feature';

{
  path: 'my-feature',
  element: <MyFeaturePage />,
}
```

3. **Add to navigation:**
```tsx
// src/layouts/dashboard/nav/nav-data/nav-data-frontend.tsx
{
  title: 'My Feature',
  path: '/my-feature',
  icon: 'solar:widget-outline',
}
```

---

### Fetch Data with React-Query

```tsx
import { useQuery } from '@tanstack/react-query';
import userService from '@/api/services/userService';

function UserList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getUserList,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

---

### Create a Form

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/ui/form';
import { Input } from '@/ui/input';
import { Button } from '@/ui/button';

const formSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
});

function UserForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '' },
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

---

### Add Protected Routes

```tsx
import { useAuthCheck } from '@/components/auth';
import { Navigate } from 'react-router';

function AdminPage() {
  const { check } = useAuthCheck('role');

  if (!check('admin')) {
    return <Navigate to="/403" replace />;
  }

  return <div>Admin Content</div>;
}
```

---

### Toggle Theme

```tsx
import { useSettings, useSettingActions } from '@/store/settingStore';
import { ThemeMode } from '#/enum';
import { Button } from '@/ui/button';

function ThemeToggle() {
  const settings = useSettings();
  const { setSettings } = useSettingActions();

  const toggleTheme = () => {
    setSettings({
      ...settings,
      themeMode: settings.themeMode === ThemeMode.Light
        ? ThemeMode.Dark
        : ThemeMode.Light,
    });
  };

  return (
    <Button onClick={toggleTheme}>
      {settings.themeMode === ThemeMode.Light ? '🌙' : '☀️'}
    </Button>
  );
}
```

---

### Show Notifications

```tsx
import { toast } from 'sonner';

// Success
toast.success('Operation successful!');

// Error
toast.error('Something went wrong');

// Info
toast.info('Info message');

// Warning
toast.warning('Warning message');

// With options
toast.success('Saved!', {
  position: 'top-center',
  duration: 3000,
});
```

---

### Responsive Design

```tsx
import { useMediaQuery, down, up } from '@/hooks';

function ResponsiveComponent() {
  const isMobile = useMediaQuery(down('md'));
  const isDesktop = useMediaQuery(up('lg'));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {isMobile && <MobileView />}
      {isDesktop && <DesktopView />}
    </div>
  );
}
```

---

### Get User Info

```tsx
import { useUserInfo, useUserToken, useUserPermissions } from '@/store/userStore';

function UserProfile() {
  const userInfo = useUserInfo();
  const { accessToken } = useUserToken();
  const permissions = useUserPermissions();

  return (
    <div>
      <p>Username: {userInfo.username}</p>
      <p>Email: {userInfo.email}</p>
      <p>Is Logged In: {!!accessToken ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

---

## Styling Guide

### Tailwind CSS Classes

```tsx
// Layout
<div className="flex items-center justify-between">
<div className="grid grid-cols-3 gap-4">
<div className="container mx-auto px-4">

// Spacing
<div className="p-4">         {/* Padding all sides */}
<div className="px-4 py-2">   {/* Horizontal & Vertical */}
<div className="mt-4 mb-8">   {/* Margin top & bottom */}

// Typography
<h1 className="text-2xl font-bold">
<p className="text-sm text-gray-500">
<span className="text-red-500 font-semibold">

// Colors
<div className="bg-blue-500 text-white">
<div className="border border-gray-200">

// Responsive
<div className="hidden md:block">          {/* Hidden on mobile */}
<div className="col-span-1 md:col-span-2"> {/* Different cols */}

// Dark mode
<div className="bg-white dark:bg-gray-800">
<p className="text-gray-900 dark:text-gray-100">
```

### Using the `cn` utility

```tsx
import { cn } from '@/utils';

<div className={cn(
  'px-4 py-2',           // Base styles
  'rounded-lg border',   // More base styles
  isActive && 'bg-blue-500 text-white', // Conditional
  className              // Allow overrides from props
)} />
```

---

## Configuration

### Environment Variables

Create `.env` file:

```bash
VITE_APP_DEFAULT_ROUTE=/workbench
VITE_APP_PUBLIC_PATH=/
VITE_APP_API_BASE_URL=/api
VITE_APP_ROUTER_MODE=frontend
```

### Global Config

Edit `src/global-config.ts`:

```tsx
export const GLOBAL_CONFIG: GlobalConfig = {
  appName: "My Admin Panel",  // Change app name
  defaultRoute: "/dashboard",  // Default route after login
  routerMode: "frontend",      // "frontend" or "backend"
  // ... other configs
};
```

---

## Mock API (MSW)

### View Existing Mocks

Check `src/_mock/handlers/`:
- `_user.ts` - User auth & list
- `_menu.ts` - Menu/navigation data
- `_demo.ts` - Demo endpoints

### Add New Mock Handler

```tsx
// src/_mock/handlers/_products.ts
import { http, HttpResponse } from 'msw';

export const getProducts = http.get('/api/products', () => {
  return HttpResponse.json({
    status: 0,
    message: 'Success',
    data: [
      { id: '1', name: 'Product 1', price: 100 },
      { id: '2', name: 'Product 2', price: 200 },
    ],
  });
});

// Add to src/_mock/index.ts
import { getProducts } from './handlers/_products';

const handlers = [signIn, userList, mockTokenExpired, menuList, getProducts];
```

---

## Useful File Locations

### Key Configuration Files

- **Global Config:** `src/global-config.ts`
- **Routes:** `src/routes/sections/`
- **Navigation Data:** `src/layouts/dashboard/nav/nav-data/`
- **User Store:** `src/store/userStore.ts`
- **Settings Store:** `src/store/settingStore.ts`
- **API Client:** `src/api/apiClient.ts`
- **i18n:** `src/locales/i18n.ts`
- **Theme:** `src/theme/theme-provider.tsx`

### Layout Components

- **Dashboard Layout:** `src/layouts/dashboard/index.tsx`
- **Header:** `src/layouts/dashboard/header.tsx`
- **Breadcrumb:** `src/layouts/components/bread-crumb.tsx`
- **Search Bar:** `src/layouts/components/search-bar.tsx`
- **Notice/Notifications:** `src/layouts/components/notice.tsx`
- **Settings Button:** `src/layouts/components/setting-button.tsx`

---

## Available Scripts

```bash
# Development
pnpm dev          # Start dev server

# Build
pnpm build        # Build for production

# Preview
pnpm preview      # Preview production build

# Linting/Formatting
biome check ./src # Check code quality
biome format ./src --write # Format code
```

---

## Keyboard Shortcuts (Built-in)

- **Cmd/Ctrl + K** - Open command palette (search)
- **Cmd/Ctrl + /** - Toggle theme
- **Esc** - Close dialogs/modals

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Resources

- **Tailwind CSS Docs:** [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
- **shadcn/ui Components:** [https://ui.shadcn.com](https://ui.shadcn.com)
- **Iconify Icons:** [https://icon-sets.iconify.design](https://icon-sets.iconify.design)
- **React Query Docs:** [https://tanstack.com/query/latest](https://tanstack.com/query/latest)
- **Zustand Docs:** [https://zustand.docs.pmnd.rs](https://zustand.docs.pmnd.rs)
- **Framer Motion:** [https://www.framer.com/motion/](https://www.framer.com/motion/)

---

## Common Issues & Solutions

### Issue: Port 5173 already in use
```bash
# Kill the process or change port
# In vite.config.ts, add:
server: { port: 3000 }
```

### Issue: Module not found after installation
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Issue: Type errors in UI components
```bash
# Regenerate types
pnpm build
```

### Issue: Dark mode not working
Check `src/theme/theme-provider.tsx` and ensure HTML attribute is set:
```tsx
root.setAttribute(HtmlDataAttribute.ThemeMode, themeMode);
```

---

## Next Steps

1. ✅ Explore the demo pages in the running app
2. ✅ Check out the comprehensive docs: `SLASH_ADMIN_DOCUMENTATION.md`
3. ✅ Read the code standards: `CODE_STANDARDS_SOP.md`
4. ✅ Create your first custom page
5. ✅ Customize the theme and branding
6. ✅ Set up your real API endpoints
7. ✅ Remove demo pages you don't need

---

**Happy Coding!** 🚀

For detailed documentation, refer to `SLASH_ADMIN_DOCUMENTATION.md`
