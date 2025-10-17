**Version:** 0.0.0
**Purpose:** Admin panel boilerplate/starter template
**Tech Stack:** React 19, TypeScript, Vite, TailwindCSS, shadcn/ui, Zustand, React-Query, MSW

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Folder Structure](#architecture--folder-structure)
3. [Core Systems](#core-systems)
4. [Reusable Components](#reusable-components)
5. [Custom Hooks](#custom-hooks)
6. [Utilities](#utilities)
7. [Design Patterns & Best Practices](#design-patterns--best-practices)
8. [Files Requiring Refactoring](#files-requiring-refactoring)
9. [How to Use Guide](#how-to-use-guide)

---

## 1. Project Overview

Slash Admin is a modern, production-ready admin panel template built with cutting-edge technologies. It provides a complete foundation for building scalable admin applications.

### Key Features

- **React 19** with hooks-based architecture
- **TypeScript** for type safety
- **Vite** for fast development and HMR
- **shadcn/ui** component library integration
- **Responsive Design** - Mobile, tablet, desktop support
- **Flexible Routing** - Frontend & backend routing modes
- **Role-Based Access Control (RBAC)**
- **Internationalization (i18n)** - EN/CN support
- **Theme System** - Multiple color presets, light/dark mode
- **MSW + Faker.js** for API mocking
- **Zustand** for state management
- **React-Query** for data fetching
- **Multi-tab Navigation** (optional)
- **Framer Motion** animations

---

## 2. Architecture & Folder Structure

```
src/
├── _mock/                  # MSW mock API handlers
│   ├── handlers/          # Request handlers (_user.ts, _menu.ts, etc.)
│   ├── assets.ts          # Mock data constants
│   └── index.ts           # MSW worker setup
│
├── api/                   # API layer
│   ├── apiClient.ts       # Axios instance with interceptors
│   └── services/          # Service modules (userService, menuService)
│
├── assets/                # Static assets
│   ├── icons/            # Icon files
│   └── images/           # Image files
│
├── components/            # Reusable custom components
│   ├── animate/          # Animation components (motion variants)
│   ├── auth/             # Auth components (AuthGuard, useAuth hook)
│   ├── avatar-group/     # Avatar group component
│   ├── chart/            # ApexCharts wrapper
│   ├── code/             # Code block with syntax highlighting
│   ├── editor/           # Rich text editor (Quill)
│   ├── icon/             # Icon component (Iconify)
│   ├── loading/          # Loading states (RouteLoading, LineLoading)
│   ├── locale-picker/    # Language switcher
│   ├── logo/             # Logo component
│   ├── nav/              # Navigation components (vertical, horizontal, mini)
│   ├── toast/            # Toast notifications
│   └── upload/           # File upload components
│
├── hooks/                 # Custom React hooks
│   ├── use-media-query.ts
│   └── use-copy-to-clipboard.ts
│
├── layouts/               # Layout components
│   ├── components/       # Shared layout components (BreadCrumb, SearchBar, Notice)
│   ├── dashboard/        # Dashboard layout (Header, Main, Nav, MultiTabs)
│   └── simple/           # Simple layout (for auth pages)
│
├── locales/               # Internationalization
│   ├── lang/             # Translation files (en_US, zh_CN)
│   ├── i18n.ts           # i18next configuration
│   └── use-locale.ts     # Locale hook
│
├── pages/                 # Page components
│   ├── components/       # Demo component pages
│   ├── dashboard/        # Dashboard pages (workbench, analysis)
│   ├── functions/        # Function demo pages
│   ├── management/       # User/Role/Permission management
│   ├── menu-level/       # Multi-level menu demo
│   └── sys/              # System pages (login, 404, etc.)
│
├── routes/                # Routing configuration
│   ├── components/       # Route components (ErrorBoundary, RouterLink)
│   ├── hooks/            # Route hooks (useRouter, usePathname, etc.)
│   └── sections/         # Route definitions (auth, dashboard, main)
│
├── store/                 # Zustand state stores
│   ├── userStore.ts      # User auth state
│   └── settingStore.ts   # App settings (theme, layout, etc.)
│
├── theme/                 # Theme system
│   ├── adapter/          # UI library adapters (Antd)
│   ├── hooks/            # Theme hooks
│   ├── tokens/           # Design tokens
│   └── theme-provider.tsx # Theme provider component
│
├── types/                 # TypeScript type definitions
│   ├── api.ts            # API types
│   ├── entity.ts         # Entity types (User, Role, Permission, Menu)
│   ├── enum.ts           # Enums
│   └── router.ts         # Router types
│
├── ui/                    # shadcn/ui components (35+ components)
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── form.tsx
│   └── ... (all shadcn components)
│
├── utils/                 # Utility functions
│   ├── index.ts          # Common utils (cn, check, urlJoin)
│   ├── format-number.ts  # Number formatting
│   ├── highlight.ts      # Code syntax highlighting
│   ├── storage.ts        # LocalStorage helpers
│   ├── theme.ts          # Theme utilities
│   └── tree.ts           # Tree data manipulation
│
├── App.tsx               # Root App component
├── main.tsx              # App entry point
├── global-config.ts      # Global configuration
└── global.css            # Global styles
```

---

## 3. Core Systems

### 3.1 Authentication System

**Location:** `src/components/auth/`, `src/store/userStore.ts`

#### How It Works:

1. **User Store (Zustand)** - Manages user state and tokens

   - File: [src/store/userStore.ts](src/store/userStore.ts)
   - Persists to localStorage
   - Exports: `useUserInfo`, `useUserToken`, `useUserPermissions`, `useUserRoles`, `useSignIn`

2. **Auth Guard** - Protects routes requiring authentication

   - File: [src/components/auth/auth-guard.tsx](src/components/auth/auth-guard.tsx)
   - Redirects to login if not authenticated

3. **Login Auth Guard** - Redirects authenticated users away from login
   - File: [src/routes/components/login-auth-guard.tsx](src/routes/components/login-auth-guard.tsx)

#### Usage Example:

```tsx
// Sign in
import { useSignIn } from "@/store/userStore";

function LoginForm() {
  const signIn = useSignIn();

  const handleSubmit = async (data) => {
    await signIn({ username: data.username, password: data.password });
  };
}

// Check authentication
import { useUserToken } from "@/store/userStore";

function SomeComponent() {
  const { accessToken } = useUserToken();
  const isAuthenticated = !!accessToken;
}
```

---

### 3.2 Authorization / Access Control (RBAC)

**Location:** `src/components/auth/use-auth.ts`

#### How It Works:

- **Permission-based** or **Role-based** access control
- Uses `useAuthCheck` hook

#### Usage Example:

```tsx
import { useAuthCheck } from "@/components/auth";

function UserManagementPage() {
  const { check, checkAny, checkAll } = useAuthCheck("permission");

  // Single permission check
  const canCreate = check("user.create");

  // Check if user has ANY of these permissions
  const canEdit = checkAny(["user.edit", "user.update"]);

  // Check if user has ALL permissions
  const canManage = checkAll(["user.create", "user.edit", "user.delete"]);

  return (
    <div>
      {canCreate && <Button>Create User</Button>}
      {canEdit && <Button>Edit User</Button>}
    </div>
  );
}

// Role-based check
function AdminPanel() {
  const { check } = useAuthCheck("role");
  const isAdmin = check("admin");

  if (!isAdmin) return <AccessDenied />;
  return <AdminContent />;
}
```

---

### 3.3 Routing System

**Location:** `src/routes/`

#### Two Routing Modes:

1. **Frontend Routing** (Default)

   - Routes defined in: [src/routes/sections/dashboard/frontend.tsx](src/routes/sections/dashboard/frontend.tsx)
   - Static route configuration

2. **Backend Routing**
   - Routes fetched from API
   - File: [src/routes/sections/dashboard/backend.tsx](src/routes/sections/dashboard/backend.tsx)
   - Dynamic menu generation

#### Configuration:

Set in `.env` or [src/global-config.ts](src/global-config.ts):

```ts
routerMode: "frontend" | "backend";
```

#### Route Structure:

```tsx
// src/routes/sections/index.tsx
export const routesSection: RouteObject[] = [
  ...authRoutes, // /login, /register
  ...dashboardRoutes, // Protected dashboard routes
  ...mainRoutes, // Public routes
  { path: "*", element: <Navigate to="/404" replace /> },
];
```

#### Custom Route Hooks:

- **useRouter()** - Navigate programmatically: [src/routes/hooks/use-router.ts](src/routes/hooks/use-router.ts)
- **usePathname()** - Get current pathname: [src/routes/hooks/use-pathname.ts](src/routes/hooks/use-pathname.ts)
- **useParams()** - Get URL params: [src/routes/hooks/use-params.ts](src/routes/hooks/use-params.ts)
- **useSearchParams()** - Get/Set query params: [src/routes/hooks/use-search-params.ts](src/routes/hooks/use-search-params.ts)

---

### 3.4 State Management (Zustand)

**Location:** `src/store/`

#### Stores:

1. **User Store** - Authentication & user data: [src/store/userStore.ts](src/store/userStore.ts)

   ```tsx
   import {
     useUserInfo,
     useUserToken,
     useUserActions,
   } from "@/store/userStore";

   const userInfo = useUserInfo();
   const { accessToken } = useUserToken();
   const { setUserInfo, clearUserInfoAndToken } = useUserActions();
   ```

2. **Settings Store** - Theme, layout, preferences: [src/store/settingStore.ts](src/store/settingStore.ts)

   ```tsx
   import { useSettings, useSettingActions } from "@/store/settingStore";

   const settings = useSettings();
   const { setSettings } = useSettingActions();

   // Access specific settings
   const { themeMode, themeLayout, multiTab } = settings;
   ```

#### Pattern:

All stores follow this pattern:

- State separated from actions
- Persist to localStorage
- Typed with TypeScript
- Selector hooks for granular subscriptions

---

### 3.5 API Layer (Axios + React-Query)

**Location:** `src/api/`

#### API Client Setup:

File: [src/api/apiClient.ts](src/api/apiClient.ts)

Features:

- Axios interceptors for auth tokens
- Automatic error handling
- Toast notifications on errors
- Auto logout on 401

#### Service Layer:

File: `src/api/services/userService.ts`

```tsx
import apiClient from "@/api/apiClient";

const userService = {
  signin: (data: SignInReq) =>
    apiClient.post<SignInRes>({ url: "/auth/login", data }),

  getUserList: () => apiClient.get<UserInfo[]>({ url: "/users" }),
};

export default userService;
```

#### React-Query Usage:

```tsx
import { useQuery, useMutation } from "@tanstack/react-query";
import userService from "@/api/services/userService";

// Fetch data
function UserList() {
  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: userService.getUserList,
  });
}

// Mutate data
function CreateUser() {
  const mutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
```

---

### 3.6 Mock API (MSW)

**Location:** `src/_mock/`

#### Setup:

- File: [src/\_mock/index.ts](src/_mock/index.ts)
- Handlers: `src/_mock/handlers/_user.ts`, `_menu.ts`, etc.
- Initialized in: [src/main.tsx](src/main.tsx:16)

#### How to Add Mock Handler:

```tsx
// src/_mock/handlers/_user.ts
import { http, HttpResponse } from "msw";

export const userList = http.get("/api/users", () => {
  return HttpResponse.json({
    status: 0,
    message: "Success",
    data: [{ id: "1", username: "admin", email: "admin@example.com" }],
  });
});
```

---

### 3.7 Theme System

**Location:** `src/theme/`

#### Features:

- Light/Dark mode
- 6 color presets (Default, Cyan, Purple, Blue, Orange, Red)
- 3 layout modes (Vertical, Horizontal, Mini)
- Font customization
- Tailwind + CSS Variables

#### Theme Provider:

File: [src/theme/theme-provider.tsx](src/theme/theme-provider.tsx)

#### Usage:

```tsx
import { useSettings, useSettingActions } from "@/store/settingStore";

function ThemeSettings() {
  const settings = useSettings();
  const { setSettings } = useSettingActions();

  const toggleTheme = () => {
    setSettings({
      ...settings,
      themeMode: settings.themeMode === "light" ? "dark" : "light",
    });
  };

  const changeLayout = (layout: ThemeLayout) => {
    setSettings({ ...settings, themeLayout: layout });
  };
}
```

#### Available Settings:

```ts
type SettingsType = {
  themeColorPresets: ThemeColorPresets; // Color scheme
  themeMode: ThemeMode; // Light/Dark
  themeLayout: ThemeLayout; // Vertical/Horizontal/Mini
  themeStretch: boolean; // Stretch content
  breadCrumb: boolean; // Show breadcrumbs
  accordion: boolean; // Accordion nav
  multiTab: boolean; // Multi-tab navigation
  darkSidebar: boolean; // Dark sidebar in light mode
  fontFamily: string; // Font family
  fontSize: number; // Font size
  direction: "ltr" | "rtl"; // Text direction
};
```

---

### 3.8 Internationalization (i18n)

**Location:** `src/locales/`

#### Setup:

File: [src/locales/i18n.ts](src/locales/i18n.ts)

#### Supported Languages:

- English (en_US)
- Chinese (zh_CN)

#### Usage:

```tsx
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation();

  return <h1>{t("sys.login.title")}</h1>;
}
```

#### Change Language:

```tsx
import { useLocale } from "@/locales/use-locale";

function LanguageSwitcher() {
  const { setLocale } = useLocale();

  return <Button onClick={() => setLocale("zh_CN")}>中文</Button>;
}
```

#### Add Translation:

```tsx
// src/locales/lang/en_US/index.ts
export default {
  sys: {
    login: {
      title: "Sign In",
      username: "Username",
      password: "Password",
    },
  },
};
```

---

## 4. Reusable Components

### 4.1 UI Components (shadcn/ui)

**Location:** `src/ui/`

All shadcn/ui components are available. **35+ components** including:

- **Form Components:** Button, Input, Textarea, Select, Checkbox, Radio, Switch, Slider, Calendar, DatePicker
- **Data Display:** Table, Card, Avatar, Badge, Tooltip, Popover, Dialog, Sheet, Drawer
- **Navigation:** Tabs, Breadcrumb, Dropdown Menu, Command Palette, Sidebar
- **Feedback:** Alert, Toast, Progress, Skeleton
- **Layout:** Separator, Scroll Area, Collapsible

#### Usage:

```tsx
import { Button } from "@/ui/button";
import { Dialog } from "@/ui/dialog";
import { Form } from "@/ui/form";

// All components are fully typed and follow shadcn conventions
```

---

### 4.2 Custom Components

#### 4.2.1 Navigation Components

**Location:** `src/components/nav/`

**Three variants:**

1. **Vertical Nav** - [src/components/nav/vertical/](src/components/nav/vertical/)
2. **Horizontal Nav** - [src/components/nav/horizontal/](src/components/nav/horizontal/)
3. **Mini Nav** - [src/components/nav/mini/](src/components/nav/mini/)

**Usage:**

```tsx
import {
  NavVerticalLayout,
  NavHorizontalLayout,
} from "@/layouts/dashboard/nav";

// Navigation data structure
type NavItemDataProps = {
  path?: string;
  icon?: string;
  caption?: string;
  info?: string | number;
  disabled?: boolean;
  auth?: string[];
  hidden?: boolean;
  children?: NavItemDataProps[];
};
```

---

#### 4.2.2 Animation Components

**Location:** `src/components/animate/`

Based on Framer Motion with pre-built variants.

**Components:**

- **MotionContainer** - Animate children sequentially: [src/components/animate/motion-container.tsx](src/components/animate/motion-container.tsx)
- **MotionViewport** - Animate on scroll into view: [src/components/animate/motion-viewport.tsx](src/components/animate/motion-viewport.tsx)
- **MotionLazy** - Lazy load motion components: [src/components/animate/motion-lazy.tsx](src/components/animate/motion-lazy.tsx)
- **ScrollProgress** - Scroll indicator: [src/components/animate/scroll-progress/](src/components/animate/scroll-progress/)

**Animation Variants:**
Location: `src/components/animate/variants/`

- fade, slide, scale, rotate, zoom, flip, bounce, background, path

**Usage:**

```tsx
import { MotionContainer } from "@/components/animate";
import { varFade } from "@/components/animate/variants";
import { motion } from "motion/react";

function AnimatedCard() {
  return (
    <MotionContainer>
      <motion.div variants={varFade().inUp}>
        <Card>Content</Card>
      </motion.div>
    </MotionContainer>
  );
}
```

---

#### 4.2.3 Chart Component

**Location:** `src/components/chart/`

Wrapper around ApexCharts with theme integration.

**Usage:**

```tsx
import Chart from "@/components/chart";
import { useChart } from "@/components/chart/useChart";

function SalesChart() {
  const chartOptions = useChart({
    chart: { type: "line" },
    xaxis: { categories: ["Jan", "Feb", "Mar"] },
  });

  return (
    <Chart
      type="line"
      series={[{ name: "Sales", data: [30, 40, 45] }]}
      options={chartOptions}
      height={350}
    />
  );
}
```

---

#### 4.2.4 Code Block Component

**Location:** `src/components/code/`

Syntax highlighted code blocks using highlight.js.

**Usage:**

```tsx
import { CodeBlock, HighlightCode } from "@/components/code";

function CodeExample() {
  return (
    <CodeBlock language="typescript">
      {`const greeting = "Hello World";`}
    </CodeBlock>
  );
}
```

---

#### 4.2.5 Rich Text Editor

**Location:** `src/components/editor/`

React-Quill based rich text editor.

**Usage:**

```tsx
import Editor from "@/components/editor";

function BlogPost() {
  const [content, setContent] = useState("");

  return (
    <Editor
      value={content}
      onChange={setContent}
      placeholder="Write something..."
    />
  );
}
```

---

#### 4.2.6 Upload Components

**Location:** `src/components/upload/`

**Components:**

- **Upload** - Base upload component: [src/components/upload/upload.tsx](src/components/upload/upload.tsx)
- **UploadAvatar** - Avatar upload: [src/components/upload/upload-avatar.tsx](src/components/upload/upload-avatar.tsx)
- **UploadBox** - Drag & drop box: [src/components/upload/upload-box.tsx](src/components/upload/upload-box.tsx)

**Usage:**

```tsx
import { UploadAvatar, UploadBox } from "@/components/upload";

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

#### 4.2.7 Icon Component

**Location:** `src/components/icon/`

Iconify integration with local icon registration.

**Usage:**

```tsx
import Icon from "@/components/icon";

function MyComponent() {
  return (
    <>
      <Icon icon="solar:user-bold" width={24} />
      <Icon icon="solar:settings-outline" />
    </>
  );
}
```

---

#### 4.2.8 Loading Components

**Location:** `src/components/loading/`

**Components:**

- **RouteLoadingProgress** - Top bar loading indicator: [src/components/loading/route-loading.tsx](src/components/loading/route-loading.tsx)
- **LineLoading** - Linear progress: [src/components/loading/line-loading.tsx](src/components/loading/line-loading.tsx)
- **CircleLoading** - Circular spinner

---

#### 4.2.9 Other Components

**Logo Component**

```tsx
import Logo from "@/components/logo";
<Logo />;
```

**Locale Picker**

```tsx
import LocalePicker from "@/components/locale-picker";
<LocalePicker />;
```

**Avatar Group**

```tsx
import AvatarGroup from "@/components/avatar-group";
<AvatarGroup users={[user1, user2, user3]} max={3} />;
```

**Toast Notifications**

```tsx
import { toast } from "sonner";

toast.success("Operation successful!");
toast.error("Something went wrong");
toast.info("Info message");
toast.warning("Warning message");
```

---

## 5. Custom Hooks

**Location:** `src/hooks/`

### Available Hooks:

1. **useMediaQuery** - Responsive breakpoint detection: [src/hooks/use-media-query.ts](src/hooks/use-media-query.ts)

   ```tsx
   import { useMediaQuery, down, up } from "@/hooks";

   const isMobile = useMediaQuery(down("md"));
   const isDesktop = useMediaQuery(up("lg"));
   ```

2. **useCopyToClipboard** - Copy text to clipboard: [src/hooks/use-copy-to-clipboard.ts](src/hooks/use-copy-to-clipboard.ts)

   ```tsx
   import { useCopyToClipboard } from "@/hooks";

   const { copy, copiedText } = useCopyToClipboard();

   const handleCopy = () => {
     copy("Text to copy");
     toast.success("Copied!");
   };
   ```

### Route Hooks:

Located in: `src/routes/hooks/`

- **useRouter()** - Navigation
- **usePathname()** - Current path
- **useParams()** - URL parameters
- **useSearchParams()** - Query parameters

### Auth Hooks:

Located in: `src/components/auth/`

- **useAuth()** - Authentication state
- **useAuthCheck()** - Permission/Role checking

---

## 6. Utilities

**Location:** `src/utils/`

### 6.1 Common Utilities

File: [src/utils/index.ts](src/utils/index.ts)

```tsx
// Merge Tailwind classes
cn("px-4 py-2", "bg-blue-500", className);

// Check permission/role
check("user.create", permissions);
checkAny(["user.create", "user.edit"], permissions);
checkAll(["user.create", "user.edit"], permissions);

// Join URL parts
urlJoin("/admin/", "/api/", "/user/"); // '/admin/api/user'
```

### 6.2 Format Number

File: [src/utils/format-number.ts](src/utils/format-number.ts)

```tsx
import { fNumber, fCurrency, fPercent } from "@/utils/format-number";

fNumber(1234567); // '1,234,567'
fCurrency(1234.56); // '$1,234.56'
fPercent(0.85); // '85%'
```

### 6.3 Storage Utilities

File: [src/utils/storage.ts](src/utils/storage.ts)

```tsx
import { getItem, setItem, removeItem } from "@/utils/storage";

setItem(StorageEnum.UserToken, tokenData);
const token = getItem(StorageEnum.UserToken);
removeItem(StorageEnum.UserToken);
```

### 6.4 Tree Utilities

File: [src/utils/tree.ts](src/utils/tree.ts)

```tsx
import { flattenTree, buildTree, findNode } from "@/utils/tree";

// Flatten tree to array
const flatList = flattenTree(menuTree);

// Build tree from flat array
const tree = buildTree(flatList, "id", "parentId");

// Find node in tree
const node = findNode(tree, (n) => n.id === "123");
```

### 6.5 Theme Utilities

File: [src/utils/theme.ts](src/utils/theme.ts)

Utilities for color manipulation, contrast calculation, etc.

---

## 7. Design Patterns & Best Practices

### 7.1 Code Organization Principles

1. **Single Responsibility** - One file, one purpose
2. **Colocation** - Keep related files close (component + styles + types)
3. **Index Files** - Use index files for cleaner imports
4. **Barrel Exports** - Export from index files

### 7.2 Component Patterns

#### Pattern 1: Compound Components

```tsx
// Navigation uses compound component pattern
<Nav>
  <NavList>
    <NavItem />
    <NavGroup>
      <NavItem />
    </NavGroup>
  </NavList>
</Nav>
```

#### Pattern 2: Render Props / Children as Function

Used in MotionContainer, layout slots

#### Pattern 3: Controlled vs Uncontrolled

Form components support both patterns using react-hook-form

### 7.3 State Management Pattern

```tsx
// Zustand store pattern used throughout
const useStore = create<StoreType>()(
  persist(
    (set) => ({
      // State
      data: {},

      // Actions namespace
      actions: {
        setData: (data) => set({ data }),
      },
    }),
    {
      name: "storeName",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ data: state.data }),
    }
  )
);

// Export selectors
export const useData = () => useStore((state) => state.data);
export const useActions = () => useStore((state) => state.actions);
```

### 7.4 API Service Pattern

```tsx
// Service layer pattern
const userService = {
  getUsers: () => apiClient.get<User[]>({ url: "/users" }),
  createUser: (data: CreateUserReq) =>
    apiClient.post<User>({ url: "/users", data }),
};

// Usage with React-Query
const { data } = useQuery({
  queryKey: ["users"],
  queryFn: userService.getUsers,
});
```

### 7.5 Layout Composition Pattern

The layout system uses a slot-based pattern:

```tsx
// DashboardLayout composes multiple layouts
function DashboardLayout() {
  const isMobile = useMediaQuery(down("md"));
  return isMobile ? <MobileLayout /> : <PcLayout />;
}

// Each layout uses slots
<Header leftSlot={<Logo />} rightSlot={<UserMenu />} />;
```

### 7.6 Type Safety Patterns

1. **Discriminated Unions** for enums
2. **Generic Types** for API responses
3. **Utility Types** (Pick, Omit, Partial) for entity variations

### 7.7 Import Alias Pattern

All imports use `@/` alias for `src/`:

```tsx
import { Button } from "@/ui/button";
import { useUserInfo } from "@/store/userStore";
import { cn } from "@/utils";
```

Types use `#/` alias for `src/types/`:

```tsx
import type { UserInfo } from "#/entity";
import { ThemeMode } from "#/enum";
```

---

## 8. Files Requiring Refactoring

Based on analysis, these files are **too large** and should be split:

### High Priority (>500 lines):

1. **[src/ui/sidebar.tsx](src/ui/sidebar.tsx)** - 723 lines

   - **Issue:** Combines multiple sub-components
   - **Solution:** Split into:
     - `sidebar-root.tsx`
     - `sidebar-header.tsx`
     - `sidebar-content.tsx`
     - `sidebar-footer.tsx`
     - `sidebar-rail.tsx`
     - `sidebar-group.tsx`
     - `sidebar-menu.tsx`
     - `sidebar-trigger.tsx`

2. **[src/layouts/components/notice.tsx](src/layouts/components/notice.tsx)** - 629 lines

   - **Issue:** Notification component too complex
   - **Solution:** Split into:
     - `notice-dropdown.tsx` (main component)
     - `notice-list.tsx`
     - `notice-item.tsx`
     - `notice-tabs.tsx`
     - `types.ts`

3. **[src/\_mock/assets.ts](src/_mock/assets.ts)** - 591 lines

   - **Issue:** Large data file
   - **Solution:** Split by category:
     - `mock-users.ts`
     - `mock-products.ts`
     - `mock-images.ts`
     - etc.

4. **[src/pages/dashboard/analysis/index.tsx](src/pages/dashboard/analysis/index.tsx)** - 544 lines
   - **Issue:** Page component too large
   - **Solution:** Extract sections:
     - `analysis-header.tsx`
     - `analysis-stats-cards.tsx`
     - `analysis-charts.tsx`
     - `analysis-recent-activity.tsx`
     - `hooks/useAnalyticsData.ts`

### Medium Priority (300-500 lines):

5. **[src/components/upload/upload-illustration.tsx](src/components/upload/upload-illustration.tsx)** - 404 lines

   - **Solution:** Extract SVG to separate file

6. **[src/layouts/components/setting-button.tsx](src/layouts/components/setting-button.tsx)** - 372 lines

   - **Solution:** Split into:
     - `setting-drawer.tsx`
     - `theme-settings.tsx`
     - `layout-settings.tsx`
     - `navigation-settings.tsx`

7. **[src/pages/dashboard/workbench/index.tsx](src/pages/dashboard/workbench/index.tsx)** - 346 lines
   - **Solution:** Extract widgets to separate files

### Refactoring Recommendations:

**General Principles:**

- Keep page components under 200 lines
- Extract business logic to custom hooks
- Split complex components into sub-components
- Move large data structures to separate files
- Create `components/` subdirectories for complex features

---

## 9. How to Use Guide

### 9.1 Starting a New Feature

#### Step 1: Create Feature Structure

```
src/pages/my-feature/
├── index.tsx                 # Main page
├── components/               # Feature-specific components
│   ├── FeatureHeader.tsx
│   ├── FeatureList.tsx
│   └── FeatureForm.tsx
├── hooks/                    # Feature-specific hooks
│   └── useFeatureData.ts
└── types.ts                  # Feature types
```

#### Step 2: Add Route

```tsx
// src/routes/sections/dashboard/frontend.tsx
{
  path: 'my-feature',
  element: <MyFeaturePage />,
  meta: { title: 'My Feature' },
}
```

#### Step 3: Add to Navigation

```tsx
// src/layouts/dashboard/nav/nav-data/nav-data-frontend.tsx
{
  title: 'My Feature',
  path: '/my-feature',
  icon: 'solar:widget-outline',
}
```

#### Step 4: Create API Service (if needed)

```tsx
// src/api/services/myFeatureService.ts
import apiClient from "@/api/apiClient";

const myFeatureService = {
  getItems: () => apiClient.get({ url: "/my-feature/items" }),
  createItem: (data) => apiClient.post({ url: "/my-feature/items", data }),
};

export default myFeatureService;
```

#### Step 5: Add Mock Handler (for development)

```tsx
// src/_mock/handlers/_myFeature.ts
import { http, HttpResponse } from 'msw';

export const getItems = http.get('/api/my-feature/items', () => {
  return HttpResponse.json({
    status: 0,
    data: [{ id: '1', name: 'Item 1' }],
  });
});

// Add to src/_mock/index.ts
const handlers = [..., getItems];
```

---

### 9.2 Creating a Reusable Component

```tsx
// src/components/my-component/index.tsx
import { cn } from "@/utils";

interface MyComponentProps {
  title: string;
  className?: string;
  children?: React.ReactNode;
}

export function MyComponent({ title, className, children }: MyComponentProps) {
  return (
    <div className={cn("rounded-lg border p-4", className)}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <div>{children}</div>
    </div>
  );
}

// Export from index
export { MyComponent } from "./my-component";
```

---

### 9.3 Adding a New Language

```tsx
// 1. Add translations
// src/locales/lang/fr_FR/index.ts
export default {
  sys: {
    login: {
      title: "Se connecter",
      username: "Nom d'utilisateur",
    },
  },
};

// 2. Import in i18n.ts
import fr_FR from "./lang/fr_FR";

i18n.init({
  resources: {
    en_US: { translation: en_US },
    zh_CN: { translation: zh_CN },
    fr_FR: { translation: fr_FR }, // Add here
  },
});

// 3. Add to LocalEnum
// src/types/enum.ts
export enum LocalEnum {
  en_US = "en_US",
  zh_CN = "zh_CN",
  fr_FR = "fr_FR", // Add here
}
```

---

### 9.4 Adding Protected Routes

```tsx
// Wrap route with AuthGuard
import AuthGuard from '@/components/auth/auth-guard';

{
  path: 'admin',
  element: (
    <AuthGuard>
      <AdminPage />
    </AuthGuard>
  ),
}

// Or check permissions in component
import { useAuthCheck } from '@/components/auth';

function AdminPage() {
  const { check } = useAuthCheck('role');

  if (!check('admin')) {
    return <Navigate to="/403" />;
  }

  return <AdminContent />;
}
```

---

### 9.5 Customizing Theme

```tsx
// 1. Add new color preset
// src/theme/tokens/colors.ts
export const themeColors = {
  // ... existing colors
  green: {
    50: '#f0fdf4',
    // ... color scale
    900: '#14532d',
  },
};

// 2. Update enum
// src/types/enum.ts
export enum ThemeColorPresets {
  // ... existing
  Green = "green",
}

// 3. Add CSS variables
// src/theme/theme.css
[data-color-palette="green"] {
  --color-primary: 134 239 172;
  /* ... other vars */
}
```

---

### 9.6 Working with Forms

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/ui/form";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";

// Define schema
const formSchema = z.object({
  username: z.string().min(3, "Min 3 characters"),
  email: z.string().email("Invalid email"),
});

type FormData = z.infer<typeof formSchema>;

function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "", email: "" },
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
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

### 9.7 Data Fetching with React-Query

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import userService from "@/api/services/userService";
import { toast } from "sonner";

function UserList() {
  const queryClient = useQueryClient();

  // Fetch data
  const { data, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: userService.getUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation
  const createMutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      {data?.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
      <Button onClick={() => createMutation.mutate({ name: "New User" })}>
        Add User
      </Button>
    </div>
  );
}
```

---

### 9.8 Multi-Tab Navigation

Enable in settings:

```tsx
import { useSettings, useSettingActions } from "@/store/settingStore";

const { setSettings } = useSettingActions();
setSettings({ ...settings, multiTab: true });
```

The multi-tab system will automatically track visited routes and allow:

- Opening multiple pages in tabs
- Switching between tabs
- Closing tabs
- Tab reordering (drag & drop)
- Context menu operations (close others, close all, etc.)

Location: [src/layouts/dashboard/multi-tabs/](src/layouts/dashboard/multi-tabs/)

---

### 9.9 Responsive Design

Use the built-in breakpoint system:

```tsx
import { useMediaQuery, down, up, between } from "@/hooks";

function ResponsiveComponent() {
  const isMobile = useMediaQuery(down("md")); // < 768px
  const isTablet = useMediaQuery(between("md", "lg")); // 768px - 1024px
  const isDesktop = useMediaQuery(up("lg")); // > 1024px

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {isMobile && <MobileView />}
      {isDesktop && <DesktopView />}
    </div>
  );
}
```

---

## 10. Quick Reference

### 10.1 Common Import Paths

```tsx
// UI Components
import { Button, Input, Dialog } from "@/ui/[component]";

// Custom Components
import Logo from "@/components/logo";
import Icon from "@/components/icon";
import { AuthGuard } from "@/components/auth";

// Hooks
import { useMediaQuery } from "@/hooks";
import { useRouter } from "@/routes/hooks";

// Store
import { useUserInfo, useUserToken } from "@/store/userStore";
import { useSettings } from "@/store/settingStore";

// Utils
import { cn } from "@/utils";

// Types
import type { UserInfo } from "#/entity";
import { ThemeMode } from "#/enum";

// API
import apiClient from "@/api/apiClient";
import userService from "@/api/services/userService";
```

---

### 10.2 Environment Variables

Create `.env` file:

```bash
VITE_APP_DEFAULT_ROUTE=/workbench
VITE_APP_PUBLIC_PATH=/
VITE_APP_API_BASE_URL=/api
VITE_APP_ROUTER_MODE=frontend
```

---

### 10.3 Key Configuration Files

- **Global Config:** [src/global-config.ts](src/global-config.ts)
- **Vite Config:** `vite.config.ts`
- **TypeScript Config:** `tsconfig.json`
- **Tailwind Config:** `tailwind.config.js`
- **shadcn Config:** `components.json`
- **Biome (Linter/Formatter):** `biome.json`

---

### 10.4 Component Library Stack

- **Base:** shadcn/ui (Radix UI + Tailwind)
- **Charts:** ApexCharts
- **Icons:** Iconify
- **Animations:** Framer Motion
- **Forms:** react-hook-form + Zod
- **Date:** date-fns
- **Rich Text:** React-Quill
- **Calendar:** FullCalendar
- **Drag & Drop:** @dnd-kit
- **QR Codes:** qrcode.react

---

## Summary

This Slash Admin template is a **production-ready**, **enterprise-grade** admin panel starter with:

✅ **Modern Tech Stack** - React 19, TypeScript, Vite
✅ **Complete Auth System** - Login, RBAC, guards
✅ **Flexible Routing** - Frontend/Backend modes
✅ **State Management** - Zustand with persistence
✅ **API Layer** - Axios + React-Query + MSW mocking
✅ **Theme System** - Dark mode, color presets, layouts
✅ **i18n Support** - EN/CN with easy extensibility
✅ **35+ UI Components** - shadcn/ui fully integrated
✅ **Custom Components** - Nav, Charts, Editor, Upload, etc.
✅ **Responsive Design** - Mobile/Tablet/Desktop
✅ **Animation System** - Framer Motion with variants
✅ **Developer Experience** - Hot reload, type safety, linting

### Next Steps:

1. **Review refactoring recommendations** (Section 8)
2. **Customize theme** (Section 9.5)
3. **Add your features** (Section 9.1)
4. **Remove unused demo pages**
5. **Configure environment variables**
6. **Set up your API endpoints**
7. **Add your branding** (logo, colors, etc.)

### Best Practices for Your Project:

- ✅ Keep files small (<200 lines)
- ✅ Use TypeScript strictly
- ✅ Follow the established patterns
- ✅ Write reusable components
- ✅ Use the provided utilities
- ✅ Leverage the hook system
- ✅ Follow the folder structure
- ✅ Test with MSW handlers first
- ✅ Use i18n for all text
- ✅ Respect the separation of concerns

---

**Documentation Generated:** 2025-10-17
**Total Files Analyzed:** 276 TypeScript files
**Template Version:** 0.0.0
