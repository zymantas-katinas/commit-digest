-- Migration: Add provider field to repositories table
-- This migration adds support for both GitHub and GitLab repositories

-- Add provider column with default 'github' for existing records
ALTER TABLE repositories 
ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'github';

-- Add constraint to ensure provider is either 'github' or 'gitlab'
ALTER TABLE repositories 
ADD CONSTRAINT check_provider CHECK (provider IN ('github', 'gitlab'));

-- Create index for provider column
CREATE INDEX IF NOT EXISTS idx_repositories_provider ON repositories(provider);

-- Update existing records to have 'github' provider (already set by default, but explicit update)
UPDATE repositories SET provider = 'github' WHERE provider IS NULL;

