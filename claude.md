Note : always use @.claude/agents/research-agent.md for the research in my project.Also I dont like reading alot to dont give me extra things. give me very less english.

# Slash Admin - Claude AI Assistant SOP

> Quick reference guide for AI assistants working on this project

---

## Project Overview

**Slash Admin** - React 19 + TypeScript admin panel template

- **Stack:** Vite, Tailwind, shadcn/ui, Zustand, React-Query, MSW
- **Total Files:** 276 TypeScript files
- **Purpose:** Clean, scalable admin panel foundation

---

## Core Principles

### Code Organization Standards

**File Size Limits:**

```
Components:  <200 lines
Pages:       <250 lines
Hooks:       <150 lines
Utils:       <100 lines per function
```

**Golden Rules:**

1. ✅ One file, one job
2. ✅ Extract early (don't wait for 500+ lines)
3. ✅ No `any` types - always use TypeScript properly
4. ✅ Handle all states: loading, error, empty, success
5. ✅ Meaningful names (no abbreviations)
6. ✅ Organized imports (see Import Order below)

---

## Folder Structure

```
src/
├── components/     # Reusable (Nav, Chart, Editor, Upload, Auth, etc.)
├── ui/             # shadcn/ui (35+ components: Button, Form, Dialog, etc.)
├── pages/          # Page components
├── layouts/        # Dashboard & Simple layouts
├── routes/         # Routing config (frontend/backend modes)
├── store/          # Zustand stores (userStore, settingStore)
├── api/            # API client & services
├── hooks/          # Custom hooks
├── utils/          # Utilities (cn, formatNumber, storage, tree)
├── theme/          # Theme system (light/dark, 6 color presets)
├── locales/        # i18n (EN, CN)
├── types/          # TypeScript types
└── _mock/          # MSW mock handlers
```

---

## Import Order (Always Follow)

```tsx
// 1. React & Third-party
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

// 2. UI Components
import { Button } from "@/ui/button";

// 3. Custom Components
import Icon from "@/components/icon";

// 4. Hooks
import { useMediaQuery } from "@/hooks";

// 5. Stores
import { useUserInfo } from "@/store/userStore";

// 6. Utils
import { cn } from "@/utils";

// 7. Types
import type { User } from "#/entity";
import { ThemeMode } from "#/enum";

// 8. Local imports
import { LocalComponent } from "./components/LocalComponent";
```

---

## Component Template

```tsx
// File: MyComponent.tsx (<200 lines)

// 1. Imports (organized as above)
import { useState } from 'react';
import { Button } from '@/ui/button';
import { cn } from '@/utils';
import type { User } from '#/entity';

// 2. Types
interface MyComponentProps {
  user: User;
  onAction?: () => void;
}

// 3. Component
export function MyComponent({ user, onAction }: MyComponentProps) {
  // a. State
  const [isOpen, setIsOpen] = useState(false);

  // b. Hooks
  const isMobile = useMediaQuery(down('md'));

  // c. Queries/Mutations
  const { data, isLoading, error } = useQuery({...});

  // d. Handlers
  const handleClick = () => {
    onAction?.();
  };

  // e. Early returns
  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;
  if (!data) return <Empty />;

  // f. Render
  return (
    <div className={cn('p-4', className)}>
      {/* JSX */}
    </div>
  );
}
```

---

## When to Extract Code

### Extract to Component When:

- Used in 2+ places
- > 50 lines of JSX
- Has own state
- Logically independent

### Extract to Hook When:

- Stateful logic used in multiple components
- > 3-4 useState/useEffect in one component
- Complex data transformations
- API calls

### Extract to Utility When:

- Pure function (no hooks)
- Reusable across features
- Data transformation

---

## Common Patterns

### Auth Check

```tsx
import { useAuthCheck } from "@/components/auth";

const { check, checkAny, checkAll } = useAuthCheck("permission");
if (!check("user.edit")) return null;
```

### Data Fetching

```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ["users"],
  queryFn: userService.getUsers,
});
```

### Form with Validation

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: {...},
});
```

### Notifications

```tsx
import { toast } from "sonner";

toast.success("Success!");
toast.error("Error!");
```

### Responsive

```tsx
import { useMediaQuery, down } from "@/hooks";

const isMobile = useMediaQuery(down("md"));
```

---

## Key Files

### Configuration

- **Global:** `src/global-config.ts`
- **Routes:** `src/routes/sections/`
- **Nav Data:** `src/layouts/dashboard/nav/nav-data/`

### Stores (Zustand)

- **User:** `src/store/userStore.ts` (auth, userInfo, permissions)
- **Settings:** `src/store/settingStore.ts` (theme, layout)

### API

- **Client:** `src/api/apiClient.ts` (Axios with interceptors)
- **Services:** `src/api/services/` (userService, menuService)

### Theme

- **Provider:** `src/theme/theme-provider.tsx`
- **Tokens:** `src/theme/tokens/`

---

## Files Needing Refactoring

**Too Large (>500 lines):**

1. `src/ui/sidebar.tsx` (723) → Split into sub-components
2. `src/layouts/components/notice.tsx` (629) → Split into tabs/list/item
3. `src/_mock/assets.ts` (591) → Split by category
4. `src/pages/dashboard/analysis/index.tsx` (544) → Extract widgets

---

## Adding Features

### 1. Create Page

```tsx
// src/pages/my-feature/index.tsx
export default function MyFeaturePage() {
  return <div>Content</div>;
}
```

### 2. Add Route

```tsx
// src/routes/sections/dashboard/frontend.tsx
{
  path: 'my-feature',
  element: <MyFeaturePage />,
}
```

### 3. Add to Nav

```tsx
// src/layouts/dashboard/nav/nav-data/nav-data-frontend.tsx
{
  title: 'My Feature',
  path: '/my-feature',
  icon: 'solar:widget-outline',
}
```

### 4. Create Service (if needed)

```tsx
// src/api/services/myFeatureService.ts
const myFeatureService = {
  getItems: () => apiClient.get({ url: "/items" }),
};
```

### 5. Mock API (for dev)

```tsx
// src/_mock/handlers/_myFeature.ts
export const getItems = http.get('/api/items', () => {
  return HttpResponse.json({ status: 0, data: [...] });
});
```

---

## Code Review Checklist

Before submitting:

- [ ] Files <200 lines (components)
- [ ] One responsibility per file
- [ ] No `any` types
- [ ] Loading/error states handled
- [ ] Responsive design
- [ ] Proper TypeScript types
- [ ] Imports organized
- [ ] Meaningful names
- [ ] No console.log
- [ ] No commented code

---

## Git Commit Format

```bash
feat(scope): description      # New feature
fix(scope): description       # Bug fix
refactor(scope): description  # Code refactoring
style(scope): description     # Formatting
docs(scope): description      # Documentation
```

---

## Common Imports

```tsx
// UI
import { Button, Input, Dialog, Form, Card } from "@/ui/[component]";

// Custom
import Icon from "@/components/icon";
import Chart from "@/components/chart";
import Editor from "@/components/editor";
import { UploadAvatar } from "@/components/upload";

// Hooks
import { useMediaQuery } from "@/hooks";
import { useRouter } from "@/routes/hooks";

// Store
import { useUserInfo } from "@/store/userStore";
import { useSettings } from "@/store/settingStore";

// Utils
import { cn } from "@/utils";
import { fCurrency } from "@/utils/format-number";

// Types
import type { UserInfo } from "#/entity";
import { ThemeMode } from "#/enum";
```

---

## Quick Reference

### Most Used Components

- **Forms:** Button, Input, Form, Select, Checkbox
- **Display:** Card, Table, Badge, Avatar
- **Overlay:** Dialog, Sheet, Drawer
- **Nav:** Tabs, Dropdown, Breadcrumb
- **Custom:** Icon, Chart, Editor, Upload

### Utilities

- `cn()` - Merge classes
- `fCurrency()` - Format currency
- `fNumber()` - Format numbers
- `urlJoin()` - Join URL parts

### Hooks

- `useMediaQuery()` - Responsive
- `useAuthCheck()` - Permissions
- `useRouter()` - Navigation
- `useUserInfo()` - User data
- `useSettings()` - Theme settings

---

## Documentation

For detailed info, see:

- **Quick Start:** `QUICK_START_GUIDE.md`
- **Full Docs:** `SLASH_ADMIN_DOCUMENTATION.md`
- **Standards:** `CODE_STANDARDS_SOP.md`
- **Components:** `COMPONENT_REFERENCE.md`

---

## Best Practices Summary

**DO:**
✅ Keep files small (<200 lines)
✅ Extract early and often
✅ Use TypeScript properly
✅ Handle all states
✅ Organize imports
✅ Use meaningful names
✅ Follow patterns
✅ Check permissions
✅ Test responsive

**DON'T:**
❌ Use `any` type
❌ Deep nesting (use early returns)
❌ Inline styles (use Tailwind)
❌ Magic numbers (use constants)
❌ Prop drilling (use context/store)
❌ Leave console.log
❌ Skip error handling
❌ Create 500+ line files

---

**Remember:** Clean code = Small, focused files with clear responsibilities.

When in doubt:

1. Check if file >200 lines → Extract
2. Check if reusable → Create component
3. Check if stateful → Create hook
4. Check if pure function → Create utility

---

**End of SOP** - Last Updated: 2025-10-17
