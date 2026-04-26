-- Add confirmation fields to interviews table
ALTER TABLE interviews 
ADD COLUMN confirmed_at DATETIME NULL,
ADD COLUMN confirmed_by INT NULL;

-- Add index for faster queries
CREATE INDEX idx_interviews_confirmed ON interviews(confirmed_at);