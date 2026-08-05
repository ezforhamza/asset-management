# Super User Portal — Backend Spec for New Pages

## Context

The super-user / support-team portal already exists with these pages (fully implemented):
- Companies list (`/super-user/dashboard`)
- Company assets list (`/super-user/companies/:companyId/assets`)
- Asset detail + verification history
- Profile page

**What we're adding now:**
Four new pages mirroring the customer-admin portal:
1. Asset Movements
2. Reports (Verification Report)
3. Map / Asset Map
4. Repair Requests

### How super-user scoping works (already established)
- Every super user has a list of assigned companies stored in `SuperUserCompanyAccess` collection.
- Existing endpoints (`GET /companies`, `GET /assets`, etc.) already check `req.user.role === 'super_user'` and filter results to assigned companies only.
- The same pattern must be applied to all four endpoints below.

### Key rule for all new endpoints
When the caller is a `super_user`:
- **No `companyId` param** → return data for **all assigned companies**, sorted by `createdAt` descending by default.
- **With `companyId` param** → filter to that company only, but first verify the company is in the super user's assigned list (return `403` if not).
- Every response record must include `companyId` and `companyName` so the frontend can display the organisation column.

When the caller is a `customer_admin`:
- Behavior is unchanged — scoped to their own company. `companyId` param is ignored (or can be accepted but only their own companyId is valid).

---

## 1. Asset Movements

### Existing endpoint (customer admin)
`GET /api/v1/asset-movements`

Current behavior: returns movements for the logged-in customer admin's company only.

Query params currently supported:
| Param | Type | Notes |
|-------|------|-------|
| `page` | number | default 1 |
| `limit` | number | default 10 |
| `sortBy` | string | e.g. `createdAt:desc` |
| `status` | string | `pending` \| `in_progress` \| `completed` \| `cancelled` |
| `destinationType` | string | `warehouse` \| `client_location` |
| `fromDate` | ISO string | filter by `createdAt` from |
| `toDate` | ISO string | filter by `createdAt` to |

### Changes required

**Add super-user scoping to `GET /api/v1/asset-movements`:**
1. When `req.user.role === 'super_user'`:
   - Fetch assigned company IDs from `SuperUserCompanyAccess` for this user.
   - Add a `companyId: { $in: assignedCompanyIds }` filter to the query.
   - If optional `companyId` query param is provided, verify it's in the assigned list and scope to that single company.
2. Add `companyId` and `companyName` to each record in the response.

**New query param to add (for both roles but primarily used by super user):**
| Param | Type | Notes |
|-------|------|-------|
| `companyId` | string | optional — filter to a specific company |

**Updated response shape (add these fields to each movement object):**
```json
{
  "companyId": "64abc...",
  "companyName": "Acme Corp",
  // ...all existing fields unchanged
}
```

**Other movement endpoints** (`PATCH /:id/start`, `PATCH /:id/complete`, `DELETE /:id`):
- Verify the movement's company is in the super user's assigned list before allowing access (return `403` otherwise).
- A `read_only` super user should NOT be able to start/complete/cancel movements — return `403`. Only `read_write` super users (and customer admins) can mutate movement status.

---

## 2. Reports — Verification Report

### Existing endpoints (customer admin)
- `GET /api/v1/reports/verifications` — verification report data
- `GET /api/v1/reports/export` — export as PDF/Excel

Current behavior: both scoped to customer admin's company.

Query params currently supported for `GET /api/v1/reports/verifications`:
| Param | Type | Notes |
|-------|------|-------|
| `page` | number | default 1 |
| `limit` | number | default 20 |
| `status` | string | verification status filter |
| `gpsCheckPassed` | boolean | |
| `condition` | string | `good` \| `fair` \| `poor` |
| `operationalStatus` | string | `operational` \| `needsRepair` \| `nonOperational` |
| `categoryId` | string | filter by asset category |
| `startDate` | ISO string | filter on `nextVerificationDue` |
| `endDate` | ISO string | filter on `nextVerificationDue` |
| `search` | string | serial number, make, model, site name |

Query params for `GET /api/v1/reports/export`:
| Param | Type | Notes |
|-------|------|-------|
| `format` | string | `xlsx` \| `pdf` |
| `reportType` | string | e.g. `verifications` |
| `startDate` | ISO string | |
| `endDate` | ISO string | |
| `status` | string | |

### Changes required

**`GET /api/v1/reports/verifications`:**
1. When `req.user.role === 'super_user'`: scope to assigned companies.
2. Accept optional `companyId` param — validate it's in assigned list.
3. Add `companyId` and `companyName` to each record.

**`GET /api/v1/reports/export`:**
1. Same scoping logic as above.
2. Accept optional `companyId` param.
3. Exported file should include a "Company" / "Organisation" column.

**New query param to add to both:**
| Param | Type | Notes |
|-------|------|-------|
| `companyId` | string | optional — filter to specific company |

**Updated response shape for `GET /api/v1/reports/verifications` (add to each asset record):**
```json
{
  "companyId": "64abc...",
  "companyName": "Acme Corp",
  // ...all existing fields unchanged
}
```

**Fleet summary / stats at top of response:**
When no `companyId` filter is applied (all companies), the summary stats should aggregate across all assigned companies. When filtered to one company, stats are for that company only.

---

## 3. Map / Asset Map

### Existing endpoint (customer admin)
`GET /api/v1/assets/map-locations`

Current behavior: returns all assets with GPS coordinates for the customer admin's company.

No query params currently (returns everything).

Response shape per asset (current):
```json
{
  "assetId": "...",
  "serialNumber": "...",
  "makeModel": "...",
  "category": "...",
  "siteName": "...",
  "location": { "latitude": -26.2, "longitude": 28.0 },
  "status": "on_time" | "due_soon" | "overdue" | "never_verified",
  "lastVerified": "...",
  "registeredAt": "...",
  "nextVerificationDue": "..."
}
```

### Changes required

**`GET /api/v1/assets/map-locations`:**
1. When `req.user.role === 'super_user'`: scope to assigned companies.
2. Accept optional `companyId` param — validate it's in assigned list.
3. Add `companyId` and `companyName` to each record.

**New query params to add:**
| Param | Type | Notes |
|-------|------|-------|
| `companyId` | string | optional — filter to specific company |
| `status` | string | optional — `on_time` \| `due_soon` \| `overdue` \| `never_verified` |

**Updated response shape (add to each record):**
```json
{
  "companyId": "64abc...",
  "companyName": "Acme Corp",
  // ...all existing fields unchanged
}
```

---

## 4. Repair Requests

### Existing endpoints (customer admin)
- `GET /api/v1/repair-requests` — list
- `GET /api/v1/repair-requests/export` — export PDF/Excel
- `POST /api/v1/repair-requests/assets/:assetId` — create (not needed for read_only super user)
- `PATCH /api/v1/repair-requests/:id/status` — update status (not needed for read_only super user)

Current behavior: all scoped to customer admin's company.

Query params currently supported for `GET /api/v1/repair-requests`:
| Param | Type | Notes |
|-------|------|-------|
| `page` | number | default 1 |
| `limit` | number | default 20 |
| `sortBy` | string | e.g. `createdAt:desc` |
| `search` | string | debounced search |
| `source` | string | `field_worker` \| `customer_admin` |
| `status` | string | `open` \| `acknowledged` \| `resolved` |
| `startDate` | ISO string | defaults to first of current month |
| `endDate` | ISO string | defaults to today |

Query params for export:
| Param | Type | Notes |
|-------|------|-------|
| `format` | string | `xlsx` \| `pdf` |
| `startDate` | ISO string | |
| `endDate` | ISO string | |
| `status` | string | |
| `source` | string | |
| `categoryName` | string | |

### Changes required

**`GET /api/v1/repair-requests`:**
1. When `req.user.role === 'super_user'`: scope to assigned companies.
2. Accept optional `companyId` param — validate it's in assigned list.
3. Add `companyId` and `companyName` to each record.

**`GET /api/v1/repair-requests/export`:**
1. Same scoping logic.
2. Accept optional `companyId` param.
3. Exported file should include a "Company" / "Organisation" column.

**New query param to add to both:**
| Param | Type | Notes |
|-------|------|-------|
| `companyId` | string | optional — filter to specific company |

**`POST /api/v1/repair-requests/assets/:assetId`** (create):
- `read_only` super users → `403`.
- `read_write` super users → allowed only if the asset's company is in their assigned list.

**`PATCH /api/v1/repair-requests/:id/status`** (update):
- Same rule: `read_only` → `403`; `read_write` → allowed if company is assigned.

**Updated response shape (add to each record):**
```json
{
  "companyId": "64abc...",
  "companyName": "Acme Corp",
  // ...all existing fields unchanged
}
```

---

## Permission Summary

| Action | read_only super user | read_write super user | customer_admin |
|--------|---------------------|-----------------------|----------------|
| View asset movements | ✅ | ✅ | ✅ (own company) |
| Start / complete / cancel movement | ❌ | ✅ (assigned companies) | ✅ |
| View reports | ✅ | ✅ | ✅ (own company) |
| Export reports | ✅ | ✅ | ✅ (own company) |
| View map locations | ✅ | ✅ | ✅ (own company) |
| View repair requests | ✅ | ✅ | ✅ (own company) |
| Export repair requests | ✅ | ✅ | ✅ (own company) |
| Create repair request | ❌ | ✅ (assigned companies) | ✅ |
| Update repair request status | ❌ | ✅ (assigned companies) | ✅ |

---

## Middleware / Helper Pattern

All four feature areas follow the same pattern. Recommend creating a shared helper:

```js
// src/utils/superUserScope.js (example)

async function resolveScopeFilter(req) {
  if (req.user.role !== 'super_user') return null; // customer_admin: no extra filter needed

  const assignedIds = await SuperUserCompanyAccess
    .find({ superUserId: req.user._id })
    .distinct('companyId');

  if (req.query.companyId) {
    const id = req.query.companyId;
    if (!assignedIds.map(String).includes(String(id))) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Company not in your assigned list');
    }
    return { companyId: id };
  }

  return { companyId: { $in: assignedIds } };
}
```

Apply `scopeFilter` as an additional `$match` in each service query when the caller is a super user.

---

## Validation Schema Changes

For each affected endpoint, add `companyId` as an optional string to the Joi query validation schema:

```js
companyId: Joi.string().optional(),
```

---

## No New Collections / Models Needed

All required data already exists:
- `SuperUserCompanyAccess` — already tracks assigned companies.
- `AssetMovement`, `RepairRequest`, `Asset`, `Verification` — all already have a `companyId` field.

No schema migrations are needed — only service-layer query logic changes.

---

## Summary of Files to Modify

| File | What to change |
|------|---------------|
| `src/services/assetMovement.service.js` | Add super-user scoping + `companyId` filter |
| `src/services/report.service.js` | Add super-user scoping + `companyId` filter to verifications + map-locations queries |
| `src/services/repairRequest.service.js` | Add super-user scoping + `companyId` filter |
| `src/controllers/assetMovement.controller.js` | Pass scope filter, enforce read_only restrictions on mutating actions |
| `src/controllers/report.controller.js` | Pass scope filter |
| `src/controllers/repairRequest.controller.js` | Pass scope filter, enforce read_only restrictions |
| `src/validations/assetMovement.validation.js` | Add optional `companyId` to query schemas |
| `src/validations/report.validation.js` | Add optional `companyId` to query schemas |
| `src/validations/repairRequest.validation.js` | Add optional `companyId` to query schemas |
| `src/config/roles.js` | Confirm `super_user_read_only` and `super_user_read_write` include permissions for viewing movements, reports, map, and repair requests |

---

## 5. Super User Dashboard Stats (Scoped to Assigned Companies)

### Background

Both the system-admin and the super-user dashboard currently call the **same endpoint**:

`GET /api/v1/dashboard`

The system-admin version returns **platform-wide** totals and a recent-companies list from all companies in the system.

The super-user version currently returns the **same platform-wide data** — this is wrong. The client wants the super-user dashboard to show numbers and company lists scoped **only to the companies assigned to that super user**.

> **Do NOT change anything for the system-admin dashboard.** The fix is purely a role-based branch inside the existing endpoint.

---

### What the super-user dashboard displays (frontend — already built)

The frontend renders these four fields from the API response:

| UI card | Field | Current (wrong) | Required |
|---------|-------|-----------------|----------|
| Total Companies | `stats.totalCompanies` | All companies in the system | Only companies assigned to this super user |
| Total Users | `stats.totalUsers` | All users across the whole platform | Only users belonging to assigned companies |
| Total Assets | `stats.totalAssets` | All assets across the whole platform | Only assets belonging to assigned companies |
| Recent Companies list | `recentCompanies[]` | Most recently created companies system-wide | Only companies from the super user's assigned list, sorted by most recently assigned or most recently created |

> `totalQRCodes` is shown on the admin dashboard but **not** on the super-user dashboard — no change needed there.

---

### Required change to `GET /api/v1/dashboard`

When `req.user.role === 'super_user'`:

1. **Fetch assigned company IDs** from `SuperUserCompanyAccess` for `req.user._id`.
2. **`stats.totalCompanies`** = count of companies in the assigned list (i.e. `assignedCompanyIds.length`).
3. **`stats.totalUsers`** = count of `User` documents where `companyId` is in `assignedCompanyIds` (exclude other super users and system admin — count only `customer_admin` and `field_user` roles).
4. **`stats.totalAssets`** = count of `Asset` documents where `companyId` is in `assignedCompanyIds`.
5. **`recentCompanies`** = `Company` documents whose `_id` is in `assignedCompanyIds`, sorted by `createdAt` descending, limited to the same count used for admin (e.g. 5 or 10 — match whatever the admin endpoint returns). Each item must include: `_id`, `companyName`, `contactEmail`, `createdAt`, `totalUsers` (user count for that company).

When `req.user.role === 'system_admin'`: **no change** — return platform-wide totals as before.

---

### Response shape (unchanged — same structure, different data)

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

The frontend already consumes exactly this shape — **no frontend changes needed** once the backend scopes the data correctly.

`totalQRCodes` can be returned as `0` (or omitted) for super users since the frontend doesn't render it.

---

### Files to modify for dashboard

| File | What to change |
|------|---------------|
| `src/services/dashboard.service.js` (or equivalent) | Add role branch: when `super_user`, compute all four values scoped to assigned companies |
| `src/controllers/dashboard.controller.js` (or equivalent) | Pass `req.user` into the service so it can apply the role branch |
