# Company Approval Before Login - Implementation Guide

## Overview
This implementation adds a company approval workflow where:
- Companies registering get status = `pending`
- Login is blocked with error "Your account is pending admin approval" until status = `approved`
- Only admins can approve company accounts

## Changes Made

### 1. Database Migration
**File**: `backend/database/migrate-add-company-status.sql`

```sql
-- Add company approval status column to user table
ALTER TABLE user ADD COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' AFTER logo;

-- Set existing ENTREPRISE users to 'approved' to maintain backward compatibility
UPDATE user SET status = 'approved' WHERE role = 'ENTREPRISE';
```

**How to apply**:
```bash
mysql -u [username] -p [database_name] < backend/database/migrate-add-company-status.sql
```

### 2. Updated Auth Service
**File**: `backend/src/modules/auth/auth.service.js`

#### Login Function
- Added approval check: `if (user.role === "ENTREPRISE" && user.status !== "approved")`
- Throws error: `"Your account is pending admin approval"`

#### Register Function
- Sets `status = "pending"` for companies (ENTREPRISE role)
- Sets `status = "approved"` for candidates (CANDIDAT role)
- Includes status in INSERT statement

#### FindById Function
- Added `status` field to SELECT query

### 3. Auth Controller
**File**: `backend/src/modules/auth/auth.controller.js`

**No changes needed** - Error handling is already in place. The controller passes errors to Express error middleware which returns them to client.

## Request/Response Examples

### Company Registration
**Request**:
```json
POST /auth/register
{
  "email": "company@example.com",
  "mot_de_passe": "password123",
  "role": "ENTREPRISE",
  "nom_entreprise": "TechCorp",
  "secteur": "Technology",
  "site_web": "https://techcorp.com"
}
```

**Response** (201):
```json
{
  "message": "Utilisateur créé avec succès"
}
```

**Database**: Company created with `status = 'pending'`

### Login - Pending Company
**Request**:
```json
POST /auth/login
{
  "email": "company@example.com",
  "password": "password123"
}
```

**Response** (Error):
```json
{
  "error": "Your account is pending admin approval"
}
```

### Login - Approved Company
**Request**:
```json
POST /auth/login
{
  "email": "approved@example.com",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "user": {
    "id": 1,
    "nom": "TechCorp",
    "email": "approved@example.com",
    "role": "ENTREPRISE"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

## Admin Approval Flow

### Create Admin Endpoint (optional, for complete workflow)
```javascript
exports.approveCompany = async (req, res, next) => {
  try {
    const { userId, status } = req.body; // status: 'approved' or 'rejected'
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    await db.query(
      "UPDATE user SET status = ? WHERE id_user = ? AND role = 'ENTREPRISE'",
      [status, userId]
    );
    
    res.json({ message: `Company ${status} successfully` });
  } catch (error) {
    next(error);
  }
};
```

## Testing Checklist

- [ ] Apply database migration
- [ ] Register new company → verify status = 'pending' in database
- [ ] Try login with pending company → verify error message
- [ ] Manually update status to 'approved' in database
- [ ] Login with approved company → verify successful login
- [ ] Register new candidate → verify status = 'approved' in database
- [ ] Login as candidate → verify works (no approval needed)
- [ ] Test reject status functionality

## SQL Queries for Admin Management

### View pending companies
```sql
SELECT id_user, nom, email, secteur, status FROM user 
WHERE role = 'ENTREPRISE' AND status = 'pending';
```

### Approve company
```sql
UPDATE user SET status = 'approved' WHERE id_user = ? AND role = 'ENTREPRISE';
```

### Reject company
```sql
UPDATE user SET status = 'rejected' WHERE id_user = ? AND role = 'ENTREPRISE';
```

## Files Modified

1. **backend/src/modules/auth/auth.service.js**
   - Updated `login()` function with approval check
   - Updated `register()` function to set status
   - Updated `findById()` to include status field

2. **backend/database/migrate-add-company-status.sql** (NEW)
   - Migration file to add status column

## Notes

- Existing companies are automatically set to 'approved' status for backward compatibility
- Candidates are always approved by default
- Only ENTREPRISE role is subject to approval workflow
- Status field options: `pending`, `approved`, `rejected`
