# Super User Portal — Frontend Spec

## Overview

This document describes the four new pages and dashboard changes needed for the super-user portal. All backend support is now implemented. The frontend pages mirror the customer-admin portal but must handle **multi-company data** — every list/table shows an **Organisation** column, and a **Company filter** dropdown is available on each page.

---

## Authentication & Role Context

The super-user has two sub-types. The frontend should read `user.superUserType` from the auth token / user object:

| `superUserType` | Can view | Can mutate |
|----------------|----------|------------|
| `read_only`    | ✅ all four pages | ❌ cannot start/complete/cancel movements, create/update repair requests |
| `read_write`   | ✅ | ✅ |

Wrap any mutation buttons (start movement, cancel, create repair request, update status) in a check:
```js
const canMutate = user.superUserType === 'read_write';
```

---

## Shared Patterns Across All Four Pages

### Company Filter Dropdown

Every page exposes an optional `?companyId=` query param. Build a company selector at the top of each page:

```
[ All Companies ▼ ]   →  fires requests without ?companyId
[ Acme Corp      ▼ ]  →  fires requests with ?companyId=<id>
```

- Populate the dropdown from `GET /api/v1/companies` (already implemented, returns only assigned companies for super_user).
- Default: **All Companies** (no companyId param).
- When a company is selected, append `?companyId=<id>` to all data requests on that page.

### Organisation Column

Every table on the four pages must include an **Organisation** column. The backend now includes `companyId` and `companyName` on every record. Display `companyName`.

- When **All Companies** is selected: show the Organisation column.
- When a **specific company** is selected: the column can be hidden (all rows will have the same value).

### API Error Handling

- **403 Forbidden** on mutation endpoints: show a toast `"Read-only super users cannot perform this action"`.
- **403 Forbidden** on company filter: show a toast `"Company not in your assigned list"`.

---

## 1. Asset Movements Page

**Route (suggested):** `/super-user/asset-movements`

### Fetch list

```
GET /api/v1/asset-movements
```

| Query param | Type | Notes |
|-------------|------|-------|
| `companyId` | string | Optional. Scopes to one assigned company. |
| `page` | number | default 1 |
| `limit` | number | default 10 |
| `sortBy` | string | e.g. `createdAt:desc` |
| `status` | string | `pending` \| `in_progress` \| `completed` \| `cancelled` |
| `destinationType` | string | `warehouse` \| `client_location` |
| `fromDate` | ISO string | |
| `toDate` | ISO string | |
| `search` | string | |

### Response shape (each record now includes)

```json
{
  "companyId": "64abc...",
  "companyName": "Acme Corp",
  // ...all existing fields
}
```

### Mutation endpoints (read_write only)

```
PATCH /api/v1/asset-movements/:movementId/start     → start movement
PATCH /api/v1/asset-movements/:movementId/complete  → complete movement
DELETE /api/v1/asset-movements/:movementId           → cancel movement
```

- All return `403` if the caller is a `read_only` super user — show a permission toast.
- All return `403` if the movement's company is not in the super user's assigned list.

### UI Notes

- Show the **Organisation** column in the table.
- Disable / hide start/complete/cancel buttons when `user.superUserType === 'read_only'`.
- The create movement flow (`POST /api/v1/asset-movements`) is for customer admins only. Do **not** show a "Create Movement" button on the super-user portal.

---

## 2. Verification Report Page

**Route (suggested):** `/super-user/reports`

### Fetch report

```
GET /api/v1/reports/verifications
```

| Query param | Type | Notes |
|-------------|------|-------|
| `companyId` | string | Optional |
| `page` | number | |
| `limit` | number | default 20 |
| `status` | string | `on_time` \| `due_soon` \| `overdue` |
| `gpsCheckPassed` | boolean | |
| `condition` | string | `good` \| `fair` \| `poor` |
| `operationalStatus` | string | `operational` \| `needs_repair` \| `non_operational` |
| `categoryId` | string | |
| `startDate` | ISO string | |
| `endDate` | ISO string | |
| `search` | string | serial number, make, model, site |

### Response shape (each record now includes)

```json
{
  "companyId": "64abc...",
  "companyName": "Acme Corp",
  // ...all existing fields
}
```

### Fleet summary (top of response)

The `fleetSummary` block aggregates across **all assigned companies** when no `companyId` filter is applied, or scopes to one company when filtered.

```json
{
  "fleetSummary": {
    "totalVerifiedAssets": 210,
    "condition": { "good": 120, "fair": 60, "poor": 30 },
    "operationalStatus": { "operational": 160, "needsRepair": 30, "nonOperational": 20 }
  }
}
```

### Export

```
GET /api/v1/reports/export?format=xlsx&reportType=verifications&companyId=...
GET /api/v1/reports/export?format=pdf&reportType=verifications&companyId=...
```

The exported file now includes a **Company / Organisation** column when multiple companies are in scope.

---

## 3. Asset Map Page

**Route (suggested):** `/super-user/map`

### Fetch map pins

```
GET /api/v1/assets/map-locations
```

| Query param | Type | Notes |
|-------------|------|-------|
| `companyId` | string | Optional — filter to one assigned company |
| `status` | string | `on_time` \| `due_soon` \| `overdue` \| `never_verified` |

> **Note:** The `tenantContext` middleware handles company scoping. Pass `companyId` in the query string to filter to one company.

### Response shape (each record now includes)

```json
{
  "assetId": "...",
  "companyId": "64abc...",
  "companyName": "Acme Corp",
  "serialNumber": "SN-001",
  "make": "Caterpillar",
  "model": "D8",
  "siteName": "Site A",
  "category": "Heavy Equipment",
  "location": { "latitude": -26.2, "longitude": 28.0 },
  "status": "on_time",
  "lastVerified": "2025-03-01T...",
  "registeredAt": "2025-01-15T...",
  "nextDue": "2025-06-01T..."
}
```

### UI Notes

- Show a map with pins colour-coded by `status`.
- In the info popup for each pin, show **Organisation** (`companyName`).
- Provide a filter panel: Company dropdown + Status filter chips.

---

## 4. Repair Requests Page

**Route (suggested):** `/super-user/repair-requests`

### Fetch list

```
GET /api/v1/repair-requests
```

| Query param | Type | Notes |
|-------------|------|-------|
| `companyId` | string | Optional |
| `page` | number | default 1 |
| `limit` | number | default 20 |
| `sortBy` | string | e.g. `createdAt:desc` |
| `search` | string | debounced |
| `source` | string | `field_worker` \| `customer_admin` |
| `status` | string | `open` \| `acknowledged` \| `resolved` |
| `startDate` | ISO string | |
| `endDate` | ISO string | |

### Response shape (each record now includes)

```json
{
  "companyId": "64abc...",
  "companyName": "Acme Corp",
  // ...all existing fields
}
```

### Mutation endpoints (read_write only)

```
POST  /api/v1/repair-requests/assets/:assetId          → create repair request
PATCH /api/v1/repair-requests/:requestId/status        → update status
```

Both return `403` for `read_only` super users.

### Export

```
GET /api/v1/repair-requests/export?format=xlsx&companyId=...
GET /api/v1/repair-requests/export?format=pdf&companyId=...
```

| Query param | Type | Notes |
|-------------|------|-------|
| `companyId` | string | Optional — scope to one company |
| `format` | string | `xlsx` \| `pdf` |
| `startDate` | ISO string | |
| `endDate` | ISO string | |
| `status` | string | |
| `source` | string | |
| `categoryName` | string | |

The exported file includes an **Organisation** column when multiple companies are in scope.

### UI Notes

- Show Organisation column in the table.
- Disable / hide "Create Repair Request" and status-update buttons for `read_only` super users.

---

## 5. Dashboard Changes

**Endpoint:** `GET /api/v1/dashboard`

The backend now returns data **scoped to the super user's assigned companies**. No frontend changes are required — the response shape is identical to before; only the values are now scoped.

### Response shape (unchanged)

```json
{
  "success": true,
  "stats": {
    "totalCompanies": 3,
    "totalUsers": 47,
    "totalAssets": 210,
    "totalQRCodes": 0
  },
  "recentCompanies": [
    {
      "_id": "64abc...",
      "companyName": "Acme Corp",
      "contactEmail": "admin@acme.com",
      "createdAt": "2025-03-10T...",
      "totalUsers": 12
    }
  ]
}
```

### What changed

| Stat card | Was (wrong) | Now (correct) |
|-----------|-------------|---------------|
| Total Companies | Platform-wide count | Only assigned companies |
| Total Users | Platform-wide count | Only users in assigned companies (`customer_admin` + `field_user` roles) |
| Total Assets | Platform-wide count | Only assets in assigned companies |
| Total QR Codes | Platform-wide count | `0` (not shown on super-user dashboard) |
| Recent Companies | Most recently created platform-wide | Only from assigned companies |

---

## Permission Guard Summary

Implement a `SuperUserGuard` component / helper that checks `user.superUserType` before rendering mutation controls:

```jsx
// Example React guard
const canMutate = user.role === 'super_user' && user.superUserType === 'read_write';
```

| Element | Show condition |
|---------|---------------|
| Start / Complete / Cancel movement buttons | `canMutate` |
| Create Repair Request button | `canMutate` |
| Update Repair Request status | `canMutate` |
| All read-only views (tables, map, export) | Always shown |

---

## API Quick Reference

| Page | Endpoint | Method |
|------|----------|--------|
| Dashboard | `/api/v1/dashboard` | GET |
| Asset Movements (list) | `/api/v1/asset-movements?companyId=&status=&page=&limit=` | GET |
| Asset Movements (start) | `/api/v1/asset-movements/:id/start` | PATCH |
| Asset Movements (complete) | `/api/v1/asset-movements/:id/complete` | PATCH |
| Asset Movements (cancel) | `/api/v1/asset-movements/:id` | DELETE |
| Verification Report | `/api/v1/reports/verifications?companyId=&status=&page=` | GET |
| Report Export | `/api/v1/reports/export?companyId=&format=xlsx&reportType=verifications` | GET |
| Asset Map | `/api/v1/assets/map-locations?companyId=&status=` | GET |
| Repair Requests (list) | `/api/v1/repair-requests?companyId=&status=&page=` | GET |
| Repair Requests (export) | `/api/v1/repair-requests/export?companyId=&format=xlsx` | GET |
| Repair Requests (create) | `/api/v1/repair-requests/assets/:assetId` | POST |
| Repair Requests (update status) | `/api/v1/repair-requests/:id/status` | PATCH |
| Companies list (for filter dropdown) | `/api/v1/companies` | GET |
