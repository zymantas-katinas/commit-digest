-- Migration: Add include_diffs column to report_configurations
-- Description: Add column to enable/disable including code diffs in reports

-- Add include_diffs setting (boolean: true = include diffs, false = don't include)
-- Using DO block to check if column exists before adding (makes migration idempotent)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'report_configurations' 
        AND column_name = 'include_diffs'
    ) THEN
        ALTER TABLE report_configurations 
        ADD COLUMN include_diffs BOOLEAN DEFAULT FALSE;
        
        COMMENT ON COLUMN report_configurations.include_diffs IS 'Whether to include code diffs in the report (true = include diffs, false = don''t include)';
    END IF;
END $$;


