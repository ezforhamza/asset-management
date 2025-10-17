# Code Standards & Best Practices SOP

## Standard Operating Procedure for Slash Admin Development

---

## 1. File Organization Standards

### ✅ DO: Keep Files Small and Focused

**Maximum Line Counts:**
- **Components:** 150-200 lines
- **Pages:** 200-250 lines
- **Hooks:** 100-150 lines
- **Utils:** 50-100 lines per function
- **Types:** 100-150 lines
- **Services:** 150-200 lines

**If a file exceeds these limits:**
1. Extract sub-components
2. Move business logic to hooks
3. Split into multiple files
4. Create a subdirectory structure

### ✅ DO: One Responsibility Per File

```tsx
// ❌ BAD: Multiple responsibilities
// UserManagement.tsx (500 lines)
// - User list
// - User form
// - User details
// - User deletion
// - API calls
// - State management

// ✅ GOOD: Separated
// pages/user-management/
//   ├── index.tsx                 (Main orchestration, ~100 lines)
//   ├── components/
//   │   ├── UserList.tsx          (~80 lines)
//   │   ├── UserForm.tsx          (~120 lines)
//   │   ├── UserDetails.tsx       (~90 lines)
//   │   └── UserDeleteDialog.tsx  (~50 lines)
//   ├── hooks/
//   │   └── useUserManagement.ts  (~100 lines)
//   └── types.ts                  (~40 lines)
```

---

## 2. Component Structure Standards

### ✅ Template for Component Files

```tsx
// 1. External imports (libraries)
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal UI imports
import { Button } from '@/ui/button';
import { Dialog } from '@/ui/dialog';

// 3. Internal component imports
import { Icon } from '@/components/icon';

// 4. Hooks
import { useMediaQuery } from '@/hooks';

// 5. Utils
import { cn } from '@/utils';

// 6. Types
import type { User } from '#/entity';

// 7. Types/Interfaces for this component
interface MyComponentProps {
  title: string;
  users: User[];
  onEdit?: (user: User) => void;
}

// 8. Component implementation
export function MyComponent({ title, users, onEdit }: MyComponentProps) {
  // a. State
  const [isOpen, setIsOpen] = useState(false);

  // b. Hooks
  const isMobile = useMediaQuery(down('md'));

  // c. Queries/Mutations
  const { data, isLoading } = useQuery({...});

  // d. Effects
  useEffect(() => {
    // ...
  }, []);

  // e. Handlers
  const handleEdit = (user: User) => {
    onEdit?.(user);
  };

  // f. Early returns
  if (isLoading) return <Loading />;
  if (!users.length) return <Empty />;

  // g. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}

// 9. Sub-components (if very small, otherwise separate file)
function SubComponent() {
  return <div>...</div>;
}
```

---

## 3. When to Extract Code

### Extract to Separate Component When:

1. **Reused** in 2+ places
2. **Complex** (>50 lines of JSX)
3. **Has own state** management
4. **Logically independent**
5. **Needs separate testing**

### Extract to Custom Hook When:

1. **Stateful logic** used in multiple components
2. **Side effects** that can be isolated
3. **Complex calculations** or data transformations
4. **API calls** or data fetching
5. **More than 3-4 useState/useEffect** in one component

### Extract to Utility When:

1. **Pure function** with no dependencies
2. **Reusable** across different features
3. **Not React-specific** (no hooks)
4. **Data transformation/validation**

---

## 4. Folder Structure Standards

### ✅ Feature-Based Organization

```
src/pages/user-management/
├── index.tsx                    # Main page (orchestrator)
├── components/                  # Feature-specific components
│   ├── UserList/
│   │   ├── index.tsx
│   │   ├── UserListItem.tsx
│   │   └── UserListHeader.tsx
│   ├── UserForm/
│   │   ├── index.tsx
│   │   ├── BasicInfoSection.tsx
│   │   ├── PermissionsSection.tsx
│   │   └── validation.ts
│   └── UserFilters.tsx
├── hooks/                       # Feature-specific hooks
│   ├── useUserList.ts
│   ├── useUserForm.ts
│   └── useUserFilters.ts
└── types.ts                     # Feature-specific types
```

### ✅ Component-Based Organization (for complex components)

```
src/components/data-table/
├── index.ts                     # Barrel export
├── DataTable.tsx                # Main component
├── components/                  # Sub-components
│   ├── DataTableHeader.tsx
│   ├── DataTableRow.tsx
│   ├── DataTableCell.tsx
│   ├── DataTablePagination.tsx
│   └── DataTableFilters.tsx
├── hooks/
│   ├── useDataTable.ts
│   └── useDataTableSort.ts
├── utils.ts                     # Component-specific utils
└── types.ts                     # Component-specific types
```

---

## 5. Naming Conventions

### Files

```
✅ PascalCase for components:    UserList.tsx, DataTable.tsx
✅ kebab-case for pages:          user-management/index.tsx
✅ camelCase for hooks:           useUserList.ts
✅ camelCase for utils:           formatDate.ts, storage.ts
✅ lowercase for types:           types.ts, entity.ts
✅ prefix hooks with 'use':       useAuth.ts, useMediaQuery.ts
```

### Variables & Functions

```tsx
✅ camelCase for variables:       const userName = 'John';
✅ camelCase for functions:       function handleClick() {}
✅ PascalCase for components:     function UserCard() {}
✅ UPPER_CASE for constants:      const API_BASE_URL = '...';
✅ Prefix handlers with 'handle': const handleSubmit = () => {};
✅ Prefix booleans with 'is/has': const isLoading = true;
```

---

## 6. Code Quality Standards

### ✅ Always Use TypeScript Properly

```tsx
// ❌ BAD: Using 'any'
const handleData = (data: any) => {
  console.log(data.name);
};

// ✅ GOOD: Proper typing
interface User {
  id: string;
  name: string;
  email: string;
}

const handleData = (data: User) => {
  console.log(data.name);
};
```

### ✅ Always Handle Loading & Error States

```tsx
// ❌ BAD: No loading/error handling
function UserList() {
  const { data } = useQuery({ queryKey: ['users'], queryFn: getUsers });
  return <div>{data.map(...)}</div>;
}

// ✅ GOOD: Proper state handling
function UserList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;
  if (!data?.length) return <Empty />;

  return <div>{data.map(...)}</div>;
}
```

### ✅ Use Meaningful Variable Names

```tsx
// ❌ BAD
const d = new Date();
const temp = users.filter(u => u.active);
const x = calculateTotal(items);

// ✅ GOOD
const currentDate = new Date();
const activeUsers = users.filter(user => user.status === 'active');
const totalAmount = calculateTotal(items);
```

### ✅ Avoid Deep Nesting

```tsx
// ❌ BAD: Deep nesting
function UserActions({ user }) {
  if (user) {
    if (user.isActive) {
      if (user.permissions) {
        if (user.permissions.includes('edit')) {
          return <EditButton />;
        }
      }
    }
  }
  return null;
}

// ✅ GOOD: Early returns
function UserActions({ user }) {
  if (!user) return null;
  if (!user.isActive) return null;
  if (!user.permissions) return null;
  if (!user.permissions.includes('edit')) return null;

  return <EditButton />;
}

// ✅ BETTER: Extract to function
function UserActions({ user }) {
  const canEdit = user?.isActive && user?.permissions?.includes('edit');

  if (!canEdit) return null;

  return <EditButton />;
}
```

---

## 7. Import Organization

### ✅ Standard Import Order

```tsx
// 1. React & Third-party libraries
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

// 2. UI Components (shadcn)
import { Button } from '@/ui/button';
import { Dialog } from '@/ui/dialog';
import { Form } from '@/ui/form';

// 3. Custom Components
import { AuthGuard } from '@/components/auth';
import Icon from '@/components/icon';
import Logo from '@/components/logo';

// 4. Layouts
import DashboardLayout from '@/layouts/dashboard';

// 5. Hooks
import { useMediaQuery } from '@/hooks';
import { useRouter } from '@/routes/hooks';

// 6. Stores
import { useUserInfo } from '@/store/userStore';
import { useSettings } from '@/store/settingStore';

// 7. Utils
import { cn } from '@/utils';
import { fCurrency } from '@/utils/format-number';

// 8. API Services
import userService from '@/api/services/userService';

// 9. Types (separate section)
import type { User, Role } from '#/entity';
import { ThemeMode } from '#/enum';

// 10. Local imports (relative paths)
import { UserForm } from './components/UserForm';
import { useUserManagement } from './hooks/useUserManagement';
```

---

## 8. Comments & Documentation

### ✅ When to Comment

```tsx
// ✅ GOOD: Complex business logic
// Calculate discount based on user tier and purchase amount
// Tier 1: 5%, Tier 2: 10%, Tier 3: 15%
// Bonus 5% if amount > $1000
const discount = calculateDiscount(user.tier, amount);

// ✅ GOOD: Non-obvious workarounds
// HACK: Force re-render to fix Safari layout bug
// TODO: Remove when Safari fixes the issue
const [key, setKey] = useState(0);

// ✅ GOOD: API documentation
/**
 * Fetch user list with optional filters
 * @param filters - Optional filter object
 * @param filters.status - Filter by user status
 * @param filters.role - Filter by user role
 * @returns Promise<User[]>
 */
async function getUserList(filters?: UserFilters): Promise<User[]> {
  // ...
}

// ❌ BAD: Obvious comments
// Set loading to true
setLoading(true);

// Loop through users
users.forEach(user => {
  // ...
});
```

### ✅ Use JSDoc for Complex Functions

```tsx
/**
 * Calculate the final price after applying discounts and taxes
 *
 * @param basePrice - The original price before any adjustments
 * @param discountPercent - Discount percentage (0-100)
 * @param taxRate - Tax rate as decimal (e.g., 0.1 for 10%)
 * @returns The final price rounded to 2 decimal places
 *
 * @example
 * ```ts
 * calculateFinalPrice(100, 10, 0.1) // Returns 99.00
 * ```
 */
function calculateFinalPrice(
  basePrice: number,
  discountPercent: number,
  taxRate: number
): number {
  const discounted = basePrice * (1 - discountPercent / 100);
  const withTax = discounted * (1 + taxRate);
  return Math.round(withTax * 100) / 100;
}
```

---

## 9. Performance Best Practices

### ✅ Memoization

```tsx
import { useMemo, useCallback, memo } from 'react';

function ExpensiveComponent({ items, onSelect }) {
  // ✅ Memoize expensive calculations
  const sortedItems = useMemo(() => {
    return items.sort((a, b) => a.value - b.value);
  }, [items]);

  // ✅ Memoize callbacks
  const handleSelect = useCallback((item) => {
    onSelect(item);
  }, [onSelect]);

  return <List items={sortedItems} onSelect={handleSelect} />;
}

// ✅ Memoize components
export default memo(ExpensiveComponent);
```

### ✅ Lazy Loading

```tsx
import { lazy, Suspense } from 'react';

// ✅ Lazy load heavy components
const Chart = lazy(() => import('@/components/chart'));
const Editor = lazy(() => import('@/components/editor'));

function Dashboard() {
  return (
    <div>
      <Suspense fallback={<Loading />}>
        <Chart data={data} />
      </Suspense>

      <Suspense fallback={<Loading />}>
        <Editor content={content} />
      </Suspense>
    </div>
  );
}
```

---

## 10. Testing Standards

### ✅ Component Testing

```tsx
// MyComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles user interaction', () => {
    const handleClick = jest.fn();
    render(<MyComponent onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles loading state', () => {
    render(<MyComponent isLoading={true} />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('handles error state', () => {
    render(<MyComponent error="Error message" />);
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });
});
```

---

## 11. Git Commit Standards

### ✅ Commit Message Format

```bash
# Format: <type>(<scope>): <subject>

# Types:
feat:     # New feature
fix:      # Bug fix
refactor: # Code refactoring (no feature/bug)
style:    # Code style changes (formatting)
docs:     # Documentation changes
test:     # Adding or updating tests
chore:    # Build/dependency updates

# Examples:
feat(auth): add password reset functionality
fix(user-list): resolve pagination bug
refactor(settings): split large component into smaller parts
style(button): update button hover states
docs(readme): update installation instructions
test(auth): add unit tests for login flow
chore(deps): update react-query to v5
```

---

## 12. Code Review Checklist

### Before Submitting PR:

- [ ] **Files are small** (<200 lines for components)
- [ ] **One responsibility** per file
- [ ] **Proper TypeScript** types (no `any`)
- [ ] **Loading/error states** handled
- [ ] **Responsive design** implemented
- [ ] **Accessibility** considered (ARIA labels, keyboard nav)
- [ ] **Performance** optimized (memoization if needed)
- [ ] **No console.log** statements
- [ ] **No commented-out code**
- [ ] **Imports organized** properly
- [ ] **Meaningful names** for variables/functions
- [ ] **Early returns** instead of deep nesting
- [ ] **Error boundaries** for critical components
- [ ] **Proper Git commit** message
- [ ] **Code formatted** (Biome/Prettier)
- [ ] **No linting errors**

---

## 13. Common Anti-Patterns to Avoid

### ❌ God Components

```tsx
// ❌ One component doing everything (1000+ lines)
function UserManagement() {
  // State for list, form, filters, modals, etc.
  // API calls
  // Business logic
  // Rendering all UI
  // ...
}
```

### ❌ Prop Drilling

```tsx
// ❌ Passing props through many levels
<GrandParent>
  <Parent user={user}>
    <Child user={user}>
      <GrandChild user={user} />
    </Child>
  </Parent>
</GrandParent>

// ✅ Use context or state management
const UserContext = createContext();
// OR
const user = useUserInfo(); // Zustand store
```

### ❌ Inline Styles

```tsx
// ❌ BAD
<div style={{ marginTop: '20px', color: 'red' }}>...</div>

// ✅ GOOD: Use Tailwind classes
<div className="mt-5 text-red-500">...</div>
```

### ❌ Magic Numbers

```tsx
// ❌ BAD
if (user.age > 18 && user.credits > 100) {
  // ...
}

// ✅ GOOD: Named constants
const ADULT_AGE = 18;
const MIN_CREDITS_REQUIRED = 100;

if (user.age > ADULT_AGE && user.credits > MIN_CREDITS_REQUIRED) {
  // ...
}
```

---

## 14. Refactoring Workflow

### When Code Gets Too Large:

#### Step 1: Identify Responsibilities
- List all things the component does
- Group related functionality

#### Step 2: Extract Sub-Components
```tsx
// Before: UserPage.tsx (500 lines)
// After:
// pages/users/
//   ├── index.tsx              (100 lines - orchestration)
//   ├── components/
//   │   ├── UserList.tsx       (80 lines)
//   │   ├── UserForm.tsx       (120 lines)
//   │   └── UserFilters.tsx    (60 lines)
//   └── hooks/
//       └── useUserData.ts     (80 lines)
```

#### Step 3: Extract Hooks
```tsx
// Move complex logic to custom hooks
function useUserManagement() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({});

  // All logic here
  return { users, filters, handleFilter, handleCreate };
}
```

#### Step 4: Extract Utilities
```tsx
// Move pure functions to utils
// utils/user.ts
export function formatUserRole(role: string) { ... }
export function validateUserEmail(email: string) { ... }
```

---

## 15. Quick Decision Tree

### "Should I create a new file?"

```
Is the code > 50 lines?
  ├─ Yes → Is it reusable?
  │   ├─ Yes → Create separate component/util
  │   └─ No → Is it complex/independent?
  │       ├─ Yes → Extract to sub-component
  │       └─ No → Keep inline
  └─ No → Keep inline (unless reusable)

Is the logic stateful/has side effects?
  ├─ Yes → Extract to custom hook
  └─ No → Extract to utility function

Am I passing 5+ props to a component?
  ├─ Yes → Consider context or state management
  └─ No → Props are fine

Is my component > 200 lines?
  ├─ Yes → MUST refactor (see Step 2-4 above)
  └─ No → OK, but monitor growth
```

---

## 16. Enforcement

### Pre-Commit Hooks

Already configured with **Lefthook**:
- Biome formatting
- Linting checks
- Type checking

### VS Code Extensions (Recommended)

```json
{
  "recommendations": [
    "biomejs.biome",          // Linter/Formatter
    "bradlc.vscode-tailwindcss", // Tailwind IntelliSense
    "dbaeumer.vscode-eslint",    // ESLint (if using)
    "usernamehw.errorlens"       // Error highlighting
  ]
}
```

---

## Summary: The Golden Rules

1. ✅ **One file, one job** - Keep it focused
2. ✅ **Small is beautiful** - <200 lines for components
3. ✅ **Extract early** - Don't wait for 500+ lines
4. ✅ **Type everything** - No `any`, ever
5. ✅ **Handle all states** - Loading, error, empty, success
6. ✅ **Name clearly** - No abbreviations, be descriptive
7. ✅ **Import organized** - Follow the standard order
8. ✅ **Comment wisely** - Why, not what
9. ✅ **Test critical paths** - Auth, payments, data mutations
10. ✅ **Review before commit** - Use the checklist

---

**Remember:** Clean code is not about being perfect on the first try. It's about **continuous improvement** and **refactoring** as you go.

When in doubt, ask yourself: "If I come back to this in 6 months, will I understand it?"

