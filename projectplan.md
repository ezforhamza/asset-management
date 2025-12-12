# Product Requirements Document (PRD)

## Asset Verification Application

**For: Designer + Frontend Teams**  
**Version:** 1.0  
**Date:** December 7, 2025

---

## 1. Overview

### What We're Building

A mobile app and web portal that helps companies verify their physical assets (machinery, equipment) using QR codes and GPS location checks.

### Who Uses It

- **Field Workers:** Scan QR codes on assets, take photos, verify location
- **Managers:** View reports and maps of all assets
- **Admins:** Manage companies, users, and QR codes

---

## 2. Mobile App (Flutter) - User Flows

### 2.1 User Journey Map

```
Login → Scan QR → Is QR linked?
                      ↓               ↓
                   NO (Register)   YES (Verify)
                      ↓               ↓
              Take photos         Take photos
              Enter details       Check condition
              Capture GPS         GPS proximity check
                      ↓               ↓
              Save (sync later)   Save (sync later)
```

---

### 2.2 Screen-by-Screen Breakdown

#### Screen 1: Login Screen

**Purpose:** User authentication

**UI Elements:**

- App logo (center top)
- Email input field
- Password input field (with show/hide toggle)
- "Login" button (primary color, full width)
- "Forgot Password?" link (small text, bottom)

**User Actions:**

- Enter email and password
- Tap Login
- On success:
  - If mustChangePassword = true → Navigate to Change Password screen
  - Else → Navigate to QR Scanner
- On error → Show error message below button

**Error Messages:**

- "Invalid email or password"
- "Network error. Please check your connection."

---

#### Screen 1.5: First-Time Password Change

**Purpose:** Force password change for new users

**UI Elements:**

- Header: "Change Your Password"
- Info text: "For security, please change your temporary password"
- Current password input (read-only, pre-filled)
- New password input
- Confirm password input
- Password requirements text:
  - "Min 8 characters"
  - "At least 1 uppercase letter"
  - "At least 1 number"
- "Change Password" button

**User Actions:**

1. User enters new password
2. User confirms password
3. Tap "Change Password"
4. On success → Navigate to QR Scanner
5. On error → Show validation errors

---

#### Screen 1.6: Forgot Password

**Purpose:** Password reset flow

**UI Elements:**

- Header: "Reset Password"
- Info text: "Enter your email to receive reset link"
- Email input field
- "Send Reset Link" button
- "Back to Login" link

**User Actions:**

1. User enters email
2. Tap "Send Reset Link"
3. Show success message: "Reset link sent to your email"
4. User checks email
5. User clicks link in email
6. Opens reset password screen (web view or deep link)
7. User enters new password
8. Returns to mobile app
9. User logs in with new password

---

#### Screen 3: QR Scanner Screen

**Purpose:** Scan QR codes on assets

**UI Elements:**

- Camera viewfinder (full screen)
- QR code overlay frame (center)
- "Point camera at QR code" instruction text (top)
- Flash toggle button (top right)
- Back button (top left)
- Sync status indicator (bottom)
  - Green dot: "Online - Synced"
  - Yellow dot: "Offline - 3 items queued"
  - Red dot: "Sync failed - Retry"

**User Actions:**

- Point camera at QR code
- App automatically detects QR
- On detect → Check if QR is linked to asset
  - If NO → Navigate to Asset Registration
  - If YES → Navigate to Asset Verification

**Visual Feedback:**

- Green border flashes when QR detected
- Haptic feedback (vibration)
- Success sound

**Edge Cases:**

- Invalid QR code → Show toast: "Invalid QR code. Please try again."
- QR already used by another company → Show toast: "This QR code is not assigned to your company."

---

#### Screen 4: Asset Registration Form

**Purpose:** Register a new asset when QR code is scanned for first time

**UI Elements:**

- Header: "Register New Asset"
- QR Code display (read-only, shows scanned code)
- Input fields:
  - Serial Number (required)
  - Make (required)
  - Model (required)
- Photo capture section:
  - "Take Photos" button
  - Photo thumbnails (up to 3)
  - Tap thumbnail to view full size
- GPS indicator:
  - "Location captured: ✓" (green)
  - "Accuracy: 5.2 meters"
- "Submit" button (bottom, full width)

**User Actions:**

1. App auto-fills QR code from scan
2. User enters serial number, make, model
3. User taps "Take Photos" → Camera opens
4. User takes 1-3 photos
5. App captures GPS in background
6. User taps Submit
7. If online → Upload immediately
8. If offline → Queue for sync

**Validation:**

- All fields required except photos
- Show error below field if empty

**Success:**

- Show success message: "Asset registered successfully!"
- Navigate back to QR Scanner

**Offline Behavior:**

- Show banner: "Offline mode - Will sync when online"
- Data saved locally
- Show in sync queue count

---

#### Screen 5: Asset Verification Form

**Purpose:** Verify an existing asset

**UI Elements:**

- Header: "Verify Asset"
- Asset details (read-only):
  - Serial Number
  - Make / Model
  - Last verified date
- Photo capture:
  - "Take Photos" button
  - Photo thumbnails (1-2)
- Checklist:
  - "Condition" dropdown: Good / Fair / Poor
  - "Operational Status" dropdown: Operational / Needs Repair / Non-Operational
  - "Repair Notes" text area (optional)
- GPS proximity check:
  - Shows distance in real-time
  - ✓ Green: "Within 20m - Good"
  - ⚠️ Orange: "25m away - Please move closer"
  - ❌ Red: "35m away - Too far (Retry 2/3)"
- "Submit" button

**User Actions:**

1. User takes 1-2 photos
2. User selects condition and operational status
3. App checks GPS proximity automatically
4. If distance > 20m:
   - Show error message
   - "Retry" button (max 3 times)
   - After 3 retries → "Override" button appears
5. User taps Submit

**GPS Override Flow:**

- After 3 failed attempts, show dialog:
  - "Location is 35m away from registered location."
  - "This will be flagged for investigation."
  - "Override" button
  - "Cancel" button
- If Override → Verification submitted with flag

**Repair Notification:**

- If "Needs Repair" or "Non-Operational" selected
- Show info message: "Repair team will be notified"
- Email sent automatically to configured addresses

**Success:**

- "Verification submitted!"
- Navigate back to QR Scanner

---

#### Screen 6: Offline Sync Screen

**Purpose:** Show pending uploads and sync status

**UI Elements:**

- Header: "Sync Queue"
- List of pending items:
  - Asset registration (3 items)
  - Asset verification (5 items)
- Each item shows:
  - Type (registration/verification)
  - Asset serial number
  - Timestamp
  - Status: Pending / Uploading / Failed
- "Sync Now" button (if online)
- "Retry Failed" button

**User Actions:**

- View pending uploads
- Tap "Sync Now" to manually trigger sync
- Tap individual item to view details
- Delete failed items

---

### 2.3 Mobile App Design Guidelines

**Colors:**

- Primary: Blue (#2563EB)
- Success: Green (#10B981)
- Warning: Orange (#F59E0B)
- Error: Red (#EF4444)
- Background: White (#FFFFFF)
- Text: Dark Gray (#1F2937)

**Typography:**

- Headers: Bold, 20-24px
- Body: Regular, 16px
- Small text: Regular, 14px

**Buttons:**

- Primary: Filled, blue background, white text
- Secondary: Outlined, blue border
- Disabled: Gray background, gray text

**Spacing:**

- Padding: 16px (standard)
- Card spacing: 12px between elements

**Icons:**

- Use Material Icons or similar
- Consistent size: 24px

**Push Notifications:**

- Request notification permission on first QR scan
- Show notification badge when new alerts
- Tap notification → Open relevant asset
- Notification types:
  - Verification overdue: "Asset SN12345 is 3 days overdue"
  - Investigation update: "Your flagged verification was resolved"

---

## 3. Web Portal (Customer) - User Flows

### 3.1 Page Structure

```
Login → Dashboard
          ↓
    ┌─────┴─────┐
    ↓           ↓
Report Page   Map Page
```

---

### 3.2 Screen-by-Screen Breakdown

#### Page 1: Login Page

**Purpose:** User authentication

**UI Elements:**

- Company logo (top center)
- Login form (centered card):
  - Email input
  - Password input
  - "Remember me" checkbox
  - "Login" button
- "Forgot password?" link

---

#### Page 2: Dashboard (Landing Page)

**Purpose:** Overview of verification status

**UI Elements:**

- Navigation sidebar (left):
  - Dashboard (home icon)
  - Reports (document icon)
  - Map (location icon)
  - Users (people icon) - Customer Admin only
  - Settings (gear icon)
  - Logout
- Main content area:
  - Stats cards (top row):
    - Total Assets (number + icon)
    - Verified This Month (number + percentage)
    - Due Soon (number, orange)
    - Overdue (number, red)
  - Recent activity table:
    - Last 10 verifications
    - Columns: Asset, Verified By, Date, Status

---

#### Page 3: Report Page

**Purpose:** View and filter all verifications

**Layout:**

- Filters section (top):
  - Date range picker
  - Status dropdown: All / On Time / Due Soon / Overdue
  - Asset category dropdown
  - Verified by dropdown
  - Search box (serial number)
  - "Apply Filters" button
  - "Export CSV" / "Export PDF" buttons

**Table:**

- Columns:
  - Asset Serial Number
  - Make / Model
  - Last Verified (date + time)
  - Verified By (user name)
  - Distance (meters)
  - Status (color-coded badge)
  - Photos (thumbnail)
  - Actions (view details button)

**Table Features:**

- Sortable columns
- Pagination (50 per page)
- Row hover effect
- Click row → Opens detail modal

**Detail Modal (when row clicked):**

- Full screen or large modal
- Asset information (left column):
  - Serial Number
  - Make / Model
  - Registered location (coordinates)
- Verification details (right column):
  - Verified at (date + time)
  - Verified by (user name)
  - Scan location (coordinates)
  - Distance from asset
  - GPS check status (passed/override)
- Checklist responses:
  - Condition: Good/Fair/Poor
  - Operational Status
  - Repair Notes (if any)
- Photos:
  - Gallery view (thumbnails)
  - Click to view full size
- Investigation section (if flagged):
  - Status: Open / Investigating / Resolved
  - Comments timeline
  - Add comment field (if admin)

**Status Badge Colors:**

- Green: On Time
- Orange: Due Soon (< 7 days)
- Red: Overdue

---

#### Page 4: Map Page

**Purpose:** Visual overview of all assets on map

**Layout:**

- Filters panel (left sidebar):
  - Status checkboxes:
    - ☑ On Time (green)
    - ☑ Due Soon (orange)
    - ☑ Overdue (red)
  - Asset category filter
  - Date range filter
- Map (main area):
  - Color-coded pins:
    - Green: On Time
    - Orange: Due Soon
    - Red: Overdue
  - Pin clustering (when zoomed out)
  - Click pin → Info popup

**Pin Info Popup:**

- Asset serial number
- Make / Model
- Last verified: date
- Status badge
- "View Details" button → Opens detail modal

**Map Controls:**

- Zoom in/out
- Current location button
- Legend (bottom left)
- Fullscreen toggle

---

#### Page 5: User Management

**Purpose:** Manage field workers and users (Customer Admin only)

**Layout:**

- "Add User" button (top right)
- Filter section:
  - Role dropdown: All / Field Worker / Manager
  - Status dropdown: All / Active / Inactive
  - Search box (name or email)

**Users Table:**

- Columns:
  - Name
  - Email
  - Role (Field Worker / Manager)
  - Last Login (date + time)
  - Status (Active/Inactive badge)
  - Actions (Edit / Deactivate / Reset Password)

**Add User Modal:**

- Fields:
  - Name (required)
  - Email (required)
  - Role dropdown (Field Worker / Manager)
  - "Send invitation email" checkbox (checked by default)
- "Create User" button
- On success:
  - Show temporary password
  - "Copy Password" button
  - Send invitation email with login credentials

**Edit User Modal:**

- Update name
- Change role
- Cannot change email (security)

**Reset Password:**

- Confirmation dialog: "This will generate a new temporary password and email the user"
- On confirm: Show new temporary password
- User must change password on next login

**Deactivate User:**

- Confirmation dialog: "User will lose access but data will be preserved"
- On confirm: User status changes to Inactive
- Cannot deactivate yourself

**Permissions:**

- Only Customer Admin role can access this page
- Field Workers cannot see this page

---

#### Page 6: Settings Page

**Purpose:** Configure verification settings

**Sections:**

**1. Verification Frequency:**

- List of assets/asset groups
- Each row has frequency dropdown:
  - Daily
  - Weekly
  - Monthly
  - Custom (number of days)

**2. Notifications:**

- "Send overdue notifications after X days" input
- Email recipients list:
  - Add/remove email addresses
- "Send me daily summary" toggle

**3. QR Code Management:**

- "Upload QR Codes" button → CSV upload
- QR code inventory table:
  - QR Code
  - Status (Available/Used)
  - Assigned Asset (if used)
  - Actions (unlink button)

**4. Bulk Import:**

- "Import Assets" button → CSV upload
- CSV template download link
- Import history table

---

### 3.3 Web Portal Design Guidelines

**Layout:**

- Sidebar: 250px width, fixed
- Main content: Responsive, max-width 1400px
- Card-based design with shadows

**Colors:**

- Primary: Blue (#2563EB)
- Success: Green (#10B981)
- Warning: Orange (#F59E0B)
- Error: Red (#EF4444)
- Background: Light Gray (#F9FAFB)
- Card Background: White

**Typography:**

- Headers: Bold, 24-32px
- Subheaders: Semibold, 18-20px
- Body: Regular, 14-16px
- Table text: Regular, 14px

**Tables:**

- Striped rows (alternating gray)
- Hover: light blue background
- Headers: bold, gray background

---

## 4. Admin Panel - User Flows

### 4.1 Admin-Specific Pages

#### Page 1: Company Management

**Purpose:** Manage multiple companies (tenants)

**Layout:**

- "Add Company" button (top right)
- Companies table:
  - Company Name
  - Contact Email
  - Total Assets
  - Total Users
  - Status (Active/Inactive)
  - Actions (edit/delete)

**Add/Edit Company Form:**

- Company name
- Contact email
- Settings:
  - Default verification frequency
  - Geofence threshold (meters)
  - Allow GPS override (toggle)
  - Image retention days
  - Repair notification emails (list)

---

#### Page 2: User Management

**Purpose:** Manage users across all companies

**Layout:**

- "Add User" button
- Users table:
  - Name
  - Email
  - Company
  - Role (Field User/Admin/Superuser)
  - Last Login
  - Status (Active/Inactive)
  - Actions (edit/delete/reset password)

---

#### Page 3: QR Inventory Management

**Purpose:** Global QR code management

**Layout:**

- Bulk actions:
  - "Import QR Codes" (CSV)
  - "Allocate to Company" (bulk select)
  - "Export Inventory" (CSV)
- Search/filter:
  - QR code search
  - Status filter
  - Company filter
- QR codes table:
  - QR Code
  - Status
  - Company (if allocated)
  - Asset (if used)
  - Actions

---

#### Page 4: System Monitoring

**Purpose:** Monitor system health

**Dashboard Cards:**

- Queued Uploads: 12 pending
- Failed Syncs: 3 errors
- Flagged Verifications: 5 items
- API Response Time: 250ms average
- Database Connections: 5 active

**Charts:**

- Daily verifications trend (line chart)
- Assets by status (pie chart)
- User activity (bar chart)

---

## 5. User Interaction Patterns

### 5.1 Loading States

- Show spinner/skeleton for data loading
- "Loading..." text
- Disable buttons during submission

### 5.2 Error Handling

- Toast notifications for errors
- Red text below input fields for validation
- Error modal for critical failures

### 5.3 Success Feedback

- Green toast notification
- Success icon (checkmark)
- Haptic feedback (mobile)

### 5.4 Confirmation Dialogs

- Use for destructive actions:
  - Delete asset
  - Deactivate company
  - Remove user
- Modal with "Cancel" and "Confirm" buttons

---

## 6. Responsive Design Requirements

### Mobile App (Flutter):

- Portrait mode only
- Minimum screen: 4 inches
- Support Android 8+ and iOS 13+

### Web Portal:

- Desktop: 1280px - 1920px
- Tablet: 768px - 1024px
- Mobile: 375px - 767px (basic view)
- Sidebar collapses on tablet/mobile

---

## 7. Accessibility Requirements

- High contrast text (WCAG AA)
- Minimum font size: 14px
- Touch targets: 44x44px minimum
- Alt text for images
- Keyboard navigation support (web)

---

## 8. Design Deliverables Checklist

### Mobile App (Designer):

- [ ] Login screen
- [ ] First-time password change screen
- [ ] Forgot password screen
- [ ] QR scanner screen
- [ ] Asset registration form
- [ ] Asset verification form
- [ ] Offline sync screen
- [ ] Push notification design
- [ ] Error states for all screens
- [ ] Loading states for all screens
- [ ] Icon set (exported as SVG)
- [ ] Color palette documentation
- [ ] Typography specifications

### Web Portal (Designer):

- [ ] Login page
- [ ] Dashboard
- [ ] Report page (table view)
- [ ] Report detail modal
- [ ] Map page
- [ ] User management page
- [ ] Settings page
- [ ] Scheduled reports configuration
- [ ] Responsive layouts (desktop, tablet)
- [ ] Component library (buttons, inputs, cards)

### Admin Panel (Designer):

- [ ] Company management page
- [ ] User management page
- [ ] QR inventory page
- [ ] System monitoring dashboard

---

## 9. Assets & Resources Needed

### Icons:

- QR code icon
- Camera icon
- Location pin icon
- Map icon
- Document icon
- User icon
- Settings icon
- Upload icon
- Download icon
- Success/error/warning icons

### Images:

- Company logo
- Placeholder image (no photo available)
- Empty state illustrations

### Colors:

- See design guidelines above

---

## 10. Example Scenarios (For Testing)

### Scenario 1: Happy Path - Registration

1. User logs in
2. User scans new QR code
3. GPS accuracy is good (< 10m)
4. User enters asset details
5. User takes 2 photos
6. User submits
7. Success message shown
8. Data syncs immediately (online)

### Scenario 2: GPS Override

1. User scans existing asset
2. GPS shows 25m away
3. User tries 3 times
4. GPS still > 20m
5. User taps "Override"
6. Verification submitted with flag
7. Admin sees in investigation queue

### Scenario 3: Offline Mode

1. User loses internet
2. User scans QR code
3. User completes verification
4. Data saved locally
5. Sync queue shows "1 pending"
6. Internet reconnects
7. Data auto-syncs
8. Success notification shown

---

## Questions or Clarifications?

Contact Project Manager: [Your Name/Contact]

Figma Designs Due: End of Week 2 (Dec 22)
