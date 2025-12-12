# Asset Guard - User Roles & System Flow

## Two Separate Panels

### 1. Admin Panel (System Admin) - NOT THIS PROJECT

**Who uses it:** Your team (Asset Guard company employees)

**Purpose:** Manage the entire platform

**Responsibilities:**

- Create/manage companies (tenants)
- Allocate QR codes to companies
- Bulk import QR codes (100,000+)
- System monitoring (queued uploads, failed syncs)
- Global settings (default geofence, verification frequencies)

**This is a separate project - we are NOT building this now.**

---

### 2. Client Panel (Customer Portal) - THIS PROJECT ✅

**Who uses it:** Your customers (companies who buy your service)

**Purpose:** Manage their own assets and field workers

---

## Client Panel User Roles

### Role 1: Customer Admin

**Who:** Company manager/supervisor who purchased Asset Guard

**Can do:**

- ✅ View Dashboard (stats overview)
- ✅ View Reports (all verifications)
- ✅ View Map (all asset locations)
- ✅ Manage Users (create/edit/deactivate field workers)
- ✅ Access Settings (verification frequency, notifications)
- ✅ Export reports (CSV/PDF)
- ✅ Schedule automated reports
- ✅ Investigate flagged verifications

---

### Role 2: Field User (Manager/Supervisor with web access)

**Who:** Office staff who need to view reports but not manage

**Can do:**

- ✅ View Dashboard
- ✅ View Reports
- ✅ View Map
- ❌ Cannot manage users
- ❌ Cannot access settings

---

## The Complete Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    ASSET GUARD SYSTEM                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │  Admin Panel │    │ Client Panel │    │  Mobile App  │   │
│  │  (Your Team) │    │ (Customers)  │    │(Field Workers)│  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘   │
│         │                   │                   │            │
│         ▼                   ▼                   ▼            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    Backend API                        │   │
│  │              (Node.js + MongoDB)                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Example Scenario

### Step 1: Admin Panel (Your Team)

1. You create a new company "ABC Industries"
2. You allocate 500 QR codes to ABC Industries
3. You create a Customer Admin user for ABC

### Step 2: Client Panel (ABC Industries - Customer Admin)

1. Customer Admin logs in to Client Panel
2. Creates field workers (Ali, Ahmed, Sara)
3. Configures verification frequency (every 30 days)
4. Sets up notification emails

### Step 3: Mobile App (Field Workers)

1. Ali downloads the mobile app
2. Logs in with credentials from Customer Admin
3. Scans QR codes on assets
4. Registers new assets / Verifies existing assets
5. Data syncs to server

### Step 4: Client Panel (Viewing Results)

1. Customer Admin sees Dashboard stats
2. Views all verifications in Reports
3. Sees assets on Map (green/orange/red pins)
4. Investigates flagged items (GPS override used)
5. Exports monthly report to PDF

---

## Summary

| Panel        | Built By     | Used By        | Purpose              |
| ------------ | ------------ | -------------- | -------------------- |
| Admin Panel  | You (later)  | Your team      | Manage platform      |
| Client Panel | You (NOW)    | Your customers | Manage their assets  |
| Mobile App   | Flutter team | Field workers  | Scan & verify assets |

**We are building the CLIENT PANEL now.**
