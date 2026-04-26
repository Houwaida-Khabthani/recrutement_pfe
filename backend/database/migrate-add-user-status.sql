-- Add status column to user table for company approval tracking
ALTER TABLE user
ADD COLUMN status VARCHAR(50) DEFAULT 'pending' AFTER is_verified;
