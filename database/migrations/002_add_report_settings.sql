-- Migration: Add report configuration settings
-- Description: Add columns for report style, tone, author display, link commits, and no updates behavior

-- Add report style column (Summary, Standard, Changelog)
ALTER TABLE report_configurations 
ADD COLUMN report_style TEXT DEFAULT 'Standard' 
CHECK (report_style IN ('Summary', 'Standard', 'Changelog'));

-- Add tone of voice column (Professional, Informative, Friendly & Casual)
ALTER TABLE report_configurations 
ADD COLUMN tone_of_voice TEXT DEFAULT 'Informative' 
CHECK (tone_of_voice IN ('Professional', 'Informative', 'Friendly & Casual'));

-- Add author display setting (boolean: true = show author names, false = hide author names)
ALTER TABLE report_configurations 
ADD COLUMN author_display BOOLEAN DEFAULT FALSE;

-- Add link to commits setting (boolean)
ALTER TABLE report_configurations 
ADD COLUMN link_to_commits BOOLEAN DEFAULT FALSE;

-- Add if no updates behavior (boolean: true = send "No Updates" message, false = send nothing)
ALTER TABLE report_configurations 
ADD COLUMN if_no_updates BOOLEAN DEFAULT TRUE;

-- Add comments for documentation
COMMENT ON COLUMN report_configurations.report_style IS 'Report format style: Summary, Standard, or Changelog';
COMMENT ON COLUMN report_configurations.tone_of_voice IS 'Tone of voice for the report: Professional, Informative, or Friendly & Casual';
COMMENT ON COLUMN report_configurations.author_display IS 'Whether to show author names in the report (true = show, false = hide)';
COMMENT ON COLUMN report_configurations.link_to_commits IS 'Whether to include links to commits in the report';
COMMENT ON COLUMN report_configurations.if_no_updates IS 'Behavior when there are no updates to report (true = send message, false = send nothing)'; 