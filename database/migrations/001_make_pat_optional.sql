-- Migration: Make Personal Access Token optional for public repositories
-- Run this in your Supabase SQL Editor if you have an existing database

-- Make encrypted_access_token nullable to support public repositories without PAT
ALTER TABLE repositories ALTER COLUMN encrypted_access_token DROP NOT NULL; 