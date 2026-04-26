# Company Approval System - Quick Implementation Summary ✅

## Implementation Complete

### Files Modified

#### 1. [backend/src/modules/auth/auth.service.js](backend/src/modules/auth/auth.service.js)
- **Login function**: Added approval check - blocks login if `role === 'ENTREPRISE'` and `status !== 'approved'`
- **Register function**: Sets `status = 'pending'` for companies, `'approved'` for candidates
- **FindById function**: Added `status` field to SELECT query

#### 2. [backend/database/migrate-add-company-status.sql](backend/database/migrate-add-company-status.sql) *(NEW)*
- Adds `status` column to user table with ENUM values: `pending`, `approved`, `rejected`
- Sets existing companies to `approved` for backward compatibility

---

## Deployment Steps

### Step 1: Apply Database Migration
```bash
cd backend/database
mysql -u your_user -p your_database < migrate-add-company-status.sql
```

### Step 2: Restart Backend
```bash
cd backend
npm run dev
# or
npm start
```

### Step 3: Test the Flow
1. Register new company → status should be `pending`
2. Try login → should get error: "Your account is pending admin approval"
3. Manually approve in DB: `UPDATE user SET status = 'approved' WHERE id_user = X`
4. Login again → should work ✅

---

## How It Works

| Scenario | Behavior |
|----------|----------|
| **Candidate registers** | `status = 'approved'` → Can login immediately ✅ |
| **Company registers** | `status = 'pending'` → Cannot login ❌ |
| **Company login (pending)** | Error: "Your account is pending admin approval" |
| **Admin approves company** | `UPDATE status = 'approved'` → Can now login ✅ |
| **Admin rejects company** | `UPDATE status = 'rejected'` → Can never login ❌ |

---

## Error Message

When a company tries to login before approval:

```json
{
  "error": "Your account is pending admin approval"
}
```

---

## API Reference

### Register Endpoint
- **URL**: `POST /auth/register`
- **For Company**: Include `role: 'ENTREPRISE'`
- **Result**: Created with `status = 'pending'`

### Login Endpoint
- **URL**: `POST /auth/login`
- **Company (pending)**: Returns error
- **Company (approved)**: Returns JWT token
- **Candidate**: Returns JWT token (always approved)

### Get Current User
- **URL**: `GET /auth/me`
- **Response**: Includes `status` field

---

## Admin Management SQL Queries

```sql
-- View all pending companies
SELECT id_user, nom, email, secteur, date_inscription 
FROM user 
WHERE role = 'ENTREPRISE' AND status = 'pending';

-- Approve a company
UPDATE user SET status = 'approved' WHERE id_user = ? AND role = 'ENTREPRISE';

-- Reject a company
UPDATE user SET status = 'rejected' WHERE id_user = ? AND role = 'ENTREPRISE';

-- Check company status
SELECT id_user, nom, status FROM user WHERE role = 'ENTREPRISE';
```

---

## Future Enhancements (Optional)

- Add admin endpoint to approve/reject companies via UI
- Add email notification when company is approved/rejected
- Add admin dashboard to manage pending approvals
- Add rejection reason field to status
- Add timestamps for approval/rejection actions

---

## Verification Checklist

- [x] Database migration file created
- [x] Login function checks approval status
- [x] Register function sets status based on role
- [x] FindById includes status field
- [x] Error message matches requirements
- [x] Backward compatibility maintained (existing companies approved)
- [x] Documentation created

**Status**: ✅ READY FOR DEPLOYMENT
