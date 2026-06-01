# Super User Feature — Frontend Specification

---

## Implementation Status

| Section | Backend | Frontend |
|---------|---------|----------|
| GPS Lat/Long Correction | ✅ Implemented | ✅ Implemented |
| System Admin — Super User Management Page | ✅ Implemented | ✅ Implemented |
| Notification Assignment | ✅ Implemented | ✅ Implemented |
| Super User Portal (all 3 pages + global search) | ✅ Implemented | ✅ Implemented |
| Super User Profile Page | ✅ Implemented | ✅ Implemented |
| **Super User Type (read_only / read_write)** | ✅ Implemented | ✅ Implemented |
| **Company Access Control (per-super-user scoping)** | ✅ Implemented | ✅ Implemented |
| **Create Counterpart / Derive User** | ✅ Implemented (frontend-only feature, no backend changes needed) | ✅ Implemented |

---

## Background & Context

Asset Guard is a multi-tenant SaaS platform. Each client company has their own isolated data — assets, verifications, QR codes, and users. The system currently has three roles:

- **System Admin** — the platform owner (one hardcoded account). Manages all companies, allocates QR codes, and oversees the whole platform.
- **Customer Admin** — the client's own admin. Manages their company's assets, users, and settings.
- **Field User** — the client's field workers who scan QR codes and submit verifications.

**The Problem:**
The platform owner's support team needs to be able to view any client's assets and verification history to offer customer support. Currently there is no way to do this without logging into the system admin account (which is shared, has too many privileges, and doesn't show the right view for support purposes) or asking the client to create a read-only account and share credentials.

**The Solution:**
Two features have been added to address client requests:

1. **Super User Role** — A new user type created exclusively by the system admin. Super users each have their own login and can view assigned companies' assets and verifications to offer support. They do **not** have access to QR code management or any system admin functions.

2. **GPS Lat/Long Correction** — A new option for admins and super users to fix an asset's registered GPS coordinates without losing any existing verification history, photos, or registration data.

---

## Important: Super User Has Its Own Separate Portal

Super users log into a **completely separate portal** from both the system admin panel and the customer admin panel. After login, detect `role === "super_user"` from the JWT and route them to `/super-user/` routes. They should never see the admin or customer panel — show a 403 if they try to navigate there.

---

## NEW: Super User Types

> **Added in v2 after client feedback. Backend fully implemented.**

When creating a super user, the system admin must choose the super user's **type**. There are two types:

### `read_only`
- Can view the companies' assets list and verification history.
- **Cannot** edit any asset fields or correct GPS coordinates.
- Default / support-tier access.

### `read_write`
- Can view everything `read_only` can.
- Additionally allowed two write actions per asset:
  1. **Edit Asset** — update asset fields (make, model, condition, notes, etc.)
  2. **GPS Correction** — correct the asset's registered lat/long coordinates.

The `superUserType` field is stored on the user record. The type drives the permissions the JWT holder receives — there are no other functional differences.

**Backend implementation:**
- `superUserType: 'read_only' | 'read_write'` field added to User model.
- `roles.js` defines two permission sets — `super_user_read_only` and `super_user_read_write` — resolved at auth time from `user.superUserType`.
- `read_only` super users do **not** have `updateAssetLocation` or `manageAssets` permissions.
- `read_write` super users have both `updateAssetLocation` and `manageAssets`.

**Frontend changes needed:**
- Add a "Type" radio/select (Read-Only / Read-Write) to the Create Super User modal (Step 1).
- Display the type as a badge in the Super Users list table.
- In the super user portal, conditionally show "Edit Asset" and "Correct GPS" buttons only when `user.superUserType === 'read_write'` (read from JWT or profile response).

---

## NEW: Company Access Control

> **Added in v2 after client feedback. Backend fully implemented.**

Super users are **no longer allowed to see all companies by default**. The system admin must explicitly assign which companies each super user can access. A super user with no companies assigned sees an empty dashboard.

### Uniqueness Constraint

Per company:
- At most **one** `read_only` super user may be assigned.
- At most **one** `read_write` super user may be assigned.
- But a company **can** have both a `read_only` and a `read_write` super user simultaneously.

When the admin opens the company picker for a new assignment, companies already taken by another super user of the **same type** are excluded from the dropdown. Companies only held by the opposite type still appear.

### UX Flow

**During super user creation (Step 2 of create modal):**
After the super user is created (Step 1), show a second step titled "Assign Companies". The admin selects from available companies (filtered by type). This step can be skipped — companies can be assigned later from the "Manage Companies" action on the super users list.

**After creation — "Manage Companies" action:**
Each super user row has a "Manage Companies" action. Clicking it opens a modal showing:
- Current company assignments (table: Company Name | Actions)
- "Add Company" form at the bottom: company dropdown (filtered) + Add button

### APIs

**Get assigned companies for a super user**
`GET /api/v1/users/:userId/company-assignments`

Response:
```json
{
  "assignments": [
    {
      "assignmentId": "...",
      "companyId": "64abc...",
      "companyName": "Acme Corp",
      "isActive": true,
      "contactEmail": "admin@acme.com",
      "assignedAt": "2026-01-15T..."
    }
  ]
}
```

**Add company assignment (single)**
`POST /api/v1/users/:userId/company-assignments`
```json
{ "companyId": "64abc..." }
```

**Add company assignments (bulk — used during creation Step 2)**
`POST /api/v1/users/:userId/company-assignments`
```json
{ "companyIds": ["64abc...", "64def..."] }
```
Response includes `assigned` and `errors` arrays so partial success is handled gracefully.

**Remove company assignment**
`DELETE /api/v1/users/:userId/company-assignments/:companyId`

**Get available companies for a super user type (for the dropdown)**
`GET /api/v1/companies/available-for-super-user?superUserType=read_only`

Optional: `&excludeSuperUserId=<id>` — pass the super user being edited so their own current companies reappear in the list (allows editing existing assignments without "company already taken" false positives).

Response:
```json
{
  "companies": [
    {
      "_id": "64abc...",
      "companyName": "Beta Ltd",
      "isActive": true,
      "contactEmail": "admin@beta.com",
      "createdAt": "..."
    }
  ],
  "total": 1
}
```

**Effect on existing endpoints:**
- `GET /api/v1/companies` — for super users, now returns **only assigned companies** (server-side filtered).
- `GET /api/v1/companies/:companyId` — 403 if the company is not in the super user's assignment list.
- `GET /api/v1/assets` — filtered to assigned companies automatically.
- `GET /api/v1/assets/:assetId` — 403 if the asset's company is not assigned.

---

## 1. GPS Lat/Long Correction ✅

### Who can use it
- `customer_admin` (full access only — read_only admins cannot write)
- `super_user` with `superUserType === 'read_write'`
- `system_admin`

### Where it appears in the UI
- **Customer Admin portal** → Assets list page → action button per asset row ("Correct GPS")
- **Super User portal** → Company assets page → same action button per asset row (**only for read_write super users**)

### UX Behaviour
When admin clicks "Correct GPS" on an asset, open a modal with:
- Current coordinates shown (read-only display): `Lat: -26.2041 | Long: 28.0473`
- Latitude input field (number, -90 to 90, required)
- Longitude input field (number, -180 to 180, required)
- Optionally: a map picker where admin drops a pin (recommended for accuracy)
- Confirm button

On save, only the lat/long reference point changes. Everything else — verification history, photos, QR code link, registered by, registered at — stays completely intact. All future verifications will now check GPS proximity against the corrected coordinates.

### API

**`PATCH /api/v1/assets/:assetId/location`**

Headers: `Authorization: Bearer <token>`

Request body:
```json
{
  "location": {
    "latitude": -26.2041,
    "longitude": 28.0473
  },
  "locationAccuracy": 5
}
```
`locationAccuracy` is optional (GPS reading accuracy in meters).

Success response `200`:
```json
{
  "message": "Asset location updated successfully",
  "asset": { "...full asset object with updated location..." }
}
```

---

## 2. System Admin — Super User Management Page ✅

### Where it lives
A new page inside the existing system admin panel. Navigation item: **"Support Team"** or **"Super Users"**.

Suggested route: `/admin/super-users`

### Page: Super Users List

Displays all super users created by the system admin.

**Table columns:**
| Column | Notes |
|--------|-------|
| Name | Full name |
| Email | Login email |
| Type | **New** — Read-Only / Read-Write badge |
| Status | Green badge = Active, Red badge = Inactive |
| Created At | Date |
| Last Login | Date + time, or "Never" if not yet logged in |
| Actions | See below |

**Actions per row:**
- **Change Password** — triggers a password reset; generates a new temporary password and emails it to the super user. Show the temporary password to the system admin in a modal once (it won't be shown again).
- **Deactivate** / **Activate** — toggles the account on/off.
- **Manage Companies** — **New** — opens the company assignment modal (see Company Access Control section above).
- **Notifications** — opens the notification assignment modal (see Section 3).
- **Delete** — permanently deletes the account. Show a confirmation dialog first.

**"Create Super User" button** at the top of the page → opens a two-step modal.

### "Derive User" Action (Create Counterpart)

Each row in the super users table has a "..." actions menu. One of the options is **"Create Counterpart"** (also called "Derive User").

**Purpose:** When you already have a `read_write` super user covering 5 companies, and you want to create a `read_only` user with the same (or similar) company access, this shortcut pre-fills the form for you rather than starting from scratch.

**Behaviour:**
1. Admin clicks "..." → "Create Counterpart" on an existing super user row.
2. The Create Super User modal opens — Step 1 is completely blank (name, email, password must be filled fresh — the new user is a different person).
3. The **Type** radio is automatically set to the **opposite type** of the source user (`read_write` → `read_only`, and vice versa).
4. In **Step 2 (Assign Companies)**, the companies that the source user is assigned to are **pre-checked** in the company multi-select, as a convenience starting point.
5. The admin can check/uncheck any company. The availability filter still applies — companies already taken by another super user of the target type are excluded (not shown).
6. Admin clicks **Finish** to save the assignments.

**Important UX notes:**
- Pre-checked companies are suggestions only. The admin must still click Finish to confirm.
- If some of the source user's companies are unavailable (taken by another user of the same target type), those companies simply won't appear in the list — no error, just not pre-checked.
- This works in both directions: `read_write` → derive `read_only`, and `read_only` → derive `read_write`.
- The most common use case is: you have a `read_write` user covering companies A–E; derive a `read_only` counterpart for the same set, then manually add any extras.

**No additional API calls needed** — the flow uses the same Create Super User + company-assignment APIs. The frontend just pre-selects companies from the source user's assignment list (`GET /api/v1/users/:userId/company-assignments`) when opening Step 2.

---

### Create Super User Modal — Two Steps

**Step 1 — Account Details:**
- **Name** (text input, required)
- **Email** (email input, required)
- **Password** (text input, optional — leave blank to auto-generate a temporary password)
- **Type** (radio or select, required): **Read-Only** / **Read-Write**

**Step 2 — Assign Companies:**
- Multi-select list of available companies (filtered by the chosen type — companies already assigned to another super user of the same type are excluded).
- Each company shown as a checkbox row: Company Name | Status badge.
- "Skip for now" button to defer assignment.
- "Finish" button to save assignments and close.

**On success (Step 1) — show a one-time credentials modal:**

After the API returns successfully, immediately display a modal with the following content:

```text
✅ Super user created successfully

Share these credentials with the user. This password will NOT be shown again.

Name:     John Support
Email:    john@assetguard.com
Password: Abc12345X9

[Copy Email]   [Copy Password]   [Copy Both]

[Done — Assign Companies]
```

- The [Done — Assign Companies] button closes the credentials modal and advances to Step 2.
- If the system admin set their own password during creation, do NOT show this modal.

**Note on email:** The super user also receives a welcome email automatically with their login credentials, role listed as "Support Team", and instructions to change their password on first login.

### Super User Management APIs

**Create super user** *(updated — `superUserType` now required; `assignedCompanyIds` optional)*
`POST /api/v1/users`
```json
{
  "name": "Support Agent Name",
  "email": "support@assetguard.com",
  "role": "super_user",
  "superUserType": "read_only",
  "assignedCompanyIds": ["64abc...", "64def..."]
}
```
Response:
```json
{
  "user": { "...user object..." },
  "temporaryPassword": "Abc12345",
  "message": "User created with temporary password. User will be prompted to change on first login.",
  "companyAssignments": {
    "assigned": [{ "companyId": "...", "companyName": "Acme Corp" }],
    "errors": []
  }
}
```

**List super users**
`GET /api/v1/users?role=super_user`

Response now includes `superUserType` field on each user object.

**Deactivate super user**
`PATCH /api/v1/users/:userId`
```json
{ "status": "inactive" }
```

**Activate super user**
`PATCH /api/v1/users/:userId`
```json
{ "status": "active" }
```

**Change super user password (admin-triggered)**
`POST /api/v1/users/:userId/reset-password`
No body needed. Generates a new temporary password, emails it to the super user, and returns it in the response for the admin to see.

**Delete super user**
`DELETE /api/v1/users/:userId`
Also automatically removes all company assignments for this super user.

---

## 3. Notification Assignment (System Admin → Super User) ✅

The platform owner wants their support team to receive relevant email alerts (overdue assets, repair requests, asset movements) for the companies they support — without the client needing to configure anything.

### How it works
The notification email system already exists per company: each company has a list of email recipients with notification type preferences stored in their settings. The system admin can now assign a super user's email as a recipient for any company directly from the super users management page.

### UX Flow
1. System admin clicks **"Notifications"** action against a super user row.
2. A modal opens titled **"Manage Notification Assignments for {Super User Name}"**.
3. The modal shows two sections:

**Current Assignments** (table):
| Company | Notification Types | Action |
|---------|-------------------|--------|
| Acme Corp | Overdue, Repair | Edit / Remove |
| Beta Ltd | All notifications | Edit / Remove |

**Add New Assignment** (form at the bottom of modal):
- Company dropdown (searchable, lists all companies)
- Notification type selection (multi-select checkboxes or pills):
  - `Repair` — GPS failures, poor condition, incomplete metadata
  - `Movement` — Asset movement requested/started/completed
  - `Overdue` — Overdue verifications, due-soon reminders
- Toggle: **"Receive all notification types"** (checking this overrides individual selections)
- **Add** button

### Notification Assignment APIs

**Get all assignments for a super user**
`GET /api/v1/users/:userId/notification-assignments`

Response:
```json
{
  "assignments": [
    {
      "companyId": "64abc...",
      "companyName": "Acme Corp",
      "isActive": true,
      "notificationTypes": ["overdue", "repair"],
      "receiveAll": false
    }
  ],
  "availableTypes": ["repair", "movement", "overdue"]
}
```

**Add assignment**
`POST /api/v1/users/:userId/notification-assignments`
```json
{
  "companyId": "64abc...",
  "notificationTypes": ["overdue", "repair"],
  "receiveAll": false
}
```

**Update assignment (change notification types)**
`PATCH /api/v1/users/:userId/notification-assignments`
```json
{
  "companyId": "64abc...",
  "notificationTypes": ["movement"],
  "receiveAll": false
}
```

**Remove assignment**
`DELETE /api/v1/users/:userId/notification-assignments`
```json
{ "companyId": "64abc..." }
```

---

## 4. Super User Portal ✅

### Login
Super users use the same login endpoint as everyone else. After login, read `user.role` from the JWT response and redirect accordingly.

`POST /api/v1/auth/login`
```json
{ "email": "...", "password": "..." }
```

**Auth routing by role:**
| Role | Redirect to |
|------|-------------|
| `system_admin` | `/admin/dashboard` |
| `super_user` | `/super-user/dashboard` (companies list) |
| `customer_admin` | `/dashboard` |
| `field_user` | Mobile app |

Super users navigating to admin or customer routes → show a 403 page.

---

### Page 1: Companies List — Default Landing Page

**Route:** `/super-user/dashboard`

**Purpose:** The first screen after login. Super users see **only their assigned companies** and click into one to support them.

> Note: The backend now filters the companies list to assigned companies automatically. If the super user has no companies assigned, the list is empty.

**Top search bar:** Dynamic/live search on company name. Partial search supported. Searches as the user types (debounced).

**Layout:** Table or card grid (your choice).

**Table columns:**
| Column | Notes |
|--------|-------|
| Company Name | Clickable — navigates to company's assets |
| Status | Active / Inactive |
| Total Assets | Count (if available from API response) |
| Created At | When onboarded |

**On row click:** Navigate to `/super-user/companies/:companyId/assets`

**API:**
`GET /api/v1/companies`

The backend automatically scopes this to the super user's assigned companies — no `companyId` filter needed from the frontend.

Response:
```json
{
  "results": [
    {
      "id": "64abc...",
      "companyName": "Acme Corp",
      "isActive": true,
      "contactEmail": "admin@acme.com",
      "createdAt": "2024-01-15T..."
    }
  ],
  "totalResults": 3,
  "page": 1,
  "limit": 20
}
```
Supports `?search=acme` for filtering.

---

### Page 2: Company Assets List

**Route:** `/super-user/companies/:companyId/assets`

**Breadcrumb:** Support Portal > {Company Name} > Assets

**Purpose:** All assets for this company. Full detail for support context.

**Search bar:** Live partial search across serial number, make, model, site name, channel, client fields.

**Filters:**
| Filter | Values |
|--------|--------|
| Registration State | All / Unregistered / Registered |
| Verification Status | All / On Time / Overdue / Due Soon / Never Verified |
| Asset Status | All / Active / Inactive / Retired |
| Category | Dropdown from company's category list |

**Default view:** All assets, sorted newest first.

**Table columns:**
| Column | Notes |
|--------|-------|
| Serial Number | |
| Make / Model | Combined |
| Category | |
| Site Name | |
| Status | Active / Inactive / Retired (coloured badge) |
| Registration | Unregistered / Registered (badge) |
| Verification | On Time / Overdue / Due Soon / Never Verified (coloured badge) |
| Last Verified | Date or "Never" |
| Next Due | Date or "-" |
| GPS | Shows lat/long + "Correct GPS" button (**read_write only**) |
| Actions | View Detail button; **Edit Asset** button (**read_write only**) |

**API:**
`GET /api/v1/assets?companyId={companyId}&page=1&limit=20`

Optional query params:
- `search=` — partial search across multiple fields
- `registrationState=` — `unregistered` | `partially_registered` | `fully_registered`
- `verificationStatus=` — `overdue` | `due_soon` | `on_time` | `never_verified`
- `status=` — `active` | `inactive` | `retired`
- `categoryId=` — filter by specific category

---

### Page 3: Asset Detail

**Route:** `/super-user/companies/:companyId/assets/:assetId`

**Breadcrumb:** Support Portal > {Company Name} > Assets > {Serial Number}

**Two sections on this page: Asset Info + Verification History**

#### Asset Info

| Field | Notes |
|-------|-------|
| Serial Number | |
| Make | |
| Model | |
| Category | |
| Condition | Good / Fair / Poor / Unknown |
| Status | Active / Inactive / Retired |
| Site Name | |
| Channel | |
| Client | |
| Notes | |
| Registered GPS | Lat + Long displayed + **"Correct GPS"** button (**read_write only**) |
| Location Accuracy | In meters |
| Geofence Threshold | In meters (the radius used for GPS proximity checks) |
| Registered By | Name + email |
| Registered At | Date |
| Last Verified | Date |
| Next Verification Due | Date |
| Verification Frequency | Every X days |
| QR Code | QR code string |
| Photos | Thumbnails if any |

**"Edit Asset" button** — visible only for `read_write` super users. Opens the asset edit form/modal.

**API for asset detail:**
`GET /api/v1/assets/:assetId`

#### Verification History

Shows the full timeline — both the initial registration event and every verification attempt.

**Table columns:**
| Column | Notes |
|--------|-------|
| Date & Time | When submitted |
| Type | Registration / Verification |
| Submitted By | Field worker name + email |
| GPS Passed | Yes (green) / No (red) |
| Distance from Asset | In meters |
| GPS Override Used | Yes / No |
| Verification Status | Passed / Failed / Pending Review |
| Photos | Count, click to view |
| Notes | If any |

**API for history:**
`GET /api/v1/assets/:assetId/history`

Returns both the registration event and all verifications in chronological order.

---

### Global Search (Top Nav Bar)

When super user searches from the top navigation bar (not inside a company page), search across **all their assigned companies'** assets:

`GET /api/v1/assets?search={query}`

No `companyId` — returns assets from all assigned companies. Each result includes `companyId` and company name so the UI can show which client the asset belongs to. Clicking a result should go to `/super-user/companies/:companyId/assets/:assetId`.

---

## 5. Super User Profile Page ✅

Super users can manage their own profile.

**Route:** `/super-user/profile`

**Accessible from:** User avatar / name in the top navigation bar.

### Profile Page Sections

#### Personal Info
- **Profile Picture** — show current picture (or placeholder avatar). "Change Photo" button uploads a new one.
- **Name** — editable text field
- **Email** — read-only (cannot be changed from profile; admin manages this)
- **Role** — read-only, shows "Support Team"
- **Type** — read-only, shows "Read-Only" or "Read-Write" (from `user.superUserType`)

**Save profile API:**
`PATCH /api/v1/users/:userId`
```json
{
  "name": "Updated Name",
  "profilePic": "https://..."
}
```

#### Upload Profile Picture
First upload the image file, then save the returned URL to the profile.

`POST /api/v1/uploads/user-image`
- Content-Type: `multipart/form-data`
- Field name: `image`
- Returns: `{ success: true, url: "https://..." }`

Then call `PATCH /api/v1/users/:userId` with `profilePic` set to the returned `url`.

#### Change Password
Three fields:
- Current password
- New password (min 8 chars, at least 1 letter + 1 number)
- Confirm new password

**API:**
`POST /api/v1/auth/change-password`
```json
{
  "oldPassword": "current123",
  "newPassword": "newSecure99"
}
```

If the super user still has a temporary password (`mustChangePassword: true` is returned in the login response), redirect them to the change password screen immediately before letting them access the portal.

---

## 6. What Super Users Cannot Do

Super users have **no access** to:
- QR code generation or management
- Company creation, settings, or configuration
- User management (cannot create or manage other users)
- System admin panel
- Scheduled reports creation
- `read_only` super users: no asset edits, no GPS correction

All data in the super user portal is read-only for `read_only` super users. `read_write` super users can only edit asset fields and correct GPS — nothing else.

---

## 7. Navigation Structure (Super User Portal)

```
/super-user/
├── dashboard                          ← Assigned companies list (default after login)
├── companies/:companyId/
│   └── assets/
│       ├── (list page with filters)
│       └── :assetId                  ← Asset detail + verification history
└── profile                           ← Own profile, change password, profile picture
```

Top navigation should include:
- Logo / portal name
- Global search bar
- User avatar with dropdown → Profile, Logout

---

## 8. Backend Data Model Reference

### SuperUserCompanyAccess (new collection)

Tracks which companies a super user can access.

```
{
  superUserId: ObjectId (ref: User),
  companyId:   ObjectId (ref: Company),
  createdAt:   Date,
  updatedAt:   Date
}
Unique index: { superUserId, companyId }
```

### User model additions

| Field | Type | Values | Applies to |
|-------|------|---------|------------|
| `superUserType` | String | `read_only` \| `read_write` \| `null` | `super_user` role only |

### Permission sets by super user type

| Permission | read_only | read_write |
|-----------|-----------|------------|
| viewOwnAssets | ✅ | ✅ |
| viewOwnActivity | ✅ | ✅ |
| viewReports | ✅ | ✅ |
| viewAllCompanies | ✅ | ✅ |
| getUsers | ✅ | ✅ |
| updateAssetLocation | ❌ | ✅ |
| manageAssets | ❌ | ✅ |
