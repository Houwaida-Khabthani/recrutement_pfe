# Backend Startup Guide

## ✅ Database Setup is Complete!

The debug test shows:
- ✅ Recruiter account exists and logged in
- ✅ Company properly linked to recruiter
- ✅ Job exists in database
- ✅ Authorization will pass
- ✅ Update query works perfectly

## 🔴 The 500 Error is Likely Because...

The backend server is **NOT RUNNING** or needs to be **RESTARTED** to load the new code changes.

---

## 🚀 How to Fix It

### Option 1: Using npm (Recommended)

1. **Open a NEW terminal** in the `backend` folder

2. **Install dependencies** (if you haven't already):
   ```bash
   npm install
   ```

3. **Start the development server with auto-reload**:
   ```bash
   npm run dev
   ```

   You should see:
   ```
   [nodemon] 3.x.x
   [nodemon] to restart at any time, type `rs`
   [nodemon] watching path(s): *.*
   [nodemon] watching extensions: js,json
   [nodemon] starting `node server.js`
   Server running on port 5000
   ```

### Option 2: Direct Node (No auto-reload)

```bash
node server.js
```

You should see:
```
Server running on port 5000
```

---

## 🧪 Verify Backend is Running

1. **Check in browser**:
   - Go to: `http://localhost:5000/api/jobs`
   - You should see job data returned

2. **Check in terminal**:
   - You should see Morgan logging like:
   ```
   GET /api/jobs 200 1.234 ms - 1234
   ```

---

## ✅ Then Test the Fix

1. **In your browser**, go to the Jobs page
2. **Log in** with test account if not already:
   - Email: `recruiter@test.com`
   - Password: `test123456`

3. **Click Edit** on any job card
4. **Make a change** (e.g., salary: 5000 → 6000)
5. **Click Save**

**Expected Result**: ✅ Job updates successfully!

---

## 📋 Summary of Recent Changes

These backend files were modified to fix the 500 error:
- `src/modules/jobs/job.model.js` - Safe update with field validation
- `src/modules/jobs/job.service.js` - Better error logging
- `setup_recruiter_test.js` - Created test recruiter account
- `seed_jobs_with_companies.js` - Set up test data

The backend needs to be **restarted** for these changes to take effect.

---

## ❓ Still Getting 500 Error?

**Check the backend terminal** for error messages. You should see detailed logging now:
```
[Service] Updating job: { id: 6, userId: 23, jobData: {...} }
[Service] User company ID: 12 Job company ID: 12
UPDATE offre SET titre = ?, type_contrat = ?, ... WHERE id_offre = ?
```

If you see error messages, **copy them** and share them - that will help debug the exact issue.
