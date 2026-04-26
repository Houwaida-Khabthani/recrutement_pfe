# CRUD Operations - Navigation Guide

## Quick Access Map

### For Admin Users

#### Method 1: Via Dashboard (Recommended)
```
Login as ADMIN
    ↓
Navigate to /admin/dashboard
    ↓
Dashboard shows:
  - Total Utilisateurs (clickable card)
  - Entreprises (clickable card)
  - Candidatures (clickable card)
  
Quick Management Buttons:
  [👥 Gérer Utilisateurs] → /admin/users
  [🏢 Gérer Entreprises] → /admin/companies
  [📋 Gérer Candidatures] → /admin/applications
  [📊 Statistiques] → /admin/statistics
```

#### Method 2: Direct URL Navigation
```
Manage Users: http://localhost:5173/admin/users
Manage Companies: http://localhost:5173/admin/companies
Manage Applications: http://localhost:5173/admin/applications
View Statistics: http://localhost:5173/admin/statistics
```

**Actions Available on Each Page**:

##### 👥 Users Page (`/admin/users`)
- 🔍 Search by name or email
- 🏷️ Filter by role (CANDIDAT/ENTREPRISE/ADMIN)
- ➕ Create new user
- ✏️ Edit user details
- ❌ Delete user
- 📊 View all attributes (nom, email, role, téléphone, civilité)

##### 🏢 Companies Page (`/admin/companies`)
- 🔍 Search by company name or user
- ➕ Create new company
- ✏️ Edit company info
- ❌ Delete company
- 📋 Manage company sectors and descriptions
- 👤 Link to associated user account

##### 📋 Applications Page (`/admin/applications`)
- 🔍 Search by candidate, job title, or company
- 🎯 Filter by status (Pending/Under Review/Accepted/Rejected)
- 🔄 Update status inline with dropdown
- ❌ Delete application
- 📅 View application date
- 📧 See candidate email

---

### For Company Users

#### Login Path
```
Login as ENTREPRISE
    ↓
Navigate to /company or /company/dashboard
    ↓
Sidebar/Menu available with options
```

#### Navigation Options

**Option 1: Traditional Company Dashboard**
```
/company/dashboard → See overview
```

**Option 2: Manage Job Offers**
```
/company or sidebar
  ↓
Click "Jobs" or navigate to /company/jobs
  ↓
Click "Manage Jobs" or navigate to /company/jobs-management
  ↓
Available actions:
  🔍 Search by title, sector, location
  🎯 Filter by status (Active/Closed)
  ➕ Create new job offer
  ✏️ Edit job details
  ❌ Delete job posting
  📊 See applicant count
```

**Option 3: Manage Received Applications**
```
/company or sidebar
  ↓
Click "Applications" or navigate to /company/applications
  ↓
Click "Manage Applications" or navigate to /company/applications-management
  ↓
Available actions:
  🔍 Search by candidate name or job
  🎯 Filter by application status
  🔄 Update status (Pending → Under Review → Accept/Reject)
  ❌ Delete application
  📧 Contact candidate via email
  📅 See application date
```

---

### For Candidate Users

#### Login Path
```
Login as CANDIDAT
    ↓
Navigate to /candidate or /candidate/dashboard
    ↓
Sidebar/Menu available
```

#### Managing Visa Documents

```
/candidate or sidebar
  ↓
Click "Visa" or navigate to /candidate/visa
  ↓
See simple visa status view OR
  ↓
Click on visa section or navigate to /candidate/visa-management
  ↓
Available actions:
  📤 Upload new documents (Passport, Visa, Birth Cert, Police Cert, Medical, etc.)
  📋 View all uploaded documents
  🔄 Update document status (Pending → In Progress → Approved/Rejected)
  ❌ Delete document
  🔍 Filter by status
  📊 View statistics (Total, Pending, Approved counts)
  📅 Track document expiration dates
```

---

## Step-by-Step Access Guide

### Admin: Create New User
```
1. Go to /admin/users
2. Click "+ Nouveau Utilisateur" button
3. Fill in form:
   - Nom: Enter name
   - Email: Enter email
   - Mot de passe: Enter password
   - Rôle: Select role from dropdown
   - Téléphone: Enter phone (optional)
   - Civilité: Select Mr/Mme/Mlle
4. Click "Créer"
5. See new user in table immediately
```

### Admin: Search for User
```
1. Go to /admin/users
2. Type in search box (searches nom and email)
3. Results filter in real-time
4. Use role filter dropdown to narrow further
5. Can also sort by clicking on existing filters
```

### Company: Create Job Offer
```
1. Go to /company/jobs-management
2. Click "+ Nouvelle Offre" button
3. Fill enormous form:
   - Titre: Job title
   - Secteur: Industry/sector
   - Localisation: City/location
   - Type Contrat: CDI/CDD/Stage/Freelance
   - Salaire Min/Max: Salary range
   - Niveau Expérience: Junior/Intermediaire/Senior
   - Statut: Actif/Ferme
   - Description: Full job description
4. Click "Créer"
5. Job appears in table with ACTIF status
```

### Company: Update Application Status
```
1. Go to /company/applications-management
2. Locate application in table
3. Click status dropdown (currently shows status)
4. Select new status:
   - En attente (pending - yellow)
   - En cours d'examen (under review - blue)
   - Acceptée (accepted - green)
   - Rejetée (rejected - red)
5. Status updates immediately
6. Color changes to reflect new status
```

### Candidate: Upload Visa Document
```
1. Go to /candidate/visa-management
2. Click "+ Télécharger Document" button
3. In form:
   - Type Document: Select from dropdown
   - Select File: Choose PDF/DOC/DOCX/JPG/PNG
4. Click "Télécharger"
5. File uploads and appears in table
6. Status shows as PENDING (yellow)
```

### Candidate: Track Document Status
```
1. Go to /candidate/visa-management
2. Review table showing all documents
3. Click status dropdown for any document
4. Change status:
   - PENDING (yellow) - newly uploaded
   - IN_PROGRESS (blue) - being processed
   - APPROVED (green) - accepted
   - REJECTED (red) - not accepted
5. Scroll to stats section
6. See updated counts (Total, Pending, Approved)
```

---

## URL Reference Table

### Admin URLs
| Page | URL | Purpose |
|------|-----|---------|
| Dashboard | /admin/dashboard | Overview & navigation |
| Users | /admin/users | User management CRUD |
| Companies | /admin/companies | Company management CRUD |
| Applications | /admin/applications | Application CRUD |
| Statistics | /admin/statistics | System stats |

### Company URLs
| Page | URL | Purpose |
|------|-----|---------|
| Dashboard | /company or /company/dashboard | Overview |
| Jobs List | /company/jobs | Simple view |
| Jobs Management | /company/jobs-management | Full CRUD |
| Applications | /company/applications | Simple view |
| Applications Mgmt | /company/applications-management | Full CRUD |

### Candidate URLs
| Page | URL | Purpose |
|------|-----|---------|
| Dashboard | /candidate or /candidate/dashboard | Overview |
| Visa Simple | /candidate/visa | Status view |
| Visa Management | /candidate/visa-management | Full CRUD |

---

## Sidebar/Menu Navigation

### If Using Sidebar Component
```
Admin Sidebar typically shows:
├── Dashboard
├── Users
├── Companies
├── Applications
├── Statistics
├── Reports
└── Settings

Company Sidebar typically shows:
├── Dashboard
├── Jobs
├── Applications (Received)
├── Analytics
├── Settings
├── Profile
└── Logout

Candidate Sidebar typically shows:
├── Dashboard
├── Job Search
├── My Applications
├── Visa Management
├── Resume Tools
├── Settings
└── Logout
```

**Click menu items to navigate to respective pages**

---

## Direct Navigation (No Sidebar)

### Using Browser Address Bar:
```
Type directly: http://localhost:5173 then add path

Admin:
  /admin/dashboard
  /admin/users
  /admin/companies
  /admin/applications

Company:
  /company
  /company/jobs-management
  /company/applications-management

Candidate:
  /candidate
  /candidate/visa-management
```

### Using Browser History:
```
After visiting pages, use browser Back/Forward buttons
or History (Ctrl+H) to revisit previous pages
```

---

## Keyboard Shortcuts (if implemented)

Common shortcuts in data management pages:
```
ESC: Close modal/form
CTRL+F: Browser find (searches table in memory)
TAB: Navigate form fields
ENTER: Submit form
SHIFT+ENTER: In textarea, new line
```

---

## Mobile Navigation (if responsive)

```
On mobile devices:
1. Hamburger menu (☰) opens sidebar
2. Tap menu item to navigate
3. Tap page content to focus
4. Forms are full-width
5. Tables may scroll horizontally
6. Buttons stack vertically
```

---

## Common Navigation Patterns

### Create → Read → Update → Delete Cycle:
```
1. Find "+ Create" button
2. Fill form, click "Créer"
3. See new item in table
4. Click "Modifier" to edit
5. Change values, click "Mettre à jour"
6. See updated values in table
7. Click "Supprimer" to delete
8. Confirm deletion dialog
9. Item removed from table
```

### Search → Filter → Action Pattern:
```
1. Enter text in search box
2. Results filter in real-time
3. Use dropdown filters to narrow
4. Find target row
5. Click action button (Edit/Delete/Update)
6. Complete action
7. See results update in table
```

---

## Troubleshooting Navigation

### Can't find page
```
Issue: Page not loading
Solution: 
- Check URL is correct: /admin/users (not /admin/user)
- Ensure logged in with correct role
- Try /admin/dashboard first to get oriented
```

### Sidebar not appearing
```
Issue: Sidebar component not showing
Solution:
- User might not be logged in
- Check authentication status
- Try direct URL navigation instead
```

### Can't access certain pages
```
Issue: Redirects to /unauthorized
Solution:
- Logged in with wrong role
- ADMIN pages require ADMIN role
- COMPANY pages require ENTREPRISE role
- CANDIDATE pages require CANDIDAT role
- Log out and log in with correct role
```

### Forms not submitting
```
Issue: Click Create but nothing happens
Solution:
- Check browser console for validation errors
- Ensure all required fields are filled (marked with *)
- Check file formats for uploads
- Try again if network slow
```

---

## Best Navigation Practices

1. **Start at Dashboard**
   - Always go to /dashboard first for orientation
   - Use navigation buttons from dashboard
   - Easier than remembering all URLs

2. **Use Search Before Scrolling**
   - Large tables are easier to search
   - Type in search box for quick access
   - Then perform actions

3. **Close Modals Properly**
   - Click "Annuler" to close form
   - Or submit if form is complete
   - Don't refresh page with form open

4. **Verify Actions**
   - Look for success alerts
   - Check table updated
   - Confirm deletion in dialog

5. **Use Filters**
   - Search + Filter for 1000+ records
   - Much faster than scrolling
   - Can combine multiple filters

---

## Summary

All CRUD pages are:
- ✅ Accessible via direct URL
- ✅ Accessible via dashboard navigation
- ✅ Accessible via sidebar menu (if component used)
- ✅ Protected by role-based access control
- ✅ Fully functional for data management
- ✅ Equipped with search and filtering
- ✅ Real-time updating after operations

Choose whichever navigation method is most comfortable for your workflow!