-- Add company approval status column to user table
-- This migration adds a status field to track company approval status

ALTER TABLE user ADD COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' AFTER logo;

-- Set existing ENTREPRISE users to 'approved' to maintain backward compatibility
UPDATE user SET status = 'approved' WHERE role = 'ENTREPRISE';

-- New companies will start with 'pending' status (handled in code)
