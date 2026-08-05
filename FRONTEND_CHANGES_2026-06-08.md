# Frontend Changes — 2026-06-08

This document covers every backend change made on 2026-06-08 that requires a frontend integration update.
It is intended to be read by the frontend LLM that is implementing the admin web portal and the mobile app.

---

## Table of Contents

1. [Cooling Equipment Form — New Sub-Question (thermostat)](#1-cooling-equipment-form--new-sub-question-thermostat)
2. [Cooling Equipment Form — Complaint Labels Updated](#2-cooling-equipment-form--complaint-labels-updated)
3. [Create User — Phone Number Field](#3-create-user--phone-number-field)
4. [Admin Company Detail Page — Per-Company Stats Endpoint](#4-admin-company-detail-page--per-company-stats-endpoint)
5. [Admin Company Detail Page — Search Users by Name / Email](#5-admin-company-detail-page--search-users-by-name--email)

---

## 1. Cooling Equipment Form — New Sub-Question (thermostat)

### What Changed

In the **Troubleshooting — Ice Building on the Evaporator Coil** section there is a question:

> "Did the customer adjust the thermostat?"

A new dependent follow-up question has been added:

> "Can the thermostat be set to 2 again?"

The follow-up question is only asked **when the answer to the first question is `Yes`**. If the first answer is `No`, the follow-up must be omitted (send `null` or omit the field entirely).

### Where This Applies

This affects **both** submission paths:
- `POST /api/v1/verifications/:assetId` — mobile field worker verification
- `POST /api/v1/repair-requests/assets/:assetId` — admin-initiated repair request (web portal)

### New Field

| Field path | Type | Required? |
|---|---|---|
| `coolingRepairForm.troubleshooting.iceBuildingOnEvaporatorCoil.canThermostatBeSetTo2` | `boolean` | **Required** when `customerAdjustedThermostat === true`; omit or send `null` otherwise |

### Updated Payload Example

```json
{
  "coolingRepairForm": {
    "troubleshooting": {
      "iceBuildingOnEvaporatorCoil": {
        "shelvesAtEqualIntervals": true,
        "shelvesWithProtectiveLip": true,
        "coldAirFlowingFreely": false,
        "customerAdjustedThermostat": true,
        "canThermostatBeSetTo2": false
      }
    }
  }
}
```

If `customerAdjustedThermostat` is `false`, you can omit `canThermostatBeSetTo2` entirely or send `null`:

```json
{
  "coolingRepairForm": {
    "troubleshooting": {
      "iceBuildingOnEvaporatorCoil": {
        "shelvesAtEqualIntervals": true,
        "shelvesWithProtectiveLip": true,
        "coldAirFlowingFreely": false,
        "customerAdjustedThermostat": false
      }
    }
  }
}
```

### Frontend Logic

```
if (customerAdjustedThermostat === true) {
  // Show "Can the thermostat be set to 2 again?" (Yes / No)
  // Include canThermostatBeSetTo2 in the payload (required)
} else {
  // Hide the follow-up question
  // Do NOT include canThermostatBeSetTo2 in the payload
}
```

### Validation Errors

| Condition | Error |
|---|---|
| `customerAdjustedThermostat` is `true` but `canThermostatBeSetTo2` is missing | `400 "canThermostatBeSetTo2" is required` |

---

## 2. Cooling Equipment Form — Complaint Labels Updated

### What Changed

The labels for the seven complaint questions have been updated. **No field names changed** — only the display text. The backend PDF now uses the new labels. The frontend should update its UI to match.

| Field name | Old label | New label |
|---|---|---|
| `lightsNotWorking` | Lights not working | Are the lights working? |
| `fanNotTurning` | Fan not turning | Is the fan turning on? |
| `coolerTrippingPower` | Cooler tripping the power | Is the cooler tripping the power? |
| `coolerNotCoolingCompressorRunning` | Cooler not cooling, but the compressor is running | Is the cooler cooling properly while the compressor is running? |
| `doorsNotClosing` | Doors not closing | Are the doors closing properly? |
| `coolerLeakingWaterBottom` | Cooler leaking WATER on the bottom of the cooler | Is water leaking from the bottom of the cooler? |
| `coolerLeakingWaterInside` | Cooler leaking WATER on the inside of the cooler | Is water leaking inside the cooler? |

**No payload change required.** The field names and boolean values are the same. This is a label/copy update only.

---

## 3. Create User — Phone Number Field

### What Changed

An optional `phone` field is now accepted when creating a field worker or admin.

### Endpoint

```http
POST /api/v1/users
```

**Authentication:** Bearer token. Requires `manageUsers` permission (`customer_admin` full or system_admin).

### New Field

| Field | Type | Required | Description |
|---|---|---|---|
| `phone` | string | No | Phone number in any format. Max 30 characters. Send `""` or `null` to leave blank. |

### Updated Request Body Example

```json
{
  "name": "Jane Smith",
  "email": "jane@company.com",
  "role": "field_user",
  "phone": "+27 82 555 0001"
}
```

All other fields are unchanged. The phone number appears on the Cooling Equipment repair request PDF under "Report By" when the field worker logs the repair.

### Response

The response already includes `phone` in the user object — no change to the response shape.

---

## 4. Admin Company Detail Page — Per-Company Stats Endpoint

### What Changed

A new endpoint returns accurate asset, QR code, user, and verification counts for a specific company. Use this to populate the stats cards on the `/admin/companies/:companyId` detail page.

### Endpoint

```http
GET /api/v1/admin/companies/:companyId/stats
```

**Authentication:** Required — Bearer token. Requires `viewSystemMonitoring` permission (`system_admin`, `super_user`).

### Response

```json
{
  "company": {
    "id": "664f1a2b3c4d5e6f7a8b9c01",
    "companyName": "THIRSTI Beverages",
    "contactEmail": "admin@thirsti.co.za",
    "isActive": true,
    "createdAt": "2025-01-15T08:00:00.000Z"
  },
  "stats": {
    "assets": {
      "total": 142,
      "byStatus": {
        "active": 130,
        "inactive": 5,
        "registered": 7
      }
    },
    "qrCodes": {
      "total": 200,
      "byStatus": {
        "available": 58,
        "allocated": 142
      }
    },
    "users": {
      "total": 18,
      "active": 16,
      "byRole": {
        "customer_admin": 3,
        "field_user": 15
      }
    },
    "verifications": {
      "total": 1840,
      "last30Days": 214,
      "last7Days": 48
    }
  }
}
```

### Stats Cards Mapping

| Stat card | Field to use |
|---|---|
| Total Assets | `stats.assets.total` |
| Active Assets | `stats.assets.byStatus.active` |
| Total QR Codes | `stats.qrCodes.total` |
| Allocated QR Codes | `stats.qrCodes.byStatus.allocated` |
| Total Users | `stats.users.total` |
| Active Users | `stats.users.active` |
| Total Verifications | `stats.verifications.total` |
| Verifications (last 30 days) | `stats.verifications.last30Days` |

### Error Responses

| Status | Message |
|---|---|
| `404` | `Company not found` |
| `401` | `Please authenticate` |
| `403` | `Forbidden` |

---

## 5. Admin Company Detail Page — Search Users by Name / Email

### What Changed

No new endpoint was needed — the existing users list endpoint already supports per-company search. This section documents the correct usage for the admin company detail page.

### Endpoint

```http
GET /api/v1/users?companyId=:companyId&search=:term
```

**Authentication:** Required — Bearer token. `system_admin` and `super_user` can pass any `companyId`.

### Query Parameters

| Param | Type | Required | Description |
|---|---|---|---|
| `companyId` | ObjectId string | Yes | The company whose users you want to search |
| `search` | string | No | Partial match on `name` or `email` (case-insensitive) |
| `role` | string | No | Filter by `field_user` or `customer_admin` |
| `status` | string | No | Filter by `active`, `inactive`, etc. |
| `limit` | number | No | Results per page (default 10) |
| `page` | number | No | Page number (default 1) |

### Example — search users in company for "john"

```http
GET /api/v1/users?companyId=664f1a2b3c4d5e6f7a8b9c01&search=john&limit=20
```

### Response

Standard paginated response:

```json
{
  "results": [
    {
      "id": "...",
      "name": "John Dlamini",
      "email": "john@thirsti.co.za",
      "role": "field_user",
      "phone": "+27 82 555 0001",
      "status": "active",
      "companyId": "664f1a2b3c4d5e6f7a8b9c01",
      "createdAt": "2025-03-01T10:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "totalPages": 1,
  "totalResults": 1
}
```

### Frontend Integration Notes

1. On the company detail page, add a search input above the users table.
2. Debounce the input (~300 ms) before firing the request.
3. Pass the current company's `id` as `companyId` and the search term as `search`.
4. Re-fetch when the search term changes or is cleared.
5. Combine with `role` and `status` filters already present on the table if needed.

---

*End of changes for 2026-06-08*
