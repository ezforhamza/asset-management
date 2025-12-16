# Asset Guard Admin Panel - Implementation Plan

## Overview

Building the System Admin panel for multi-tenant company management, QR inventory, and system monitoring.

---

## Phase 1: Foundation & Setup ✅ COMPLETED

### Module 1.1: Admin Routes & Navigation ✅

- [x] Create admin route section in `src/routes/sections/dashboard/frontend.tsx`
- [x] Add admin navigation group in `src/layouts/dashboard/nav/nav-data/nav-data-frontend.tsx`
- [x] Add admin pages folder structure `src/pages/admin/`

### Module 1.2: Admin API Services ✅

- [x] Create `src/api/services/adminService.ts` - Admin-specific APIs
- [x] Create `src/api/services/companyService.ts` - Company CRUD (customer portal)
- [x] Create `src/api/services/qrService.ts` - QR inventory management

### Module 1.3: Admin MSW Handlers ✅

- [x] Create `src/_mock/handlers/admin.ts` - Admin endpoints
- [x] Create `src/_mock/handlers/company.ts` - Company management
- [x] Create `src/_mock/handlers/qrCodes.ts` - QR inventory
- [x] Create `src/_mock/data/companies.ts` - Mock company data

### Module 1.4: Admin Types ✅

- [x] Add `Company` entity to `src/types/entity.ts`
- [x] Add `QRCode` entity to `src/types/entity.ts`
- [x] Add `SyncQueueItem` entity to `src/types/entity.ts`
- [x] Add `SystemMonitoringStats` entity to `src/types/entity.ts`
- [x] Add `AuditLog` entity to `src/types/entity.ts`

### Module 1.5: Admin Placeholder Pages ✅

- [x] Create `src/pages/admin/companies/index.tsx` with CompanyTable
- [x] Create `src/pages/admin/users/index.tsx` with AdminUserTable
- [x] Create `src/pages/admin/qr-inventory/index.tsx` with QRTable
- [x] Create `src/pages/admin/monitoring/index.tsx` with SyncQueueTable
- [x] Create `src/pages/admin/audit-logs/index.tsx`

---

## Phase 2: Company Management (Priority: High)

### Module 2.1: Companies List Page

- [ ] Add pagination support
- [ ] Add "Add Company" modal functionality
- [ ] Add company search debouncing

### Module 2.2: Company CRUD Components

- [ ] `src/pages/admin/companies/components/CreateCompanyModal.tsx`
- [ ] `src/pages/admin/companies/components/EditCompanyModal.tsx`
- [ ] `src/pages/admin/companies/components/CompanySettings.tsx`
  - Default verification frequency
  - Geofence threshold (meters)
  - Allow GPS override toggle
  - Image retention days
  - Repair notification emails

### Module 2.3: Company Detail View

- [ ] Company detail page with stats
- [ ] View company's assets and users
- [ ] Company settings management

---

## Phase 3: Global User Management (Priority: High)

### Module 3.1: Admin Users Page Enhancements

- [ ] Add pagination support
- [ ] Add "Create Superuser" modal functionality

### Module 3.2: Admin User Components

- [ ] `src/pages/admin/users/components/CreateSuperuserModal.tsx`
- [ ] `src/pages/admin/users/components/AssignCompanyModal.tsx`

---

## Phase 4: QR Inventory Management (Priority: High)

### Module 4.1: QR Inventory Page Enhancements

- [ ] Add pagination support
- [ ] Add bulk selection for allocation

### Module 4.2: QR Inventory Components

- [ ] `src/pages/admin/qr-inventory/components/BulkImportModal.tsx` - CSV upload
- [ ] `src/pages/admin/qr-inventory/components/AllocateModal.tsx` - Bulk allocate to company
- [ ] Export functionality (CSV)

---

## Phase 5: System Monitoring (Priority: Medium)

### Module 5.1: Monitoring Dashboard Enhancements

- [ ] Add real-time refresh toggle
- [ ] Add historical charts for API response time
- [ ] Add system health indicators

### Module 5.2: Monitoring Components

- [ ] `src/pages/admin/monitoring/components/FlaggedVerifications.tsx`
- [ ] `src/pages/admin/monitoring/components/SystemHealthChart.tsx`

---

## Phase 6: Audit Logs (Priority: Low)

### Module 6.1: Audit Log Page Enhancements

- [ ] Add date range filter
- [ ] Add user filter
- [ ] Add export functionality
- [ ] Add detailed change view modal

---

## Phase 7: Polish & Integration (Priority: Low)

### Module 7.1: Role-Based Access Control

- [ ] Add route guards for `system_admin` role
- [ ] Hide admin navigation for non-admin users
- [ ] Add permission checks on API calls

### Module 7.2: UI/UX Enhancements

- [ ] Loading skeletons for all admin pages ✅
- [ ] Empty states ✅
- [ ] Confirmation dialogs for destructive actions
- [ ] Toast notifications

---

## File Structure (Phase 1 Complete)

```
src/
├── api/services/
│   ├── adminService.ts       ✅ Admin monitoring APIs
│   ├── companyService.ts     ✅ Company CRUD (customer)
│   └── qrService.ts          ✅ QR inventory APIs
├── _mock/
│   ├── handlers/
│   │   ├── admin.ts          ✅ Admin endpoints
│   │   ├── company.ts        ✅ Company handlers
│   │   └── qrCodes.ts        ✅ QR handlers
│   └── data/
│       └── companies.ts      ✅ Mock companies
├── pages/admin/
│   ├── companies/
│   │   ├── index.tsx         ✅
│   │   └── components/
│   │       └── CompanyTable.tsx ✅
│   ├── users/
│   │   ├── index.tsx         ✅
│   │   └── components/
│   │       └── AdminUserTable.tsx ✅
│   ├── qr-inventory/
│   │   ├── index.tsx         ✅
│   │   └── components/
│   │       └── QRTable.tsx   ✅
│   ├── monitoring/
│   │   ├── index.tsx         ✅
│   │   └── components/
│   │       └── SyncQueueTable.tsx ✅
│   └── audit-logs/
│       └── index.tsx         ✅
└── types/
    └── entity.ts             ✅ + Company, QRCode, SyncQueue, etc.
```

---

## Navigation Structure (Admin)

```
🏢 Companies          /admin/companies      ✅
👥 All Users          /admin/users          ✅
📱 QR Inventory       /admin/qr-inventory   ✅
📊 Monitoring         /admin/monitoring     ✅
📜 Audit Logs         /admin/audit-logs     ✅
```

---

## Implementation Order

1. **Phase 1** - Foundation (Routes, Services, Types) - ✅ COMPLETED
2. **Phase 2** - Company Management - 2 days
3. **Phase 3** - Global User Management - 1-2 days
4. **Phase 4** - QR Inventory - 2 days
5. **Phase 5** - System Monitoring - 1-2 days
6. **Phase 6** - Audit Logs - 1 day
7. **Phase 7** - Polish - 1 day

**Total Estimated: 9-12 days**

---

## Ready for Phase 2?

Phase 1 is complete. The admin panel foundation is in place with:

- Routes and navigation configured
- API services created
- MSW handlers with mock data
- All 5 admin pages with basic functionality

Confirm to proceed with **Phase 2: Company Management** (full CRUD with modals).
