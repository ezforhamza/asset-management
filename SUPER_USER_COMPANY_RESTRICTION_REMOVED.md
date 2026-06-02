# Super User — Company Assignment Restriction Removed

## What Changed & Why

The original spec enforced a **one read_only + one read_write super user per company** rule.
The client clarified this was a misunderstood requirement — they want no system-level restriction.
Multiple support team members of any type can now be assigned to the same company.
Headcount per company is tracked manually by the system admin.

---

## Backend Changes (already deployed)

| File | What changed |
|------|-------------|
| `src/services/superUserCompanyAccess.service.js` | `assignCompany()` — removed the cross-user type conflict check entirely. `getAvailableCompanies()` — no longer accepts `superUserType`; now only filters out companies already assigned to the specific super user being edited |
| `src/controllers/company.controller.js` | `getAvailableCompaniesForSuperUser` — dropped `superUserType` param; no longer validates or uses it |
| `src/validations/company.validation.js` | `availableForSuperUser` query schema — `superUserType` field removed |

**Only rule that remains:** A single super user cannot be assigned the same company twice (duplicate assignment guard is still in place).

---

## Frontend Changes Required

### 1. `GET /companies/available-for-super-user` — Remove `superUserType` param

**Before:**
```
GET /api/v1/companies/available-for-super-user?superUserType=read_only&excludeSuperUserId=64abc...
```

**After:**
```
GET /api/v1/companies/available-for-super-user?excludeSuperUserId=64abc...
```

- Drop `superUserType` from the query string everywhere this endpoint is called.
- `excludeSuperUserId` remains — pass it when managing an existing super user so their already-assigned companies are excluded from the picker (prevents re-adding the same company).
- When creating a new super user (no existing user yet), call with no params: `GET /api/v1/companies/available-for-super-user` — returns all companies.

> Note: Joi strips unknown fields on the backend, so sending `superUserType` won't cause a 400 error — but remove it anyway to keep the frontend clean.

---

### 2. Create Super User Modal — Step 2 (Assign Companies)

**Before:** The company multi-select filtered companies based on `superUserType`. Companies "taken" by another super user of the same type were hidden or shown as unavailable/greyed out.

**After:**
- Show **all companies** in the list — no type-based filtering.
- No "unavailable" state, no greyed-out rows, no "already taken" tooltip.
- The only companies excluded from the picker are ones **already assigned to this specific super user** (handled by `excludeSuperUserId`).
- Remove any UI label or note that said "companies already taken by another support team member of this type are not shown."

---

### 3. "Manage Companies" Modal (on existing super user row)

**Before:** Same type-based filtering applied when adding a new company to an existing super user.

**After:**
- Call `GET /api/v1/companies/available-for-super-user?excludeSuperUserId=<thisUserId>` — returns all companies except those already assigned to this user.
- No type restriction UI. No "taken by another read_only/read_write" message.
- The table of current assignments and the add-company dropdown remain the same — just remove any type-conflict logic.

---

### 4. "Create Counterpart / Derive User" Flow

**Before:** The spec said companies already taken by another super user of the **target type** were excluded from the pre-checked list.

**After:**
- When opening Step 2 for the derived user, pre-check the source user's companies as before.
- But do **not** filter out any companies based on type. All of the source user's companies should appear as pre-checked (subject only to the normal `excludeSuperUserId` filter — which for a brand-new user will be empty, so all companies show).
- Remove any logic that was hiding companies due to type conflicts.

---

### 5. Super Users List Table — Type Badge (no change needed)

The `Type` column (Read-Only / Read-Write badge) stays as-is — `superUserType` is still stored on the user and still controls permissions. This change only affects company assignment, not the type system itself.

---

## What Did NOT Change

- `superUserType` (`read_only` / `read_write`) still exists on every super user and still controls their permissions (view-only vs. edit + GPS correction).
- The `excludeSuperUserId` param on the available-companies endpoint still works — use it whenever managing an existing user's assignments.
- All other APIs (assign, remove, list assigned) are unchanged.
- A super user still only sees companies assigned to them after login — company access scoping is unchanged.
