# Asset Repair Request Feature — Frontend Specification

---

## Background & Purpose

Asset Guard's field workers already flag assets as "needs repair" or "non-operational" during a verification. This triggers a repair alert email to configured recipients. However, there was no persistent record of these events — no history, no list to review, and no way for a company admin to see which assets have been flagged over time.

This feature adds:

1. **Automatic DB logging** — every time a field worker marks an asset as needing repair during a verification, a repair request record is created automatically in the background.
2. **Admin-initiated repair requests** — a customer admin can also log a repair request directly from the portal (e.g. a client called in to report a problem with their asset).
3. **Repair Requests Page** — a new page in the customer admin portal listing all repair requests for the company, filterable by date, category, source, and status.
4. **Export** — the admin can export the repair request list as PDF or XLSX, choosing a date range.

**Business value:** Over time, this data reveals which assets — or which asset types/categories — require repairs most frequently. For example, a refrigerator company providing lifetime maintenance can see that a specific model's compressor unit keeps failing, and proactively address it.

---

## Who Can See This Page

- **Customer Admin** — full access. Can view the list, log manual repair requests, update request status, and export.
- **Field User** — no direct access to this page. Their repair flags (from the verification checklist) are automatically logged as repair requests in the background.
- **System Admin** — can view repair requests for any company (for support).
- **Super User** — not exposed in the super user portal (this is a customer-facing feature).

---

## Where It Lives

Add a new navigation item in the **Customer Admin portal** sidebar:

**Label:** Repair Requests  
**Icon:** wrench / tool icon  
**Route:** `/repair-requests`

---

## Page: Repair Requests List

### Header

```
[Page Title: Repair Requests]                  [+ Log Repair Request] [Export ▾]
```

- **"+ Log Repair Request"** — opens a modal to manually log a repair request for a specific asset.
- **Export button** — opens a date range picker then downloads the file.

---

### Filters Bar

Display the following filters horizontally below the header:

| Filter | Type | Values |
|--------|------|--------|
| Search | Text input | Searches: serial number, make, model, site name, category name, notes |
| Date Range | Date picker (start + end) | Defaults to current month |
| Source | Dropdown | All / Field Worker / Customer Admin |
| Status | Dropdown | All / Open / Acknowledged / Resolved |

All filters update the table live (or on submit — your choice).

---

### Table Columns

| Column | Notes |
|--------|-------|
| Date & Time | When the request was created (`createdAt`) |
| Serial Number | From the asset snapshot. Clickable — opens asset detail if you have that route. |
| Make / Model | Combined: "Samsung / RF28T5001SG" |
| Category | Asset category name |
| Site Name | Asset site name |
| Operational Status | `needs_repair` → "Needs Repair" badge (yellow), `non_operational` → "Non-Operational" badge (red). Empty for admin-initiated requests where no operational status was captured. |
| Source | "Field Worker" or "Customer Admin" |
| Notes | Truncated to ~60 chars. Show full text on hover or in detail modal. |
| Status | `open` → "Open" (blue), `acknowledged` → "Acknowledged" (yellow), `resolved` → "Resolved" (green) |
| Requested By | Name of the field worker or admin who triggered it |
| Actions | "View" button → opens detail modal. Status dropdown/button to change status. |

**Sort:** Default newest first. Allow sorting by Date and Status.

**Pagination:** 20 per page.

---

### Status Update Flow

Each row should have a quick-action to update status. Recommended: a small dropdown on the row showing the current status, clicking it shows: Open / Acknowledged / Resolved. Selecting one updates immediately via `PATCH /:requestId/status`.

---

## Modal: Log Repair Request (Admin-Initiated)

Customer admin clicks **"+ Log Repair Request"**.

A modal opens with:

**Step 1 — Select Asset:**
- Asset search input (type serial number, make, or model to search).
- Use `GET /api/v1/assets?search=...` to power the dropdown.
- Show: Serial Number + Make/Model + Site Name in each dropdown result.
- Required.

**Step 2 — Notes (optional):**
- Textarea: "Describe the issue or reason for the repair request."
- Max 1000 characters.

**Actions:** Cancel | Submit Repair Request

On submit, call `POST /api/v1/repair-requests/assets/:assetId` with the notes. Show a success toast. The new record appears at the top of the list.

---

## Export

When admin clicks **Export**, show a small popover or modal:

```
Export Repair Requests

Start Date: [date picker]
End Date:   [date picker]
Format:     ⦿ XLSX   ○ PDF

[Cancel]  [Export]
```

On confirm, call `GET /api/v1/repair-requests/export` with the query params. The browser downloads the file directly (set the anchor's `download` attribute or use `window.open`).

The XLSX includes all columns. The PDF is a landscape-oriented table, suitable for printing or sharing.

---

## API Reference

### List repair requests

```
GET /api/v1/repair-requests
```

**Query params (all optional):**

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Partial match on serial number, make, model, site name, category, notes |
| `status` | string | `open` \| `acknowledged` \| `resolved` |
| `source` | string | `field_worker` \| `customer_admin` |
| `assetId` | ObjectId | Filter to a single asset |
| `startDate` | ISO date | Filter by `createdAt >= startDate` |
| `endDate` | ISO date | Filter by `createdAt <= endDate` (inclusive, end of day) |
| `sortBy` | string | e.g. `createdAt:desc` (default) |
| `limit` | number | Default 20, max 100 |
| `page` | number | Page number |

**Response `200`:**
```json
{
  "results": [
    {
      "id": "64abc...",
      "companyId": "64def...",
      "assetId": { "id": "...", "serialNumber": "SN-001", "make": "Samsung", "model": "RF28T", "siteName": "Main Store" },
      "verificationId": "64ghi..." ,
      "requestedBy": { "id": "...", "name": "John Doe", "email": "john@example.com", "role": "field_user" },
      "source": "field_worker",
      "operationalStatus": "needs_repair",
      "conditionStatus": "poor",
      "notes": "Compressor making loud noise",
      "status": "open",
      "emailSent": true,
      "assetSnapshot": {
        "serialNumber": "SN-001",
        "make": "Samsung",
        "model": "RF28T",
        "categoryName": "Refrigerator",
        "siteName": "Main Store",
        "location": { "latitude": -26.2041, "longitude": 28.0473 }
      },
      "createdAt": "2026-06-01T10:30:00Z",
      "updatedAt": "2026-06-01T10:30:00Z"
    }
  ],
  "totalResults": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

**Note on `verificationId`:** Present when the request was triggered by a field worker verification. Null when logged manually by an admin. You can use this to add a "View Verification" link in the detail modal if you want.

**Note on `assetSnapshot`:** All asset fields in the response are from the snapshot taken at the time of the repair request. This means even if the asset is later edited (site name changed, etc.), the repair request record reflects what was true when it was logged. Use the snapshot for display — it's always populated.

---

### Create repair request (admin-initiated)

```
POST /api/v1/repair-requests/assets/:assetId
```

**Body:**
```json
{ "notes": "Client called in — compressor is making noise" }
```
`notes` is optional. `assetId` is in the URL.

**Response `201`:**
```json
{
  "success": true,
  "repairRequest": { "...full repair request object..." },
  "message": "Repair request logged. Notification sent to 2 recipient(s).",
  "emailSent": true
}
```

If no repair notification emails are configured for the company, `emailSent` will be `false` and the message explains why. The record is still saved regardless.

---

### Get single repair request

```
GET /api/v1/repair-requests/:requestId
```

Returns the full record with `requestedBy`, `assetId` (live asset fields), and `verificationId` (checklist details) populated.

---

### Update repair request status

```
PATCH /api/v1/repair-requests/:requestId/status
```

**Body:**
```json
{ "status": "acknowledged" }
```

Valid values: `open` | `acknowledged` | `resolved`

**Response `200`:** Returns the updated repair request object.

---

### Export repair requests

```
GET /api/v1/repair-requests/export
```

**Query params:**

| Param | Required | Description |
|-------|----------|-------------|
| `format` | No | `xlsx` (default) or `pdf` |
| `startDate` | No | ISO date string |
| `endDate` | No | ISO date string |
| `status` | No | Filter by status |
| `companyId` | System admin only | Required for system_admin; customer_admin's company is auto-applied |

**Response:** Binary file stream.
- XLSX: `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- PDF: `Content-Type: application/pdf`

**How to trigger a file download from the frontend:**

```javascript
// Option A — anchor with blob (works in all frameworks)
const response = await fetch('/api/v1/repair-requests/export?format=xlsx&startDate=2026-01-01&endDate=2026-06-30', {
  headers: { Authorization: `Bearer ${token}` },
});
const blob = await response.blob();
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'repair-requests.xlsx'; // or .pdf
a.click();
URL.revokeObjectURL(url);
```

---

## Field Values Reference

### `source`
| Value | Display |
|-------|---------|
| `field_worker` | Field Worker |
| `customer_admin` | Customer Admin |

### `operationalStatus`
| Value | Display | Badge colour |
|-------|---------|--------------|
| `needs_repair` | Needs Repair | Yellow / amber |
| `non_operational` | Non-Operational | Red |
| `null` | — | No badge (admin-initiated requests may have no operational status) |

### `conditionStatus`
| Value | Display |
|-------|---------|
| `good` | Good |
| `fair` | Fair |
| `poor` | Poor |
| `null` | — |

### `status`
| Value | Display | Badge colour |
|-------|---------|--------------|
| `open` | Open | Blue |
| `acknowledged` | Acknowledged | Yellow / amber |
| `resolved` | Resolved | Green |

---

## How Repair Requests Are Created (Backend Flow)

Understanding this helps you know what data to expect:

**Field worker path:**
1. Field worker submits a verification on the mobile app.
2. Their checklist includes `operationalStatus: "needs_repair"` or `"non_operational"`.
3. The backend creates the verification record, sends alert emails, and **automatically creates an `AssetRepairRequest` record** in the background — no extra API call required.
4. The repair request record has `source: "field_worker"`, `verificationId` set, and `notes` from the checklist's `repairNotes` or `explanation` field.

**Admin path:**
1. Customer admin receives a call from a client reporting an issue.
2. Admin finds the asset on the portal and clicks "Log Repair Request".
3. Frontend calls `POST /api/v1/repair-requests/assets/:assetId`.
4. Backend creates the record with `source: "customer_admin"`, sends alert email if configured, and returns the new record.

In both cases, the record is identical in structure — only `source`, `verificationId`, and available fields differ.

---

## UI/UX Notes

- **Empty state:** "No repair requests yet. Repair requests are automatically logged when field workers flag assets as needing repair, or when you log one manually."
- **Date range default:** Show current month by default (first day of month to today).
- **Serial number link:** If you have an asset detail page in the customer admin portal, make the serial number in each row a clickable link to that asset.
- **Verification link:** If `verificationId` is present, optionally show a small "View Verification" link in the detail modal.
- **Export filename suggestion:** `repair-requests_2026-01-01_to_2026-06-30.xlsx` — the backend sets the `Content-Disposition` header with this name, so the browser auto-uses it.
