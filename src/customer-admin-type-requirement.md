# Phase 11: Admin Types Testing

## Overview

This phase tests the new admin type differentiation system for `customer_admin` users:

- **Full Admin** (`adminType: 'full'`) - Can perform all operations
- **Read-Only Admin** (`adminType: 'read_only'`) - Can only view/read data

## Prerequisites

1. Run the migration script first:

   ```bash
   node scripts/migrateAdminTypes.js
   ```

2. Ensure you have test accounts:
   - A company with a default full admin
   - A read-only admin user
   - A field worker user

---

## Test Cases

### 1. Company Creation - Default Admin

**Test 1.1: Default admin should have adminType = 'full'**

```
POST /api/v1/companies
Authorization: Bearer <system_admin_token>

{
  "companyName": "Test Company Admin Types",
  "contactEmail": "contact@testadmintypes.com",
  "admin": {
    "name": "Default Admin",
    "email": "default@testadmintypes.com",
    "password": "Password123"
  }
}
```

**Expected Response:**

- Status: 201 Created
- `admin.adminType` should be `"full"`
- `admin.isDefaultAdmin` should be `true`

---

### 2. User Creation by Admin Types

**Test 2.1: Full admin can create field_user**

```
POST /api/v1/users
Authorization: Bearer <full_admin_token>

{
  "name": "Test Field Worker",
  "email": "fieldworker@test.com",
  "role": "field_user"
}
```

**Expected Response:**

- Status: 201 Created

---

**Test 2.2: Full admin can create customer_admin with adminType**

```
POST /api/v1/users
Authorization: Bearer <full_admin_token>

{
  "name": "Read Only Admin",
  "email": "readonly@test.com",
  "role": "customer_admin",
  "adminType": "read_only"
}
```

**Expected Response:**

- Status: 201 Created
- `user.adminType` should be `"read_only"`

---

**Test 2.3: Full admin can create another full admin**

```
POST /api/v1/users
Authorization: Bearer <full_admin_token>

{
  "name": "Another Full Admin",
  "email": "fulladmin2@test.com",
  "role": "customer_admin",
  "adminType": "full"
}
```

**Expected Response:**

- Status: 201 Created
- `user.adminType` should be `"full"`

---

**Test 2.4: Read-only admin CANNOT create users**

```
POST /api/v1/users
Authorization: Bearer <read_only_admin_token>

{
  "name": "Test User",
  "email": "testuser@test.com",
  "role": "field_user"
}
```

**Expected Response:**

- Status: 403 Forbidden
- Message: "Read-only administrators cannot perform write operations..."

---

### 3. Read Operations by Read-Only Admin

**Test 3.1: Read-only admin CAN view dashboard**

```
GET /api/v1/dashboard
Authorization: Bearer <read_only_admin_token>
```

**Expected Response:**

- Status: 200 OK
- Should return dashboard data

---

**Test 3.2: Read-only admin CAN view users list**

```
GET /api/v1/users
Authorization: Bearer <read_only_admin_token>
```

**Expected Response:**

- Status: 200 OK
- Should return users list

---

**Test 3.3: Read-only admin CAN view assets list**

```
GET /api/v1/assets
Authorization: Bearer <read_only_admin_token>
```

**Expected Response:**

- Status: 200 OK
- Should return assets list

---

**Test 3.4: Read-only admin CAN view asset details**

```
GET /api/v1/assets/:assetId
Authorization: Bearer <read_only_admin_token>
```

**Expected Response:**

- Status: 200 OK
- Should return asset details

---

**Test 3.5: Read-only admin CAN view reports**

```
GET /api/v1/reports/verifications
Authorization: Bearer <read_only_admin_token>
```

**Expected Response:**

- Status: 200 OK
- Should return report data

---

### 4. Write Operations Blocked for Read-Only Admin

**Test 4.1: Read-only admin CANNOT create assets**

```
POST /api/v1/assets/create
Authorization: Bearer <read_only_admin_token>

{
  "assetName": "Test Asset",
  "assetTag": "ASSET-001"
}
```

**Expected Response:**

- Status: 403 Forbidden
- Message: "Read-only administrators cannot perform write operations..."

---

**Test 4.2: Read-only admin CANNOT update assets**

```
PATCH /api/v1/assets/:assetId
Authorization: Bearer <read_only_admin_token>

{
  "assetName": "Updated Name"
}
```

**Expected Response:**

- Status: 403 Forbidden

---

**Test 4.3: Read-only admin CANNOT delete assets**

```
DELETE /api/v1/assets/:assetId
Authorization: Bearer <read_only_admin_token>
```

**Expected Response:**

- Status: 403 Forbidden

---

**Test 4.4: Read-only admin CANNOT update users**

```
PATCH /api/v1/users/:userId
Authorization: Bearer <read_only_admin_token>

{
  "name": "Updated Name"
}
```

**Expected Response:**

- Status: 403 Forbidden

---

**Test 4.5: Read-only admin CANNOT delete users**

```
DELETE /api/v1/users/:userId
Authorization: Bearer <read_only_admin_token>
```

**Expected Response:**

- Status: 403 Forbidden

---

**Test 4.6: Read-only admin CANNOT create asset categories**

```
POST /api/v1/asset-categories
Authorization: Bearer <read_only_admin_token>

{
  "name": "Test Category"
}
```

**Expected Response:**

- Status: 403 Forbidden

---

**Test 4.7: Read-only admin CANNOT allocate assets**

```
POST /api/v1/allocations/allocate
Authorization: Bearer <read_only_admin_token>

{
  "assetIds": ["asset_id_here"],
  "fieldWorkerId": "user_id_here"
}
```

**Expected Response:**

- Status: 403 Forbidden

---

**Test 4.8: Read-only admin CANNOT update company settings**

```
PATCH /api/v1/companies/:companyId
Authorization: Bearer <read_only_admin_token>

{
  "settings": {
    "verificationFrequency": 14
  }
}
```

**Expected Response:**

- Status: 403 Forbidden

---

**Test 4.9: Read-only admin CANNOT create scheduled reports**

```
POST /api/v1/scheduled-reports
Authorization: Bearer <read_only_admin_token>

{
  "name": "Weekly Report",
  "schedule": "weekly"
}
```

**Expected Response:**

- Status: 403 Forbidden

---

### 5. Login Response Verification

**Test 5.1: Login response includes adminType for customer_admin**

```
POST /api/v1/auth/login

{
  "email": "readonly@test.com",
  "password": "Password123"
}
```

**Expected Response:**

- Status: 200 OK
- `user.adminType` should be present (`"full"` or `"read_only"`)
- `user.role` should be `"customer_admin"`

---

**Test 5.2: Login response does NOT include adminType for field_user**

```
POST /api/v1/auth/login

{
  "email": "fieldworker@test.com",
  "password": "Password123"
}
```

**Expected Response:**

- Status: 200 OK
- `user.adminType` should be `null`
- `user.role` should be `"field_user"`

---

### 6. fieldWorkerSettings Verification

**Test 6.1: customer_admin should NOT have fieldWorkerSettings**

```
GET /api/v1/users/:customerAdminId
Authorization: Bearer <admin_token>
```

**Expected Response:**

- Status: 200 OK
- `fieldWorkerSettings` should be `null` or not present

---

**Test 6.2: field_user SHOULD have fieldWorkerSettings**

```
GET /api/v1/users/:fieldUserId
Authorization: Bearer <admin_token>
```

**Expected Response:**

- Status: 200 OK
- `fieldWorkerSettings` should be present with default values

---

### 7. Admin Type Update

**Test 7.1: Full admin can change another admin's adminType**

```
PATCH /api/v1/users/:otherAdminId
Authorization: Bearer <full_admin_token>

{
  "adminType": "read_only"
}
```

**Expected Response:**

- Status: 200 OK
- `user.adminType` should be `"read_only"`

---

**Test 7.2: Read-only admin CANNOT change adminType**

```
PATCH /api/v1/users/:otherAdminId
Authorization: Bearer <read_only_admin_token>

{
  "adminType": "full"
}
```

**Expected Response:**

- Status: 403 Forbidden

---

### 8. Backward Compatibility

**Test 8.1: Existing customer_admin without adminType defaults to full**

After running migration, all existing `customer_admin` users should have `adminType: 'full'`.

Verify with:

```javascript
// MongoDB query
db.users.find({ role: "customer_admin", adminType: { $ne: "full" } });
// Should return empty array
```

---

## Summary Checklist

| Test    | Description                               | Expected      |
| ------- | ----------------------------------------- | ------------- |
| 1.1     | Default admin has adminType='full'        | ✅ Pass       |
| 2.1     | Full admin creates field_user             | ✅ Pass       |
| 2.2     | Full admin creates read_only admin        | ✅ Pass       |
| 2.3     | Full admin creates full admin             | ✅ Pass       |
| 2.4     | Read-only admin cannot create users       | 403 Forbidden |
| 3.1-3.5 | Read-only admin can view data             | ✅ Pass       |
| 4.1-4.9 | Read-only admin cannot write              | 403 Forbidden |
| 5.1     | Login includes adminType for admin        | ✅ Pass       |
| 5.2     | Login has null adminType for field_user   | ✅ Pass       |
| 6.1     | customer_admin has no fieldWorkerSettings | ✅ Pass       |
| 6.2     | field_user has fieldWorkerSettings        | ✅ Pass       |
| 7.1     | Full admin can change adminType           | ✅ Pass       |
| 7.2     | Read-only admin cannot change adminType   | 403 Forbidden |
| 8.1     | Migration sets existing admins to full    | ✅ Pass       |

---

## Notes

1. The `adminType` field is ONLY applicable to `customer_admin` role
2. For all other roles, `adminType` should be `null`
3. Default admins created with company always have `adminType: 'full'`
4. Read operations (GET requests) are allowed for read-only admins
5. Write operations (POST, PUT, PATCH, DELETE) are blocked based on the permission rights
