# Web Portal Integration Guide

This document is the single reference for all backend changes that the web portal frontend needs to integrate. New sections will be added here as features are built.

---

## Table of Contents

1. [Admin Profile Update (Phone Number)](#1-admin-profile-update-phone-number)
2. [Cooling Equipment Repair Form — Admin-Initiated Repair Request](#2-cooling-equipment-repair-form--admin-initiated-repair-request)
3. [Universal Search — System Admin Panel](#3-universal-search--system-admin-panel)

---

## 1. Admin Profile Update (Phone Number)

### Overview — Profile Update

A `phone` field has been added to **all user accounts** (field workers, customer admins, system admins). The phone number appears alongside the admin's name on the repair request PDF under "Report By", so repair technicians know who to contact.

The same endpoint that field workers use on mobile is also available to admin users.

### Endpoint

```http
PATCH /api/v1/auth/me
```

**Authentication:** Required — Bearer token (admin's access token).

### Request Body

At least one field must be provided.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string | No | Updated display name |
| `phone` | string | No | Phone number (any format). Send `""` or `null` to clear it |

**Example — update phone only:**

```json
{
  "phone": "+27 11 555 1234"
}
```

### Response

**200 OK** — Returns the full updated user object including the new `phone` field.

```json
{
  "id": "664f1a2b3c4d5e6f7a8b9c0d",
  "name": "Nafees Nawab",
  "email": "admin@company.com",
  "phone": "+27 11 555 1234",
  "role": "customer_admin",
  "companyId": "664f1a2b3c4d5e6f7a8b9c01",
  "status": "active"
}
```

**400 Bad Request** — Body is empty (no fields provided).

```json
{ "code": 400, "message": "\"value\" must have at least 1 key" }
```

### Integration Notes

1. Add a **Phone** field to the admin profile/settings screen.
2. Pre-populate from the current user object returned at login (`phone` will be `null` if not yet set).
3. After a successful save, update the locally stored user state with the returned object.

---

## 2. Cooling Equipment Repair Form — Admin-Initiated Repair Request

### Overview — Cooling Repair Form

When a customer admin logs a repair request for an asset in the **"Cooling Equipment"** category, the web portal must show the same extended repair form that field workers fill in on mobile. The backend uses the submitted form data to generate and email a formatted PDF to the company's repair notification recipients.

For assets in **any other category**, the existing flow is unchanged — a `notes` field and no form.

### Step 1 — Check if the Asset is Cooling Equipment

Call this endpoint when the admin selects an asset to log a repair request for, before showing the repair request form.

```http
GET /api/v1/assets/:assetId/category-check
```

**Authentication:** Required — Bearer token. `customer_admin` has the required permission.

**Response:**

```json
{
  "isCoolingEquipment": true,
  "categoryName": "Cooling Equipment"
}
```

| Field | Type | Description |
| --- | --- | --- |
| `isCoolingEquipment` | boolean | `true` if category name matches "Cooling Equipment" (case-insensitive) |
| `categoryName` | string | Exact category name from the database |

**When to call:** As soon as the admin picks an asset from the dropdown/list to raise a repair request. Store `isCoolingEquipment` in state — it controls whether you show the extended form.

### Step 2 — Show the Correct Form

| Condition | Form to show |
| --- | --- |
| `isCoolingEquipment === false` | Existing repair form — `notes` text area only |
| `isCoolingEquipment === true` | Existing `notes` field **plus** the full Cooling Equipment repair form (see field reference below) |

### Step 3 — Submit the Repair Request

The endpoint is the same regardless of category.

```http
POST /api/v1/repair-requests/assets/:assetId
```

**Authentication:** Required — Bearer token. Requires `manageRepairRequests` permission (`customer_admin`).

#### Request Body — Non-Cooling Equipment (unchanged)

```json
{
  "notes": "Compressor making grinding noise"
}
```

#### Request Body — Cooling Equipment (new `coolingRepairForm` field)

```json
{
  "notes": "Optional additional notes from admin",
  "coolingRepairForm": {
    "branchName": "Soweto Branch",
    "invoiceNumber": "INV-20250605-001",
    "province": "Gauteng",
    "contactPersonOnSite": "John Dlamini",
    "contactNumberOnSite": "011 555 1234",
    "problem": "Cooler has been running hot for 3 days. Compressor is on but no cold air.",
    "generalInformation": "Unit is a 2-door upright cooler installed near the entrance.",
    "tradingHoursStart": "08:00",
    "tradingHoursEnd": "20:00",
    "techCallBeforeAttending": true,
    "complaints": {
      "lightsNotWorking": false,
      "fanNotTurning": false,
      "coolerTrippingPower": false,
      "coolerNotCoolingCompressorRunning": true,
      "doorsNotClosing": false,
      "coolerLeakingWaterBottom": false,
      "coolerLeakingWaterInside": false
    },
    "troubleshooting": {
      "doorsNotSlidingClosed": {
        "installedOnLevelSurface": true,
        "doorsMovingFreely": true
      },
      "notCoolingBlowingHotAir": {
        "sufficientSpaceBehindCooler": true,
        "productBlockingAirflow": false,
        "condenserBlocked": true
      },
      "iceBuildingOnEvaporatorCoil": {
        "shelvesAtEqualIntervals": true,
        "shelvesWithProtectiveLip": true,
        "coldAirFlowingFreely": true,
        "customerAdjustedThermostat": false
      },
      "coolerTrippingPower": {
        "adequatePowerSupplied": true,
        "pluggedDirectlyIntoWall": true,
        "pluggedIntoMultiPlug": false
      }
    }
  }
}
```

### coolingRepairForm Field Reference

All fields inside `coolingRepairForm` are **required** when submitting a Cooling Equipment repair request. The backend returns `400` if the form object is missing entirely for a Cooling Equipment asset.

#### Top-level Fields

| Field | Type | Description |
| --- | --- | --- |
| `branchName` | string | Name of the branch / store location |
| `invoiceNumber` | string | Invoice number for the cooler unit |
| `province` | string | Province where the store is located |
| `contactPersonOnSite` | string | Name of the person the repair tech should contact on-site |
| `contactNumberOnSite` | string | Phone number for the on-site contact person |
| `problem` | string | Free-text description of the problem |
| `generalInformation` | string | Any additional general information about the unit or store |
| `tradingHoursStart` | string | Store opening time (e.g. `"08:00"`) |
| `tradingHoursEnd` | string | Store closing time (e.g. `"20:00"`) |
| `techCallBeforeAttending` | boolean | `true` if the tech must call before going to the site |

#### complaints (all boolean, all required)

| Field | Label shown on form |
| --- | --- |
| `lightsNotWorking` | Lights not working |
| `fanNotTurning` | Fan not turning |
| `coolerTrippingPower` | Cooler tripping the power |
| `coolerNotCoolingCompressorRunning` | Cooler not cooling, but the compressor is running |
| `doorsNotClosing` | Doors not closing |
| `coolerLeakingWaterBottom` | Cooler leaking WATER on the bottom of the cooler |
| `coolerLeakingWaterInside` | Cooler leaking WATER on the inside of the cooler |

#### troubleshooting (all boolean, all required)

##### doorsNotSlidingClosed

| Field | Label shown on form |
| --- | --- |
| `installedOnLevelSurface` | Check if the cooler is installed on a level surface |
| `doorsMovingFreely` | Are the doors moving freely, not off the rail? |

##### notCoolingBlowingHotAir

| Field | Label shown on form |
| --- | --- |
| `sufficientSpaceBehindCooler` | Is there sufficient space (18mm) between the wall and the back of the cooler? |
| `productBlockingAirflow` | Is there any product (crates, merchandise) blocking the air-flow in the front or rear? |
| `condenserBlocked` | Is the condenser blocked? Has the condenser been cleaned in the last 3-6 months? |

##### iceBuildingOnEvaporatorCoil

| Field | Label shown on form |
| --- | --- |
| `shelvesAtEqualIntervals` | Are the shelves installed at equal intervals? |
| `shelvesWithProtectiveLip` | Are the shelves installed with the protective lip towards the back of the cooler? |
| `coldAirFlowingFreely` | Is the cold air able to flow freely? Are there blister packs or 6-pack plastic blocking air flow? |
| `customerAdjustedThermostat` | Did the customer adjust the thermostat? Can the thermostat be set to 2 again? |

##### coolerTrippingPower

| Field | Label shown on form |
| --- | --- |
| `adequatePowerSupplied` | Is there adequate power supplied to the cooler (refer to manual - 220V)? |
| `pluggedDirectlyIntoWall` | Is the cooler plugged directly into the wall? |
| `pluggedIntoMultiPlug` | Is the cooler plugged into a multi-plug shared with other coolers / equipment? |

### Response — POST /repair-requests/assets/:assetId

#### 201 Created

```json
{
  "success": true,
  "isCoolingEquipment": true,
  "repairRequest": {
    "id": "685a1234abcd5678ef901234",
    "companyId": "664f1a2b3c4d5e6f7a8b9c01",
    "assetId": "664f1a2b3c4d5e6f7a8b9c0d",
    "source": "customer_admin",
    "status": "open",
    "emailSent": true,
    "notes": "Optional additional notes",
    "coolingRepairForm": { "...": "stored form data" },
    "assetSnapshot": { "serialNumber": "SN-001", "make": "Honda", "..." : "..." },
    "createdAt": "2026-06-08T10:00:00.000Z"
  },
  "message": "Repair request logged. Notification sent to 2 recipient(s).",
  "emailSent": true
}
```

The `isCoolingEquipment` flag in the response tells the frontend whether a PDF email was sent (`true`) or a plain-text email (`false`). Use this to show the right confirmation message to the admin.

### Error Responses

| Status | Message |
| --- | --- |
| `400` | `Cooling Equipment repair form is required for assets in the Cooling Equipment category` |
| `400` | Joi validation error if any `coolingRepairForm` field is missing or has wrong type |
| `404` | `Asset not found` |
| `403` | `Forbidden` (asset belongs to a different company) |

---

## 3. Download Cooling Repair PDF — Admin-Initiated Requests

On the Repair Requests list page, for rows where `source === 'customer_admin'` and `isCoolingEquipment` is implied (check `coolingRepairForm` presence), show a **Download PDF** button.

```http
GET /api/v1/repair-requests/:requestId/cooling-repair-pdf
```

**Authentication:** Required — Bearer token. Requires `manageRepairRequests` permission.

**Response:** Binary PDF file stream.

| Header | Value |
| --- | --- |
| `Content-Type` | `application/pdf` |
| `Content-Disposition` | `attachment; filename="repair-request-SN-001.pdf"` |

**How to detect if a repair request has a cooling repair PDF available:**

Check the `coolingRepairForm` field on the repair request object returned by `GET /api/v1/repair-requests` or `GET /api/v1/repair-requests/:requestId`. If `coolingRepairForm` is present and has a `branchName` value (not null), the PDF download button should be shown.

```js
const hasCoolingPdf = record.coolingRepairForm && record.coolingRepairForm.branchName;
```

**Error Responses:**

| Status | Message |
| --- | --- |
| `404` | `Repair request not found` |
| `404` | `No cooling repair form found for this repair request` |
| `403` | `Forbidden` |

---

## 4. What Changes in the Repair Requests List

The `GET /api/v1/repair-requests` response now includes a `coolingRepairForm` sub-object on each record (when applicable). Use this to:

1. Show a **Download PDF** button for rows with `coolingRepairForm.branchName != null`
2. Optionally show a **"Cooling Equipment"** badge on those rows for quick identification

No other changes to the list API or its filters/pagination.

---

## 3. Universal Search — System Admin Panel

### Overview — Universal Search

System admins (and super users) can now search across **all users, assets, and QR codes** in a single request. This is intended for the global search bar in the super admin panel, where finding a specific user or asset across 300+ entries would otherwise require page-by-page navigation.

- **System admin**: searches across every company on the platform.
- **Super user**: searches across their assigned companies only.

### Search Endpoint

```http
GET /api/v1/search
```

**Authentication:** Required — Bearer token. Requires `viewAllCompanies` permission (`system_admin`, `super_user`).

### Query Parameters

| Param | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `q` | string | Yes | — | Search term (minimum 2 characters) |
| `type` | string | No | `all` | Which entities to search: `users`, `assets`, `qrcodes`, or `all` |
| `limit` | number | No | `10` | Max results returned per entity type (1–50) |

### Example Requests

**Search everything for "nafees":**

```http
GET /api/v1/search?q=nafees
```

**Search only users for "caroline":**

```http
GET /api/v1/search?q=caroline&type=users&limit=20
```

**Search assets for a serial number:**

```http
GET /api/v1/search?q=SN-001&type=assets
```

### Search Response

```json
{
  "query": "nafees",
  "type": "all",
  "results": {
    "users": {
      "total": 2,
      "results": [
        {
          "id": "664f1a2b3c4d5e6f7a8b9c0d",
          "name": "Nafees Nawab",
          "email": "nafees@company.com",
          "role": "customer_admin",
          "phone": "+27 11 555 1234",
          "status": "active",
          "companyId": "664f1a2b3c4d5e6f7a8b9c01",
          "companyName": "THIRSTI Beverages",
          "createdAt": "2026-04-21T08:00:00.000Z"
        }
      ]
    },
    "assets": {
      "total": 0,
      "results": []
    },
    "qrcodes": {
      "total": 0,
      "results": []
    }
  }
}
```

When `type` is set to a specific entity (e.g. `type=users`), only that key is present in `results`.

### Fields Searched

| Entity | Fields searched |
| --- | --- |
| Users | `name`, `email` |
| Assets | `serialNumber`, `make`, `model`, `siteName`, `client` |
| QR Codes | `qrCode` (the QR code string) |

### Each Result Includes

| Entity | Extra context fields |
| --- | --- |
| Users | `companyName`, `role`, `phone`, `status` |
| Assets | `companyName`, `make`, `model`, `siteName`, `client`, `status`, `categoryId.name` |
| QR Codes | `companyName`, `status`, `assetId.serialNumber` (if linked) |

### Search Error Responses

| Status | Message |
| --- | --- |
| `400` | `Search query must be at least 2 characters` |
| `400` | `type must be one of: all, users, assets, qrcodes` |
| `401` | `Please authenticate` |
| `403` | `Forbidden` (role does not have `viewAllCompanies` permission) |

### Search Integration Notes

1. **Debounce the input** — call the API after the user stops typing for ~300ms, not on every keystroke.
2. **Show grouped results** — render Users, Assets, and QR Codes as separate sections in the dropdown/results panel. Each section shows `total` in the heading so the admin knows how many matches exist even when the displayed list is capped by `limit`.
3. **Use `type` to narrow scope** — if the search bar is on the Users tab, pass `type=users` to avoid wasting bandwidth fetching assets and QR codes.
4. **Navigate on click** — clicking a user result should navigate to `/companies/:companyId/users/:userId`; clicking an asset should navigate to `/companies/:companyId/assets/:assetId`.

---

*More sections will be added below as new features are released.*
