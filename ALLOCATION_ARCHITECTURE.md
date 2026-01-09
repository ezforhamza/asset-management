# Asset Allocation Frontend Architecture

## Component Structure

```
📁 src/
├── 📁 api/
│   ├── 📁 services/
│   │   └── 📄 allocationService.ts ✅
│   │       ├── allocateAssets()
│   │       ├── unallocateAssets()
│   │       ├── reassignAssets()
│   │       ├── getAllocationSummary()
│   │       ├── getFieldWorkerAssets()
│   │       └── bulkAllocateAssets()
│   └── 📄 endpoints.ts ✅ (ALLOCATIONS section added)
│
├── 📁 types/
│   └── 📄 entity.ts ✅
│       ├── FieldWorkerAllocationSummary
│       └── AllocationSummary
│
├── 📁 pages/
│   ├── 📁 assets/
│   │   ├── 📄 index.tsx ⚙️ (integration needed)
│   │   └── 📁 components/
│   │       ├── 📄 BulkAllocationToolbar.tsx ✅
│   │       ├── 📄 AllocateAssetsModal.tsx ✅
│   │       ├── 📄 UnallocateAssetsModal.tsx ✅
│   │       ├── 📄 CreateAssetModal.tsx (existing)
│   │       ├── 📄 CategoriesModal.tsx (existing)
│   │       └── 📄 ImportAssetsModal.tsx (existing)
│   │
│   └── 📁 users/
│       ├── 📄 index.tsx ⚙️ (integration needed)
│       └── 📁 components/
│           ├── 📄 FieldWorkerAssetsModal.tsx ✅
│           ├── 📄 UserTable.tsx (existing)
│           ├── 📄 CreateUserModal.tsx (existing)
│           └── 📄 EditUserModal.tsx (existing)
│
└── 📁 store/
    └── 📄 userStore.ts (using for role checks)
```

**Legend:**
- ✅ Created/Updated
- ⚙️ Integration needed (follow guide)

---

## Data Flow Architecture

### 1. Bulk Allocation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Assets Page                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Asset Table (with checkboxes)                       │  │
│  │  ┌──────┬───────────┬──────────┬─────────────┐      │  │
│  │  │ [✓]  │ SN-001    │ Forklift │ Unassigned  │      │  │
│  │  │ [✓]  │ SN-002    │ Crane    │ Assigned    │      │  │
│  │  │ [ ]  │ SN-003    │ Truck    │ Unassigned  │      │  │
│  │  └──────┴───────────┴──────────┴─────────────┘      │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│                            │ User selects assets            │
│                            ▼                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  BulkAllocationToolbar                               │  │
│  │  "2 assets selected" [Bulk Actions ▼]               │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│                  ┌─────────┴─────────┐                     │
│                  │ User clicks action │                     │
│                  └─────────┬─────────┘                     │
│         ┌────────────────┬─┴───────────────┐              │
│         ▼                ▼                 ▼               │
│  ┌──────────┐    ┌─────────────┐   ┌─────────────┐       │
│  │ Allocate │    │  Reassign   │   │ Unallocate  │       │
│  │  Modal   │    │    Modal    │   │   Modal     │       │
│  └────┬─────┘    └──────┬──────┘   └──────┬──────┘       │
│       │                 │                  │               │
│       └─────────────────┴──────────────────┘               │
│                         │                                   │
│                         ▼                                   │
│                  API Call (React-Query)                     │
│                         │                                   │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              allocationService                               │
├─────────────────────────────────────────────────────────────┤
│  • allocateAssets({ assetIds, fieldWorkerId })              │
│  • reassignAssets({ assetIds, newFieldWorkerId })           │
│  • unallocateAssets({ assetIds })                           │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API                               │
│  POST /api/v1/allocations/allocate                          │
│  POST /api/v1/allocations/reassign                          │
│  POST /api/v1/allocations/unallocate                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
                    Response + Toast
                          │
                          ▼
            Query Invalidation → Refresh Table
```

---

### 2. Edit Asset Allocation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Assets Page                               │
│  User clicks "Edit" on asset                                 │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│               Edit Asset Modal                               │
├─────────────────────────────────────────────────────────────┤
│  Serial Number: [SN-001        ]                            │
│  Make:          [Toyota        ]                            │
│  Model:         [Forklift      ]                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Assigned Field Worker: [Select ▼]                    │   │
│  │  • Unassigned                                        │   │
│  │  • John Doe (john@company.com)                       │   │
│  │  • Jane Smith (jane@company.com)                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                    [Cancel] [Save]                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
              Detect allocation change
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
  Unassigned→        Worker A→         Worker A→
    Worker        Unassigned           Worker B
        │                 │                 │
        ▼                 ▼                 ▼
  allocateAssets   unallocateAssets   reassignAssets
        │                 │                 │
        └─────────────────┴─────────────────┘
                          │
                          ▼
                   Backend API Call
                          │
                          ▼
            Success → Toast + Refresh
```

---

### 3. Users Page Allocation View Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Users Page                               │
├─────────────────────────────────────────────────────────────┤
│  Query: getAllocationSummary()                              │
│         ↓                                                    │
│  Field Worker List:                                         │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Name          Role          Allocated Assets        │    │
│  │ John Doe      Field User    [📦 15 assets]         │    │
│  │ Jane Smith    Field User    [📦 8 assets]          │    │
│  │ Bob Johnson   Field User    [📦 0 assets]          │    │
│  └────────────────────────────────────────────────────┘    │
│                        │                                     │
│         User clicks "View Allocated Assets"                 │
│                        ▼                                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │      FieldWorkerAssetsModal                        │    │
│  │  "Allocated Assets - John Doe"                     │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │ SN      Make/Model    Category    Status    │  │    │
│  │  │ SN-001  Toyota Fork   Forklifts   Active    │  │    │
│  │  │ SN-005  CAT Loader    Loaders     Active    │  │    │
│  │  │ ...                                          │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │  Page 1 of 2        [< Prev] [Next >]             │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
          Query: getFieldWorkerAssets(fieldWorkerId)
                          │
                          ▼
            GET /api/v1/allocations/field-worker/:id/assets
```

---

## State Management

### Assets Page State

```tsx
// Selection State
selectedAssetIds: string[]          // IDs of selected assets

// Modal State
allocateModalOpen: boolean          // Show/hide allocate modal
allocateMode: "allocate" | "reassign"  // Modal behavior
unallocateModalOpen: boolean        // Show/hide unallocate modal

// Edit Modal State
editingAsset: Asset | null          // Currently editing asset
editForm: {
  ...UpdateAssetReq,
  allocatedTo?: string | null       // NEW: Field worker ID or null
}

// User State
userInfo: UserInfo                  // From Zustand store
isAdmin: boolean                    // Derived: role check
```

### Users Page State

```tsx
// View Assets Modal State
viewAssetsModalOpen: boolean        // Show/hide modal
selectedFieldWorker: {              // Worker to view assets for
  id: string,
  name: string
} | null

// Data from API
allocationSummary: AllocationSummary  // Summary with field worker counts
fieldWorkerAllocations: FieldWorkerAllocationSummary[]  // Array of workers + counts
```

---

## API Integration Points

### Endpoints Used

| Feature | Method | Endpoint | Request | Response |
|---------|--------|----------|---------|----------|
| **Allocate** | POST | `/allocations/allocate` | `{ assetIds, fieldWorkerId }` | `AllocationOperationRes` |
| **Unallocate** | POST | `/allocations/unallocate` | `{ assetIds }` | `AllocationOperationRes` |
| **Reassign** | POST | `/allocations/reassign` | `{ assetIds, newFieldWorkerId }` | `AllocationOperationRes` |
| **Summary** | GET | `/allocations/summary?companyId=X` | - | `AllocationSummary` |
| **Worker Assets** | GET | `/allocations/field-worker/:id/assets` | `{ page, limit }` | `PaginatedAssets` |
| **Bulk Allocate** | POST | `/allocations/bulk-allocate` | `{ allocations: [] }` | `AllocationOperationRes` |

### Response Handling

```tsx
interface AllocationOperationRes {
  success: boolean
  message: string

  // Success arrays
  allocated?: string[]       // Successfully allocated
  unallocated?: string[]     // Successfully unallocated
  reassigned?: string[]      // Successfully reassigned

  // Partial failure arrays
  alreadyAllocated?: string[]  // Already assigned
  notAllocated?: string[]      // Not assigned (can't unallocate)
  notFound?: string[]          // Asset doesn't exist
  wrongCompany?: string[]      // Different company
  sameWorker?: string[]        // Already assigned to this worker
}
```

**Toast Strategy:**
- Success count > 0 → Green toast
- Partial failures → Yellow warning toasts
- Complete failure → Red error toast

---

## Permission System

```tsx
// Role Check
const userInfo = useUserInfo();  // From Zustand
const isAdmin =
  userInfo.role === "customer_admin" ||
  userInfo.role === "system_admin";

// Conditional Rendering
{isAdmin && (
  <BulkAllocationToolbar ... />
)}

{isAdmin && (
  <Checkbox ... />  // Selection checkboxes
)}

{isAdmin && (
  <Select>  // Field worker dropdown in edit modal
    {/* ... */}
  </Select>
)}
```

**Roles:**
- ✅ `customer_admin` - Can allocate assets in their company
- ✅ `system_admin` - Can allocate across companies
- ❌ `field_user` - Cannot see allocation UI

---

## React-Query Integration

### Query Keys

```tsx
["assets", queryParams]                 // Asset list
["users", page, limit]                  // Users list (for field workers)
["allocation-summary"]                  // Allocation summary
["field-worker-assets", workerId, page] // Worker's assets
```

### Invalidation Strategy

```tsx
// After allocation mutations
queryClient.invalidateQueries({ queryKey: ["assets"] })
queryClient.invalidateQueries({ queryKey: ["allocation-summary"] })

// Invalidates:
// - Assets table (to show new allocation status)
// - Allocation summary (to update counts)
```

---

## Component Props

### BulkAllocationToolbar
```tsx
interface BulkAllocationToolbarProps {
  selectedCount: number
  onAllocate: () => void
  onReassign: () => void
  onUnallocate: () => void
  onClearSelection: () => void
}
```

### AllocateAssetsModal
```tsx
interface AllocateAssetsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assetIds: string[]
  mode: "allocate" | "reassign"
}
```

### UnallocateAssetsModal
```tsx
interface UnallocateAssetsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assetIds: string[]
}
```

### FieldWorkerAssetsModal
```tsx
interface FieldWorkerAssetsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fieldWorkerId: string
  fieldWorkerName: string
}
```

---

## File Size Report

| File | Lines | Status |
|------|-------|--------|
| `allocationService.ts` | ~135 | ✅ Within limit (<150 for services) |
| `BulkAllocationToolbar.tsx` | ~60 | ✅ Within limit (<200) |
| `AllocateAssetsModal.tsx` | ~125 | ✅ Within limit (<200) |
| `UnallocateAssetsModal.tsx` | ~75 | ✅ Within limit (<200) |
| `FieldWorkerAssetsModal.tsx` | ~145 | ✅ Within limit (<200) |

All components follow project standards! 🎉

---

## Summary

**Allocation System Architecture:**

1. **Service Layer** - Clean API abstraction
2. **Type Safety** - Full TypeScript coverage
3. **Permission Guards** - Admin-only access
4. **State Management** - Local state + React-Query
5. **UX Patterns** - Modals, toasts, loading states
6. **Error Handling** - Partial success support
7. **Query Invalidation** - Automatic refresh

**Integration Required:**
- Assets page: Add bulk selection + field worker dropdown
- Users page: Add allocation count + view assets action

Follow [ALLOCATION_INTEGRATION_GUIDE.md](ALLOCATION_INTEGRATION_GUIDE.md) for step-by-step integration.
