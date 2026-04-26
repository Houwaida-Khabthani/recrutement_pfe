# CV Preview System - Quick Reference

## 🎯 What Was Fixed

### Problem
- CV preview buttons returned **404 errors**
- URL construction was incorrect

### Root Cause
- Using wrong folder path: `'uploads'` instead of `'cvs'`
- Result was: `http://localhost:5000/uploads/uploads/cvs/filename.pdf` ❌

### Solution
- Changed folder path to `'cvs'`
- Correct URL: `http://localhost:5000/uploads/cvs/filename.pdf` ✅

---

## 📋 Files Modified

### 1. Dashboard.tsx (Line ~569)
```javascript
// BEFORE ❌
href={buildUploadUrl(workflowCandidate.cv, 'uploads')}
download
"Download"

// AFTER ✅
href={buildUploadUrl(workflowCandidate.cv, 'cvs')}
"Preview"
```

### 2. Reports.tsx (Line ~450)
```javascript
// BEFORE ❌
href={buildUploadUrl(workflowCandidate.cv, 'uploads')}
download
"Download"

// AFTER ✅
href={buildUploadUrl(workflowCandidate.cv, 'cvs')}
"Preview"
```

---

## 🚀 Optional: Add Modal Preview (Enhanced UX)

### Step 1: The Component Already Exists
File: `frontend/src/components/CVPreviewModal.tsx`

### Step 2: Update Dashboard.tsx

**Add imports:**
```javascript
import CVPreviewModal from '../../components/CVPreviewModal';
import { useState } from 'react';
```

**Add state:**
```javascript
const [cvPreviewOpen, setCvPreviewOpen] = useState(false);
const [selectedCvUrl, setSelectedCvUrl] = useState('');
const [selectedCvFileName, setSelectedCvFileName] = useState('');
```

**Replace preview button:**
```javascript
<button
  onClick={() => {
    const url = buildUploadUrl(workflowCandidate.cv, 'cvs');
    setSelectedCvUrl(url);
    setSelectedCvFileName(workflowCandidate.cv.split('/').pop() || 'CV');
    setCvPreviewOpen(true);
  }}
  className="px-4 py-2 bg-blue-600 text-white font-black rounded-lg text-[9px] uppercase tracking-widest hover:bg-blue-700 transition-all"
>
  Preview
</button>
```

**Add modal component at end:**
```javascript
<CVPreviewModal
  isOpen={cvPreviewOpen}
  cvUrl={selectedCvUrl}
  cvFileName={selectedCvFileName}
  onClose={() => setCvPreviewOpen(false)}
  candidateName={selectedCandidate?.candidate_name || 'Candidate'}
/>
```

---

## 🔍 URL Construction Explained

```
Database stores: "1776852911426-cv_adem.pdf"
                  ↓
buildUploadUrl(filename, 'cvs')
                  ↓
Constructs: "http://localhost:5000/uploads/cvs/1776852911426-cv_adem.pdf"
                  ↓
Opens URL → Browser PDF viewer displays file
```

---

## ✅ Testing Checklist

- [ ] Backend running on localhost:5000
- [ ] Database has CV filenames (no paths)
- [ ] CV files exist in `backend/uploads/cvs/`
- [ ] Dashboard shows "Preview" button
- [ ] Click Preview → PDF opens in new tab
- [ ] No 404 errors in browser console
- [ ] No 404 errors in backend logs

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| 404 Error | Check folder is `cvs` not `uploads` |
| File not found | Verify filename in database matches file |
| Doubled path | Make sure not using `/uploads/uploads/...` |
| CORS error | Check backend app.js has cors configured |
| Blank PDF | Browser might not support inline PDF |

---

## 💾 Backend Already Configured

**No backend changes needed!** The backend is already set up:

✅ Static file serving at `/uploads`
✅ CVs stored in `uploads/cvs/` folder
✅ Multer configured correctly
✅ Filename format correct

---

## 🎨 Modal Preview Features

If you implement the optional modal:

- 📄 Inline PDF preview
- ⏳ Loading indicator
- ❌ Error handling
- ⬇️ Download button
- 🔗 Open in new tab
- 📱 Responsive design
- ✨ Smooth animations

---

## 🔑 Key Files Reference

```
backend/src/app.js
  → Line: app.use('/uploads', express.static('uploads'))

backend/src/middlewares/upload.middleware.js
  → CVs saved to 'cvs' subfolder

backend/src/modules/candidates/candidate.controller.js
  → Stores filename only in database

frontend/src/pages/company/Dashboard.tsx
  → Line ~569: buildUploadUrl() call (FIXED)
  
frontend/src/pages/company/Reports.tsx
  → Line ~450: buildUploadUrl() call (FIXED)

frontend/src/components/CVPreviewModal.tsx
  → New component for enhanced preview (Optional)
```

---

## 📊 Expected Behavior

### Current (After Fixes)
```
User clicks "Preview"
  ↓
Opens: http://localhost:5000/uploads/cvs/1776852911426-cv_adem.pdf
  ↓
Browser displays PDF in new tab ✅
```

### With Modal (Optional Enhancement)
```
User clicks "Preview"
  ↓
Modal opens with iframe
  ↓
PDF displays inline in modal ✨
  ↓
User can download or open in new tab
```

---

Generated: April 22, 2026
