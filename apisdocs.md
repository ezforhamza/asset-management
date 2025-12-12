# Technical Specification - Asset Verification App

## For Backend Development Team

**Project:** Asset Verification Application  
**Last Updated:** December 7, 2025  
**Backend Lead:** [Name]

---

## 1. Technology Stack

- **Backend:** Node.js + Express.js
- **Database:** MongoDB (with 2dsphere geospatial indexes)
- **Authentication:** JWT (JSON Web Tokens)
- **File Storage:** AWS S3 (or compatible)
- **Email:** SendGrid or AWS SES
- **Cache/Queue:** Redis + Bull Queue

---

## 2. Database Schema (MongoDB Collections)

### 2.1 Users Collection

```javascript
{
  _id: ObjectId,
  email: String (unique, indexed),
  passwordHash: String,
  name: String,
  role: String, // 'field_user', 'customer_admin', 'system_admin'
  companyId: ObjectId, // Reference to Companies
  createdAt: Date,
  lastLogin: Date,
  mfaEnabled: Boolean,
  mfaSecret: String (if enabled),
  mustChangePassword: Boolean, // true for first-time login
  passwordResetToken: String, // for forgot password flow
  passwordResetExpires: Date,
  status: String, // 'active', 'inactive'
  fcmToken: String, // for push notifications
  devicePlatform: String // 'android', 'ios'
}
```

### 2.2 Companies Collection (Multi-tenant)

```javascript
{
  _id: ObjectId,
  companyName: String,
  contactEmail: String,
  settings: {
    verificationFrequency: Number, // default days
    geofenceThreshold: Number, // default 20 meters
    allowGPSOverride: Boolean,
    imageRetentionDays: Number,
    repairNotificationEmails: [String] // 2-3 email addresses
  },
  createdAt: Date,
  isActive: Boolean
}
```

### 2.3 Assets Collection

```javascript
{
  _id: ObjectId,
  companyId: ObjectId, // Multi-tenant isolation
  qrCodeId: ObjectId, // Reference to QR_Codes
  serialNumber: String,
  make: String,
  model: String,
  registeredLocation: {
    type: "Point",
    coordinates: [longitude, latitude] // GeoJSON format
  },
  locationAccuracy: Number, // meters
  registeredBy: ObjectId, // Reference to Users
  registeredAt: Date,
  status: String, // 'active', 'retired', 'transferred'
  verificationFrequency: Number, // days (overrides company default)
  lastVerifiedAt: Date,
  nextVerificationDue: Date,
  photos: [String], // S3 URLs
  createdAt: Date,
  updatedAt: Date
}

// IMPORTANT: Create 2dsphere index on registeredLocation
db.assets.createIndex({ "registeredLocation": "2dsphere" })
```

### 2.4 Verifications Collection

```javascript
{
  _id: ObjectId,
  assetId: ObjectId,
  companyId: ObjectId,
  verifiedBy: ObjectId, // Reference to Users
  verifiedAt: Date,
  scanLocation: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  scanLocationAccuracy: Number,
  distanceFromAsset: Number, // computed distance in meters
  gpsCheckPassed: Boolean,
  gpsRetryCount: Number, // 0-3
  gpsOverrideUsed: Boolean,
  photos: [String], // S3 URLs (1-2 photos)
  checklist: {
    conditionStatus: String, // 'good', 'fair', 'poor'
    operationalStatus: String, // 'operational', 'needs_repair', 'non_operational'
    repairNotes: String
  },
  repairNeeded: Boolean,
  repairEmailSent: Boolean,
  investigationStatus: String, // null, 'open', 'investigating', 'resolved'
  investigationComments: [String],
  createdAt: Date
}
```

### 2.5 QR_Codes Collection

```javascript
{
  _id: ObjectId,
  qrCode: String (unique, indexed),
  companyId: ObjectId, // null if unallocated
  assetId: ObjectId, // null if not linked to asset
  status: String, // 'available', 'allocated', 'used', 'retired'
  allocatedAt: Date,
  linkedAt: Date,
  createdAt: Date
}
```

### 2.6 AuditLog Collection

```javascript
{
  _id: ObjectId,
  entityType: String, // 'asset', 'verification', 'qr_code', 'user'
  entityId: ObjectId,
  action: String, // 'created', 'updated', 'deleted', 'status_changed'
  performedBy: ObjectId,
  changes: Object, // old and new values
  timestamp: Date,
  ipAddress: String
}
```

### 2.7 SyncQueue Collection (for offline sync)

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  deviceId: String,
  queueData: Object, // registration or verification data
  syncStatus: String, // 'pending', 'processing', 'completed', 'failed'
  attempts: Number,
  error: String,
  createdAt: Date,
  processedAt: Date
}
```

### 2.8 ScheduledReports Collection

```javascript
{
  _id: ObjectId,
  companyId: ObjectId,
  frequency: String, // 'daily', 'weekly', 'monthly'
  dayOfWeek: Number, // 0-6 for weekly
  dayOfMonth: Number, // 1-31 for monthly
  recipients: [String], // email addresses
  reportType: String, // 'verification_summary', 'overdue_assets'
  includeAttachment: Boolean, // CSV attachment
  isActive: Boolean,
  lastSent: Date,
  nextScheduled: Date,
  createdAt: Date,
  createdBy: ObjectId
}
```

---

## 3. API Endpoints

### 3.1 Authentication Endpoints

**POST /api/auth/register**

```javascript
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe",
  "companyId": "company_id_here"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "userId": "user_id_here"
}
```

**POST /api/auth/login**

```javascript
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response:
{
  "success": true,
  "accessToken": "jwt_token_here", // expires 15 mins
  "refreshToken": "refresh_token_here", // expires 7 days
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "field_user",
    "companyId": "company_id"
  }
}
```

**POST /api/auth/refresh**

```javascript
Request:
{
  "refreshToken": "refresh_token_here"
}

Response:
{
  "accessToken": "new_jwt_token"
}
```

**POST /api/auth/forgot-password**

```javascript
Request:
{
  "email": "user@example.com"
}

Response:
{
  "success": true,
  "message": "Password reset link sent to email"
}
```

**POST /api/auth/reset-password**

```javascript
Request:
{
  "resetToken": "token_from_email",
  "newPassword": "NewSecurePass123"
}

Response:
{
  "success": true,
  "message": "Password reset successfully"
}
```

**POST /api/auth/change-password**

```javascript
// For first-time login or user-initiated change
Request:
{
  "currentPassword": "TempPass123",
  "newPassword": "NewSecurePass123"
}

Response:
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### 3.2 User Management Endpoints (Customer Admin)

**POST /api/users/create-field-worker**

```javascript
// Customer admin creates field worker
Request:
{
  "name": "Ali Ahmed",
  "email": "ali@company.com",
  "role": "field_user"
  // companyId auto-filled from admin's JWT
}

Response:
{
  "success": true,
  "userId": "user_id_here",
  "temporaryPassword": "TempPass123",
  "message": "User created. Invitation email sent."
}
```

**GET /api/users**

```javascript
// Get all users for customer's company
Query params: ?role=field_user&status=active

Response:
{
  "success": true,
  "users": [
    {
      "_id": "user_id",
      "name": "Ali Ahmed",
      "email": "ali@company.com",
      "role": "field_user",
      "status": "active",
      "lastLogin": "2025-01-05T10:30:00Z",
      "createdAt": "2025-01-01T09:00:00Z",
      "mustChangePassword": false
    }
  ]
}
```

**PUT /api/users/:userId**

```javascript
// Update user details
Request:
{
  "name": "Ali Ahmed Updated",
  "role": "manager"
}

Response:
{
  "success": true,
  "message": "User updated successfully"
}
```

**PUT /api/users/:userId/deactivate**

```javascript
// Deactivate user (don't delete - preserve audit trail)
Response:
{
  "success": true,
  "message": "User deactivated"
}
```

**POST /api/users/:userId/reset-password**

```javascript
// Admin resets user password
Response:
{
  "success": true,
  "temporaryPassword": "NewTemp456",
  "message": "Password reset. User will be prompted to change on next login."
}
```

---

### 3.3 QR Code Endpoints

**GET /api/qr/:qrCode**

```javascript
// Check QR code status - is it linked to an asset?
Response:
{
  "success": true,
  "qrCode": "QR123456",
  "status": "available", // or "used"
  "asset": null // or asset object if linked
}
```

**POST /api/qr/allocate**

```javascript
// Allocate QR code to company (admin only)
Request:
{
  "qrCodes": ["QR001", "QR002", "QR003"],
  "companyId": "company_id_here"
}

Response:
{
  "success": true,
  "allocated": 3
}
```

**POST /api/qr/bulk-import**

```javascript
// Bulk import QR codes from CSV (admin only)
Request: FormData with CSV file
CSV format: qrCode,companyId (optional)

Response:
{
  "success": true,
  "imported": 1000,
  "duplicates": 5,
  "errors": []
}
```

---

### 3.4 Asset Endpoints

**POST /api/assets/register**

```javascript
// Register new asset (links QR code to asset)
Request:
{
  "qrCode": "QR123456",
  "serialNumber": "SN98765",
  "make": "Caterpillar",
  "model": "320E",
  "location": {
    "latitude": 30.3753,
    "longitude": 69.3451
  },
  "locationAccuracy": 5.2, // meters
  "photos": ["base64_photo_1", "base64_photo_2"]
}

Response:
{
  "success": true,
  "assetId": "asset_id_here",
  "message": "Asset registered successfully"
}
```

**GET /api/assets/:assetId**

```javascript
// Get single asset details
Response:
{
  "success": true,
  "asset": {
    "_id": "asset_id",
    "serialNumber": "SN98765",
    "make": "Caterpillar",
    "model": "320E",
    "location": {...},
    "lastVerifiedAt": "2025-01-05T10:30:00Z",
    "nextVerificationDue": "2025-01-12T10:30:00Z",
    "photos": ["s3_url_1", "s3_url_2"]
  }
}
```

**GET /api/assets**

```javascript
// Get all assets for company (with filters)
Query params:
?status=active&page=1&limit=50

Response:
{
  "success": true,
  "assets": [...],
  "pagination": {
    "total": 500,
    "page": 1,
    "pages": 10
  }
}
```

**PUT /api/assets/:assetId**

```javascript
// Update asset details
Request:
{
  "make": "Updated Make",
  "verificationFrequency": 30 // days
}

Response:
{
  "success": true,
  "message": "Asset updated"
}
```

---

### 3.5 Verification Endpoints

**POST /api/verifications/submit**

```javascript
// Submit verification (with GPS check)
Request:
{
  "assetId": "asset_id_here",
  "location": {
    "latitude": 30.3755,
    "longitude": 69.3449
  },
  "locationAccuracy": 3.8,
  "photos": ["base64_photo_1", "base64_photo_2"],
  "checklist": {
    "conditionStatus": "good",
    "operationalStatus": "operational",
    "repairNotes": ""
  },
  "gpsRetryCount": 0
}

Response (GPS check passed):
{
  "success": true,
  "verificationId": "verification_id",
  "gpsCheckPassed": true,
  "distance": 15.2, // meters
  "message": "Verification submitted successfully"
}

Response (GPS check failed):
{
  "success": false,
  "gpsCheckPassed": false,
  "distance": 25.8, // meters (> 20m threshold)
  "retriesRemaining": 2,
  "message": "GPS location does not match. Distance: 25.8m. Please retry."
}

Response (GPS override used after 3 retries):
{
  "success": true,
  "verificationId": "verification_id",
  "gpsOverrideUsed": true,
  "investigationStatus": "open",
  "message": "Verification submitted with GPS override. Flagged for investigation."
}
```

**GET /api/verifications/asset/:assetId**

```javascript
// Get verification history for an asset
Response:
{
  "success": true,
  "verifications": [
    {
      "_id": "verification_id",
      "verifiedAt": "2025-01-05T10:30:00Z",
      "verifiedBy": "user_name",
      "distance": 15.2,
      "gpsCheckPassed": true,
      "photos": ["s3_url_1", "s3_url_2"],
      "checklist": {...}
    }
  ]
}
```

**PUT /api/verifications/:verificationId/investigate**

```javascript
// Update investigation status (admin only)
Request:
{
  "investigationStatus": "investigating",
  "comment": "Checking with field team about GPS discrepancy"
}

Response:
{
  "success": true,
  "message": "Investigation status updated"
}
```

---

### 3.6 Report & Map Endpoints

**GET /api/reports/verifications**

```javascript
// Get verification report with filters
Query params:
?startDate=2025-01-01&endDate=2025-01-31&status=overdue

Response:
{
  "success": true,
  "data": [
    {
      "assetId": "...",
      "serialNumber": "SN98765",
      "lastVerified": "2025-01-05",
      "nextDue": "2025-01-12",
      "status": "due_soon", // 'on_time', 'due_soon', 'overdue'
      "location": {...}
    }
  ]
}
```

**GET /api/map/assets**

```javascript
// Get all assets with location for map display
Response:
{
  "success": true,
  "assets": [
    {
      "assetId": "...",
      "serialNumber": "SN98765",
      "location": {
        "latitude": 30.3753,
        "longitude": 69.3451
      },
      "status": "on_time", // determines pin color
      "lastVerified": "2025-01-05"
    }
  ]
}
```

**GET /api/reports/export**

```javascript
// Export report as CSV or PDF
Query params:
?format=csv&startDate=2025-01-01&endDate=2025-01-31

Response: File download
```

**POST /api/reports/schedule**

```javascript
// Schedule automated email reports
Request:
{
  "frequency": "weekly", // "daily", "weekly", "monthly"
  "dayOfWeek": 1, // 0-6 (Monday-Sunday) for weekly
  "dayOfMonth": 1, // 1-31 for monthly
  "recipients": ["manager@company.com", "admin@company.com"],
  "reportType": "verification_summary", // or "overdue_assets"
  "includeAttachment": true // CSV attachment
}

Response:
{
  "success": true,
  "scheduleId": "schedule_id_here",
  "message": "Report scheduled successfully"
}
```

**GET /api/reports/schedules**

```javascript
// Get all scheduled reports for company
Response:
{
  "success": true,
  "schedules": [
    {
      "_id": "schedule_id",
      "frequency": "weekly",
      "recipients": ["manager@company.com"],
      "lastSent": "2025-01-05T09:00:00Z",
      "nextScheduled": "2025-01-12T09:00:00Z",
      "isActive": true
    }
  ]
}
```

**DELETE /api/reports/schedules/:scheduleId**

```javascript
// Delete scheduled report
Response:
{
  "success": true,
  "message": "Scheduled report deleted"
}
```

---

### 3.7 Push Notification Endpoints

**POST /api/notifications/register-device**

```javascript
// Register mobile device for push notifications
Request:
{
  "userId": "user_id",
  "deviceToken": "fcm_or_apns_token",
  "platform": "android" // or "ios"
}

Response:
{
  "success": true,
  "message": "Device registered for notifications"
}
```

**POST /api/notifications/send**

```javascript
// Send push notification (system use - cron jobs)
Request:
{
  "userId": "user_id",
  "title": "Verification Overdue",
  "body": "Asset SN12345 verification is 3 days overdue",
  "data": {
    "type": "overdue_verification",
    "assetId": "asset_id"
  }
}

Response:
{
  "success": true,
  "message": "Notification sent"
}
```

---

### 3.8 Offline Sync Endpoint

**POST /api/sync/upload**

```javascript
// Handle batch sync from offline devices
Request:
{
  "deviceId": "device_unique_id",
  "syncData": [
    {
      "type": "registration", // or "verification"
      "timestamp": "2025-01-05T10:30:00Z",
      "data": {
        // registration or verification data
      }
    }
  ]
}

Response:
{
  "success": true,
  "processed": 5,
  "conflicts": [
    {
      "type": "duplicate_qr",
      "qrCode": "QR123",
      "message": "QR code already registered by another user"
    }
  ]
}
```

---

### 3.9 Admin Endpoints

**POST /api/admin/companies**

```javascript
// Create new company (system admin only)
Request:
{
  "companyName": "ABC Industries",
  "contactEmail": "admin@abc.com",
  "settings": {
    "verificationFrequency": 30,
    "geofenceThreshold": 20,
    "repairNotificationEmails": ["repair@abc.com"]
  }
}

Response:
{
  "success": true,
  "companyId": "company_id_here"
}
```

**GET /api/admin/monitoring**

```javascript
// System health monitoring
Response:
{
  "queuedUploads": 12,
  "failedSyncs": 3,
  "flaggedVerifications": 5,
  "apiResponseTime": 250, // ms
  "dbConnections": 5
}
```

---

## 4. Business Logic Rules

### 4.1 GPS Proximity Verification

```javascript
// Haversine distance formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in meters
}

// GPS Check Logic
if (distance > company.settings.geofenceThreshold) {
  if (gpsRetryCount < 3) {
    return { success: false, retriesRemaining: 3 - gpsRetryCount };
  } else {
    // Allow override after 3 retries
    verification.gpsOverrideUsed = true;
    verification.investigationStatus = "open";
  }
}
```

### 4.2 Verification Status Calculation

```javascript
function getVerificationStatus(asset) {
  const now = new Date();
  const daysUntilDue =
    (asset.nextVerificationDue - now) / (1000 * 60 * 60 * 24);

  if (daysUntilDue > 7) return "on_time"; // Green
  if (daysUntilDue > 0) return "due_soon"; // Orange
  return "overdue"; // Red
}
```

### 4.3 Photo Compression

```javascript
// Use 'sharp' package for image compression
const sharp = require("sharp");

async function compressImage(base64Image) {
  const buffer = Buffer.from(base64Image, "base64");
  const compressed = await sharp(buffer)
    .jpeg({ quality: 80 }) // 80% quality
    .toBuffer();

  return compressed;
}
```

### 4.4 Repair Email Trigger

```javascript
// When checklist.operationalStatus === 'needs_repair' || 'non_operational'
if (verification.checklist.operationalStatus !== "operational") {
  const emails = company.settings.repairNotificationEmails;
  await sendRepairNotification(emails, verification);
  verification.repairEmailSent = true;
}
```

---

## 5. Security Implementation

### 5.1 JWT Authentication

```javascript
// Generate JWT
const jwt = require("jsonwebtoken");

function generateTokens(user) {
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
}

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}
```

### 5.2 Multi-tenant Data Isolation

```javascript
// Always filter by companyId for non-admin users
function getCompanyAssets(req, res) {
  const { companyId } = req.user; // from JWT

  const assets = await Asset.find({ companyId });
  res.json({ assets });
}
```

### 5.3 Input Validation

```javascript
// Use Joi for validation
const Joi = require("joi");

const assetRegistrationSchema = Joi.object({
  qrCode: Joi.string().required(),
  serialNumber: Joi.string().required(),
  make: Joi.string().required(),
  model: Joi.string().required(),
  location: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
  }).required(),
});
```

---

## 6. Error Handling

### 6.1 Standard Error Response Format

```javascript
{
  "success": false,
  "error": "Error message here",
  "code": "GPS_CHECK_FAILED", // error code for client
  "details": {} // optional additional info
}
```

### 6.2 Common Error Codes

- `UNAUTHORIZED` - Invalid/expired token
- `QR_NOT_FOUND` - QR code doesn't exist
- `QR_ALREADY_USED` - QR code already linked to asset
- `GPS_CHECK_FAILED` - Distance > threshold
- `ASSET_NOT_FOUND` - Asset doesn't exist
- `PERMISSION_DENIED` - User doesn't have permission

---

## 7. Performance Optimization

### 7.1 Database Indexes

```javascript
// Create these indexes for performance
db.assets.createIndex({ companyId: 1, status: 1 });
db.assets.createIndex({ nextVerificationDue: 1 });
db.qr_codes.createIndex({ qrCode: 1 }, { unique: true });
db.verifications.createIndex({ assetId: 1, verifiedAt: -1 });
db.users.createIndex({ email: 1 }, { unique: true });
```

### 7.2 Caching Strategy

```javascript
// Use Redis for frequently accessed data
const redis = require("redis");
const client = redis.createClient();

// Cache company settings for 1 hour
async function getCompanySettings(companyId) {
  const cached = await client.get(`company:${companyId}:settings`);
  if (cached) return JSON.parse(cached);

  const settings = await Company.findById(companyId).select("settings");
  await client.setEx(
    `company:${companyId}:settings`,
    3600,
    JSON.stringify(settings)
  );

  return settings;
}
```

---

## 8. Deployment Notes

### 8.1 Environment Variables

```bash
# .env file
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/asset_verification
JWT_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
AWS_S3_BUCKET=asset-photos
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
SENDGRID_API_KEY=your_sendgrid_key
REDIS_URL=redis://localhost:6379
```

### 8.2 Docker Setup

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 9. Testing Requirements

### 9.1 Unit Tests

- Test GPS distance calculation accuracy
- Test JWT token generation/verification
- Test photo compression algorithm

### 9.2 Integration Tests

- Test complete registration flow
- Test complete verification flow with GPS checks
- Test offline sync conflict resolution

### 9.3 Performance Tests

- API response time < 500ms
- Database query optimization
- Load test with 1000 concurrent users

---

## Questions or Clarifications?

Contact Project Manager: [Your Name/Contact]
