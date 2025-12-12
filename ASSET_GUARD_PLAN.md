# Asset Guard Client Panel - Implementation Plan

## Overview

Building a modern, clean, fast, and scalable client portal for asset verification.

---

## Phase 1: Foundation & Auth (Priority: High)

### Module 1.1: API Layer Setup

- [ ] Create `src/api/services/authService.ts` - Auth API calls
- [ ] Create `src/api/services/assetService.ts` - Asset API calls
- [ ] Create `src/api/services/verificationService.ts` - Verification API calls
- [ ] Create `src/api/services/reportService.ts` - Report API calls
- [ ] Create `src/api/services/mapService.ts` - Map API calls
- [ ] Update `src/api/apiClient.ts` - JWT interceptor with auto-refresh

### Module 1.2: TypeScript Types

- [ ] Create `src/types/api.ts` - API response types
- [ ] Update `src/types/entity.ts` - Asset, Verification, User entities
- [ ] Update `src/types/enum.ts` - Status enums (on_time, due_soon, overdue)

### Module 1.3: Auth Store Update

- [ ] Update `src/store/userStore.ts` - JWT token management
- [ ] Add token refresh logic
- [ ] Add mustChangePassword handling

### Module 1.4: Login Page Redesign

- [ ] Redesign login page - modern, clean UI
- [ ] Remove signup/register option
- [ ] Remove mobile login, QR login options
- [ ] Keep only: Email/Password login
- [ ] Add "Forgot Password" flow
- [ ] Add "Change Password" page (for first-time login)
- [ ] Remove unnecessary auth pages

---

## Phase 2: Dashboard (Priority: High)

### Module 2.1: Dashboard Page

- [ ] Create `src/pages/dashboard/index.tsx` - Main dashboard
- [ ] Stats cards component:
  - Total Assets (number)
  - Verified This Month (number + %)
  - Due Soon (orange, count)
  - Overdue (red, count)
- [ ] Recent activity table (last 10 verifications)
- [ ] Quick action buttons

### Module 2.2: Dashboard Components

- [ ] `src/pages/dashboard/components/StatsCard.tsx`
- [ ] `src/pages/dashboard/components/RecentActivity.tsx`
- [ ] `src/pages/dashboard/components/StatusBadge.tsx`

---

## Phase 3: Reports Page (Priority: High)

### Module 3.1: Reports Table

- [ ] Create `src/pages/reports/index.tsx` - Reports page
- [ ] Data table with columns:
  - Asset Serial Number
  - Make / Model
  - Last Verified (date + time)
  - Verified By (user name)
  - Distance (meters)
  - Status (color-coded badge)
  - Photos (thumbnail)
  - Actions (view details)
- [ ] Sortable columns
- [ ] Pagination (50 per page)

### Module 3.2: Reports Filters

- [ ] `src/pages/reports/components/ReportFilters.tsx`
- [ ] Date range picker
- [ ] Status dropdown (All/On Time/Due Soon/Overdue)
- [ ] Verified by dropdown
- [ ] Search box (serial number)

### Module 3.3: Report Detail Modal

- [ ] `src/pages/reports/components/VerificationDetail.tsx`
- [ ] Asset information section
- [ ] Verification details section
- [ ] Checklist responses
- [ ] Photo gallery with lightbox
- [ ] Investigation section (if flagged)

### Module 3.4: Export & Schedule

- [ ] Export CSV/PDF buttons
- [ ] Schedule report modal
- [ ] Scheduled reports list

---

## Phase 4: Map Page (Priority: High)

### Module 4.1: Map Integration

- [ ] Create `src/pages/map/index.tsx` - Map page
- [ ] Install Leaflet or use Google Maps
- [ ] Color-coded pins:
  - Green: On Time
  - Orange: Due Soon
  - Red: Overdue
- [ ] Pin clustering for dense areas

### Module 4.2: Map Features

- [ ] `src/pages/map/components/MapFilters.tsx` - Status filters
- [ ] `src/pages/map/components/AssetPopup.tsx` - Pin popup
- [ ] Click pin → Show asset details
- [ ] "View Details" button in popup

---

## Phase 5: User Management (Priority: Medium)

### Module 5.1: Users Page (Customer Admin Only)

- [ ] Create `src/pages/users/index.tsx` - Users page
- [ ] Users table with columns:
  - Name
  - Email
  - Role
  - Last Login
  - Status (Active/Inactive)
  - Actions (Edit/Deactivate/Reset Password)

### Module 5.2: User CRUD

- [ ] `src/pages/users/components/AddUserModal.tsx`
- [ ] `src/pages/users/components/EditUserModal.tsx`
- [ ] Reset password confirmation dialog
- [ ] Deactivate user confirmation

---

## Phase 6: Settings Page (Priority: Medium)

### Module 6.1: Settings Page

- [ ] Create `src/pages/settings/index.tsx` - Settings page
- [ ] Verification frequency configuration
- [ ] Notification settings
- [ ] Email recipients for overdue alerts

### Module 6.2: QR Code Management

- [ ] `src/pages/settings/components/QRInventory.tsx`
- [ ] QR code inventory table
- [ ] CSV upload for QR codes
- [ ] Bulk import assets

### Module 6.3: Scheduled Reports

- [ ] `src/pages/settings/components/ScheduledReports.tsx`
- [ ] List scheduled reports
- [ ] Create/Edit/Delete schedules

---

## Phase 7: Polish & Optimization (Priority: Low)

### Module 7.1: UI/UX Enhancements

- [ ] Loading skeletons for all pages
- [ ] Empty states with illustrations
- [ ] Error boundaries
- [ ] Toast notifications for all actions

### Module 7.2: Performance

- [ ] React Query caching strategy
- [ ] Lazy loading for routes
- [ ] Image optimization

### Module 7.3: Responsive Design

- [ ] Mobile-friendly tables
- [ ] Collapsible sidebar on mobile
- [ ] Touch-friendly interactions

---

## File Structure

```
src/
├── api/
│   └── services/
│       ├── authService.ts      # Auth API
│       ├── assetService.ts     # Asset API
│       ├── userService.ts      # User management API
│       ├── verificationService.ts
│       ├── reportService.ts
│       └── mapService.ts
├── pages/
│   ├── dashboard/
│   │   ├── index.tsx
│   │   └── components/
│   │       ├── StatsCard.tsx
│   │       ├── RecentActivity.tsx
│   │       └── StatusBadge.tsx
│   ├── reports/
│   │   ├── index.tsx
│   │   └── components/
│   │       ├── ReportFilters.tsx
│   │       ├── ReportTable.tsx
│   │       ├── VerificationDetail.tsx
│   │       └── ExportButtons.tsx
│   ├── map/
│   │   ├── index.tsx
│   │   └── components/
│   │       ├── MapFilters.tsx
│   │       ├── AssetMarker.tsx
│   │       └── AssetPopup.tsx
│   ├── users/
│   │   ├── index.tsx
│   │   └── components/
│   │       ├── UsersTable.tsx
│   │       ├── AddUserModal.tsx
│   │       └── EditUserModal.tsx
│   ├── settings/
│   │   ├── index.tsx
│   │   └── components/
│   │       ├── VerificationSettings.tsx
│   │       ├── NotificationSettings.tsx
│   │       ├── QRInventory.tsx
│   │       └── ScheduledReports.tsx
│   └── sys/
│       ├── login/           # Simplified login
│       ├── forgot-password/ # New
│       ├── reset-password/  # New
│       └── change-password/ # New (first-time)
├── types/
│   ├── entity.ts    # Asset, Verification, User types
│   ├── enum.ts      # Status enums
│   └── api.ts       # API response types
└── hooks/
    ├── useAssets.ts
    ├── useVerifications.ts
    ├── useReports.ts
    └── useMap.ts
```

---

## Navigation Structure

```
📊 Dashboard          /dashboard
📋 Reports            /reports
🗺️ Map                /map
👥 Users              /users        (customer_admin only)
⚙️ Settings           /settings     (customer_admin only)
```

---

## Design Tokens

```css
/* Status Colors */
--status-on-time: #10b981; /* Green */
--status-due-soon: #f59e0b; /* Orange */
--status-overdue: #ef4444; /* Red */

/* Primary */
--primary: #2563eb; /* Blue */

/* Background */
--bg-primary: #ffffff;
--bg-secondary: #f9fafb;

/* Text */
--text-primary: #1f2937;
--text-secondary: #6b7280;
```

---

## Implementation Order

1. **Phase 1** - Foundation (API, Types, Auth) - 2-3 days
2. **Phase 2** - Dashboard - 1 day
3. **Phase 3** - Reports - 2 days
4. **Phase 4** - Map - 1-2 days
5. **Phase 5** - User Management - 1 day
6. **Phase 6** - Settings - 1-2 days
7. **Phase 7** - Polish - 1 day

**Total Estimated: 9-12 days**

---

## Ready to Start?

Confirm this plan and we'll begin with **Phase 1: Foundation & Auth**.
