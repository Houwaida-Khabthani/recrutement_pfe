# CRUD Operations - Quick Start Testing Guide

## Getting Started

### Prerequisites
- Node.js and npm installed
- MySQL database running with schema initialized
- Backend server running on `http://localhost:5000`
- Frontend running on `http://localhost:5173`

### Starting the Application

1. **Backend**:
   ```bash
   cd backend
   npm install
   npm start
   # Should see: "Server running on port 5000"
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   # Should see: "Local: http://localhost:5173"
   ```

---

## Test Scenarios by Role

### A. ADMIN USER TESTING

#### Login as Admin
1. Navigate to `http://localhost:5173/login/admin`
2. Use admin credentials (check backend seed files)
3. Should redirect to `/admin/dashboard`

#### Test 1: User Management (`/admin/users`)
**Create User**
1. Click "Nouvelle Utilisateur" button
2. Fill form:
   - Nom: "Jean Dupont"
   - Email: "jean@test.com"
   - Mot de passe: "SecurePass123"
   - Rôle: "CANDIDAT"
   - Téléphone: "+216 20 123 456"
   - Civilité: "Mr"
3. Click "Créer"
4. **Expected**: User appears in table immediately

**Search User**
1. In search box, type "jean"
2. **Expected**: Table filters to show only Jean Dupont
3. Type email "jean@test.com"
4. **Expected**: Still shows Jean Dupont

**Update User**
1. Click "Modifier" on any user
2. Change telephone number
3. Click "Mettre à jour"
4. **Expected**: Changes appear in table instantly

**Delete User**
1. Click "Supprimer" on a user
2. Confirm dialog
3. **Expected**: User removed from table

#### Test 2: Companies Management (`/admin/companies`)
**Create Company**
1. Navigate to Companies tab (from Dashboard)
2. Click "Nouvelle Entreprise"
3. Fill form:
   - Nom: "TechSolutions SARL"
   - Email: "info@techsolutions.tn"
   - Secteur: "Information Technology"
   - ID Utilisateur: 2 (or valid user ID)
   - Description: "Leading IT solutions provider"
4. Click "Créer"
5. **Expected**: Company appears in table

**Search Company**
1. Type "TechSolutions" in search
2. **Expected**: Filters table to show company

**Update Company**
1. Click "Modifier" on company
2. Update secteur to "Software Development"
3. Click "Mettre à jour"
4. **Expected**: Changes saved instantly

**Delete Company**
1. Click "Supprimer"
2. Confirm
3. **Expected**: Company removed from system

#### Test 3: Applications Management (`/admin/applications`)
**Update Application Status**
1. Navigate to Applications
2. For any application, click status dropdown
3. Change from "En attente" → "En cours d'examen"
4. **Expected**: Color changes and status updates
5. Change to "Acceptée"
6. **Expected**: Green color indicator shows

**Filter Applications**
1. Use Status filter: Select "Acceptées"
2. **Expected**: Shows only accepted applications
3. Change to "Rejetées"
4. **Expected**: Shows rejected applications only

**Delete Application**
1. Click "Supprimer" on any application
2. Confirm
3. **Expected**: Application removed from table

---

### B. COMPANY USER TESTING

#### Login as Company
1. Navigate to `http://localhost:5173/login/entreprise`
2. Use company credentials
3. Should redirect to `/company`

#### Test 1: Job Offers Management
**Create Job Offer**
1. Navigate to Jobs Management
2. Click "+ Nouvelle Offre"
3. Fill complete form:
   - Titre: "Senior Python Developer"
   - Secteur: "Software Development"
   - Localisation: "Tunis, Tunisia"
   - Type Contrat: "CDI"
   - Salaire Min: "3500"
   - Salaire Max: "5500"
   - Niveau Expérience: "SENIOR"
   - Description: "Seeking experienced Python developer..."
4. Click "Créer"
5. **Expected**: Job appears in table with "ACTIF" status

**Search Jobs**
1. Type "Python" in search
2. **Expected**: Shows only Python Developer position
3. Type "Tunis"
4. **Expected**: Shows only Tunis-based jobs

**Update Job Offer**
1. Click "Modifier" on job
2. Change salary max to "6000"
3. Change status to "FERME"
4. Click "Mettre à jour"
5. **Expected**: Job status changes to closed, salary updates

**Delete Job**
1. Click "Supprimer"
2. Confirm dialog
3. **Expected**: Job removed from table

#### Test 2: Applications Management (`/company/applications-management`)
**View Received Applications**
1. Navigate to Applications Management
2. **Expected**: See all applications for company's jobs
3. Shows: Candidate name, Job title, Email, Status, Date

**Update Application Status**
1. For any application, use Status dropdown
2. Change: PENDING → UNDER_REVIEW → ACCEPTED
3. **Expected**: Background color changes (yellow → blue → green)

**Search Applications**
1. Type candidate name in search
2. **Expected**: Filters table
3. Type job title
4. **Expected**: Shows applications for that job

**Filter by Status**
1. Select "En cours d'examen" from status filter
2. **Expected**: Shows only applications in review

---

### C. CANDIDATE USER TESTING

#### Login as Candidate
1. Navigate to `http://localhost:5173/login/candidat`
2. Use candidate credentials
3. Should redirect to `/candidate`

#### Test: Visa Document Management (`/candidate/visa-management`)

**Upload Document**
1. Navigate to Visa Management
2. Click "+ Télécharger Document"
3. Select Type: "Passeport"
4. Choose PDF file from computer
5. Click "Télécharger"
6. **Expected**: File uploads, appears in table

**Upload Multiple Documents**
1. Repeat upload for "Visa"
2. Repeat for "Certificat de Police"
3. **Expected**: All 3 documents show in table

**Update Document Status**
1. Click status dropdown for Passport
2. Change: PENDING → IN_PROGRESS → APPROVED
3. **Expected**: Status updates, color changes
4. Do same for Visa: PENDING → REJECTED
5. **Expected**: Red color for rejected

**Filter Documents**
1. Use status filter: Select "APPROVED"
2. **Expected**: Shows only approved documents (Passport)
3. Switch to "REJECTED"
4. **Expected**: Shows Visa

**Delete Document**
1. Click "Supprimer" on any document
2. Confirm dialog
3. **Expected**: Document removed from table

**View Statistics**
1. Scroll to bottom
2. **Expected**: Stats show Total/Pending/Approved counts
3. Add new document and check counts update

---

## Advanced Test Cases

### Test Database Transactions

#### Create-Read-Update-Delete Cycle
1. Admin creates new user (CREATE)
2. Search for user to verify (READ)
3. Edit user details (UPDATE)
4. Delete user (DELETE)
5. Search for user - should not appear (VERIFY DELETE)

#### Cross-Table References
1. Admin creates new company (references user ID)
2. Company user creates job offer
3. Candidate applies for job
4. Admin views application in Applications Management
5. **Expected**: All relationships maintained

### Test Concurrent Operations

1. Admin user searches for users while editing
2. Company user creates job while updating another
3. Admin filters applications while updating statuses
4. **Expected**: No data loss, all operations consistent

### Test Search & Filters

**Multi-field Search**
1. Admin Users: Search for "john" (matches nom field)
2. **Expected**: John's profile appears
3. Search for "john@email.com" (matches email field)
4. **Expected**: Same user appears
5. Each column searchable independently

**Combined Filters**
1. Admin Applications: Set search="developer" + status="PENDING"
2. **Expected**: Only pending applications for positions with "developer" in name

### Test Form Validation

**User Creation - Missing Fields**
1. Leave "Nom" empty, try to create
2. **Expected**: Form doesn't submit, shows validation error

**Job Creation - Invalid Data**
1. Set Salaire Min: "10000", Salaire Max: "5000" (min > max)
2. Submit
3. **Expected**: Either accepts and stores, or validates

**Visa Upload - Invalid File**
1. Try uploading .exe file
2. **Expected**: Upload rejected or warning shown

### Test Authorization

**Try Direct URL Access**
1. Candidate tries to access `/admin/users` (should redirect)
2. **Expected**: Redirects to `/unauthorized`
3. Admin tries to access `/candidate/...` 
4. **Expected**: Redirects appropriately

---

## Performance Testing

### Load Data
1. Use backend seed scripts to create 100+ records
2. Navigate to admin users list
3. **Expected**: Loads in reasonable time
4. Type search term filtering 1000 records
5. **Expected**: Instant filtering response

### Rapid Operations
1. Create 5 jobs rapidly
2. Update each within seconds
3. **Expected**: No race conditions, all data correct

---

## Expected Behavior Checklist

### Frontend UI
- [ ] Forms validate before submit
- [ ] Loading states show during API calls
- [ ] Error alerts display for failed operations
- [ ] Success alerts confirm completed actions
- [ ] Tables show "No data" message when empty
- [ ] Search results update in real-time
- [ ] Status indicators use consistent colors

### Backend API
- [ ] Returns 201 on successful creation
- [ ] Returns 200 on successful update
- [ ] Returns 404 for non-existent resources
- [ ] Returns 400 for invalid data
- [ ] Returns 403 for unauthorized access
- [ ] Parameterized queries prevent SQL injection
- [ ] Transactions maintain data consistency

### Database
- [ ] Records persist after page reload
- [ ] Deleted records remove completely
- [ ] Updated values save correctly
- [ ] Search queries execute efficiently
- [ ] Foreign key relationships maintained

---

## Troubleshooting

### "Cannot GET /admin/users"
- **Issue**: Route not registered
- **Solution**: Check AppRoutes.tsx imports and route definitions

### "Unauthorized" on admin pages
- **Issue**: User role not ADMIN
- **Solution**: Create ADMIN user or login with correct credentials

### Form doesn't submit
- **Issue**: Validation errors
- **Solution**: Check console for validation messages, ensure all required fields filled

### Search doesn't work
- **Issue**: API endpoint not returning filtered results
- **Solution**: Check backend controller receives filter parameters correctly

### Button states not updating
- **Issue**: isLoading prop not connected
- **Solution**: Verify mutation loading state passed to button disabled prop

---

## Success Criteria

✅ **All CRUD pages load correctly**
✅ **Create operations add data to database**
✅ **Read operations fetch and display data**
✅ **Update operations modify existing records**
✅ **Delete operations remove records**
✅ **Search filters data accurately**
✅ **Status indicators update in real-time**
✅ **Error handling works properly**
✅ **Authorization prevents unauthorized access**
✅ **Data persists across page reloads**

---

## Conclusion

Following this guide ensures comprehensive testing of all database CRUD operations implemented in the employment matching platform. All major user roles (Admin, Company, Candidate) have full CRUD capability across their respective dashboards with complete database connectivity verified.