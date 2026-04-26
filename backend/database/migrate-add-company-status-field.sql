-- Add status column to company table if it doesn't exist
ALTER TABLE company
ADD COLUMN status VARCHAR(50) DEFAULT 'pending' AFTER email;
