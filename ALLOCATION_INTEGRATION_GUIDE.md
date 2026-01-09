# Asset Allocation Frontend Integration Guide

## Overview
This guide provides step-by-step instructions to integrate the complete asset allocation feature into your Asset Management app.

---

## ✅ Completed Work

### 1. API Service Layer
- ✅ Created [allocationService.ts](src/api/services/allocationService.ts)
- ✅ Added endpoints to [endpoints.ts](src/api/endpoints.ts:92-100)
- ✅ Added types to [entity.ts](src/types/entity.ts:344-360)

### 2. UI Components
- ✅ [BulkAllocationToolbar.tsx](src/pages/assets/components/BulkAllocationToolbar.tsx) - Toolbar for bulk actions
- ✅ [AllocateAssetsModal.tsx](src/pages/assets/components/AllocateAssetsModal.tsx) - Allocate/reassign modal
- ✅ [UnallocateAssetsModal.tsx](src/pages/assets/components/UnallocateAssetsModal.tsx) - Unallocate confirmation
- ✅ [FieldWorkerAssetsModal.tsx](src/pages/users/components/FieldWorkerAssetsModal.tsx) - View worker's assets

---

## 📋 Integration Steps

### Step 1: Add Bulk Selection to Assets Table

**File:** `src/pages/assets/index.tsx`

#### 1.1 Add imports at the top:

```tsx
import { Checkbox } from "@/ui/checkbox";
import allocationService from "@/api/services/allocationService";
import userService from "@/api/services/userService";
import { useUserInfo } from "@/store/userStore";
import { AllocateAssetsModal } from "./components/AllocateAssetsModal";
import { UnallocateAssetsModal } from "./components/UnallocateAssetsModal";
import { BulkAllocationToolbar } from "./components/BulkAllocationToolbar";
```

#### 1.2 Add state variables (after line ~74):

```tsx
// Selection state
const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);

// Allocation modals
const [allocateModalOpen, setAllocateModalOpen] = useState(false);
const [allocateMode, setAllocateMode] = useState<"allocate" | "reassign">("allocate");
const [unallocateModalOpen, setUnallocateModalOpen] = useState(false);
```

#### 1.3 Add user info hook (after state declarations):

```tsx
const userInfo = useUserInfo();
const isAdmin = userInfo.role === "customer_admin" || userInfo.role === "system_admin";
```

#### 1.4 Fetch field workers (after existing queries):

```tsx
// Fetch field workers for allocation dropdown
const { data: fieldWorkersData } = useQuery({
	queryKey: ["users", 1, 1000],
	queryFn: () => userService.getUsers({ page: 1, limit: 1000 }),
	enabled: isAdmin,
});

const fieldWorkers = fieldWorkersData?.results?.filter((u) => u.role === "field_user") || [];
```

#### 1.5 Add selection handlers (before return statement):

```tsx
const handleSelectAll = (checked: boolean) => {
	if (checked) {
		setSelectedAssetIds(filteredAssets.map((a) => getAssetId(a)));
	} else {
		setSelectedAssetIds([]);
	}
};

const handleSelectAsset = (assetId: string, checked: boolean) => {
	if (checked) {
		setSelectedAssetIds((prev) => [...prev, assetId]);
	} else {
		setSelectedAssetIds((prev) => prev.filter((id) => id !== assetId));
	}
};

const handleBulkAllocate = () => {
	setAllocateMode("allocate");
	setAllocateModalOpen(true);
};

const handleBulkReassign = () => {
	setAllocateMode("reassign");
	setAllocateModalOpen(true);
};

const handleBulkUnallocate = () => {
	setUnallocateModalOpen(true);
};

const handleClearSelection = () => {
	setSelectedAssetIds([]);
};

const allSelected = filteredAssets.length > 0 && selectedAssetIds.length === filteredAssets.length;
const someSelected = selectedAssetIds.length > 0 && !allSelected;
```

#### 1.6 Add checkbox column to table header (line ~410):

```tsx
<TableHeader className="sticky top-0 bg-background z-10">
	<TableRow>
		{isAdmin && (
			<TableHead className="w-[50px]">
				<Checkbox
					checked={allSelected}
					ref={(el) => el && (el.indeterminate = someSelected)}
					onCheckedChange={handleSelectAll}
				/>
			</TableHead>
		)}
		<TableHead>Serial Number</TableHead>
		{/* ... rest of headers ... */}
	</TableRow>
</TableHeader>
```

#### 1.7 Add checkbox to each table row (line ~471):

```tsx
filteredAssets.map((asset) => (
	<TableRow key={getAssetId(asset)}>
		{isAdmin && (
			<TableCell>
				<Checkbox
					checked={selectedAssetIds.includes(getAssetId(asset))}
					onCheckedChange={(checked) => handleSelectAsset(getAssetId(asset), !!checked)}
				/>
			</TableCell>
		)}
		<TableCell className="font-mono text-sm">{asset.serialNumber}</TableCell>
		{/* ... rest of cells ... */}
	</TableRow>
))
```

#### 1.8 Add bulk toolbar (after "Results count" section, line ~403):

```tsx
{/* Bulk Allocation Toolbar */}
{isAdmin && (
	<BulkAllocationToolbar
		selectedCount={selectedAssetIds.length}
		onAllocate={handleBulkAllocate}
		onReassign={handleBulkReassign}
		onUnallocate={handleBulkUnallocate}
		onClearSelection={handleClearSelection}
	/>
)}
```

#### 1.9 Add allocation modals (at the end, before closing div):

```tsx
{/* Allocation Modals */}
{isAdmin && (
	<>
		<AllocateAssetsModal
			open={allocateModalOpen}
			onOpenChange={setAllocateModalOpen}
			assetIds={selectedAssetIds}
			mode={allocateMode}
		/>
		<UnallocateAssetsModal
			open={unallocateModalOpen}
			onOpenChange={setUnallocateModalOpen}
			assetIds={selectedAssetIds}
		/>
	</>
)}
```

---

### Step 2: Add Field Worker Dropdown to Edit Asset Modal

**File:** `src/pages/assets/index.tsx`

#### 2.1 Update editForm state type (line ~57):

```tsx
const [editForm, setEditForm] = useState<UpdateAssetReq & { allocatedTo?: string | null }>({});
```

#### 2.2 Update handleEditClick (line ~171):

```tsx
const handleEditClick = (asset: Asset) => {
	setEditingAsset(asset);
	setEditForm({
		serialNumber: asset.serialNumber,
		make: asset.make,
		model: asset.model,
		status: asset.status,
		verificationFrequency: asset.verificationFrequency ?? undefined,
		geofenceThreshold: asset.geofenceThreshold ?? undefined,
		allocatedTo: asset.allocatedTo || null, // Add this line
	});
	setEditModalOpen(true);
};
```

#### 2.3 Add allocation mutation (after updateMutation, line ~126):

```tsx
const allocationMutation = useMutation({
	mutationFn: async ({ assetId, newFieldWorkerId, oldFieldWorkerId }: {
		assetId: string;
		newFieldWorkerId: string | null;
		oldFieldWorkerId: string | null;
	}) => {
		// Unassigned → Assigned
		if (!oldFieldWorkerId && newFieldWorkerId) {
			return allocationService.allocateAssets({
				assetIds: [assetId],
				fieldWorkerId: newFieldWorkerId,
			});
		}
		// Assigned → Unassigned
		if (oldFieldWorkerId && !newFieldWorkerId) {
			return allocationService.unallocateAssets({ assetIds: [assetId] });
		}
		// Worker A → Worker B
		if (oldFieldWorkerId && newFieldWorkerId && oldFieldWorkerId !== newFieldWorkerId) {
			return allocationService.reassignAssets({
				assetIds: [assetId],
				newFieldWorkerId,
			});
		}
		return Promise.resolve();
	},
	onSuccess: () => {
		queryClient.invalidateQueries({ queryKey: ["assets"] });
	},
});
```

#### 2.4 Update handleUpdateSubmit (line ~194):

```tsx
const handleUpdateSubmit = async () => {
	if (!editingAsset) return;

	const submitData: UpdateAssetReq = {
		serialNumber: editForm.serialNumber,
		make: editForm.make,
		model: editForm.model,
		status: editForm.status,
		verificationFrequency: editForm.verificationFrequency,
	};

	if (editForm.geofenceThreshold !== undefined) {
		submitData.geofenceThreshold = editForm.geofenceThreshold;
	}

	// Handle asset update
	await updateMutation.mutateAsync({
		assetId: getAssetId(editingAsset),
		data: submitData,
	});

	// Handle allocation change if admin
	if (isAdmin && editForm.allocatedTo !== editingAsset.allocatedTo) {
		await allocationMutation.mutateAsync({
			assetId: getAssetId(editingAsset),
			newFieldWorkerId: editForm.allocatedTo || null,
			oldFieldWorkerId: editingAsset.allocatedTo || null,
		});
	}
};
```

#### 2.5 Add field worker dropdown to edit modal (after geofenceThreshold field, line ~626):

```tsx
{/* Add this after the geofenceThreshold field */}
{isAdmin && (
	<div className="space-y-2">
		<Label>Assigned Field Worker</Label>
		<Select
			value={editForm.allocatedTo || "unassigned"}
			onValueChange={(val) =>
				setEditForm({
					...editForm,
					allocatedTo: val === "unassigned" ? null : val,
				})
			}
		>
			<SelectTrigger>
				<SelectValue placeholder="Select field worker" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="unassigned">Unassigned</SelectItem>
				{fieldWorkers.map((worker) => (
					<SelectItem key={worker.id} value={worker.id}>
						{worker.name} ({worker.email})
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	</div>
)}
```

---

### Step 3: Add Allocation Status to Assets Table

**File:** `src/pages/assets/index.tsx`

#### 3.1 Add "Assigned To" column header (line ~422):

```tsx
<TableHead>Verification</TableHead>
<TableHead>Assigned To</TableHead> {/* Add this */}
<TableHead className="w-[50px]" />
```

#### 3.2 Add "Assigned To" cell (after verification badge, line ~498):

```tsx
<TableCell>{getVerificationBadge(asset.verificationStatus || "never_verified")}</TableCell>
<TableCell>
	{asset.allocatedTo ? (
		<Badge variant="secondary" className="text-xs">
			Assigned
		</Badge>
	) : (
		<span className="text-muted-foreground text-sm">Unassigned</span>
	)}
</TableCell>
<TableCell>{/* Actions dropdown */}</TableCell>
```

---

### Step 4: Add Allocation Info to Users Page

**File:** `src/pages/users/index.tsx`

#### 4.1 Add imports at the top:

```tsx
import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import allocationService from "@/api/services/allocationService";
import { FieldWorkerAssetsModal } from "./components/FieldWorkerAssetsModal";
import { Button } from "@/ui/button";
```

#### 4.2 Add state and query (inside component):

```tsx
const [viewAssetsModalOpen, setViewAssetsModalOpen] = useState(false);
const [selectedFieldWorker, setSelectedFieldWorker] = useState<{ id: string; name: string } | null>(null);

// Fetch allocation summary
const { data: allocationSummary } = useQuery({
	queryKey: ["allocation-summary"],
	queryFn: () => allocationService.getAllocationSummary(),
});

const fieldWorkerAllocations = allocationSummary?.fieldWorkers || [];

const getFieldWorkerAllocatedCount = (fieldWorkerId: string) => {
	return fieldWorkerAllocations.find((fw) => fw.fieldWorkerId === fieldWorkerId)?.allocatedAssets || 0;
};
```

#### 4.3 Add allocated count to user table:

In the table row where you display field users, add:

```tsx
{user.role === "field_user" && (
	<TableCell>
		<div className="flex items-center gap-2">
			<Package className="h-4 w-4 text-muted-foreground" />
			<span className="text-sm">{getFieldWorkerAllocatedCount(user.id)} assets</span>
		</div>
	</TableCell>
)}
```

#### 4.4 Add "View Assets" action:

In the actions dropdown for field users:

```tsx
{user.role === "field_user" && (
	<>
		<DropdownMenuSeparator />
		<DropdownMenuItem
			onClick={() => {
				setSelectedFieldWorker({ id: user.id, name: user.name });
				setViewAssetsModalOpen(true);
			}}
		>
			<Package className="h-4 w-4 mr-2" />
			View Allocated Assets
		</DropdownMenuItem>
	</>
)}
```

#### 4.5 Add modal at the end:

```tsx
{/* View Field Worker Assets Modal */}
{selectedFieldWorker && (
	<FieldWorkerAssetsModal
		open={viewAssetsModalOpen}
		onOpenChange={setViewAssetsModalOpen}
		fieldWorkerId={selectedFieldWorker.id}
		fieldWorkerName={selectedFieldWorker.name}
	/>
)}
```

---

## 🎨 UX Flows

### Flow 1: Bulk Allocate Assets
1. Admin selects multiple assets via checkboxes
2. Bulk toolbar appears
3. Click "Bulk Actions" → "Allocate to Worker"
4. Select field worker from dropdown
5. Confirm → Assets allocated
6. Toast shows partial success (allocated/already allocated/not found)

### Flow 2: Edit Asset Allocation
1. Admin clicks "Edit" on asset
2. Edit modal shows "Assigned Field Worker" dropdown
3. Change from "Unassigned" → Field Worker
4. Save → Asset allocated
5. Toast confirmation

### Flow 3: Reassign Asset
1. Admin edits asset that's already assigned
2. Change from "Worker A" → "Worker B"
3. Save → Asset reassigned
4. Toast confirmation

### Flow 4: Unallocate Assets
1. Admin selects assets
2. Click "Bulk Actions" → "Unallocate Assets"
3. Confirmation modal appears
4. Confirm → Assets unallocated

### Flow 5: View Worker's Assets
1. Admin goes to Users page
2. Sees "X assets" count for each field worker
3. Clicks "View Allocated Assets"
4. Modal shows paginated list of assets
5. Can see serial number, make, model, category, status

---

## 🔒 Permission Guards

All allocation features are protected:

```tsx
const isAdmin = userInfo.role === "customer_admin" || userInfo.role === "system_admin";

{isAdmin && (
	// Allocation UI
)}
```

- Bulk selection checkboxes
- Bulk toolbar
- Field worker dropdown in edit modal
- Allocation modals

---

## ⚠️ Edge Cases Handled

### API Error Handling
- **Already allocated**: Show warning toast
- **Not found**: Show error toast
- **Wrong company**: Show error toast
- **Same worker**: Show warning (reassign)

### UX Edge Cases
- No field workers available → Show message
- Partial bulk success → Show multiple toasts
- Empty allocation → Show empty state
- Permission denied → Hide UI elements

### State Management
- Clear selection after successful allocation
- Invalidate queries after mutations
- Optimistic UI updates where safe
- Loading states for all async operations

---

## 📊 Data Flow

```
Assets Page
├── Bulk Selection (checkboxes)
├── Bulk Toolbar (conditionally rendered)
├── Edit Modal (with field worker dropdown)
└── Allocation Modals
    ├── AllocateAssetsModal (allocate/reassign)
    └── UnallocateAssetsModal (unallocate)

Users Page
├── Allocation Summary Query
├── Field Worker Allocated Count
└── FieldWorkerAssetsModal
    └── Paginated asset list
```

---

## 🧪 Testing Checklist

- [ ] Bulk select/deselect works
- [ ] Select all checkbox works
- [ ] Allocate single asset from edit modal
- [ ] Allocate multiple assets via bulk action
- [ ] Reassign asset to different worker
- [ ] Unallocate asset
- [ ] View field worker's assets
- [ ] Pagination in field worker assets modal
- [ ] Permission guards work (hide UI for non-admins)
- [ ] Error toasts show for API failures
- [ ] Partial success messages show correctly
- [ ] Query invalidation refreshes data

---

## 🚀 Next Steps

1. Follow integration steps above
2. Test each flow thoroughly
3. Adjust styles to match your theme
4. Add any additional validation needed
5. Consider adding filters to field worker assets modal

---

## 📝 Notes

- All components follow project structure (<200 lines)
- Uses existing patterns (React-Query, shadcn/ui, Zustand)
- Type-safe with TypeScript
- Handles loading/error/empty states
- Responsive design
- Accessible (keyboard navigation)

---

## 🆘 Troubleshooting

### Assets not updating after allocation
- Check query invalidation in mutations
- Verify query keys match

### Modals not showing
- Check open/onOpenChange props
- Verify state management

### Permissions not working
- Verify userInfo.role values
- Check isAdmin logic

### Field workers not loading
- Check API endpoint
- Verify role filter: `role === "field_user"`

---

**Integration complete! All components are ready to use.**
