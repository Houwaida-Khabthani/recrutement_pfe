# 🔧 Troubleshooting: 400 Error on Jobs Page

## ✅ Database Status
Your database is properly configured:
- **Users:** 10 users found (4 company users: aeros, TechCorp, DesignHub, DataTech)
- **Companies:** 4 companies linked to users with correct `id_user` values
- **Jobs:** 4 jobs already created

## ❌ Current Issue: 400 Error on GET `/api/jobs/my-jobs`

### Step 1: Restart Backend with Debug Logging
The backend now has detailed logging to track the issue. **Restart it:**

```bash
# In backend terminal:
npm run dev
```

You should see the server start successfully.

---

### Step 2: Check You're Logged In as a COMPANY User

The Jobs page only works if you're logged in as an **ENTREPRISE (company) user**.

**Valid Company Users:**
- Need credentials from your authentication system

**❌ Won't Work:**
- If logged in as a CANDIDAT (candidate/job seeker)
- If not logged in at all
- If JWT token is not saved in localStorage

**How to Check:**
1. Open browser DevTools → Application → LocalStorage
2. Look for `"auth"` or token key
3. Should see something like: `{"token":"eyJ..."}`

---

### Step 3: Navigate to Jobs Page & Check Console

1. **Frontend:** Open DevTools (F12) → Console
   - Look for error messages
   - Check if `Authorization: Bearer` header is present in Network tab

2. **Backend:** Check terminal output
   - Look for logs like:
     ```
     [DEBUG] User in request: 12
     [SERVICE] Finding jobs for userId: 12
     [DB] Company found for user: 12
     [DB] Jobs query executed, found: 4
     ```
   - If you see `[DEBUG] No user in request` → JWT token not being sent
   - If you see `[DB] No company found` → User not linked to company

---

### Step 4: Common Issues & Fixes

#### Issue A: "No user in request" error
```
❌ Symptom: [DEBUG] No user in request
```
**Fix:** 
- Log out completely → Clear localStorage
- Sign up/login again as a COMPANY user
- Check JWT token is saved in localStorage

#### Issue B: "No company found"  
```
❌ Symptom: [DB] No company found for user: X
```
**Fix:**
- User exists but has no company profile
- Company admin needs to complete company profile setup

#### Issue C: Still getting 400 after restart
```
❌ Symptom: Still seeing 400 in browser
```
**Actions:**
1. Check backend console for [DEBUG] logs
2. Copy exact error message from browser DevTools → Network tab
3. Share the error message and backend logs

---

### Step 5: Frontend Verification (Advanced)

In browser console (F12), run:
```javascript
// Check if auth token exists
const auth = localStorage.getItem('auth');
console.log('Auth token:', auth ? auth.substring(0, 50) + '...' : 'NOT FOUND');
```

---

### Step 6: Test the API Directly

In browser console, test GET request manually:
```javascript
const token = JSON.parse(localStorage.getItem('auth')).token;

fetch('http://localhost:5000/api/jobs/my-jobs', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  }
})
  .then(r => r.json())
  .then(data => console.log('Response:', data))
  .catch(e => console.error('Error:', e));
```

---

## 📋 Quick Checklist

- [ ] Backend restarted with `npm run dev`
- [ ] Logged in as ENTREPRISE user (not CANDIDAT)
- [ ] JWT token visible in localStorage
- [ ] Navigated to http://localhost:5173/company/jobs
- [ ] Checked backend terminal for [DEBUG] logs
- [ ] Checked frontend console (F12) for error messages

---

## Next Steps

Once you've checked these items, share the backend console output and I'll help you fix the specific issue!
