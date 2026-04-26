-- Migration: Add dynamic interview system
-- Date: April 23, 2026

-- Add columns to candidature table
ALTER TABLE candidature
ADD COLUMN expected_interviews TINYINT UNSIGNED NOT NULL DEFAULT 1,
ADD COLUMN interview_status ENUM('pending','in_progress','passed','failed') NOT NULL DEFAULT 'pending';

-- Create interviews table
CREATE TABLE interviews (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  application_id BIGINT UNSIGNED NOT NULL,
  recruiter_id BIGINT UNSIGNED NOT NULL,
  step TINYINT UNSIGNED NOT NULL,
  scheduled_date DATETIME DEFAULT NULL,
  status ENUM('pending','scheduled','passed','failed','cancelled') NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY app_step_unique (application_id, step),
  INDEX idx_application_id (application_id),
  FOREIGN KEY (application_id) REFERENCES candidature(id_candidature),
  FOREIGN KEY (recruiter_id) REFERENCES users(id_user)
);

-- Update existing applications to have interview_status based on current statut
UPDATE candidature
SET interview_status = CASE
  WHEN statut = 'ACCEPTED' THEN 'passed'
  WHEN statut = 'REJECTED' THEN 'failed'
  WHEN statut = 'INTERVIEW' THEN 'in_progress'
  ELSE 'pending'
END;

-- Insert existing interview data into new interviews table
INSERT INTO interviews (application_id, recruiter_id, step, scheduled_date, status, notes)
SELECT
  c.id_candidature,
  COALESCE(o.id_entreprise, 1), -- Default to company user if no recruiter
  1, -- Default to step 1
  c.entretien_date,
  CASE
    WHEN c.statut = 'INTERVIEW' THEN 'scheduled'
    WHEN c.statut = 'ACCEPTED' THEN 'passed'
    WHEN c.statut = 'REJECTED' THEN 'failed'
    ELSE 'pending'
  END,
  CONCAT('Migrated from old system. Note: ', COALESCE(c.note_recruteur, ''))
FROM candidature c
LEFT JOIN offre o ON c.id_offre = o.id_offre
WHERE c.entretien_date IS NOT NULL OR c.statut IN ('INTERVIEW', 'ACCEPTED', 'REJECTED');