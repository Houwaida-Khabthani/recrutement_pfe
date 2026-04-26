# CV Preview System - Implementation Guide

## ✅ System Status

### Backend (Express) - Verified ✓
- **Upload Middleware**: `backend/src/middlewares/upload.middleware.js`
  - CVs saved to: `uploads/cvs/` folder
  - Filename format: `{timestamp}-{originalName}.pdf`
  - Supported types: PDF, DOC, DOCX

- **Static File Serving**: `backend/src/app.js`
  ```javascript
  app.use('/uploads', express.static('uploads'));
  ```
  - Serving from: `backend/uploads/`
  - Access URL: `http://localhost:5000/uploads/cvs/{filename}.pdf`

- **Candidate Routes**: `backend/src/modules/candidates/candidate.routes.js`
  - Upload endpoint: `PUT /api/candidates/profile`
  - Stores filename only in database

- **Database Storage**: 
  - Field: `cv` column in candidates table
  - Stores: Filename only (e.g., `1776852911426-cv_adem.pdf`)

---

## 🔧 Frontend Fixes Applied

### 1. **Dashboard.tsx** - FIXED ✓
- **Location**: `frontend/src/pages/company/Dashboard.tsx` (line ~569)
- **Issue**: Used wrong folder path `'uploads'`
- **Fix**: Changed to correct folder path `'cvs'`
- **Before**: `buildUploadUrl(workflowCandidate.cv, 'uploads')`
- **After**: `buildUploadUrl(workflowCandidate.cv, 'cvs')`

### 2. **Reports.tsx** - FIXED ✓
- **Location**: `frontend/src/pages/company/Reports.tsx` (line ~450)
- **Issue**: Used wrong folder + had `download` attribute
- **Fix**: Changed to correct folder and removed download attribute
- **Before**: `buildUploadUrl(workflowCandidate.cv, 'uploads')` + `download`
- **After**: `buildUploadUrl(workflowCandidate.cv, 'cvs')` + removed download

### 3. **Applications.tsx** - Already Correct ✓
- Uses: `buildUploadUrl(selectedCandidate.candidate_cv_url, 'cvs')`

---

## 🎯 How It Works Now

### URL Construction
```javascript
// Helper function in Dashboard.tsx
buildUploadUrl(value, folder)
  ↓
// For CV: buildUploadUrl('1776852911426-cv_adem.pdf', 'cvs')
  ↓
// Result: http://localhost:5000/uploads/cvs/1776852911426-cv_adem.pdf
```

### Frontend Preview Button Flow
1. User clicks "Preview" button
2. URL constructed: `http://localhost:5000/uploads/cvs/{filename}`
3. Opens in new browser tab
4. Browser's native PDF viewer displays the file

---

## 🚀 Optional: Enhanced Modal Preview

### A. Using the New CVPreviewModal Component (Better UX)

**Location**: `frontend/src/components/CVPreviewModal.tsx` (newly created)

**Features**:
- ✅ Inline PDF preview inside modal
- ✅ Loading state indicator
- ✅ Error handling with fallback
- ✅ Download button
- ✅ Open in new tab option
- ✅ Responsive design

### B. Implementation in Dashboard.tsx

```jsx
import CVPreviewModal from '../../components/CVPreviewModal';

// Add state in component
const [cvPreviewOpen, setCvPreviewOpen] = useState(false);
const [selectedCvUrl, setSelectedCvUrl] = useState('');
const [selectedCvFileName, setSelectedCvFileName] = useState('');

// Replace the preview link with:
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

// Add modal at the bottom of component before closing div:
<CVPreviewModal
  isOpen={cvPreviewOpen}
  cvUrl={selectedCvUrl}
  cvFileName={selectedCvFileName}
  onClose={() => setCvPreviewOpen(false)}
  candidateName={selectedCandidate?.candidate_name || 'Candidate'}
/>
```

---

## 🔍 Testing the Implementation

### 1. **Verify Backend**
```bash
# Check uploads folder exists
ls -la backend/uploads/cvs/

# Check file permissions
stat backend/uploads/cvs/{filename}.pdf

# Test curl request
curl -I http://localhost:5000/uploads/cvs/1776852911426-cv_adem.pdf
# Expected: HTTP/1.1 200 OK
```

### 2. **Verify Frontend**
```bash
# Check URL is constructed correctly
# Open browser DevTools → Console
# Paste: buildUploadUrl('1776852911426-cv_adem.pdf', 'cvs')
# Expected: http://localhost:5000/uploads/cvs/1776852911426-cv_adem.pdf
```

### 3. **Test Preview Button**
- Click "Preview" button on application
- PDF should open in new tab
- No 404 errors in browser console

---

## 🐛 Troubleshooting

### Issue: 404 Error When Clicking Preview

**Possible Causes**:
1. **Wrong folder in URL**
   - ✗ `http://localhost:5000/uploads/uploads/...` (doubled)
   - ✗ `http://localhost:5000/uploads/images/...` (wrong folder)
   - ✓ `http://localhost:5000/uploads/cvs/...` (correct)

2. **File doesn't exist**
   - Check: Database has correct filename
   - Check: File exists in `backend/uploads/cvs/`
   - Check: Filename matches exactly (case-sensitive)

3. **Backend not serving uploads**
   - Verify: `app.use('/uploads', express.static('uploads'))` in app.js
   - Check: UPLOADS_PATH points to correct directory

### Issue: Database Has Wrong Path

**Current Correct Format**: 
- Database stores: `1776852911426-cv_adem.pdf`
- NOT: `uploads/cvs/1776852911426-cv_adem.pdf`
- NOT: `/uploads/cvs/1776852911426-cv_adem.pdf`

If wrong, update database:
```sql
UPDATE candidates SET cv = SUBSTRING(cv, POSITION('/' IN cv) + 1) 
WHERE cv LIKE 'uploads/%';
```

---

## 📊 File Structure

```
backend/
├── uploads/
│   ├── cvs/              ← CVs stored here
│   │   ├── 1776852911426-cv_adem.pdf
│   │   └── 1776850216144-cv_john.pdf
│   ├── images/           ← Avatars
│   ├── logos/            ← Company logos
│   └── portfolios/       ← Portfolio files
├── src/
│   ├── app.js            ← Static file serving configured
│   ├── middlewares/
│   │   └── upload.middleware.js  ← Upload settings
│   └── modules/
│       └── candidates/
│           ├── candidate.controller.js  ← Stores filename in DB
│           └── candidate.routes.js

frontend/
├── src/
│   ├── components/
│   │   └── CVPreviewModal.tsx   ← New modal component
│   └── pages/
│       └── company/
│           ├── Dashboard.tsx    ← FIXED
│           └── Reports.tsx      ← FIXED
```

---

## ✨ Environment Variables

### Frontend (.env or vite.config.ts)
```javascript
// Currently defaults to:
VITE_UPLOAD_URL = 'http://localhost:5000/uploads'

// Can be overridden in production with:
VITE_UPLOAD_URL = 'https://api.example.com/uploads'
```

---

## 🎓 Summary

### What Was Fixed:
1. ✅ Corrected URL construction in Dashboard.tsx
2. ✅ Corrected URL construction in Reports.tsx  
3. ✅ Changed button from "Download" to "Preview"
4. ✅ Removed `download` attribute from links
5. ✅ Created optional CVPreviewModal for enhanced UX

### Result:
- CV preview now works correctly
- 404 errors resolved
- URLs are constructed properly: `http://localhost:5000/uploads/cvs/{filename}`
- Optional modal provides better user experience

### Next Steps (Optional):
1. Integrate CVPreviewModal in Dashboard.tsx (see implementation above)
2. Test modal with various PDF files
3. Customize styling as needed

---

## 📝 Backend Code Reference

### app.js - Static File Serving
```javascript
const UPLOADS_PATH = path.join(__dirname, "..", "uploads");
app.use("/uploads", express.static(UPLOADS_PATH));
```

### upload.middleware.js - File Destination
```javascript
if (file.fieldname === "cv") subfolder = "cvs";
// Files saved to: backend/uploads/cvs/
```

### candidate.controller.js - Database Storage
```javascript
if (files.cv?.length > 0) {
  data.cv = files.cv[0].filename;  // Stores filename only
}
```

---

## 🔐 Security Notes

✅ **Already Implemented**:
- File type validation (PDF, DOC, DOCX only)
- File size limit (5MB max)
- Timestamp prefix prevents filename collisions
- Static file serving restricts access to uploads folder

✅ **Recommended**:
- Add CORS whitelist in production
- Implement virus scanning for uploads
- Add rate limiting on upload endpoint
- Encrypt sensitive PDFs at rest

---

Generated: April 22, 2026
Last Updated: Implementation Completed
