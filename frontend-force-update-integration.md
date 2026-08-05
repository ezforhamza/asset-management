# Force Update — Frontend Integration Guide

## Overview

Two new areas need to be built in the web portal:

1. **App Version Management** — a settings page (system admin only) where the admin can set the latest version per platform. When the admin saves a version, any mobile user running an older version will be blocked until they update.

2. **Field Worker App Version Display** — the user model now includes `appVersion`, `appPlatform`, and `appVersionLastSeenAt`. These are already returned in all existing user API responses — no new endpoint is needed. The frontend just needs to surface these values wherever field worker profiles or lists are displayed.

---

## Part 1 — App Version Management (System Admin Settings)

### Access control

This section is visible to `system_admin` only. Do not render it for `customer_admin` or any other role.

### Placement

Add this as a section within the existing system settings area, or as a standalone page — e.g., **Settings → App Version Management**.

---

### 1.1 Fetch current config for all platforms

#### Request

```
GET /api/v1/app-version
Authorization: Bearer <token>
```

#### Response

Returns an array of up to three objects — one per configured platform. Platforms that have never been configured will simply not appear in the list.

```json
[
  {
    "id": "664f1a2b3c4d5e6f7a8b9c0d",
    "platform": "android",
    "latestVersion": "1.3.0",
    "storeUrl": "https://play.google.com/store/apps/details?id=com.yourapp",
    "forceUpdateMessage": "A new version is available. Please update to continue.",
    "isActive": true,
    "updatedBy": "664f1a2b3c4d5e6f7a8b9c0a",
    "updatedAt": "2026-06-10T09:00:00.000Z",
    "createdAt": "2026-05-01T08:00:00.000Z"
  },
  {
    "id": "664f1a2b3c4d5e6f7a8b9c0e",
    "platform": "ios",
    "latestVersion": "1.3.0",
    "storeUrl": "https://apps.apple.com/app/yourapp/id123456789",
    "forceUpdateMessage": "A new version is available. Please update to continue.",
    "isActive": true,
    "updatedBy": "664f1a2b3c4d5e6f7a8b9c0a",
    "updatedAt": "2026-06-10T09:00:00.000Z",
    "createdAt": "2026-05-01T08:00:00.000Z"
  },
  {
    "id": "664f1a2b3c4d5e6f7a8b9c0f",
    "platform": "huawei",
    "latestVersion": "1.2.0",
    "storeUrl": "https://appgallery.huawei.com/app/yourapp",
    "forceUpdateMessage": "A new version is available. Please update to continue.",
    "isActive": true,
    "updatedBy": "664f1a2b3c4d5e6f7a8b9c0a",
    "updatedAt": "2026-06-05T11:00:00.000Z",
    "createdAt": "2026-05-01T08:00:00.000Z"
  }
]
```

**Note:** Display all three platforms — Android, iOS, Huawei — regardless of whether a config exists yet. For platforms with no config, show the form in an empty/unconfigured state.

---

### 1.2 Create or update config for a platform

This is a single `PUT` endpoint that creates the record if it doesn't exist yet, or updates it if it does. The frontend does not need to distinguish between create and update — always use `PUT`.

#### Request

```
PUT /api/v1/app-version/:platform
Authorization: Bearer <token>
Content-Type: application/json
```

**`:platform`** must be one of: `android`, `ios`, `huawei`

#### Request body

| Field | Type | Required | Notes |
|---|---|---|---|
| `latestVersion` | string | Yes | Semver format: `1.2.0` |
| `storeUrl` | string | Yes | Full URL to the app's store listing |
| `forceUpdateMessage` | string | No | Message shown to the user when blocked. Max 300 characters. |
| `isActive` | boolean | No | Defaults to `true`. Set to `false` to disable force update for a platform without deleting the config. |

#### Example request body

```json
{
  "latestVersion": "1.3.0",
  "storeUrl": "https://play.google.com/store/apps/details?id=com.yourapp",
  "forceUpdateMessage": "A new version is available. Please update to continue.",
  "isActive": true
}
```

#### Example request

```
PUT /api/v1/app-version/android
```

#### Response — `200 OK`

Returns the full updated config object (same shape as the GET response above).

#### Validation errors — `400 Bad Request`

| Scenario | Cause |
|---|---|
| Invalid version format | `latestVersion` must match `MAJOR.MINOR.PATCH` — e.g. `1.2.0`. `v1.2.0` or `1.2` will be rejected. |
| Invalid URL | `storeUrl` must be a valid URL. |
| Invalid platform | `:platform` must be `android`, `ios`, or `huawei`. |
| Message too long | `forceUpdateMessage` exceeds 300 characters. |

---

### 1.3 Suggested UI layout

Display three cards or table rows — one per platform — each showing:

| Label | Field |
|---|---|
| Platform | `platform` (display as Android / iOS / Huawei) |
| Latest Version | Editable input — `latestVersion` |
| Store URL | Editable input — `storeUrl` |
| Force Update Message | Editable textarea — `forceUpdateMessage` |
| Force Update Active | Toggle — `isActive` |
| Last Updated | `updatedAt` formatted as a date |

Each platform saves independently via its own `PUT` call. Show a success or error toast after save.

> **Important:** Since store approval timelines differ per platform (iOS typically faster, Android and Huawei can take longer), each platform is managed and saved independently. Do not use a single "Save All" button.

---

## Part 2 — Field Worker App Version Display

### Where the data comes from

The user model now includes three new fields that are returned on all existing user endpoints:

| Field | Type | Description |
|---|---|---|
| `appVersion` | `string \| null` | The app version the field worker was last seen using, e.g. `"1.2.0"` |
| `appPlatform` | `string \| null` | Platform: `"android"`, `"ios"`, or `"huawei"` |
| `appVersionLastSeenAt` | `ISO date string \| null` | Timestamp of when this version was last recorded |

These fields are populated automatically by the backend — no action needed from the mobile app beyond sending the headers (handled by the mobile dev). The values update whenever the field worker makes any authenticated API request with a different version.

A `null` value means the field worker has not made any API request since this feature was deployed.

### Which endpoints already return these fields

These fields are included in the response of all existing user endpoints — nothing new to call:

- `GET /api/v1/users` — user list
- `GET /api/v1/users/:userId` — single user profile

### Example user object (relevant fields only)

```json
{
  "id": "664f1a2b3c4d5e6f7a8b9c01",
  "name": "John Field Worker",
  "email": "john@example.com",
  "role": "field_user",
  "appVersion": "1.2.0",
  "appPlatform": "android",
  "appVersionLastSeenAt": "2026-06-11T08:45:00.000Z"
}
```

### Where to display

| Location | What to show |
|---|---|
| Field worker profile page | App Version, Platform, Last Seen date |
| Field worker list (table) | App Version column (optional — only if space allows) |

### Display recommendations

- Show `appPlatform` as a readable label: `android` → **Android**, `ios` → **iOS**, `huawei` → **Huawei**.
- Show `appVersionLastSeenAt` as a relative or formatted date: e.g. *"June 11, 2026"* or *"3 days ago"*.
- If any of these fields are `null`, display a neutral placeholder such as **—** or **Not recorded**.
- Optionally, highlight users whose `appVersion` is behind the current `latestVersion` for their platform — this requires fetching the version config from `GET /api/v1/app-version` and comparing.
