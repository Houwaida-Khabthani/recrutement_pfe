-- Migration: Enhance notification table with title and better timestamp handling
-- This migration adds title field and updates date to timestamp with proper default value

-- Check if title column exists, add it if not
ALTER TABLE notification
ADD COLUMN title VARCHAR(255) DEFAULT NULL AFTER id_notif,
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER lu;

-- Update date column type to DATETIME if needed (ensure it stores time properly)
-- Note: If date column needs updating, uncomment the line below
-- ALTER TABLE notification MODIFY COLUMN date DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Create an index on created_at for better query performance
CREATE INDEX idx_notification_created_at ON notification(created_at DESC);

-- Create an index on id_user and lu for better filtering performance
CREATE INDEX idx_notification_user_status ON notification(id_user, lu);
