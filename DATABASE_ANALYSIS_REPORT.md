# Database Analysis Report
## Comprehensive Backend Database Tables Mapping

**Generated:** April 28, 2026  
**Scope:** Backend codebase analysis for `pfe_recrutement` project  
**Analyzed Directories:** `backend/src/modules/*/model.js`, `backend/src/modules/*/service.js`, `backend/database/`

---

## Executive Summary

This analysis identifies **11 primary database tables** actively used across the recruitment platform backend. The system uses a combination of MySQL queries with `pool.query()` and `pool.execute()` methods, managing relationships through foreign keys.

### Tables Found:
1. `user` - User accounts and profiles
2. `company` - Company/organization information
3. `offre` - Job offers/positions
4. `candidature` - Job applications
5. `certification` - Candidate certifications
6. `matching` - AI/matching scores
7. `notification` - System notifications
8. `fichier` - File storage metadata
9. `demande_visa` - Visa request information
10. `visa` - Visa details
11. `document_visa` - Visa documents
12. `interviews` - Interview scheduling (recently added)

---

## Detailed Table Analysis

### 1. **USER** Table
**File Location:** `backend/src/modules/users/user.model.js`, `backend/src/modules/auth/auth.model.js`

**Status:** Core table - HIGH USAGE

**Columns (from schema):**
- `id_user` (PK)
- `nom`, `email` (UNIQUE), `mot_de_passe`
- `role` (ENUM: 'ADMIN', 'CANDIDAT', 'ENTREPRISE')
- `telephone`, `pays`, `adresse`
- `date_inscription`, `civilite`, `date_naissance`
- `cv`, `niveau_etude`, `specialite`, `experience`
- `nom_entreprise`, `description_entreprise`, `identifiant_entreprise`
- `logo`, `secteur`, `site_web`
- `bio`, `avatar`, `linkedin`, `github`, `portfolio`, `is_verified`
- `projets`, `langues`, `certification`, `competences`

**Operations:**
- **SELECT**: Authentication, profile retrieval, filtering
- **INSERT**: User registration
- **UPDATE**: Profile updates, password reset
- **DELETE**: User management (admin)

**Query Examples:**
```sql
-- Authentication
SELECT * FROM user WHERE email = ?

-- Get user profile
SELECT id_user, nom, email, role, civilite, date_naissance, pays, adresse, 
       nom_entreprise, secteur, site_web, logo, status FROM user WHERE id_user = ?

-- Get user stats
SELECT COUNT(*) AS total FROM candidature WHERE id_user = ?

-- Update user
UPDATE user SET [fields] WHERE id_user = ?
```

**Files Using Table:**
- `backend/src/modules/auth/auth.model.js` (4+ operations)
- `backend/src/modules/auth/auth.service.js` (6+ operations)
- `backend/src/modules/users/user.model.js` (5+ operations)
- `backend/src/modules/admin/admin.model.js` (10+ operations)
- `backend/src/modules/candidates/candidate.model.js` (3+ operations)
- `backend/src/services/notificationHelper.js` (multiple operations)
- Multiple JOIN queries across all modules

**Frequency:** **CRITICAL** - Referenced in 50+ queries

---

### 2. **COMPANY** Table
**File Location:** `backend/src/modules/companies/company.service.js`, `backend/src/modules/admin/admin.model.js`

**Status:** Core table - HIGH USAGE

**Columns (from schema):**
- `id_company` (PK)
- `nom`, `description`, `logo`
- `email`, `telephone`, `secteur`, `pays`
- `site_web`, `type`
- `id_user` (FK to user)
- `status` (from migration - added field)

**Operations:**
- **SELECT**: Get company details, job counts, company info for offers
- **INSERT**: Create new company
- **UPDATE**: Update company profile/status
- **DELETE**: Delete company

**Query Examples:**
```sql
-- Get company by user
SELECT * FROM company WHERE id_user = ?

-- Get company details
SELECT id_company, nom, description, logo, email, telephone, secteur, pays, site_web, type 
FROM company WHERE id_company = ?

-- Get job count
SELECT COUNT(*) as job_count FROM offre WHERE id_empresa = ? AND statut IN ('OUVERT', 'Active')

-- Update company
UPDATE company SET [fields] WHERE id_company = ?

-- Insert company
INSERT INTO company (nom, description, email, secteur, id_user) VALUES (?, ?, ?, ?, ?)
```

**Files Using Table:**
- `backend/src/modules/companies/company.service.js` (8+ operations)
- `backend/src/modules/admin/admin.model.js` (5+ operations)
- `backend/src/modules/jobs/job.model.js` (2+ JOIN operations)
- `backend/src/modules/files/file.model.js` (2+ JOIN operations)
- Multiple services and controllers

**Frequency:** **VERY HIGH** - Referenced in 40+ queries

---

### 3. **OFFRE** Table (Job Offers)
**File Location:** `backend/src/modules/jobs/job.model.js`

**Status:** Core table - HIGH USAGE

**Columns:**
- `id_offre` (PK)
- `titre`, `type_contrat`, `localisation`
- `description`, `salaire`, `experience`
- `date_pub`, `statut` (OUVERT, FERME, Active)
- `id_entreprise` (FK to company)
- `nombre_vues`, `date_expiration`

**Operations:**
- **SELECT**: List jobs, filter by location, get job details
- **INSERT**: Create new job offer
- **UPDATE**: Update job details, change status
- **DELETE**: Delete job offer

**Query Examples:**
```sql
-- List active jobs
SELECT o.*, c.nom as company_name, c.logo as company_logo 
FROM offre o 
JOIN company c ON o.id_entreprise = c.id_company 
WHERE (o.statut = 'OUVERT' OR o.statut = 'Active')

-- Get job details
SELECT o.*, c.nom as company_name, c.logo as company_logo, c.description as company_description 
FROM offre o 
JOIN company c ON o.id_entreprise = c.id_company 
WHERE o.id_offre = ?

-- Create job
INSERT INTO offre (titre, type_contrat, localisation, description, salaire, experience, 
                   id_entreprise, date_pub, statut, date_expiration) 
VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)

-- Update job
UPDATE offre SET [fields] WHERE id_offre = ?

-- Close job
UPDATE offre SET statut = 'FERME' WHERE id_offre = ?
```

**Files Using Table:**
- `backend/src/modules/jobs/job.model.js` (10+ operations)
- `backend/src/modules/companies/company.service.js` (3+ operations)
- `backend/src/modules/admin/admin.model.js` (2+ operations)
- Analytics, interviews, applications modules

**Frequency:** **VERY HIGH** - Referenced in 45+ queries

**Relationships:**
- Connected to `company` via `id_entreprise`
- Parent table for `candidature` (applications)
- Parent table for `matching`

---

### 4. **CANDIDATURE** Table (Job Applications)
**File Location:** `backend/src/modules/applications/application.model.js`

**Status:** Core table - CRITICAL USAGE

**Columns:**
- `id_candidature` (PK)
- `cv`, `lettre_motivation`, `date_postule`
- `statut` (EN_ATTENTE, INTERVIEW, ACCEPTEE, REFUSEE, etc.)
- `date_reponse`, `entretien_date`, `entretien_lieu`
- `note_recruteur`
- `offer_salary`, `offer_currency`, `offer_contract_type`
- `offer_start_date`, `offer_message`, `offer_status`
- `offer_sent_at`, `offer_responded_at`
- `id_user` (FK to user)
- `id_offre` (FK to offre)
- `expected_interviews` (from interviews migration)

**Operations:**
- **SELECT**: Get applications by user/job/company, complex joins with statistics
- **INSERT**: Create new application
- **UPDATE**: Update application status, interview info, offers
- **DELETE**: Remove application (cascading)

**Query Examples:**
```sql
-- Get applications by user with job and company
SELECT c.*, o.titre as job_title, o.localisation, comp.nom as company_name, comp.logo 
FROM candidature c
JOIN offre o ON c.id_offre = o.id_offre
JOIN company comp ON o.id_entreprise = comp.id_company
WHERE c.id_user = ?

-- Get applications by job
SELECT c.*, u.nom as candidate_name, u.email, u.telephone, u.adresse, 
       u.experience, u.avatar, u.bio, u.specialite, u.niveau_etude,
       u.linkedin, u.github, u.portfolio, u.cv
FROM candidature c
JOIN user u ON c.id_user = u.id_user
WHERE c.id_offre = ?

-- Create application
INSERT INTO candidature (cv, lettre_motivation, date_postule, statut, id_user, id_offre)
VALUES (?, ?, NOW(), 'EN_ATTENTE', ?, ?)

-- Update application status with offer details
UPDATE candidature SET 
  statut = ?, 
  entretien_date = COALESCE(?, entretien_date),
  entretien_lieu = COALESCE(?, entretien_lieu),
  note_recruteur = COALESCE(?, note_recruteur),
  offer_salary = COALESCE(?, offer_salary),
  offer_currency = COALESCE(?, offer_currency),
  offer_contract_type = COALESCE(?, offer_contract_type),
  offer_start_date = COALESCE(?, offer_start_date),
  offer_message = COALESCE(?, offer_message),
  offer_status = COALESCE(?, offer_status),
  offer_sent_at = CASE WHEN ? = 'ACCEPTED' AND offer_sent_at IS NULL THEN NOW() ELSE offer_sent_at END,
  date_reponse = COALESCE(?, NOW())
WHERE id_candidature = ?

-- Count applications for stats
SELECT COUNT(*) AS total FROM candidature WHERE id_user = ?
```

**Files Using Table:**
- `backend/src/modules/applications/application.model.js` (8+ operations)
- `backend/src/modules/admin/admin.model.js` (4+ operations)
- `backend/src/modules/matching/matching.model.js` (JOIN operations)
- `backend/src/modules/users/user.model.js` (3+ JOIN operations)
- `backend/src/modules/interviews/interview.model.js` (JOIN operations)
- Multiple analytics and notification services

**Frequency:** **CRITICAL** - Referenced in 60+ queries

**Relationships:**
- Foreign key to `user` (id_user)
- Foreign key to `offre` (id_offre)
- Parent table for `matching`
- Parent table for `interviews`

---

### 5. **MATCHING** Table (AI Matching Scores)
**File Location:** `backend/src/modules/matching/matching.model.js`, `backend/src/modules/ai/ai.service.js`

**Status:** Feature-specific - MEDIUM USAGE

**Columns:**
- `id_matching` (PK)
- `score`, `note`
- `date`
- `id_candidature` (FK to candidature)
- `id_offre` (FK to offre)

**Operations:**
- **SELECT**: Get matching scores, filter by score threshold
- **INSERT**: Create matching record
- **UPDATE**: Update score/note
- **DELETE**: Remove matching record

**Query Examples:**
```sql
-- Get all matching records with details
SELECT m.*, u.nom as candidate_name, o.titre as job_title, c.date_postule
FROM matching m
JOIN candidature c ON m.id_candidature = c.id_candidature
JOIN user u ON c.id_user = u.id_user
JOIN offre o ON m.id_offre = o.id_offre
WHERE 1=1 [filters]
ORDER BY m.score DESC

-- Get matching for candidates
SELECT u.*, c.*, m.* 
FROM user u
JOIN candidature c ON u.id_user = c.id_user
JOIN matching m ON c.id_candidature = m.id_candidature

-- Insert matching
INSERT INTO matching (score, note, date, id_candidature, id_offre) 
VALUES (?, ?, NOW(), ?, ?)

-- Calculate average matching
SELECT AVG(score) as avg FROM matching
```

**Files Using Table:**
- `backend/src/modules/matching/matching.model.js` (5+ operations)
- `backend/src/modules/ai/ai.service.js` (2+ operations)
- `backend/src/modules/companies/company.service.js` (1+ operation)

**Frequency:** **MEDIUM** - Referenced in 15+ queries

---

### 6. **CERTIFICATION** Table
**File Location:** `backend/src/modules/certifications/certification.model.js`

**Status:** Feature-specific - LOW TO MEDIUM USAGE

**Columns:**
- `id_certif` (PK)
- `date_obtient`, `university`, `competence`
- `description`
- `id_user` (FK to user)

**Operations:**
- **SELECT**: Get certifications by user
- **INSERT**: Add certification
- **UPDATE**: Update certification details
- **DELETE**: Remove certification

**Query Examples:**
```sql
-- Get certifications with user info
SELECT c.*, u.nom as candidate_name 
FROM certification c 
JOIN user u ON c.id_user = u.id_user 
WHERE [filters]

-- Get specific certification
SELECT c.*, u.nom as candidate_name 
FROM certification c 
JOIN user u ON c.id_user = u.id_user 
WHERE c.id_certif = ?

-- Insert certification
INSERT INTO certification (date_obtient, university, competence, id_user) 
VALUES (?, ?, ?, ?)

-- Update certification
UPDATE certification SET [fields] WHERE id_certif = ?

-- Delete certification
DELETE FROM certification WHERE id_certif = ?
```

**Files Using Table:**
- `backend/src/modules/certifications/certification.model.js` (5+ operations)
- `backend/src/modules/certifications/certification.controller.js` (management)

**Frequency:** **LOW-MEDIUM** - Referenced in 12+ queries

---

### 7. **NOTIFICATION** Table
**File Location:** `backend/src/modules/notifications/notification.model.js`

**Status:** Feature-specific - MEDIUM USAGE

**Columns:**
- `id_notif` (PK)
- `title`, `message`, `type`
- `date`, `created_at` (TIMESTAMP)
- `lu` (TINYINT - read flag)
- `id_user` (FK to user)

**Operations:**
- **SELECT**: Get notifications by user, filter by read status
- **INSERT**: Create notification
- **UPDATE**: Mark as read
- **DELETE**: Remove notification

**Query Examples:**
```sql
-- Get notifications for user
SELECT * FROM notification 
WHERE id_user = ? 
ORDER BY created_at DESC, date DESC

-- Get unread count
SELECT COUNT(*) as unreadCount 
FROM notification 
WHERE id_user = ? AND lu = 0

-- Create notification
INSERT INTO notification (title, message, type, date, created_at, id_user, lu) 
VALUES (?, ?, ?, NOW(), NOW(), ?, 0)

-- Mark as read
UPDATE notification SET lu = 1 WHERE id_notif = ?

-- Mark all as read
UPDATE notification SET lu = 1 WHERE id_user = ? AND lu = 0
```

**Files Using Table:**
- `backend/src/modules/notifications/notification.model.js` (6+ operations)
- `backend/src/services/notificationHelper.js` (multiple operations)

**Frequency:** **MEDIUM** - Referenced in 20+ queries

---

### 8. **FICHIER** Table (Files/Documents)
**File Location:** `backend/src/modules/files/file.model.js`

**Status:** Feature-specific - LOW USAGE

**Columns:**
- `id_fichier` (PK)
- `nom`, `date_creation`, `type`, `url`
- `id_entreprise` (FK to company)

**Operations:**
- **SELECT**: Get files with user/company info
- **INSERT**: Upload file
- **UPDATE**: Update file info
- **DELETE**: Remove file

**Query Examples:**
```sql
-- Get files
SELECT f.*, u.nom as uploader_name, c.nom as company_name 
FROM fichier f 
LEFT JOIN user u ON f.id_entreprise = u.id_user 
LEFT JOIN company c ON f.id_entreprise = c.id_company 
WHERE [filters]

-- Get file by ID
SELECT f.*, u.nom as uploader_name 
FROM fichier f 
LEFT JOIN user u ON f.id_entreprise = u.id_user 
WHERE f.id_fichier = ?

-- Insert file
INSERT INTO fichier (nom, date_creation, type, url, id_entreprise) 
VALUES (?, NOW(), ?, ?, ?)

-- Update file
UPDATE fichier SET [fields] WHERE id_fichier = ?

-- Delete file
DELETE FROM fichier WHERE id_fichier = ?
```

**Files Using Table:**
- `backend/src/modules/files/file.model.js` (5+ operations)

**Frequency:** **LOW** - Referenced in 10+ queries

---

### 9. **DEMANDE_VISA** Table (Visa Requests)
**File Location:** `backend/src/modules/visas/visa.model.js`

**Status:** Feature-specific - LOW USAGE

**Columns:**
- `id_demande` (PK)
- `date_demande`, `statut`, `type_visa`
- `date_debut`, `date_fin`
- `commentaire_admin`
- `id_user` (FK to user)

**Operations:**
- **SELECT**: Get visa requests
- **INSERT**: Create visa request
- **UPDATE**: Update status/admin comments
- **DELETE**: Remove request

**Query Examples:**
```sql
-- Get visa requests
SELECT d.*, u.nom 
FROM demande_visa d
JOIN user u ON d.id_user = u.id_user
WHERE [filters]

-- Get by user
SELECT * FROM demande_visa 
WHERE id_user = ? 
ORDER BY date_demande DESC

-- Create request
INSERT INTO demande_visa (date_demande, statut, type_visa, date_debut, date_fin, id_user)
VALUES (?, ?, ?, ?, ?, ?)

-- Update status
UPDATE demande_visa 
SET statut = ?, commentaire_admin = ? 
WHERE id_demande = ?
```

**Files Using Table:**
- `backend/src/modules/visas/visa.model.js` (4+ operations)

**Frequency:** **LOW** - Referenced in 8+ queries

---

### 10. **VISA** Table
**File Location:** `backend/src/modules/visas/visa.model.js`

**Status:** Feature-specific - LOW USAGE

**Columns:**
- `id_visa` (PK)
- `pays`, `date_creation`, `type`, `statut`
- `date_validation`
- `id_demande` (FK to demande_visa)

**Operations:**
- **SELECT**: Get visa details
- **INSERT**: Create visa record
- **DELETE**: Remove visa

**Query Examples:**
```sql
-- Get visa
SELECT * FROM visa WHERE id_visa = ?

-- Insert visa
INSERT INTO visa (pays, date_creation, type, statut, date_validation, id_demande)
VALUES (?, ?, ?, ?, ?, ?)
```

**Files Using Table:**
- `backend/src/modules/visas/visa.model.js` (3+ operations)

**Frequency:** **VERY LOW** - Referenced in 5+ queries

---

### 11. **DOCUMENT_VISA** Table (Visa Documents)
**File Location:** `backend/src/modules/visas/visa.model.js`

**Status:** Feature-specific - LOW USAGE

**Columns:**
- `id_document` (PK)
- `id_user` (FK to user)
- `id_demande_visa` (FK to demande_visa)
- `type_document`, `nom_fichier`, `chemin_fichier`, `taille_fichier`
- `statut`, `commentaire_admin`

**Operations:**
- **SELECT**: Get documents with filters and joins
- **INSERT**: Upload visa document
- **UPDATE**: Update status/comments
- **DELETE**: Remove document

**Query Examples:**
```sql
-- Get documents
SELECT d.* 
FROM document_visa d
LEFT JOIN demande_visa dv ON d.id_demande_visa = dv.id_demande
WHERE [filters]

-- Get by ID
SELECT * FROM document_visa WHERE id_document = ?

-- Insert document
INSERT INTO document_visa (id_user, id_demande_visa, type_document, nom_fichier, chemin_fichier, taille_fichier)
VALUES (?, ?, ?, ?, ?, ?)

-- Update status
UPDATE document_visa 
SET statut = ?, commentaire_admin = ? 
WHERE id_document = ?

-- Delete document
DELETE FROM document_visa WHERE id_document = ?
```

**Files Using Table:**
- `backend/src/modules/visas/visa.model.js` (5+ operations)

**Frequency:** **LOW** - Referenced in 10+ queries

---

### 12. **INTERVIEWS** Table (Recently Added)
**File Location:** `backend/src/modules/interviews/interview.model.js`

**Status:** Core table (NEW) - MEDIUM USAGE

**Columns:**
- `id_interview` (PK)
- `id_candidature` (FK to candidature)
- `step`, `date`, `location`
- `meeting_link`, `status`
- `notes`, `created_at`, `updated_at`
- `confirmed_at`, `confirmed_by` (from confirmation fields migration)

**Operations:**
- **SELECT**: Get interviews by user/application with complex joins
- **INSERT**: Schedule interview step
- **UPDATE**: Update meeting link, status, confirmation
- **DELETE**: Remove interview (cascading)

**Query Examples:**
```sql
-- Get candidate interviews
SELECT i.id_interview, i.step, i.date, i.location, i.meeting_link, i.status, i.notes,
       c.id_candidature, c.expected_interviews,
       o.titre, co.nom
FROM interviews i
JOIN candidature c ON i.id_candidature = c.id_candidature
JOIN offre o ON c.id_offre = o.id_offre
JOIN company co ON o.id_entreprise = co.id_company
WHERE c.id_user = ?
ORDER BY i.step ASC, i.date DESC

-- Schedule interview
INSERT INTO interviews (id_candidature, step, date, location, meeting_link, status)
VALUES (?, ?, ?, ?, ?, 'scheduled')

-- Update meeting link
UPDATE interviews 
SET meeting_link = ?, updated_at = NOW() 
WHERE id_interview = ?

-- Update status
UPDATE interviews 
SET status = ?, notes = ?, updated_at = NOW() 
WHERE id_interview = ?

-- Confirm interview
UPDATE interviews 
SET status = 'confirmed', updated_at = NOW() 
WHERE id_interview = ?
```

**Files Using Table:**
- `backend/src/modules/interviews/interview.model.js` (8+ operations)
- `backend/src/modules/interviews/interview.controller.js` (multiple operations)
- `backend/src/modules/interviews/interview.service.js` (multiple operations)

**Frequency:** **MEDIUM** - Referenced in 20+ queries

**Relationships:**
- Foreign key to `candidature` (id_candidature)
- UNIQUE constraint on (id_candidature, step)

---

## Database Relationships Map

```
user (core)
  ├── company (many to one: id_user)
  ├── candidature (many to one: id_user)
  ├── certification (many to one: id_user)
  ├── demande_visa (many to one: id_user)
  ├── document_visa (many to one: id_user)
  └── notification (many to one: id_user)

company
  ├── offre (many to one: id_company via id_entreprise)
  └── fichier (many to one: id_company via id_entreprise)

offre (job offers)
  ├── candidature (many to one: id_offre)
  └── matching (many to one: id_offre)

candidature (applications)
  ├── matching (one to many: id_candidature)
  └── interviews (one to many: id_candidature)

demande_visa
  └── visa (one to many: id_demande)
  └── document_visa (one to many: id_demande_visa)
```

---

## Naming Inconsistencies & Issues

### ⚠️ Critical Issues

#### 1. **Table Name Inconsistency: `offre` vs Expected Naming**
- **Issue**: Uses French name `offre` (offer) while other tables use English (`user`, `company`, `certification`)
- **Observed**: `offre` table consistently referenced in all job-related queries
- **Used in**: 45+ queries across 6 modules
- **Impact**: Makes codebase partially inconsistent with language choice
- **Recommendation**: Standardize to either all English (rename to `job_offers` or `offers`) or all French

#### 2. **Foreign Key Naming: `id_entreprise` vs `id_company`**
- **Issue**: 
  - Table uses `company` (English)
  - Foreign key in `offre` is named `id_entreprise` (French)
  - Foreign key in `fichier` is named `id_entreprise` (French)
- **Pattern Observed**:
  ```sql
  offre.id_entreprise -> company.id_company
  fichier.id_entreprise -> company.id_company
  ```
- **Impact**: Confusing for developers; breaks naming convention
- **Recommendation**: Standardize to `id_company` across all tables

#### 3. **Primary Key Column Naming Mismatch: `id_candidature` vs Various IDs**
- **Issue**: Inconsistent PK naming patterns:
  - `user`: `id_user` ✓
  - `company`: `id_company` ✓
  - `candidature`: `id_candidature` ✓ (matches table name)
  - `offre`: `id_offre` ✓ (matches table name)
  - `certification`: `id_certif` ✗ (shortened, inconsistent)
  - `demande_visa`: `id_demande` ✗ (shortened, inconsistent)
  - `visa`: `id_visa` ✓
  - `document_visa`: `id_document` ✗ (generic, inconsistent)
  - `notification`: `id_notif` ✗ (shortened, inconsistent)
  - `fichier`: `id_fichier` ✓
  - `matching`: `id_matching` ✓
  - `interviews`: `id_interview` ✓

**Recommendation**: Use consistent pattern `id_[table_name_singular]`

#### 4. **Status Field Values Inconsistency in `candidature.statut`**
- **Observed Values**: 
  - `EN_ATTENTE` (French - "Pending")
  - `INTERVIEW`, `ENTRETIEN` (both mean "Interview" - mixed French)
  - `ACCEPTEE` (French - "Accepted")
  - `REFUSEE` (French - "Refused")
  - `ACCEPTED` (English) - Alternative form used in analytics
  - `REJECTED` (English) - Alternative form
  - `RECRUTE` (French - "Hired")
  - `EMBAUCHE` (French - "Hired" - duplicate)

**Query Evidence** (from analytics.service.js):
```javascript
const acceptedCondition = (column) => 
  `${column} IN ('ACCEPTED', 'ACCEPTEE', 'EMBAUCHE')`
```

- **Impact**: Code must handle multiple variations for same concept
- **Files Affected**: analytics.service.js, application.model.js, admin.model.js
- **Recommendation**: Standardize to single set: `PENDING`, `IN_REVIEW`, `INTERVIEW`, `REJECTED`, `ACCEPTED`

#### 5. **Job Status Inconsistency in `offre.statut`**
- **Observed Values**:
  - `OUVERT` (French - "Open")
  - `Active` (English)
  - `FERME` (French - "Closed")

**Query Evidence** (from job.model.js):
```sql
WHERE (o.statut = 'OUVERT' OR o.statut = 'Active')
```

- **Impact**: Inconsistent state values require multiple comparisons
- **Recommendation**: Standardize to `OPEN`, `CLOSED`, `ARCHIVED`

#### 6. **Interview Status Variations**
- **In `interviews` table**:
  - `scheduled`, `confirmed`, `passed`, `failed`, `cancelled` (English, lowercase)
- **In `candidature` table**:
  - `INTERVIEW`, `ENTRETIEN` (French, mixed with other statuses)
- **Migration file shows alternative**:
  - `pending`, `in_progress`, `passed`, `failed` (different enum set)

- **Impact**: Multiple status systems for same concept
- **Recommendation**: Consolidate to single status system

#### 7. **Column Name Inconsistency: `entretien_date` vs `entretien_lieu`**
- **Location**: `candidature` table
- **Issue**: Mixed French naming
  - `entretien_date` (French: "interview date")
  - `entretien_lieu` (French: "interview location")
  
These should be standardized alongside other fields or translated to English

#### 8. **Unused/Redundant Fields in `user` Table**
- **Fields Potentially Unused**:
  - `nom_entreprise` (should use `company.nom` instead)
  - `description_entreprise` (should use `company.description`)
  - `identifiant_entreprise` (no references found in code)
  - `secteur` (duplicated in `company.secteur`)
  - `site_web` (duplicated in `company.site_web`)
  - `logo` (duplicated in `company.logo`)

**Impact**: Data denormalization, storage waste, sync issues
**Recommendation**: Remove from `user` table; always query `company` for company-related data

#### 9. **Migration Schema Versions**
- **Issue**: Multiple migration files define `interviews` table differently
- `backend/migrate-interview-system.js` - Uses `id_interview` (INT)
- `backend/src/scripts/migration_interview_system.sql` - Uses `id` (BIGINT)

**Impact**: Schema version mismatch, potential migration conflicts
**Recommendation**: Consolidate migrations, use single version

#### 10. **Typo/Error: `id_empresa` in Query**
- **Location**: `backend/src/modules/companies/company.service.js`
- **Found In**:
  ```sql
  SELECT COUNT(*) as job_count FROM offre WHERE id_empresa = ?
  ```
- **Should be**: `id_entreprise` or standardized to `id_company`
- **Impact**: Query may fail
- **Action**: Fix to correct column name

---

## Query Pattern Analysis

### Most Used Patterns

#### 1. **JOIN Pattern (Highest Frequency)**
```sql
SELECT * FROM table1 t1
JOIN table2 t2 ON t1.foreign_key = t2.primary_key
```
**Used in**: 60+ queries across all modules

#### 2. **LEFT JOIN for Optional Data**
```sql
SELECT * FROM table1 t1
LEFT JOIN table2 t2 ON t1.key = t2.key
```
**Used in**: 20+ queries (files, documents, interviews)

#### 3. **COUNT(*) for Statistics**
```sql
SELECT COUNT(*) AS total FROM table WHERE [conditions]
```
**Used in**: 30+ queries (analytics, dashboards, statistics)

#### 4. **Dynamic WHERE Clause Building**
```javascript
let query = "SELECT * FROM table WHERE 1=1";
const params = [];
if (filter) {
  query += " AND field = ?";
  params.push(value);
}
```
**Used in**: Admin, analytics, filtering modules

#### 5. **COALESCE for Update Fallback**
```sql
UPDATE table SET field = COALESCE(?, field)
```
**Used in**: Application status updates, field updates

---

## File-to-Table Cross-Reference

### By Module

#### **auth** Module
- `user` (PRIMARY)
- Table Ops: SELECT (auth), INSERT (register), UPDATE (password)

#### **users** Module
- `user` (PRIMARY)
- `candidature` (via JOIN)
- Table Ops: SELECT (profile, stats), UPDATE (profile)

#### **candidates** Module
- `user` (PRIMARY)
- `candidature` (via JOIN)
- Table Ops: SELECT, UPDATE

#### **companies** Module
- `company` (PRIMARY)
- `offre` (via FK)
- `candidature` (via deep JOIN)
- `user` (via LEFT JOIN)
- Table Ops: SELECT, INSERT, UPDATE, DELETE

#### **jobs** Module
- `offre` (PRIMARY)
- `company` (via JOIN)
- `candidature` (via JOIN)
- Table Ops: SELECT, INSERT, UPDATE, DELETE, CLOSE

#### **applications** Module
- `candidature` (PRIMARY)
- `offre` (via JOIN)
- `company` (via JOIN)
- `user` (via JOIN)
- `matching` (via LEFT JOIN)
- Table Ops: SELECT, INSERT, UPDATE

#### **interviews** Module
- `interviews` (PRIMARY)
- `candidature` (via JOIN)
- `offre` (via JOIN)
- `company` (via JOIN)
- Table Ops: SELECT, INSERT, UPDATE

#### **matching** Module
- `matching` (PRIMARY)
- `candidature` (via JOIN)
- `user` (via JOIN)
- `offre` (via JOIN)
- Table Ops: SELECT, INSERT, UPDATE, DELETE

#### **certifications** Module
- `certification` (PRIMARY)
- `user` (via JOIN)
- Table Ops: SELECT, INSERT, UPDATE, DELETE

#### **notifications** Module
- `notification` (PRIMARY)
- `user` (via FK)
- Table Ops: SELECT, INSERT, UPDATE (mark as read), DELETE

#### **files** Module
- `fichier` (PRIMARY)
- `user` (via LEFT JOIN)
- `company` (via LEFT JOIN)
- Table Ops: SELECT, INSERT, UPDATE, DELETE

#### **visas** Module
- `demande_visa` (PRIMARY)
- `visa` (via FK)
- `document_visa` (via FK)
- `user` (via JOIN)
- Table Ops: SELECT, INSERT, UPDATE, DELETE

#### **admin** Module
- `user` (PRIMARY)
- `company` (SECONDARY)
- `candidature` (SECONDARY)
- `offre` (SECONDARY)
- Table Ops: SELECT (all), INSERT, UPDATE, DELETE

#### **analytics** Module
- `candidature` (PRIMARY)
- `offre` (PRIMARY)
- `user` (via JOIN)
- `company` (via JOIN)
- `matching` (via JOIN)
- Table Ops: SELECT (complex aggregations)

---

## Table Usage Frequency Summary

| Table | Module Count | Query Count | Operations | Risk Level |
|-------|-------------|------------|-----------|-----------|
| user | 8 | 50+ | CRUD | **CRITICAL** |
| candidature | 7 | 60+ | CRUD | **CRITICAL** |
| offre | 6 | 45+ | CRUD | **HIGH** |
| company | 5 | 40+ | CRUD | **HIGH** |
| interviews | 3 | 20+ | CRUD | **MEDIUM** |
| notification | 2 | 20+ | CRU | **MEDIUM** |
| matching | 3 | 15+ | CRUD | **MEDIUM** |
| certification | 2 | 12+ | CRUD | **LOW** |
| fichier | 1 | 10+ | CRUD | **LOW** |
| document_visa | 1 | 10+ | CRUD | **LOW** |
| demande_visa | 1 | 8+ | CRUD | **LOW** |
| visa | 1 | 5+ | CRD | **VERY LOW** |

---

## Recommendations

### 1. **Immediate Actions Required**

#### A. Standardize Table & Column Naming
```
Current                  →  Proposed
offre                    →  job_offers
id_entreprise            →  id_company
id_certif                →  id_certification
id_demande               →  id_visa_request
id_notif                 →  id_notification
id_document              →  id_visa_document
entretien_date           →  interview_date
entretien_lieu           →  interview_location
```

#### B. Standardize Enum Values
```
Candidature Status:
Current: EN_ATTENTE, INTERVIEW, ENTRETIEN, ACCEPTEE, REFUSEE, RECRUTE, EMBAUCHE
Proposed: PENDING, IN_REVIEW, INTERVIEW, REJECTED, ACCEPTED

Job Status:
Current: OUVERT, Active, FERME
Proposed: OPEN, ACTIVE, CLOSED

Interview Status:
Current: scheduled, confirmed, passed, failed, cancelled (+ alternatives)
Proposed: PENDING, SCHEDULED, CONFIRMED, PASSED, FAILED, CANCELLED
```

#### C. Fix Known Errors
- Fix typo: `id_empresa` → `id_entreprise` or `id_company`
- Consolidate interview table migrations

### 2. **Data Quality Improvements**

#### A. Remove Denormalized User Company Fields
- Move `user.nom_entreprise` → Always use `company.nom`
- Move `user.description_entreprise` → Always use `company.description`
- Remove `user.secteur` (use `company.secteur`)
- Remove `user.site_web` (use `company.site_web`)
- Remove `user.logo` (use `company.logo`)

#### B. Create Validation Rules
- Ensure `candidature.statut` uses only approved enum values
- Ensure `offre.statut` uses only approved enum values
- Validate foreign key relationships at application level

### 3. **Schema Optimization**

#### A. Add Missing Indexes
```sql
-- For filtering and sorting
CREATE INDEX idx_candidature_status ON candidature(statut);
CREATE INDEX idx_offre_status ON offre(statut);
CREATE INDEX idx_offre_company ON offre(id_entreprise);
CREATE INDEX idx_candidature_user_job ON candidature(id_user, id_offre);
CREATE INDEX idx_user_role ON user(role);
CREATE INDEX idx_company_user ON company(id_user);
```

#### B. Consider Table Partitioning
- Partition `candidature` by year (data grows quickly)
- Partition `notification` by date (archive old records)

### 4. **Performance Considerations**

#### A. Heavy JOIN Patterns
- Tables `candidature`, `offre`, `company`, `user` frequently joined
- Consider creating materialized views or caching results
- Recommended for analytics queries

#### B. Status-Based Filtering
- Index on status columns (`candidature.statut`, `offre.statut`)
- These are heavily used in WHERE clauses

### 5. **Migration Strategy**

1. **Phase 1**: Create backup and test environment
2. **Phase 2**: Create new tables with standardized names
3. **Phase 3**: Migrate data incrementally
4. **Phase 4**: Update application queries
5. **Phase 5**: Drop old tables (with safety verification)

---

## Conclusion

The database schema serves the recruitment platform well with **12 main tables** across 8 functional modules. The primary concerns are:

1. **Naming inconsistencies** (French/English mix, abbreviated IDs)
2. **Status value variations** requiring multiple comparisons
3. **Data denormalization** in the user table
4. **New interviews table** needs schema consolidation

These are **maintainability issues** rather than functionality issues. With the recommended standardizations, the codebase will be more maintainable, scalable, and developer-friendly.

---

## Appendix: Complete Table Inventory

```
Database Tables (12 total)
├── CORE TABLES (4)
│   ├── user
│   ├── company
│   ├── offre
│   └── candidature
│
├── RELATIONSHIP TABLES (2)
│   ├── matching
│   └── interviews (NEW)
│
├── FEATURE TABLES (4)
│   ├── certification
│   ├── notification
│   ├── fichier
│   └── demande_visa
│
└── SECONDARY FEATURE TABLES (2)
    ├── visa
    └── document_visa
```

---

*Report Generated: 2026-04-28*  
*Analysis Scope: Backend modules (src/modules/*/), Database schemas (backend/database/)*  
*Methodology: Comprehensive grep search, file analysis, query pattern recognition*
