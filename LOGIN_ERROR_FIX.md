# Login 500 Error - Complete Fix Guide

## ✅ Database Setup Verified

- ✅ Recruiter user exists: `recruiter@test.com`
- ✅ Password is correct: `test123456`
- ✅ Password hash verified correctly
- ✅ User role: ENTREPRISE
- ✅ JWT creation would work

## 🔴 The Issue

The 500 error is because the **backend server is NOT running** or there's an error in the response that's not being logged properly.

---

## 🚀 How to Start Backend (Pick One)

### Option A: Using Node directly with logging (RECOMMENDED)

1. **Open new terminal in `backend` folder**

2. **Run this command**:
   ```bash
   node start-dev.js
   ```

3. **You should see**:
   ```
   ============================================================
   🚀 SERVER STARTED
   ============================================================
   📍 URL: http://localhost:5000
   📝 Environment: development
   ============================================================
   ```

4. **Keep this terminal open and watch for API logs**

### Option B: Using npm dev (with nodemon auto-reload)

1. **Open new terminal in `backend` folder**

2. **Run**:
   ```bash
   npm run dev
   ```

3. **You should see**:
   ```
   Server running on port 5000
   ```

### Option C: Direct Node (no logging)

```bash
node server.js
```

---

## 🧪 Test Login Now

### Step 1: Start Backend First
Make sure backend is running with one of the options above and showing no errors.

### Step 2: Go to Frontend Login Page

### Step 3: Use These Credentials
```
Email: recruiter@test.com
Password: test123456
```

### Step 4: Submit Login Form

You should see:
- ✅ Login successful
- ✅ Redirect to company dashboard
- ⚠️ OR a clear error message in the console

---

## 🐛 If You STILL Get 500 Error

### Check 1: Is Backend Actually Running?

Try in another terminal:
```bash
curl http://localhost:5000/api/jobs
```

You should get JSON data back. If connection refused, backend isn't running.

### Check 2: Look at Backend Terminal

When you make a login request, the backend terminal should show:
```
📨 POST /api/auth/login
✅ Response: 200
OR
✅ Response: 500
```

If you see a 500, **copy the error message** and paste it here.

### Check 3: Check Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to login
4. Look for the POST request to `/api/auth/login`
5. Click it and look at "Response" tab
6. **Copy the error message** and paste it here

---

## 📋 Credentials Summary

| Field | Value |
|-------|-------|
| Email | recruiter@test.com |
| Password | test123456 |
| Role | ENTREPRISE (Recruiter) |
| Company | Tech Corp 1 (ID: 12) |
| Available Job | Senior Full-Stack Developer (ID: 6) |

---

## ✨ Once Logged In

1. You'll see the company dashboard
2. Go to Jobs page
3. Edit "Senior Full-Stack Developer"
4. Change salary (5000 → 6000)
5. Click Save → Should work now! ✅

---

## 🆘 Stuck?

1. **Verify backend is running**: `curl http://localhost:5000/api/jobs`
2. **Check backend console for errors**
3. **Look at browser Network tab for exact error response**
4. **Share the exact error message**

I can debug from there!
