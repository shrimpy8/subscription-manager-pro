-- Fix logo mapping: Move data from logo column to logo_url column
-- Created: 2025-01-07
-- Description: Fix the incorrect mapping where logo data was stored in logo column instead of logo_url column

-- Update logo_url column with data from logo column where logo_url is empty
UPDATE subscriptions 
SET logo_url = logo 
WHERE logo_url IS NULL OR logo_url = '' 
AND (logo IS NOT NULL AND logo != '');

-- Optional: Clear the logo column after migration (uncomment if you want to clean up)
-- UPDATE subscriptions SET logo = NULL WHERE logo_url IS NOT NULL AND logo_url != '';

-- Add a comment to document the fix
COMMENT ON COLUMN subscriptions.logo IS 'Basic logo field - use logo_url for new data';
COMMENT ON COLUMN subscriptions.logo_url IS 'Primary logo URL field - use this for new subscriptions';
