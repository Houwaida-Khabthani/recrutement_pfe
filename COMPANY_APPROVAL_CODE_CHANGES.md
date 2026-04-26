# Updated Auth Service Code - Key Changes

## 1. LOGIN FUNCTION - Added Approval Check ✅

```javascript
/**
 * LOGIN
 */
exports.login = async (email, password) => {
  const [rows] = await db.query(
    "SELECT * FROM user WHERE email = ?",
    [email]
  );

  if (rows.length === 0) {
    throw new Error("Utilisateur non trouvé");
  }

  const user = rows[0];

  const isMatch = await bcrypt.compare(password, user.mot_de_passe);

  if (!isMatch) {
    throw new Error("Mot de passe incorrect");
  }

  // ✅ NEW: Check company approval status
  if (user.role === "ENTREPRISE" && user.status !== "approved") {
    throw new Error("Your account is pending admin approval");
  }

  return user;
};
```

### What Changed
- Added approval validation after password check
- Only blocks login if user is ENTREPRISE and status is NOT approved
- Returns clear error message for pending/rejected companies

---

## 2. REGISTER FUNCTION - Added Status Field ✅

```javascript
/**
 * REGISTER (🔥 FULL VERSION)
 */
exports.register = async (data) => {
  // ... validation code ...

  const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
  const finalNom = role === "CANDIDAT" ? nom?.trim() : nom_entreprise?.trim();

  // ✅ NEW: Set status based on role
  const status = role === "ENTREPRISE" ? "pending" : "approved";

  await db.query(
    `
    INSERT INTO user (
      nom,
      email,
      mot_de_passe,
      role,
      civilite,
      date_naissance,
      pays,
      adresse,
      nom_entreprise,
      secteur,
      site_web,
      logo,
      status                    // ✅ NEW FIELD
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      finalNom,
      email,
      hashedPassword,
      role,
      civilite || null,
      date_naissance || null,
      pays || null,
      adresse || null,
      role === "ENTREPRISE" ? nom_entreprise?.trim() : null,
      secteur || null,
      site_web || null,
      logo || null,
      status,                   // ✅ NEW FIELD
    ]
  );
};
```

### What Changed
- Added `status` variable: `"pending"` for ENTREPRISE, `"approved"` for CANDIDAT
- Added `status` column to INSERT query
- Added `status` parameter to VALUES array

---

## 3. FINDBYID FUNCTION - Added Status to SELECT ✅

```javascript
/**
 * FIND USER BY ID
 */
exports.findById = async (id) => {
  const [rows] = await db.query(
    // ✅ UPDATED: Added status field
    "SELECT id_user, nom, email, role, civilite, date_naissance, pays, adresse, nom_entreprise, secteur, site_web, logo, status FROM user WHERE id_user = ?",
    [id]
  );

  return rows[0];
};
```

### What Changed
- Added `, status` to SELECT clause
- Now includes approval status when fetching user profile

---

## Database Migration Statement

```sql
-- Add the status column
ALTER TABLE user ADD COLUMN status ENUM('pending', 'approved', 'rejected') 
DEFAULT 'pending' AFTER logo;

-- Maintain backward compatibility - set all existing ENTREPRISE users to approved
UPDATE user SET status = 'approved' WHERE role = 'ENTREPRISE';
```

---

## Authorization Flow Diagram

```
Company Registration
    ↓
INSERT with status = 'pending'
    ↓
Login Attempt
    ↓
Check: role === 'ENTREPRISE' && status !== 'approved'?
    ↓ YES
❌ Error: "Your account is pending admin approval"
    ↓ NO
✅ Generate JWT and allow login
```

---

## Status Values Explained

| Status | Meaning | Can Login? |
|--------|---------|-----------|
| `pending` | Awaiting admin review | ❌ No |
| `approved` | Admin approved | ✅ Yes |
| `rejected` | Admin rejected | ❌ No |

---

## Notes
- The auth controller (`auth.controller.js`) doesn't need changes - error handling is automatic
- The error will be caught and passed to Express error middleware via `next(error)`
- Client receives appropriate HTTP error response with the message
